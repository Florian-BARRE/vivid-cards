import { css, html, nothing, svg, type CSSResultGroup } from 'lit';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { formatNumber, localize } from '../../i18n';
import { resolveEnergyBase, SAMPLE_TARIFF, type ResolvedEnergyBase } from '../../energy/config';
import type { EnergyData, EnergyNeeds } from '../../energy/data';
import {
  formatKwh,
  formatLongDate,
  formatMoney,
  rgb,
  OFF_PEAK_RGB,
  PEAK_RGB,
} from '../../energy/format';
import { VividEnergyCard, type EnergyHead } from '../../energy/vivid-energy-card';
import { energyEditor } from '../../energy/vivid-energy-editor';
import { curveDates, loadCurve } from '../../energy/views';

export const LOAD_CURVE = 'vivid-load-curve';

export function resolveLoadCurve(raw: unknown): ResolvedEnergyBase {
  return resolveEnergyBase(LOAD_CURVE, raw);
}

/** Days of hourly data read, to step back through. */
const CURVE_DAYS = 8;
const W = 480;
const H = 160;

function watts(hass: Parameters<typeof formatNumber>[0], value: number): string {
  return value >= 1000
    ? `${formatNumber(hass, value / 1000, 1)} kW`
    : `${formatNumber(hass, value, 0)} W`;
}

/**
 * The load curve of a day, hour by hour, over the off-peak bands: what falls
 * in off-peak hours, what does not, and the standby that never stops.
 */
export class VividLoadCurve extends VividEnergyCard<ResolvedEnergyBase> {
  static override properties = {
    ...VividEnergyCard.properties,
    _date: { state: true },
  };

  declare _date?: string;

  static getConfigElement(): HTMLElement {
    return energyEditor({ fields: [], validate: (config) => resolveLoadCurve(config) });
  }

  static getStubConfig(): Record<string, unknown> {
    return { tariff: SAMPLE_TARIFF };
  }

  static override styles: CSSResultGroup = [
    VividEnergyCard.styles,
    css`
      svg {
        width: 100%;
        height: auto;
        color: var(--primary-text-color);
      }
      .standby {
        font-size: 11px;
        fill: var(--secondary-text-color);
      }
      .hours {
        position: relative;
        height: 14px;
        font-size: 11px;
        color: var(--vivid-muted);
      }
      .hours span {
        position: absolute;
        transform: translateX(-50%);
      }
    `,
  ];

  protected resolveConfig(raw: unknown): ResolvedEnergyBase {
    return resolveLoadCurve(raw);
  }

  protected needs(): EnergyNeeds {
    return { days: CURVE_DAYS, hourlyDays: CURVE_DAYS };
  }

  private dates(data: EnergyData | undefined): string[] {
    return data ? curveDates(data.hourly).filter((date) => date < data.today) : [];
  }

  private shownDate(data: EnergyData | undefined): string | undefined {
    const dates = this.dates(data);
    return this._date && dates.includes(this._date) ? this._date : dates.at(-1);
  }

  protected head(config: ResolvedEnergyBase, data: EnergyData | undefined): EnergyHead {
    const hass = this.hass;
    const dates = this.dates(data);
    const date = this.shownDate(data);
    const index = date ? dates.indexOf(date) : -1;
    const step = (offset: number) => {
      const next = dates[index + offset];
      if (next) this._date = next;
    };
    return {
      icon: 'mdi:chart-bar',
      color: PEAK_RGB,
      title: config.name ?? (date ? formatLongDate(hass, date) : localize(hass, 'energy_curve')),
      sub: localize(hass, 'energy_curve_sub'),
      aside: dates.length
        ? html`<button
              type="button"
              class="reset icon-button"
              ?disabled=${index <= 0}
              aria-label=${localize(hass, 'energy_previous_day')}
              @click=${() => step(-1)}
            >
              <ha-icon icon="mdi:chevron-left"></ha-icon></button
            ><button
              type="button"
              class="reset icon-button"
              ?disabled=${index >= dates.length - 1}
              aria-label=${localize(hass, 'energy_next_day')}
              @click=${() => step(1)}
            >
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>`
        : nothing,
    };
  }

  protected renderBody(config: ResolvedEnergyBase, data: EnergyData) {
    const hass = this.hass;
    const date = this.shownDate(data);
    const curve = date ? loadCurve(data.hourly, config.tariff, date) : undefined;
    if (!curve) return html`<div class="message">${localize(hass, 'energy_curve_waiting')}</div>`;
    const top = Math.max(...curve.hours.map((hour) => hour.kwh), 0.05) * 1.1;
    const slot = W / 24;
    const y = (kwh: number) => H - (kwh / top) * (H - 4);
    const bands = config.tariff.offPeakRanges.flatMap((range) =>
      range.from < range.to
        ? [[range.from, range.to]]
        : [
            [range.from, 1440],
            [0, range.to],
          ],
    );
    const standbyKw = curve.standbyWatts / 1000;
    const standbyY = y(standbyKw);
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
            <title>${`${hour.hour} h · ${formatKwh(hass, hour.kwh, 2)}`}</title>
          </g>`;
        })}
        ${
          curve.standbyWatts > 0
            ? svg`<line x1="0" x2=${W} y1=${standbyY.toFixed(1)} y2=${standbyY.toFixed(1)} stroke="currentColor" stroke-opacity="0.6" stroke-dasharray="5 5"></line>
              <text class="standby" x=${W - 4} y=${(standbyY - 5).toFixed(1)} text-anchor="end">${localize(hass, 'energy_standby', { w: watts(hass, curve.standbyWatts) })}</text>`
            : nothing
        }
      </svg>
      <div class="hours" aria-hidden="true">
        ${[0, 6, 12, 18, 24].map((hour) => html`<span style="left: ${((hour / 24) * 100).toFixed(2)}%">${hour} h</span>`)}
      </div>
      <div class="tiles">
        <div class="tile">
          <div class="sub">${localize(hass, 'energy_peak')}</div>
          <div class="value">${formatKwh(hass, curve.peakKwh)}</div>
        </div>
        <div class="tile">
          <div class="sub">${localize(hass, 'energy_off_peak')}</div>
          <div class="value">${formatKwh(hass, curve.offPeakKwh)}</div>
        </div>
        <div class="tile">
          <div class="sub">${localize(hass, 'energy_cost')}</div>
          <div class="value">${formatMoney(hass, curve.cost)}</div>
        </div>
        <div class="tile">
          <div class="sub">${localize(hass, 'energy_standby_year')}</div>
          <div class="value">${formatMoney(hass, curve.standbyYear, 0)}</div>
        </div>
      </div>`;
  }
}

defineElement(LOAD_CURVE, VividLoadCurve);

registerCard({
  type: LOAD_CURVE,
  name: 'Vivid Load Curve',
  description: 'The hourly load curve of a day over the off-peak hours, with the standby.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-load-curve`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-load-curve': VividLoadCurve;
  }
}
