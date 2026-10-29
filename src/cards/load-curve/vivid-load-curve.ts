import { html, nothing, type CSSResultGroup } from 'lit';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { localize } from '../../i18n';
import { resolveEnergyBase, SAMPLE_TARIFF, type ResolvedEnergyBase } from '../../energy/config';
import type { EnergyData, EnergyNeeds } from '../../energy/data';
import { formatKwh, formatLongDate, formatMoney, PEAK_RGB } from '../../energy/format';
import { VividEnergyCard, type EnergyHead } from '../../energy/vivid-energy-card';
import { energyEditor } from '../../energy/vivid-energy-editor';
import { curveDates, loadCurve } from '../../energy/views';
import '../../energy/hour-chart';

export const LOAD_CURVE = 'vivid-load-curve';

export function resolveLoadCurve(raw: unknown): ResolvedEnergyBase {
  return resolveEnergyBase(LOAD_CURVE, raw);
}

/** Days of hourly data read, to step back through. */
const CURVE_DAYS = 8;
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

  static override styles: CSSResultGroup = [VividEnergyCard.styles];

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
    return html`<vivid-hour-chart
        standby
        .hass=${hass}
        .curve=${curve}
        .tariff=${config.tariff}
      ></vivid-hour-chart>
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
