import { html } from 'lit';
import { airIcon, pressureIcon, type ClimateKind } from '../../core/climate';
import { rgbCss } from '../../core/color';
import type { HomeAssistant } from '../../core/hass-types';
import { fetchHistory, type HistorySeries } from '../../core/history';
import { REPOSITORY_URL, defineElement, registerBadge } from '../../core/register';
import { localize, type StringKey } from '../../i18n';
import { AGGREGATES } from '../base/config';
import { VividBadge, type BadgeView } from '../base/vivid-badge';
import { badgeEditor, type BadgeEditorSpec, type EditorField } from '../base/vivid-badge-editor';
import { CLIMATE_RANGES } from '../../components/vivid-climate-chart';
import type { EditorStringKey } from '../../i18n/editor';
import './vivid-climate-details';
import {
  CLIMATE_BADGES,
  DEVICE_CLASSES,
  DOMAINS,
  HISTORY_REFRESH_MS,
  buildClimateModel,
  climateDigits,
  climateStatus,
  climateTone,
  fromScale,
  historyNeeds,
  resolveClimateBadge,
  type ClimateModel,
  type ClimateStatus,
  type ResolvedClimateBadge,
} from './model';

/** Icons while nothing can be read. */
const RESTING_ICONS: Record<ClimateKind, string> = {
  temperature: 'mdi:thermometer',
  humidity: 'mdi:water-percent',
  pressure: 'mdi:gauge',
  co2: 'mdi:molecule-co2',
};

/** Extra history fetched before the trend window, so its start has a known value. */
const HISTORY_MARGIN_MS = 10 * 60_000;

