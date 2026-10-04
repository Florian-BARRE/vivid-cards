import { LitElement, css, html, nothing, svg, type PropertyValues } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import {
  cutBefore,
  energyWh,
  fetchHistory,
  fetchStatistics,
  resample,
  scaleReadings,
  startOfDay,
} from '../core/history';
import type { HistorySeries, Reading } from '../core/history';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import { formatNumber, localize, type StringKey } from '../i18n';
import { buttonReset, tokens } from './shared-styles';

const HOUR = 3_600_000;
const REFRESH_MS = 5 * 60 * 1000;

export type HistoryRange = '6h' | '24h' | '7d';

interface RangeSpec {
  hours: number;
  buckets: number;
  label: StringKey;
  /** Hours between two time labels. */
  tick: number;
}

const RANGES: Record<HistoryRange, RangeSpec> = {
  '6h': { hours: 6, buckets: 72, label: 'range_6h', tick: 1 },
  '24h': { hours: 24, buckets: 96, label: 'range_24h', tick: 6 },
  '7d': { hours: 168, buckets: 84, label: 'range_7d', tick: 24 },
};

/** Colors of the lights in the chart, chosen to stay apart in both themes. */
export const SERIES_COLORS = ['#ffb300', '#ff7043', '#9575cd', '#4dd0e1', '#81c784', '#f06292'];

/** A consumption reading of one light: its entity and the factor that gives watts. */
export interface PowerSeriesSource {
  entityId: string;
  /** Watts per unit of the entity (1 for W, 1000 for kW, V / 1000 for mA). */
  factor: number;
  name: string;
}

export function formatEnergy(hass: HomeAssistant | undefined, wattHours: number): string {
  return wattHours < 1000
    ? `${formatNumber(hass, wattHours, wattHours < 10 ? 1 : 0)} Wh`
    : `${formatNumber(hass, wattHours / 1000, 2)} kWh`;
}

