import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import {
  fireEvent,
  haptic,
  pressButton,
  selectOption,
  setNumber,
  toggleEntity,
} from '../core/actions';
import { isAvailable } from '../core/entities';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import { formatDuration, formatNumber, localize, type StringKey } from '../i18n';
import { wifiIcon, wledHealth, type WledEntities, type WledHealth } from '../integrations/wled';
import { buttonReset, tokens } from './shared-styles';
import './vivid-select-chip';

type Tab = 'settings' | 'device';
type SelectRole = 'preset' | 'playlist' | 'palette';
type SliderRole = 'speed' | 'intensity';
type SwitchRole = 'reverse' | 'freeze' | 'nightlight' | 'syncSend' | 'syncReceive';

const SELECTS: { role: SelectRole; icon: string; label: StringKey }[] = [
  { role: 'preset', icon: 'mdi:star-outline', label: 'preset' },
  { role: 'playlist', icon: 'mdi:playlist-play', label: 'playlist' },
  { role: 'palette', icon: 'mdi:palette-outline', label: 'palette' },
];

const SLIDERS: { role: SliderRole; icon: string; label: StringKey }[] = [
  { role: 'speed', icon: 'mdi:speedometer', label: 'speed' },
  { role: 'intensity', icon: 'mdi:tune-vertical-variant', label: 'intensity' },
];

const SWITCHES: { role: SwitchRole; icon: string; label: StringKey }[] = [
  { role: 'reverse', icon: 'mdi:swap-horizontal', label: 'reverse' },
  { role: 'freeze', icon: 'mdi:snowflake', label: 'freeze' },
  { role: 'nightlight', icon: 'mdi:weather-night', label: 'nightlight' },
  { role: 'syncSend', icon: 'mdi:upload-network-outline', label: 'sync_send' },
  { role: 'syncReceive', icon: 'mdi:download-network-outline', label: 'sync_receive' },
];

const CONFIRM_MS = 3000;

/**
 * The two foldable panels of a WLED strip, opened one at a time from a pair of
 * tabs that already tell the essentials:
 * - **Settings**: preset, playlist, palette, effect speed and intensity,
 *   reverse, freeze, nightlight and sync switches;
 * - **Device**: Wi-Fi, uptime, LEDs, current limit, memory, IP, firmware, with
 *   the update (Home Assistant dialog) and restart (second tap) actions.
 * Only what the device exposes is shown.
 */
export class VividWledPanel extends LitElement {
  static override properties = {
    hass: { attribute: false },
    entities: { attribute: false },
    effectActive: { type: Boolean, attribute: 'effect-active' },
    settings: { type: Boolean },
    device: { type: Boolean },
    _tab: { state: true },
    _confirm: { state: true },
    _live: { state: true },
  };

  declare hass?: HomeAssistant;
  declare entities?: WledEntities;
  declare effectActive: boolean;
  /** Show the Settings tab. */
  declare settings: boolean;
  /** Show the Device tab. */
  declare device: boolean;
  declare _tab?: Tab;
  declare _confirm: boolean;
  /** Slider values while dragging, until Home Assistant reports the new state. */
  declare _live: Partial<Record<string, number>>;

  private confirmTimer?: number;

