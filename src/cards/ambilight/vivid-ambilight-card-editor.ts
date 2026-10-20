import { LitElement, css, html, nothing } from 'lit';
import { fireEvent } from '../../core/actions';
import { GLOW_SLIDER } from '../../core/glow';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import {
  DEFAULT_PREFIX,
  INPUT_COUNT,
  type AmbilightCardConfig,
  type AmbilightInputConfig,
} from './config';

type FormData = Record<string, unknown>;

/** Visual editor: the device prefix, HyperHDR, the input names and icons. */
export class VividAmbilightCardEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: AmbilightCardConfig;

  static override styles = css`
    :host {
      display: block;
    }
  `;

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

  private data(config: AmbilightCardConfig): FormData {
    const data: FormData = {
      name: config.name ?? '',
      prefix: config.prefix ?? DEFAULT_PREFIX,
      hyperhdr_entity: config.hyperhdr_entity ?? '',
      send_counter_entity: config.send_counter_entity ?? '',
      confirm_pi_off: config.confirm_pi_off !== false,
      glow: config.glow ?? 100,
    };
    for (let index = 0; index < INPUT_COUNT; index += 1) {
      const input = config.inputs?.[index];
      const value: AmbilightInputConfig =
        typeof input === 'string' ? { name: input } : (input ?? {});
      data[`input${index + 1}_name`] = value.name ?? '';
      data[`input${index + 1}_icon`] = value.icon ?? '';
    }
    return data;
  }

  private onChange(value: FormData): void {
    const previous = this._config ?? { type: 'custom:vivid-ambilight-card' };
    const next: Record<string, unknown> = { ...previous };
    const text = (key: string) =>
      typeof value[key] === 'string' ? (value[key] as string).trim() : '';
    for (const key of ['name', 'hyperhdr_entity', 'send_counter_entity']) {
      if (text(key)) next[key] = text(key);
      else delete next[key];
    }
    if (text('prefix') && text('prefix') !== DEFAULT_PREFIX) next.prefix = text('prefix');
    else delete next.prefix;
    if (value.confirm_pi_off === false) next.confirm_pi_off = false;
    else delete next.confirm_pi_off;
    if (typeof value.glow === 'number' && value.glow !== 100) next.glow = value.glow;
    else delete next.glow;
    const inputs: AmbilightInputConfig[] = [];
    for (let index = 0; index < INPUT_COUNT; index += 1) {
      const name = text(`input${index + 1}_name`);
      const icon = text(`input${index + 1}_icon`);
      inputs.push({ ...(name ? { name } : {}), ...(icon ? { icon } : {}) });
    }
    while (inputs.length && Object.keys(inputs[inputs.length - 1] ?? {}).length === 0) inputs.pop();
    if (inputs.length) next.inputs = inputs;
    else delete next.inputs;
    this._config = next as AmbilightCardConfig;
    fireEvent(this, 'config-changed', { config: this._config });
  }

  protected override render() {
    const config = this._config;
    if (!config) return nothing;
    const schema: Record<string, unknown>[] = [
      { name: 'name', selector: { text: {} } },
      { name: 'prefix', selector: { text: {} } },
      { name: 'hyperhdr_entity', selector: { entity: {} } },
      { name: 'send_counter_entity', selector: { entity: { domain: 'sensor' } } },
      { name: 'confirm_pi_off', selector: { boolean: {} } },
      ...Array.from({ length: INPUT_COUNT }, (_, index) => ({
        type: 'grid',
        name: '',
        schema: [
          { name: `input${index + 1}_name`, selector: { text: {} } },
          { name: `input${index + 1}_icon`, selector: { icon: {} } },
        ],
      })),
      { name: 'glow', selector: GLOW_SLIDER },
    ];
    const labels: Record<string, string> = {
      name: editorText(this.hass, 'name'),
      prefix: this.t('amb_prefix'),
      hyperhdr_entity: this.t('amb_hyperhdr'),
      send_counter_entity: this.t('amb_counter'),
      confirm_pi_off: this.t('amb_confirm_pi'),
      glow: this.t('amb_halo'),
    };
    const helpers: Record<string, string> = {
      prefix: this.t('amb_prefix_helper'),
      hyperhdr_entity: this.t('amb_hyperhdr_helper'),
      send_counter_entity: this.t('amb_counter_helper'),
    };
    for (let index = 0; index < INPUT_COUNT; index += 1) {
      labels[`input${index + 1}_name`] = this.t('amb_input_name', { n: index + 1 });
      labels[`input${index + 1}_icon`] = this.t('amb_input_icon', { n: index + 1 });
    }
    return html`<ha-form
      .hass=${this.hass}
      .data=${this.data(config)}
      .schema=${schema}
      .computeLabel=${(field: { name: string }) => labels[field.name]}
      .computeHelper=${(field: { name: string }) => helpers[field.name]}
      @value-changed=${(event: CustomEvent<{ value: FormData }>) => {
        event.stopPropagation();
        this.onChange(event.detail.value);
      }}
    ></ha-form>`;
  }
}

defineElement('vivid-ambilight-card-editor', VividAmbilightCardEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-ambilight-card-editor': VividAmbilightCardEditor;
  }
}
