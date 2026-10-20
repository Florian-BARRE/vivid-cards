import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  applyColor,
  fireEvent,
  haptic,
  selectOption,
  setBrightness,
  setEffect,
  setNumber,
  toggleEntity,
} from '../../core/actions';
import { rgbCss } from '../../core/color';
import { isAvailable } from '../../core/entities';
import type { HassEntity, HomeAssistant, Rgb } from '../../core/hass-types';
import { localize, type StringKey } from '../../i18n';
import { defineElement } from '../../core/register';
import { buttonReset, tokens } from '../../components/shared-styles';
import {
  BLUE,
  EFFECT_CAPTURE,
  GREEN,
  RED,
  effectColor,
  healthColor,
  hubIcon,
  instanceColor,
  accentPair,
  type HubModel,
  type InstanceModel,
  type SourceKind,
  type ToggleKey,
} from './model';
import {
  chip,
  disc,
  fixed,
  hubStatus,
  hyperhdrStyles,
  instanceStatus,
  optionLabel,
  powerStyle,
  temperatureRgb,
} from './view';
import { tintFrame } from './vivid-hyperhdr-screen';
import './vivid-hyperhdr-screen';
import './vivid-hyperhdr-slider';

export type DetailsTab = 'overview' | 'colors' | 'processing' | 'system';
const TABS: { id: DetailsTab; icon: string; label: StringKey }[] = [
  { id: 'overview', icon: 'mdi:view-dashboard-outline', label: 'hh_tab_overview' },
  { id: 'colors', icon: 'mdi:palette-outline', label: 'hh_tab_colors' },
  { id: 'processing', icon: 'mdi:tune-variant', label: 'hh_tab_processing' },
  { id: 'system', icon: 'mdi:raspberry-pi', label: 'hh_tab_system' },
];

/** Colors offered for a solid color. */
const SWATCHES: Rgb[] = [
  [255, 138, 61],
  [255, 214, 170],
  [255, 255, 255],
  [239, 83, 80],
  [236, 64, 122],
  [171, 71, 188],
  [92, 107, 192],
  [38, 198, 218],
  [102, 187, 106],
];

interface SwitchRow {
  key: ToggleKey;
  icon: string;
  label: StringKey;
  rgb: Rgb;
  detail?: (instance: InstanceModel) => string | undefined;
}

/**
 * Details of a HyperHDR strip in four tabs: overview (picture, source,
 * brightness), colors, processing (smoothing, black borders, HDR) and
 * system (the machine and the grabber). Without a strip, the system alone
 * with the list of strips.
 */
export class VividHyperHdrDetails extends LitElement {
  static override properties = {
    hass: { attribute: false },
    hub: { attribute: false },
    instance: { attribute: false },
    instances: { attribute: false },
    sampled: { attribute: false },
    initialTab: { attribute: false },
    tab: { state: true },
    picking: { state: true },
  };

  declare hass?: HomeAssistant;
  declare hub?: HubModel;
  declare instance?: InstanceModel;
  declare instances: InstanceModel[];
  declare sampled?: Rgb[];
  /** Set when the dialog opens: the tab to show first. */
  declare initialTab?: DetailsTab;
  declare tab: DetailsTab;
  /** The source list unfolded in the overview. */
  declare picking?: 'effect' | 'color';

