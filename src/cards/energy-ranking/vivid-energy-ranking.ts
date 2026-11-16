import { html, type CSSResultGroup } from 'lit';
import { defineElement } from '../../core/register';
import { localize } from '../../i18n';
import { SAMPLE_TARIFF } from '../../energy/config';
import type { EnergyData } from '../../energy/data';
import { deviceList, deviceListStyles } from '../../energy/device-list';
import { formatMoney } from '../../energy/format';
import { periodBar } from '../../energy/vivid-energy-card';
import { energyEditor } from '../../energy/vivid-energy-editor';
import { ENERGY_PERIODS } from '../../energy/views';
import {
  PERIOD_NAMES,
  VividEnergyFlow,
  resolvePeriodCard,
  type ResolvedPeriodCard,
} from '../energy-flow/vivid-energy-flow';
import type { EnergyHead } from '../../energy/vivid-energy-card';

export const ENERGY_RANKING = 'vivid-energy-ranking';

/** Periods the ranking offers: a day is too short for most devices. */
const RANKING_PERIODS = ENERGY_PERIODS;

/**
 * The rooms of Vivid Pilot (their lights, LEDs and switches inside) ranked
 * by energy, priced at the
 * period's average price, with what no device measures and the share that is
 * identified.
 */
export class VividEnergyRanking extends VividEnergyFlow {
  static override getConfigElement(): HTMLElement {
    return energyEditor({
      devices: true,
      fields: [
        {
          name: 'period',
          label: 'energy_period',
          default: 'month',
          options: ENERGY_PERIODS.map((period) => ({
            value: period,
            label: `energy_period_${period}` as const,
          })),
        },
        {
          name: 'max_devices',
          label: 'energy_max_devices',
          selector: { number: { min: 1, max: 20, mode: 'box' } },
          default: 6,
        },
      ],
      validate: (config) => resolvePeriodCard(ENERGY_RANKING, config),
    });
  }

  static override getStubConfig(): Record<string, unknown> {
    return { tariff: SAMPLE_TARIFF };
  }

  static override styles: CSSResultGroup = [VividEnergyFlow.styles, deviceListStyles];

  protected override resolveConfig(raw: unknown): ResolvedPeriodCard {
    return resolvePeriodCard(ENERGY_RANKING, raw);
  }

  protected override head(config: ResolvedPeriodCard, data?: EnergyData): EnergyHead {
    const hass = this.hass;
    const view = data?.days.length ? this.view(config, data) : undefined;
    return {
      icon: 'mdi:power-plug-outline',
      title: config.name ?? localize(hass, 'energy_devices'),
      sub: view
        ? localize(hass, 'energy_devices_sub', { p: formatMoney(hass, view.price, 3) })
        : undefined,
      aside: periodBar(
        RANKING_PERIODS,
        this.period(config),
        (period) => localize(hass, PERIOD_NAMES[period]),
        (period) => {
          this._period = period;
        },
      ),
    };
  }

  protected override renderBody(config: ResolvedPeriodCard, data: EnergyData) {
    if (!data.devices.length)
      return html`<div class="message">${localize(this.hass, 'energy_no_devices')}</div>`;
    return deviceList(this.hass, this.view(config, data), config.maxDevices);
  }
}

defineElement(ENERGY_RANKING, VividEnergyRanking);

// Not in the card picker any more: replaced by the energy flow card (`view: list`). Still defined, so
// dashboards that use it keep working.

declare global {
  interface HTMLElementTagNameMap {
    'vivid-energy-ranking': VividEnergyRanking;
  }
}
