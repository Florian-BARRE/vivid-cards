import { css, html, nothing, type CSSResultGroup } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { localize } from '../../i18n';
import { SAMPLE_TARIFF } from '../../energy/config';
import type { EnergyData } from '../../energy/data';
import { formatKwh, formatMoney } from '../../energy/format';
import { periodChips } from '../../energy/vivid-energy-card';
import { energyEditor } from '../../energy/vivid-energy-editor';
import { ENERGY_PERIODS, type DeviceRow } from '../../energy/views';
import {
  PERIOD_NAMES,
  VividEnergyFlow,
  resolvePeriodCard,
  type ResolvedPeriodCard,
} from '../energy-flow/vivid-energy-flow';
import type { EnergyHead } from '../../energy/vivid-energy-card';

export const ENERGY_RANKING = 'vivid-energy-ranking';

/** Periods the ranking offers: a day is too short for most devices. */
const RANKING_PERIODS = ENERGY_PERIODS;

/**
 * The devices of the Energy dashboard ranked by energy, priced at the
 * period's average price, with what no device measures and the share that is
 * identified.
 */
export class VividEnergyRanking extends VividEnergyFlow {
  static override getConfigElement(): HTMLElement {
    return energyEditor({
      fields: [
        {
          name: 'period',
          label: 'energy_period',
          default: 'month',
          options: ENERGY_PERIODS.map((period) => ({
            value: period,
            label: `energy_period_${period}` as const,
          })),
        },
        {
          name: 'max_devices',
          label: 'energy_max_devices',
          selector: { number: { min: 1, max: 20, mode: 'box' } },
          default: 6,
        },
      ],
      validate: (config) => resolvePeriodCard(ENERGY_RANKING, config),
    });
  }

  static override getStubConfig(): Record<string, unknown> {
    return { tariff: SAMPLE_TARIFF };
  }

  static override styles: CSSResultGroup = [
    VividEnergyFlow.styles,
    css`
      .list {
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .device {
        display: grid;
        grid-template-columns: 28px minmax(0, 1.6fr) minmax(40px, 1fr) auto auto;
        align-items: center;
        gap: 10px;
        min-height: 34px;
        font-size: 13.5px;
      }
      .device.child {
        grid-template-columns: 28px minmax(0, 1.6fr) minmax(40px, 1fr) auto auto;
        font-size: 12.5px;
        color: var(--secondary-text-color);
        min-height: 28px;
      }
      .device.child .name {
        padding-left: 14px;
      }
      .mini {
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(255, 193, 7, 0.2);
        color: rgb(255, 193, 7);
      }
      .mini ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
      }
      .mini.unknown {
        background: none;
        border: 1px dashed rgba(var(--vivid-rgb-text), 0.3);
        color: var(--vivid-muted);
        box-sizing: border-box;
      }
      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .bar {
        height: 8px;
        border-radius: 4px;
        background: rgba(var(--vivid-rgb-text), 0.06);
        overflow: hidden;
      }
      .bar i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: rgb(255, 193, 7);
      }
      .child .bar i {
        opacity: 0.6;
      }
      .untracked .bar i {
        background: repeating-linear-gradient(
          90deg,
          rgba(var(--vivid-rgb-text), 0.28) 0 6px,
          transparent 6px 10px
        );
      }
      .money {
        min-width: 56px;
        text-align: right;
      }
      .sep {
        height: 1px;
        margin: 6px 0;
        background: rgba(var(--vivid-rgb-text), 0.08);
      }
      @container (max-width: 400px) {
        .device,
        .device.child {
          grid-template-columns: 28px minmax(0, 1fr) auto auto;
        }
        .device .bar {
          display: none;
        }
      }
    `,
  ];

  protected override resolveConfig(raw: unknown): ResolvedPeriodCard {
    return resolvePeriodCard(ENERGY_RANKING, raw);
  }

  protected override head(config: ResolvedPeriodCard, data?: EnergyData): EnergyHead {
    const hass = this.hass;
    const view = data?.days.length ? this.view(config, data) : undefined;
    return {
      icon: 'mdi:power-plug-outline',
      color: [255, 193, 7],
      title: config.name ?? localize(hass, 'energy_devices'),
      sub: view
        ? localize(hass, 'energy_devices_sub', { p: formatMoney(hass, view.price, 3) })
        : undefined,
      aside: periodChips(
        RANKING_PERIODS,
        this.period(config),
        (period) => localize(hass, PERIOD_NAMES[period]),
        (period) => {
          this._period = period;
        },
      ),
    };
  }

  private renderRow(row: DeviceRow, top: number, child = false) {
    const hass = this.hass;
    return html`<div class=${child ? 'device child' : 'device'}>
      <span class="mini" aria-hidden="true"
        >${child ? nothing : html`<ha-icon icon="mdi:flash"></ha-icon>`}</span
      >
      <span class="name" title=${row.name}>${row.name}</span>
      <div class="bar" aria-hidden="true">
        <i style=${styleMap({ width: `${Math.max(1.5, (row.kwh / top) * 100).toFixed(1)}%` })}></i>
      </div>
      <span class="num">${formatKwh(hass, row.kwh)}</span>
      <span class="num money">${formatMoney(hass, row.cost)}</span>
    </div>`;
  }

  protected override renderBody(config: ResolvedPeriodCard, data: EnergyData) {
    const hass = this.hass;
    if (!data.devices.length)
      return html`<div class="message">${localize(hass, 'energy_no_devices')}</div>`;
    const view = this.view(config, data);
    const rows = view.rows.slice(0, config.maxDevices);
    const top = Math.max(...rows.map((row) => row.kwh), 0.001);
    return html`<div class="list">
        ${rows.map(
          (row) =>
            html`${this.renderRow(row, top)}${row.children.map((childRow) => this.renderRow(childRow, top, true))}`,
        )}
        ${
          view.kwh > 0
            ? html`<div class="sep"></div>
                <div class="device untracked">
                  <span class="mini unknown" aria-hidden="true">?</span>
                  <span class="name">${localize(hass, 'energy_untracked')}</span>
                  <div class="bar" aria-hidden="true"><i style="width: 100%"></i></div>
                  <span class="num">${formatKwh(hass, view.untracked, 0)}</span>
                  <span class="num money">${formatMoney(hass, view.untracked * view.price)}</span>
                </div>`
            : nothing
        }
      </div>
      ${
        view.kwh > 0
          ? html`<div class="sub">
              ${localize(hass, 'energy_tracked_share', {
                p: `${new Intl.NumberFormat(hass?.locale?.language ?? hass?.language ?? 'en', { maximumFractionDigits: 1 }).format(view.trackedShare * 100)} %`,
              })}
            </div>`
          : nothing
      }`;
  }
}

defineElement(ENERGY_RANKING, VividEnergyRanking);

registerCard({
  type: ENERGY_RANKING,
  name: 'Vivid Energy Ranking',
  description:
    'The devices of the Energy dashboard ranked by energy and cost, with what is not measured.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-energy-ranking`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-energy-ranking': VividEnergyRanking;
  }
}
