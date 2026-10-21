import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { fireEvent } from '../../core/actions';
import { GLOW_SLIDER } from '../../core/glow';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { tokens } from '../../components/shared-styles';
import {
  DEFAULT_PREFIX,
  INPUT_COUNT,
  resolveAmbilightConfig,
  type AmbilightCardConfig,
  type AmbilightInputConfig,
} from './config';
import { HYPERHDR_INTEGRATION } from '../hyperhdr/model';
import { MANAGER_INTEGRATION, coverage, devicePrefix, lookupDevices } from './devices';

type FormData = Record<string, unknown>;
type Schema = Record<string, unknown>[];

/** Missing entities listed in the editor before "…". */
const MISSING_SHOWN = 4;

/**
 * Visual editor: the Ambilight Manager device (ESPHome), whose entities are
 * found from it and checked, then the names and icons of the HDMI inputs and
 * a few options.
 */
export class VividAmbilightCardEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _open: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: AmbilightCardConfig;
  declare _open: Set<string>;

  constructor() {
    super();
    this._open = new Set(['inputs']);
  }

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
      ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        flex: none;
      }
      .status {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin: -4px 0 4px;
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
      }
      .status.ok ha-icon {
        color: var(--success-color, #43a047);
      }
      .status.warn ha-icon {
        color: var(--warning-color, #ffa000);
      }
      .status b {
        color: var(--primary-text-color);
        font-weight: 500;
      }
      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
      }
      .section {
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
        border-radius: 12px;
        overflow: hidden;
      }
      summary {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        cursor: pointer;
        list-style: none;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      .section-title {
        font-weight: 500;
        flex: none;
      }
      .hint {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .chevron {
        margin-left: auto;
        transition: transform 0.2s ease;
      }
      .section[open] > summary .chevron {
        transform: rotate(180deg);
      }
      .section-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 4px 14px 14px;
      }
    `,
  ];

  setConfig(config: AmbilightCardConfig): void {
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
    const config = next as AmbilightCardConfig;
    this._config = config;
    fireEvent(this, 'config-changed', { config });
  }

  private form(
    schema: Schema,
    data: FormData,
    onChange: (value: FormData) => void,
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
        onChange(event.detail.value);
      }}
    ></ha-form>`;
  }

  private section(id: string, icon: string, title: string, hint: string, body: () => unknown) {
    const open = this._open.has(id);
    return html`<details
      class="section"
      ?open=${open}
      @toggle=${(event: Event) => {
        const isOpen = (event.target as HTMLDetailsElement).open;
        if (isOpen === this._open.has(id)) return;
        const next = new Set(this._open);
        if (isOpen) next.add(id);
        else next.delete(id);
        this._open = next;
      }}
    >
      <summary>
        <ha-icon .icon=${icon}></ha-icon>
        <span class="section-title">${title}</span>
        <span class="hint">${hint}</span>
        <ha-icon class="chevron" .icon=${'mdi:chevron-down'}></ha-icon>
      </summary>
      <div class="section-body">${open ? body() : nothing}</div>
    </details>`;
  }

  private status(kind: 'ok' | 'warn' | 'info', content: unknown) {
    const icon =
      kind === 'ok'
        ? 'mdi:check-circle-outline'
        : kind === 'warn'
          ? 'mdi:alert-outline'
          : 'mdi:information-outline';
    return html`<div class="status ${kind}">
      <ha-icon .icon=${icon}></ha-icon><span>${content}</span>
    </div>`;
  }

  /* --------------------------------- devices -------------------------------- */

  private renderDevice(config: AmbilightCardConfig) {
    const labels = { device: this.t('amb_device'), name: editorText(this.hass, 'name') };
    const onChange = (value: FormData) => {
      const next: Record<string, unknown> = { ...config };
      for (const key of ['device', 'name'] as const) {
        const text = typeof value[key] === 'string' ? (value[key] as string).trim() : '';
        if (text) next[key] = text;
        else delete next[key];
      }
      // A device picked here replaces the prefix the YAML pointed at.
      if (next.device !== config.device) delete next.prefix;
      this.commit(next);
    };
    const deviceForm = this.form(
      [{ name: 'device', selector: { device: { integration: MANAGER_INTEGRATION } } }],
      { device: config.device ?? '' },
      (value) => onChange({ ...value, name: config.name }),
      labels,
    );
    const nameForm = this.form(
      [{ name: 'name', selector: { text: {} } }],
      { name: config.name ?? '' },
      (value) => onChange({ ...value, device: config.device }),
      labels,
    );
    return html`${deviceForm}${this.managerStatus(config)}${nameForm}`;
  }

  private managerStatus(config: AmbilightCardConfig) {
    const hass = this.hass;
    if (!hass) return nothing;
    const resolved = resolveAmbilightConfig(config, lookupDevices(hass, config));
    const { found, total, missing } = coverage(hass, resolved.entities);
    const prefix = config.prefix ?? (config.device ? devicePrefix(hass, config.device) : undefined);
    const lines: unknown[] = [];
    if (!config.device && !config.prefix) {
      lines.push(this.t('amb_no_device', { prefix: DEFAULT_PREFIX }), html`<br />`);
    } else if (config.prefix) {
      lines.push(
        html`${this.t('amb_yaml_prefix', { prefix: '' })}<span class="mono">${config.prefix}</span
          ><br />`,
      );
    }
    lines.push(html`<b>${this.t('amb_found', { found, total })}</b>`);
    if (missing.length) {
      const shown = missing.slice(0, MISSING_SHOWN).join(', ');
      const more = missing.length > MISSING_SHOWN ? ` … (+${missing.length - MISSING_SHOWN})` : '';
      lines.push(
        html` · ${this.t('amb_missing', { list: '' })}<span class="mono">${shown}${more}</span>`,
      );
    } else if (prefix !== undefined) {
      lines.push(html` · <span class="mono">${prefix}</span>`);
    }
    return this.status(
      missing.length ? 'warn' : config.device || config.prefix ? 'ok' : 'info',
      lines,
    );
  }

  /* ---------------------------------- inputs -------------------------------- */

  private renderInputs(config: AmbilightCardConfig) {
    const data: FormData = {};
    const labels: Record<string, string> = {};
    const schema: Schema = [];
    for (let index = 0; index < INPUT_COUNT; index += 1) {
      const n = index + 1;
      const input = config.inputs?.[index];
      const value: AmbilightInputConfig =
        typeof input === 'string' ? { name: input } : (input ?? {});
      data[`name${n}`] = value.name ?? '';
      data[`icon${n}`] = value.icon ?? '';
      labels[`name${n}`] = this.t('amb_input_name', { n });
      labels[`icon${n}`] = this.t('amb_input_icon', { n });
      schema.push({
        type: 'grid',
        name: '',
        schema: [
          { name: `name${n}`, selector: { text: {} } },
          { name: `icon${n}`, selector: { icon: { placeholder: 'mdi:video-input-hdmi' } } },
        ],
      });
    }
    return this.form(
      schema,
      data,
      (value) => {
        const text = (key: string) =>
          typeof value[key] === 'string' ? (value[key] as string).trim() : '';
        const inputs: AmbilightInputConfig[] = [];
        for (let n = 1; n <= INPUT_COUNT; n += 1) {
          const name = text(`name${n}`);
          const icon = text(`icon${n}`);
          inputs.push({ ...(name ? { name } : {}), ...(icon ? { icon } : {}) });
        }
        while (inputs.length && Object.keys(inputs[inputs.length - 1] ?? {}).length === 0) {
          inputs.pop();
        }
        const next: Record<string, unknown> = { ...config };
        if (inputs.length) next.inputs = inputs;
        else delete next.inputs;
        this.commit(next);
      },
      labels,
    );
  }

  /* --------------------------------- options -------------------------------- */

  private renderSettings(config: AmbilightCardConfig) {
    return this.form(
      [
        {
          name: 'hyperhdr',
          selector: {
            device: {
              filter: { integration: HYPERHDR_INTEGRATION },
              entity: { domain: 'binary_sensor' },
            },
          },
        },
        { name: 'confirm_pi_off', selector: { boolean: {} } },
        { name: 'send_counter_entity', selector: { entity: { domain: 'sensor' } } },
        { name: 'glow', selector: GLOW_SLIDER },
      ],
      {
        hyperhdr: config.hyperhdr ?? '',
        confirm_pi_off: config.confirm_pi_off !== false,
        send_counter_entity: config.send_counter_entity ?? '',
        glow: config.glow ?? 100,
      },
      (value) => {
        const next: Record<string, unknown> = { ...config };
        if (typeof value.hyperhdr === 'string' && value.hyperhdr) next.hyperhdr = value.hyperhdr;
        else delete next.hyperhdr;
        if (value.confirm_pi_off === false) next.confirm_pi_off = false;
        else delete next.confirm_pi_off;
        const counter =
          typeof value.send_counter_entity === 'string' ? value.send_counter_entity.trim() : '';
        if (counter) next.send_counter_entity = counter;
        else delete next.send_counter_entity;
        if (typeof value.glow === 'number' && value.glow !== 100) next.glow = value.glow;
        else delete next.glow;
        this.commit(next);
      },
      {
        hyperhdr: this.t('amb_hyperhdr'),
        confirm_pi_off: this.t('amb_confirm_pi'),
        send_counter_entity: this.t('amb_counter'),
        glow: this.t('amb_halo'),
      },
      {
        hyperhdr: this.t('amb_hyperhdr_helper'),
        send_counter_entity: this.t('amb_counter_helper'),
      },
    );
  }

  protected override render() {
    const config = this._config;
    if (!config) return nothing;
    return html`<div class="editor">
      ${this.renderDevice(config)}
      ${this.section(
        'inputs',
        'mdi:video-input-hdmi',
        this.t('amb_inputs'),
        this.t('amb_inputs_hint'),
        () => this.renderInputs(config),
      )}
      ${this.section(
        'options',
        'mdi:tune-variant',
        this.t('amb_options'),
        this.t('amb_options_hint'),
        () => this.renderSettings(config),
      )}
    </div>`;
  }
}

defineElement('vivid-ambilight-card-editor', VividAmbilightCardEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-ambilight-card-editor': VividAmbilightCardEditor;
  }
}
