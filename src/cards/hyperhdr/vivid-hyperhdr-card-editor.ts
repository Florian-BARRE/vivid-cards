import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { fireEvent } from '../../core/actions';
import { GLOW_SLIDER } from '../../core/glow';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { tokens } from '../../components/shared-styles';
import { MODES, type HyperHdrCardConfig, type HyperHdrMode } from './config';
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
    if (mode !== 'strip') {
      delete next.instance;
      delete next.picture;
    } else if (value.picture === false) next.picture = false;
    else delete next.picture;
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
    if (mode === 'strip') schema.push({ name: 'picture', selector: { boolean: {} } });
    schema.push({ name: 'glow', selector: GLOW_SLIDER });
    const labels = {
      mode: this.t('hh_mode'),
      server: this.t('hh_server'),
      instance: this.t('hh_instance'),
      name: this.t('name'),
      picture: this.t('hh_picture'),
      glow: this.t('amb_halo'),
    };
    return html`<div class="editor">
      ${this.status()}
      ${this.form(
        schema,
        {
          mode,
          server: config.server ?? '',
          instance: config.instance ?? '',
          name: config.name ?? '',
          picture: config.picture !== false,
          glow: config.glow ?? 100,
        },
        labels,
        { server: this.t('hh_first'), instance: this.t('hh_first') },
      )}
    </div>`;
  }
}

defineElement('vivid-hyperhdr-card-editor', VividHyperHdrCardEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-hyperhdr-card-editor': VividHyperHdrCardEditor;
  }
}
