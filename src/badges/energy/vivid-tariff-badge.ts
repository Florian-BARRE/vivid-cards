import { html } from 'lit';
import type { HomeAssistant } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerBadge } from '../../core/register';
import { formatDuration, localize } from '../../i18n';
import { SAMPLE_TARIFF } from '../../energy/config';
import { formatMoney, rgb, OFF_PEAK_RGB, PEAK_RGB } from '../../energy/format';
import '../../energy/panels';
import { periodAt } from '../../energy/tariff';
import { energyEditor } from '../../energy/vivid-energy-editor';
import type { BadgeView } from '../base/vivid-badge';
import {
  ENERGY_BADGE_FIELDS,
  resolveEnergyBadge,
  solidTone,
  VividEnergyBadge,
  type ResolvedEnergyBadge,
} from './base';

export const TARIFF_BADGE = 'vivid-tariff-badge';

/**
 * The tariff period in progress and the time left: a moon on indigo in
 * off-peak hours, a sun on amber in peak hours; the ring is the share of the
 * period already gone. Needs only the off-peak hours of the tariff.
 */
export class VividTariffBadge extends VividEnergyBadge<ResolvedEnergyBadge> {
  static getConfigElement(): HTMLElement {
    return energyEditor({
      fields: ENERGY_BADGE_FIELDS,
      validate: (config) => resolveEnergyBadge(TARIFF_BADGE, config),
    });
  }

  static getStubConfig(): Record<string, unknown> {
    return { tariff: SAMPLE_TARIFF };
  }

  protected resolveConfig(raw: unknown): ResolvedEnergyBadge {
    return resolveEnergyBadge(TARIFF_BADGE, raw);
  }

  protected needs(): undefined {
    return undefined;
  }

  protected buildView(hass: HomeAssistant, config: ResolvedEnergyBadge): BadgeView {
    const now = Date.now();
    const period = periodAt(config.tariff.offPeakRanges, now);
    const name = config.name ?? localize(hass, 'energy_tariff');
    if (!period) {
      const price = formatMoney(hass, config.tariff.peak, 4);
      return {
        name,
        active: true,
        icon: config.icon ?? 'mdi:cash',
        text: price,
        tone: solidTone(PEAK_RGB),
        state: `${localize(hass, 'energy_single_price')} · ${price}`,
        watched: [],
      };
    }
    const color = period.offPeak ? OFF_PEAK_RGB : PEAK_RGB;
    const left = formatDuration(hass, Math.ceil((period.end - now) / 60_000) * 60);
    const short = localize(hass, period.offPeak ? 'energy_off_peak_short' : 'energy_peak_short');
    return {
      name,
      active: true,
      icon: period.offPeak
        ? (config.iconOff ?? 'mdi:weather-night')
        : (config.icon ?? 'mdi:white-balance-sunny'),
      text: short,
      suffix: left,
      tone: solidTone(color),
      ring: (now - period.start) / Math.max(1, period.end - period.start),
      ringColor: rgb(color),
      state: `${localize(hass, period.offPeak ? 'energy_off_peak' : 'energy_peak')} · ${localize(hass, 'energy_left', { d: left })}`,
      watched: [],
      ticking: true,
    };
  }

  protected renderDetails() {
    return html`<vivid-tariff-timeline
      .hass=${this.hass}
      .tariff=${this._config?.tariff}
      .now=${Date.now()}
    ></vivid-tariff-timeline>`;
  }
}

defineElement(TARIFF_BADGE, VividTariffBadge);

registerBadge({
  type: TARIFF_BADGE,
  name: 'Vivid tariff badge',
  description: 'Off-peak or peak hours right now, and the time left.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-tariff-badge`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-tariff-badge': VividTariffBadge;
  }
}
