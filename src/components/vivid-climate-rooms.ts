import { LitElement, css, html, nothing, svg, type PropertyValues } from 'lit';
import { DEFAULT_COMFORT, type ClimateKind, type ComfortRange } from '../core/climate';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import { localize } from '../i18n';
import { loadClimateSeries, type ClimateSeries } from './climate-chart-data';
import {
  formatClimate,
  formatClock,
  formatDay,
  formatWhen,
  KIND_LABELS,
  RANGE_LABELS,
} from './climate-chart-format';
import {
  DEFAULT_UNIT,
  HOUR,
  MIN_SPAN,
  RANGE_SPECS,
  comfortInUnit,
  convertUnit,
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
  sortByComfort,
  timeAtX,
  toScale,
  valueColor,
  valueGradient,
  windowSamples,
  yDomain,
  type ClimateSample,
} from './climate-chart-model';
import { climateChartStyles } from './climate-chart-styles';
import { CLIMATE_RANGES, axisTicks, textWidth, type ClimateRange } from './vivid-climate-chart';
import { buttonReset, tokens } from './shared-styles';

const REFRESH_MS = 5 * 60 * 1000;
const ROW = 70;
/** Curve area inside a row. */
const CURVE_TOP = 18;
const CURVE_BOTTOM = 52;
const HEAD = 22;
const AXIS = 24;

let instances = 0;

/** One room (or sensor) of a multi-room climate chart. */
export interface ClimateRoomSource {
  entityId: string;
  /** Shown before the curve; the friendly name when unset. */
  name?: string;
}

interface Row {
  source: ClimateRoomSource;
  name: string;
  /** Current value in the display unit. */
  current?: number;
  unavailable: boolean;
  samples: ClimateSample[];
}

/**
 * Several climate sensors over the same time span: one small curve per room,
 * all on the same scale and time axis, with the comfort band, dated min and
 * max, the current value and a shared hover cursor.
 *
 * Tapping a room fires `vivid-climate-room-select` with `{ entityId }`.
 */
export class VividClimateRooms extends LitElement {
  static override properties = {
    hass: { attribute: false },
    sources: { attribute: false },
    kind: { attribute: false },
    comfort: { attribute: false },
    range: { attribute: false },
    _range: { state: true },
    _series: { state: true },
    _failed: { state: true },
    _hover: { state: true },
    _width: { state: true },
  };

  declare hass?: HomeAssistant;
  declare sources: ClimateRoomSource[];
  declare kind: ClimateKind;
  /** Comfort range in the scale units; the default of the kind when unset. */
  declare comfort?: ComfortRange;
  /** The range shown first; the tabs change it afterwards. */
  declare range: ClimateRange;
  declare _range: ClimateRange;
  declare _series?: ClimateSeries;
  declare _failed: boolean;
  declare _hover?: number;
  declare _width: number;

  private readonly idPrefix = `vivid-climate-rooms-${++instances}`;
  private timer?: number;
  private loadedKey = '';
  private resizer?: ResizeObserver;

