import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { haptic } from '../../core/actions';
import { devicePrefixFor } from '../../core/entities';
import { glowShadow, glowSize, glowVars, tintTone } from '../../core/glow';
import type { HomeAssistant, LovelaceGridOptions } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { formEditor } from '../../core/vivid-form-editor';
import { localize } from '../../i18n';
import { buttonReset, tokens } from '../../components/shared-styles';
import { VividDialog } from '../../components/vivid-dialog';
import { watchedChanged } from '../led-group/model';
import {
  AIR_INFO,
  AIR_STATION_CARD,
  AIR_TABS,
  DEFAULT_PREFIX,
  ENTITY_SUFFIXES,
  resolveAirStationConfig,
  type AirStationCardConfig,
  type ResolvedAirStationConfig,
} from './config';
import { buildAirStationModel, type AirStationModel } from './model';
import { lineColor, lineIcon, rgbCss, statusLine, valueViews } from './view';
import './vivid-air-station-details';

/**
 * An ESPHome air station (CO₂, temperature, humidity, an LED frame and a
 * screen) on one line: the comfort in a colored disc, the readings, and the
 * station's power. A tap opens the details: history, frame, screen and
 * settings, every option of the firmware.
 */
export class VividAirStationCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: ResolvedAirStationConfig;

  protected model?: AirStationModel;
  private rawConfig?: AirStationCardConfig;
  /** Registry the device was last looked up in. */
  private resolvedFor?: HomeAssistant['entities'];
  private dialog?: VividDialog;

  static getConfigElement(): HTMLElement {
    return formEditor({
      fields: [
        {
          name: 'device',
          label: 'air_device',
          selector: { device: { filter: { integration: 'esphome' } } },
        },
        { name: 'name', label: 'name', selector: { text: {} } },
        {
          name: 'info',
          label: 'air_info',
          selector: {
            select: {
              multiple: true,
              mode: 'list',
              options: AIR_INFO.map((value) => ({ value, label: value })),
            },
          },
          default: ['co2', 'temperature', 'humidity'],
        },
        { name: 'show_power', label: 'air_show_power', selector: { boolean: {} }, default: true },
        {
          name: 'tab',
          label: 'air_tab',
          selector: {},
          options: AIR_TABS.map((value) => ({ value, label: `air_tab_${value}` as const })),
          default: 'air',
        },
        {
          name: 'glow',
          label: 'glow',
          selector: {
            number: { min: 0, max: 200, step: 10, mode: 'slider', unit_of_measurement: '%' },
          },
          default: 100,
        },
      ],
      validate: (config) => resolveAirStationConfig(config as AirStationCardConfig),
    });
  }

  static getStubConfig(hass?: HomeAssistant): Partial<AirStationCardConfig> {
    const suffixes = Object.values(ENTITY_SUFFIXES);
    const station =
      hass &&
      Object.keys(hass.devices ?? {}).find((id) => {
        const prefix = devicePrefixFor(hass, id, suffixes);
        return (
          prefix !== undefined &&
          !!hass.states[`sensor.${prefix}co2`] &&
          !!hass.states[`switch.${prefix}station_power`]
        );
      });
    return station ? { device: station } : { prefix: DEFAULT_PREFIX };
  }

  setConfig(config: AirStationCardConfig): void {
    this.rawConfig = config;
    this.resolvedFor = undefined;
    this._config = resolveAirStationConfig(config);
  }

  /** Finds the station's entities again when the registry changes. */
  private resolveDevice(hass: HomeAssistant): void {
    const raw = this.rawConfig;
    if (!raw?.device || this.resolvedFor === hass.entities) return;
    this.resolvedFor = hass.entities;
    this._config = resolveAirStationConfig(raw, {
      prefix: devicePrefixFor(hass, raw.device, Object.values(ENTITY_SUFFIXES)),
    });
  }

  getCardSize(): number {
    return 1;
  }

  getGridOptions(): LovelaceGridOptions {
    return { columns: 12, min_columns: 6, rows: 'auto', min_rows: 1 };
  }

  static override styles = [
    tokens,
    buttonReset,
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
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 56px;
        padding: 8px;
        box-sizing: border-box;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
        overflow: hidden;
        container-type: inline-size;
        transition: box-shadow 0.4s ease;
      }
      /* The comfort tints the line from the disc, like the frame lights the room. */
      .panel::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(
          120% 140% at 0% 50%,
          rgba(var(--line-rgb, 0, 0, 0), calc(0.22 * var(--vivid-glow, 1))),
          transparent 70%
        );
        opacity: var(--line-tint, 0);
        pointer-events: none;
        transition: opacity 0.4s ease;
      }
      .panel > * {
        position: relative;
      }
      .panel.alert {
        box-shadow:
          0 0 0 1.5px rgba(239, 83, 80, 0.7),
          0 0 calc(24px * var(--vivid-glow, 1)) rgba(239, 83, 80, 0.35);
      }
      .panel.offline {
        opacity: 0.6;
        filter: grayscale(0.85);
      }
      .title {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1 1 auto;
        min-width: 0;
        padding: 2px;
        border-radius: 14px;
        text-align: left;
      }
      .disc {
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${unsafeCSS(glowSize(40))};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--disc-bg, var(--vivid-layer-2));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
        transition:
          background 0.4s ease,
          box-shadow 0.4s ease,
          color 0.4s ease;
      }
      .disc ha-icon {
        --mdc-icon-size: 22px;
        display: inline-flex;
      }
      .disc.pulse {
        animation: pulse 1.6s ease-in-out infinite;
        animation-play-state: var(--vivid-glow-play, running);
      }
      @keyframes pulse {
        50% {
          box-shadow:
            0 0 0 6px rgba(239, 83, 80, 0.22),
            0 0 18px rgba(239, 83, 80, 0.7);
        }
      }
      .names {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .name {
        font-size: 15px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .status {
        font-size: 12px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .status.alarm {
        color: var(--error-color, #ef5350);
        font-weight: 600;
      }
      .values {
        display: flex;
        align-items: center;
        gap: 5px;
        flex: none;
        padding: 2px;
        border-radius: 12px;
      }
      .value {
        display: inline-flex;
        align-items: center;
        gap: 1px;
        padding: 2px 7px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        background: rgba(var(--v-rgb, var(--vivid-rgb-text)), 0.16);
        color: color-mix(
          in srgb,
          rgb(var(--v-rgb, var(--vivid-rgb-text))) 30%,
          var(--primary-text-color)
        );
      }
      .value ha-icon {
        --mdc-icon-size: 15px;
        display: inline-flex;
        color: rgb(var(--v-rgb, var(--vivid-rgb-text)));
      }
      .value small {
        margin-left: 1px;
        font-size: 11px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .value.none {
        background: rgba(var(--vivid-rgb-text), 0.06);
        color: var(--secondary-text-color);
      }
      .value.none ha-icon {
        color: var(--secondary-text-color);
      }
      .value.alarm {
        box-shadow: inset 0 0 0 1.5px rgba(239, 83, 80, 0.75);
      }
      .power {
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${unsafeCSS(glowSize(38))};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: var(--disc-bg, var(--vivid-layer-2));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
        transition:
          background 0.25s ease,
          box-shadow 0.25s ease;
      }
      .power ha-icon {
        --mdc-icon-size: 19px;
        display: inline-flex;
      }
      .power:disabled {
        opacity: 0.5;
        cursor: default;
      }
      .warning {
        padding: 12px;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
        color: var(--error-color, #ef5350);
        font-size: 13px;
      }
      /* Narrow line: the values go, the last first. */
      @container (max-width: 380px) {
        .value:nth-child(n + 3) {
          display: none;
        }
      }
      @container (max-width: 300px) {
        .value:nth-child(n + 2) {
          display: none;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .disc.pulse {
          animation: none;
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
    if (hass) this.resolveDevice(hass);
    const config = this._config;
    if (!hass || !config) return;
    this.model = buildAirStationModel(hass, config);
  }

  protected override updated(): void {
    if (this.dialog?.open) this.renderDialogContent();
  }

  /* --------------------------------- actions -------------------------------- */

  private readonly togglePower = (): void => {
    const hass = this.hass;
    const model = this.model;
    if (!hass || !this._config || !model?.powerAvailable) return;
    haptic(this, 'light');
    void hass.callService(
      'switch',
      model.power ? 'turn_off' : 'turn_on',
      {},
      { entity_id: this._config.entities.power },
    );
  };

  openDetails(): void {
    if (!this.model) return;
    if (!this.dialog) {
      this.dialog = new VividDialog();
      this.dialog.addEventListener('vivid-dialog-close-request', () => this.dialog?.hide());
    }
    haptic(this, 'light');
    this.renderDialogContent();
    this.dialog.show();
  }

  private renderDialogContent(): void {
    const dialog = this.dialog;
    const model = this.model;
    const config = this._config;
    if (!dialog || !model || !config) return;
    dialog.label = this.name();
    dialog.closeLabel = localize(this.hass, 'close');
    for (const [name, value] of Object.entries(glowVars(config.glow))) {
      dialog.style.setProperty(name, value);
    }
    dialog.content = html`<vivid-air-station-details
      .hass=${this.hass}
      .model=${model}
      .config=${config}
      .heading=${this.name()}
    ></vivid-air-station-details>`;
  }

  private name(): string {
    return this._config?.name ?? localize(this.hass, 'air_name');
  }

  /* --------------------------------- render --------------------------------- */

  private renderDisc(model: AirStationModel) {
    const rgb = lineColor(model);
    const lit = rgb && model.power;
    const dim = rgb && model.power && model.night && !model.alert;
    // Lit: a filled disc with a white icon; at night or off, only a tint.
    const tone = rgb && (dim || !lit) ? tintTone(rgb, dim ? 0.3 : 0.1) : undefined;
    return html`<span
      class=${classMap({ disc: true, pulse: model.alert && model.online })}
      style=${styleMap(
        lit && !dim
          ? {
              '--disc-bg': rgbCss(rgb),
              '--disc-shadow': glowShadow([rgb], 0.8),
              '--disc-color': '#fff',
            }
          : {
              '--disc-bg': model.power ? tone?.background : undefined,
              '--disc-shadow': undefined,
              '--disc-color': model.power ? tone?.iconColor : undefined,
            },
      )}
      ><ha-icon .icon=${lineIcon(model)}></ha-icon
    ></span>`;
  }

  private renderValues(model: AirStationModel, config: ResolvedAirStationConfig) {
    const views = valueViews(this.hass, model, config.info);
    if (!model.online || views.length === 0) return nothing;
    return html`<button
      type="button"
      class="reset values"
      title=${localize(this.hass, 'details')}
      @click=${() => this.openDetails()}
    >
      ${views.map(
        (view) =>
          html`<span
            class=${classMap({ value: true, alarm: view.alarm, none: view.rgb === undefined })}
            title=${view.label}
            style=${styleMap({ '--v-rgb': view.rgb ? view.rgb.join(', ') : undefined })}
            >${view.text}<small>${view.unit}</small></span
          >`,
      )}
    </button>`;
  }

  private renderPower(model: AirStationModel) {
    const rgb = lineColor(model);
    const tone = model.power && rgb ? tintTone(rgb, 0.8) : undefined;
    const label = localize(this.hass, model.power ? 'power_off' : 'power_on');
    return html`<button
      type="button"
      class="reset power"
      role="switch"
      aria-checked=${model.power ? 'true' : 'false'}
      aria-label=${label}
      title=${label}
      ?disabled=${!model.online || !model.powerAvailable}
      style=${styleMap({
        '--disc-bg': tone?.background,
        '--disc-shadow': tone?.shadow,
        '--disc-color': tone?.iconColor,
      })}
      @click=${this.togglePower}
    >
      <ha-icon icon="mdi:power"></ha-icon>
    </button>`;
  }

  protected override render() {
    const config = this._config;
    const model = this.model;
    const hass = this.hass;
    if (!config || !hass) return nothing;
    if (!model || (!hass.states[config.entities.co2] && !hass.states[config.entities.online])) {
      return html`<ha-card
        ><div class="warning">
          ${localize(hass, 'air_not_found', { entity: config.entities.co2 })}
        </div></ha-card
      >`;
    }
    const rgb = lineColor(model);
    const status = statusLine(hass, model);
    const tint = !rgb || !model.power ? 0 : model.night && !model.alert ? 0.35 : 1;
    return html`<ha-card>
      <div
        class=${classMap({ panel: true, alert: model.alert && model.online, offline: !model.online })}
        style=${styleMap({
          ...glowVars(config.glow),
          '--line-rgb': rgb ? rgb.join(', ') : undefined,
          '--line-tint': String(tint),
        })}
      >
        <button
          type="button"
          class="reset title"
          title=${localize(hass, 'details')}
          @click=${() => this.openDetails()}
        >
          ${this.renderDisc(model)}
          <span class="names">
            <span class="name">${this.name()}</span>
            <span class=${classMap({ status: true, alarm: status.tone === 'alarm' })}
              >${status.text}</span
            >
          </span>
        </button>
        ${this.renderValues(model, config)} ${config.showPower ? this.renderPower(model) : nothing}
      </div>
    </ha-card>`;
  }
}

defineElement(AIR_STATION_CARD, VividAirStationCard);

registerCard({
  type: AIR_STATION_CARD,
  name: 'Vivid air station',
  description:
    'An ESPHome air station on one line: comfort, CO₂, temperature and humidity; the details hold the history, the LED frame, the screen and every setting.',
  preview: false,
  documentationURL: `${REPOSITORY_URL}/blob/main/docs/cards/air-station.md`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-air-station-card': VividAirStationCard;
  }
}
