import { LitElement, css, html, nothing } from 'lit';
import { fireEvent } from './actions';
import { ensureHaForm } from './ha-elements';
import type { HomeAssistant } from './hass-types';
import type { PilotCategory, PilotKind } from './pilot';
import { applySource, sourceFields, targetSource } from '../components/editor/pilot-source';
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
  /**
   * The card can follow a Vivid Pilot node: a Source choice comes first, and
   * the `manual` fields only show in manual mode.
   */
  pilot?: {
    kind: PilotKind;
    categories: readonly (PilotCategory | undefined)[];
    manual: readonly string[];
  };
  /**
   * More parts under the form (a card's device entities…): gets the config
   * and a callback that applies a changed config.
   */
  extra?(
    hass: HomeAssistant,
    config: Record<string, unknown>,
    apply: (config: Record<string, unknown>) => void,
  ): unknown;
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
    const pilot = this.spec?.pilot;
    if (pilot && this._config) {
      const { config, switched } = applySource(this._config, value);
      if (switched) {
        this._config = config;
        fireEvent(this, 'config-changed', { config });
        return;
      }
      value = { ...value, pilot: config.pilot };
      delete value.source;
    }
    const next: Record<string, unknown> = { ...(this._config ?? {}), ...value };
    for (const [key, item] of Object.entries(next)) if (item === undefined) delete next[key];
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
    const pilot = this.spec?.pilot;
    const source = targetSource(this._config);
    const fields = (this.spec?.fields ?? []).filter(
      (field) => !pilot || source === 'manual' || !pilot.manual.includes(field.name),
    );
    const sourceSchema = pilot
      ? sourceFields(
          this.hass,
          {
            pilot: editorText(this.hass, 'badge_source_pilot'),
            manual: editorText(this.hass, 'badge_source_manual'),
          },
          pilot.kind,
          pilot.categories,
          source,
        )
      : [];
    const data: FormData = pilot ? { ...this._config, source } : { ...this._config };
    for (const field of fields) {
      if (data[field.name] === undefined && field.default !== undefined)
        data[field.name] = field.default;
    }
    const labels: Record<string, string> = {
      source: editorText(this.hass, 'badge_source'),
      pilot: editorText(this.hass, 'badge_pilot'),
    };
    const helpers: Record<string, string> = {};
    for (const field of fields) {
      labels[field.name] = editorText(this.hass, field.label);
      if (field.helper) helpers[field.name] = editorText(this.hass, field.helper);
    }
    return html`<ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${[
          ...sourceSchema,
          ...fields.map((field) => ({
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
          })),
        ]}
        .computeLabel=${(field: { name: string }) => labels[field.name] ?? field.name}
        .computeHelper=${(field: { name: string }) => helpers[field.name]}
        @value-changed=${(event: CustomEvent<{ value: FormData }>) => {
          event.stopPropagation();
          this.changed(event.detail.value);
        }}
      ></ha-form>
      ${this.spec?.extra?.(this.hass, this._config, (config) => this.changed(config)) ?? nothing}
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
