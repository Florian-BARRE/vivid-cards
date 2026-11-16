import { html, nothing, type CSSResultGroup } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { localize, localeOf } from '../../i18n';
import { SAMPLE_TARIFF } from '../../energy/config';
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
import { periodArrows, VividEnergyCard, type EnergyHead } from '../../energy/vivid-energy-card';
import { energyEditor } from '../../energy/vivid-energy-editor';
import {
  calendarMonth,
  CALENDAR_REFERENCE_DAYS,
  curveDates,
  loadCurve,
  type CalendarCell,
} from '../../energy/views';
import { formatWatts } from '../../energy/hour-chart';
import type { Tariff } from '../../energy/tariff';
import '../../energy/hour-chart';

import { calendarStyles } from './styles';

import { ENERGY_CALENDAR, resolveEnergyCalendar, type ResolvedEnergyCalendar } from './config';

export { ENERGY_CALENDAR, resolveEnergyCalendar };

/** Days with an hourly curve the day view moves through. */
const DAY_VIEW_DAYS = 62;

/** Months back the hourly data is read (the off-peak bar of older days stays empty). */
const HOURLY_MAX_DAYS = 100;

/**
 * A month, one cell per day: the cell's orange grows more intense the more the
 * day cost against a usual day, the price is written big (subscription
 * included) and a bar splits it between off-peak and peak hours. Under the
 * month, the chosen day (today by default): its peak / off-peak split, its
 * hourly curve, its peak and off-peak kWh and its standby. With
 * `show: day`, the day alone, moved day by day (the former load curve card).
 */
export class VividEnergyCalendar extends VividEnergyCard<ResolvedEnergyCalendar> {
  static override properties = {
    ...VividEnergyCard.properties,
    _shown: { state: true },
    _selected: { state: true },
  };

  /** Year and month shown; the current month when unset. */
  declare _shown?: { year: number; month: number };
  declare _selected?: string;

  static getConfigElement(): HTMLElement {
    return energyEditor({
      fields: [
        {
          name: 'show',
          label: 'energy_calendar_show',
          default: 'month',
          options: [
            { value: 'month', label: 'energy_calendar_show_month' },
            { value: 'day', label: 'energy_calendar_show_day' },
          ],
        },
      ],
      validate: (config) => resolveEnergyCalendar(config),
    });
  }

  static getStubConfig(): Record<string, unknown> {
    return { tariff: SAMPLE_TARIFF };
  }

  static override styles: CSSResultGroup = [VividEnergyCard.styles, calendarStyles];

