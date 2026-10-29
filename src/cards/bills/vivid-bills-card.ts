import { css, html, nothing, type CSSResultGroup } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { localize } from '../../i18n';
import {
  failer,
  integer,
  resolveEnergyBase,
  SAMPLE_TARIFF,
  type EnergyBaseConfig,
  type ResolvedEnergyBase,
} from '../../energy/config';
import { billHistory, summarizeCycle, type BillBar } from '../../energy/cycle';
import type { EnergyData, EnergyNeeds } from '../../energy/data';
import { addDays, daysBetween } from '../../energy/days';
import { formatKwh, formatMoney, formatShortDate } from '../../energy/format';
import { VividEnergyCard, type EnergyHead } from '../../energy/vivid-energy-card';
import { energyEditor } from '../../energy/vivid-energy-editor';

export const BILLS_CARD = 'vivid-bills-card';

export interface BillsCardConfig extends EnergyBaseConfig {
  type: string;
  /** Bars shown, the next bill included. */
  count?: number;
}

export interface ResolvedBillsCard extends ResolvedEnergyBase {
  count: number;
}

export function resolveBillsCard(raw: unknown): ResolvedBillsCard {
  const base = resolveEnergyBase(BILLS_CARD, raw);
  return {
    ...base,
    count: integer(raw as Record<string, unknown>, 'count', 4, 2, 12, failer(BILLS_CARD)),
  };
}

const BAR_HEIGHT = 200;

/**
 * Bills, past and coming: one bar per bill split into peak, off-peak and
 * subscription; the bill in progress with what is spent, the projection
 * hatched and its range as a whisker; then the next one at the same pace.
 */
export class VividBillsCard extends VividEnergyCard<ResolvedBillsCard> {
  static getConfigElement(): HTMLElement {
    return energyEditor({
      fields: [
        {
          name: 'count',
          label: 'energy_months',
          selector: { number: { min: 2, max: 12, mode: 'box' } },
          default: 4,
        },
      ],
      validate: (config) => resolveBillsCard(config),
    });
  }

  static getStubConfig(): Record<string, unknown> {
    return { tariff: SAMPLE_TARIFF };
  }

  static override styles: CSSResultGroup = [
    VividEnergyCard.styles,
    css`
      .chart {
        display: flex;
        gap: 12px;
        align-items: stretch;
      }
      .column {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        text-align: center;
      }
      .total {
        font-size: 15px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .dim {
        color: var(--vivid-muted);
      }
      .slot {
        position: relative;
        width: min(72px, 100%);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
      .stack {
        display: flex;
        flex-direction: column;
        border-radius: 10px;
        overflow: hidden;
      }
      .stack i {
        display: block;
        flex: none;
      }
      .energy {
        background: rgba(255, 193, 7, 0.55);
      }
      .spent {
        background: rgb(255, 112, 67);
      }
      .rest {
        background: var(--energy-hatch);
        box-shadow: inset 0 0 0 2px rgba(255, 112, 67, 0.9);
        border-radius: 10px 10px 0 0;
      }
      .next {
        background: var(--energy-hatch);
      }
      .next-sub {
        background: rgba(var(--vivid-rgb-text), 0.18);
      }
      .whisker {
        position: absolute;
        left: 50%;
        width: 18px;
        margin-left: -9px;
        border-top: 2px solid var(--primary-text-color);
        border-bottom: 2px solid var(--primary-text-color);
        box-sizing: border-box;
      }
      .whisker::after {
        content: '';
        position: absolute;
        left: 8px;
        top: 0;
        bottom: 0;
        border-left: 2px solid var(--primary-text-color);
      }
      .dates {
        font-size: 12.5px;
        font-weight: 600;
        white-space: nowrap;
      }
      .note {
        font-size: 11.5px;
        color: var(--vivid-muted);
        line-height: 1.3;
      }
    `,
  ];

  protected resolveConfig(raw: unknown): ResolvedBillsCard {
    return resolveBillsCard(raw);
  }

  protected needs(config: ResolvedBillsCard, today: string): EnergyNeeds {
    // Back to the oldest bill shown, and the 30 days of the pace.
    const first = config.tariff.invoices[0]?.from;
    const back = first ? daysBetween(first, today) + 1 : 31 * config.count;
    return {
      days: Math.min(400, Math.max(80, Math.min(back, 31 * config.count + 31))),
      hourlyDays: 32,
    };
  }

  protected head(config: ResolvedBillsCard): EnergyHead {
    return {
      icon: 'mdi:receipt-text-clock-outline',
      color: [255, 112, 67],
      title: config.name ?? localize(this.hass, 'energy_bills'),
      sub: localize(this.hass, 'energy_bills_sub'),
    };
  }

