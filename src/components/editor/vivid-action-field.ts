/* ====== Code Summary ======
 * One action in a visual editor (what a tap, a hold, or the power button
 * does): "Automatic" shows in plain words what the card does on its own,
 * "Custom action" opens Home Assistant's own action editor (perform an
 * action, navigate, more-info, toggle…). Fires `action-changed` with the
 * action, or `undefined` for automatic.
 */

import { LitElement, css, html, nothing } from 'lit';
import { fireEvent } from '../../core/actions';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { slotText } from '../../i18n/slots';
import { tokens } from '../shared-styles';

export class VividActionField extends LitElement {
  static override properties = {
    hass: { attribute: false },
    label: {},
    value: { attribute: false },
    automatic: {},
    _custom: { state: true },
  };

  declare hass?: HomeAssistant;
  declare label: string;
  /** The action in the config, `undefined` when automatic. */
  declare value?: Record<string, unknown>;
  /** What the card does when automatic ("Runs salon-scripts-on"). */
  declare automatic?: string;
  declare _custom: boolean;

  constructor() {
    super();
    this.label = '';
    this._custom = false;
  }

  protected override willUpdate(): void {
    if (this.value) this._custom = true;
  }

  private choose(custom: boolean): void {
    this._custom = custom;
    if (!custom) fireEvent(this, 'action-changed', { value: undefined });
  }

  protected override render() {
    const custom = this._custom || !!this.value;
    return html`<div class="field">
      <div class="label">${this.label}</div>
      <div class="modes" role="radiogroup">
        <button
          class="mode ${custom ? '' : 'on'}"
          role="radio"
          aria-checked=${custom ? 'false' : 'true'}
          @click=${() => this.choose(false)}
        >
          ${slotText(this.hass, 'action_auto')}
        </button>
        <button
          class="mode ${custom ? 'on' : ''}"
          role="radio"
          aria-checked=${custom ? 'true' : 'false'}
          @click=${() => this.choose(true)}
        >
          ${slotText(this.hass, 'action_custom')}
        </button>
      </div>
      ${
        custom
          ? html`<ha-form
              .hass=${this.hass}
              .data=${{ action: this.value ?? { action: 'perform-action' } }}
              .schema=${[{ name: 'action', selector: { ui_action: {} } }]}
              .computeLabel=${() => this.label}
              @value-changed=${(
                event: CustomEvent<{ value: { action?: Record<string, unknown> } }>,
              ) => {
                event.stopPropagation();
                fireEvent(this, 'action-changed', { value: event.detail.value.action });
              }}
            ></ha-form>`
          : this.automatic
            ? html`<div class="auto">${this.automatic}</div>`
            : nothing
      }
    </div>`;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .label {
        font-size: 13px;
        font-weight: 500;
      }
      .modes {
        display: inline-flex;
        align-self: flex-start;
        padding: 2px;
        border-radius: 9px;
        background: rgba(var(--vivid-rgb-text), 0.06);
      }
      .mode {
        appearance: none;
        border: none;
        background: none;
        font: inherit;
        padding: 5px 12px;
        border-radius: 7px;
        font-size: 12.5px;
        cursor: pointer;
        color: var(--secondary-text-color);
      }
      .mode.on {
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-weight: 600;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
      }
      .mode:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .auto {
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.04);
        font-size: 12.5px;
        overflow-wrap: anywhere;
      }
    `,
  ];
}

defineElement('vivid-action-field', VividActionField);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-action-field': VividActionField;
  }
}
