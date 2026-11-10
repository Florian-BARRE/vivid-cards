/* ====== Code Summary ======
 * Invoices of the electricity tariff, edited in the interface: one row per
 * invoice (dates, amount, kWh, subscription), newest first, removable, and a
 * button to add the next one. Fires `invoices-changed` with the list.
 */

import { LitElement, css, html } from 'lit';
import { fireEvent } from '../../core/actions';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { slotText, type SlotStringKey } from '../../i18n/slots';
import { tokens } from '../shared-styles';
import './vivid-editor-section';

export interface InvoiceConfig {
  from?: string;
  to?: string;
  total?: number;
  kwh?: number;
  peak_kwh?: number;
  off_peak_kwh?: number;
  subscription?: number;
}

const NUMBERS = ['total', 'kwh', 'peak_kwh', 'off_peak_kwh', 'subscription'] as const;

/** The day after a date (`2026-10-11` → `2026-10-12`). */
function nextDay(date: string): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

/** A new invoice starting the day after the last one. */
export function nextInvoice(invoices: readonly InvoiceConfig[]): InvoiceConfig {
  const last = [...invoices]
    .filter((item) => item.to)
    .sort((a, b) => String(a.to).localeCompare(String(b.to)))
    .at(-1);
  return last?.to ? { from: nextDay(last.to) } : {};
}

export class VividInvoicesEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    invoices: { attribute: false },
  };

  declare hass?: HomeAssistant;
  declare invoices?: InvoiceConfig[];

  private t(key: SlotStringKey, values?: Record<string, string | number>): string {
    return slotText(this.hass, key, values);
  }

  private emit(list: InvoiceConfig[]): void {
    fireEvent(this, 'invoices-changed', { value: list });
  }

  private update_(index: number, value: Record<string, unknown>): void {
    const list = [...(this.invoices ?? [])];
    const next: Record<string, unknown> = { ...list[index] };
    for (const [key, item] of Object.entries(value)) {
      if (item === undefined || item === '' || item === null) delete next[key];
      else next[key] = item;
    }
    list[index] = next as InvoiceConfig;
    this.emit(list);
  }

  protected override render() {
    const invoices = this.invoices ?? [];
    const order = invoices
      .map((invoice, index) => ({ invoice, index }))
      .sort((a, b) => String(b.invoice.from ?? '9').localeCompare(String(a.invoice.from ?? '9')));
    const schema = [
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'from', selector: { date: {} } },
          { name: 'to', selector: { date: {} } },
        ],
      },
      ...NUMBERS.map((name) => ({
        name,
        selector: { number: { min: 0, step: 0.01, mode: 'box' } },
      })),
    ];
    return html`<vivid-editor-section
      icon="mdi:file-document-multiple-outline"
      .heading=${this.t('invoices')}
      .hint=${this.t('invoices_hint', { count: invoices.length })}
    >
      <div class="help">${this.t('invoices_help')}</div>
      ${order.map(
        ({ invoice, index }) =>
          html`<div class="invoice">
            <ha-form
              .hass=${this.hass}
              .data=${invoice}
              .schema=${schema}
              .computeLabel=${(field: { name: string }) => this.t(`invoice_${field.name}` as SlotStringKey)}
              @value-changed=${(event: CustomEvent<{ value: Record<string, unknown> }>) => {
                event.stopPropagation();
                this.update_(index, event.detail.value);
              }}
            ></ha-form>
            <button
              class="remove"
              title=${slotText(this.hass, 'remove')}
              @click=${() => this.emit(invoices.filter((_, position) => position !== index))}
            >
              <ha-icon .icon=${'mdi:delete-outline'}></ha-icon>
            </button>
          </div>`,
      )}
      <button class="add" @click=${() => this.emit([...invoices, nextInvoice(invoices)])}>
        <ha-icon .icon=${'mdi:plus'}></ha-icon>${this.t('invoice_add')}
      </button>
    </vivid-editor-section>`;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
        margin-top: 12px;
      }
      .help {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .invoice {
        position: relative;
        padding: 10px 44px 10px 10px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.04);
      }
      .remove,
      .add {
        appearance: none;
        border: none;
        background: none;
        font: inherit;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .remove {
        position: absolute;
        top: 8px;
        right: 6px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
      }
      .remove:hover {
        color: var(--error-color, #db4437);
      }
      .add {
        align-self: flex-start;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 4px;
        color: var(--primary-color, #03a9f4);
        font-weight: 500;
      }
    `,
  ];
}

defineElement('vivid-invoices-editor', VividInvoicesEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-invoices-editor': VividInvoicesEditor;
  }
}
