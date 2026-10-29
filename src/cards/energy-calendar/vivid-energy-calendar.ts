import { css, html, nothing, type CSSResultGroup } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { localize, localeOf } from '../../i18n';
import { resolveEnergyBase, SAMPLE_TARIFF, type ResolvedEnergyBase } from '../../energy/config';
import type { EnergyData, EnergyNeeds } from '../../energy/data';
import { addDays, daysBetween } from '../../energy/days';
import {
  COST_GRADIENT,
  costColor,
  formatKwh,
  formatLongDate,
  formatMoney,
  formatMonth,
  rgb,
} from '../../energy/format';
import { VividEnergyCard, type EnergyHead } from '../../energy/vivid-energy-card';
import { energyEditor } from '../../energy/vivid-energy-editor';
import { calendarMonth, CALENDAR_REFERENCE_DAYS, type CalendarCell } from '../../energy/views';

export const ENERGY_CALENDAR = 'vivid-energy-calendar';

export function resolveEnergyCalendar(raw: unknown): ResolvedEnergyBase {
  return resolveEnergyBase(ENERGY_CALENDAR, raw);
}

/** Months back the hourly data is read (the off-peak bar of older days stays empty). */
const HOURLY_MAX_DAYS = 100;

/**
 * A month, one cell per day: the cell's color says how much the day cost
 * against a usual day (cyan → red), the price is written big (subscription
 * included) and a bar splits it between off-peak and peak hours. Touching a
 * day shows its details.
 */
export class VividEnergyCalendar extends VividEnergyCard<ResolvedEnergyBase> {
  static override properties = {
    ...VividEnergyCard.properties,
    _shown: { state: true },
    _selected: { state: true },
  };

  /** Year and month shown; the current month when unset. */
  declare _shown?: { year: number; month: number };
  declare _selected?: string;

  static getConfigElement(): HTMLElement {
    return energyEditor({ fields: [], validate: (config) => resolveEnergyCalendar(config) });
  }

  static getStubConfig(): Record<string, unknown> {
    return { tariff: SAMPLE_TARIFF };
  }

  static override styles: CSSResultGroup = [
    VividEnergyCard.styles,
    css`
      .grid {
        container-type: inline-size;
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: clamp(3px, 1.2cqw, 8px);
      }
      .weekday {
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        color: var(--vivid-muted);
      }
      .cell {
        box-sizing: border-box;
        min-height: clamp(52px, 13cqw, 96px);
        border-radius: clamp(10px, 2.4cqw, 16px);
        padding: clamp(4px, 1.2cqw, 8px) clamp(5px, 1.4cqw, 10px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 4px;
        text-align: left;
        min-width: 0;
      }
      .cell.data {
        color: #ffffff;
        cursor: pointer;
      }
      .cell.data:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .cell.selected {
        box-shadow:
          0 0 0 2px var(--primary-text-color),
          0 0 16px var(--cell-glow) !important;
      }
      .cell.empty {
        border: 1px dashed rgba(var(--vivid-rgb-text), 0.15);
        color: var(--vivid-muted);
      }
      .cell.today {
        border: 2px solid var(--primary-text-color);
      }
      .cell.past {
        background: rgba(var(--vivid-rgb-text), 0.04);
        color: var(--vivid-muted);
      }
      .day {
        display: flex;
        justify-content: space-between;
        gap: 4px;
        font-size: clamp(10px, 2.2cqw, 12px);
        opacity: 0.85;
        white-space: nowrap;
        overflow: hidden;
      }
      .price {
        font-size: clamp(10px, 3.1cqw, 22px);
        font-weight: 800;
        letter-spacing: -0.01em;
        font-variant-numeric: tabular-nums;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: clip;
      }
      .hphc {
        display: flex;
        height: clamp(4px, 1cqw, 7px);
        border-radius: 4px;
        overflow: hidden;
        background: rgba(0, 0, 0, 0.3);
      }
      .hphc i {
        display: block;
      }
      .detail {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 16px;
        background: var(--vivid-layer-2);
      }
      .detail .top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 10px;
      }
      .detail b {
        font-size: 15px;
      }
      .detail .amount {
        font-size: 22px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
      }
      .detail .split {
        height: 12px;
        border-radius: 6px;
      }
      .detail .figures {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
      }
      .total {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 10px;
        padding-top: 8px;
        border-top: 1px solid rgba(var(--vivid-rgb-text), 0.1);
      }
      .total .num {
        font-size: 20px;
        font-weight: 800;
      }
      .scale {
        width: 44px;
        height: 10px;
        border-radius: 3px;
      }
    `,
  ];

