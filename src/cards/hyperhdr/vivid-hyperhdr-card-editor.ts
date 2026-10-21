import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { fireEvent } from '../../core/actions';
import { GLOW_SLIDER } from '../../core/glow';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { tokens } from '../../components/shared-styles';
import {
  DEFAULT_HUB_INFO,
  DEFAULT_HUB_VALUES,
  DEFAULT_PICTURE_TIMEOUT,
  DEFAULT_STRIP_ICONS,
  DEFAULT_STRIP_INFO,
  HUB_INFO,
  HUB_VALUES,
  MODES,
  PICTURE_TIMEOUTS,
  STRIP_ICONS,
  STRIP_INFO,
  type HyperHdrCardConfig,
  type HyperHdrMode,
} from './config';
import '../../components/vivid-order-picker';
import type { OrderItem } from '../../components/vivid-order-picker';
import { HYPERHDR_INTEGRATION, INSTANCE_MODEL, findDevices } from './model';

type FormData = Record<string, unknown>;

/**
 * Visual editor: what to show (hub and strips, hub, one strip), the
 * HyperHDR server and the strip, found from the HA-HyperHDR integration's
 * devices; then the name, the picture and the halo.
 */
export class VividHyperHdrCardEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: HyperHdrCardConfig;

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .editor {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .status {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.05);
        font-size: 12.5px;
        line-height: 1.4;
        color: var(--secondary-text-color);
      }
      .status ha-icon {
        --mdc-icon-size: 16px;
        margin-top: 1px;
        flex: none;
      }
      .status.ok ha-icon {
        color: var(--success-color, #43a047);
      }
      .status.warn ha-icon {
        color: var(--warning-color, #ffa000);
      }
      .group {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 12px 14px 14px;
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
        border-radius: 12px;
      }
      .group-title {
        font-weight: 500;
      }
    `,
  ];

  setConfig(config: HyperHdrCardConfig): void {
    this._config = config;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void ensureHaForm().then(() => this.requestUpdate());
  }

  private t(key: EditorStringKey, values?: Record<string, string | number>): string {
    return editorText(this.hass, key, values);
  }

  private commit(next: Record<string, unknown>): void {
    const config = next as HyperHdrCardConfig;
    this._config = config;
    fireEvent(this, 'config-changed', { config });
  }

  private form(
    schema: Record<string, unknown>[],
    data: FormData,
    labels: Record<string, string>,
    helpers: Record<string, string> = {},
  ): TemplateResult {
    return html`<ha-form
      .hass=${this.hass}
      .data=${data}
      .schema=${schema}
      .computeLabel=${(field: { name: string }) => labels[field.name]}
      .computeHelper=${(field: { name: string }) => helpers[field.name]}
      @value-changed=${(event: CustomEvent<{ value: FormData }>) => {
        event.stopPropagation();
        this.onChange(event.detail.value);
      }}
    ></ha-form>`;
  }

  private onChange(value: FormData): void {
    const config = this._config;
    if (!config) return;
    const next: Record<string, unknown> = { ...config };
    for (const key of ['server', 'instance', 'name'] as const) {
      const text = typeof value[key] === 'string' ? (value[key] as string).trim() : '';
      if (text) next[key] = text;
      else delete next[key];
    }
    const mode = MODES.includes(value.mode as HyperHdrMode) ? (value.mode as HyperHdrMode) : 'all';
    next.mode = mode;
    if (mode !== 'strip') delete next.instance;
    // Older versions showed the picture on the card: it is in the details now.
    delete next.picture;
    for (const key of ['show_strips', 'show_power'] as const) {
      if (value[key] === false) next[key] = false;
      else delete next[key];
    }
    const timeout = Number(value.picture_timeout);
    if (timeout && timeout !== DEFAULT_PICTURE_TIMEOUT) next.picture_timeout = timeout;
    else delete next.picture_timeout;
    if (typeof value.glow === 'number' && value.glow !== 100) next.glow = value.glow;
    else delete next.glow;
    this.commit(next);
  }

  private status() {
    const hass = this.hass;
    if (!hass) return nothing;
    const devices = findDevices(hass);
    const strips = Object.values(devices.instances).reduce((total, list) => total + list.length, 0);
    const found = devices.servers.length > 0;
    return html`<div class="status ${found ? 'ok' : 'warn'}">
      <ha-icon .icon=${found ? 'mdi:check-circle-outline' : 'mdi:alert-outline'}></ha-icon>
      <span
        >${
          found
            ? this.t('hh_found', { servers: devices.servers.length, strips })
            : this.t('hh_none_found')
        }</span
      >
    </div>`;
  }

  /** A list option as numbered chips: which items, in which order. */
  private picker(
    key: 'hub_info' | 'hub_values' | 'strip_info' | 'strip_icons',
    known: readonly string[],
    fallback: readonly string[],
    icons: Record<string, string>,
    max = 0,
  ) {
    const config: HyperHdrCardConfig = this._config ?? { type: 'custom:vivid-hyperhdr-card' };
    const raw: unknown = config[key];
    const value = Array.isArray(raw) ? raw.filter((item) => known.includes(item)) : [...fallback];
    const items: OrderItem[] = known.map((item) => ({
      value: item,
      label: this.t(`hh_item_${item}` as EditorStringKey),
      icon: icons[item],
    }));
    return html`<vivid-order-picker
      .items=${items}
      .value=${value}
      .max=${max}
      .label=${this.t(`hh_${key}` as EditorStringKey)}
      .helper=${this.t('hh_order_helper')}
      @value-changed=${(event: CustomEvent<{ value: string[] }>) => {
        event.stopPropagation();
        const next: Record<string, unknown> = { ...config };
        const same =
          event.detail.value.length === fallback.length &&
          event.detail.value.every((item, index) => item === fallback[index]);
        if (same) delete next[key];
        else next[key] = event.detail.value;
        this.commit(next);
      }}
    ></vivid-order-picker>`;
  }

  protected override render() {
    const config = this._config;
    if (!config) return nothing;
    const mode: HyperHdrMode = MODES.includes(config.mode as HyperHdrMode)
      ? (config.mode as HyperHdrMode)
      : 'all';
    const schema: Record<string, unknown>[] = [
      {
        name: 'mode',
        selector: {
          select: {
            mode: 'list',
            options: MODES.map((value) => ({
              value,
              label: this.t(`hh_mode_${value}` as EditorStringKey),
            })),
          },
        },
      },
      {
        name: 'server',
        selector: {
          device: {
            filter: { integration: HYPERHDR_INTEGRATION },
            entity: { domain: 'binary_sensor' },
          },
        },
      },
    ];
    if (mode === 'strip') {
      schema.push({
        name: 'instance',
        selector: {
          device: { filter: { integration: HYPERHDR_INTEGRATION, model: INSTANCE_MODEL } },
        },
      });
    }
    schema.push({ name: 'name', selector: { text: {} } });
    const options: Record<string, unknown>[] = [];
    if (mode === 'all') options.push({ name: 'show_strips', selector: { boolean: {} } });
    if (mode !== 'hub') options.push({ name: 'show_power', selector: { boolean: {} } });
    options.push(
      {
        name: 'picture_timeout',
        selector: {
          select: {
            mode: 'dropdown',
            options: PICTURE_TIMEOUTS.map((value) => ({
              value: String(value),
              label: this.t('hh_minutes', { n: value / 60 }),
            })),
          },
        },
      },
      { name: 'glow', selector: GLOW_SLIDER },
    );
    const labels = {
      mode: this.t('hh_mode'),
      server: this.t('hh_server'),
      instance: this.t('hh_instance'),
      name: this.t('name'),
      show_strips: this.t('hh_show_strips'),
      show_power: this.t('hh_show_power'),
      picture_timeout: this.t('hh_picture_timeout'),
      glow: this.t('amb_halo'),
    };
    const data = {
      mode,
      server: config.server ?? '',
      instance: config.instance ?? '',
      name: config.name ?? '',
      show_strips: config.show_strips !== false,
      show_power: config.show_power !== false,
      picture_timeout: String(config.picture_timeout ?? DEFAULT_PICTURE_TIMEOUT),
      glow: config.glow ?? 100,
    };
    const hub = mode !== 'strip';
    const strips = mode !== 'hub';
    return html`<div class="editor">
      ${this.status()}
      ${this.form(schema, data, labels, {
        server: this.t('hh_first'),
        instance: this.t('hh_first'),
      })}
      ${
        hub
          ? html`<div class="group">
              <div class="group-title">${this.t('hh_hub_line')}</div>
              ${this.picker('hub_info', HUB_INFO, DEFAULT_HUB_INFO, HUB_ICONS)}
              ${this.picker('hub_values', HUB_VALUES, DEFAULT_HUB_VALUES, HUB_ICONS, 3)}
            </div>`
          : nothing
      }
      ${
        strips
          ? html`<div class="group">
              <div class="group-title">${this.t('hh_strip_line')}</div>
              ${this.picker('strip_info', STRIP_INFO, DEFAULT_STRIP_INFO, STRIP_ICONS_OF)}
              ${this.picker('strip_icons', STRIP_ICONS, DEFAULT_STRIP_ICONS, STRIP_ICONS_OF, 4)}
            </div>`
          : nothing
      }
      ${this.form(options, data, labels, { picture_timeout: this.t('hh_picture_helper') })}
    </div>`;
  }
}

const HUB_ICONS: Record<string, string> = {
  input: 'mdi:video-input-hdmi',
  video_mode: 'mdi:monitor-screenshot',
  capture_fps: 'mdi:speedometer',
  temperature: 'mdi:thermometer',
  cpu: 'mdi:cpu-64-bit',
  memory: 'mdi:memory',
  version: 'mdi:tag-outline',
  strips: 'mdi:television-ambient-light',
};

const STRIP_ICONS_OF: Record<string, string> = {
  source: 'mdi:import',
  device: 'mdi:led-strip-variant',
  fps: 'mdi:speedometer',
  leds: 'mdi:dots-horizontal',
  brightness: 'mdi:brightness-6',
  led_output: 'mdi:led-on',
  video_capture: 'mdi:video-input-hdmi',
  hdr: 'mdi:hdr',
  smoothing: 'mdi:waveform',
  black_border: 'mdi:border-none-variant',
};

defineElement('vivid-hyperhdr-card-editor', VividHyperHdrCardEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-hyperhdr-card-editor': VividHyperHdrCardEditor;
  }
}