  constructor() {
    super();
    this.effectActive = false;
    this.settings = true;
    this.device = true;
    this._confirm = false;
    this._live = {};
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.confirmTimer);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!changed.has('hass')) return;
    const previous = changed.get('hass');
    const live = { ...this._live };
    let dirty = false;
    for (const entityId of Object.keys(live)) {
      if (previous?.states[entityId] !== this.hass?.states[entityId]) {
        delete live[entityId];
        dirty = true;
      }
    }
    if (dirty) this._live = live;
  }

  static override styles = [
    tokens,
    buttonReset,
    css`
      :host {
        display: block;
      }
      .tabs {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        gap: 6px;
      }
      .tab {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 8px;
        min-height: var(--vivid-chip-height);
        padding: 6px 10px 6px 12px;
        border-radius: 14px;
        background: var(--vivid-chip-context, var(--vivid-layer-2));
        text-align: left;
        transition: background-color 0.2s ease;
      }
      .tab[aria-expanded='true'] {
        background: rgba(var(--vivid-rgb-text), 0.12);
      }
      .tab ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        color: var(--secondary-text-color);
      }
      .tab .chevron {
        --mdc-icon-size: 16px;
        transition: transform 0.2s ease;
      }
      .tab[aria-expanded='true'] .chevron {
        transform: rotate(180deg);
      }
      .tab .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
        line-height: 1.2;
      }
      .tab .title {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
      }
      .tab .sub {
        font-size: 11px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        box-shadow: 0 0 6px var(--primary-color, #03a9f4);
      }
      .weak {
        color: var(--warning-color, #ffa600) !important;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 8px;
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      vivid-select-chip {
        max-width: 100%;
      }
      .range {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) 3.4em;
        align-items: center;
        gap: 10px;
        height: calc(var(--vivid-chip-height) - 2px);
        padding: 0 12px;
        border-radius: calc(var(--vivid-chip-height) / 2);
        background: var(--vivid-chip-context, var(--vivid-layer-2));
        font-size: 13px;
        font-weight: 500;
      }
      .range.idle {
        opacity: 0.55;
      }
      .range ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        color: var(--secondary-text-color);
      }
      .range .value {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .hint {
        font-size: 11px;
        color: var(--secondary-text-color);
        padding: 0 4px;
      }
      input[type='range'] {
        min-width: 0;
        margin: 0;
        height: 24px;
        background: none;
        appearance: none;
        cursor: pointer;
        --track: rgba(var(--vivid-rgb-text), 0.16);
        --fill: var(--primary-text-color);
      }
      input[type='range']:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
        border-radius: 4px;
      }
      input[type='range']::-webkit-slider-runnable-track {
        height: 6px;
        border-radius: 3px;
        background: linear-gradient(90deg, var(--fill) var(--ratio), var(--track) var(--ratio));
      }
      input[type='range']::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        margin-top: -5px;
        border-radius: 50%;
        background: var(--fill);
        box-shadow: 0 0 0 3px var(--vivid-chip-context, var(--vivid-layer-2));
      }
      input[type='range']::-moz-range-track {
        height: 6px;
        border-radius: 3px;
        background: var(--track);
      }
      input[type='range']::-moz-range-progress {
        height: 6px;
        border-radius: 3px;
        background: var(--fill);
      }
      input[type='range']::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border: none;
        border-radius: 50%;
        background: var(--fill);
      }
      .switches {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 6px;
      }
      .switch {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 8px;
        min-height: calc(var(--vivid-chip-height) - 4px);
        padding: 4px 8px 4px 10px;
        border-radius: 12px;
        background: var(--vivid-chip-context, var(--vivid-layer-2));
        font-size: 12px;
        text-align: left;
      }
      .switch ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
        color: var(--secondary-text-color);
      }
      .switch .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .toggle {
        position: relative;
        width: 28px;
        height: 16px;
        border-radius: 8px;
        background: rgba(var(--vivid-rgb-text), 0.22);
        transition: background-color 0.2s ease;
      }
      .toggle::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--primary-text-color);
        transition: transform 0.2s ease;
      }
      .switch[aria-checked='true'] .toggle {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.6);
      }
      .switch[aria-checked='true'] .toggle::after {
        transform: translateX(12px);
        background: var(--primary-color, #03a9f4);
      }
      .switch[aria-checked='true'] ha-icon {
        color: var(--primary-color, #03a9f4);
      }
      .switch:disabled {
        opacity: 0.45;
        cursor: default;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));
        gap: 6px;
      }
      .stat {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        grid-template-rows: auto auto;
        column-gap: 8px;
        align-items: center;
        padding: 7px 10px;
        border-radius: 12px;
        background: var(--vivid-chip-context, var(--vivid-layer-2));
      }
      .stat ha-icon {
        --mdc-icon-size: 18px;
        grid-row: span 2;
        display: inline-flex;
        color: var(--secondary-text-color);
      }
      .stat .value {
        font-size: 13px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .stat .label {
        font-size: 10.5px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .firmware {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }
      .firmware .version {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex: 1 1 100%;
        padding: 0 4px;
        font-size: 12px;
        font-variant-numeric: tabular-nums;
      }
      .firmware .version ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
        color: var(--secondary-text-color);
      }
      .action {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: calc(var(--vivid-chip-height) - 6px);
        padding: 0 12px;
        border-radius: calc(var(--vivid-chip-height) / 2);
        background: var(--vivid-chip-context, var(--vivid-layer-2));
        font-size: 12px;
        font-weight: 600;
      }
      .action ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
      }
      .action.primary {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
        color: var(--primary-color, #03a9f4);
      }
      .action.danger {
        background: rgba(219, 68, 55, 0.2);
        color: var(--error-color, #db4437);
      }
      @media (prefers-reduced-motion: reduce) {
        .tab,
        .tab .chevron,
        .toggle,
        .toggle::after {
          transition: none;
        }
      }
    `,
  ];

  /* --------------------------------- helpers -------------------------------- */

  private stateOf(entityId: string | undefined) {
    return entityId ? this.hass?.states[entityId] : undefined;
  }

  private toggleTab(tab: Tab): void {
    this._tab = this._tab === tab ? undefined : tab;
  }

  private hasSettings(): boolean {
    const e = this.entities ?? {};
    return [...SELECTS, ...SLIDERS, ...SWITCHES].some((spec) => this.stateOf(e[spec.role]));
  }

  private hasDevice(health: WledHealth): boolean {
    return (
      health.signal !== undefined ||
      health.uptime !== undefined ||
      health.firmware !== undefined ||
      health.restartEntity !== undefined
    );
  }

  /* -------------------------------- settings -------------------------------- */

  private settingsSummary(): string {
    const e = this.entities ?? {};
    const preset = this.stateOf(e.preset);
    const palette = this.stateOf(e.palette);
    const speed = this.stateOf(e.speed);
    const parts: string[] = [];
    if (preset && isAvailable(preset)) parts.push(preset.state);
    if (this.effectActive && palette && isAvailable(palette)) parts.push(palette.state);
    if (this.effectActive && speed && isAvailable(speed)) {
      const max = typeof speed.attributes.max === 'number' ? speed.attributes.max : 255;
      parts.push(
        `${localize(this.hass, 'speed')} ${Math.round((Number(speed.state) / max) * 100)} %`,
      );
    }
    const on = SWITCHES.filter((spec) => this.stateOf(e[spec.role])?.state === 'on').length;
    if (on > 0) {
      parts.push(localize(this.hass, on === 1 ? 'switches_one' : 'switches_other', { count: on }));
    }
    return parts.join(' · ');
  }

  private renderSelect(spec: (typeof SELECTS)[number]) {
    const entityId = this.entities?.[spec.role];
    const state = this.stateOf(entityId);
    const options = state?.attributes.options;
    if (!this.hass || !entityId || !Array.isArray(options) || options.length === 0) return nothing;
    // "unknown" is a normal state here: no preset or playlist is running.
    const value = isAvailable(state) && options.includes(state.state) ? state.state : undefined;
    const label = localize(this.hass, spec.label);
    return html`<vivid-select-chip
      .icon=${spec.icon}
      .value=${value}
      .options=${options}
      .tooltip=${label}
      .placeholder=${label}
      ?disabled=${state?.state === 'unavailable'}
      @value-changed=${(event: CustomEvent<{ value: string }>) => {
        if (this.hass) void selectOption(this.hass, [entityId], event.detail.value);
      }}
    ></vivid-select-chip>`;
  }

  private renderSlider(spec: (typeof SLIDERS)[number]) {
    const entityId = this.entities?.[spec.role];
    const state = this.stateOf(entityId);
    if (!this.hass || !entityId || !isAvailable(state)) return nothing;
    const attributes = state.attributes;
    const min = typeof attributes.min === 'number' ? attributes.min : 0;
    const max = typeof attributes.max === 'number' ? attributes.max : 255;
    const step = typeof attributes.step === 'number' ? attributes.step : 1;
    const value = this._live[entityId] ?? Number(state.state);
    if (!Number.isFinite(value) || max <= min) return nothing;
    const ratio = (value - min) / (max - min);
    const label = localize(this.hass, spec.label);
    return html`<label class=${classMap({ range: true, idle: !this.effectActive })} title=${label}>
      <ha-icon .icon=${spec.icon}></ha-icon>
      <input
        type="range"
        aria-label=${label}
        min=${min}
        max=${max}
        step=${step}
        .value=${String(value)}
        style=${`--ratio: ${(ratio * 100).toFixed(1)}%`}
        @input=${(event: Event) => {
          this._live = {
            ...this._live,
            [entityId]: Number((event.target as HTMLInputElement).value),
          };
        }}
        @change=${(event: Event) => {
          if (this.hass) {
            void setNumber(this.hass, entityId, Number((event.target as HTMLInputElement).value));
          }
        }}
      />
      <span class="value">${Math.round(ratio * 100)} %</span>
    </label>`;
  }

  private renderSwitch(spec: (typeof SWITCHES)[number]) {
    const entityId = this.entities?.[spec.role];
    const state = this.stateOf(entityId);
    if (!entityId || !state) return nothing;
    const on = state.state === 'on';
    const label = localize(this.hass, spec.label);
    return html`<button
      type="button"
      class="reset switch"
      role="switch"
      aria-checked=${String(on)}
      ?disabled=${!isAvailable(state)}
      @click=${() => {
        if (!this.hass) return;
        haptic(this, 'light');
        void toggleEntity(this.hass, entityId);
      }}
    >
      <ha-icon .icon=${spec.icon}></ha-icon><span class="label">${label}</span
      ><span class="toggle"></span>
    </button>`;
  }

  private renderSettings() {
    const selects = SELECTS.map((spec) => this.renderSelect(spec)).filter(
      (part) => part !== nothing,
    );
    const sliders = SLIDERS.map((spec) => this.renderSlider(spec)).filter(
      (part) => part !== nothing,
    );
    const switches = SWITCHES.map((spec) => this.renderSwitch(spec)).filter(
      (part) => part !== nothing,
    );
    return html`<div class="panel">
      ${selects.length ? html`<div class="row">${selects}</div>` : nothing} ${sliders}
      ${
        sliders.length && !this.effectActive
          ? html`<div class="hint">${localize(this.hass, 'static_effect_hint')}</div>`
          : nothing
      }
      ${switches.length ? html`<div class="switches">${switches}</div>` : nothing}
    </div>`;
  }

  /* --------------------------------- device --------------------------------- */

  private onRestart(restart: string): void {
    if (!this.hass) return;
    if (!this._confirm) {
      this._confirm = true;
      window.clearTimeout(this.confirmTimer);
      this.confirmTimer = window.setTimeout(() => (this._confirm = false), CONFIRM_MS);
      return;
    }
    window.clearTimeout(this.confirmTimer);
    this._confirm = false;
    haptic(this, 'warning');
    void pressButton(this.hass, restart);
  }

  private stat(icon: string, label: string, value: string | undefined, extra = '') {
    if (value === undefined) return nothing;
    return html`<div class="stat" title=${`${label} : ${value}`}>
      <ha-icon class=${extra} .icon=${icon}></ha-icon>
      <span class="value ${extra}">${value}</span><span class="label">${label}</span>
    </div>`;
  }

  private deviceSummary(health: WledHealth): TemplateResult {
    const hass = this.hass;
    const weak = health.signal !== undefined && health.signal < 40;
    const parts: string[] = [];
    if (health.uptime !== undefined) parts.push(formatDuration(hass, health.uptime));
    if (health.updateAvailable && health.latestFirmware) {
      parts.push(localize(hass, 'update_short', { version: health.latestFirmware }));
    }
    return html`${
      health.signal !== undefined
        ? html`<span class=${weak ? 'weak' : ''}>${formatNumber(hass, health.signal)} %</span
            >${parts.length ? ' · ' : ''}`
        : nothing
    }${parts.join(' · ')}`;
  }

  private renderDevice(health: WledHealth) {
    const hass = this.hass;
    const weak = health.signal !== undefined && health.signal < 40;
    const signal =
      health.signal === undefined ? undefined : `${formatNumber(hass, health.signal)} %`;
    const wifiLabel =
      health.rssi !== undefined
        ? `${localize(hass, 'wifi')} · ${formatNumber(hass, health.rssi)} dBm`
        : localize(hass, 'wifi');
    const limit =
      health.maxCurrent === undefined
        ? undefined
        : health.maxCurrent > 0
          ? `${formatNumber(hass, health.maxCurrent / 1000, 1)} A`
          : localize(hass, 'limiter_off');
    return html`<div class="panel">
      <div class="stats">
        ${this.stat(wifiIcon(health.signal), wifiLabel, signal, weak ? 'weak' : '')}
        ${this.stat(
          'mdi:timer-outline',
          localize(hass, 'uptime'),
          health.uptime !== undefined ? formatDuration(hass, health.uptime) : undefined,
        )}
        ${this.stat(
          'mdi:led-strip-variant',
          localize(hass, 'leds'),
          health.ledCount !== undefined ? formatNumber(hass, health.ledCount) : undefined,
        )}
        ${this.stat('mdi:current-dc', localize(hass, 'current_limit'), limit)}
        ${this.stat(
          'mdi:memory',
          localize(hass, 'memory'),
          health.freeHeap !== undefined
            ? `${formatNumber(hass, health.freeHeap / 1024)} kB`
            : undefined,
        )}
        ${this.stat('mdi:ip-network-outline', localize(hass, 'ip'), health.ip)}
      </div>
      <div class="firmware">
        ${
          health.firmware
            ? html`<span class="version"
                ><ha-icon .icon=${'mdi:chip'}></ha-icon>${localize(hass, 'firmware')}
                <b>${health.firmware}</b>${
                  health.updateAvailable && health.latestFirmware
                    ? html` → <b>${health.latestFirmware}</b>`
                    : nothing
                }</span
              >`
            : nothing
        }
        ${
          health.updateEntity
            ? html`<button
                type="button"
                class="reset action ${health.updateAvailable ? 'primary' : ''}"
                @click=${() => fireEvent(this, 'vivid-more-info', { entityId: health.updateEntity })}
              >
                <ha-icon
                  .icon=${health.updateAvailable ? 'mdi:arrow-up-circle' : 'mdi:check-circle-outline'}
                ></ha-icon>
                ${localize(hass, health.updateAvailable ? 'update' : 'up_to_date')}
              </button>`
            : nothing
        }
        ${
          health.restartEntity
            ? html`<button
                type="button"
                class="reset action ${this._confirm ? 'danger' : ''}"
                @click=${() => this.onRestart(health.restartEntity as string)}
              >
                <ha-icon .icon=${'mdi:restart'}></ha-icon>
                ${localize(hass, this._confirm ? 'restart_confirm' : 'restart')}
              </button>`
            : nothing
        }
      </div>
    </div>`;
  }

  /* --------------------------------- render --------------------------------- */

  private renderTab(tab: Tab, icon: string, title: string, sub: unknown, dot = false) {
    const open = this._tab === tab;
    return html`<button
      type="button"
      class="reset tab"
      aria-expanded=${String(open)}
      @click=${() => this.toggleTab(tab)}
    >
      <ha-icon .icon=${icon}></ha-icon>
      <span class="text">
        <span class="title">${title}${dot ? html`<span class="dot"></span>` : nothing}</span>
        <span class="sub">${sub}</span>
      </span>
      <ha-icon class="chevron" .icon=${'mdi:chevron-down'}></ha-icon>
    </button>`;
  }

  protected override render() {
    if (!this.hass || !this.entities) return nothing;
    const health = wledHealth(this.hass, this.entities);
    const settings = this.settings && this.hasSettings();
    const device = this.device && this.hasDevice(health);
    if (!settings && !device) return nothing;
    const tab =
      this._tab === 'settings' && !settings
        ? undefined
        : this._tab === 'device' && !device
          ? undefined
          : this._tab;
    return html`<div class="tabs">
        ${
          settings
            ? this.renderTab(
                'settings',
                'mdi:tune-variant',
                localize(this.hass, 'settings'),
                this.settingsSummary() || localize(this.hass, 'settings_hint'),
              )
            : nothing
        }
        ${
          device
            ? this.renderTab(
                'device',
                'mdi:chip',
                localize(this.hass, 'device'),
                this.deviceSummary(health),
                health.updateAvailable,
              )
            : nothing
        }
      </div>
      ${tab === 'settings' ? this.renderSettings() : nothing}
      ${tab === 'device' ? this.renderDevice(health) : nothing}`;
  }
}

defineElement('vivid-wled-panel', VividWledPanel);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-wled-panel': VividWledPanel;
  }
}
