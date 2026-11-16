/**
 * The last bills under the Bill card: one small stacked bar per cycle (peak,
 * off-peak or energy, subscription), the cycle in progress last, outlined,
 * with what is still to come hatched.
 */
import { LitElement, css, html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import { tokens } from '../components/shared-styles';
import { localize } from '../i18n';
import { billHistory, summarizeCycle, type BillBar } from './cycle';
import type { DayRecord } from './days';
import { addDays } from './days';
import { formatMoney, formatShortDate } from './format';
import { energyStyles } from './styles';
import type { Tariff } from './tariff';

/** Height of the tallest bar, in pixels. */
const BAR_HEIGHT = 84;

/** One segment of a bar: its class and its amount. */
interface Segment {
  cls: string;
  value: number;
}

/** The segments of a bar, top to bottom. */
export function barSegments(bar: BillBar, spentEnergy?: number): Segment[] {
  if (bar.kind === 'current') {
    const energy = spentEnergy ?? 0;
    return [
      { cls: 'rest', value: Math.max(0, bar.total - bar.subscription - energy) },
      { cls: 'spent', value: energy },
      { cls: 'subscription', value: bar.subscription },
    ];
  }
  const energy =
    bar.peak !== undefined && bar.offPeak !== undefined
      ? [
          { cls: 'peak', value: bar.peak },
          { cls: 'off-peak', value: bar.offPeak },
        ]
      : [{ cls: 'energy', value: bar.energy ?? 0 }];
  return [...energy, { cls: 'subscription', value: bar.subscription }];
}

export class VividBillHistory extends LitElement {
  static override properties = {
    hass: { attribute: false },
    days: { attribute: false },
    tariff: { attribute: false },
    today: {},
    count: { type: Number },
  };

  declare hass?: HomeAssistant;
  declare days?: readonly DayRecord[];
  declare tariff?: Tariff;
  declare today?: string;
  /** Bars shown, the cycle in progress included. */
  declare count: number;

  constructor() {
    super();
    this.count = 4;
  }

  static override styles = [
    tokens,
    energyStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      .bars {
        display: grid;
        grid-template-columns: repeat(var(--count), minmax(0, 1fr));
        gap: 10px;
        align-items: end;
      }
      .column {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }
      .total {
        font-size: 13px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
      .stack {
        width: min(46px, 100%);
        display: flex;
        flex-direction: column;
        border-radius: 8px;
        overflow: hidden;
      }
      .current .stack {
        outline: 2px solid var(--energy-accent);
        outline-offset: 2px;
      }
      .current .total,
      .current .dates {
        color: var(--energy-accent);
      }
      .stack i {
        display: block;
      }
      .rest {
        background: var(--energy-hatch);
      }
      .spent,
      .energy {
        background: var(--energy-accent);
      }
      .dates {
        font-size: 11.5px;
        color: var(--vivid-muted);
        text-align: center;
        overflow-wrap: anywhere;
      }
    `,
  ];

  protected override render() {
    const { days, tariff, today } = this;
    if (!days || !tariff || !today) return nothing;
    const hass = this.hass;
    const bars = billHistory(days, tariff, today, this.count + 1)
      .filter((bar) => bar.kind !== 'next')
      .slice(-this.count);
    if (bars.length < 2) return nothing;
    const scale = Math.max(...bars.map((bar) => bar.total), 1);
    const px = (value: number) => `${Math.max(0, (value / scale) * BAR_HEIGHT).toFixed(1)}px`;
    return html`<h3>${localize(hass, 'energy_history')}</h3>
      <div class="bars" style=${styleMap({ '--count': String(bars.length) })}>
        ${bars.map((bar) => {
          const current = bar.kind === 'current';
          const spent = current
            ? summarizeCycle(days, tariff, bar.start, bar.end, today).totals.energyCost
            : undefined;
          const label = current
            ? localize(hass, 'energy_in_progress_short')
            : `${formatShortDate(hass, bar.start)} → ${formatShortDate(hass, addDays(bar.end, -1))}`;
          return html`<div class=${classMap({ column: true, current })}>
            <span class="total">${current ? '≈ ' : ''}${formatMoney(hass, bar.total, 0)}</span>
            <div class="stack" aria-hidden="true">
              ${barSegments(bar, spent).map(
                (segment) =>
                  html`<i
                    class=${segment.cls}
                    style=${styleMap({ height: px(segment.value) })}
                  ></i>`,
              )}
            </div>
            <span class="dates">${label}</span>
          </div>`;
        })}
      </div>`;
  }
}

defineElement('vivid-bill-history', VividBillHistory);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-bill-history': VividBillHistory;
  }
}
