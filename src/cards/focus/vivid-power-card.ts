import { html, nothing, type TemplateResult } from 'lit';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { formEditor } from '../../core/vivid-form-editor';
import { localize } from '../../i18n';
import { formatWatts } from '../../components/vivid-light-header';
import '../../components/vivid-power-history';
import { readWatts } from '../../integrations/power';
import { VividFocusCard, type FocusHead } from './base';
import { powerReadings, resolvePowerCard, seriesSources, type ResolvedPowerCard } from './config';

export const POWER_CARD = 'vivid-power-card';
const POWER_RGB: Rgb = [255, 179, 0];

/**
 * The consumption of a few lights or devices over 6 hours, 24 hours or 7
 * days, one stacked area each, with the energy, its cost and the peak.
 */
export class VividPowerCard extends VividFocusCard<ResolvedPowerCard> {
  static getConfigElement(): HTMLElement {
    return formEditor({
      fields: [
        {
          name: 'entities',
          label: 'focus_power_entities',
          selector: { entity: { multiple: true, domain: ['light', 'sensor', 'switch'] } },
          required: true,
        },
        { name: 'name', label: 'name', selector: { text: {} } },
        {
          name: 'price',
          label: 'focus_price',
          selector: { number: { min: 0, max: 5, step: 0.0001, mode: 'box' } },
        },
        {
          name: 'voltage',
          label: 'voltage',
          selector: { number: { min: 1, max: 48, step: 1, mode: 'box', unit_of_measurement: 'V' } },
        },
      ],
      validate: resolvePowerCard,
    });
  }

  static getStubConfig(): Record<string, unknown> {
    return { entities: [] };
  }

  override getCardSize(): number {
    return 6;
  }

  protected resolveConfig(raw: unknown): ResolvedPowerCard {
    return resolvePowerCard(raw);
  }

  protected watched(config: ResolvedPowerCard): string[] {
    return this.hass ? powerReadings(this.hass, config).map((item) => item.source.entityId) : [];
  }

  protected head(config: ResolvedPowerCard, hass: HomeAssistant): FocusHead {
    const readings = powerReadings(hass, config);
    const values = readings.map((item) => readWatts(hass, item.source));
    const known = values.filter((value): value is number => value !== undefined);
    return {
      icon: config.icon ?? 'mdi:lightning-bolt',
      color: POWER_RGB,
      title: config.name ?? localize(hass, 'focus_power'),
      sub: known.length
        ? formatWatts(
            hass,
            known.reduce((sum, value) => sum + value, 0),
          )
        : undefined,
    };
  }

  protected renderBody(_config: ResolvedPowerCard, hass: HomeAssistant): TemplateResult {
    return html`<div class="message">${localize(hass, 'focus_power_missing')}</div>`;
  }

  /** The chart is the card: its own panel, titled with the name and the watts drawn now. */
  protected override render() {
    const config = this._config;
    const hass = this.hass;
    if (!config || !hass) return nothing;
    const sources = seriesSources(hass, powerReadings(hass, config));
    if (!sources.length) return super.render();
    const head = this.head(config, hass);
    return html`<ha-card class="bare">
      <vivid-power-history
        .hass=${hass}
        .sources=${sources}
        .price=${config.price}
        .currency=${config.currency}
        .heading=${head.sub ? `${head.title} · ${head.sub}` : head.title}
      ></vivid-power-history>
    </ha-card>`;
  }
}

defineElement(POWER_CARD, VividPowerCard);

registerCard({
  type: POWER_CARD,
  name: 'Vivid Consumption',
  description: 'The consumption of lights or devices over 6 h, 24 h or 7 days, with its cost.',
  preview: false,
  documentationURL: `${REPOSITORY_URL}/blob/main/docs/cards/power.md`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-power-card': VividPowerCard;
  }
}
