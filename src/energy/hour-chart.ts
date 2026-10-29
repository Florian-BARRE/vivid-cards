/**
 * A day hour by hour: one bar per hour, amber for the energy drawn in peak
 * hours and indigo for the off-peak part, over the off-peak bands, with the
 * busiest hour pointed out and, on demand, the standby line.
 */
import { LitElement, css, html, nothing, svg } from 'lit';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import { tokens } from '../components/shared-styles';
import { formatNumber, localize } from '../i18n';
import { formatKwh, rgb, OFF_PEAK_RGB, PEAK_RGB } from './format';
import type { Tariff } from './tariff';
import { busiestHour, type CurveView } from './views';

const W = 480;
const H = 160;

/** "320 W", "1,2 kW". */
export function formatWatts(hass: HomeAssistant | undefined, value: number): string {
  return value >= 1000
    ? `${formatNumber(hass, value / 1000, 1)} kW`
    : `${formatNumber(hass, value, 0)} W`;
}

export class VividHourChart extends LitElement {
  static override properties = {
    hass: { attribute: false },
    curve: { attribute: false },
    tariff: { attribute: false },
    standby: { type: Boolean },
    legend: { type: Boolean },
  };

  declare hass?: HomeAssistant;
  declare curve?: CurveView;
  declare tariff?: Tariff;
  /** Draws the standby line. */
  declare standby: boolean;
  /** Draws the peak / off-peak legend. */
  declare legend: boolean;

  constructor() {
    super();
    this.standby = false;
    this.legend = true;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      svg {
        width: 100%;
        height: auto;
        color: var(--primary-text-color);
        overflow: visible;
      }
      .label,
      .peak-label {
        paint-order: stroke;
        stroke: var(--ha-card-background, var(--card-background-color, #1c1c1c));
        stroke-width: 3px;
        stroke-linejoin: round;
      }
      .label {
        font-size: 11px;
        fill: var(--secondary-text-color);
      }
      .peak-label {
        font-size: 11.5px;
        font-weight: 700;
        fill: var(--primary-text-color);
      }
      .hours {
        position: relative;
        height: 14px;
        font-size: 11px;
        color: var(--vivid-muted);
      }
      .hours span {
        position: absolute;
        white-space: nowrap;
        transform: translateX(-50%);
      }
      .hours span:first-child {
        transform: none;
      }
      .hours span:last-child {
        transform: translateX(-100%);
      }
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 14px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .legend span {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 3px;
      }
    `,
  ];

  protected override render() {
    const curve = this.curve;
    const tariff = this.tariff;
    if (!curve || !tariff) return nothing;
    const hass = this.hass;
    // Room above the bars for the label of the busiest hour.
    const top = Math.max(...curve.hours.map((hour) => hour.kwh), 0.05) * 1.25;
    const slot = W / 24;
    const y = (kwh: number) => H - (kwh / top) * (H - 4);
    const bands = tariff.offPeakRanges.flatMap((range) =>
      range.from < range.to
        ? [[range.from, range.to]]
        : [
            [range.from, 1440],
            [0, range.to],
          ],
    );
    const busiest = busiestHour(curve);
    const standbyY = y(curve.standbyWatts / 1000);
    const peakX = busiest ? busiest.hour * slot + slot / 2 : 0;
    return html`<svg
        viewBox="0 0 ${W} ${H}"
        role="img"
        aria-label=${localize(hass, 'energy_curve')}
      >
        ${bands.map(
          ([from, to]) =>
            svg`<rect x=${((from! / 1440) * W).toFixed(1)} y="0" width=${(((to! - from!) / 1440) * W).toFixed(1)} height=${H} fill=${rgb(OFF_PEAK_RGB)} fill-opacity="0.12"></rect>`,
        )}
        ${curve.hours.map((hour) => {
          const x = hour.hour * slot + 1.5;
          const width = slot - 3;
          const offPeakTop = y(hour.kwh * hour.offPeakShare);
          const allTop = y(hour.kwh);
          return svg`<g>
            ${hour.offPeakShare > 0 ? svg`<rect x=${x.toFixed(1)} y=${offPeakTop.toFixed(1)} width=${width.toFixed(1)} height=${(H - offPeakTop).toFixed(1)} rx="2" fill=${rgb(OFF_PEAK_RGB)}></rect>` : nothing}
            ${hour.offPeakShare < 1 ? svg`<rect x=${x.toFixed(1)} y=${allTop.toFixed(1)} width=${width.toFixed(1)} height=${Math.max(0, offPeakTop - allTop).toFixed(1)} rx="2" fill=${rgb(PEAK_RGB)}></rect>` : nothing}
            <title>${`${hour.hour} h – ${hour.hour + 1} h · ${formatKwh(hass, hour.kwh, 2)}`}</title>
          </g>`;
        })}
        ${
          busiest
            ? svg`<text
                class="peak-label"
                x=${Math.min(W - 4, Math.max(4, peakX)).toFixed(1)}
                y=${(y(busiest.kwh) - 6).toFixed(1)}
                text-anchor=${peakX < 40 ? 'start' : peakX > W - 40 ? 'end' : 'middle'}
              >${localize(hass, 'energy_busiest', { h: busiest.hour, v: formatKwh(hass, busiest.kwh, 2) })}</text>`
            : nothing
        }
        ${
          this.standby && curve.standbyWatts > 0
            ? svg`<line x1="0" x2=${W} y1=${standbyY.toFixed(1)} y2=${standbyY.toFixed(1)} stroke="currentColor" stroke-opacity="0.6" stroke-dasharray="5 5"></line>
              <text class="label" x="4" y=${(standbyY - 5).toFixed(1)}>${localize(hass, 'energy_standby', { w: formatWatts(hass, curve.standbyWatts) })}</text>`
            : nothing
        }
      </svg>
      <div class="hours" aria-hidden="true">
        ${[0, 6, 12, 18, 24].map((hour) => html`<span style="left: ${((hour / 24) * 100).toFixed(2)}%">${hour} h</span>`)}
      </div>
      ${
        this.legend
          ? html`<div class="legend">
              <span
                ><i class="dot" style="background: ${rgb(PEAK_RGB)}"></i
                >${localize(hass, 'energy_peak')}</span
              >
              <span
                ><i class="dot" style="background: ${rgb(OFF_PEAK_RGB)}"></i
                >${localize(hass, 'energy_off_peak')}</span
              >
            </div>`
          : nothing
      }`;
  }
}

defineElement('vivid-hour-chart', VividHourChart);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-hour-chart': VividHourChart;
  }
}
