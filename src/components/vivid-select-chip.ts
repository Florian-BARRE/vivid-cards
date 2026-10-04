import { LitElement, css, html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { fireEvent } from '../core/actions';
import { defineElement } from '../core/register';
import { tokens } from './shared-styles';

/**
 * Chip that opens a list of options. A transparent native `<select>` covers the
 * chip, so the platform picker is used: long lists scroll natively on mobile and
 * the menu is never clipped by the card. Fires `value-changed` with `{ value }`.
 */
export class VividSelectChip extends LitElement {
  static override properties = {
    icon: {},
    value: {},
    options: { attribute: false },
    tooltip: {},
    placeholder: {},
    disabled: { type: Boolean, reflect: true },
  };

  declare icon?: string;
  declare value?: string;
  declare options: string[];
  declare tooltip?: string;
  declare placeholder?: string;
  declare disabled: boolean;

  constructor() {
    super();
    this.options = [];
    this.disabled = false;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: inline-flex;
        min-width: 0;
      }
      .chip {
        position: relative;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        max-width: 100%;
        height: var(--vivid-chip-height);
        padding: 0 10px 0 12px;
        border-radius: calc(var(--vivid-chip-height) / 2);
        background: var(--vivid-chip-context, var(--vivid-layer-1));
        color: var(--primary-text-color);
        font-size: 13px;
        font-weight: 500;
        -webkit-tap-highlight-color: transparent;
      }
      .chip:focus-within {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        flex: none;
      }
      .chevron {
        --mdc-icon-size: 16px;
        opacity: 0.7;
      }
      .value {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      select {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        /* 16px prevents iOS from zooming into the page when the picker opens. */
        font-size: 16px;
      }
      select:disabled {
        cursor: default;
      }
      :host([disabled]) .chip {
        opacity: 0.45;
      }
    `,
  ];

  private readonly onChange = (event: Event): void => {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    // Snap back to the entity's state: the real value arrives with the next update.
    select.value = this.value ?? '';
    if (value && value !== this.value) fireEvent(this, 'value-changed', { value });
  };

  /** Keeps the press from reaching a surrounding slider. */
  private readonly stop = (event: Event): void => event.stopPropagation();

  protected override render() {
    const known = this.value !== undefined && this.options.includes(this.value);
    return html`<label class="chip" @pointerdown=${this.stop} title=${ifDefined(this.tooltip)}>
      ${this.icon ? html`<ha-icon .icon=${this.icon}></ha-icon>` : nothing}
      <span class="value">${this.value ?? this.placeholder ?? '—'}</span>
      <ha-icon class="chevron" .icon=${'mdi:chevron-down'}></ha-icon>
      <select
        aria-label=${ifDefined(this.tooltip)}
        ?disabled=${this.disabled}
        @change=${this.onChange}
        @click=${this.stop}
      >
        ${known ? nothing : html`<option value="" selected disabled>—</option>`}
        ${this.options.map(
          (option) =>
            html`<option .value=${option} ?selected=${option === this.value}>${option}</option>`,
        )}
      </select>
    </label>`;
  }
}

defineElement('vivid-select-chip', VividSelectChip);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-select-chip': VividSelectChip;
  }
}