  private renderBar(bar: BillBar, scale: number, data: EnergyData, config: ResolvedBillsCard) {
    const hass = this.hass;
    const px = (value: number) => `${Math.max(0, (value / scale) * BAR_HEIGHT).toFixed(1)}px`;
    const dates = `${formatShortDate(hass, bar.start)} → ${formatShortDate(hass, addDays(bar.end, -1))}`;
    const days = daysBetween(bar.start, bar.end);
    let segments;
    let note: string;
    let whisker = nothing as unknown;
    let total = formatMoney(hass, bar.total, 0);
    if (bar.kind === 'current') {
      const cycle = summarizeCycle(data.days, config.tariff, bar.start, bar.end, data.today);
      const energy = cycle.totals.energyCost;
      const rest = Math.max(0, bar.total - bar.subscription - energy);
      segments = html`<i class="rest" style=${styleMap({ height: px(rest) })}></i
        ><i class="spent" style=${styleMap({ height: px(energy) })}></i
        ><i class="subscription" style=${styleMap({ height: px(bar.subscription) })}></i>`;
      note = localize(hass, 'energy_in_progress', { day: cycle.dayIndex, total: cycle.length });
      total = `≈ ${total}`;
      if (bar.low !== undefined && bar.high !== undefined && bar.high - bar.low > 0.5) {
        whisker = html`<i
          class="whisker"
          title=${`${formatMoney(hass, bar.low, 0)} – ${formatMoney(hass, bar.high, 0)}`}
          style=${styleMap({ bottom: px(bar.low), height: px(bar.high - bar.low) })}
        ></i>`;
      }
    } else if (bar.kind === 'next') {
      segments = html`<i class="next" style=${styleMap({ height: px(bar.energy ?? 0) })}></i
        ><i class="next-sub" style=${styleMap({ height: px(bar.subscription) })}></i>`;
      note = localize(hass, 'energy_next_if_same');
      total = `≈ ${total}`;
    } else {
      segments =
        bar.peak !== undefined && bar.offPeak !== undefined
          ? html`<i class="peak" style=${styleMap({ height: px(bar.peak) })}></i
              ><i class="off-peak" style=${styleMap({ height: px(bar.offPeak) })}></i>`
          : html`<i class="energy" style=${styleMap({ height: px(bar.energy ?? 0) })}></i>`;
      segments = html`${segments}<i
          class="subscription"
          style=${styleMap({ height: px(bar.subscription) })}
        ></i>`;
      note =
        bar.kwh !== undefined
          ? localize(hass, 'energy_kwh_days', { k: formatKwh(hass, bar.kwh, 0), d: days })
          : '';
    }
    return html`<div class="column">
      <span class=${bar.kind === 'next' ? 'total dim' : 'total'}>${total}</span>
      <div class="slot" style=${styleMap({ height: `${BAR_HEIGHT}px` })}>
        ${whisker}
        <div class="stack">${segments}</div>
      </div>
      <span class="dates">${dates}</span>
      <span class="note">${note}</span>
    </div>`;
  }

  protected renderBody(config: ResolvedBillsCard, data: EnergyData) {
    const bars = billHistory(data.days, config.tariff, data.today, config.count);
    const scale = Math.max(...bars.map((bar) => Math.max(bar.total, bar.high ?? 0)), 1) * 1.04;
    const hass = this.hass;
    const split = bars.some((bar) => bar.peak !== undefined);
    const plain = bars.some(
      (bar) => bar.kind !== 'current' && bar.kind !== 'next' && bar.peak === undefined,
    );
    return html`<div class="chart" role="img" aria-label=${localize(hass, 'energy_bills')}>
        ${bars.map((bar) => this.renderBar(bar, scale, data, config))}
      </div>
      <div class="legend">
        ${
          split
            ? html`<span><i class="dot peak"></i>${localize(hass, 'energy_peak')}</span>
                <span><i class="dot off-peak"></i>${localize(hass, 'energy_off_peak')}</span>`
            : nothing
        }
        ${plain ? html`<span><i class="dot energy"></i>${localize(hass, 'energy_consumption')}</span>` : nothing}
        <span><i class="dot spent"></i>${localize(hass, 'energy_current_energy')}</span>
        <span><i class="dot subscription"></i>${localize(hass, 'energy_subscription')}</span>
        <span
          ><i class="dot" style="background: var(--energy-hatch)"></i
          >${localize(hass, 'energy_projection')}</span
        >
      </div>`;
  }
}

defineElement(BILLS_CARD, VividBillsCard);

registerCard({
  type: BILLS_CARD,
  name: 'Vivid Bills',
  description:
    'Past bills, the one in progress with its projection, and the next one at the same pace.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-bills-card`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-bills-card': VividBillsCard;
  }
}
