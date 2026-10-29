import { LitElement, css, html, nothing, svg, type PropertyValues, type TemplateResult } from 'lit';
import { DEFAULT_COMFORT, type ClimateKind, type ComfortRange } from '../core/climate';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import { formatDuration, localize, shortDuration } from '../i18n';
import { loadClimateSeries } from './climate-chart-data';
import {
  formatBound,
  formatClimate,
  formatClock,
  formatDay,
  formatDelta,
  formatTick,
  formatTrend,
  formatWhen,
  KIND_ICONS,
  KIND_LABELS,
  RANGE_LABELS,
} from './climate-chart-format';
import {
  DAY,
  DEFAULT_UNIT,
  HOUR,
  MIN_SPAN,
  RANGE_SPECS,
  areaPath,
  comfortInUnit,
  dayBefore,
  decimate,
  extremes,
  fromScale,
  knownRuns,
  knownValues,
  linePath,
  linearScale,
  midnights,
  sampleAt,
  showsMidnights,
  timeAtX,
  timeOutsideComfort,
  timeTicks,
  fitLabels,
  freeBaseline,
  timeWeightedMean,
  trendPerHour,
  valueColor,
  valueGradient,
  windowSamples,
  yDomain,
  type ClimateSample,
  type Point,
} from './climate-chart-model';
import { climateChartStyles } from './climate-chart-styles';
import { buttonReset, tokens } from './shared-styles';

/** Time spans the climate charts offer. */
export type ClimateRange = '6h' | '24h' | '7d' | '30d';
export const CLIMATE_RANGES: ClimateRange[] = ['6h', '24h', '7d', '30d'];

const REFRESH_MS = 5 * 60 * 1000;
const HEIGHT = 220;
const PAD = { left: 40, right: 12, top: 30, bottom: 24 };

let instances = 0;

/** Rough width of a label, to keep it inside the chart. */
export function textWidth(text: string, size: number): number {
  return text.length * size * 0.56;
}

function isUnavailable(state: string | undefined): boolean {
  return state === undefined || state === 'unavailable' || state === 'unknown';
}

/**
 * History of one climate sensor: a curve colored by its value, the comfort
 * band, dated min and max, the current value and a summary row.
 *
 * Interface shared by the climate badges (which mount it in their details)
 * and the chart implementation.
 */
export class VividClimateChart extends LitElement {
  static override properties = {
    hass: { attribute: false },
    entityId: { attribute: false },
    kind: { attribute: false },
    comfort: { attribute: false },
    range: { attribute: false },
    _range: { state: true },
    _samples: { state: true },
    _failed: { state: true },
    _hover: { state: true },
    _width: { state: true },
  };

  declare hass?: HomeAssistant;
  /** The sensor (or numeric sensor group) to chart. */
  declare entityId?: string;
  declare kind: ClimateKind;
  /** Comfort range in the scale units (°C, %, hPa, ppm); the default of the kind when unset. */
  declare comfort?: ComfortRange;
  /** The range shown first; the tabs change it afterwards. */
  declare range: ClimateRange;
  declare _range: ClimateRange;
  /** Loaded samples of the entity for the current range. */
  declare _samples?: ClimateSample[];
  declare _failed: boolean;
  /** Time under the cursor. */
  declare _hover?: number;
  declare _width: number;

  private readonly gradientId = `vivid-climate-${++instances}`;
  private timer?: number;
  private loadedKey = '';
  private resizer?: ResizeObserver;

  constructor() {
    super();
    this.kind = 'temperature';
    this.range = '24h';
    this._range = '24h';
    this._failed = false;
    this._width = 360;
  }