  constructor() {
    super();
    this.sources = [];
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
      .top {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 12px;
      }
      .sub {
        flex: 1 1 140px;
        min-width: 0;
        font-size: 12.5px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .room {
        cursor: pointer;
        outline: none;
      }
      .room .hit {
        fill: transparent;
      }
      .room:hover .hit,
      .room:focus-visible .hit {
        fill: rgba(var(--vivid-rgb-text), 0.04);
      }
      .room:focus-visible .hit {
        stroke: var(--vivid-focus);
        stroke-width: 1.5;
      }
      .halo {
        paint-order: stroke;
        stroke: var(--vivid-climate-surface);
        stroke-width: 3px;
        stroke-linejoin: round;
      }
      .tooltip .row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 2px 8px;
      }
      .tooltip .row b {
        text-align: right;
      }
      .swatch {
        width: 8px;
        height: 8px;
        border-radius: 50%;
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
    if (changed.has('sources') || changed.has('hass') || changed.has('_range')) {
      void this.load(false);
    }
  }

  private ids(): string[] {
    return this.sources.map((source) => source.entityId);
  }

  private async load(force: boolean): Promise<void> {
    const hass = this.hass;
    const ids = this.ids().filter((id) => hass?.states[id]);
    if (!hass?.callWS || ids.length === 0) return;
    const range = this._range;
    const key = `${ids.join(',')}|${RANGE_SPECS[range].statistics ? range : 'day'}`;
    if (!force && key === this.loadedKey) return;
    if (key !== this.loadedKey) this._series = undefined;
    this.loadedKey = key;
    try {
      const series = await loadClimateSeries(hass, ids, range, Date.now());
      if (this.loadedKey !== key) return;
      this._series = series;
      this._failed = false;
    } catch {
      if (this.loadedKey === key) this._failed = true;
    }
  }

  private select(entityId: string): void {
    this.dispatchEvent(
      new CustomEvent('vivid-climate-room-select', {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Rows in the display unit (the first sensor's), sorted by distance to comfort. */
  private rows(unit: string, start: number, now: number): Row[] {
    const hass = this.hass;
    const kind = this.kind;
    const rows = this.sources.map((source): Row => {
      const entity = hass?.states[source.entityId];
      const own = entity?.attributes.unit_of_measurement ?? unit;
      const convert = (value: number) => convertUnit(kind, value, own, unit);
      const live = Number.parseFloat(entity?.state ?? '');
      const unavailable = !entity || entity.state === 'unavailable' || entity.state === 'unknown';
      const current = unavailable || !Number.isFinite(live) ? undefined : convert(live);
      const raw = this._series?.[source.entityId] ?? [];
      const samples = windowSamples(raw, start, now, { t: now, v: current }).map((sample) => ({
        t: sample.t,
        v: sample.v === undefined ? undefined : convert(sample.v),
        min: sample.min === undefined ? undefined : convert(sample.min),
        max: sample.max === undefined ? undefined : convert(sample.max),
      }));
      return {
        source,
        name: source.name ?? entity?.attributes.friendly_name ?? source.entityId,
        current,
        unavailable,
        samples,
      };
    });
    return sortByComfort(
      rows,
      (row) => (row.current === undefined ? undefined : toScale(kind, row.current, unit)),
      this.comfort ?? DEFAULT_COMFORT[kind],
    );
  }

  private renderRanges() {
    const hass = this.hass;
    return html`<span class="ranges" role="group" aria-label=${localize(hass, 'period')}>
      ${CLIMATE_RANGES.map(
        (range) =>
          html`<button
            type="button"
            class="reset"
            aria-pressed=${String(range === this._range)}
            @click=${() => {
              this._range = range;
              this._hover = undefined;
            }}
          >
            ${localize(hass, RANGE_LABELS[range])}
          </button>`,
      )}
    </span>`;
  }

  protected override render() {
    const hass = this.hass;
    if (!hass || this.sources.length === 0) return nothing;
    const kind = this.kind;
    const unit =
      this.sources
        .map((source) => hass.states[source.entityId]?.attributes.unit_of_measurement)
        .find((value) => value !== undefined) ?? DEFAULT_UNIT[kind];
    const comfort = comfortInUnit(kind, this.comfort ?? DEFAULT_COMFORT[kind], unit);
    const top = html`<div class="top">
      <span class="sub">${localize(hass, 'cc_rooms', { count: this.sources.length })}</span>
      ${this.renderRanges()}
    </div>`;
    const height = HEAD + this.sources.length * ROW + AXIS;
    if (!this._series) {
      return html`<div class="panel">
        ${top}
        ${
          this._failed
            ? html`<div class="message" style=${`height: ${height}px`}>
                ${localize(hass, 'cc_no_history')}
              </div>`
            : html`<div class="loading" style=${`height: ${height}px`}></div>`
        }
      </div>`;
    }
    const now = Date.now();
    const start = now - RANGE_SPECS[this._range].hours * HOUR;
    const rows = this.rows(unit, start, now);
    return html`<div class="panel">
      ${top} ${this.renderChart(rows, kind, unit, comfort, start, now)}
    </div>`;
  }

  private renderChart(
    rows: Row[],
    kind: ClimateKind,
    unit: string,
    comfort: ComfortRange,
    start: number,
    now: number,
  ) {
    const hass = this.hass;
    const range = this._range;
    const width = Math.max(this._width - 28, 240);
    const nameWidth = Math.round(Math.min(Math.max(width * 0.22, 84), 130));
    const left = nameWidth + 10;
    const right = width - 10;
    const height = HEAD + rows.length * ROW + AXIS;
    const minSpan = fromScale(kind, MIN_SPAN[kind], unit) - fromScale(kind, 0, unit);
    // One y domain for every room, so the rows compare.
    const domain = yDomain(
      rows.flatMap((row) => knownValues(row.samples)),
      comfort,
      minSpan,
      2,
    );
    const x = linearScale(start, now, left, right);
    const fmt = (value: number) => formatClimate(hass, kind, value, unit, true);
    const nights = showsMidnights(range);
    const days = nights === 'none' ? [] : midnights(start, now);
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
    const bottom = HEAD + rows.length * ROW;
    const hover = this._hover;

    const rowMarks = rows.map((row, index) => {
      const rowTop = HEAD + index * ROW;
      const y = linearScale(domain.lo, domain.hi, rowTop + CURVE_BOTTOM, rowTop + CURVE_TOP);
      const gradient = valueGradient(kind, unit, y);
      const id = `${this.idPrefix}-${index}`;
      const drawn = decimate(row.samples, Math.round((right - left) / 2));
      const runs = knownRuns(drawn);
      const { min, max } = extremes(row.samples);
      const bandTop = y(comfort.high);
      const bandBottom = y(comfort.low);
      const label = (px: number, py: number, text: string) => {
        const w = textWidth(text, 10.5);
        const cx = Math.min(Math.max(px, left + w / 2), right - w / 2);
        return svg`<text class="t-secondary halo" x=${cx} y=${py} font-size="10.5" text-anchor="middle">${text}</text>`;
      };
      const last = row.samples[row.samples.length - 1];
      const hoverValue = hover === undefined ? undefined : sampleAt(drawn, hover);
      const status =
        row.current === undefined
          ? localize(hass, row.unavailable ? 'unavailable' : 'no_data')
          : fmt(row.current);
      return svg`<g
        class="room"
        role="button"
        tabindex="0"
        aria-label=${localize(hass, 'cc_show_room', { name: row.name })}
        @click=${() => this.select(row.source.entityId)}
        @keydown=${(event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.select(row.source.entityId);
          }
        }}
      >
        <rect class="hit" x="0" y=${rowTop + 2} width=${width} height=${ROW - 4} rx="10"></rect>
        <defs>
          <linearGradient id=${id} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1=${gradient.y1} y2=${gradient.y2}>
            ${gradient.stops.map((stop) => svg`<stop offset=${stop.offset} stop-color=${stop.color}></stop>`)}
          </linearGradient>
        </defs>
        <rect class="band" x=${left} y=${bandTop} width=${right - left} height=${Math.max(bandBottom - bandTop, 0)}></rect>
        <line class="grid" x1=${left} x2=${right} y1=${rowTop + CURVE_BOTTOM} y2=${rowTop + CURVE_BOTTOM}></line>
        <text class="t-primary" x="4" y=${rowTop + 30} font-size="13">${clip(row.name, nameWidth - 4, 13)}</text>
        <text class=${row.current === undefined ? 't-secondary' : 't-primary t-strong'} x="4" y=${rowTop + 50} font-size=${row.current === undefined ? 12 : 17}>${status}</text>
        <g class="curve">
          ${runs.map((run) => svg`<path class="under" d=${linePath(run, x, y)}></path>`)}
          ${runs.map((run) => svg`<path class="line" stroke=${`url(#${id})`} d=${linePath(run, x, y)}></path>`)}
          ${
            runs.length === 0
              ? svg`<text class="t-secondary" x=${(left + right) / 2} y=${rowTop + 40} font-size="11" text-anchor="middle">${localize(hass, 'cc_no_history')}</text>`
              : nothing
          }
          ${
            max
              ? svg`<circle class="dot" cx=${x(max.t)} cy=${y(max.v)} r="3.5" fill=${valueColor(kind, max.v, unit)}></circle>
                ${label(x(max.t), y(max.v) - 7, `${fmt(max.v)} · ${formatWhen(hass, max.t, range, true)}`)}`
              : nothing
          }
          ${
            min && max && min.v !== max.v
              ? svg`<circle class="dot" cx=${x(min.t)} cy=${y(min.v)} r="3.5" fill=${valueColor(kind, min.v, unit)}></circle>
                ${label(x(min.t), y(min.v) + 15, `${fmt(min.v)} · ${formatWhen(hass, min.t, range, true)}`)}`
              : nothing
          }
          ${
            last?.v !== undefined
              ? svg`<circle class="dot" cx=${x(last.t)} cy=${y(last.v)} r="4.5" fill=${valueColor(kind, last.v, unit)}></circle>`
              : nothing
          }
        </g>
        ${
          hoverValue !== undefined && hover !== undefined
            ? svg`<circle class="dot" cx=${x(hover)} cy=${y(hoverValue)} r="4" fill=${valueColor(kind, hoverValue, unit)}></circle>`
            : nothing
        }
      </g>`;
    });

    return html`<div
      class="plot"
      @pointermove=${(event: PointerEvent) => this.onPointer(event, left, right, start, now)}
      @pointerdown=${(event: PointerEvent) => this.onPointer(event, left, right, start, now)}
      @pointerleave=${() => (this._hover = undefined)}
    >
      <svg
        width=${width}
        height=${height}
        viewBox=${`0 0 ${width} ${height}`}
        aria-label=${localize(hass, 'cc_rooms_label', {
          kind: localize(hass, KIND_LABELS[kind]),
          range: localize(hass, RANGE_LABELS[range]),
        })}
      >
        ${days.map((midnight) => {
          const mx = x(midnight);
          const line = svg`<line class="midnight" x1=${mx} x2=${mx} y1=${HEAD - 8} y2=${bottom}></line>`;
          if (nights !== 'labeled') return line;
          return svg`${line}
            ${mx - left > 56 ? svg`<text class="t-secondary" x=${mx - 5} y=${HEAD - 8} font-size="11" text-anchor="end">${formatDay(hass, midnight - HOUR)}</text>` : nothing}
            ${right - mx > 48 ? svg`<text class="t-primary" x=${mx + 5} y=${HEAD - 8} font-size="11">${formatDay(hass, midnight)}</text>` : nothing}`;
        })}
        ${rowMarks}
        ${ticks.map(
          (tick) =>
            svg`<text class="t-secondary" x=${tick.x} y=${height - 6} font-size="11" text-anchor="middle">${tick.text}</text>`,
        )}
        ${
          showNow
            ? svg`<text class="t-primary" x=${right} y=${height - 6} font-size="11" text-anchor="end">${nowText}</text>`
            : nothing
        }
        ${
          hover !== undefined
            ? svg`<line class="cursor" x1=${x(hover)} x2=${x(hover)} y1=${HEAD - 8} y2=${bottom}></line>`
            : nothing
        }
      </svg>
      ${hover !== undefined ? this.renderTooltip(rows, hover, x(hover), width, kind, unit) : nothing}
    </div>`;
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
    const px = event.clientX - rect.left;
    // Over the names: no cursor, the row is a button.
    this._hover = px < left - 4 ? undefined : timeAtX(px, left, right, start, end);
  }

  private renderTooltip(
    rows: Row[],
    time: number,
    px: number,
    width: number,
    kind: ClimateKind,
    unit: string,
  ) {
    const hass = this.hass;
    const side = px > width * 0.6 ? `right: ${width - px + 10}px` : `left: ${px + 10}px`;
    return html`<div class="tooltip" style=${side}>
      <div class="time">${formatWhen(hass, time, this._range)}</div>
      ${rows.map((row) => {
        const value = sampleAt(row.samples, time);
        return html`<div class="row">
          <span
            class="swatch"
            style=${`background: ${value === undefined ? 'transparent' : valueColor(kind, value, unit)}`}
          ></span>
          <span>${row.name}</span>
          <b>${value === undefined ? '—' : formatClimate(hass, kind, value, unit, true)}</b>
        </div>`;
      })}
    </div>`;
  }
}

/** Shortens a name to fit `width` px. */
function clip(text: string, width: number, size: number): string {
  if (textWidth(text, size) <= width) return text;
  const keep = Math.max(Math.floor(width / (size * 0.56)) - 1, 1);
  return `${text.slice(0, keep)}…`;
}

defineElement('vivid-climate-rooms', VividClimateRooms);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-climate-rooms': VividClimateRooms;
  }
}
