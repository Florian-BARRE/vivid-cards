import { LitElement, css, html, nothing, unsafeCSS, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { haptic, pressButton, selectOption, setNumber } from '../../core/actions';
import { climateColor, climateLineColor, type ClimateKind } from '../../core/climate';
import { glowShadow, glowSize, tintTone } from '../../core/glow';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { formatDuration, localeOf, localize, type StringKey } from '../../i18n';
import { buttonReset, tokens } from '../../components/shared-styles';
import '../../components/vivid-climate-chart';
import '../../components/vivid-range-slider';
import type { RangeThumb } from '../../components/vivid-range-slider';
import '../hyperhdr/vivid-hyperhdr-slider';
import { AIR_TABS, type AirTab, type EntityKey, type ResolvedAirStationConfig } from './config';
import {
  CUSTOM_EFFECT,
  STATION_PAGES,
  condensationRisk,
  type AirStationModel,
  type NumberSetting,
  type StationPage,
} from './model';
import {
  ADVICE_TEXT,
  AMBER,
  CO2_TEXT,
  COMFORT_TEXT,
  EFFECT_SWATCH,
  GREEN,
  ALERT_RGB,
  PAGE_TEXT,
  effectName,
  fixed,
  lineColor,
  lineIcon,
  rgbCss,
  statusLine,
} from './view';

const TAB_INFO: Record<AirTab, { icon: string; label: StringKey }> = {
  air: { icon: 'mdi:molecule-co2', label: 'air_tab_air' },
  frame: { icon: 'mdi:led-strip-variant', label: 'air_tab_frame' },
  screen: { icon: 'mdi:monitor', label: 'air_tab_screen' },
  settings: { icon: 'mdi:tune-variant', label: 'air_tab_settings' },
};

const PAGE_BUTTONS: Record<Exclude<StationPage, 'boot'>, EntityKey> = {
  data: 'pageData',
  co2: 'pageCo2',
  temp: 'pageTemperature',
  hum: 'pageHumidity',
  config: 'pageConfig',
};
const PAGE_ICONS: Record<Exclude<StationPage, 'boot'>, string> = {
  data: 'mdi:view-dashboard-outline',
  co2: 'mdi:molecule-co2',
  temp: 'mdi:thermometer',
  hum: 'mdi:water-percent',
  config: 'mdi:information-outline',
};
const PAGE_CHIPS: Record<Exclude<StationPage, 'boot'>, StringKey> = {
  data: 'air_chip_data',
  co2: 'air_chip_co2',
  temp: 'air_chip_temp',
  hum: 'air_chip_hum',
  config: 'air_chip_config',
};

type Measure = 'co2' | 'temperature' | 'humidity';
const MEASURES: Measure[] = ['co2', 'temperature', 'humidity'];
const ARM_MS = 3000;

/** Colors of the CO₂ levels on the threshold slider (the frame's comet colors). */
const LEVEL_CSS = ['#00c864', '#9bd600', '#ff8c00', '#ff3c00', '#d81b60'];

/**
 * Details of the air station, in four tabs: the air (each reading and its
 * history), the LED frame, the screen, and the settings (thresholds, comfort
 * ranges, night, device). Every control writes the station's own entity.
 */
export class VividAirStationDetails extends LitElement {
  static override properties = {
    hass: { attribute: false },
    model: { attribute: false },
    config: { attribute: false },
    heading: {},
    tab: { state: true },
    measure: { state: true },
    armed: { state: true },
  };

  declare hass?: HomeAssistant;
  declare model?: AirStationModel;
  declare config?: ResolvedAirStationConfig;
  declare heading?: string;
  declare tab?: AirTab;
  /** The reading charted in the air tab. */
  declare measure: Measure;
  /** Action waiting for its second tap. */
  declare armed?: string;

  private armTimer?: number;

  constructor() {
    super();
    this.measure = 'co2';
  }

  static override styles = [
    tokens,
    buttonReset,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 12px;
        --surface: var(--vivid-layer-1);
        --inner: var(--vivid-layer-2);
      }
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 4px;
      }
      .disc {
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${unsafeCSS(glowSize(44))};
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--disc-bg, var(--surface));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
      }
      .disc ha-icon {
        --mdc-icon-size: 24px;
        display: inline-flex;
      }
      .names {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-width: 0;
      }
      .title {
        font-size: 18px;
        font-weight: 600;
      }
      .sub {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .sub.alarm {
        color: var(--error-color, #ef5350);
        font-weight: 600;
      }
      .tabs {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 4px;
      }
      .tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 7px 2px;
        border-radius: 14px;
        background: var(--surface);
        color: var(--secondary-text-color);
        font-size: 12px;
        font-weight: 500;
        text-align: center;
      }
      .tab ha-icon {
        --mdc-icon-size: 18px;
      }
      .tab[aria-selected='true'] {
        background: rgba(var(--vivid-rgb-text), 0.14);
        color: var(--primary-text-color);
        font-weight: 600;
      }
      .pane {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .label {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 8px;
        margin-top: 4px;
        padding: 0 4px;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--secondary-text-color);
      }
      .label em {
        font-style: normal;
        font-weight: 500;
        letter-spacing: 0;
        text-transform: none;
      }
      .hint {
        margin: 0;
        padding: 0 4px;
        font-size: 12px;
        line-height: 1.4;
        color: var(--secondary-text-color);
      }
      .alarm {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 16px;
        background: rgba(239, 83, 80, 0.14);
        font-size: 13px;
      }
      .alarm ha-icon {
        color: var(--error-color, #ef5350);
        --mdc-icon-size: 20px;
      }
      /* Air: one tile per reading, the picked one charted below. */
      .measures {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px;
      }
      .measure {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        padding: 10px;
        border-radius: 16px;
        background: var(--surface);
        border: 1.5px solid transparent;
        text-align: left;
      }
      .measure[aria-pressed='true'] {
        border-color: rgba(var(--m-rgb), 0.8);
        background: color-mix(in srgb, rgb(var(--m-rgb)) 10%, var(--surface));
      }
      .measure .ml {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11.5px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .measure .ml ha-icon {
        --mdc-icon-size: 14px;
        color: rgb(var(--m-rgb));
      }
      .measure .mv {
        font-size: 24px;
        font-weight: 700;
        line-height: 1.05;
        font-variant-numeric: tabular-nums;
        color: rgb(var(--m-rgb));
        white-space: nowrap;
      }
      .measure .mv small {
        margin-left: 2px;
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .measure .mw {
        font-size: 12px;
        font-weight: 700;
        color: rgb(var(--w-rgb));
      }
      .measure.alarmed {
        box-shadow: inset 0 0 0 1.5px var(--error-color, #ef5350);
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
        padding: 5px 10px 5px 6px;
        box-sizing: border-box;
        border-radius: 16px;
        background: var(--surface);
        font-size: 13.5px;
      }
      .row .icon {
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${unsafeCSS(glowSize(32))};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--disc-bg, var(--inner));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
      }
      .row .icon ha-icon {
        --mdc-icon-size: 17px;
      }
      .row .text {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-width: 0;
      }
      .row .text small {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .row b {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .switch {
        position: relative;
        flex: none;
        width: 40px;
        height: 24px;
        border-radius: 12px;
        background: rgba(var(--vivid-rgb-text), 0.18);
        transition: background-color 0.2s ease;
      }
      .switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-text-color);
        opacity: 0.85;
        transition: transform 0.2s ease;
      }
      .switch[aria-checked='true'] {
        background: var(--success-color, #66bb6a);
      }
      .switch[aria-checked='true']::after {
        transform: translateX(16px);
        background: #fff;
        opacity: 1;
      }
      .switch:disabled,
      .btn:disabled,
      .chip:disabled,
      .fx:disabled {
        opacity: 0.45;
        cursor: default;
      }
      /* Frame */
      .strip {
        height: 14px;
        border-radius: 7px;
        background: repeating-linear-gradient(90deg, var(--strip) 0 8px, transparent 8px 12px);
        box-shadow: 0 0 calc(14px * var(--vivid-glow, 1)) var(--strip-glow, transparent);
      }
      .strip.off {
        --strip: rgba(var(--vivid-rgb-text), 0.12);
      }
      .strip.rainbow {
        background:
          repeating-linear-gradient(90deg, transparent 0 8px, var(--surface) 8px 12px),
          linear-gradient(90deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
      }
      .strip.strobe {
        animation: strobe 0.26s steps(1) infinite;
        animation-play-state: var(--vivid-glow-play, running);
      }
      @keyframes strobe {
        50% {
          opacity: 0.15;
        }
      }
      .card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border-radius: 16px;
        background: var(--surface);
      }
      .card .top {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 13px;
      }
      .card .top b {
        font-variant-numeric: tabular-nums;
      }
      .fxs {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 6px;
      }
      .fx {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 9px 2px 8px;
        border-radius: 12px;
        background: var(--surface);
        border: 1.5px solid transparent;
        font-size: 11.5px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .fx span {
        width: 44px;
        height: 10px;
        border-radius: 5px;
      }
      .fx[aria-pressed='true'] {
        border-color: var(--primary-text-color);
        color: var(--primary-text-color);
      }
      .fxs.following .fx {
        opacity: 0.6;
      }
      .seg {
        display: flex;
        gap: 4px;
        padding: 3px;
        border-radius: 14px;
        background: var(--surface);
      }
      .seg button {
        flex: 1;
        padding: 8px 0;
        border-radius: 11px;
        font-size: 12.5px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .seg button[aria-pressed='true'] {
        background: var(--primary-text-color);
        color: var(--primary-background-color, #111);
      }
      .sliders {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      /* Screen */
      .screenbox {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 12px;
        border-radius: 16px;
        background: var(--surface);
      }
      .screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        width: 180px;
        height: 180px;
        box-sizing: border-box;
        border-radius: 14px;
        background: #000;
        border: 6px solid #2a2a2a;
        color: #8c8ca5;
        text-align: center;
      }
      .screen.dark {
        background: #0b0b0b;
      }
      .screen .st {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      .screen .sv {
        font-size: 44px;
        font-weight: 700;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }
      .screen .sw {
        font-size: 16px;
        font-weight: 700;
      }
      .screen .sl {
        font-size: 11px;
      }
      .screen .rows {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
        padding: 0 14px;
        box-sizing: border-box;
      }
      .screen .rows div {
        display: flex;
        justify-content: space-between;
        font-size: 15px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
      .screen .rows span {
        font-size: 11px;
        font-weight: 600;
        color: #8c8ca5;
      }
      .round {
        display: grid;
        place-items: center;
        flex: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--inner);
        color: var(--primary-text-color);
      }
      .round ha-icon {
        --mdc-icon-size: 22px;
      }
      .chips {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 6px;
      }
      .chip {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 8px 0 7px;
        border-radius: 14px;
        background: var(--surface);
        font-size: 11.5px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .chip ha-icon {
        --mdc-icon-size: 18px;
      }
      .chip[aria-pressed='true'] {
        background: color-mix(in srgb, rgb(var(--chip-rgb)) 22%, var(--surface));
        color: rgb(var(--chip-rgb));
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 40px;
        padding: 0 14px;
        border-radius: 20px;
        background: var(--inner);
        font-size: 13.5px;
        font-weight: 600;
      }
      .btn ha-icon {
        --mdc-icon-size: 18px;
      }
      .btn.armed {
        background: var(--error-color, #ef5350);
        color: #fff;
      }
      @media (prefers-reduced-motion: reduce) {
        .strip.strobe {
          animation: none;
        }
      }
    `,
  ];

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.armTimer);
  }

  /* --------------------------------- helpers -------------------------------- */

  private entity(key: EntityKey): string {
    return this.config?.entities[key] ?? '';
  }

  private get disabled(): boolean {
    return !this.model?.online;
  }

  private press(key: EntityKey): void {
    if (!this.hass) return;
    haptic(this, 'light');
    void pressButton(this.hass, this.entity(key));
  }

  private switchTo(key: EntityKey, on: boolean): Promise<unknown> {
    if (!this.hass) return Promise.resolve();
    haptic(this, 'light');
    return this.hass.callService(
      'switch',
      on ? 'turn_on' : 'turn_off',
      {},
      { entity_id: this.entity(key) },
    );
  }

  private setValue(setting: NumberSetting, value: number): void {
    if (!this.hass) return;
    const stepped = Math.round(value / setting.step) * setting.step;
    const next = Math.min(Math.max(stepped, setting.min), setting.max);
    void setNumber(this.hass, setting.entityId, Math.round(next * 1000) / 1000);
  }

  /** First tap arms `key`, the second (within 3 s) runs `run`. */
  private confirm(key: string, run: () => void): void {
    if (this.armed === key) {
      window.clearTimeout(this.armTimer);
      this.armed = undefined;
      haptic(this, 'medium');
      run();
      return;
    }
    haptic(this, 'warning');
    this.armed = key;
    window.clearTimeout(this.armTimer);
    this.armTimer = window.setTimeout(() => {
      this.armed = undefined;
    }, ARM_MS);
  }

  /** Picking an effect stops following the pages: the station shows it right away. */
  private async pickEffect(effect: string): Promise<void> {
    const hass = this.hass;
    const model = this.model;
    if (!hass || !model) return;
    haptic(this, 'light');
    await selectOption(hass, [this.entity('effect')], effect);
    if (model.ledSync) await this.switchTo('ledSync', false);
  }

  private fx(value: number | undefined, digits = 0): string {
    return value === undefined ? '—' : fixed(this.hass, value, digits);
  }

  private icon(name: string, rgb?: Rgb, level = 0.8): TemplateResult {
    const tone = rgb ? tintTone(rgb, level) : undefined;
    return html`<span
      class="icon"
      style=${styleMap({
        '--disc-bg': tone?.background,
        '--disc-shadow': tone?.shadow,
        '--disc-color': tone?.iconColor,
      })}
      ><ha-icon .icon=${name}></ha-icon
    ></span>`;
  }

  private switchRow(
    icon: string,
    label: string,
    key: EntityKey,
    on: boolean | undefined,
    sub?: string,
  ): TemplateResult {
    return html`<div class="row">
      ${this.icon(icon, on ? GREEN : undefined, 0.6)}
      <span class="text"><span>${label}</span>${sub ? html`<small>${sub}</small>` : nothing}</span>
      <button
        type="button"
        class="reset switch"
        role="switch"
        aria-label=${label}
        aria-checked=${on ? 'true' : 'false'}
        ?disabled=${this.disabled || on === undefined}
        @click=${() => void this.switchTo(key, !on)}
      ></button>
    </div>`;
  }

  private slider(
    setting: NumberSetting,
    label: string,
    options: { unit?: string; digits?: number; color?: string } = {},
  ): TemplateResult {
    return html`<vivid-hyperhdr-slider
      .value=${setting.value}
      .min=${setting.min}
      .max=${setting.max}
      .step=${setting.step}
      .label=${label}
      .unit=${options.unit ?? ''}
      .digits=${options.digits ?? 0}
      .color=${options.color}
      ?disabled=${this.disabled || setting.value === undefined}
      @vivid-slider-change=${(event: CustomEvent<{ value: number }>) =>
        this.setValue(setting, event.detail.value)}
    ></vivid-hyperhdr-slider>`;
  }

  /* ---------------------------------- head ---------------------------------- */

  private renderHead(model: AirStationModel): TemplateResult {
    const rgb = lineColor(model);
    const lit = rgb && model.power;
    const status = statusLine(this.hass, model);
    return html`<div class="head">
      <span
        class="disc"
        style=${styleMap(
          lit
            ? {
                '--disc-bg': rgbCss(rgb),
                '--disc-shadow': glowShadow([rgb], 0.8),
                '--disc-color': '#fff',
              }
            : {},
        )}
        ><ha-icon .icon=${lineIcon(model)}></ha-icon
      ></span>
      <span class="names">
        <span class="title">${this.heading ?? ''}</span>
        <span class=${classMap({ sub: true, alarm: status.tone === 'alarm' })}>${status.text}</span>
      </span>
    </div>`;
  }

  private renderTabs(current: AirTab): TemplateResult {
    return html`<div class="tabs" role="tablist">
      ${AIR_TABS.map(
        (tab) =>
          html`<button
            type="button"
            class="reset tab"
            role="tab"
            aria-selected=${current === tab ? 'true' : 'false'}
            @click=${() => {
              this.tab = tab;
            }}
          >
            <ha-icon .icon=${TAB_INFO[tab].icon}></ha-icon>${localize(
              this.hass,
              TAB_INFO[tab].label,
            )}
          </button>`,
      )}
    </div>`;
  }

  /* ----------------------------------- air ---------------------------------- */

  private measureView(model: AirStationModel, measure: Measure) {
    const hass = this.hass;
    if (measure === 'co2') {
      const value = model.co2;
      return {
        icon: 'mdi:molecule-co2',
        label: localize(hass, 'air_co2'),
        value: this.fx(value),
        unit: 'ppm',
        rgb: value === undefined ? undefined : climateColor('co2', value),
        word: model.co2Level ? localize(hass, CO2_TEXT[model.co2Level]) : '—',
        wordRgb:
          model.co2Level === 'critical' || model.co2Level === 'bad'
            ? ALERT_RGB
            : model.co2Level === 'fair'
              ? AMBER
              : GREEN,
        alarm: model.alert,
      };
    }
    const temperature = measure === 'temperature';
    const value = temperature ? model.temperature : model.humidity;
    const side = temperature ? model.temperatureSide : model.humiditySide;
    const wordKey: StringKey =
      side === undefined
        ? 'unavailable'
        : side === 0
          ? 'air_in_comfort'
          : temperature
            ? side < 0
              ? 'air_low_temp'
              : 'air_high_temp'
            : side < 0
              ? 'air_low_hum'
              : 'air_high_hum';
    return {
      icon: temperature ? 'mdi:thermometer' : 'mdi:water-percent',
      label: localize(hass, temperature ? 'air_temperature' : 'air_humidity'),
      value: this.fx(value, temperature ? 1 : 0),
      unit: temperature ? '°C' : '%',
      rgb:
        value === undefined
          ? undefined
          : temperature
            ? climateColor('temperature', value)
            : climateLineColor('humidity', value),
      word: side === undefined ? '—' : localize(hass, wordKey),
      wordRgb: side === 0 ? GREEN : AMBER,
      alarm: false,
    };
  }

  private renderAir(model: AirStationModel): TemplateResult {
    const hass = this.hass;
    const kind: ClimateKind = this.measure;
    const comfort =
      this.measure === 'co2'
        ? { low: 400, high: model.thresholds.good.value ?? 800 }
        : this.measure === 'temperature'
          ? {
              low: model.temperatureRange.min.value ?? 18,
              high: model.temperatureRange.max.value ?? 24,
            }
          : {
              low: model.humidityRange.min.value ?? 40,
              high: model.humidityRange.max.value ?? 60,
            };
    const entity =
      this.measure === 'co2'
        ? this.entity('co2')
        : this.measure === 'temperature'
          ? this.entity('temperature')
          : this.entity('humidity');
    const risk = condensationRisk(model.temperature, model.dewPoint);
    const riskRgb = risk === 'high' ? ALERT_RGB : risk === 'moderate' ? AMBER : GREEN;
    return html`<div class="pane">
      ${
        model.alert
          ? html`<div class="alarm">
              <ha-icon icon="mdi:window-open-variant"></ha-icon>
              <span
                ><b
                  >${localize(hass, model.advice ? ADVICE_TEXT[model.advice] : 'air_advice_now')}</b
                >
                ·
                ${localize(hass, 'air_alert', { ppm: this.fx(model.thresholds.alert.value) })}</span
              >
            </div>`
          : nothing
      }
      <div class="measures">
        ${MEASURES.map((measure) => {
          const view = this.measureView(model, measure);
          return html`<button
            type="button"
            class=${classMap({ reset: true, measure: true, alarmed: view.alarm })}
            aria-pressed=${this.measure === measure ? 'true' : 'false'}
            style=${styleMap({
              '--m-rgb': (view.rgb ?? [158, 158, 158]).join(', '),
              '--w-rgb': view.wordRgb.join(', '),
            })}
            @click=${() => {
              this.measure = measure;
            }}
          >
            <span class="ml"><ha-icon .icon=${view.icon}></ha-icon>${view.label}</span>
            <span class="mv">${view.value}<small>${view.unit}</small></span>
            <span class="mw">${view.word}</span>
          </button>`;
        })}
      </div>
      <vivid-climate-chart
        .hass=${hass}
        .entityId=${entity}
        .kind=${kind}
        .comfort=${comfort}
        .range=${'24h'}
        .heading=${this.heading}
      ></vivid-climate-chart>
      <div class="row">
        ${this.icon('mdi:water-thermometer', [38, 198, 218], 0.5)}
        <span class="text">${localize(hass, 'air_dew_point')}</span>
        <b>${model.dewPoint === undefined ? '—' : `${this.fx(model.dewPoint, 1)}\u00a0°C`}</b>
      </div>
      <div class="row">
        ${this.icon('mdi:water-alert-outline', risk ? riskRgb : undefined, 0.5)}
        <span class="text">${localize(hass, 'air_condensation')}</span>
        <b style=${styleMap({ color: risk ? rgbCss(riskRgb) : undefined })}
          >${risk ? localize(hass, `air_risk_${risk}`) : '—'}</b
        >
      </div>
      <div class="row">
        ${this.icon('mdi:weather-windy', model.comfort ? GREEN : undefined, 0.4)}
        <span class="text"
          >${localize(hass, 'air_advice')}<small
            >${model.comfort ? localize(hass, COMFORT_TEXT[model.comfort]) : ''}</small
          ></span
        >
        <b>${model.advice ? localize(hass, ADVICE_TEXT[model.advice]) : '—'}</b>
      </div>
    </div>`;
  }

  /* ---------------------------------- frame --------------------------------- */

  private renderFrame(model: AirStationModel): TemplateResult {
    const hass = this.hass;
    const frame = model.frame;
    const lit = frame.rgb !== undefined && (model.ledBrightness ?? 1) > 0;
    const following = model.ledSync === true;
    const auto = model.autoBrightness === true;
    const custom = model.effect === CUSTOM_EFFECT && !following;
    const customRgb: Rgb = [
      model.color.red.value ?? 0,
      model.color.green.value ?? 0,
      model.color.blue.value ?? 0,
    ];
    return html`<div class="pane">
      <div class="card">
        <div
          class=${classMap({
            strip: true,
            off: !lit,
            rainbow: lit && frame.rainbow,
            strobe: lit && frame.strobe,
          })}
          style=${styleMap(
            lit && frame.rgb
              ? { '--strip': rgbCss(frame.rgb, 0.95), '--strip-glow': rgbCss(frame.rgb, 0.45) }
              : {},
          )}
        ></div>
        <div class="top">
          <span
            >${frame.effect ? effectName(hass, frame.effect) : localize(hass, 'air_frame_off')}</span
          >
          <b
            >${model.ledBrightness === undefined ? '' : `${Math.round(model.ledBrightness)}/255`}</b
          >
        </div>
      </div>
      ${this.switchRow(
        'mdi:link-variant',
        localize(hass, 'air_sync'),
        'ledSync',
        model.ledSync,
        localize(hass, 'air_sync_hint', { ppm: this.fx(model.thresholds.alert.value) }),
      )}
      <div class="label">
        ${localize(hass, 'air_effect')}${
          following ? html`<em>${localize(hass, 'air_effect_hint')}</em>` : nothing
        }
      </div>
      <div class=${classMap({ fxs: true, following })}>
        ${model.effects.map(
          (effect) =>
            html`<button
              type="button"
              class="reset fx"
              aria-pressed=${!following && model.effect === effect ? 'true' : 'false'}
              ?disabled=${this.disabled}
              @click=${() => void this.pickEffect(effect)}
            >
              <span
                style=${styleMap({
                  background:
                    effect === CUSTOM_EFFECT
                      ? rgbCss(customRgb)
                      : (EFFECT_SWATCH[effect] ?? '#666'),
                })}
              ></span
              >${effectName(hass, effect)}
            </button>`,
        )}
      </div>
      ${
        custom
          ? html`<div class="label">${localize(hass, 'air_custom_color')}</div>
              <div class="sliders">
                ${this.slider(model.color.red, localize(hass, 'air_red'), { color: '#ef5350' })}
                ${this.slider(model.color.green, localize(hass, 'air_green'), { color: '#66bb6a' })}
                ${this.slider(model.color.blue, localize(hass, 'air_blue'), { color: '#42a5f5' })}
              </div>`
          : nothing
      }
      <div class="label">${localize(hass, 'air_brightness')}</div>
      <div class="seg" role="group" aria-label=${localize(hass, 'air_brightness')}>
        <button
          type="button"
          class="reset"
          aria-pressed=${auto ? 'true' : 'false'}
          ?disabled=${this.disabled || model.autoBrightness === undefined}
          @click=${() => (auto ? undefined : void this.switchTo('autoBrightness', true))}
        >
          ${localize(hass, 'air_auto')}
        </button>
        <button
          type="button"
          class="reset"
          aria-pressed=${auto ? 'false' : 'true'}
          ?disabled=${this.disabled || model.autoBrightness === undefined}
          @click=${() => (auto ? void this.switchTo('autoBrightness', false) : undefined)}
        >
          ${localize(hass, 'air_manual')}
        </button>
      </div>
      <div class="sliders">
        ${
          auto
            ? html`${this.slider(model.brightness.min, localize(hass, 'air_min'))}
              ${this.slider(model.brightness.max, localize(hass, 'air_max'))}
              ${this.slider(model.brightness.night, localize(hass, 'air_night_level'))}`
            : this.slider(model.brightness.manual, localize(hass, 'air_brightness'))
        }
      </div>
      ${
        auto
          ? html`<p class="hint">
              ${localize(hass, 'air_room_light', {
                ldr: this.fx(model.ldr),
                thr: this.fx(model.nightThreshold.value),
              })}
            </p>`
          : nothing
      }
    </div>`;
  }

  /* --------------------------------- screen --------------------------------- */

  private renderScreenPreview(model: AirStationModel): TemplateResult {
    const hass = this.hass;
    const page = model.page;
    const off = !model.online || !model.power || model.backlight === false;
    if (off || !page) return html`<div class="screen dark"></div>`;
    const color = (rgb: Rgb | undefined) => (rgb ? rgbCss(rgb) : '#fff');
    const title = localize(hass, PAGE_TEXT[page]);
    if (page === 'co2' && model.co2 !== undefined) {
      const rgb =
        model.co2Level === 'critical' || model.co2Level === 'bad'
          ? [255, 70, 70]
          : model.co2Level === 'fair'
            ? [255, 165, 0]
            : [60, 220, 90];
      return html`<div class="screen">
        <span class="st">${title}</span>
        <span class="sv" style=${styleMap({ color: color(rgb as Rgb) })}
          >${this.fx(model.co2)}</span
        >
        <span class="sl">ppm CO₂</span>
        <span class="sw" style=${styleMap({ color: color(rgb as Rgb) })}
          >${model.co2Level ? localize(hass, CO2_TEXT[model.co2Level]) : ''}</span
        >
      </div>`;
    }
    if (page === 'temp' || page === 'hum') {
      const temperature = page === 'temp';
      const value = temperature ? model.temperature : model.humidity;
      const rgb =
        value === undefined
          ? undefined
          : temperature
            ? climateColor('temperature', value)
            : climateLineColor('humidity', value);
      return html`<div class="screen">
        <span class="st">${title}</span>
        <span class="sv" style=${styleMap({ color: color(rgb) })}>${this.fx(value, 1)}</span>
        <span class="sl">${temperature ? '°C' : '%'}</span>
      </div>`;
    }
    if (page === 'config') {
      return html`<div class="screen">
        <span class="st">${title}</span>
        <div class="rows">
          <div><span>IP</span>${model.ip ?? '—'}</div>
          <div>
            <span>Wi-Fi</span>${model.rssi === undefined ? '—' : `${this.fx(model.rssi)} dBm`}
          </div>
          <div><span>LDR</span>${this.fx(model.ldr)}</div>
        </div>
      </div>`;
    }
    return html`<div class="screen">
      <span class="st">${title}</span>
      <div class="rows">
        <div><span>CO₂</span>${this.fx(model.co2)}</div>
        <div><span>°C</span>${this.fx(model.temperature, 1)}</div>
        <div><span>%</span>${this.fx(model.humidity)}</div>
      </div>
    </div>`;
  }

  private renderScreen(model: AirStationModel): TemplateResult {
    const hass = this.hass;
    const rgb = lineColor(model) ?? GREEN;
    return html`<div class="pane">
      <div class="screenbox">
        <button
          type="button"
          class="reset round"
          aria-label=${localize(hass, 'air_previous')}
          title=${localize(hass, 'air_previous')}
          ?disabled=${this.disabled}
          @click=${() => this.press('pagePrevious')}
        >
          <ha-icon icon="mdi:chevron-left"></ha-icon>
        </button>
        ${this.renderScreenPreview(model)}
        <button
          type="button"
          class="reset round"
          aria-label=${localize(hass, 'air_next')}
          title=${localize(hass, 'air_next')}
          ?disabled=${this.disabled}
          @click=${() => this.press('pageNext')}
        >
          <ha-icon icon="mdi:chevron-right"></ha-icon>
        </button>
      </div>
      <p class="hint">${localize(hass, 'air_screen_live')}</p>
      <div class="label">${localize(hass, 'air_show')}</div>
      <div class="chips">
        ${STATION_PAGES.map(
          (page) =>
            html`<button
              type="button"
              class="reset chip"
              aria-pressed=${model.page === page ? 'true' : 'false'}
              style=${styleMap({ '--chip-rgb': rgb.join(', ') })}
              ?disabled=${this.disabled}
              @click=${() => this.press(PAGE_BUTTONS[page])}
            >
              <ha-icon .icon=${PAGE_ICONS[page]}></ha-icon>${localize(hass, PAGE_CHIPS[page])}
            </button>`,
        )}
      </div>
      ${this.switchRow(
        'mdi:play-circle-outline',
        localize(hass, 'air_cycle'),
        'autoCycle',
        model.autoCycle,
      )}
      ${
        model.autoCycle
          ? this.slider(model.pageDuration, localize(hass, 'air_cycle_duration'), { unit: 's' })
          : nothing
      }
      <p class="hint">${localize(hass, 'air_cycle_hint')}</p>
      ${this.switchRow(
        'mdi:brightness-6',
        localize(hass, 'air_backlight'),
        'backlight',
        model.backlight,
      )}
    </div>`;
  }

  /* -------------------------------- settings -------------------------------- */

  private onRange(settings: NumberSetting[], event: CustomEvent<{ index: number; value: number }>) {
    const setting = settings[event.detail.index];
    if (setting) this.setValue(setting, event.detail.value);
  }

  /** The CO₂ track: one color per level, cut at the thresholds. */
  private co2Track(values: number[], min: number, max: number): string {
    const at = (value: number) => `${(((value - min) / (max - min)) * 100).toFixed(1)}%`;
    const stops: string[] = [];
    let from = '0%';
    LEVEL_CSS.forEach((color, index) => {
      const to = index < values.length ? at(values[index] ?? max) : '100%';
      stops.push(`${color} ${from} ${to}`);
      from = to;
    });
    return `linear-gradient(90deg, ${stops.join(', ')})`;
  }

  private renderSettings(model: AirStationModel): TemplateResult {
    const hass = this.hass;
    const locale = localeOf(hass);
    const t = model.thresholds;
    const co2Settings = [t.excellent, t.good, t.watch, t.alert];
    const co2Thumbs: RangeThumb[] = [
      {
        value: t.excellent.value,
        label: localize(hass, 'air_thr_excellent'),
        min: t.excellent.min,
        max: t.excellent.max,
        color: LEVEL_CSS[0],
      },
      {
        value: t.good.value,
        label: localize(hass, 'air_thr_good'),
        min: t.good.min,
        max: t.good.max,
        color: LEVEL_CSS[1],
      },
      {
        value: t.watch.value,
        label: localize(hass, 'air_thr_watch'),
        min: t.watch.min,
        max: t.watch.max,
        color: LEVEL_CSS[2],
      },
      {
        value: t.alert.value,
        label: localize(hass, 'air_thr_alert'),
        min: t.alert.min,
        max: t.alert.max,
        color: LEVEL_CSS[4],
      },
    ];
    const co2Min = Math.min(t.excellent.min, 300);
    const co2Max = Math.max(t.alert.max, 2000);
    const known = co2Settings.map((setting) => setting.value ?? co2Max);
    const tr = model.temperatureRange;
    const hr = model.humidityRange;
    const signal =
      model.rssi === undefined
        ? undefined
        : model.rssi > -60
          ? 'air_signal_good'
          : model.rssi > -75
            ? 'air_signal_fair'
            : 'air_signal_weak';
    const armed = this.armed === 'calibrate';
    return html`<div class="pane">
      <div class="label">${localize(hass, 'air_thresholds')}<em>ppm</em></div>
      <vivid-range-slider
        .thumbs=${co2Thumbs}
        .min=${co2Min}
        .max=${co2Max}
        .step=${t.alert.step || 10}
        .locale=${locale}
        .track=${this.co2Track(known, co2Min, co2Max)}
        .marker=${model.co2}
        ?disabled=${this.disabled}
        @vivid-range-change=${(event: CustomEvent<{ index: number; value: number }>) =>
          this.onRange(co2Settings, event)}
      ></vivid-range-slider>
      <p class="hint">${localize(hass, 'air_thr_hint')}</p>
      <div class="label">${localize(hass, 'air_temp_comfort')}<em>°C</em></div>
      <vivid-range-slider
        .thumbs=${[
          {
            value: tr.min.value,
            label: localize(hass, 'air_low'),
            min: tr.min.min,
            max: tr.min.max,
          },
          {
            value: tr.max.value,
            label: localize(hass, 'air_high'),
            min: tr.max.min,
            max: tr.max.max,
          },
        ]}
        .min=${Math.min(tr.min.min, 10)}
        .max=${Math.max(tr.max.max, 35)}
        .step=${tr.min.step || 0.5}
        .digits=${1}
        .unit=${'°C'}
        .locale=${locale}
        .band=${rgbCss(GREEN)}
        .marker=${model.temperature}
        ?disabled=${this.disabled}
        @vivid-range-change=${(event: CustomEvent<{ index: number; value: number }>) =>
          this.onRange([tr.min, tr.max], event)}
      ></vivid-range-slider>
      <div class="label">${localize(hass, 'air_hum_comfort')}<em>%</em></div>
      <vivid-range-slider
        .thumbs=${[
          {
            value: hr.min.value,
            label: localize(hass, 'air_low'),
            min: hr.min.min,
            max: hr.min.max,
          },
          {
            value: hr.max.value,
            label: localize(hass, 'air_high'),
            min: hr.max.min,
            max: hr.max.max,
          },
        ]}
        .min=${Math.min(hr.min.min, 10)}
        .max=${Math.max(hr.max.max, 90)}
        .step=${hr.min.step || 1}
        .unit=${'%'}
        .locale=${locale}
        .band=${rgbCss(GREEN)}
        .marker=${model.humidity}
        ?disabled=${this.disabled}
        @vivid-range-change=${(event: CustomEvent<{ index: number; value: number }>) =>
          this.onRange([hr.min, hr.max], event)}
      ></vivid-range-slider>
      <div class="label">${localize(hass, 'air_night_threshold')}</div>
      <vivid-range-slider
        .thumbs=${[{ value: model.nightThreshold.value, label: localize(hass, 'air_night_threshold') }]}
        .min=${model.nightThreshold.min}
        .max=${model.nightThreshold.max}
        .step=${model.nightThreshold.step || 10}
        .locale=${locale}
        .marker=${
          model.ldr === undefined ? undefined : Math.min(model.ldr, model.nightThreshold.max)
        }
        ?disabled=${this.disabled}
        @vivid-range-change=${(event: CustomEvent<{ index: number; value: number }>) =>
          this.onRange([model.nightThreshold], event)}
      ></vivid-range-slider>
      <p class="hint">${localize(hass, 'air_night_hint', { ldr: this.fx(model.ldr) })}</p>
      <div class="label">${localize(hass, 'device')}</div>
      <div class="row">
        ${this.icon(
          model.online ? 'mdi:check-network-outline' : 'mdi:lan-disconnect',
          model.online ? GREEN : ALERT_RGB,
          0.5,
        )}
        <span class="text">${localize(hass, model.online ? 'air_online' : 'air_offline')}</span>
        <b>${model.uptime === undefined ? '' : formatDuration(hass, model.uptime)}</b>
      </div>
      <div class="row">
        ${this.icon('mdi:wifi', signal === 'air_signal_weak' ? AMBER : undefined, 0.4)}
        <span class="text"
          >${localize(hass, 'wifi')}${model.ssid ? html`<small>${model.ssid}</small>` : nothing}</span
        >
        <b
          >${
            model.rssi === undefined
              ? '—'
              : `${this.fx(model.rssi)} dBm${signal ? ` · ${localize(hass, signal)}` : ''}`
          }</b
        >
      </div>
      <div class="row">
        ${this.icon('mdi:ip-network-outline')}
        <span class="text">${localize(hass, 'ip')}</span>
        <b>${model.ip ?? '—'}</b>
      </div>
      <button
        type="button"
        class=${classMap({ reset: true, btn: true, armed })}
        ?disabled=${this.disabled}
        @click=${() => this.confirm('calibrate', () => this.press('calibrate'))}
      >
        <ha-icon icon="mdi:molecule-co2"></ha-icon>${localize(
          hass,
          armed ? 'air_calibrate_confirm' : 'air_calibrate',
        )}
      </button>
      <p class="hint">${localize(hass, 'air_calibrate_hint')}</p>
    </div>`;
  }

  protected override render() {
    const model = this.model;
    if (!model || !this.config) return nothing;
    const tab = this.tab ?? this.config.tab;
    const panes: Record<AirTab, () => TemplateResult> = {
      air: () => this.renderAir(model),
      frame: () => this.renderFrame(model),
      screen: () => this.renderScreen(model),
      settings: () => this.renderSettings(model),
    };
    return html`${this.renderHead(model)}${this.renderTabs(tab)}${panes[tab]()}`;
  }
}

defineElement('vivid-air-station-details', VividAirStationDetails);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-air-station-details': VividAirStationDetails;
  }
}
