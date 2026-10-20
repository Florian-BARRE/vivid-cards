import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { haptic, openMoreInfo, setBrightness, setNumber, toggleEntity } from '../../core/actions';
import { rgbCss } from '../../core/color';
import { glowVars } from '../../core/glow';
import type { HomeAssistant, LovelaceGridOptions, Rgb } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { localize } from '../../i18n';
import { buttonReset, tokens } from '../../components/shared-styles';
import { VividDialog } from '../../components/vivid-dialog';
import { watchedChanged } from '../led-group/model';
import {
  HYPERHDR_CARD,
  resolveHyperHdrConfig,
  type HyperHdrCardConfig,
  type ResolvedHyperHdrConfig,
} from './config';
import {
  BLUE,
  buildModel,
  findDevices,
  healthColor,
  hubIcon,
  instanceColor,
  accentPair,
  type HubModel,
  type HyperHdrDevices,
  type HyperHdrModel,
  type InstanceModel,
  type ToggleKey,
} from './model';
import {
  chip,
  disc,
  fixed,
  hubStatus,
  hyperhdrStyles,
  instanceStatus,
  powerStyle,
  sourceText,
  temperatureRgb,
} from './view';
import { tintFrame } from './vivid-hyperhdr-screen';
import type { DetailsTab } from './vivid-hyperhdr-details';
import './vivid-hyperhdr-card-editor';
import './vivid-hyperhdr-details';
import './vivid-hyperhdr-screen';
import './vivid-hyperhdr-slider';

export const STRIP_ICON = 'mdi:television-ambient-light';

/** Chips of the strip card: the components switched most often. */
const STRIP_CHIPS: {
  key: ToggleKey;
  icon: string;
  label: 'hh_hdr' | 'hh_smoothing' | 'hh_black_border';
  rgb: Rgb;
}[] = [
  { key: 'hdr', icon: 'mdi:hdr', label: 'hh_hdr', rgb: [255, 213, 79] },
  { key: 'smoothing', icon: 'mdi:waveform', label: 'hh_smoothing', rgb: [186, 104, 200] },
  { key: 'black_border', icon: 'mdi:border-none-variant', label: 'hh_black_border', rgb: BLUE },
];

/**
 * HyperHDR, from the HA-HyperHDR integration: one LED strip (an instance)
 * with the captured picture framed by its colors, the machine HyperHDR runs
 * on, or both. A tap opens the details: picture and source, colors,
 * processing, system.
 */
