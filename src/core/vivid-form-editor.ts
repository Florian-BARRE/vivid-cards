import { LitElement, css, html, nothing } from 'lit';
import { fireEvent } from './actions';
import { ensureHaForm } from './ha-elements';
import type { HomeAssistant } from './hass-types';
import { defineElement } from './register';
import { editorText, type EditorStringKey } from '../i18n/editor';
import { tokens } from '../components/shared-styles';

type FormData = Record<string, unknown>;

/** One option of a card, as an `ha-form` schema entry with its label. */
export interface FormField {
  name: string;
  label: EditorStringKey;
  /** An `ha-form` selector; `options` makes a dropdown instead. */
  selector: Record<string, unknown>;
  options?: { value: string; label: EditorStringKey }[];
  helper?: EditorStringKey;
  /** Value shown when the option is not set; writing it back removes the option. */
  default?: unknown;
  /** Required options are never removed, even empty. */
  required?: boolean;
}

export interface FormEditorSpec {
  fields: FormField[];
  /** Throws when the config is invalid (the message shows under the form). */
  validate?(config: Record<string, unknown>): void;
}

/**
 * Visual editor of the small standalone cards: a flat `ha-form` of their
 * options. Options left at their default, or emptied, are removed from the
 * YAML so it stays short.
 */
export class VividFormEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    spec: { attribute: false },
    _config: { state: true },
    _error: { state: true },
  };

  declare hass?: HomeAssistant;
  declare spec?: FormEditorSpec;
  declare _config?: Record<string, unknown>;
  declare _error?: string;

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
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

  private changed(value: FormData): void {
    const next: Record<string, unknown> = { ...(this._config ?? {}), ...value };
    for (const field of this.spec?.fields ?? []) {
      const current = next[field.name];
      const empty =
        current === undefined ||
        current === null ||
        current === '' ||
        (Array.isArray(current) && current.length === 0);
      if (field.required) continue;
      if (empty || (field.default !== undefined && current === field.default))
        delete next[field.name];
    }
    try {
      this.spec?.validate?.(next);
      this._error = undefined;
    } catch (error) {
      this._error = (error as Error).message;
    }
    this._config = next;
    fireEvent(this, 'config-changed', { config: next });
  }

  protected override render() {
    if (!this.hass || !this._config) return nothing;
    const fields = this.spec?.fields ?? [];
    const data: FormData = { ...this._config };
    for (const field of fields) {
      if (data[field.name] === undefined && field.default !== undefined)
        data[field.name] = field.default;
    }
    const labels: Record<string, string> = {};
    const helpers: Record<string, string> = {};
    for (const field of fields) {
      labels[field.name] = editorText(this.hass, field.label);
      if (field.helper) helpers[field.name] = editorText(this.hass, field.helper);
    }
    return html`<ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${fields.map((field) => ({
          name: field.name,
          selector: field.options
            ? {
                select: {
                  mode: 'dropdown',
                  options: field.options.map((option) => ({
                    value: option.value,
                    label: editorText(this.hass, option.label),
                  })),
                },
              }
            : field.selector,
        }))}
        .computeLabel=${(field: { name: string }) => labels[field.name] ?? field.name}
        .computeHelper=${(field: { name: string }) => helpers[field.name]}
        @value-changed=${(event: CustomEvent<{ value: FormData }>) => {
          event.stopPropagation();
          this.changed(event.detail.value);
        }}
      ></ha-form>
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}`;
  }
}

defineElement('vivid-form-editor', VividFormEditor);

/** An editor element bound to a spec, for `getConfigElement()`. */
export function formEditor(spec: FormEditorSpec): HTMLElement {
  const element = document.createElement('vivid-form-editor') as VividFormEditor;
  element.spec = spec;
  return element;
}

declare global {
  interface HTMLElementTagNameMap {
    'vivid-form-editor': VividFormEditor;
  }
}