  protected resolveConfig(raw: unknown): ResolvedEnergyBase {
    return resolveEnergyCalendar(raw);
  }

  private shown(today: string): { year: number; month: number } {
    if (this._shown) return this._shown;
    const [year, month] = today.split('-').map(Number) as [number, number];
    return { year, month };
  }

  private firstOf(shown: { year: number; month: number }): string {
    return `${shown.year}-${String(shown.month).padStart(2, '0')}-01`;
  }

  protected needs(_config: ResolvedEnergyBase, today: string): EnergyNeeds {
    const first = this.firstOf(this.shown(today));
    const back = daysBetween(addDays(first, -CALENDAR_REFERENCE_DAYS), today) + 1;
    return {
      days: Math.max(back, 62),
      hourlyDays: Math.min(HOURLY_MAX_DAYS, daysBetween(first, today) + 1),
    };
  }

  private move(step: number): void {
    const today = this.today();
    const shown = this.shown(today);
    const index = shown.year * 12 + shown.month - 1 + step;
    const next = { year: Math.floor(index / 12), month: (index % 12) + 1 };
    const [year, month] = today.split('-').map(Number) as [number, number];
    if (next.year * 12 + next.month > year * 12 + month) return;
    this._shown = next;
    this._selected = undefined;
  }

  protected head(_config: ResolvedEnergyBase, data: EnergyData | undefined): EnergyHead {
    const hass = this.hass;
    const today = data?.today ?? this.today();
    const shown = this.shown(today);
    const [year, month] = today.split('-').map(Number) as [number, number];
    const first = data?.days[0]?.date;
    const atStart = first !== undefined && this.firstOf(shown) <= first;
    const atEnd = shown.year === year && shown.month === month;
    return {
      icon: 'mdi:calendar-month-outline',
      color: [38, 198, 218],
      title: formatMonth(hass, shown.year, shown.month),
      sub: localize(hass, 'energy_calendar_sub'),
      aside: html`<button
          type="button"
          class="reset icon-button"
          ?disabled=${atStart}
          aria-label=${localize(hass, 'energy_previous_month')}
          @click=${() => this.move(-1)}
        >
          <ha-icon icon="mdi:chevron-left"></ha-icon></button
        ><button
          type="button"
          class="reset icon-button"
          ?disabled=${atEnd}
          aria-label=${localize(hass, 'energy_next_month')}
          @click=${() => this.move(1)}
        >
          <ha-icon icon="mdi:chevron-right"></ha-icon>
        </button>`,
    };
  }

  private renderCell(cell: CalendarCell) {
    const hass = this.hass;
    if (cell.cost === undefined) {
      return html`<div
        class=${classMap({ cell: true, empty: cell.future || cell.today, today: cell.today, past: !cell.future && !cell.today })}
      >
        <span class="day" title=${cell.today ? localize(hass, 'energy_day_today') : ''}
          ><span>${cell.day}</span></span
        >
      </div>`;
    }
    const color = costColor(cell.ratio ?? 1);
    const selected = this._selected === cell.date;
    const label = `${formatLongDate(hass, cell.date)} · ${formatMoney(hass, cell.cost)}`;
    return html`<button
      type="button"
      class=${classMap({ reset: true, cell: true, data: true, selected })}
      style=${styleMap({
        background: rgb(color),
        boxShadow: `0 0 calc(18px * var(--vivid-glow, 1)) ${rgb(color, 0.35)}`,
        '--cell-glow': rgb(color, 0.6),
      })}
      aria-pressed=${String(selected)}
      aria-label=${label}
      title=${label}
      @click=${() => {
        this._selected = selected ? undefined : cell.date;
      }}
    >
      <span class="day"><span>${cell.day}</span></span>
      <span class="price">${formatMoney(hass, cell.cost)}</span>
      ${
        cell.offPeakShare !== undefined
          ? html`<span class="hphc" aria-hidden="true"
              ><i
                class="off-peak"
                style=${styleMap({ width: `${(cell.offPeakShare * 100).toFixed(0)}%` })}
              ></i
              ><i class="peak" style="flex: 1"></i
            ></span>`
          : nothing
      }
    </button>`;
  }