/** A number with exactly `digits` decimals, in the user's language. */
function fixed(hass: HomeAssistant | undefined, value: number, digits: number): string {
  try {
    return new Intl.NumberFormat(hass?.locale?.language ?? hass?.language ?? 'en', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return value.toFixed(digits);
  }
}

/**
 * Climate: temperature, humidity, pressure or air quality (CO₂). The icon
 * disc takes the exact color of the value on its scale, with a halo that
 * grows outside the comfort range; small arrows tell the trend. Several
 * sensors show what asks for action (the range of the rooms, the most humid
 * room, the worst air). Tap for the history.
 */
export class VividClimateBadge extends VividBadge<ResolvedClimateBadge> {
  protected kind: ClimateKind = 'temperature';
  private model?: ClimateModel;
  private history: HistorySeries = {};
  private historyKey?: string;
  private historyTimer?: number;
  private session = 0;

  static getConfigElement(): HTMLElement {
    return badgeEditor(climateEditor('temperature'));
  }

  static getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    return climateStub(hass, 'temperature');
  }

  protected resolveConfig(raw: unknown): ResolvedClimateBadge {
    return resolveClimateBadge(raw, this.kind);
  }

  /* --------------------------------- history -------------------------------- */

  override connectedCallback(): void {
    super.connectedCallback();
    // Fetched again on the next render, then every ten minutes.
    this.historyKey = undefined;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopHistory();
  }

  private stopHistory(): void {
    if (this.historyTimer !== undefined) window.clearInterval(this.historyTimer);
    this.historyTimer = undefined;
  }

  /** Starts fetching the little history the trends need, once per set of sensors. */
  private ensureHistory(): void {
    const model = this.model;
    if (!this.hass || !this._config || !model || !this.isConnected) return;
    const needs = this._config.trend ? historyNeeds(model) : { ids: [], window: 0 };
    const key = `${needs.ids.join(',')}|${needs.window}`;
    if (key === this.historyKey) return;
    this.historyKey = key;
    this.stopHistory();
    this.history = {};
    if (!needs.ids.length) return;
    const load = async () => {
      const hass = this.hass;
      if (!hass) return;
      const now = Date.now();
      try {
        this.history = await fetchHistory(
          hass,
          needs.ids,
          now - needs.window - HISTORY_MARGIN_MS,
          now,
        );
      } catch {
        this.history = {};
      }
      this.requestUpdate();
    };
    void load();
    this.historyTimer = window.setInterval(() => void load(), HISTORY_REFRESH_MS);
  }

  protected override updated(): void {
    super.updated();
    this.ensureHistory();
  }

  /* ---------------------------------- view ---------------------------------- */

  /** A value in scale units, written in the badge's unit ("21,4", "1 008"). */
  private number(scaled: number): string {
    const model = this.model;
    if (!model) return '';
    const value = fromScale(model.kind, scaled, model.unit);
    return fixed(this.hass, value, climateDigits(model.kind, model.unit));
  }

  /** Short text for the badge: "21,4°", "58 %", "1 008 hPa", "780 ppm". */
  private short(scaled: number): string {
    const model = this.model;
    if (!model) return '';
    if (model.kind === 'temperature') return `${this.number(scaled)}${this.degree()}`;
    return `${this.number(scaled)} ${model.unit}`;
  }

  /** The short degree sign: "°" for Celsius, "°F" spelled out so Fahrenheit is never mistaken. */
  private degree(): string {
    return this.model?.unit === '°F' ? ' °F' : '°';
  }

  /** With the full unit, for tooltips and details. */
  private long(scaled: number): string {
    const model = this.model;
    if (!model) return '';
    return `${this.number(scaled)} ${model.unit}`;
  }

  private icon(model: ClimateModel, status: ClimateStatus, scaled: number): string {
    switch (model.kind) {
      case 'temperature':
        return 'mdi:thermometer';
      case 'humidity':
        return status.shower ? 'mdi:shower' : 'mdi:water-percent';
      case 'pressure':
        return pressureIcon(scaled);
      case 'co2':
        return airIcon(status.level ?? 'excellent');
    }
  }

  /** "780 ppm · Good", "1 002 hPa · falling fast". */
  private stateText(status: ClimateStatus, value: string): string {
    const parts = [value];
    if (status.level) parts.push(localize(this.hass, `air_${status.level}` as StringKey));
    if (status.shower) parts.push(localize(this.hass, 'climate_shower'));
    else if (status.dropAlert) parts.push(localize(this.hass, 'climate_pressure_drop'));
    else if (status.trend) {
      parts.push(localize(this.hass, status.trend === 'up' ? 'climate_rising' : 'climate_falling'));
    }
    return parts.join(' · ');
  }

  protected buildView(hass: HomeAssistant, config: ResolvedClimateBadge): BadgeView {
    const model = buildClimateModel(hass, config, this.history);
    this.model = model;
    const status = climateStatus(model, config);
    if (!status) {
      return {
        name: model.name,
        active: false,
        icon: config.icon ?? RESTING_ICONS[model.kind],
        state: localize(hass, 'unavailable'),
        watched: model.watched,
        unavailable: true,
      };
    }
    let text: string;
    let state: string;
    let prefix: string | undefined;
    let scaled: number;
    if (
      model.display === 'range' &&
      model.low?.scaled !== undefined &&
      model.high?.scaled !== undefined
    ) {
      const low = model.low.scaled;
      const high = model.high.scaled;
      scaled = high;
      text =
        low === high ? this.short(low) : `${this.number(low)}–${this.number(high)}${this.degree()}`;
      state =
        low === high
          ? this.long(low)
          : `${this.number(low)}–${this.number(high)} ${model.unit} · ${localize(hass, 'climate_rooms', { n: model.items.length })}`;
    } else {
      scaled = model.scaled ?? 0;
      text = this.short(scaled);
      state = this.stateText(status, this.long(scaled));
      // Several rooms: say which value the badge shows ("max 58 %"); the worst air needs no word.
      if (
        model.isGroup &&
        model.kind !== 'co2' &&
        (model.display === 'max' || model.display === 'min')
      ) {
        prefix = localize(hass, `agg_${model.display}`);
      }
    }
    const haloColor = rgbCss(status.haloColor);
    return {
      name: model.name,
      active: true,
      icon: config.icon ?? this.icon(model, status, scaled),
      text,
      prefix,
      trend: status.trend,
      tone: climateTone(status.colors, status.halo, status.haloColor),
      pulse: status.pulse ? '1.6s' : undefined,
      pulseColor: haloColor,
      state,
      watched: model.watched,
    };
  }

  /* --------------------------------- details -------------------------------- */

  protected override detailsOpened(): void {
    this.session += 1;
  }

  protected renderDetails() {
    const model = this.model;
    const config = this._config;
    if (!model || !config) return html``;
    const sources = model.items.map((item) => ({ entityId: item.entityId, name: item.name }));
    return html`<vivid-climate-details
      .hass=${this.hass}
      .kind=${model.kind}
      .sources=${sources.length ? sources : config.entity ? [{ entityId: config.entity }] : []}
      .comfort=${model.comfort}
      .range=${config.range}
      .heading=${model.name}
      .summary=${this.view?.state}
      .session=${this.session}
    ></vivid-climate-details>`;
  }
}

/** First group (else first sensor) of the badge's device classes. */
function climateStub(hass: HomeAssistant | undefined, kind: ClimateKind): Record<string, unknown> {
  const classes = DEVICE_CLASSES[kind];
  const states = Object.values(hass?.states ?? {}).filter(
    (state) =>
      state.entity_id.startsWith('sensor.') &&
      classes.includes(String(state.attributes.device_class)),
  );
  const group = states.find((state) => Array.isArray(state.attributes.entity_id));
  return { entity: (group ?? states[0])?.entity_id ?? `sensor.${kind}` };
}