  static override styles = [
    tokens,
    buttonReset,
    climateChartStyles,
    css`
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .disc {
        display: grid;
        place-items: center;
        flex: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--disc, rgba(var(--vivid-rgb-text), 0.08));
        color: var(--disc-ink, var(--secondary-text-color));
      }
      .disc ha-icon {
        --mdc-icon-size: 22px;
        display: inline-flex;
      }
      .heading {
        flex: 1;
        min-width: 0;
      }
      .sub {
        font-size: 12.5px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .now {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 2px 10px;
      }
      .now .value {
        font-size: 28px;
        font-weight: 700;
        line-height: 1.15;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .now .value.off {
        font-size: 20px;
        color: var(--secondary-text-color);
      }
      .trend {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 12.5px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .trend ha-icon {
        --mdc-icon-size: 15px;
        display: inline-flex;
      }
      .top {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 12px;
      }
      .top .head {
        flex: 1 1 200px;
        min-width: 0;
      }
      .halo {
        paint-order: stroke;
        stroke: var(--vivid-climate-surface);
        stroke-width: 3px;
        stroke-linejoin: round;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        gap: 6px;
      }
      .stat {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        padding: 7px 10px;
        border-radius: 12px;
        background: var(--vivid-layer-2);
      }
      .stat .label,
      .stat .extra {
        font-size: 11px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .stat .value {
        font-size: 15px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    this.timer = window.setInterval(() => void this.load(true), REFRESH_MS);
    this.resizer = new ResizeObserver((entries) => {
      const width = Math.round(entries[0]?.contentRect.width ?? 0);
      if (width > 0 && width !== this._width) this._width = width;
    });
    this.resizer.observe(this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this.timer);
    this.resizer?.disconnect();
    this.loadedKey = '';
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('range')) {
      this._range = this.range;
      this._hover = undefined;
    }
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('entityId') || changed.has('hass') || changed.has('_range')) {
      void this.load(false);
    }
  }

  private async load(force: boolean): Promise<void> {
    const hass = this.hass;
    const entityId = this.entityId;
    if (!hass?.callWS || !entityId || !hass.states[entityId]) return;
    const range = this._range;
    // 6 h and 24 h share the same data (the last 25 hours of history).
    const key = `${entityId}|${RANGE_SPECS[range].statistics ? range : 'day'}`;
    if (!force && key === this.loadedKey) return;
    if (key !== this.loadedKey) this._samples = undefined;
    this.loadedKey = key;
    try {
      const series = await loadClimateSeries(hass, [entityId], range, Date.now());
      if (this.loadedKey !== key) return;
      this._samples = series[entityId] ?? [];
      this._failed = false;
    } catch {
      if (this.loadedKey === key) this._failed = true;
    }
  }

  private selectRange(range: ClimateRange): void {
    this._range = range;
    this._hover = undefined;
  }

  /* --------------------------------- render --------------------------------- */

  private renderRanges() {
    const hass = this.hass;
    return html`<span class="ranges" role="group" aria-label=${localize(hass, 'period')}>
      ${CLIMATE_RANGES.map(
        (range) =>
          html`<button
            type="button"
            class="reset"
            aria-pressed=${String(range === this._range)}
            @click=${() => this.selectRange(range)}
          >
            ${localize(hass, RANGE_LABELS[range])}
          </button>`,
      )}
    </span>`;
  }

  protected override render() {
    const hass = this.hass;
    const entityId = this.entityId;
    const entity = entityId ? hass?.states[entityId] : undefined;
    if (!hass || !entity) {
      return html`<div class="panel">
        <div class="message" style="height: 80px">${localize(hass, 'cc_not_found')}</div>
      </div>`;
    }
    const kind = this.kind;
    const unit = entity.attributes.unit_of_measurement ?? DEFAULT_UNIT[kind];
    const comfort = comfortInUnit(kind, this.comfort ?? DEFAULT_COMFORT[kind], unit);
    const live = Number.parseFloat(entity.state);
    const current = isUnavailable(entity.state) || !Number.isFinite(live) ? undefined : live;
    const now = Date.now();
    const spec = RANGE_SPECS[this._range];
    const start = now - spec.hours * HOUR;
    const loaded = this._samples;
    const full = loaded
      ? windowSamples(loaded, Math.min(loaded[0]?.t ?? now, start), now, { t: now, v: current })
      : [];
    const visible = windowSamples(full, start, now);
    const name = entity.attributes.friendly_name ?? entityId ?? '';
    const head = this.renderHead(name, kind, unit, current, full, now);

    let body: TemplateResult;
    if (this._failed && !loaded) {
      body = html`<div class="message" style=${`height: ${HEIGHT}px`}>
        ${localize(hass, 'cc_no_history')}
      </div>`;
    } else if (!loaded) {
      body = html`<div class="loading" style=${`height: ${HEIGHT}px`}></div>`;
    } else if (!loaded.some((sample) => sample.v !== undefined && sample.t >= start - DAY)) {
      body = html`<div class="message" style=${`height: ${HEIGHT}px`}>
        ${localize(hass, 'cc_no_history')}
      </div>`;
    } else {
      body = html`${this.renderChart(visible, kind, unit, comfort, start, now, name)}
      ${this.renderStats(visible, full, kind, unit, comfort, now)}`;
    }
    return html`<div class="panel">
      <div class="top">${head} ${this.renderRanges()}</div>
      ${body}
    </div>`;
  }

  private renderHead(
    name: string,
    kind: ClimateKind,
    unit: string,
    current: number | undefined,
    full: ClimateSample[],
    now: number,
  ) {
    const hass = this.hass;
    const trend = current === undefined ? undefined : trendPerHour(full, now);
    const disc =
      current === undefined
        ? ''
        : `--disc: ${valueColor(kind, current, unit)}; --disc-ink: rgba(0, 0, 0, 0.72)`;
    const step = kind === 'temperature' ? 0.05 : kind === 'humidity' ? 0.5 : 0.1;
    const icon =
      trend === undefined || Math.abs(trend) < step
        ? 'mdi:arrow-right'
        : trend > 0
          ? 'mdi:arrow-top-right'
          : 'mdi:arrow-bottom-right';
    return html`<div class="head">
      <span class="disc" style=${disc}><ha-icon .icon=${KIND_ICONS[kind]}></ha-icon></span>
      <div class="heading">
        <div class="sub">${name} · ${localize(hass, KIND_LABELS[kind])}</div>
        <div class="now">
          ${
            current === undefined
              ? html`<span class="value off">${localize(hass, 'unavailable')}</span>`
              : html`<span class="value">${formatClimate(hass, kind, current, unit)}</span>`
          }
          ${
            trend === undefined
              ? nothing
              : html`<span class="trend"
                  ><ha-icon .icon=${icon}></ha-icon>${formatTrend(hass, kind, trend, unit)}</span
                >`
          }
        </div>
      </div>
    </div>`;
  }

  private renderChart(
    visible: ClimateSample[],
    kind: ClimateKind,
    unit: string,
    comfort: ComfortRange,
    start: number,
    now: number,
    name: string,
  ) {
    const hass = this.hass;
    const range = this._range;
    const width = Math.max(this._width - 28, 200);
    const fmt = (value: number) => formatClimate(hass, kind, value, unit, true);
    const minSpan = fromScale(kind, MIN_SPAN[kind], unit) - fromScale(kind, 0, unit);
    const domain = yDomain(knownValues(visible), comfort, minSpan);
    // Room for the longest y label.
    const left = Math.max(
      PAD.left,
      ...domain.ticks.map((tick) => textWidth(formatBound(hass, kind, tick, unit, true), 11) + 12),
    );
    const right = width - PAD.right;
    const top = PAD.top;
    const bottom = HEIGHT - PAD.bottom;
    const x = linearScale(start, now, left, right);
    const y = linearScale(domain.lo, domain.hi, bottom, top);
    const gradient = valueGradient(kind, unit, y);
    const drawn = decimate(visible, Math.round((right - left) / 2));
    const runs = knownRuns(drawn);
    const { min, max } = extremes(visible);
    const last = visible[visible.length - 1];

    // Comfort band and its label.
    const bandTop = Math.max(y(comfort.high), top);
    const bandBottom = Math.min(y(comfort.low), bottom);
    const comfortText = localize(hass, 'cc_comfort', {
      range: `${formatBound(hass, kind, comfort.low, unit).replace(/[^\d]+$/, '')}–${formatBound(hass, kind, comfort.high, unit)}`,
    });
    // Inside the band, at its top or its bottom, wherever the curve leaves room.
    const comfortWidth = textWidth(comfortText, 11) + 12;
    const under = Array.from({ length: 12 }, (_, index) => {
      const value = sampleAt(
        visible,
        start + ((now - start) * comfortWidth * index) / 11 / (right - left),
      );
      return value === undefined ? -1e6 : y(value);
    });
    // The min and max labels are obstacles too.
    for (const [point, below] of [
      [min, true],
      [max, false],
    ] as const) {
      if (!point || x(point.t) - 90 > left + comfortWidth) continue;
      const baseline = below ? y(point.v) + 18 : y(point.v) - 10;
      under.push(baseline, baseline - 10, y(point.v));
    }
    const bandLabelY =
      bandBottom - bandTop > 34
        ? freeBaseline([bandTop + 14, bandBottom - 5, bandTop - 4], under, 11)
        : bandTop - 4;

    // Midnights.
    const nights = showsMidnights(range);
    const days = nights === 'none' ? [] : midnights(start, now);

    // Dots and their labels.
    const marks: TemplateResult[] = [];
    const nowPoint = last?.v !== undefined ? { t: last.t, v: last.v } : undefined;
    const near = (a: Point, b: Point) =>
      Math.abs(x(a.t) - x(b.t)) < 70 && Math.abs(y(a.v) - y(b.v)) < 26;
    const label = (point: Point, text: string, below: boolean) => {
      const px = x(point.t);
      const py = y(point.v);
      const size = 11.5;
      const w = textWidth(text, size);
      // Close to the end, the label goes to the left of the dot.
      if (px + w / 2 > right) {
        return svg`<text class="t-primary halo" x=${px - 9} y=${py + 4} font-size=${size} text-anchor="end">${text}</text>`;
      }
      const cx = Math.max(px, left + w / 2);
      const ty = below ? Math.min(py + 18, bottom + 6) : Math.max(py - 10, 12);
      return svg`<text class="t-primary halo" x=${cx} y=${ty} font-size=${size} text-anchor="middle">${text}</text>`;
    };
    for (const [point, key, below] of [
      [min, 'cc_min_label', true],
      [max, 'cc_max_label', false],
    ] as const) {
      if (!point) continue;
      if (min && max && key === 'cc_min_label' && Math.abs(max.v - min.v) < 1e-9) continue;
      const text = `${localize(hass, key, { value: fmt(point.v) })} · ${formatWhen(hass, point.t, range)}`;
      marks.push(
        svg`<circle class="dot" cx=${x(point.t)} cy=${y(point.v)} r="5" fill=${valueColor(kind, point.v, unit)}></circle>`,
        label(point, text, below),
      );
    }
    if (nowPoint) {
      marks.push(
        svg`<circle class="dot" cx=${x(nowPoint.t)} cy=${y(nowPoint.v)} r="5.5" fill=${valueColor(kind, nowPoint.v, unit)}></circle>`,
      );
      const crowded = (min && near(min, nowPoint)) || (max && near(max, nowPoint));
      if (!crowded) {
        const above = y(nowPoint.v) - 12 > top - 6;
        marks.push(
          svg`<text class="t-primary t-strong halo" x=${x(nowPoint.t) - 9} y=${above ? y(nowPoint.v) - 11 : y(nowPoint.v) + 20} font-size="11.5" text-anchor="end">${fmt(nowPoint.v)}</text>`,
        );
      }
    }

    // Hover.
    const hover = this._hover;
    const hoverValue = hover === undefined ? undefined : sampleAt(drawn, hover);
    const showNow = range === '6h' || range === '24h';
    const nowText = formatClock(hass, now);
    const ticks = axisTicks(
      hass,
      start,
      now,
      range,
      x,
      left,
      showNow ? right - textWidth(nowText, 11) : right,
    );

    const chart = html`<div
      class="plot"
      @pointermove=${(event: PointerEvent) => this.onPointer(event, left, right, start, now)}
      @pointerdown=${(event: PointerEvent) => this.onPointer(event, left, right, start, now)}
      @pointerleave=${() => (this._hover = undefined)}
    >
      <svg
        width=${width}
        height=${HEIGHT}
        viewBox=${`0 0 ${width} ${HEIGHT}`}
        role="img"
        aria-label=${localize(hass, 'cc_history_of', {
          kind: localize(hass, KIND_LABELS[kind]),
          name,
          range: localize(hass, RANGE_LABELS[range]),
        })}
      >
        <defs>
          <linearGradient
            id=${this.gradientId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="0"
            y1=${gradient.y1}
            y2=${gradient.y2}
          >
            ${gradient.stops.map(
              (stop) => svg`<stop offset=${stop.offset} stop-color=${stop.color}></stop>`,
            )}
          </linearGradient>
        </defs>
        ${
          bandBottom > bandTop
            ? svg`<rect class="band" x=${left} y=${bandTop} width=${right - left} height=${bandBottom - bandTop}></rect>
`
            : nothing
        }
        ${domain.ticks.map(
          (tick) =>
            svg`<line class=${tick === domain.lo ? 'baseline' : 'grid'} x1=${left} x2=${right} y1=${y(tick)} y2=${y(tick)}></line>
            <text class="t-secondary" x=${left - 7} y=${y(tick) + 4} font-size="11" text-anchor="end">${formatBound(hass, kind, tick, unit, true)}</text>`,
        )}
        ${days.map((midnight) => {
          const mx = x(midnight);
          const line = svg`<line class="midnight" x1=${mx} x2=${mx} y1=${top - 14} y2=${bottom}></line>`;
          if (nights !== 'labeled') return line;
          return svg`${line}
            ${mx - left > 60 ? svg`<text class="t-secondary" x=${mx - 5} y=${top - 6} font-size="11" text-anchor="end">${formatDay(hass, midnight - HOUR)}</text>` : nothing}
            ${right - mx > 50 ? svg`<text class="t-primary" x=${mx + 5} y=${top - 6} font-size="11">${formatDay(hass, midnight)}</text>` : nothing}`;
        })}
        <g class="curve">
          ${runs.map(
            (run) =>
              svg`<path class="area" fill=${`url(#${this.gradientId})`} d=${areaPath(run, x, y, bottom)}></path>`,
          )}
          ${runs.map((run) => svg`<path class="under" d=${linePath(run, x, y)}></path>`)}
          ${runs.map(
            (run) =>
              svg`<path class="line" stroke=${`url(#${this.gradientId})`} d=${linePath(run, x, y)}></path>`,
          )}
          ${marks}
        </g>
        ${
          bandBottom > bandTop
            ? svg`<text class="t-secondary halo" x=${left + 6} y=${bandLabelY} font-size="11">${comfortText}</text>`
            : nothing
        }
        ${ticks.map(
          (tick) =>
            svg`<text class="t-secondary" x=${tick.x} y=${HEIGHT - 6} font-size="11" text-anchor="middle">${tick.text}</text>`,
        )}
        ${
          showNow
            ? svg`<text class="t-primary" x=${right} y=${HEIGHT - 6} font-size="11" text-anchor="end">${nowText}</text>`
            : nothing
        }
        ${
          hover !== undefined
            ? svg`<line class="cursor" x1=${x(hover)} x2=${x(hover)} y1=${top - 14} y2=${bottom}></line>
              ${
                hoverValue !== undefined
                  ? svg`<circle class="dot" cx=${x(hover)} cy=${y(hoverValue)} r="4.5" fill=${valueColor(kind, hoverValue, unit)}></circle>`
                  : nothing
              }`
            : nothing
        }
      </svg>
      ${hover !== undefined ? this.renderTooltip(hover, hoverValue, x(hover), width, kind, unit) : nothing}
    </div>`;
    return chart;
  }

  private onPointer(
    event: PointerEvent,
    left: number,
    right: number,
    start: number,
    end: number,
  ): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (rect.width === 0) return;
    this._hover = timeAtX(event.clientX - rect.left, left, right, start, end);
  }

  private renderTooltip(
    time: number,
    value: number | undefined,
    px: number,
    width: number,
    kind: ClimateKind,
    unit: string,
  ) {
    const hass = this.hass;
    const side = px > width * 0.55 ? `right: ${width - px + 10}px` : `left: ${px + 10}px`;
    return html`<div class="tooltip" style=${side}>
      <div class="time">${formatWhen(hass, time, this._range)}</div>
      <div class="value">${value === undefined ? '—' : formatClimate(hass, kind, value, unit)}</div>
    </div>`;
  }

  private renderStats(
    visible: ClimateSample[],
    full: ClimateSample[],
    kind: ClimateKind,
    unit: string,
    comfort: ComfortRange,
    now: number,
  ) {
    const hass = this.hass;
    const range = this._range;
    const { min, max } = extremes(visible);
    const mean = timeWeightedMean(visible, now);
    const outside = timeOutsideComfort(visible, comfort, now);
    const yesterday = dayBefore(full, now);
    const fmt = (value: number) => formatClimate(hass, kind, value, unit, true);
    const below = localize(hass, 'cc_below', { value: formatBound(hass, kind, comfort.low, unit) });
    const above = localize(hass, 'cc_above', {
      value: formatBound(hass, kind, comfort.high, unit),
    });
    const outsideExtra =
      outside.below && outside.above
        ? localize(hass, 'cc_both_sides', {
            below: shortDuration(hass, outside.below / 1000),
            above: shortDuration(hass, outside.above / 1000),
          })
        : outside.below
          ? below
          : outside.above
            ? above
            : localize(hass, 'cc_always_comfortable');
    const stat = (label: string, value: string, extra: string) =>
      html`<div class="stat">
        <span class="label">${label}</span>
        <span class="value">${value}</span>
        <span class="extra" title=${extra}>${extra}</span>
      </div>`;
    return html`<div class="stats">
      ${stat(
        localize(hass, 'cc_min'),
        min ? fmt(min.v) : '—',
        min ? formatWhen(hass, min.t, range) : ' ',
      )}
      ${stat(
        localize(hass, 'cc_max'),
        max ? fmt(max.v) : '—',
        max ? formatWhen(hass, max.t, range) : ' ',
      )}
      ${stat(
        localize(hass, 'cc_mean'),
        mean === undefined ? '—' : fmt(mean),
        localize(hass, 'cc_over', { range: localize(hass, RANGE_LABELS[range]) }),
      )}
      ${stat(
        localize(hass, 'cc_outside'),
        formatDuration(hass, (outside.below + outside.above) / 1000),
        outsideExtra,
      )}
      ${stat(
        localize(hass, 'cc_yesterday_at', { time: formatWhen(hass, now - DAY, '24h', true) }),
        yesterday ? fmt(yesterday.value) : '—',
        yesterday
          ? localize(hass, 'cc_vs_yesterday', {
              diff: formatDelta(hass, kind, yesterday.diff, unit),
            })
          : ' ',
      )}
    </div>`;
  }
}

/** Time axis labels that fit, with their position and text. */
export function axisTicks(
  hass: HomeAssistant | undefined,
  start: number,
  end: number,
  range: ClimateRange,
  x: (time: number) => number,
  left: number,
  right: number,
): { x: number; text: string }[] {
  const ticks = timeTicks(start, end, range).map((tick) => {
    const text = formatTick(hass, tick.t, tick.format);
    return { x: x(tick.t), text, width: textWidth(text, 11) };
  });
  return fitLabels(ticks, left - 20, right - 6).map((index) => ticks[index] as (typeof ticks)[0]);
}

defineElement('vivid-climate-chart', VividClimateChart);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-climate-chart': VividClimateChart;
  }
}
