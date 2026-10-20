import { LitElement, css, html, nothing, unsafeCSS, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { fireEvent, haptic, pressButton, selectOption, setNumber } from '../../core/actions';
import { clamp, rgbCss } from '../../core/color';
import { glowSize, tintTone } from '../../core/glow';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import { formatDuration, localize, type StringKey } from '../../i18n';
import { defineElement } from '../../core/register';
import { buttonReset, tokens } from '../../components/shared-styles';
import '../../components/vivid-fan-curve';
import type { CurveHandle } from '../../components/vivid-fan-curve';
import '../../components/vivid-source-row';
import type { SourcePhase } from '../../components/vivid-source-row';
import { SOURCE_RGB } from '../../components/vivid-source-row';
import type { EntityKey, ResolvedAmbilightConfig } from './config';
import { temperatureColor, type AmbilightModel, type FanMode, type NumberSetting } from './model';
import {
  FAN_RGB,
  GREEN,
  RED,
  alarmViews,
  celsius,
  fixed,
  healthColor,
  healthIcon,
  overheatOf,
  piText,
  piTone,
  sourceLabels,
  spinSeconds,
} from './view';

type Tab = 'overview' | 'fan' | 'ir' | 'maint';
const TABS: { id: Tab; icon: string; label: StringKey }[] = [
  { id: 'overview', icon: 'mdi:view-dashboard-outline', label: 'amb_tab_overview' },
  { id: 'fan', icon: 'mdi:fan', label: 'amb_tab_fan' },
  { id: 'ir', icon: 'mdi:video-input-hdmi', label: 'amb_tab_ir' },
  { id: 'maint', icon: 'mdi:tune-variant', label: 'amb_tab_maint' },
];

const SPEEDS = [0, 25, 50, 75, 100] as const;
const SPEED_KEYS: Record<(typeof SPEEDS)[number], EntityKey> = {
  0: 'fan0',
  25: 'fan25',
  50: 'fan50',
  75: 'fan75',
  100: 'fan100',
};
/** Second taps are awaited this long. */
const ARM_MS = 3000;

/**
 * Details of the Ambilight box, in four tabs: overview (everything at a
 * glance), fan (the curve and its settings), HDMI & IR (codes and learning),
 * maintenance (Pi, tests, system). Anything that cuts or erases asks for a
 * second tap. HDMI sends bubble up as `vivid-source-select` so the card
 * tracks them.
 */
export class VividAmbilightDetails extends LitElement {
  static override properties = {
    hass: { attribute: false },
    model: { attribute: false },
    config: { attribute: false },
    phases: { attribute: false },
    tab: { state: true },
    point: { state: true },
    step: { state: true },
    armed: { state: true },
    open: { state: true },
  };

  declare hass?: HomeAssistant;
  declare model?: AmbilightModel;
  declare config?: ResolvedAmbilightConfig;
  declare phases: Partial<Record<number, SourcePhase>>;
  declare tab: Tab;
  /** Selected curve point. */
  declare point: number;
  /** Learning step reached in this session (0: not started). */
  declare step: number;
  /** Action waiting for its second tap. */
  declare armed?: string;
  /** Expanded maintenance sections. */
  declare open: Record<string, boolean>;

  private armTimer?: number;

  constructor() {
    super();
    this.phases = {};
    this.tab = 'overview';
    this.point = 1;
    this.step = 0;
    this.open = { pi: true, fan: true, ir: false, system: true };
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.armTimer);
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
      .disc.spin ha-icon {
        animation: spin var(--spin, 1.2s) linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .names {
        display: flex;
        flex-direction: column;
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
      }
      .tab ha-icon {
        --mdc-icon-size: 17px;
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
      .alarm {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 12px 9px 9px;
        border-radius: 16px;
        background: rgba(var(--alarm-rgb), 0.14);
        font-size: 12.5px;
        line-height: 1.35;
      }
      .alarm .ai {
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${unsafeCSS(glowSize(30))};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--disc-bg);
        box-shadow: var(--disc-shadow);
        color: var(--disc-color);
      }
      .alarm .ai ha-icon {
        --mdc-icon-size: 17px;
      }
      .alarm b {
        display: block;
        font-size: 13px;
        font-weight: 600;
      }
      .alarm span span {
        color: var(--secondary-text-color);
      }
      .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 12px 0 4px;
        box-sizing: border-box;
        border-radius: 18px;
        background: var(--surface);
        font-size: 13px;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
      }
      .badge .bi {
        display: grid;
        place-items: center;
        --vivid-glow-size: ${unsafeCSS(glowSize(28))};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--disc-bg, var(--inner));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
      }
      .badge .bi ha-icon {
        --mdc-icon-size: 16px;
      }
      .badge.na {
        color: var(--secondary-text-color);
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
        padding: 5px 8px 5px 6px;
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
      .row .icon.pulse {
        animation: pulse var(--pulse, 1.6s) ease-in-out infinite;
      }
      @keyframes pulse {
        50% {
          opacity: 0.45;
        }
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
      .row .text small.mono,
      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
      }
      .row .text small.none {
        font-style: italic;
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
      .switch.danger {
        background: var(--error-color, #ef5350);
      }
      .switch:disabled,
      .btn:disabled,
      .step:disabled,
      .speed:disabled {
        opacity: 0.45;
        cursor: default;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        flex: none;
        height: 36px;
        padding: 0 13px;
        box-sizing: border-box;
        border-radius: 18px;
        background: var(--inner);
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
      }
      .row .btn {
        height: 32px;
      }
      .btn ha-icon {
        --mdc-icon-size: 16px;
      }
      .btn.danger {
        color: var(--error-color, #ef5350);
      }
      .btn.armed {
        background: var(--error-color, #ef5350);
        color: #fff;
      }
      .btn.primary {
        background: rgb(var(--source-rgb));
        color: #fff;
        font-weight: 600;
      }
      .btn.round {
        width: 34px;
        padding: 0;
      }
      .btns {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .seg {
        display: inline-flex;
        flex: none;
        padding: 3px;
        border-radius: 18px;
        background: var(--surface);
      }
      .seg button {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        height: 30px;
        padding: 0 12px;
        border-radius: 15px;
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .seg button ha-icon {
        --mdc-icon-size: 16px;
      }
      .seg button[aria-pressed='true'] {
        background: var(--vivid-layer-0);
        color: var(--primary-text-color);
        font-weight: 600;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      }
      .fanline {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .fanline .mini {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        gap: 2px;
        min-width: 0;
      }
      .fanline .mini small {
        font-size: 11.5px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .control {
        flex: 1 1 auto;
        min-width: 0;
        padding: 8px 10px;
        border-radius: 12px;
        background: var(--surface);
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .speeds {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 6px;
      }
      .speed {
        height: 38px;
        border-radius: 19px;
        background: var(--surface);
        font-size: 13px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .speed[aria-pressed='true'] {
        --vivid-glow-size: ${unsafeCSS(glowSize(38))};
        background: var(--disc-bg);
        box-shadow: var(--disc-shadow);
        color: var(--disc-color);
      }
      .curvebox {
        padding: 10px 8px 4px;
        border-radius: 18px;
        background: var(--surface);
      }
      .points {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px 8px;
        padding: 6px 8px;
        border-radius: 16px;
        background: var(--surface);
      }
      .pchips {
        display: flex;
        gap: 4px;
      }
      .pchip {
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--inner);
        font-size: 12.5px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .pchip[aria-pressed='true'] {
        color: #fff;
        background: var(--chip-color);
      }
      .stepper {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
      }
      .pvals {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 6px 10px;
        margin-left: auto;
      }
      .pvals .stepper {
        margin-left: 0;
      }
      .pvals .stepper b {
        min-width: 50px;
      }
      .step {
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--inner);
      }
      .step ha-icon {
        --mdc-icon-size: 16px;
      }
      .stepper b {
        min-width: 56px;
        text-align: center;
        font-size: 13.5px;
        font-variant-numeric: tabular-nums;
      }
      .hint {
        padding: 0 4px;
        font-size: 12px;
        line-height: 1.45;
        color: var(--secondary-text-color);
      }
      .hint b {
        color: var(--primary-text-color);
      }
      .hint .ok {
        color: var(--success-color, #66bb6a);
        font-weight: 600;
      }
      .hint .ko {
        color: #ff7043;
        font-weight: 600;
      }
      .tag {
        flex: none;
        padding: 3px 8px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 600;
        background: rgba(var(--source-rgb), 0.2);
        color: rgb(var(--source-rgb));
      }
      .num {
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${unsafeCSS(glowSize(34))};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: var(--disc-bg, var(--inner));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
        font-size: 13px;
        font-weight: 700;
      }
      .wizard {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border-radius: 20px;
        background: var(--surface);
      }
      .wizard .label {
        margin: 0;
        padding: 0;
      }
      .wsteps {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 4px;
      }
      .ws {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        padding: 0 2px;
        text-align: center;
        font-size: 11.5px;
        line-height: 1.25;
        color: var(--secondary-text-color);
      }
      .ws::before {
        content: '';
        position: absolute;
        top: 15px;
        left: -50%;
        right: 50%;
        height: 2px;
        background: var(--inner);
      }
      .ws:first-child::before {
        display: none;
      }
      .ws.done::before,
      .ws.current::before {
        background: rgb(var(--source-rgb));
      }
      .ws i {
        position: relative;
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--inner);
        font-style: normal;
        font-size: 13px;
        font-weight: 700;
      }
      .ws i ha-icon {
        --mdc-icon-size: 16px;
      }
      .ws.done i {
        background: rgb(var(--source-rgb));
        color: #fff;
      }
      .ws.current {
        color: var(--primary-text-color);
        font-weight: 600;
      }
      .ws.current i {
        background: var(--vivid-layer-0);
        color: rgb(var(--source-rgb));
        box-shadow: inset 0 0 0 2px rgb(var(--source-rgb));
      }
      .irstatus {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 10px 12px;
        border-radius: 14px;
        background: rgba(var(--source-rgb), 0.14);
        font-size: 13.5px;
        line-height: 1.4;
      }
      .irstatus ha-icon {
        --mdc-icon-size: 18px;
        flex: none;
        color: rgb(var(--source-rgb));
      }
      .irstatus small {
        display: block;
        margin-bottom: 2px;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        opacity: 0.75;
      }
      .targets {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 5px;
        font-size: 12.5px;
        color: var(--secondary-text-color);
      }
      .target {
        display: grid;
        place-items: center;
        height: 30px;
        min-width: 30px;
        padding: 0 8px;
        box-sizing: border-box;
        border-radius: 15px;
        background: var(--inner);
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .target[aria-pressed='true'] {
        background: rgb(var(--source-rgb));
        color: #fff;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }
      .actions .btn.primary {
        margin-left: auto;
      }
      .section {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .shead {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 4px 2px;
        font-size: 13.5px;
        font-weight: 600;
        text-align: left;
      }
      .shead ha-icon {
        --mdc-icon-size: 18px;
      }
      .shead small {
        font-weight: 400;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .shead .chev {
        margin-left: auto;
        color: var(--secondary-text-color);
      }
      .status-text {
        padding: 8px 10px;
        border-radius: 12px;
        background: var(--surface);
        color: var(--secondary-text-color);
      }
      .diag {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
      }
      .diag div {
        display: flex;
        flex-direction: column;
        min-width: 0;
        padding: 8px 10px;
        border-radius: 12px;
        background: var(--surface);
        font-size: 13.5px;
        font-weight: 600;
      }
      .diag small {
        font-size: 11.5px;
        font-weight: 400;
        color: var(--secondary-text-color);
      }
      .diag span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      @media (prefers-reduced-motion: reduce) {
        .disc.spin ha-icon,
        .row .icon.pulse {
          animation: none;
        }
      }
    `,
  ];

  /* --------------------------------- helpers -------------------------------- */

  private entity(key: EntityKey): string {
    return this.config?.entities[key] ?? '';
  }

  private press(key: EntityKey): void {
    if (!this.hass) return;
    haptic(this, 'light');
    void pressButton(this.hass, this.entity(key));
  }

  private switchTo(key: EntityKey, on: boolean): void {
    if (!this.hass) return;
    haptic(this, 'light');
    void this.hass.callService(
      'switch',
      on ? 'turn_on' : 'turn_off',
      {},
      { entity_id: this.entity(key) },
    );
  }

  private setValue(setting: NumberSetting, value: number): void {
    if (!this.hass) return;
    const next = clamp(Math.round(value / setting.step) * setting.step, setting.min, setting.max);
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

  private setMode(mode: FanMode): void {
    const model = this.model;
    const option = model?.fan.options[mode];
    if (!this.hass || !option || model?.fan.mode === mode) return;
    haptic(this, 'light');
    void selectOption(this.hass, [this.entity('fanMode')], option);
  }

  private icon(name: string, rgb?: Rgb, level = 0.8, pulse?: string): TemplateResult {
    const tone = rgb ? tintTone(rgb, level) : undefined;
    return html`<span
      class=${classMap({ icon: true, pulse: !!pulse })}
      style=${styleMap({
        '--disc-bg': tone?.background,
        '--disc-shadow': tone?.shadow,
        '--disc-color': tone?.iconColor,
        '--pulse': pulse,
      })}
      ><ha-icon .icon=${name}></ha-icon
    ></span>`;
  }

  private stepper(setting: NumberSetting, text: string, disabled = false) {
    const value = setting.value;
    const off = disabled || value === undefined;
    return html`<span class="stepper">
      <button
        type="button"
        class="reset step"
        aria-label="−"
        ?disabled=${off || (value ?? 0) <= setting.min}
        @click=${() => value !== undefined && this.setValue(setting, value - setting.step)}
      >
        <ha-icon icon="mdi:minus"></ha-icon>
      </button>
      <b>${text}</b>
      <button
        type="button"
        class="reset step"
        aria-label="+"
        ?disabled=${off || (value ?? 0) >= setting.max}
        @click=${() => value !== undefined && this.setValue(setting, value + setting.step)}
      >
        <ha-icon icon="mdi:plus"></ha-icon>
      </button>
    </span>`;
  }

  private switchButton(key: EntityKey, on: boolean | undefined, label: string, disabled = false) {
    return html`<button
      type="button"
      class="reset switch"
      role="switch"
      aria-label=${label}
      aria-checked=${on ? 'true' : 'false'}
      ?disabled=${disabled || on === undefined}
      @click=${() => this.switchTo(key, !on)}
    ></button>`;
  }

  private colorAt = (t: number): Rgb =>
    temperatureColor(t, this.model ? overheatOf(this.model) : 55);
  private format = (value: number, digits: number): string => fixed(this.hass, value, digits);

  /* --------------------------------- sections ------------------------------- */

  private renderHead(model: AmbilightModel) {
    const hass = this.hass;
    const color = healthColor(model);
    const tone = color ? tintTone(color, 0.85) : undefined;
    const spin = model.online ? spinSeconds(model.fan.percentage) : undefined;
    const t = model.controlTemperature;
    const parts = [
      model.online
        ? model.fan.mode === 'manual'
          ? localize(hass, 'amb_manual')
          : localize(hass, 'amb_auto')
        : localize(hass, 'amb_offline'),
      t === undefined ? undefined : celsius(hass, t),
      model.fan.percentage === undefined ? undefined : `${model.fan.percentage}\u00a0%`,
    ].filter(Boolean);
    return html`<div class="head">
        <span
          class=${classMap({ disc: true, spin: spin !== undefined })}
          style=${styleMap({
            '--disc-bg': tone?.background,
            '--disc-shadow': tone?.shadow,
            '--disc-color': tone?.iconColor,
            '--spin': spin === undefined ? undefined : `${spin}s`,
          })}
          ><ha-icon .icon=${healthIcon(model)}></ha-icon
        ></span>
        <span class="names"
          ><span class="title">${model.name}</span
          ><span class="sub">${parts.join(' · ')}</span></span
        >
      </div>
      <div class="tabs" role="tablist">
        ${TABS.map(
          (tab) =>
            html`<button
              type="button"
              class="reset tab"
              role="tab"
              aria-selected=${this.tab === tab.id ? 'true' : 'false'}
              @click=${() => {
                this.tab = tab.id;
              }}
            >
              <ha-icon .icon=${tab.icon}></ha-icon>${localize(hass, tab.label)}
            </button>`,
        )}
      </div>`;
  }

  private renderAlarms(model: AmbilightModel) {
    return alarmViews(this.hass, model).map((view) => {
      const tone = tintTone(view.color, 0.9);
      return html`<div class="alarm" style=${styleMap({ '--alarm-rgb': view.color.join(', ') })}>
        <span
          class="ai"
          style=${styleMap({ '--disc-bg': tone.background, '--disc-shadow': tone.shadow, '--disc-color': tone.iconColor })}
          ><ha-icon .icon=${view.icon}></ha-icon
        ></span>
        <span><b>${view.title}</b><span>${view.detail}</span></span>
      </div>`;
    });
  }

  private badge(icon: string, text: string | undefined, rgb?: Rgb, level = 0.5) {
    const tone = rgb && text !== undefined ? tintTone(rgb, level) : undefined;
    return html`<span class=${classMap({ badge: true, na: text === undefined })}>
      <span
        class="bi"
        style=${styleMap({ '--disc-bg': tone?.background, '--disc-shadow': tone?.shadow, '--disc-color': tone?.iconColor })}
        ><ha-icon .icon=${icon}></ha-icon></span
      >${text ?? '—'}
    </span>`;
  }

  private renderClimate(model: AmbilightModel) {
    const hass = this.hass;
    const t = model.temperature ?? model.controlTemperature;
    const rpm = model.fan.rpm;
    return html`<div class="badges">
      ${this.badge('mdi:thermometer', t === undefined ? undefined : celsius(hass, t), t === undefined ? undefined : this.colorAt(t))}
      ${this.badge('mdi:water-percent', model.humidity === undefined ? undefined : `${fixed(hass, model.humidity, 0)}\u00a0%`, GREEN, 0.4)}
      ${this.badge('mdi:gauge', model.pressure === undefined ? undefined : `${fixed(hass, model.pressure, 0)}\u00a0hPa`, [144, 164, 174], 0.35)}
      ${
        rpm !== undefined && (model.fan.percentage === 100 || model.fan.stalled)
          ? this.badge(
              'mdi:fan',
              localize(hass, 'amb_rpm', { n: fixed(hass, rpm, 0) }),
              model.fan.stalled ? RED : FAN_RGB,
              0.5,
            )
          : nothing
      }
    </div>`;
  }

  private renderPiRows(model: AmbilightModel, withPulse: boolean) {
    const hass = this.hass;
    const pi = piTone(model.pi);
    const disabled = !model.online || !model.relay.available;
    const relayOn = model.relay.on;
    return html`<div class="row">
        ${this.icon('mdi:raspberry-pi', relayOn ? GREEN : undefined, 0.7)}
        <span class="text"
          >${localize(hass, 'amb_power')}<small
            >${localize(hass, relayOn ? 'amb_power_on' : 'amb_power_off')}</small
          ></span
        >
        <button
          type="button"
          class=${classMap({ reset: true, switch: true, danger: this.armed === 'relay' })}
          role="switch"
          aria-label=${localize(hass, 'amb_power')}
          aria-checked=${relayOn ? 'true' : 'false'}
          ?disabled=${disabled}
          @click=${() => {
            if (!relayOn) this.switchTo('relay', true);
            else if (this.config?.confirmPiOff)
              this.confirm('relay', () => this.switchTo('relay', false));
            else this.switchTo('relay', false);
          }}
        ></button>
      </div>
      <div class="row">
        <span
          class=${classMap({ icon: true, pulse: !!pi?.pulse })}
          style=${styleMap({ '--disc-bg': pi?.background, '--disc-shadow': pi?.shadow, '--disc-color': pi?.iconColor, '--pulse': pi?.pulse })}
          ><ha-icon icon="mdi:television-ambient-light"></ha-icon
        ></span>
        <span class="text">HyperHDR<small>${piText(hass, model.pi)}</small></span>
      </div>
      ${
        withPulse
          ? html`<div class="row">
              ${this.icon('mdi:power-cycle')}
              <span class="text"
                >${localize(hass, 'amb_pulse')}<small
                  >${localize(hass, 'amb_pulse_hint')}</small
                ></span
              >
              <button
                type="button"
                class=${classMap({ reset: true, btn: true, danger: true, armed: this.armed === 'pulse' })}
                ?disabled=${disabled}
                @click=${() => this.confirm('pulse', () => this.press('relayPulse'))}
              >
                ${this.armed === 'pulse' ? localize(hass, 'amb_tap_again') : localize(hass, 'amb_pulse_btn')}
              </button>
            </div>`
          : nothing
      }`;
  }

  private renderSources(model: AmbilightModel, size: 'compact' | 'large') {
    const items = model.hdmi.inputs.map((input) => ({
      name: input.name,
      icon: input.icon,
      available: model.online && input.available,
    }));
    return html`<vivid-source-row
      size=${size}
      .items=${items}
      .active=${model.hdmi.active}
      .phases=${this.phases}
      .labels=${sourceLabels(this.hass)}
      ?disabled=${!model.online}
    ></vivid-source-row>`;
  }

  private renderModeSwitch(model: AmbilightModel) {
    const hass = this.hass;
    const disabled = !model.online;
    return html`<span class="seg" role="group">
      ${(['auto', 'manual'] as const).map(
        (mode) =>
          html`<button
            type="button"
            class="reset"
            aria-pressed=${model.fan.mode === mode ? 'true' : 'false'}
            ?disabled=${disabled || !model.fan.options[mode]}
            @click=${() => this.setMode(mode)}
          >
            <ha-icon .icon=${mode === 'auto' ? 'mdi:fan-auto' : 'mdi:hand-back-right'}></ha-icon
            >${localize(hass, mode === 'auto' ? 'amb_auto' : 'amb_manual')}
          </button>`,
      )}
    </span>`;
  }

  private handles(model: AmbilightModel): CurveHandle[] | undefined {
    const handles: CurveHandle[] = [];
    for (const point of model.curve.points) {
      if (point.t.value === undefined || point.s.value === undefined) return undefined;
      handles.push({
        t: point.t.value,
        s: point.s.value,
        tMin: point.t.min,
        tMax: point.t.max,
        tStep: point.t.step,
        sMin: point.s.min,
        sMax: point.s.max,
        sStep: point.s.step,
      });
    }
    return handles;
  }

  private renderMiniCurve(model: AmbilightModel) {
    const hass = this.hass;
    const handles = this.handles(model);
    const t = model.controlTemperature;
    const caption =
      model.fan.mode === 'manual'
        ? localize(hass, 'amb_manual_hint')
        : t === undefined
          ? localize(hass, 'amb_curve_waiting')
          : localize(hass, 'amb_on_curve', {
              t: celsius(hass, t),
              s: model.fan.target ?? model.fan.percentage ?? '—',
            });
    return html`<span class="mini">
      <small>${caption}</small>
      ${
        handles && model.fan.mode !== 'manual'
          ? html`<vivid-fan-curve
              mini
              .points=${handles}
              .temperature=${t}
              .stop=${model.curve.stopBelowT1 === true}
              .colorAt=${this.colorAt}
            ></vivid-fan-curve>`
          : nothing
      }
    </span>`;
  }

  private renderSpeeds(model: AmbilightModel) {
    const disabled = !model.online;
    return html`<div class="speeds">
      ${SPEEDS.map((speed) => {
        const on = model.fan.mode === 'manual' && model.fan.percentage === speed;
        const tone = on ? tintTone(FAN_RGB, 0.7) : undefined;
        return html`<button
          type="button"
          class="reset speed"
          aria-pressed=${on ? 'true' : 'false'}
          style=${styleMap({ '--disc-bg': tone?.background, '--disc-shadow': tone?.shadow, '--disc-color': tone?.iconColor })}
          ?disabled=${disabled}
          @click=${() => this.press(SPEED_KEYS[speed])}
        >
          ${speed === 0 ? localize(this.hass, 'off') : `${speed}`}
        </button>`;
      })}
    </div>`;
  }

  /* ----------------------------------- tabs --------------------------------- */

  private renderOverview(model: AmbilightModel) {
    const hass = this.hass;
    const active = model.hdmi.active;
    return html`${this.renderAlarms(model)}${this.renderClimate(model)}
      <div class="label">
        ${localize(hass, 'amb_source')}<em
          >${active === undefined ? '—' : model.hdmi.inputs[active]?.name}</em
        >
      </div>
      ${this.renderSources(model, 'large')}
      <div class="label">${localize(hass, 'amb_pi_title')}</div>
      ${this.renderPiRows(model, false)}
      <div class="label">${localize(hass, 'amb_fan')}</div>
      <div class="fanline">${this.renderModeSwitch(model)}${this.renderMiniCurve(model)}</div>
      ${model.fan.mode === 'manual' ? this.renderSpeeds(model) : nothing}`;
  }

  private renderFan(model: AmbilightModel) {
    const hass = this.hass;
    const handles = this.handles(model);
    const disabled = !model.online;
    const point = model.curve.points[this.point];
    const color = point?.t.value === undefined ? undefined : this.colorAt(point.t.value);
    const first = model.curve.points.reduce<number | undefined>(
      (low, item) =>
        item.t.value === undefined
          ? low
          : low === undefined
            ? item.t.value
            : Math.min(low, item.t.value),
      undefined,
    );
    const firstSpeed = model.curve.points.find((item) => item.t.value === first)?.s.value;
    const hyst = model.curve.hysteresis.value;
    return html`<div class="fanline">
        ${this.renderModeSwitch(model)}<span class="control mono">${model.fan.control ?? '—'}</span>
      </div>
      ${
        handles
          ? html`<div class="curvebox">
              <vivid-fan-curve
                .points=${handles}
                .temperature=${model.controlTemperature}
                .stop=${model.curve.stopBelowT1 === true}
                .hysteresis=${hyst}
                .overheat=${model.curve.overheat.value}
                .selected=${this.point}
                .colorAt=${this.colorAt}
                .format=${this.format}
                ?editable=${!disabled}
                @vivid-curve-select=${(event: CustomEvent<{ index: number }>) => {
                  this.point = event.detail.index;
                }}
                @vivid-curve-change=${(
                  event: CustomEvent<{ index: number; t: number; s: number }>,
                ) => {
                  const target = model.curve.points[event.detail.index];
                  if (!target) return;
                  if (target.t.value !== event.detail.t) this.setValue(target.t, event.detail.t);
                  if (target.s.value !== event.detail.s) this.setValue(target.s, event.detail.s);
                }}
              ></vivid-fan-curve>
            </div>`
          : nothing
      }
      <div class="points">
        <span class="pchips">
          ${model.curve.points.map(
            (_, index) =>
              html`<button
                type="button"
                class="reset pchip"
                aria-pressed=${index === this.point ? 'true' : 'false'}
                style=${styleMap({ '--chip-color': color ? rgbCss(color) : undefined })}
                @click=${() => {
                  this.point = index;
                }}
              >
                ${index + 1}
              </button>`,
          )}
        </span>
        ${
          point
            ? html`<span class="pvals"
                >${this.stepper(point.t, point.t.value === undefined ? '—' : celsius(hass, point.t.value), disabled)}
                ${this.stepper(point.s, point.s.value === undefined ? '—' : `${fixed(hass, point.s.value, 0)}\u00a0%`, disabled)}</span
              >`
            : nothing
        }
      </div>
      <div class="hint">${localize(hass, 'amb_drag_hint')}</div>
      <div class="row">
        ${this.icon('mdi:sine-wave')}
        <span class="text"
          >${localize(hass, 'amb_hysteresis')}<small
            >${
              first !== undefined && hyst !== undefined
                ? localize(hass, 'amb_hysteresis_hint', {
                    on: celsius(hass, first),
                    off: celsius(hass, first - hyst),
                  })
                : ''
            }</small
          ></span
        >
        ${this.stepper(model.curve.hysteresis, hyst === undefined ? '—' : celsius(hass, hyst), disabled)}
      </div>
      <div class="row">
        ${this.icon('mdi:thermometer-alert', RED, 0.6)}
        <span class="text"
          >${localize(hass, 'amb_overheat_temp')}<small
            >${localize(hass, 'amb_overheat_hint')}</small
          ></span
        >
        ${this.stepper(
          model.curve.overheat,
          model.curve.overheat.value === undefined
            ? '—'
            : celsius(hass, model.curve.overheat.value, 0),
          disabled,
        )}
      </div>
      <div class="row">
        ${this.icon('mdi:fan-off')}
        <span class="text"
          >${localize(hass, 'amb_stop')}<small
            >${firstSpeed === undefined ? '' : localize(hass, 'amb_stop_hint', { s: fixed(hass, firstSpeed, 0) })}</small
          ></span
        >
        ${this.switchButton('stopBelowT1', model.curve.stopBelowT1, localize(hass, 'amb_stop'), disabled)}
      </div>
      <div class="label">${localize(hass, 'amb_manual_speed')}</div>
      ${this.renderSpeeds(model)}
      ${model.fan.mode === 'auto' ? html`<div class="hint">${localize(hass, 'amb_manual_only')}</div>` : nothing}`;
  }

  private renderInputs(model: AmbilightModel) {
    const hass = this.hass;
    return model.hdmi.inputs.map((input, index) => {
      const active = index === model.hdmi.active;
      const tone = active ? tintTone(SOURCE_RGB, 0.85) : undefined;
      const code = input.code;
      return html`<div class="row">
        <span
          class="num"
          style=${styleMap({ '--disc-bg': tone?.background, '--disc-shadow': tone?.shadow, '--disc-color': tone?.iconColor })}
          >${index + 1}</span
        >
        <span class="text"
          >${input.name}<small class=${classMap({ mono: !!code, none: code === null })}
            >${code === null ? localize(hass, 'amb_no_code') : (code ?? '—')}</small
          ></span
        >
        ${active ? html`<span class="tag">${localize(hass, 'amb_active')}</span>` : nothing}
        <button
          type="button"
          class="reset btn round"
          title=${input.name}
          aria-label=${input.name}
          ?disabled=${!model.online || !input.available || code === null}
          @click=${() => fireEvent(this, 'vivid-source-select', { index })}
        >
          <ha-icon icon="mdi:remote"></ha-icon>
        </button>
      </div>`;
    });
  }

  private renderWizard(model: AmbilightModel) {
    const hass = this.hass;
    const disabled = !model.online;
    const steps: { key: EntityKey; label: StringKey }[] = [
      { key: 'learn1', label: 'amb_step1' },
      { key: 'learn2', label: 'amb_step2' },
      { key: 'learn3', label: 'amb_step3' },
      { key: 'learn4', label: 'amb_step4' },
    ];
    const next = Math.min(this.step, 3);
    const target = model.ir.target;
    const nextStep = steps[next] as { key: EntityKey; label: StringKey };
    const runStep = (index: number) => {
      const step = steps[index];
      if (!step) return;
      this.press(step.key);
      this.step = index === 3 ? 0 : index + 1;
    };
    const hint =
      next === 0
        ? localize(hass, 'amb_step1_hint')
        : next === 2
          ? localize(hass, 'amb_step3_hint')
          : '';
    return html`<div class="wizard">
      <div class="label">
        ${localize(hass, 'amb_learn')}<em>${localize(hass, 'amb_nec_only')}</em>
      </div>
      <div class="wsteps">
        ${steps.map((step, index) => {
          const state = index < next ? 'done' : index === next ? 'current' : '';
          return html`<button
            type="button"
            class=${classMap({ reset: true, ws: true, [state || 'todo']: true })}
            ?disabled=${disabled}
            @click=${() => runStep(index)}
          >
            <i>${state === 'done' ? html`<ha-icon icon="mdi:check-bold"></ha-icon>` : index + 1}</i
            >${localize(hass, step.label)}
          </button>`;
        })}
      </div>
      <div class="irstatus">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <span><small>IR Status</small>${model.ir.status ?? '—'}</span>
      </div>
      <div class="targets">
        ${localize(hass, 'amb_target')}
        ${model.hdmi.inputs.map((_, index) => {
          const option = model.ir.targetOptions[index] ?? `HDMI ${index + 1}`;
          return html`<button
            type="button"
            class="reset target"
            aria-pressed=${index === target ? 'true' : 'false'}
            ?disabled=${disabled}
            @click=${() => this.hass && void selectOption(this.hass, [this.entity('learnTarget')], option)}
          >
            ${index + 1}
          </button>`;
        })}
      </div>
      <div class="actions">
        <button
          type="button"
          class="reset btn"
          ?disabled=${disabled}
          @click=${() => {
            this.press('learnCancel');
            this.step = 0;
          }}
        >
          <ha-icon icon="mdi:cancel"></ha-icon>${localize(hass, 'amb_cancel')}
        </button>
        <button
          type="button"
          class=${classMap({ reset: true, btn: true, danger: true, armed: this.armed === 'clear' })}
          ?disabled=${disabled || target === undefined}
          @click=${() => this.confirm('clear', () => this.press('learnClear'))}
        >
          <ha-icon icon="mdi:delete-outline"></ha-icon>${
            this.armed === 'clear'
              ? localize(hass, 'amb_tap_again')
              : localize(hass, 'amb_clear', { n: target === undefined ? '' : `HDMI ${target + 1}` })
          }
        </button>
        <button
          type="button"
          class="reset btn primary"
          ?disabled=${disabled}
          @click=${() => runStep(next)}
        >
          ${next + 1} · ${localize(hass, nextStep.label)}
        </button>
      </div>
      ${hint ? html`<div class="hint">${hint}</div>` : nothing}
    </div>`;
  }

  private renderIr(model: AmbilightModel) {
    const hass = this.hass;
    const verified = model.hdmi.verified;
    return html`${this.renderInputs(model)}
      <div class="hint">
        ${model.ir.lastReceived ? html`${localize(hass, 'amb_last_received', { c: '' })}<b class="mono">${model.ir.lastReceived}</b>` : nothing}
        ${
          verified === undefined
            ? nothing
            : html` ·
                <span class=${verified ? 'ok' : 'ko'}
                  >${localize(hass, verified ? 'amb_last_ok' : 'amb_last_fail')}</span
                >`
        }
      </div>
      ${this.renderWizard(model)}`;
  }

  private section(
    id: string,
    icon: string,
    title: string,
    extra: string | undefined,
    body: () => unknown,
  ) {
    const open = this.open[id] ?? false;
    return html`<div class="section">
      <button
        type="button"
        class="reset shead"
        aria-expanded=${open ? 'true' : 'false'}
        @click=${() => {
          this.open = { ...this.open, [id]: !open };
        }}
      >
        <ha-icon .icon=${icon}></ha-icon
        >${title}${extra ? html`<small>· ${extra}</small>` : nothing}
        <ha-icon class="chev" .icon=${open ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
      </button>
      ${open ? body() : nothing}
    </div>`;
  }

  private renderMaint(model: AmbilightModel) {
    const hass = this.hass;
    const disabled = !model.online;
    const button = (key: EntityKey, icon: string, label: StringKey) =>
      html`<button
        type="button"
        class="reset btn"
        ?disabled=${disabled}
        @click=${() => this.press(key)}
      >
        <ha-icon .icon=${icon}></ha-icon>${localize(hass, label)}
      </button>`;
    const pwm = model.tests.pwm;
    const uptime = model.diag.uptime;
    return html`${this.section(
      'pi',
      'mdi:raspberry-pi',
      localize(hass, 'amb_pi_title'),
      'HyperHDR',
      () => this.renderPiRows(model, true),
    )}
    ${this.section(
      'fan',
      'mdi:fan',
      localize(hass, 'amb_fan_tests'),
      undefined,
      () =>
        html` <div class="btns">
            ${button('fanSelfTest', 'mdi:test-tube', 'amb_self_test')}${button('fanSweep', 'mdi:sync', 'amb_sweep')}
            ${button('fanStopTests', 'mdi:stop-circle', 'amb_stop_tests')}
          </div>
          <div class="status-text mono">${model.tests.status ?? '—'}</div>
          <div class="row">
            ${this.icon('mdi:sine-wave')}<span class="text">${localize(hass, 'amb_pwm')}</span>
            ${this.stepper(pwm, pwm.value === undefined ? '—' : `${fixed(hass, pwm.value, 0)}\u00a0Hz`, disabled)}
          </div>`,
    )}
    ${this.section(
      'ir',
      'mdi:remote',
      localize(hass, 'amb_ir_tests'),
      model.tests.rxFrames === undefined
        ? undefined
        : localize(hass, 'amb_frames', { n: fixed(hass, model.tests.rxFrames, 0) }),
      () =>
        html` <div class="row">
            ${this.icon('mdi:led-on')}<span class="text">${localize(hass, 'amb_led_steady')}</span>
            ${this.switchButton('ledSteady', model.tests.ledSteady, localize(hass, 'amb_led_steady'), disabled)}
          </div>
          <div class="btns">
            ${button('burst', 'mdi:broadcast', 'amb_burst')}${button('echoTest', 'mdi:swap-horizontal', 'amb_echo')}
            ${button('sendCaptured', 'mdi:remote', 'amb_send_captured')}
          </div>
          <div class="row">
            ${this.icon('mdi:bug-outline')}<span class="text"
              >${localize(hass, 'amb_ir_debug')}</span
            >
            ${this.switchButton('irDebug', model.tests.irDebug, localize(hass, 'amb_ir_debug'), disabled)}
          </div>`,
    )}
    ${this.section(
      'system',
      'mdi:chip',
      localize(hass, 'amb_system'),
      undefined,
      () =>
        html` <div class="diag">
            <div>
              <small>${localize(hass, 'wifi')}</small
              ><span
                >${model.diag.rssi === undefined ? '—' : `${fixed(hass, model.diag.rssi, 0)}\u00a0dBm`}${model.diag.ssid ? ` · ${model.diag.ssid}` : ''}</span
              >
            </div>
            <div><small>${localize(hass, 'ip')}</small><span>${model.diag.ip ?? '—'}</span></div>
            <div>
              <small>${localize(hass, 'amb_online_since')}</small
              ><span>${uptime === undefined ? '—' : formatDuration(hass, uptime)}</span>
            </div>
            <div>
              <small>${localize(hass, 'amb_ir_debug')}</small
              ><span
                >${model.tests.irDebug === undefined ? '—' : localize(hass, model.tests.irDebug ? 'on' : 'off')}</span
              >
            </div>
          </div>
          <div class="btns">
            ${button('refresh', 'mdi:autorenew', 'amb_refresh')}
            <button
              type="button"
              class=${classMap({ reset: true, btn: true, danger: true, armed: this.armed === 'restart' })}
              ?disabled=${disabled}
              @click=${() => this.confirm('restart', () => this.press('restart'))}
            >
              <ha-icon icon="mdi:restart"></ha-icon
              >${this.armed === 'restart' ? localize(hass, 'amb_tap_again') : localize(hass, 'amb_restart')}
            </button>
          </div>`,
    )}`;
  }

  protected override render() {
    const model = this.model;
    if (!model || !this.config) return nothing;
    const panes: Record<Tab, () => unknown> = {
      overview: () => this.renderOverview(model),
      fan: () => this.renderFan(model),
      ir: () => this.renderIr(model),
      maint: () => this.renderMaint(model),
    };
    return html`<div
      style=${styleMap({ '--source-rgb': SOURCE_RGB.join(', '), display: 'contents' })}
    >
      ${this.renderHead(model)}
      <div class="pane" style=${styleMap({ '--source-rgb': SOURCE_RGB.join(', ') })}>
        ${panes[this.tab]()}
      </div>
    </div>`;
  }
}

defineElement('vivid-ambilight-details', VividAmbilightDetails);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-ambilight-details': VividAmbilightDetails;
  }
}