  protected resolveConfig(raw: unknown): ResolvedEnergyCalendar {
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

  protected needs(config: ResolvedEnergyCalendar, today: string): EnergyNeeds {
    if (config.show === 'day') return { days: DAY_VIEW_DAYS, hourlyDays: DAY_VIEW_DAYS };
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

  /** Dates the day view can show: days with a whole hourly curve, before today. */
  private curveDays(data: EnergyData | undefined): string[] {
    return data ? curveDates(data.hourly).filter((date) => date < data.today) : [];
  }

  /** The day shown under the month, or alone: the chosen one, else the last day with data. */
  private dayShown(
    config: ResolvedEnergyCalendar,
    data: EnergyData | undefined,
  ): string | undefined {
    if (config.show === 'day') {
      const dates = this.curveDays(data);
      return this._selected && dates.includes(this._selected) ? this._selected : dates.at(-1);
    }
    if (this._selected) return this._selected;
    // The last day with data of the month shown.
    if (!data) return undefined;
    const first = this.firstOf(this.shown(data.today));
    const month = first.slice(0, 7);
    return data.days.filter((day) => day.date < data.today && day.date.startsWith(month)).at(-1)
      ?.date;
  }

  protected head(config: ResolvedEnergyCalendar, data: EnergyData | undefined): EnergyHead {
    const hass = this.hass;
    if (config.show === 'day') {
      const dates = this.curveDays(data);
      const date = this.dayShown(config, data);
      const index = date ? dates.indexOf(date) : -1;
      return {
        icon: 'mdi:chart-bar',
        title: config.name ?? (date ? formatLongDate(hass, date) : localize(hass, 'energy_curve')),
        sub: localize(hass, 'energy_curve_sub'),
        aside: dates.length
          ? periodArrows({
              previous: localize(hass, 'energy_previous_day'),
              next: localize(hass, 'energy_next_day'),
              canPrevious: index > 0,
              canNext: index >= 0 && index < dates.length - 1,
              move: (step) => {
                const next = dates[index + step];
                if (next) this._selected = next;
              },
            })
          : nothing,
      };
    }
    const today = data?.today ?? this.today();
    const shown = this.shown(today);
    const [year, month] = today.split('-').map(Number) as [number, number];
    const first = data?.days[0]?.date;
    return {
      icon: 'mdi:calendar-month-outline',
      title: config.name ?? formatMonth(hass, shown.year, shown.month),
      sub: localize(hass, 'energy_calendar_sub'),
      aside: periodArrows({
        previous: localize(hass, 'energy_previous_month'),
        next: localize(hass, 'energy_next_month'),
        canPrevious: !(first !== undefined && this.firstOf(shown) <= first),
        canNext: !(shown.year === year && shown.month === month),
        move: (step) => this.move(step),
      }),
    };
  }

  private renderCell(cell: CalendarCell, picked: string | undefined) {
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
    const selected = picked === cell.date;
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
        this._selected = cell.date;
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

  /** The calendar cell of a date: its cost, kWh and off-peak share. */
  private cellOf(date: string, data: EnergyData, tariff: Tariff): CalendarCell | undefined {
    const [year, month] = date.split('-').map(Number) as [number, number];
    return calendarMonth(data.days, tariff, year, month, data.today).cells.find(
      (cell) => cell.date === date,
    );
  }

  private renderDetail(
    cell: CalendarCell | undefined,
    data: EnergyData,
    tariff: Tariff,
    dated = true,
  ) {
    if (!cell || cell.cost === undefined) return nothing;
    const hass = this.hass;
    const curve = loadCurve(data.hourly, tariff, cell.date);
    const share = cell.offPeakShare;
    return html`<div class="detail">
      <div class="top">
        <b>${dated ? formatLongDate(hass, cell.date) : localize(hass, 'energy_cost')}</b
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
      ${
        curve
          ? html`<vivid-hour-chart
                class="hourly"
                standby
                .legend=${false}
                .hass=${hass}
                .curve=${curve}
                .tariff=${tariff}
              ></vivid-hour-chart>
              <div class="tiles">
                <div class="tile">
                  <div class="sub">${localize(hass, 'energy_peak')}</div>
                  <div class="value">${formatKwh(hass, curve.peakKwh)}</div>
                </div>
                <div class="tile">
                  <div class="sub">${localize(hass, 'energy_off_peak')}</div>
                  <div class="value">${formatKwh(hass, curve.offPeakKwh)}</div>
                </div>
                <div class="tile">
                  <div class="sub">${localize(hass, 'energy_standby_tile')}</div>
                  <div class="value">≈ ${formatWatts(hass, curve.standbyWatts)}</div>
                  <div class="sub">
                    ${localize(hass, 'energy_per_year', { v: formatMoney(hass, curve.standbyYear, 0) })}
                  </div>
                </div>
              </div>`
          : html`<div class="sub hourly-waiting">${localize(hass, 'energy_day_waiting')}</div>`
      }
    </div>`;
  }

  protected renderBody(config: ResolvedEnergyCalendar, data: EnergyData) {
    const hass = this.hass;
    if (config.show === 'day') {
      const date = this.dayShown(config, data);
      const cell = date ? this.cellOf(date, data, config.tariff) : undefined;
      return cell
        ? this.renderDetail(cell, data, config.tariff, false)
        : html`<div class="message">${localize(hass, 'energy_curve_waiting')}</div>`;
    }
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
        ${month.cells.map((cell) => this.renderCell(cell, this.dayShown(config, data)))}
      </div>
      ${this.renderDetail(
        month.cells.find((cell) => cell.date === this.dayShown(config, data)),
        data,
        config.tariff,
      )}
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
  name: 'Vivid energy calendar',
  description:
    'A month of electricity, one cell per day with its price and its off-peak share, and the chosen day hour by hour.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-energy-calendar`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-energy-calendar': VividEnergyCalendar;
  }
}
