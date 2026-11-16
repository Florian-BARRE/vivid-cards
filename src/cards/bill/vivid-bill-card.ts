import { css, html, nothing, type CSSResultGroup } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { GLOW_SLIDER } from '../../core/glow';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { localize } from '../../i18n';
import { SAMPLE_TARIFF } from '../../energy/config';
import type { EnergyData, EnergyNeeds } from '../../energy/data';
import { addDays } from '../../energy/days';
import { deltaColor, formatDelta, formatMoney, formatShortDate, rgb } from '../../energy/format';
import '../../energy/bill-history';
import '../../energy/bill-summary';
import { billParts } from '../../energy/bill-summary';
import { plannedRing, ringStyles, type PlannedPart } from '../../energy/ring';
import { VividEnergyCard, type EnergyHead } from '../../energy/vivid-energy-card';
import { energyEditor } from '../../energy/vivid-energy-editor';
import { billView, type BillView } from '../../energy/views';
import { BILL_CARD, resolveBillCard, type ResolvedBillCard } from './config';

export const BILL_ICON = 'mdi:receipt-text-outline';

/** Days read: the cycle, the one before, and the 30 days of the slower pace. */
export const BILL_NEEDS: EnergyNeeds = { days: 80, hourlyDays: 32 };

/** Days read with the previous cycles: four cycles and the pace. */
const HISTORY_NEEDS: EnergyNeeds = { days: 160, hourlyDays: 32 };

/**
 * The bill in progress: its forecast at the end of the cycle, what is already
 * spent, the previous bill, the pace, the planned split (a bar, or a ring)
 * and the previous cycles. As a card, or as one line that unfolds. It also
 * stands for the former bill ring and bills cards.
 */
export class VividBillCard extends VividEnergyCard<ResolvedBillCard> {
  static override properties = {
    ...VividEnergyCard.properties,
    _open: { state: true },
  };

  declare _open: boolean;

  constructor() {
    super();
    this._open = false;
  }

  static getConfigElement(): HTMLElement {
    return energyEditor({
      fields: [
        {
          name: 'layout',
          label: 'energy_layout',
          default: 'card',
          options: [
            { value: 'card', label: 'energy_layout_card' },
            { value: 'ring', label: 'energy_layout_ring' },
            { value: 'line', label: 'energy_layout_line' },
          ],
        },
        { name: 'history', label: 'energy_history_show', selector: { boolean: {} }, default: true },
        { name: 'glow', label: 'energy_glow', selector: GLOW_SLIDER, default: 100 },
      ],
      validate: (config) => resolveBillCard(config),
    });
  }

  static getStubConfig(): Record<string, unknown> {
    return { tariff: SAMPLE_TARIFF };
  }

  static override styles: CSSResultGroup = [
    VividEnergyCard.styles,
    ringStyles,
    css`
      .divider {
        height: 1px;
        background: rgba(var(--vivid-rgb-text), 0.1);
      }
      .line {
        padding: 10px 12px;
        gap: 10px;
      }
      .line .head {
        gap: 10px;
      }
      .line .title {
        font-size: 15px;
      }
      .mini {
        width: 110px;
        flex: none;
        height: 8px;
        border-radius: 4px;
        background: rgba(var(--vivid-rgb-text), 0.08);
        overflow: hidden;
      }
      .mini i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--energy-accent);
      }
      .chevron {
        transition: transform 0.2s ease;
      }
      .chevron[data-open] {
        transform: rotate(180deg);
      }
      @media (max-width: 420px) {
        .mini {
          display: none;
        }
      }
    `,
  ];

  protected resolveConfig(raw: unknown): ResolvedBillCard {
    return resolveBillCard(raw);
  }

  protected needs(config: ResolvedBillCard): EnergyNeeds {
    return config.history && config.layout !== 'line' ? HISTORY_NEEDS : BILL_NEEDS;
  }

  override getCardSize(): number {
    return this._config?.layout === 'line' && !this._open ? 1 : 5;
  }

  protected override glows(): boolean {
    return this._config?.layout !== 'line';
  }

  private view(config: ResolvedBillCard, data: EnergyData): BillView {
    return billView(data.days, config.tariff, data.today);
  }

