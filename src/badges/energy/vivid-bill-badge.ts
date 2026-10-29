import { html } from 'lit';
import type { HomeAssistant } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerBadge } from '../../core/register';
import { localize } from '../../i18n';
import { SAMPLE_TARIFF } from '../../energy/config';
import type { EnergyNeeds } from '../../energy/data';
import { deltaColor, formatDelta, formatMoney, rgb } from '../../energy/format';
import '../../energy/panels';
import { energyEditor } from '../../energy/vivid-energy-editor';
import { billView, type BillView } from '../../energy/views';
import { BILL_NEEDS } from '../../cards/bill/vivid-bill-card';
import type { BadgeView } from '../base/vivid-badge';
import {
  ENERGY_BADGE_FIELDS,
  resolveEnergyBadge,
  solidTone,
  VividEnergyBadge,
  type ResolvedEnergyBadge,
} from './base';

export const BILL_BADGE = 'vivid-bill-badge';

/**
 * The estimated bill: the ring goes round with the billing cycle, the color
 * follows the gap with the previous bill. The details show the bill summary.
 */
export class VividBillBadge extends VividEnergyBadge<ResolvedEnergyBadge> {
  private bill?: BillView;

  static getConfigElement(): HTMLElement {
    return energyEditor({
      fields: ENERGY_BADGE_FIELDS,
      validate: (config) => resolveEnergyBadge(BILL_BADGE, config),
    });
  }

  static getStubConfig(): Record<string, unknown> {
    return { tariff: SAMPLE_TARIFF };
  }

  protected resolveConfig(raw: unknown): ResolvedEnergyBadge {
    return resolveEnergyBadge(BILL_BADGE, raw);
  }

  protected needs(): EnergyNeeds {
    return BILL_NEEDS;
  }

  protected buildView(hass: HomeAssistant, config: ResolvedEnergyBadge): BadgeView {
    const name = config.name ?? localize(hass, 'energy_bill');
    const data = this.energy.data;
    const icon = config.icon ?? 'mdi:currency-eur';
    if (!data?.days.length) {
      this.bill = undefined;
      const state =
        this.energy.error === 'no_source'
          ? localize(hass, 'energy_no_source')
          : localize(hass, data ? 'energy_no_data' : 'energy_loading');
      return {
        name,
        active: false,
        icon,
        state,
        watched: [],
        unavailable: Boolean(data || this.energy.error),
      };
    }
    const view = billView(data.days, config.tariff, data.today);
    this.bill = view;
    const color = deltaColor(view.delta);
    const cycle = view.cycle;
    const amount = formatMoney(hass, cycle.projected, 0);
    return {
      name,
      active: true,
      icon,
      text: amount,
      suffix: view.delta !== undefined ? formatDelta(hass, view.delta) : undefined,
      tone: solidTone(color),
      ring: cycle.length ? cycle.dayIndex / cycle.length : undefined,
      ringColor: rgb(color),
      state: `${amount} · ${localize(hass, 'energy_estimated', { day: cycle.dayIndex, total: cycle.length })}`,
      watched: [],
    };
  }

  protected renderDetails() {
    return html`<vivid-bill-summary
      compact
      .hass=${this.hass}
      .view=${this.bill}
      .tariff=${this._config?.tariff}
    ></vivid-bill-summary>`;
  }
}

defineElement(BILL_BADGE, VividBillBadge);

registerBadge({
  type: BILL_BADGE,
  name: 'Vivid bill badge',
  description:
    'The estimated bill of the cycle in progress, colored by the gap with the previous one.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-bill-badge`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-bill-badge': VividBillBadge;
  }
}