export function formatCost(
  hass: HomeAssistant | undefined,
  amount: number,
  currency: string,
): string {
  try {
    return new Intl.NumberFormat(hass?.locale?.language ?? hass?.language ?? 'en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function formatWattsShort(hass: HomeAssistant | undefined, watts: number): string {
  return `${formatNumber(hass, watts, watts < 10 ? 1 : 0)} W`;
}

function languageOf(hass: HomeAssistant | undefined): string {
  return hass?.locale?.language ?? hass?.language ?? 'en';
}

/** A tidy upper bound for the axis: 1, 2, 2.5 or 5 × 10ⁿ at or above the peak. */
export function niceMax(peak: number): number {
  if (!(peak > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(peak));
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (step * magnitude >= peak) return step * magnitude;
  }
  return 10 * magnitude;
}

interface LightSeries {
  source: PowerSeriesSource;
  color: string;
  buckets: (number | undefined)[];
  energy: number;
  today: number;
}

/**
 * Consumption over 6 hours, 24 hours or 7 days: one stacked area per light,
 * the axis in watts, hour or day labels, and a cursor that reads every light
 * at a given time. Shows the energy of today and of the period, its cost and
 * the peak. 6 h and 24 h come from the history, 7 days from the long-term
 * statistics (plus the history for the last day). Refreshed every five
 * minutes; the live state closes every series.
 */
export class VividPowerHistory extends LitElement {
  static override properties = {
    hass: { attribute: false },
    sources: { attribute: false },
    price: { type: Number },
    currency: {},
    _range: { state: true },
    _day: { state: true },
    _week: { state: true },
    _failed: { state: true },
    _hover: { state: true },
  };

  declare hass?: HomeAssistant;
  declare sources: PowerSeriesSource[];
  declare price?: number;
  declare currency?: string;
  declare _range: HistoryRange;
  /** Last 24 hours, from the history. */
  declare _day?: HistorySeries;
  /** Last 7 days, from the statistics. */
  declare _week?: HistorySeries;
  declare _failed: boolean;
  /** Bucket under the cursor. */
  declare _hover?: number;

  private timer?: number;
  private dayKey = '';
  private weekKey = '';

  constructor() {
    super();
    this.sources = [];
    this._range = '24h';
    this._failed = false;
  }

  static override styles = [
    tokens,
    buttonReset,
    css`
      :host {
        display: block;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
      }
      .head {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .title {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        margin-right: auto;
      }
      .title ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        color: var(--amber-color, #ffc107);
      }
      .ranges {
        display: inline-flex;
        padding: 2px;
        border-radius: 10px;
        background: var(--vivid-layer-2);
      }
      .ranges button {
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .ranges button[aria-pressed='true'] {
        background: rgba(var(--vivid-rgb-text), 0.14);
        color: var(--primary-text-color);
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
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
      .stat .label {
        font-size: 10.5px;
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
      .stat .extra {
        font-size: 11px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chart {
        position: relative;
        height: 128px;
        margin-right: 36px;
        touch-action: pan-y;
        cursor: crosshair;
      }
      svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .grid line {
        stroke: rgba(var(--vivid-rgb-text), 0.12);
        stroke-width: 1;
        stroke-dasharray: 3 4;
        vector-effect: non-scaling-stroke;
      }
      .area {
        opacity: 0.5;
      }
      .edge {
        fill: none;
        stroke-width: 1.5;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
      }
      .sum {
        fill: none;
        stroke: var(--primary-text-color);
        stroke-opacity: 0.8;
        stroke-width: 1.5;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
      }
      .ylabel {
        position: absolute;
        right: -36px;
        width: 32px;
        transform: translateY(-50%);
        font-size: 10px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }
      .cursor {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--primary-text-color);
        opacity: 0.5;
        pointer-events: none;
      }
      .tooltip {
        position: absolute;
        top: 4px;
        z-index: 1;
        min-width: 130px;
        padding: 8px 10px;
        border-radius: 10px;
        background: var(--vivid-layer-0);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
        font-size: 11.5px;
        pointer-events: none;
      }
      .tooltip .time {
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
      .tooltip .row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 6px;
        font-variant-numeric: tabular-nums;
      }
      .tooltip .row.total {
        font-weight: 600;
        margin-top: 3px;
        padding-top: 3px;
        border-top: 1px solid rgba(var(--vivid-rgb-text), 0.12);
      }
      .swatch {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--swatch);
      }
      .axis {
        position: relative;
        height: 14px;
        margin: -4px 36px 0 0;
        font-size: 10px;
        color: var(--secondary-text-color);
      }
      .axis span {
        position: absolute;
        transform: translateX(-50%);
        white-space: nowrap;
      }
      .legend {
        display: grid;
        grid-template-columns: auto minmax(0, auto) minmax(40px, 1fr) auto auto;
        align-items: center;
        gap: 6px 10px;
        font-size: 12px;
      }
      .legend .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .legend .bar {
        height: 6px;
        border-radius: 3px;
        background: rgba(var(--vivid-rgb-text), 0.08);
        overflow: hidden;
      }
      .legend .bar span {
        display: block;
        height: 100%;
        border-radius: 3px;
        background: var(--swatch);
      }
      .legend .value,
      .legend .share {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .legend .share {
        color: var(--secondary-text-color);
        min-width: 3em;
      }
      .muted {
        opacity: 0.45;
      }
      .loading {
        height: 128px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.05);
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    this.timer = window.setInterval(() => void this.load(true), REFRESH_MS);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this.timer);
    this.dayKey = '';
    this.weekKey = '';
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('sources') || changed.has('hass') || changed.has('_range')) {
      void this.load(false);
    }
  }

  private async load(force: boolean): Promise<void> {
    const hass = this.hass;
    if (!hass?.callWS || this.sources.length === 0) return;
    const key = this.sources.map((source) => source.entityId).join(',');
    const ids = this.sources.map((source) => source.entityId);
    const now = Date.now();
    try {
      if (force || key !== this.dayKey) {
        this.dayKey = key;
        this._day = await fetchHistory(hass, ids, now - 24 * HOUR, now);
      }
      if (this._range === '7d' && (force || key !== this.weekKey)) {
        this.weekKey = key;
        this._week = await fetchStatistics(hass, ids, now - 168 * HOUR, now);
      }
      this._failed = false;
    } catch {
      this._failed = true;
    }
  }

  /** Readings of one light in watts over a range, closed by the live state. */
  private readings(source: PowerSeriesSource, now: number, range: HistoryRange): Reading[] {
    const day = this._day?.[source.entityId] ?? [];
    const history =
      range === '7d'
        ? [...cutBefore(this._week?.[source.entityId] ?? [], now - 24 * HOUR), ...day]
        : day;
    const live = Number.parseFloat(this.hass?.states[source.entityId]?.state ?? '');
    return scaleReadings(
      [...history, { t: now, v: Number.isFinite(live) ? live : undefined }],
      source.factor,
    );
  }

  private series(now: number): { lights: LightSeries[]; start: number; spec: RangeSpec } {
    const spec = RANGES[this._range];
    const start = now - spec.hours * HOUR;
    const midnight = startOfDay(now);
    const lights = this.sources.map((source, index) => {
      const readings = this.readings(source, now, this._range);
      return {
        source,
        color: SERIES_COLORS[index % SERIES_COLORS.length] ?? '#ffb300',
        buckets: resample(readings, start, now, spec.buckets),
        energy: energyWh(readings, start, now),
        today: energyWh(this.readings(source, now, '24h'), midnight, now),
      };
    });
    return { lights, start, spec };
  }

  private timeLabel(time: number): string {
    return new Intl.DateTimeFormat(languageOf(this.hass), {
      weekday: this._range === '7d' ? 'short' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(time));
  }

  /* ---------------------------------- chart --------------------------------- */

  private renderChart(
    lights: LightSeries[],
    totals: (number | undefined)[],
    start: number,
    now: number,
    spec: RangeSpec,
  ) {
    const buckets = spec.buckets;
    const top = niceMax(Math.max(0, ...totals.map((value) => value ?? 0)));
    const x = (index: number) => (index / (buckets - 1)) * 100;
    const y = (watts: number) => 100 - (watts / top) * 100;

    // Runs of buckets where at least one light is known: the shapes break elsewhere.
    const runs: number[][] = [];
    let run: number[] = [];
    totals.forEach((total, index) => {
      if (total === undefined) {
        if (run.length) runs.push(run);
        run = [];
      } else run.push(index);
    });
    if (run.length) runs.push(run);

    // Stacked areas, first light at the bottom.
    const floors = new Array<number>(buckets).fill(0);
    const shapes = lights.map((light) => {
      const ceilings = floors.map((floor, index) => floor + (light.buckets[index] ?? 0));
      const paths = runs.map((indexes) => {
        const upper = indexes.map((index) => `${x(index)},${y(ceilings[index] ?? 0)}`);
        const lower = [...indexes].reverse().map((index) => `${x(index)},${y(floors[index] ?? 0)}`);
        return {
          area: `M${upper.join(' L')} L${lower.join(' L')} Z`,
          edge: `M${upper.join(' L')}`,
        };
      });
      ceilings.forEach((ceiling, index) => (floors[index] = ceiling));
      return { light, paths };
    });
    const sumPath = runs
      .map(
        (indexes) =>
          `M${indexes.map((index) => `${x(index)},${y(totals[index] ?? 0)}`).join(' L')}`,
      )
      .join(' ');

    const hover = this._hover;
    const width = (now - start) / buckets;
    const hass = this.hass;

    return html`<div
        class="chart"
        @pointermove=${this.onPointer}
        @pointerdown=${this.onPointer}
        @pointerleave=${() => (this._hover = undefined)}
        role="img"
        aria-label=${localize(hass, 'consumption')}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <g class="grid">
            ${[0, 50, 100].map(
              (level) => svg`<line x1="0" x2="100" y1=${level} y2=${level}></line>`,
            )}
          </g>
          ${shapes.map(({ light, paths }) =>
            paths.map(
              (path) =>
                svg`<path class="area" fill=${light.color} d=${path.area}></path><path class="edge" stroke=${light.color} d=${path.edge}></path>`,
            ),
          )}
          ${lights.length > 1 && sumPath ? svg`<path class="sum" d=${sumPath}></path>` : nothing}
        </svg>
        ${[top, top / 2, 0].map(
          (level, index) =>
            html`<span class="ylabel" style=${`top: ${index * 50}%`}
              >${formatWattsShort(hass, level)}</span
            >`,
        )}
        ${
          hover !== undefined
            ? this.renderTooltip(lights, totals, hover, start + (hover + 0.5) * width, x(hover))
            : nothing
        }
      </div>
      ${this.renderAxis(start, now, spec)}`;
  }

  private readonly onPointer = (event: PointerEvent): void => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    this._hover = Math.round(ratio * (RANGES[this._range].buckets - 1));
  };

  private renderTooltip(
    lights: LightSeries[],
    totals: (number | undefined)[],
    index: number,
    time: number,
    left: number,
  ) {
    const hass = this.hass;
    const total = totals[index];
    const side = left > 55 ? { right: `${100 - left + 2}%` } : { left: `${left + 2}%` };
    return html`<div class="cursor" style=${`left: ${left}%`}></div>
      <div class="tooltip" style=${styleMap(side)}>
        <div class="time">${this.timeLabel(time)}</div>
        ${lights.map((light) => {
          const value = light.buckets[index];
          return html`<div class="row">
            <span class="swatch" style=${`--swatch: ${light.color}`}></span>
            <span>${light.source.name}</span>
            <span>${value === undefined ? '—' : formatWattsShort(hass, value)}</span>
          </div>`;
        })}
        ${
          lights.length > 1
            ? html`<div class="row total">
                <span></span><span>${localize(hass, 'total')}</span
                ><span>${total === undefined ? '—' : formatWattsShort(hass, total)}</span>
              </div>`
            : nothing
        }
      </div>`;
  }

  private renderAxis(start: number, now: number, spec: RangeSpec) {
    const language = languageOf(this.hass);
    const span = now - start;
    const ticks: { at: number; label: string }[] = [];
    if (spec.tick === 24) {
      const format = new Intl.DateTimeFormat(language, { weekday: 'short' });
      // One label in the middle of each day.
      for (let day = startOfDay(start); day < now; day += 24 * HOUR) {
        ticks.push({ at: day + 12 * HOUR, label: format.format(new Date(day + 12 * HOUR)) });
      }
    } else {
      const format = new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' });
      const step = spec.tick * HOUR;
      // Align on local hours.
      const local = startOfDay(start);
      for (let time = local; time < now; time += step) {
        if (time > start) ticks.push({ at: time, label: format.format(new Date(time)) });
      }
    }
    return html`<div class="axis">
      ${ticks
        .filter((tick) => (tick.at - start) / span > 0.05 && (tick.at - start) / span < 0.95)
        .map(
          (tick) =>
            html`<span style=${`left: ${(((tick.at - start) / span) * 100).toFixed(2)}%`}
              >${tick.label}</span
            >`,
        )}
    </div>`;
  }

  /* --------------------------------- render --------------------------------- */

  private renderStats(
    lights: LightSeries[],
    totals: (number | undefined)[],
    spec: RangeSpec,
    start: number,
    now: number,
  ) {
    const hass = this.hass;
    const currency = this.currency ?? hass?.config?.currency ?? 'EUR';
    const cost = (wattHours: number) =>
      this.price !== undefined
        ? formatCost(hass, (wattHours / 1000) * this.price, currency)
        : undefined;
    const today = lights.reduce((sum, light) => sum + light.today, 0);
    const period = lights.reduce((sum, light) => sum + light.energy, 0);
    const known = totals.map((value) => value ?? 0);
    const peak = Math.max(0, ...known);
    const width = (now - start) / spec.buckets;
    const peakTime = start + (known.indexOf(peak) + 0.5) * width;
    const average = period / ((now - start) / HOUR) || 0;
    return html`<div class="stats">
      <div class="stat">
        <span class="label">${localize(hass, 'today')}</span>
        <span class="value">${formatEnergy(hass, today)}</span>
        <span class="extra">${cost(today) ?? ' '}</span>
      </div>
      <div class="stat">
        <span class="label"
          >${localize(hass, 'over_range', { range: localize(hass, spec.label) })}</span
        >
        <span class="value">${formatEnergy(hass, period)}</span>
        <span class="extra"
          >${
            cost(period) ?? `${localize(hass, 'average')} ${formatWattsShort(hass, average)}`
          }</span
        >
      </div>
      <div class="stat">
        <span class="label">${localize(hass, 'peak')}</span>
        <span class="value">${formatWattsShort(hass, peak)}</span>
        <span class="extra">${peak > 0 ? this.timeLabel(peakTime) : '—'}</span>
      </div>
    </div>`;
  }

  private renderLegend(all: LightSeries[], drawn: LightSeries[]) {
    if (all.length < 2) return nothing;
    const hass = this.hass;
    const total = drawn.reduce((sum, light) => sum + light.energy, 0);
    const most = Math.max(...drawn.map((light) => light.energy), 0.001);
    return html`<div class="legend">
      ${all.map((light) => {
        const known = drawn.includes(light);
        return html`<span
            class="swatch ${known ? '' : 'muted'}"
            style=${`--swatch: ${light.color}`}
          ></span>
          <span class="name ${known ? '' : 'muted'}">${light.source.name}</span>
          <span class="bar" style=${`--swatch: ${light.color}`}
            ><span style=${`width: ${known ? ((light.energy / most) * 100).toFixed(1) : 0}%`}></span
          ></span>
          <span class="value ${known ? '' : 'muted'}"
            >${known ? formatEnergy(hass, light.energy) : localize(hass, 'no_data')}</span
          >
          <span class="share"
            >${known && total > 0 ? `${formatNumber(hass, (light.energy / total) * 100)} %` : '—'}</span
          >`;
      })}
    </div>`;
  }

  protected override render() {
    if (!this.hass?.callWS || this.sources.length === 0 || this._failed) return nothing;
    const hass = this.hass;
    const head = html`<div class="head">
      <span class="title"
        ><ha-icon .icon=${'mdi:chart-areaspline'}></ha-icon>${localize(hass, 'consumption')}</span
      >
      <span class="ranges" role="group" aria-label=${localize(hass, 'period')}>
        ${(Object.keys(RANGES) as HistoryRange[]).map(
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
              ${localize(hass, RANGES[range].label)}
            </button>`,
        )}
      </span>
    </div>`;
    if (!this._day || (this._range === '7d' && !this._week)) {
      return html`<div class="panel">
        ${head}
        <div class="loading"></div>
      </div>`;
    }
    const now = Date.now();
    const { lights: all, start, spec } = this.series(now);
    // A light without any reading in the range (offline, no history) is left out of the chart.
    const lights = all.filter((light) => light.buckets.some((value) => value !== undefined));
    const totals = Array.from({ length: spec.buckets }, (_, index) => {
      const values = lights.map((light) => light.buckets[index]);
      return values.some((value) => value !== undefined)
        ? values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
        : undefined;
    });
    return html`<div class="panel">
      ${head} ${this.renderStats(lights, totals, spec, start, now)}
      ${this.renderChart(lights, totals, start, now, spec)} ${this.renderLegend(all, lights)}
    </div>`;
  }
}

defineElement('vivid-power-history', VividPowerHistory);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-power-history': VividPowerHistory;
  }
}