  protected head(config: ResolvedBillCard, data: EnergyData | undefined): EnergyHead {
    const title = config.name ?? localize(this.hass, 'energy_bill');
    const view = data?.days.length ? this.view(config, data) : undefined;
    if (!view) return { icon: BILL_ICON, title };
    const cycle = view.cycle;
    const hass = this.hass;
    if (config.layout === 'line') {
      const parts = [
        localize(hass, 'energy_day_of', { day: cycle.dayIndex, total: cycle.length }),
        view.delta !== undefined ? formatDelta(hass, view.delta) : undefined,
        localize(hass, 'energy_per_day', { v: formatMoney(hass, view.dailyCost) }),
      ].filter(Boolean);
      return {
        icon: BILL_ICON,
        title: `${title} · ${formatMoney(hass, cycle.projected, 0)}`,
        sub: parts.join(' · '),
        aside: html`<div class="mini" aria-hidden="true">
            <i
              style=${styleMap({ width: `${Math.min(100, (cycle.toDate / Math.max(cycle.projected, 0.01)) * 100).toFixed(0)}%` })}
            ></i>
          </div>
          <button
            type="button"
            class="reset icon-button"
            aria-expanded=${String(this._open)}
            aria-label=${localize(hass, this._open ? 'energy_collapse' : 'energy_expand')}
            @click=${() => {
              this._open = !this._open;
            }}
          >
            <ha-icon class="chevron" ?data-open=${this._open} icon="mdi:chevron-down"></ha-icon>
          </button>`,
      };
    }
    const delta = view.delta;
    return {
      icon: BILL_ICON,
      title,
      sub: localize(hass, 'energy_bill_sub', {
        range: localize(hass, 'energy_bill_range', {
          from: formatShortDate(hass, cycle.start),
          to: formatShortDate(hass, addDays(cycle.end, -1)),
        }),
        day: cycle.dayIndex,
        total: cycle.length,
      }),
      aside:
        delta !== undefined
          ? html`<span
              class="badge-chip"
              title=${localize(hass, 'energy_vs_previous', {
                d: formatDelta(hass, delta),
                v: formatMoney(hass, view.previous?.projected ?? 0),
              })}
              style=${styleMap({ background: rgb(deltaColor(delta), 0.2), color: rgb(deltaColor(delta)) })}
              >${formatDelta(hass, delta)}</span
            >`
          : nothing,
    };
  }

  /** The planned split as a ring: the forecast's parts, the kWh so far inside. */
  private renderRing(view: BillView) {
    const parts = billParts(view);
    const planned: PlannedPart[] =
      parts.energy !== undefined
        ? [{ key: 'energy', value: parts.energy }]
        : [
            { key: 'peak', value: parts.peak ?? 0 },
            { key: 'off_peak', value: parts.offPeak ?? 0 },
          ];
    planned.push({ key: 'subscription', value: parts.subscription });
    const sums = view.cycle.totals;
    const split = sums.splitDays === sums.days && sums.days > 0;
    const kwhSplit = sums.peakKwh + sums.offPeakKwh;
    const note =
      parts.offPeak !== undefined && kwhSplit > 0 && view.cycle.projected > 0
        ? localize(this.hass, 'energy_off_peak_note', {
            k: `${Math.round((sums.offPeakKwh / kwhSplit) * 100)} %`,
            e: `${Math.round((parts.offPeak / view.cycle.projected) * 100)} %`,
          })
        : undefined;
    return plannedRing(
      this.hass,
      planned,
      view.cycle.projected,
      {
        peak: split ? sums.peakKwh : undefined,
        offPeak: split ? sums.offPeakKwh : undefined,
        total: sums.kwh,
      },
      note,
    );
  }

  protected renderBody(config: ResolvedBillCard, data: EnergyData) {
    if (config.layout === 'line' && !this._open) return nothing;
    const ring = config.layout === 'ring';
    return html`<vivid-bill-summary
        .hass=${this.hass}
        .view=${this.view(config, data)}
        .tariff=${config.tariff}
        .parts=${!ring}
      ></vivid-bill-summary>
      ${ring ? this.renderRing(this.view(config, data)) : nothing}
      ${
        config.history && config.layout !== 'line'
          ? html`<div class="divider"></div>
              <vivid-bill-history
                .hass=${this.hass}
                .days=${data.days}
                .tariff=${config.tariff}
                .today=${data.today}
              ></vivid-bill-history>`
          : nothing
      }`;
  }

  protected override cardClass(): string {
    return this._config?.layout === 'line' ? 'line' : '';
  }
}

defineElement(BILL_CARD, VividBillCard);

registerCard({
  type: BILL_CARD,
  name: 'Vivid bill',
  description:
    'The bill in progress: its forecast at the end of the cycle, what is spent, the peak / off-peak / subscription split and the previous cycles.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-bill-card`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-bill-card': VividBillCard;
  }
}