export class VividHyperHdrCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    sampled: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: ResolvedHyperHdrConfig;
  /** Colors read around the captured picture, by instance device. */
  declare sampled: Record<string, Rgb[]>;

  private devices?: HyperHdrDevices;
  private devicesFor?: HomeAssistant['entities'];
  private model?: HyperHdrModel;
  private dialog?: VividDialog;
  private dialogTarget?: { instance?: string; tab: DetailsTab };

  constructor() {
    super();
    this.sampled = {};
  }

  static getConfigElement(): HTMLElement {
    return document.createElement('vivid-hyperhdr-card-editor');
  }

  static getStubConfig(hass?: HomeAssistant): Partial<HyperHdrCardConfig> {
    const server = hass ? findDevices(hass).servers[0] : undefined;
    return server ? { mode: 'all', server } : { mode: 'all' };
  }

  setConfig(config: HyperHdrCardConfig): void {
    this._config = resolveHyperHdrConfig(config);
  }

  getCardSize(): number {
    const mode = this._config?.mode ?? 'all';
    if (mode === 'strip') return this._config?.picture === false ? 3 : 6;
    if (mode === 'hub') return 3;
    return 2 + (this.model?.instances.length ?? 1);
  }

  getGridOptions(): LovelaceGridOptions {
    return { columns: 12, min_columns: 6, rows: 'auto' };
  }

  static override styles = [
    tokens,
    buttonReset,
    hyperhdrStyles,
    css`
      :host {
        display: block;
      }
      ha-card {
        height: 100%;
        box-sizing: border-box;
        background: none;
        border: none;
        box-shadow: none;
        overflow: visible;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
        container-type: inline-size;
      }
      .panel.offline .dim {
        opacity: 0.55;
        filter: grayscale(0.8);
      }
      .head {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .title {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1 1 auto;
        min-width: 0;
        padding: 2px;
        border-radius: 14px;
      }
      .values {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: none;
        padding: 4px 2px;
        border-radius: 12px;
      }
      .value {
        display: inline-flex;
        align-items: center;
        gap: 1px;
        font-size: 16px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .value ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
      }
      .value small {
        margin-left: 1px;
        font-size: 11px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .rows {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 6px 6px 6px;
        border-radius: 18px;
        background: var(--vivid-layer-2);
        --vivid-layer-2: color-mix(in srgb, var(--vivid-layer-0) 45%, var(--vivid-layer-1));
      }
      .row .open {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1 1 auto;
        min-width: 0;
        border-radius: 14px;
      }
      .row .name {
        font-size: 14px;
      }
      .row .power {
        width: 48px;
        height: 32px;
        background: var(
          --power-bg,
          color-mix(in srgb, var(--vivid-layer-0) 70%, var(--vivid-layer-1))
        );
      }
      .grabber {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 10px 6px 6px;
        border-radius: 18px;
        background: var(--vivid-layer-2);
        text-align: left;
      }
      .grabber .name {
        font-size: 13.5px;
        font-weight: 500;
      }
      .empty {
        padding: 8px 4px;
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .warning {
        padding: 16px;
        color: var(--error-color, #db4437);
      }
      @container (max-width: 340px) {
        .values .cpu {
          display: none;
        }
      }
    `,
  ];

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.dialog?.unmount();
  }

  protected override shouldUpdate(changed: PropertyValues<this>): boolean {
    if (!this.hass || !this._config) return changed.has('_config');
    if (changed.size === 1 && changed.has('hass')) {
      return watchedChanged(changed.get('hass'), this.hass, this.model?.watched ?? []);
    }
    return true;
  }

  protected override willUpdate(): void {
    const hass = this.hass;
    const config = this._config;
    if (!hass || !config) return;
    if (this.devicesFor !== hass.entities || !this.devices) {
      this.devices = findDevices(hass);
      this.devicesFor = hass.entities;
    }
    const instance =
      config.mode === 'strip'
        ? (config.instance ??
          (config.server
            ? this.devices.instances[config.server]?.[0]
            : Object.values(this.devices.instances)[0]?.[0]))
        : undefined;
    this.model = buildModel(hass, this.devices, config.server, instance);
  }

  protected override updated(): void {
    if (this.dialog?.open) this.renderDialogContent();
  }

  /* --------------------------------- actions -------------------------------- */

  private colorOf(model: InstanceModel): Rgb {
    const sampled = this.sampled[model.deviceId];
    return instanceColor(model, sampled?.length ? meanOf(sampled) : undefined);
  }

  private powerColors(model: InstanceModel): Rgb[] {
    const sampled = this.sampled[model.deviceId];
    if (model.source === 'capture' && sampled?.length) {
      return accentPair(sampled) as Rgb[];
    }
    const rgb = this.colorOf(model);
    return [rgb, rgb.map((value) => Math.round(value * 0.7)) as Rgb];
  }

  private readonly onColors = (deviceId: string) => (event: CustomEvent<{ colors: Rgb[] }>) => {
    this.sampled = { ...this.sampled, [deviceId]: event.detail.colors };
  };

  private toggle(model: InstanceModel, event?: Event): void {
    event?.stopPropagation();
    const hass = this.hass;
    if (!hass || !model.available) return;
    haptic(this, 'light');
    void toggleEntity(hass, model.light);
  }

  private toggleComponent(model: InstanceModel, key: ToggleKey): void {
    const hass = this.hass;
    const toggle = model.toggles[key];
    if (!hass || !toggle?.available) return;
    haptic(this, 'light');
    void toggleEntity(hass, toggle.entity);
  }

  private setBrightness(model: InstanceModel, value: number): void {
    const hass = this.hass;
    if (!hass) return;
    const gain = model.entities['number.brightness_gain'];
    if (gain && hass.states[gain]) void setNumber(hass, gain, value);
    else void setBrightness(hass, model.light, value);
  }

  /* --------------------------------- details -------------------------------- */

  openDetails(instance?: string, tab: DetailsTab = 'overview'): void {
    if (!this.model) return;
    this.dialogTarget = { instance, tab: instance ? tab : 'system' };
    if (!this.dialog) {
      this.dialog = new VividDialog();
      this.dialog.addEventListener('vivid-dialog-close-request', () => this.dialog?.hide());
      this.dialog.addEventListener('vivid-more-info', ((
        event: CustomEvent<{ entityId: string }>,
      ) => {
        const entityId = event.detail.entityId;
        this.dialog?.hide();
        window.setTimeout(() => openMoreInfo(this, entityId), 50);
      }) as EventListener);
      this.dialog.addEventListener('vivid-hyperhdr-open', ((
        event: CustomEvent<{ instance: string }>,
      ) => {
        this.openDetails(event.detail.instance);
      }) as EventListener);
      this.dialog.addEventListener('vivid-screen-colors', ((
        event: CustomEvent<{ colors: Rgb[] }>,
      ) => {
        const id = this.dialogTarget?.instance;
        if (id) this.sampled = { ...this.sampled, [id]: event.detail.colors };
      }) as EventListener);
    }
    haptic(this, 'light');
    this.renderDialogContent(true);
    this.dialog.show();
  }

  private renderDialogContent(reset = false): void {
    const dialog = this.dialog;
    const model = this.model;
    const config = this._config;
    const target = this.dialogTarget;
    if (!dialog || !model || !config || !target) return;
    const instance = model.strips.find((item) => item.deviceId === target.instance);
    dialog.label = instance?.name ?? model.hub?.name ?? 'HyperHDR';
    dialog.closeLabel = localize(this.hass, 'close');
    for (const [name, value] of Object.entries(glowVars(config.glow))) {
      dialog.style.setProperty(name, value);
    }
    dialog.content = html`<vivid-hyperhdr-details
      .hass=${this.hass}
      .hub=${model.hub}
      .instance=${instance}
      .instances=${model.strips}
      .sampled=${instance ? this.sampled[instance.deviceId] : undefined}
      .initialTab=${reset ? target.tab : undefined}
    ></vivid-hyperhdr-details>`;
  }

  /* --------------------------------- render --------------------------------- */

  private renderHubHead(hub: HubModel, model: HyperHdrModel, full: boolean) {
    const hass = this.hass;
    const status = hubStatus(hass, hub, model.strips);
    const rgb = healthColor(hub.health);
    const t = hub.temperature;
    return html`<div class="head">
      <button
        type="button"
        class="reset title"
        title=${localize(hass, 'details')}
        @click=${() => this.openDetails(undefined, 'system')}
      >
        ${disc(hubIcon(hub), rgb, hub.health === 'ok' ? 0.7 : 0.95)}
        <span class="names">
          <span class="name">${this._config?.name ?? hub.name}</span>
          <span class=${classMap({ status: true, [status.tone]: true })}>${status.text}</span>
        </span>
      </button>
      ${
        hub.connected
          ? html`<button
              type="button"
              class="reset values"
              title=${localize(hass, 'details')}
              @click=${() => this.openDetails(undefined, 'system')}
            >
              ${
                t === undefined
                  ? nothing
                  : html`<span class="value"
                      ><ha-icon
                        icon="mdi:thermometer"
                        style=${styleMap({ color: rgbCss(temperatureRgb(t)) })}
                      ></ha-icon
                      >${fixed(hass, t, 1)}<small>°C</small></span
                    >`
              }
              ${
                full || hub.cpu === undefined
                  ? nothing
                  : html`<span class="value cpu"
                      ><ha-icon
                        icon="mdi:cpu-64-bit"
                        style=${styleMap({ color: rgbCss(BLUE) })}
                      ></ha-icon
                      >${fixed(hass, hub.cpu, 0)}<small>%</small></span
                    >`
              }
            </button>`
          : nothing
      }
    </div>`;
  }

  private renderHubBody(hub: HubModel) {
    const hass = this.hass;
    if (!hub.connected) return nothing;
    const chips = [
      hub.cpu === undefined
        ? nothing
        : chip('mdi:cpu-64-bit', `${localize(hass, 'hh_cpu')} ${fixed(hass, hub.cpu, 0)}\u00a0%`),
      hub.memory === undefined
        ? nothing
        : chip('mdi:memory', `${localize(hass, 'hh_ram')} ${fixed(hass, hub.memory, 0)}\u00a0%`),
      hub.undervoltage === undefined
        ? nothing
        : chip(
            hub.undervoltage ? 'mdi:flash-alert' : 'mdi:flash',
            localize(hass, hub.undervoltage ? 'hh_undervoltage' : 'hh_power_ok'),
            { on: true, rgb: hub.undervoltage ? [239, 83, 80] : [102, 187, 106] },
          ),
    ];
    const signal = (hub.captureFps ?? 0) > 0;
    const grabber = [hub.grabber, hub.videoMode].filter(Boolean).join(' · ');
    const detail = [
      localize(hass, signal ? 'hh_signal' : 'hh_no_signal'),
      hub.captureFps === undefined
        ? undefined
        : localize(hass, 'hh_fps', { n: fixed(hass, hub.captureFps, 0) }),
    ]
      .filter(Boolean)
      .join(' · ');
    return html`<div class="chips">${chips}</div>
      ${
        grabber
          ? html`<button
              type="button"
              class="reset grabber"
              @click=${() => this.openDetails(undefined, 'system')}
            >
              ${disc('mdi:video-input-hdmi', signal ? BLUE : undefined, 0.6, 'small')}
              <span class="names"
                ><span class="name">${grabber}</span><span class="status">${detail}</span></span
              >
            </button>`
          : nothing
      }`;
  }

  private renderPower(model: InstanceModel) {
    const hass = this.hass;
    const label = localize(hass, model.on ? 'power_off' : 'power_on');
    return html`<button
      type="button"
      class="reset power"
      role="switch"
      aria-checked=${model.on ? 'true' : 'false'}
      aria-label=${`${model.name} · ${label}`}
      title=${label}
      ?disabled=${!model.available}
      style=${styleMap(powerStyle(this.powerColors(model), model.on))}
      @click=${(event: Event) => this.toggle(model, event)}
    >
      <ha-icon icon="mdi:power"></ha-icon>
    </button>`;
  }

  private renderRow(model: InstanceModel) {
    const rgb = model.on ? this.colorOf(model) : undefined;
    return html`<div class="row">
      <button
        type="button"
        class="reset open"
        title=${localize(this.hass, 'details')}
        @click=${() => this.openDetails(model.deviceId)}
      >
        ${disc(STRIP_ICON, rgb, 0.8, 'small')}
        <span class="names">
          <span class="name">${model.name}</span>
          <span class="status">${instanceStatus(this.hass, model)}</span>
        </span>
      </button>
      ${this.renderPower(model)}
    </div>`;
  }

  private renderStrip(model: InstanceModel, hub: HubModel | undefined) {
    const hass = this.hass;
    const config = this._config;
    const rgb = this.colorOf(model);
    const camera = hub?.camera ?? model.ledCamera;
    const gain = model.entities['number.brightness_gain'];
    const gainState = gain ? hass?.states[gain] : undefined;
    const max = typeof gainState?.attributes.max === 'number' ? gainState.attributes.max : 100;
    const hdr = model.toggles.hdr?.on;
    return html`<div class="head">
        <button
          type="button"
          class="reset title"
          title=${localize(hass, 'details')}
          @click=${() => this.openDetails(model.deviceId)}
        >
          ${disc(STRIP_ICON, model.on ? rgb : undefined, 0.85)}
          <span class="names">
            <span class="name">${config?.name ?? model.name}</span>
            <span class="status">${instanceStatus(hass, model)}</span>
          </span>
        </button>
        ${this.renderPower(model)}
      </div>
      ${
        config?.picture && camera
          ? html`<vivid-hyperhdr-screen
              class="dim"
              .hass=${hass}
              .camera=${camera}
              .fallback=${tintFrame(model.on ? rgb : [70, 70, 70])}
              .tags=${[localize(hass, 'hh_live'), hdr ? localize(hass, 'hh_hdr') : undefined]}
              @vivid-screen-colors=${this.onColors(model.deviceId)}
            ></vivid-hyperhdr-screen>`
          : nothing
      }
      <vivid-hyperhdr-slider
        .value=${model.brightness}
        .min=${0}
        .max=${max}
        .step=${1}
        icon="mdi:brightness-6"
        unit="%"
        .color=${rgbCss(model.on ? rgb : [120, 120, 120])}
        ?disabled=${!model.available}
        @vivid-slider-change=${(event: CustomEvent<{ value: number }>) =>
          this.setBrightness(model, event.detail.value)}
      ></vivid-hyperhdr-slider>
      <div class="chips">
        ${chip(
          model.source === 'effect'
            ? 'mdi:creation'
            : model.source === 'color'
              ? 'mdi:palette'
              : 'mdi:video-input-hdmi',
          sourceText(hass, model),
          {
            on: model.on,
            rgb: model.source === 'capture' ? BLUE : rgb,
            caret: true,
            onClick: () => this.openDetails(model.deviceId),
          },
        )}
        ${STRIP_CHIPS.map((item) => {
          const toggle = model.toggles[item.key];
          if (!toggle) return nothing;
          return chip(item.icon, localize(hass, item.label), {
            on: toggle.on,
            rgb: item.rgb,
            disabled: !toggle.available,
            onClick: () => this.toggleComponent(model, item.key),
          });
        })}
      </div>`;
  }

  protected override render() {
    const config = this._config;
    const model = this.model;
    const hass = this.hass;
    if (!config || !hass) return nothing;
    if (!model?.hub && !model?.instances.length) {
      return html`<ha-card><div class="warning">${localize(hass, 'hh_not_found')}</div></ha-card>`;
    }
    const hub = model.hub;
    const offline = hub ? !hub.connected : false;
    let body: unknown;
    if (config.mode === 'strip') {
      const instance = model.instances[0];
      body = instance
        ? this.renderStrip(instance, hub)
        : html`<div class="warning">${localize(hass, 'hh_not_found')}</div>`;
    } else if (config.mode === 'hub') {
      body = hub
        ? html`${this.renderHubHead(hub, model, true)}${this.renderHubBody(hub)}`
        : nothing;
    } else {
      body = html`${hub ? this.renderHubHead(hub, model, false) : nothing}
        <div class="rows dim">${model.instances.map((item) => this.renderRow(item))}</div>`;
    }
    return html`<ha-card>
      <div class=${classMap({ panel: true, offline })} style=${styleMap(glowVars(config.glow))}>
        ${body}
      </div>
    </ha-card>`;
  }
}

function meanOf(colors: Rgb[]): Rgb {
  const sum = colors.reduce<Rgb>(
    (total, [r, g, b]) => [total[0] + r, total[1] + g, total[2] + b],
    [0, 0, 0],
  );
  return sum.map((value) => Math.round(value / colors.length)) as Rgb;
}

defineElement(HYPERHDR_CARD, VividHyperHdrCard);

registerCard({
  type: HYPERHDR_CARD,
  name: 'Vivid HyperHDR',
  description:
    'HyperHDR from the HA-HyperHDR integration: an LED strip with the captured picture, the machine it runs on, or both.',
  preview: false,
  documentationURL: `${REPOSITORY_URL}#vivid-hyperhdr-card`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-hyperhdr-card': VividHyperHdrCard;
  }
}
