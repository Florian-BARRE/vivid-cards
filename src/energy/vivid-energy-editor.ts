import { LitElement, css, html, nothing } from 'lit';
import { fireEvent } from '../core/actions';
import { ensureHaForm } from '../core/ha-elements';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import { editorText, type EditorStringKey } from '../i18n/editor';
import { tokens } from '../components/shared-styles';

type FormData = Record<string, unknown>;

/** A field of the card's own options, as an `ha-form` schema entry. */
export interface EnergyEditorField {
  name: string;
  label: EditorStringKey;
  /** An `ha-form` selector; `options` makes a select instead. */
  selector?: Record<string, unknown>;
  options?: { value: string; label: EditorStringKey }[];
  helper?: EditorStringKey;
  /** Value written when the field is left at it: the option is then removed. */
  default?: unknown;
}

export interface EnergyEditorSpec {
  fields: EnergyEditorField[];
  /** Throws when the config is invalid (the message shows under the form). */
  validate(config: Record<string, unknown>): void;
}

const TARIFF_LABELS: Record<string, EditorStringKey> = {
  peak: 'energy_peak_price',
  off_peak: 'energy_off_peak_price',
  off_peak_hours: 'energy_off_peak_hours',
  subscription: 'energy_subscription_month',
  billing_day: 'energy_billing_day',
};

/**
 * Visual editor shared by the energy cards and badges: their own options,
 * then the tariff and the data source, folded.
 */
export class VividEnergyEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    spec: { attribute: false },
    _config: { state: true },
    _error: { state: true },
  };

  declare hass?: HomeAssistant;
  declare spec?: EnergyEditorSpec;
  declare _config?: Record<string, unknown>;
  declare _error?: string;

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .hint {
        margin: 8px 0 0;
        color: var(--secondary-text-color);
        font-size: 12px;
      }
      .error {
        margin-top: 8px;
        color: var(--error-color, #db4437);
        font-size: 13px;
      }
    `,
  ];

  setConfig(config: Record<string, unknown>): void {
    this._config = config;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void ensureHaForm().then(() => this.requestUpdate());
  }

  private t(key: EditorStringKey): string {
    return editorText(this.hass, key);
  }

  private schema(): Record<string, unknown>[] {
    const own = (this.spec?.fields ?? []).map((field) => ({
      name: field.name,
      selector: field.options
        ? {
            select: {
              mode: 'dropdown',
              options: field.options.map((option) => ({
                value: option.value,
                label: this.t(option.label),
              })),
            },
          }
        : (field.selector ?? { text: {} }),
    }));
    return [
      { name: 'name', selector: { text: {} } },
      ...own,
      {
        type: 'expandable',
        name: 'tariff',
        title: this.t('energy_section_tariff'),
        icon: 'mdi:cash-multiple',
        schema: [
          {
            type: 'grid',
            name: '',
            schema: [
              { name: 'peak', selector: { number: { min: 0, max: 5, step: 0.0001, mode: 'box' } } },
              {
                name: 'off_peak',
                selector: { number: { min: 0, max: 5, step: 0.0001, mode: 'box' } },
              },
            ],
          },
          { name: 'off_peak_hours', selector: { text: {} } },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'subscription',
                selector: { number: { min: 0, max: 1000, step: 0.01, mode: 'box' } },
              },
              {
                name: 'billing_day',
                selector: { number: { min: 1, max: 28, step: 1, mode: 'box' } },
              },
            ],
          },
        ],
      },
      {
        type: 'expandable',
        name: '',
        flatten: true,
        title: this.t('energy_section_source'),
        icon: 'mdi:database-outline',
        schema: [
          { name: 'energy', selector: { statistic: {} } },
          { name: 'cost', selector: { statistic: {} } },
        ],
      },
    ];
  }

  /** The config as the form shows it: off-peak hours as one line of text. */
  private formData(): FormData {
    const config = { ...(this._config ?? {}) };
    const tariff = { ...((config.tariff as Record<string, unknown> | undefined) ?? {}) };
    if (Array.isArray(tariff.off_peak_hours))
      tariff.off_peak_hours = tariff.off_peak_hours.join(', ');
    config.tariff = tariff;
    return config;
  }

  private changed(value: FormData): void {
    const next: Record<string, unknown> = { ...(this._config ?? {}), ...value };
    const tariff = { ...((value.tariff as Record<string, unknown> | undefined) ?? {}) };
    if (typeof tariff.off_peak_hours === 'string') {
      const ranges = tariff.off_peak_hours
        .split(/[,;]/)
        .map((item) => item.trim())
        .filter(Boolean);
      tariff.off_peak_hours = ranges.length ? ranges : undefined;
    }
    // Keep the invoices written in YAML.
    const previous = this._config?.tariff as Record<string, unknown> | undefined;
    if (previous?.invoices) tariff.invoices = previous.invoices;
    for (const key of Object.keys(tariff)) {
      if (tariff[key] === undefined || tariff[key] === '') delete tariff[key];
    }
    next.tariff = tariff;
    for (const field of this.spec?.fields ?? []) {
      if (field.default !== undefined && next[field.name] === field.default)
        delete next[field.name];
    }
    for (const key of ['name', 'energy', 'cost']) {
      if (next[key] === '' || next[key] === undefined || next[key] === null) delete next[key];
    }
    try {
      this.spec?.validate(next);
      this._error = undefined;
    } catch (error) {
      this._error = (error as Error).message;
    }
    this._config = next;
    fireEvent(this, 'config-changed', { config: next });
  }

  protected override render() {
    if (!this.hass || !this._config) return nothing;
    // Field defaults show in the form when the option is not set.
    const data = this.formData();
    for (const field of this.spec?.fields ?? []) {
      if (data[field.name] === undefined && field.default !== undefined)
        data[field.name] = field.default;
    }
    const labels: Record<string, string> = {
      name: this.t('energy_name'),
      energy: this.t('energy_stat'),
      cost: this.t('energy_cost_stat'),
    };
    for (const [name, key] of Object.entries(TARIFF_LABELS)) labels[name] = this.t(key);
    for (const field of this.spec?.fields ?? []) labels[field.name] = this.t(field.label);
    const helpers: Record<string, string> = {
      off_peak_hours: this.t('energy_off_peak_hours_helper'),
      energy: this.t('energy_stat_helper'),
    };
    for (const field of this.spec?.fields ?? []) {
      if (field.helper) helpers[field.name] = this.t(field.helper);
    }
    return html`<ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${this.schema()}
        .computeLabel=${(field: { name: string }) => labels[field.name] ?? field.name}
        .computeHelper=${(field: { name: string }) => helpers[field.name]}
        @value-changed=${(event: CustomEvent<{ value: FormData }>) => {
          event.stopPropagation();
          this.changed(event.detail.value);
        }}
      ></ha-form>
      <p class="hint">${this.t('energy_invoices_hint')}</p>
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}`;
  }
}

defineElement('vivid-energy-editor', VividEnergyEditor);

/** An editor element bound to a spec, for `getConfigElement()`. */
export function energyEditor(spec: EnergyEditorSpec): HTMLElement {
  const element = document.createElement('vivid-energy-editor') as VividEnergyEditor;
  element.spec = spec;
  return element;
}

declare global {
  interface HTMLElementTagNameMap {
    'vivid-energy-editor': VividEnergyEditor;
  }
}
