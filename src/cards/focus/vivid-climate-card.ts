import { html, nothing, type TemplateResult } from 'lit';
import { climateColor, type ClimateKind } from '../../core/climate';
import { parseNumericState } from '../../core/entities';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { formEditor } from '../../core/vivid-form-editor';
import { formatNumber, localize } from '../../i18n';
import '../../components/vivid-climate-chart';
import { VividFocusCard, type FocusHead } from './base';
import {
  CLIMATE_RANGES,
  kindOfSensor,
  resolveClimateCard,
  type ResolvedClimateCard,
} from './config';

export const CLIMATE_CARD = 'vivid-climate-card';

const ICONS: Record<ClimateKind, string> = {
  temperature: 'mdi:thermometer',
  humidity: 'mdi:water-percent',
  pressure: 'mdi:gauge',
  co2: 'mdi:molecule-co2',
};

/**
 * One climate sensor and its history: the current value lit by its color,
 * the curve over 6 h to 30 days, the comfort band and the extremes.
 */
export class VividClimateCard extends VividFocusCard<ResolvedClimateCard> {
  static getConfigElement(): HTMLElement {
    return formEditor({
      fields: [
        {
          name: 'entity',
          label: 'focus_sensor',
          selector: { entity: { domain: ['sensor', 'group'] } },
          required: true,
        },
        { name: 'name', label: 'name', selector: { text: {} } },
        {
          name: 'kind',
          label: 'focus_kind',
          selector: {},
          options: [
            { value: 'temperature', label: 'focus_kind_temperature' },
            { value: 'humidity', label: 'focus_kind_humidity' },
            { value: 'pressure', label: 'focus_kind_pressure' },
            { value: 'co2', label: 'focus_kind_co2' },
          ],
        },
        {
          name: 'range',
          label: 'focus_range',
          selector: { select: { mode: 'dropdown', options: [...CLIMATE_RANGES] } },
          default: '24h',
        },
      ],
      validate: resolveClimateCard,
    });
  }

  static getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    const sensor = Object.values(hass?.states ?? {}).find(
      (state) =>
        state.entity_id.startsWith('sensor.') && state.attributes.device_class === 'temperature',
    );
    return sensor ? { entity: sensor.entity_id } : {};
  }

  protected resolveConfig(raw: unknown): ResolvedClimateCard {
    return resolveClimateCard(raw);
  }

  protected watched(config: ResolvedClimateCard): string[] {
    return config.entity ? [config.entity] : [];
  }

  protected head(config: ResolvedClimateCard, hass: HomeAssistant): FocusHead {
    const kind = config.kind ?? kindOfSensor(hass, config.entity);
    const state = config.entity ? hass.states[config.entity] : undefined;
    const value = parseNumericState(state);
    const unit = state?.attributes.unit_of_measurement as string | undefined;
    const color: Rgb = value === undefined ? [120, 144, 156] : climateColor(kind, value);
    const digits = kind === 'temperature' ? 1 : 0;
    return {
      icon: config.icon ?? (state?.attributes.icon as string | undefined) ?? ICONS[kind],
      color,
      title:
        config.name ??
        (state?.attributes.friendly_name as string | undefined) ??
        config.entity ??
        '',
      sub:
        value === undefined
          ? state?.state
          : `${formatNumber(hass, value, digits)}${unit ? `\u00a0${unit}` : ''}`,
    };
  }

  protected renderBody(_config: ResolvedClimateCard, hass: HomeAssistant): TemplateResult {
    return html`<div class="message">${localize(hass, 'focus_climate_missing')}</div>`;
  }

  /** The chart is the card: its own panel carries the name, the value and its trend. */
  protected override render() {
    const config = this._config;
    const hass = this.hass;
    if (!config || !hass) return nothing;
    if (!config.entity || !hass.states[config.entity]) return super.render();
    return html`<ha-card class="bare">
      <vivid-climate-chart
        .hass=${hass}
        .entityId=${config.entity}
        .kind=${config.kind ?? kindOfSensor(hass, config.entity)}
        .comfort=${config.comfort}
        .range=${config.range}
        .heading=${config.name}
      ></vivid-climate-chart>
    </ha-card>`;
  }
}

defineElement(CLIMATE_CARD, VividClimateCard);

registerCard({
  type: CLIMATE_CARD,
  name: 'Vivid Climate',
  description: 'One temperature, humidity, pressure or CO₂ sensor and its history.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}/blob/main/docs/cards/climate.md`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-climate-card': VividClimateCard;
  }
}
