import { LitElement, css, html } from 'lit';
import { fireEvent } from '../../core/actions';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import '../../components/vivid-source-row';
import { INPUT_COUNT, resolveAmbilightConfig, type AmbilightInputConfig } from './config';
import { sourceLabels } from './view';

type FormData = Record<string, unknown>;

/** An input of the config as an object (a bare string is its name). */
function asObject(raw: string | AmbilightInputConfig | undefined): AmbilightInputConfig {
  return typeof raw === 'string' ? { name: raw } : { ...(raw ?? {}) };
}

/**
 * The HDMI inputs of an Ambilight box: tap one in the row (as on the card),
 * then set its name, icon, or hide it from the menu. Shared by the Ambilight
 * card and the LED group card, which both show the box's inputs.
 *
 * Emits `inputs-changed` with `{ inputs }`: the list to store, or `undefined`
 * when every input keeps its default.
 */
export class VividHdmiInputsEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    inputs: { attribute: false },
    _index: { state: true },
  };

  declare hass?: HomeAssistant;
  /** The `inputs` option as written in the config. */
  declare inputs?: (string | AmbilightInputConfig)[];
  declare _index: number;

  constructor() {
    super();
    this._index = 0;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void ensureHaForm();
  }

  private t(key: EditorStringKey, values?: Record<string, string | number>): string {
    return editorText(this.hass, key, values);
  }

  /** Stores the edited input, dropping trailing inputs left at their defaults. */
  private change(index: number, value: FormData): void {
    const text = (key: string) =>
      typeof value[key] === 'string' ? (value[key] as string).trim() : '';
    const list = Array.from({ length: INPUT_COUNT }, (_, i) => asObject(this.inputs?.[i]));
    const name = text('name');
    const icon = text('icon');
    list[index] = {
      ...(name ? { name } : {}),
      ...(icon ? { icon } : {}),
      ...(value.hidden === true ? { hidden: true } : {}),
    };
    while (list.length && Object.keys(list[list.length - 1] ?? {}).length === 0) list.pop();
    fireEvent(this, 'inputs-changed', { inputs: list.length ? list : undefined });
  }

  protected override render() {
    const resolved = resolveAmbilightConfig({
      type: 'custom:vivid-ambilight-card',
      inputs: this.inputs,
    });
    const index = Math.min(this._index, INPUT_COUNT - 1);
    const n = index + 1;
    const value = asObject(this.inputs?.[index]);
    const labels: Record<string, string> = {
      name: this.t('amb_input_name', { n }),
      icon: this.t('amb_input_icon', { n }),
      hidden: this.t('amb_input_hidden'),
    };
    return html`<div class="hint">${this.t('amb_inputs_pick')}</div>
      <vivid-source-row
        .items=${resolved.inputs.map((input) => ({
          name: input.name,
          icon: input.icon,
          available: true,
        }))}
        .active=${index}
        .labels=${sourceLabels(this.hass)}
        @vivid-source-select=${(event: CustomEvent<{ index: number }>) => {
          event.stopPropagation();
          this._index = event.detail.index;
        }}
      ></vivid-source-row>
      <ha-form
        .hass=${this.hass}
        .data=${{ name: value.name ?? '', icon: value.icon ?? '', hidden: value.hidden === true }}
        .schema=${[
          {
            type: 'grid',
            name: '',
            schema: [
              { name: 'name', selector: { text: {} } },
              { name: 'icon', selector: { icon: { placeholder: 'mdi:video-input-hdmi' } } },
            ],
          },
          { name: 'hidden', selector: { boolean: {} } },
        ]}
        .computeLabel=${(field: { name: string }) => labels[field.name]}
        @value-changed=${(event: CustomEvent<{ value: FormData }>) => {
          event.stopPropagation();
          this.change(index, event.detail.value);
        }}
      ></ha-form>`;
  }

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .hint {
      font-size: 12.5px;
      color: var(--secondary-text-color);
    }
  `;
}

defineElement('vivid-hdmi-inputs-editor', VividHdmiInputsEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-hdmi-inputs-editor': VividHdmiInputsEditor;
  }
}
