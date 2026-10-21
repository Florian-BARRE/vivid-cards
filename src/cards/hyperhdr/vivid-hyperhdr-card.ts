import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { haptic, openMoreInfo, toggleEntity } from '../../core/actions';
import { rgbCss } from '../../core/color';
import { glowVars, tintTone } from '../../core/glow';
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
  type StripIcon,
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
  RED,
} from './model';
import {
  disc,
  fixed,
  hubLine,
  hyperhdrStyles,
  powerStyle,
  stripLine,
  temperatureRgb,
} from './view';
import type { DetailsTab } from './vivid-hyperhdr-details';
import './vivid-hyperhdr-card-editor';
import './vivid-hyperhdr-details';

export const STRIP_ICON = 'mdi:television-ambient-light';

const VIOLET: Rgb = [167, 139, 250];

/** How each component shows on a strip's line. */
const ICONS: Record<
  StripIcon,
  {
    icon: string;
    label: 'hh_led_output' | 'hh_capture_switch' | 'hh_hdr' | 'hh_smoothing' | 'hh_black_border';
    rgb: Rgb;
  }
> = {
  led_output: { icon: 'mdi:led-on', label: 'hh_led_output', rgb: [102, 187, 106] },
  video_capture: { icon: 'mdi:video-input-hdmi', label: 'hh_capture_switch', rgb: BLUE },
  hdr: { icon: 'mdi:hdr', label: 'hh_hdr', rgb: [255, 213, 79] },
  smoothing: { icon: 'mdi:waveform', label: 'hh_smoothing', rgb: [186, 104, 200] },
  black_border: { icon: 'mdi:border-none-variant', label: 'hh_black_border', rgb: BLUE },
};

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
    if (mode !== 'all' || this._config?.showStrips === false) return 1;
    return 1 + Math.ceil((this.model?.instances.length ?? 1) * 0.8);
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
        gap: 6px;
        padding: 8px;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
        container-type: inline-size;
      }
      .panel.offline .dim {
        opacity: 0.55;
        filter: grayscale(0.8);
      }
      .line,
      .strip .open {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1 1 auto;
        min-width: 0;
        padding: 2px;
        border-radius: 16px;
        text-align: left;
      }
      .strip {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .strip.row {
        padding: 4px 6px 4px 4px;
        border-radius: 18px;
        background: var(--vivid-layer-2);
        --vivid-layer-2: color-mix(in srgb, var(--vivid-layer-0) 45%, var(--vivid-layer-1));
      }
      .strip.row .name {
        font-size: 14px;
      }
      .values,
      .icons {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: none;
      }
      .icons {
        gap: 4px;
      }
      .icons:empty {
        display: none;
      }
      .value {
        display: inline-flex;
        align-items: center;
        gap: 1px;
        font-size: 15px;
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
      /* A component's state: lit when on, faint when off. */
      .state {
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--disc-bg, transparent);
        color: var(--disc-color, var(--secondary-text-color));
      }
      .state.off {
        opacity: 0.45;
      }
      .state ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
      }
      .rows {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .power {
        width: 48px;
        height: 34px;
        flex: none;
      }
      .row .power {
        height: 32px;
        background: var(
          --power-bg,
          color-mix(in srgb, var(--vivid-layer-0) 70%, var(--vivid-layer-1))
        );
      }
      .warning {
        padding: 16px;
        color: var(--error-color, #db4437);
      }
      /* Narrow cards: the values go before the text does. */
      @container (max-width: 330px) {
        .values .value:not(:first-child) {
          display: none;
        }
        .icons {
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

  private toggle(model: InstanceModel, event?: Event): void {
    event?.stopPropagation();
    const hass = this.hass;
    if (!hass || !model.available) return;
    haptic(this, 'light');
    void toggleEntity(hass, model.light);
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
      .pictureTimeout=${config.pictureTimeout}
    ></vivid-hyperhdr-details>`;
  }

  /* --------------------------------- render --------------------------------- */

  /** The hub on one line: health, what it captures, a few values. */
  private renderHubLine(hub: HubModel, model: HyperHdrModel) {
    const hass = this.hass;
    const config = this._config;
    if (!config) return nothing;
    const line = hubLine(hass, hub, model.strips, config.hubInfo);
    const rgb = healthColor(hub.health);
    const value = (icon: string, color: Rgb, text: string, unit: string, key: string) =>
      html`<span class="value ${key}"
        ><ha-icon .icon=${icon} style=${styleMap({ color: rgbCss(color) })}></ha-icon>${text}<small
          >${unit}</small
        ></span
      >`;
    const values = hub.connected
      ? config.hubValues.map((key) => {
          switch (key) {
            case 'temperature':
              return hub.temperature === undefined
                ? nothing
                : value(
                    'mdi:thermometer',
                    temperatureRgb(hub.temperature),
                    fixed(hass, hub.temperature, 0),
                    '°C',
                    key,
                  );
            case 'cpu':
              return hub.cpu === undefined
                ? nothing
                : value('mdi:cpu-64-bit', BLUE, fixed(hass, hub.cpu, 0), '%', key);
            case 'memory':
              return hub.memory === undefined
                ? nothing
                : value('mdi:memory', VIOLET, fixed(hass, hub.memory, 0), '%', key);
            case 'capture_fps':
              return hub.captureFps === undefined
                ? nothing
                : value('mdi:video-input-hdmi', BLUE, fixed(hass, hub.captureFps, 0), 'fps', key);
            default:
              return nothing;
          }
        })
      : [];
    return html`<button
      type="button"
      class="reset line"
      title=${localize(hass, 'details')}
      @click=${() => this.openDetails(undefined, 'system')}
    >
      ${disc(hubIcon(hub), rgb, hub.health === 'ok' ? 0.7 : 0.95)}
      <span class="names">
        <span class="name">${config.name ?? hub.name}</span>
        <span class=${classMap({ status: true, [line.tone]: true })}>${line.text}</span>
      </span>
      <span class="values">${values}</span>
    </button>`;
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

  /** The state of the components chosen for the line, as small lit icons. */
  private renderIcons(model: InstanceModel) {
    const hass = this.hass;
    const icons = this._config?.stripIcons ?? [];
    return icons.map((key) => {
      const look = ICONS[key];
      const toggle = model.toggles[key];
      if (!toggle) return nothing;
      const on = toggle.on && model.on;
      // The LED output stands out when it is off: nothing reaches the strip.
      const rgb = key === 'led_output' && model.on && !toggle.on ? RED : on ? look.rgb : undefined;
      const tone = rgb ? tintTone(rgb, 0.55) : undefined;
      return html`<span
        class=${classMap({ state: true, off: !rgb })}
        title=${`${localize(hass, look.label)} · ${localize(hass, toggle.on ? 'on' : 'off')}`}
        style=${styleMap({
          '--disc-bg': tone?.background,
          '--disc-color': tone?.iconColor,
        })}
        ><ha-icon .icon=${key === 'led_output' && !toggle.on ? 'mdi:led-off' : look.icon}></ha-icon
      ></span>`;
    });
  }

  /** One strip on one line: who it sends to and how fast, its state, its power. */
  private renderStripLine(model: InstanceModel, row: boolean) {
    const hass = this.hass;
    const config = this._config;
    if (!config) return nothing;
    const line = stripLine(hass, model, config.stripInfo);
    const rgb = model.on ? this.colorOf(model) : undefined;
    return html`<div class=${classMap({ strip: true, row })}>
      <button
        type="button"
        class="reset open"
        title=${localize(hass, 'details')}
        @click=${() => this.openDetails(model.deviceId)}
      >
        ${disc(STRIP_ICON, rgb, 0.85, row ? 'small' : '')}
        <span class="names">
          <span class="name">${row ? model.name : (config.name ?? model.name)}</span>
          <span class=${classMap({ status: true, [line.tone]: true })}>${line.text}</span>
        </span>
        <span class="icons">${this.renderIcons(model)}</span>
      </button>
      ${config.showPower ? this.renderPower(model) : nothing}
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
        ? this.renderStripLine(instance, false)
        : html`<div class="warning">${localize(hass, 'hh_not_found')}</div>`;
    } else if (config.mode === 'hub') {
      body = hub ? this.renderHubLine(hub, model) : nothing;
    } else {
      body = html`${hub ? this.renderHubLine(hub, model) : nothing}
      ${
        config.showStrips && model.instances.length
          ? html`<div class="rows dim">
              ${model.instances.map((item) => this.renderStripLine(item, true))}
            </div>`
          : nothing
      }`;
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
