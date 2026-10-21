import { LitElement, css, html, nothing } from 'lit';
import { fireEvent } from '../core/actions';
import { defineElement } from '../core/register';
import { buttonReset, tokens } from './shared-styles';

export interface OrderItem {
  value: string;
  label: string;
  icon?: string;
}

/**
 * Picks some of `items`, in an order: the chosen ones first, numbered, in
 * their order; a tap on another adds it at the end, a tap on a chosen one
 * takes it out, its arrows move it. Fires `value-changed` with `{ value }`.
 */
export class VividOrderPicker extends LitElement {
  static override properties = {
    items: { attribute: false },
    value: { attribute: false },
    label: {},
    helper: {},
    max: { type: Number },
  };

  declare items: OrderItem[];
  declare value: string[];
  declare label?: string;
  declare helper?: string;
  /** At most this many chosen (0: no limit). */
  declare max: number;

  constructor() {
    super();
    this.items = [];
    this.value = [];
    this.max = 0;
  }

  static override styles = [
    tokens,
    buttonReset,
    css`
      :host {
        display: block;
      }
      .label {
        margin-bottom: 6px;
        font-size: 13px;
        font-weight: 500;
      }
      .helper {
        margin-top: 6px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 32px;
        padding: 0 10px 0 8px;
        border-radius: 16px;
        background: rgba(var(--vivid-rgb-text), 0.06);
        color: var(--secondary-text-color);
        font-size: 13px;
        font-weight: 500;
        border: 1px dashed rgba(var(--vivid-rgb-text), 0.18);
      }
      .chip.on {
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.6);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.16);
        color: var(--primary-text-color);
      }
      .chip:disabled {
        opacity: 0.4;
        cursor: default;
      }
      .chip ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
      }
      .num {
        display: grid;
        place-items: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        font-size: 11px;
        font-weight: 700;
      }
      .move {
        display: inline-grid;
        place-items: center;
        width: 20px;
        height: 20px;
        margin: 0 -4px;
        border-radius: 50%;
        color: var(--secondary-text-color);
      }
      .move:hover {
        background: rgba(var(--vivid-rgb-text), 0.1);
      }
    `,
  ];

  private emit(value: string[]): void {
    this.value = value;
    fireEvent(this, 'value-changed', { value });
  }

  private toggle(item: string): void {
    const value = this.value;
    if (value.includes(item)) this.emit(value.filter((entry) => entry !== item));
    else if (!this.max || value.length < this.max) this.emit([...value, item]);
  }

  private move(item: string, step: -1 | 1, event: Event): void {
    event.stopPropagation();
    const value = [...this.value];
    const index = value.indexOf(item);
    const target = index + step;
    if (index < 0 || target < 0 || target >= value.length) return;
    [value[index], value[target]] = [value[target] as string, value[index] as string];
    this.emit(value);
  }

  protected override render() {
    const chosen = this.value
      .map((value) => this.items.find((item) => item.value === value))
      .filter((item): item is OrderItem => item !== undefined);
    const rest = this.items.filter((item) => !this.value.includes(item.value));
    const full = this.max > 0 && chosen.length >= this.max;
    return html`${this.label ? html`<div class="label">${this.label}</div>` : nothing}
      <div class="chips">
        ${chosen.map(
          (item, index) =>
            html`<button
              type="button"
              class="reset chip on"
              title=${item.label}
              @click=${() => this.toggle(item.value)}
            >
              <span class="num">${index + 1}</span>
              ${item.icon ? html`<ha-icon .icon=${item.icon}></ha-icon>` : nothing}${item.label}
              ${
                chosen.length > 1
                  ? html`<span
                        class="move"
                        role="button"
                        aria-label="←"
                        @click=${(event: Event) => this.move(item.value, -1, event)}
                        ><ha-icon icon="mdi:chevron-left"></ha-icon></span
                      ><span
                        class="move"
                        role="button"
                        aria-label="→"
                        @click=${(event: Event) => this.move(item.value, 1, event)}
                        ><ha-icon icon="mdi:chevron-right"></ha-icon
                      ></span>`
                  : nothing
              }
            </button>`,
        )}
        ${rest.map(
          (item) =>
            html`<button
              type="button"
              class="reset chip"
              ?disabled=${full}
              @click=${() => this.toggle(item.value)}
            >
              ${item.icon ? html`<ha-icon .icon=${item.icon}></ha-icon>` : nothing}${item.label}
            </button>`,
        )}
      </div>
      ${this.helper ? html`<div class="helper">${this.helper}</div>` : nothing}`;
  }
}

defineElement('vivid-order-picker', VividOrderPicker);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-order-picker': VividOrderPicker;
  }
}
