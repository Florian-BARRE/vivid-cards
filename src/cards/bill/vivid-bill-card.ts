import { css, html, nothing, type CSSResultGroup } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { GLOW_SLIDER } from '../../core/glow';
import type { Rgb } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { localize } from '../../i18n';
import { SAMPLE_TARIFF } from '../../energy/config';
import type { EnergyData, EnergyNeeds } from '../../energy/data';
import { addDays } from '../../energy/days';
import { deltaColor, formatDelta, formatMoney, formatShortDate, rgb } from '../../energy/format';
import '../../energy/panels';
import { VividEnergyCard, type EnergyHead } from '../../energy/vivid-energy-card';
import { energyEditor } from '../../energy/vivid-energy-editor';
import { billView, type BillView } from '../../energy/views';
import { BILL_CARD, resolveBillCard, type ResolvedBillCard } from './config';

export const BILL_RGB: Rgb = [255, 112, 67];
export const BILL_ICON = 'mdi:receipt-text-outline';

/** Days read: the cycle, the one before, and the 30 days of the slower pace. */
export const BILL_NEEDS: EnergyNeeds = { days: 80, hourlyDays: 32 };

/**
 * The bill in progress: its estimated amount at the end of the cycle, what is
 * already spent, the previous bill, the pace and its parts. As a card, or as
 * one line that unfolds.
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
            { value: 'line', label: 'energy_layout_line' },
          ],
        },
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
    css`
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
        background: linear-gradient(90deg, rgb(255, 193, 7), rgb(255, 112, 67));
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

  protected needs(): EnergyNeeds {
    return BILL_NEEDS;
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
    if (!view) return { icon: BILL_ICON, color: BILL_RGB, title };
    const cycle = view.cycle;
    const hass = this.hass;
    if (config.layout === 'line') {
      const parts = [
        `J${cycle.dayIndex}/${cycle.length}`,
        view.delta !== undefined ? formatDelta(hass, view.delta) : undefined,
        localize(hass, 'energy_per_day', { v: formatMoney(hass, view.dailyCost) }),
      ].filter(Boolean);
      return {
        icon: BILL_ICON,
        color: BILL_RGB,
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
      color: BILL_RGB,
      title,
      sub: localize(hass, 'energy_bill_range', {
        from: formatShortDate(hass, cycle.start),
        to: formatShortDate(hass, addDays(cycle.end, -1)),
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

  protected renderBody(config: ResolvedBillCard, data: EnergyData) {
    if (config.layout === 'line' && !this._open) return nothing;
    return html`<vivid-bill-summary
      .hass=${this.hass}
      .view=${this.view(config, data)}
      .tariff=${config.tariff}
    ></vivid-bill-summary>`;
  }

  protected override cardClass(): string {
    return this._config?.layout === 'line' ? 'line' : '';
  }
}

defineElement(BILL_CARD, VividBillCard);

registerCard({
  type: BILL_CARD,
  name: 'Vivid Bill',
  description:
    'The bill in progress: estimated amount, what is spent, the previous bill and the pace.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-bill-card`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-bill-card': VividBillCard;
  }
}