export const climateEditor = (kind: ClimateKind): BadgeEditorSpec => ({
  type: `custom:${CLIMATE_BADGES[kind]}`,
  domain: DOMAINS,
  deviceClass: DEVICE_CLASSES[kind],
  fields: [
    {
      name: 'comfort',
      label: 'comfort',
      selector: { object: {} },
      helper: kind === 'co2' ? 'comfort_helper_co2' : 'comfort_helper',
    },
    {
      name: 'aggregate',
      label: 'aggregate',
      choices: { values: ['auto', ...AGGREGATES], labelPrefix: 'aggregate_' },
      default: 'auto',
      helper: 'climate_aggregate_helper',
      row: 2,
    },
    {
      name: 'range',
      label: 'climate_range',
      choices: { values: CLIMATE_RANGES, labelPrefix: 'climate_range_' },
      default: '24h',
      row: 2,
    },
    // CO₂ has no trend: nothing to fetch.
    ...(kind === 'co2'
      ? []
      : [
          {
            name: 'trend',
            label: 'climate_trend',
            selector: { boolean: {} },
            default: true,
            helper: `climate_trend_helper_${kind}` as EditorStringKey,
          } satisfies EditorField,
        ]),
  ],
  validate: (config) => void resolveClimateBadge(config, kind),
});

/** Temperature: blue when cold, yellow then orange while comfortable, red when hot. */
export class VividTemperatureBadge extends VividClimateBadge {
  protected override kind: ClimateKind = 'temperature';

  static override getConfigElement(): HTMLElement {
    return badgeEditor(climateEditor('temperature'));
  }

  static override getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    return climateStub(hass, 'temperature');
  }
}

/** Humidity: light cyan when dry to deep blue when very humid; pulses during a shower. */
export class VividHumidityBadge extends VividClimateBadge {
  protected override kind: ClimateKind = 'humidity';

  static override getConfigElement(): HTMLElement {
    return badgeEditor(climateEditor('humidity'));
  }

  static override getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    return climateStub(hass, 'humidity');
  }
}

/** Pressure: violet, the weather it suggests and its three-hour trend. */
export class VividPressureBadge extends VividClimateBadge {
  protected override kind: ClimateKind = 'pressure';

  static override getConfigElement(): HTMLElement {
    return badgeEditor(climateEditor('pressure'));
  }

  static override getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    return climateStub(hass, 'pressure');
  }
}

/** Air quality (CO₂): healthy green to toxic green, with its level in words. */
export class VividAirQualityBadge extends VividClimateBadge {
  protected override kind: ClimateKind = 'co2';

  static override getConfigElement(): HTMLElement {
    return badgeEditor(climateEditor('co2'));
  }

  static override getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    return climateStub(hass, 'co2');
  }
}

defineElement(CLIMATE_BADGES.temperature, VividTemperatureBadge);
defineElement(CLIMATE_BADGES.humidity, VividHumidityBadge);
defineElement(CLIMATE_BADGES.pressure, VividPressureBadge);
defineElement(CLIMATE_BADGES.co2, VividAirQualityBadge);

registerBadge({
  type: CLIMATE_BADGES.temperature,
  name: 'Vivid temperature badge',
  description:
    'Temperature of a room, or the range of several: the disc takes the color of the value, a halo outside the comfort range, and a trend arrow. Tap for the history.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#climate-badges`,
});
registerBadge({
  type: CLIMATE_BADGES.humidity,
  name: 'Vivid humidity badge',
  description:
    'Humidity of a room, or the most humid of several: cyan to deep blue, pulsing during a shower. Tap for the history.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#climate-badges`,
});
registerBadge({
  type: CLIMATE_BADGES.pressure,
  name: 'Vivid pressure badge',
  description:
    'Atmospheric pressure: the weather it suggests, its three-hour trend and an alert when it drops fast. Tap for the history.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#climate-badges`,
});
registerBadge({
  type: CLIMATE_BADGES.co2,
  name: 'Vivid air quality badge',
  description:
    'CO₂ of a room, or the worst of several: healthy to toxic green, with its level in words and a window when it is time to air. Tap for the history.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#climate-badges`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-temperature-badge': VividTemperatureBadge;
    'vivid-humidity-badge': VividHumidityBadge;
    'vivid-pressure-badge': VividPressureBadge;
    'vivid-air-quality-badge': VividAirQualityBadge;
  }
}
