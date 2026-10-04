import { LitElement, css, html, nothing, svg, type PropertyValues } from 'lit';
import { energyWh, fetchHistory, resample, scaleReadings, startOfDay } from '../core/history';
import type { HistorySeries, Reading } from '../core/history';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import { formatNumber, localize } from '../i18n';
import { tokens } from './shared-styles';

const HOURS = 24;
const BUCKETS = 96;
const REFRESH_MS = 5 * 60 * 1000;

/** A consumption reading of one light: its entity and the factor that gives watts. */
export interface PowerSeriesSource {
  entityId: string;
  /** Watts per unit of the entity (1 for W, 1000 for kW, V / 1000 for mA). */
  factor: number;
  name: string;
}

function peakOf(totals: readonly (number | undefined)[]): number {
  return Math.max(...totals.filter((value): value is number => value !== undefined), 1);
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

/**
 * Consumption of the last 24 hours as a sparkline, with the energy used today
 * per light and its cost. Reads Home Assistant's history every five minutes and
 * the live state in between.
 */
export class VividPowerHistory extends LitElement {
  static override properties = {
    hass: { attribute: false },
    sources: { attribute: false },
    price: { type: Number },
    currency: {},
    _series: { state: true },
    _failed: { state: true },
  };

  declare hass?: HomeAssistant;
  declare sources: PowerSeriesSource[];
  declare price?: number;
  declare currency?: string;
  declare _series?: HistorySeries;
  declare _failed: boolean;

  private timer?: number;
  private fetchedKey = '';

  constructor() {
    super();
    this.sources = [];
    this._failed = false;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px 12px 12px;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
      }
      .head {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px 12px;
        font-size: 13px;
      }
      .title {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
      }
      .title ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
        color: var(--amber-color, #ffc107);
      }
      .muted {
        color: var(--secondary-text-color);
      }
      .peak {
        font-size: 12px;
        font-variant-numeric: tabular-nums;
      }
      .today {
        margin-left: auto;
        font-variant-numeric: tabular-nums;
      }
      .today b {
        font-weight: 600;
      }
      .chart {
        position: relative;
        height: 64px;
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .line {
        fill: none;
        stroke: var(--amber-color, #ffc107);
        stroke-width: 2;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
      }
      .axis {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
      }
      .lights {
        display: grid;
        grid-template-columns: minmax(0, auto) 1fr auto;
        align-items: center;
        gap: 4px 10px;
        font-size: 12px;
      }
      .lights .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .bar {
        height: 6px;
        border-radius: 3px;
        background: rgba(var(--vivid-rgb-text), 0.1);
        overflow: hidden;
      }
      .bar span {
        display: block;
        height: 100%;
        border-radius: 3px;
        background: var(--amber-color, #ffc107);
      }
      .value {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .loading {
        height: 64px;
        border-radius: 8px;
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
    this.fetchedKey = '';
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('sources') || changed.has('hass')) void this.load(false);
  }

  private async load(force: boolean): Promise<void> {
    const hass = this.hass;
    if (!hass?.callWS || this.sources.length === 0) return;
    const key = this.sources.map((source) => source.entityId).join(',');
    if (!force && key === this.fetchedKey) return;
    this.fetchedKey = key;
    const now = Date.now();
    try {
      this._series = await fetchHistory(
        hass,
        this.sources.map((source) => source.entityId),
        now - HOURS * 3600_000,
        now,
      );
      this._failed = false;
    } catch {
      this._failed = true;
    }
  }

  /** History in watts, closed by the live state so the end of the chart is current. */
  private readings(source: PowerSeriesSource, now: number): Reading[] {
    const history = this._series?.[source.entityId] ?? [];
    const live = Number.parseFloat(this.hass?.states[source.entityId]?.state ?? '');
    const readings = [...history, { t: now, v: Number.isFinite(live) ? live : undefined }];
    return scaleReadings(readings, source.factor);
  }

  private renderChart(totals: (number | undefined)[]) {
    const peak = peakOf(totals);
    const points = totals.map((value, index) => ({
      x: (index / (totals.length - 1)) * 100,
      y: value === undefined ? undefined : 40 - (value / peak) * 38,
    }));
    const segments: string[] = [];
    let open = false;
    for (const point of points) {
      if (point.y === undefined) {
        open = false;
        continue;
      }
      segments.push(`${open ? 'L' : 'M'}${point.x.toFixed(2)},${point.y.toFixed(2)}`);
      open = true;
    }
    const line = segments.join(' ');
    const first = points.find((point) => point.y !== undefined);
    const last = [...points].reverse().find((point) => point.y !== undefined);
    const area =
      first && last ? `${line} L${last.x.toFixed(2)},40 L${first.x.toFixed(2)},40 Z` : '';
    return html`<div class="chart">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="vivid-power-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style="stop-color: var(--amber-color, #ffc107); stop-opacity: 0.45" />
            <stop offset="100%" style="stop-color: var(--amber-color, #ffc107); stop-opacity: 0" />
          </linearGradient>
        </defs>
        ${area ? svg`<path fill="url(#vivid-power-fill)" d=${area}></path>` : nothing}
        ${line ? svg`<path class="line" d=${line}></path>` : nothing}
      </svg>
    </div>`;
  }

  protected override render() {
    if (!this.hass?.callWS || this.sources.length === 0 || this._failed) return nothing;
    const hass = this.hass;
    const title = html`<span class="title"
      ><ha-icon .icon=${'mdi:chart-areaspline'}></ha-icon>${localize(hass, 'consumption')}
      <span class="muted">· 24 h</span></span
    >`;
    if (!this._series) {
      return html`<div class="panel">
        <div class="head">${title}</div>
        <div class="loading"></div>
      </div>`;
    }
    const now = Date.now();
    const start = now - HOURS * 3600_000;
    const midnight = startOfDay(now);
    const perLight = this.sources.map((source) => {
      const readings = this.readings(source, now);
      return {
        source,
        buckets: resample(readings, start, now, BUCKETS),
        today: energyWh(readings, midnight, now),
      };
    });
    const totals = Array.from({ length: BUCKETS }, (_, index) => {
      const values = perLight
        .map((light) => light.buckets[index])
        .filter((value): value is number => value !== undefined);
      return values.length ? values.reduce((sum, value) => sum + value, 0) : undefined;
    });
    const today = perLight.reduce((sum, light) => sum + light.today, 0);
    const currency = this.currency ?? hass.config?.currency ?? 'EUR';
    const cost =
      this.price !== undefined
        ? formatCost(hass, (today / 1000) * this.price, currency)
        : undefined;
    const most = Math.max(...perLight.map((light) => light.today), 0.001);

    return html`<div class="panel">
      <div class="head">
        ${title}
        ${
          totals.some((value) => value !== undefined)
            ? html`<span class="muted peak"
                >max ${formatNumber(hass, peakOf(totals), peakOf(totals) < 10 ? 1 : 0)} W</span
              >`
            : nothing
        }
        <span class="today"
          ><span class="muted">${localize(hass, 'today')}</span>
          <b>${formatEnergy(hass, today)}</b>${cost ? html` · <b>${cost}</b>` : nothing}</span
        >
      </div>
      ${this.renderChart(totals)}
      <div class="axis muted">
        <span>−24 h</span><span>−12 h</span><span>${localize(hass, 'now')}</span>
      </div>
      ${
        perLight.length > 1
          ? html`<div class="lights">
              ${perLight.map(
                (light) =>
                  html`<span class="name">${light.source.name}</span>
                    <span class="bar"
                      ><span style=${`width: ${((light.today / most) * 100).toFixed(1)}%`}></span
                    ></span>
                    <span class="value">${formatEnergy(hass, light.today)}</span>`,
              )}
            </div>`
          : nothing
      }
    </div>`;
  }
}

defineElement('vivid-power-history', VividPowerHistory);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-power-history': VividPowerHistory;
  }
}