  constructor() {
    super();
    this.instances = [];
    this.tab = 'overview';
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('initialTab') && this.initialTab) {
      this.tab = this.initialTab;
      this.picking = undefined;
    }
  }

  static override styles = [
    tokens,
    buttonReset,
    hyperhdrStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 12px;
        --vivid-layer-2: color-mix(in srgb, var(--vivid-layer-0) 45%, var(--vivid-layer-1));
      }
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 4px;
      }
      .head .name {
        font-size: 18px;
      }
      .head .status {
        font-size: 13px;
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
        background: var(--vivid-layer-1);
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
      .sources {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px;
      }
      .source {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        padding: 10px 4px 9px;
        border-radius: 16px;
        background: var(--vivid-layer-1);
        font-size: 13px;
        font-weight: 600;
        min-width: 0;
      }
      .source small {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11.5px;
        font-weight: 400;
        color: var(--secondary-text-color);
      }
      .source.on {
        background: color-mix(in srgb, rgb(var(--src-rgb)) 14%, var(--vivid-layer-1));
        box-shadow: inset 0 0 0 1.5px rgba(var(--src-rgb), 0.7);
        color: color-mix(in srgb, rgb(var(--src-rgb)) 60%, var(--primary-text-color));
      }
      .source:disabled {
        opacity: 0.5;
        cursor: default;
      }
      .pick {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 8px;
        border-radius: 16px;
        background: var(--vivid-layer-1);
        max-height: 172px;
        overflow-y: auto;
      }
      .pick .chip {
        background: var(--vivid-layer-2);
      }
      .swatch {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--swatch);
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
      }
      .swatch.on {
        box-shadow:
          0 0 0 2px var(--vivid-layer-1),
          0 0 0 4px var(--primary-text-color);
      }
      .sliders {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 8px;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 46px;
        padding: 5px 8px 5px 6px;
        box-sizing: border-box;
        border-radius: 16px;
        background: var(--vivid-layer-1);
        font-size: 13.5px;
        text-align: left;
        width: 100%;
      }
      .row .disc {
        --vivid-glow-size: 32px;
        width: 32px;
        height: 32px;
        background: var(--disc-bg, var(--vivid-layer-2));
      }
      .row .disc ha-icon {
        --mdc-icon-size: 17px;
      }
      .row .names .name {
        font-size: 13.5px;
        font-weight: 500;
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
      .switch.on {
        background: var(--success-color, #66bb6a);
      }
      .switch.on::after {
        transform: translateX(16px);
        background: #fff;
        opacity: 1;
      }
      .options {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .option {
        height: 30px;
        padding: 0 12px;
        border-radius: 15px;
        background: var(--vivid-layer-1);
        color: var(--secondary-text-color);
        font-size: 12.5px;
      }
      .option[aria-pressed='true'] {
        background: rgba(var(--vivid-rgb-text), 0.16);
        color: var(--primary-text-color);
        font-weight: 600;
      }
      .group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .hint {
        padding: 10px 12px;
        border-radius: 14px;
        background: var(--vivid-layer-1);
        font-size: 12.5px;
        color: var(--secondary-text-color);
      }
      .strip-row .power {
        width: 48px;
        height: 32px;
      }
    `,
  ];

  /* --------------------------------- helpers -------------------------------- */

  private state(key: string): HassEntity | undefined {
    const id = this.instance?.entities[key] ?? this.hub?.entities[key];
    return id ? this.hass?.states[id] : undefined;
  }

  private call(run: (hass: HomeAssistant) => Promise<unknown>): void {
    const hass = this.hass;
    if (!hass) return;
    haptic(this, 'light');
    void run(hass);
  }

  private color(): Rgb {
    const instance = this.instance;
    if (!instance) return GREEN;
    const sampled = this.sampled;
    const mean = sampled?.length
      ? (sampled
          .reduce<Rgb>((t, [r, g, b]) => [t[0] + r, t[1] + g, t[2] + b], [0, 0, 0])
          .map((v) => Math.round(v / sampled.length)) as Rgb)
      : undefined;
    return instanceColor(instance, mean);
  }

  private slider(
    key: string,
    label: StringKey,
    rgb: Rgb,
    options: { digits?: number; unit?: string } = {},
  ) {
    const state = this.state(key);
    if (!state) return nothing;
    const attributes = state.attributes;
    const step = typeof attributes.step === 'number' ? attributes.step : 1;
    const digits = options.digits ?? (step < 0.1 ? 2 : step < 1 ? 1 : 0);
    const value = Number.parseFloat(state.state);
    return html`<vivid-hyperhdr-slider
      .value=${Number.isFinite(value) ? value : undefined}
      .min=${typeof attributes.min === 'number' ? attributes.min : 0}
      .max=${typeof attributes.max === 'number' ? attributes.max : 100}
      .step=${step}
      .digits=${digits}
      .label=${localize(this.hass, label)}
      .unit=${options.unit ?? (typeof attributes.unit_of_measurement === 'string' ? attributes.unit_of_measurement : '')}
      .color=${rgbCss(rgb)}
      ?disabled=${!isAvailable(state)}
      @vivid-slider-change=${(event: CustomEvent<{ value: number }>) =>
        this.call((hass) => setNumber(hass, state.entity_id, event.detail.value))}
    ></vivid-hyperhdr-slider>`;
  }

  private options(key: string, label: StringKey) {
    const state = this.state(key);
    const options = state?.attributes.options;
    if (!state || !Array.isArray(options) || !options.length) return nothing;
    return html`<div class="group">
      <div class="label">${localize(this.hass, label)}</div>
      <div class="options">
        ${options.map(
          (option) =>
            html`<button
              type="button"
              class="reset option"
              aria-pressed=${state.state === option ? 'true' : 'false'}
              ?disabled=${!isAvailable(state)}
              @click=${() => this.call((hass) => selectOption(hass, [state.entity_id], option))}
            >
              ${optionLabel(this.hass, state.entity_id, option)}
            </button>`,
        )}
      </div>
    </div>`;
  }

  private switchRow(row: SwitchRow) {
    const instance = this.instance;
    const toggle = instance?.toggles[row.key];
    if (!instance || !toggle) return nothing;
    return this.rowOf(
      row.icon,
      localize(this.hass, row.label),
      row.detail?.(instance),
      toggle.on,
      row.rgb,
      toggle.available,
      toggle.entity,
    );
  }

  private rowOf(
    icon: string,
    label: string,
    detail: string | undefined,
    on: boolean,
    rgb: Rgb,
    available: boolean,
    entity: string,
  ) {
    return html`<button
      type="button"
      class="reset row"
      role="switch"
      aria-checked=${on ? 'true' : 'false'}
      ?disabled=${!available}
      @click=${() => this.call((hass) => toggleEntity(hass, entity))}
    >
      ${disc(icon, on ? rgb : undefined, 0.7)}
      <span class="names"
        ><span class="name">${label}</span
        >${detail ? html`<span class="status">${detail}</span>` : nothing}</span
      >
      <span class=${classMap({ switch: true, on })}></span>
    </button>`;
  }

  /* ---------------------------------- head ---------------------------------- */

  private renderHead() {
    const hass = this.hass;
    const instance = this.instance;
    const hub = this.hub;
    if (instance) {
      const rgb = this.color();
      const parts = [
        instanceStatus(hass, instance),
        instance.ledCount ? localize(hass, 'hh_leds', { n: instance.ledCount }) : undefined,
      ].filter(Boolean);
      const sampled = this.sampled;
      const colors =
        instance.source === 'capture' && sampled?.length
          ? (accentPair(sampled) as Rgb[])
          : [rgb, rgb.map((v) => Math.round(v * 0.7)) as Rgb];
      return html`<div class="head">
        ${disc('mdi:television-ambient-light', instance.on ? rgb : undefined, 0.85)}
        <span class="names"
          ><span class="name">${instance.name}</span
          ><span class="status">${parts.join(' · ')}</span></span
        >
        <button
          type="button"
          class="reset power"
          role="switch"
          aria-checked=${instance.on ? 'true' : 'false'}
          aria-label=${localize(hass, instance.on ? 'power_off' : 'power_on')}
          ?disabled=${!instance.available}
          style=${styleMap(powerStyle(colors, instance.on))}
          @click=${() => this.call((h) => toggleEntity(h, instance.light))}
        >
          <ha-icon icon="mdi:power"></ha-icon>
        </button>
      </div>`;
    }
    if (!hub) return nothing;
    const status = hubStatus(hass, hub, this.instances);
    return html`<div class="head">
      ${disc(hubIcon(hub), healthColor(hub.health), 0.85)}
      <span class="names"
        ><span class="name">${hub.name}</span
        ><span class=${classMap({ status: true, [status.tone]: true })}>${status.text}</span></span
      >
    </div>`;
  }

  private renderTabs() {
    if (!this.instance) return nothing;
    return html`<div class="tabs" role="tablist">
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
            <ha-icon
              .icon=${tab.id === 'system' && this.hub ? hubIcon(this.hub) : tab.icon}
            ></ha-icon
            >${localize(this.hass, tab.label)}
          </button>`,
      )}
    </div>`;
  }

  /* -------------------------------- overview -------------------------------- */

  private sourceTile(
    kind: SourceKind,
    icon: string,
    label: StringKey,
    detail: string | undefined,
    rgb: Rgb,
    onClick: () => void,
  ) {
    const instance = this.instance;
    const on = !!instance?.on && instance.source === kind;
    return html`<button
      type="button"
      class=${classMap({ reset: true, source: true, on })}
      style=${styleMap({ '--src-rgb': rgb.join(', ') })}
      aria-pressed=${on ? 'true' : 'false'}
      ?disabled=${!instance?.available}
      @click=${onClick}
    >
      ${disc(icon, on ? rgb : undefined, 0.75, 'small')}${localize(this.hass, label)}<small
        >${detail ?? '\u00a0'}</small
      >
    </button>`;
  }

  private renderOverview(instance: InstanceModel) {
    const hass = this.hass;
    const hub = this.hub;
    const rgb = this.color();
    const camera = hub?.camera ?? instance.ledCamera;
    const source = this.state('select.source');
    const forced = source && source.state !== 'auto' && isAvailable(source);
    const gain = this.state('number.brightness_gain');
    const effectRgb = effectColor(instance.effect);
    const colorRgb = instance.color ?? [255, 138, 61];
    return html`<div class="pane">
      ${
        camera
          ? html`<vivid-hyperhdr-screen
              .hass=${hass}
              .camera=${camera}
              .fallback=${tintFrame(instance.on ? rgb : [70, 70, 70])}
              .tags=${[localize(hass, 'hh_live'), instance.toggles.hdr?.on ? localize(hass, 'hh_hdr') : undefined]}
            ></vivid-hyperhdr-screen>`
          : html`<div class="hint">${localize(hass, 'hh_no_picture')}</div>`
      }
      <div class="label">
        ${localize(hass, 'hh_source')}<em
          >${
            forced
              ? localize(hass, 'hh_source_forced', {
                  source: optionLabel(hass, source.entity_id, source.state),
                })
              : localize(hass, 'hh_source_auto')
          }</em
        >
      </div>
      <div class="sources">
        ${this.sourceTile('capture', 'mdi:video-input-hdmi', 'hh_capture', undefined, BLUE, () => {
          this.picking = undefined;
          this.call((h) => setEffect(h, instance.light, EFFECT_CAPTURE));
        })}
        ${this.sourceTile(
          'effect',
          'mdi:creation',
          'hh_effect',
          instance.source === 'effect' ? instance.effect : undefined,
          effectRgb,
          () => {
            this.picking = this.picking === 'effect' ? undefined : 'effect';
          },
        )}
        ${this.sourceTile('color', 'mdi:palette', 'hh_color', undefined, colorRgb, () => {
          this.picking = this.picking === 'color' ? undefined : 'color';
        })}
      </div>
      ${this.picking === 'effect' ? this.renderEffects(instance) : nothing}
      ${this.picking === 'color' ? this.renderSwatches(instance) : nothing}
      ${
        source && Array.isArray(source.attributes.options) && source.attributes.options.length > 1
          ? this.options('select.source', 'hh_source')
          : nothing
      }
      <vivid-hyperhdr-slider
        .value=${instance.brightness}
        .min=${0}
        .max=${typeof gain?.attributes.max === 'number' ? gain.attributes.max : 100}
        icon="mdi:brightness-6"
        .label=${localize(hass, 'brightness')}
        unit="%"
        .color=${rgbCss(instance.on ? rgb : [120, 120, 120])}
        ?disabled=${!instance.available}
        @vivid-slider-change=${(event: CustomEvent<{ value: number }>) =>
          this.call((h) =>
            gain
              ? setNumber(h, gain.entity_id, event.detail.value)
              : setBrightness(h, instance.light, event.detail.value),
          )}
      ></vivid-hyperhdr-slider>
    </div>`;
  }

  private renderEffects(instance: InstanceModel) {
    return html`<div class="pick">
      ${instance.effects.map((name) =>
        chip('mdi:creation', name, {
          on: instance.source === 'effect' && instance.effect === name,
          rgb: effectColor(name),
          onClick: () => this.call((h) => setEffect(h, instance.light, name)),
        }),
      )}
    </div>`;
  }

  private renderSwatches(instance: InstanceModel) {
    const current = instance.source === 'color' ? instance.color : undefined;
    return html`<div class="pick">
      ${SWATCHES.map(
        (rgb) =>
          html`<button
            type="button"
            class=${classMap({
              reset: true,
              swatch: true,
              on:
                !!current &&
                current.every((value, index) => Math.abs(value - (rgb[index] ?? 0)) < 6),
            })}
            style=${styleMap({ '--swatch': rgbCss(rgb) })}
            aria-label=${rgbCss(rgb)}
            @click=${() => this.call((h) => applyColor(h, instance.light, { rgb }))}
          ></button>`,
      )}
      ${chip('mdi:palette', localize(this.hass, 'hh_open_more'), {
        onClick: () => fireEvent(this, 'vivid-more-info', { entityId: instance.light }),
      })}
    </div>`;
  }

  /* --------------------------------- colors --------------------------------- */

  private renderColors() {
    const any =
      this.state('number.saturation_gain') ||
      this.state('number.gamma') ||
      this.state('select.color_temperature');
    return html`<div class="pane">
      <div class="sliders">
        ${this.slider('number.saturation_gain', 'hh_saturation', [186, 104, 200])}
        ${this.slider('number.gamma', 'hh_gamma', BLUE)}
        ${this.slider('number.backlight', 'hh_backlight', [144, 164, 174])}
      </div>
      ${this.options('select.color_temperature', 'hh_color_temp')}
      ${this.options('select.processing', 'hh_processing')}
      ${any ? nothing : html`<div class="hint">${localize(this.hass, 'hh_admin_hint')}</div>`}
    </div>`;
  }

  /* ------------------------------- processing ------------------------------- */

  private renderProcessing() {
    const hass = this.hass;
    const smoothingTime = this.state('number.smoothing_time');
    const smoothingType = this.state('select.smoothing_type');
    const borderMode = this.state('select.blackborder_mode');
    const rows: SwitchRow[] = [
      {
        key: 'smoothing',
        icon: 'mdi:waveform',
        label: 'hh_smoothing',
        rgb: [186, 104, 200],
        detail: () =>
          [
            smoothingTime && isAvailable(smoothingTime)
              ? `${smoothingTime.state}\u00a0ms`
              : undefined,
            smoothingType && isAvailable(smoothingType)
              ? optionLabel(hass, smoothingType.entity_id, smoothingType.state)
              : undefined,
          ]
            .filter(Boolean)
            .join(' · ') || undefined,
      },
      {
        key: 'black_border',
        icon: 'mdi:border-none-variant',
        label: 'hh_black_border_long',
        rgb: BLUE,
        detail: () =>
          borderMode && isAvailable(borderMode)
            ? optionLabel(hass, borderMode.entity_id, borderMode.state)
            : undefined,
      },
      { key: 'hdr', icon: 'mdi:hdr', label: 'hh_tone_mapping', rgb: [255, 213, 79] },
      {
        key: 'auto_tone_mapping',
        icon: 'mdi:auto-fix',
        label: 'hh_auto_tone',
        rgb: [255, 213, 79],
      },
      { key: 'continuous_output', icon: 'mdi:repeat', label: 'hh_continuous', rgb: GREEN },
      { key: 'anti_flickering', icon: 'mdi:filter-outline', label: 'hh_anti_flicker', rgb: GREEN },
      {
        key: 'background_effect',
        icon: 'mdi:wallpaper',
        label: 'hh_background',
        rgb: [126, 87, 194],
      },
      { key: 'boot_effect', icon: 'mdi:play-box-outline', label: 'hh_boot', rgb: [126, 87, 194] },
    ];
    return html`<div class="pane">
      <div class="group">${rows.map((row) => this.switchRow(row))}</div>
      ${this.slider('number.smoothing_time', 'hh_smoothing_time', [186, 104, 200], { digits: 0 })}
      ${this.options('select.smoothing_type', 'hh_smoothing_type')}
      ${this.slider('number.blackborder_threshold', 'hh_black_border_long', BLUE)}
      ${this.options('select.blackborder_mode', 'hh_black_border_mode')}
      ${smoothingType ? nothing : html`<div class="hint">${localize(hass, 'hh_admin_hint')}</div>`}
    </div>`;
  }

  /* --------------------------------- system --------------------------------- */

  private badge(icon: string, text: string, rgb?: Rgb) {
    return chip(icon, text, { on: !!rgb, rgb });
  }

  private renderSystem() {
    const hass = this.hass;
    const hub = this.hub;
    const instance = this.instance;
    if (!hub) return nothing;
    const signal = (hub.captureFps ?? 0) > 0;
    const grabber = [hub.grabber, hub.videoMode].filter(Boolean).join(' · ');
    const badges = [
      hub.temperature === undefined
        ? nothing
        : this.badge(
            'mdi:thermometer',
            `${fixed(hass, hub.temperature, 1)}\u00a0°C`,
            temperatureRgb(hub.temperature),
          ),
      hub.cpu === undefined
        ? nothing
        : this.badge(
            'mdi:cpu-64-bit',
            `${localize(hass, 'hh_cpu')} ${fixed(hass, hub.cpu, 0)}\u00a0%`,
          ),
      hub.memory === undefined
        ? nothing
        : this.badge(
            'mdi:memory',
            `${localize(hass, 'hh_ram')} ${fixed(hass, hub.memory, 0)}\u00a0%`,
          ),
      hub.undervoltage === undefined
        ? nothing
        : this.badge(
            hub.undervoltage ? 'mdi:flash-alert' : 'mdi:flash',
            localize(hass, hub.undervoltage ? 'hh_undervoltage' : 'hh_power_ok'),
            hub.undervoltage ? RED : GREEN,
          ),
    ];
    const capture = instance?.toggles.video_capture;
    const output = instance?.toggles.led_output;
    return html`<div class="pane">
      ${
        instance
          ? html`<div class="head" style="padding: 0 2px">
              ${disc(hubIcon(hub), healthColor(hub.health), 0.8, 'small')}
              <span class="names"
                ><span class="name" style="font-size: 15px">${hub.name}</span
                ><span class="status">${hubStatus(hass, hub, this.instances).text}</span></span
              >
            </div>`
          : nothing
      }
      <div class="chips">${badges}</div>
      ${
        grabber
          ? html`<div class="row">
              ${disc('mdi:video-input-hdmi', signal ? BLUE : undefined, 0.6)}
              <span class="names"
                ><span class="name">${localize(hass, 'hh_grabber')} · ${grabber}</span
                ><span class="status"
                  >${[
                    localize(hass, signal ? 'hh_signal' : 'hh_no_signal'),
                    hub.captureFps === undefined
                      ? undefined
                      : localize(hass, 'hh_fps', { n: fixed(hass, hub.captureFps, 0) }),
                  ]
                    .filter(Boolean)
                    .join(' · ')}</span
                ></span
              >
            </div>`
          : nothing
      }
      ${
        capture
          ? this.rowOf(
              'mdi:video-input-hdmi',
              localize(hass, 'hh_capture_switch'),
              undefined,
              capture.on,
              BLUE,
              capture.available,
              capture.entity,
            )
          : nothing
      }
      ${
        output
          ? this.rowOf(
              'mdi:led-strip-variant',
              localize(hass, 'hh_led_output'),
              undefined,
              output.on,
              GREEN,
              output.available,
              output.entity,
            )
          : nothing
      }
      ${instance ? nothing : this.renderStrips()}
      ${
        hub.version
          ? html`<div class="row">
              ${disc('mdi:information-outline', undefined)}
              <span class="names"
                ><span class="name">${localize(hass, 'hh_version')} ${hub.version}</span
                >${hub.architecture ? html`<span class="status">${hub.architecture}</span>` : nothing}</span
              >
            </div>`
          : nothing
      }
    </div>`;
  }

  private renderStrips() {
    if (!this.instances.length) return nothing;
    const hass = this.hass;
    return html`<div class="label">${localize(hass, 'hh_strips')}</div>
      <div class="group">
        ${this.instances.map((item) => {
          const rgb = instanceColor(item);
          return html`<div class="row strip-row">
            <button
              type="button"
              class="reset"
              style="display: flex; align-items: center; gap: 10px; flex: 1 1 auto; min-width: 0; text-align: left"
              @click=${() => fireEvent(this, 'vivid-hyperhdr-open', { instance: item.deviceId })}
            >
              ${disc('mdi:television-ambient-light', item.on ? rgb : undefined, 0.75)}
              <span class="names"
                ><span class="name">${item.name}</span
                ><span class="status">${instanceStatus(hass, item)}</span></span
              >
            </button>
            <button
              type="button"
              class="reset power"
              role="switch"
              aria-checked=${item.on ? 'true' : 'false'}
              aria-label=${localize(hass, item.on ? 'power_off' : 'power_on')}
              ?disabled=${!item.available}
              style=${styleMap(powerStyle([rgb, rgb.map((v) => Math.round(v * 0.7)) as Rgb], item.on))}
              @click=${() => this.call((h) => toggleEntity(h, item.light))}
            >
              <ha-icon icon="mdi:power"></ha-icon>
            </button>
          </div>`;
        })}
      </div>`;
  }

  protected override render() {
    const instance = this.instance;
    const tab = instance ? this.tab : 'system';
    return html`${this.renderHead()}${this.renderTabs()}${
      tab === 'overview' && instance
        ? this.renderOverview(instance)
        : tab === 'colors'
          ? this.renderColors()
          : tab === 'processing'
            ? this.renderProcessing()
            : this.renderSystem()
    }`;
  }
}

defineElement('vivid-hyperhdr-details', VividHyperHdrDetails);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-hyperhdr-details': VividHyperHdrDetails;
  }
}
