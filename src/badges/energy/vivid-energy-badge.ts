import { html } from 'lit';
import type { HomeAssistant } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerBadge } from '../../core/register';
import { localize } from '../../i18n';
import { SAMPLE_TARIFF } from '../../energy/config';
import type { EnergyNeeds } from '../../energy/data';
import { costColor, formatKwh, formatLongDate, formatMoney } from '../../energy/format';
import '../../energy/panels';
import { energyEditor } from '../../energy/vivid-energy-editor';
import { recentDays, type RecentView } from '../../energy/views';
import type { BadgeView } from '../base/vivid-badge';
import {
  ENERGY_BADGE_FIELDS,
  resolveEnergyBadge,
  solidTone,
  VividEnergyBadge,
  type ResolvedEnergyBadge,
} from './base';

export const ENERGY_BADGE = 'vivid-energy-badge';
const RECENT_DAYS = 7;

/**
 * The last day the meter gave: its kWh, colored against the mean of the last
 * seven days (cyan below, amber around, orange then red above), with a trend
 * arrow. The details show the seven days.
 */
export class VividLastDayBadge extends VividEnergyBadge<ResolvedEnergyBadge> {
  private recent?: RecentView;

  static getConfigElement(): HTMLElement {
    return energyEditor({
      fields: ENERGY_BADGE_FIELDS,
      validate: (config) => resolveEnergyBadge(ENERGY_BADGE, config),
    });
  }

  static getStubConfig(): Record<string, unknown> {
    return { tariff: SAMPLE_TARIFF };
  }

  protected resolveConfig(raw: unknown): ResolvedEnergyBadge {
    return resolveEnergyBadge(ENERGY_BADGE, raw);
  }

  protected needs(): EnergyNeeds {
    return { days: RECENT_DAYS + 3, hourlyDays: 0 };
  }

  protected buildView(hass: HomeAssistant, config: ResolvedEnergyBadge): BadgeView {
    const name = config.name ?? localize(hass, 'energy_last_day');
    const icon = config.icon ?? 'mdi:lightning-bolt';
    const data = this.energy.data;
    const recent = data ? recentDays(data.days, config.tariff, data.today, RECENT_DAYS) : undefined;
    this.recent = recent;
    const last = recent?.last;
    if (!last) {
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
    const color = costColor(last.ratio);
    return {
      name,
      active: true,
      icon,
      text: formatKwh(hass, last.kwh, 0),
      trend: last.ratio > 1.1 ? 'up' : last.ratio < 0.9 ? 'down' : undefined,
      tone: solidTone(color),
      state: `${formatLongDate(hass, last.date)} · ${formatKwh(hass, last.kwh)} · ${formatMoney(hass, last.cost)}`,
      watched: [],
    };
  }

  protected renderDetails() {
    return html`<vivid-recent-days .hass=${this.hass} .view=${this.recent}></vivid-recent-days>`;
  }
}

defineElement(ENERGY_BADGE, VividLastDayBadge);

registerBadge({
  type: ENERGY_BADGE,
  name: 'Vivid energy badge',
  description: 'The last day of the meter in kWh, colored against the mean of the last seven days.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-energy-badge`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-energy-badge': VividLastDayBadge;
  }
}