  private renderDetail(cell: CalendarCell | undefined) {
    if (!cell || cell.cost === undefined) return nothing;
    const hass = this.hass;
    const share = cell.offPeakShare;
    return html`<div class="detail">
      <div class="top">
        <b>${formatLongDate(hass, cell.date)}</b
        ><span class="amount">${formatMoney(hass, cell.cost)}</span>
      </div>
      ${
        share !== undefined
          ? html`<div class="split" aria-hidden="true">
                <i class="off-peak" style=${styleMap({ width: `${(share * 100).toFixed(1)}%` })}></i
                ><i class="peak" style="flex: 1"></i>
              </div>
              <div class="figures">
                <span style="color: var(--energy-off-peak); font-weight: 700"
                  >${localize(hass, 'energy_off_peak_short')} ${Math.round(share * 100)} %</span
                >
                <span class="sub">${formatKwh(hass, cell.kwh ?? 0)}</span>
                <span style="color: var(--energy-peak); font-weight: 700"
                  >${localize(hass, 'energy_peak_short')} ${Math.round((1 - share) * 100)} %</span
                >
              </div>`
          : html`<div class="figures">
              <span class="sub">${formatKwh(hass, cell.kwh ?? 0)}</span>
            </div>`
      }
    </div>`;
  }

  protected renderBody(config: ResolvedEnergyBase, data: EnergyData) {
    const hass = this.hass;
    const shown = this.shown(data.today);
    const month = calendarMonth(data.days, config.tariff, shown.year, shown.month, data.today);
    const weekdays = Array.from({ length: 7 }, (_, index) => {
      try {
        return new Intl.DateTimeFormat(localeOf(hass), {
          weekday: 'short',
        }).format(new Date(2024, 0, 1 + index, 12));
      } catch {
        return '';
      }
    });
    const hasSplit = month.cells.some((cell) => cell.offPeakShare !== undefined);
    return html`<div class="grid">
        ${weekdays.map((name) => html`<div class="weekday">${name}</div>`)}
        ${Array.from({ length: month.lead }, () => html`<div></div>`)}
        ${month.cells.map((cell) => this.renderCell(cell))}
      </div>
      ${this.renderDetail(month.cells.find((cell) => cell.date === this._selected))}
      <div class="legend">
        <span
          ><i class="dot scale" style="background: ${COST_GRADIENT}"></i
          >${localize(hass, 'energy_scale')}</span
        >
        ${
          hasSplit
            ? html`<span><i class="dot off-peak"></i>${localize(hass, 'energy_off_peak')}</span>
                <span><i class="dot peak"></i>${localize(hass, 'energy_peak')}</span>`
            : nothing
        }
      </div>
      <div class="total">
        <span class="sub"
          >${localize(hass, 'energy_month_total')} · ${formatKwh(hass, month.kwh, 0)}</span
        >
        <span class="num">${formatMoney(hass, month.total)}</span>
      </div>`;
  }
}

defineElement(ENERGY_CALENDAR, VividEnergyCalendar);

registerCard({
  type: ENERGY_CALENDAR,
  name: 'Vivid Energy Calendar',
  description:
    'A month of electricity, one colored cell per day with its price and its off-peak share.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-energy-calendar`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-energy-calendar': VividEnergyCalendar;
  }
}
