/**
 * Panels shared by the energy cards and the details of the energy badges:
 * the bill summary, the day's tariff timeline and the last days.
 */
import { LitElement, css, html, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import { tokens } from '../components/shared-styles';
import { localize, localeOf } from '../i18n';
import { addDays } from './days';
import {
  costColor,
  deltaColor,
  formatDelta,
  formatKwh,
  formatLongDate,
  formatMoney,
  formatShortDate,
  rgb,
  BAD_RGB,
  PEAK_RGB,
} from './format';
import { energyStyles } from './styles';
import { formatRange, periodAt, type Tariff } from './tariff';
import type { BillView, RecentView } from './views';

/** Percent with one decimal, for CSS. */
function pct(value: number): string {
  return `${(Math.max(0, Math.min(1, value)) * 100).toFixed(1)}%`;
}

/** The parts of the projected bill: energy (peak / off-peak when known) and subscription. */
export function billParts(view: BillView): {
  peak?: number;
  offPeak?: number;
  energy?: number;
  subscription: number;
} {
  const cycle = view.cycle;
  const subscription = cycle.subscription;
  const energy = Math.max(0, cycle.projected - subscription);
  const sums = cycle.totals;
  if (view.tariff && sums.days > 0 && sums.splitDays === sums.days && sums.energyCost > 0) {
    // The money of the days read so far, split by price, extended to the projection.
    const peakMoney = sums.peakKwh * view.tariff.peak;
    const offPeakMoney = sums.offPeakKwh * (view.tariff.offPeak ?? view.tariff.peak);
    const peakShare = peakMoney + offPeakMoney > 0 ? peakMoney / (peakMoney + offPeakMoney) : 1;
    return { peak: energy * peakShare, offPeak: energy * (1 - peakShare), subscription };
  }
  return { energy, subscription };
}

/**
 * The bill in progress: the estimated amount, a bar filling with what is
 * already spent (the rest hatched) and the previous bill as a mark.
 */
export class VividBillSummary extends LitElement {
  static override properties = {
    hass: { attribute: false },
    view: { attribute: false },
    tariff: { attribute: false },
    compact: { type: Boolean },
  };

  declare hass?: HomeAssistant;
  declare view?: BillView;
  declare tariff?: Tariff;
  declare compact: boolean;

  constructor() {
    super();
    this.compact = false;
  }

  static override styles = [
    tokens,
    energyStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .amount {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 4px 10px;
      }
      .big {
        font-size: 44px;
        font-weight: 800;
        letter-spacing: -0.02em;
        font-variant-numeric: tabular-nums;
        line-height: 1.05;
      }
      :host([compact]) .big {
        font-size: 30px;
      }
      .progress {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .track {
        position: relative;
        height: 14px;
        border-radius: 7px;
        background: repeating-linear-gradient(
          135deg,
          rgba(255, 112, 67, 0.32) 0 6px,
          rgba(255, 112, 67, 0.12) 6px 12px
        );
      }
      :host([compact]) .track {
        height: 12px;
      }
      .track .done {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        border-radius: inherit;
        background: linear-gradient(90deg, rgb(255, 193, 7), rgb(255, 112, 67));
      }
      .track .end {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        border-radius: 0 7px 7px 0;
        background: var(--vivid-layer-2);
      }
      .track .mark {
        position: absolute;
        top: -5px;
        bottom: -5px;
        width: 2px;
        margin-left: -1px;
        border-radius: 1px;
        background: var(--primary-text-color);
      }
      .labels {
        position: relative;
        height: 16px;
        font-size: 11.5px;
        color: var(--vivid-muted);
      }
      .labels span {
        position: absolute;
        white-space: nowrap;
      }
      .parts {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .rows .row {
        min-height: 24px;
      }
    `,
  ];

  private renderProgress(view: BillView) {
    const cycle = view.cycle;
    const previous = view.previous?.projected;
    const scale = Math.max(cycle.high, previous ?? 0, cycle.toDate, 0.01);
    const markAt = previous !== undefined ? previous / scale : undefined;
    // Keep the label of the mark inside the card.
    const labelAt = markAt === undefined ? 0 : Math.min(0.85, Math.max(0.35, markAt));
    return html`<div class="progress" aria-hidden="true">
      <div class="track">
        <i class="done" style=${styleMap({ width: pct(cycle.toDate / scale) })}></i>
        <i class="end" style=${styleMap({ width: pct(1 - cycle.high / scale) })}></i>
        ${markAt !== undefined ? html`<i class="mark" style=${styleMap({ left: pct(markAt) })}></i>` : nothing}
      </div>
      <div class="labels">
        <span style="left: 0"
          >${localize(this.hass, 'energy_spent', { v: formatMoney(this.hass, cycle.toDate) })}</span
        >
        ${
          previous !== undefined
            ? html`<span style=${styleMap({ left: pct(labelAt), transform: 'translateX(-50%)' })}
                >${localize(this.hass, 'energy_previous', { v: formatMoney(this.hass, previous) })}</span
              >`
            : nothing
        }
      </div>
    </div>`;
  }

  private renderParts(view: BillView) {
    const parts = billParts(view);
    const total = Math.max(view.cycle.projected, 0.01);
    const hass = this.hass;
    const segments =
      parts.energy !== undefined
        ? [
            {
              cls: 'peak',
              value: parts.energy,
              label: localize(hass, 'energy_part_energy', { v: formatMoney(hass, parts.energy) }),
            },
          ]
        : [
            {
              cls: 'peak',
              value: parts.peak ?? 0,
              label: `${localize(hass, 'energy_peak_short')} ${formatMoney(hass, parts.peak ?? 0)}`,
            },
            {
              cls: 'off-peak',
              value: parts.offPeak ?? 0,
              label: `${localize(hass, 'energy_off_peak_short')} ${formatMoney(hass, parts.offPeak ?? 0)}`,
            },
          ];
    segments.push({
      cls: 'subscription',
      value: parts.subscription,
      label: localize(hass, 'energy_part_subscription', {
        v: formatMoney(hass, parts.subscription),
      }),
    });
    return html`<div class="parts">
      <div class="split" aria-hidden="true">
        ${segments.map((segment) => html`<i class=${segment.cls} style=${styleMap({ width: pct(segment.value / total) })}></i>`)}
      </div>
      <div class="legend">
        ${segments.map((segment) => html`<span><i class="dot ${segment.cls}"></i>${segment.label}</span>`)}
        ${parts.energy !== undefined && this.tariff?.offPeakRanges.length ? html`<span>${localize(hass, 'energy_split_pending')}</span>` : nothing}
      </div>
    </div>`;
  }

  protected override render() {
    const view = this.view;
    if (!view) return nothing;
    const hass = this.hass;
    const cycle = view.cycle;
    const range = localize(hass, 'energy_bill_range', {
      from: formatShortDate(hass, cycle.start),
      to: formatShortDate(hass, addDays(cycle.end, -1)),
    });
    const amount = html`<div class="amount">
      <span class="big">${formatMoney(hass, cycle.projected)}</span>
      <span class="sub"
        >${localize(hass, 'energy_estimated', { day: cycle.dayIndex, total: cycle.length })}</span
      >
    </div>`;
    if (this.compact) {
      return html`<div class="sub">${localize(hass, 'energy_bill')} · ${range}</div>
        ${amount} ${this.renderProgress(view)}
        <div class="rows">
          <div class="row">
            <span class="grow">${localize(hass, 'energy_pace')}</span
            ><span class="num"
              >${localize(hass, 'energy_per_day', { v: formatMoney(hass, view.dailyCost) })}</span
            >
          </div>
          ${
            view.delta !== undefined && view.previous
              ? html`<div class="row">
                  <span class="grow"
                    >${localize(hass, 'energy_previous_bill', {
                      v: formatMoney(hass, view.previous.projected),
                    })}</span
                  ><span
                    class="num"
                    style=${styleMap({ color: rgb(deltaColor(view.delta)), fontWeight: '700' })}
                    >${formatDelta(hass, view.delta)}</span
                  >
                </div>`
              : nothing
          }
          <div class="row">
            <span class="grow">${localize(hass, 'energy_subscription')}</span
            ><span class="num">${formatMoney(hass, cycle.subscription)}</span>
          </div>
        </div>`;
    }
    return html`${amount} ${this.renderProgress(view)}
      <div class="tiles">
        <div class="tile">
          <div class="sub">${localize(hass, 'energy_pace')}</div>
          <div class="value">
            ${localize(hass, 'energy_per_day', { v: formatMoney(hass, view.dailyCost) })}
          </div>
        </div>
        <div class="tile">
          <div class="sub">
            ${view.lastDay ? formatShortDate(hass, view.lastDay.date) : localize(hass, 'energy_last_day')}
          </div>
          <div class="value">${view.lastDay ? formatMoney(hass, view.lastDay.cost) : '—'}</div>
        </div>
        <div class="tile">
          <div class="sub">${localize(hass, 'energy_cycle_kwh')}</div>
          <div class="value">${formatKwh(hass, cycle.totals.kwh, 0)}</div>
        </div>
      </div>
      ${this.renderParts(view)}`;
  }
}

defineElement('vivid-bill-summary', VividBillSummary);

const DAY_MS = 86_400_000;

/**
 * The day's tariff: off-peak ranges on a 24-hour bar with the current time,
 * the prices and the next off-peak hours.
 */
export class VividTariffTimeline extends LitElement {
  static override properties = {
    hass: { attribute: false },
    tariff: { attribute: false },
    now: { attribute: false },
  };

  declare hass?: HomeAssistant;
  declare tariff?: Tariff;
  declare now?: number;

  static override styles = [
    tokens,
    energyStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .bar {
        position: relative;
        height: 16px;
        border-radius: 8px;
        overflow: hidden;
        background: rgba(255, 193, 7, 0.55);
      }
      .bar i {
        position: absolute;
        top: 0;
        bottom: 0;
        background: var(--energy-off-peak);
      }
      .now {
        position: relative;
        height: 0;
      }
      .now i {
        position: absolute;
        top: -24px;
        width: 2px;
        height: 20px;
        margin-left: -1px;
        border-radius: 1px;
        background: var(--primary-text-color);
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
      }
      .hours {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: var(--vivid-muted);
      }
      .dot {
        border-radius: 50%;
      }
    `,
  ];

  protected override render() {
    const tariff = this.tariff;
    if (!tariff) return nothing;
    const hass = this.hass;
    const now = this.now ?? Date.now();
    const date = new Date(now);
    const minute = date.getHours() * 60 + date.getMinutes();
    const segments = tariff.offPeakRanges.flatMap((range) =>
      range.from < range.to
        ? [{ from: range.from, to: range.to }]
        : [
            { from: range.from, to: 1440 },
            { from: 0, to: range.to },
          ],
    );
    const period = periodAt(tariff.offPeakRanges, now);
    let next: string | undefined;
    if (period) {
      // The next off-peak period: the current one when in it, else the one starting at its end.
      const nextPeriod = period.offPeak
        ? periodAt(tariff.offPeakRanges, period.end + 60_000)
        : undefined;
      const start = period.offPeak ? nextPeriod?.end : period.end;
      const offPeak =
        start !== undefined ? periodAt(tariff.offPeakRanges, start + 60_000) : undefined;
      if (offPeak && offPeak.end - offPeak.start < DAY_MS) {
        next = formatRange({ from: minutesOf(offPeak.start), to: minutesOf(offPeak.end) });
      }
    }
    return html`<div class="sub">${formatLongDate(hass, keyOf(now))}</div>
      ${
        tariff.offPeakRanges.length
          ? html`<div class="bar" aria-hidden="true">
                ${segments.map(
                  (segment) =>
                    html`<i
                      style=${styleMap({ left: `${(segment.from / 14.4).toFixed(2)}%`, width: `${((segment.to - segment.from) / 14.4).toFixed(2)}%` })}
                    ></i>`,
                )}
              </div>
              <div class="now" aria-hidden="true">
                <i style=${styleMap({ left: `${(minute / 14.4).toFixed(2)}%` })}></i>
              </div>
              <div class="hours">
                <span>0 h</span><span>6 h</span><span>12 h</span><span>18 h</span><span>24 h</span>
              </div>`
          : nothing
      }
      ${
        tariff.offPeak !== undefined
          ? html`<div class="row">
                <i class="dot off-peak"></i
                ><span class="grow">${localize(hass, 'energy_off_peak')}</span
                ><span class="num">${formatMoney(hass, tariff.offPeak, 4)}</span>
              </div>
              <div class="row">
                <i class="dot peak"></i><span class="grow">${localize(hass, 'energy_peak')}</span
                ><span class="num">${formatMoney(hass, tariff.peak, 4)}</span>
              </div>`
          : html`<div class="row">
              <i class="dot peak"></i
              ><span class="grow">${localize(hass, 'energy_single_price')}</span
              ><span class="num">${formatMoney(hass, tariff.peak, 4)}</span>
            </div>`
      }
      ${next ? html`<div class="sub">${localize(hass, 'energy_next_off_peak', { range: next })}</div>` : nothing}`;
  }
}

function minutesOf(time: number): number {
  const date = new Date(time);
  return date.getHours() * 60 + date.getMinutes();
}

function keyOf(time: number): string {
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

defineElement('vivid-tariff-timeline', VividTariffTimeline);

/** The last days as bars colored against their mean, with the mean as a dashed line. */
export class VividRecentDays extends LitElement {
  static override properties = {
    hass: { attribute: false },
    view: { attribute: false },
  };

  declare hass?: HomeAssistant;
  declare view?: RecentView;

  static override styles = [
    tokens,
    energyStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .bars {
        position: relative;
        display: flex;
        gap: 4px;
      }
      .day {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .slot {
        height: 64px;
        display: flex;
        align-items: flex-end;
      }
      .slot i {
        display: block;
        width: 18px;
        border-radius: 5px;
      }
      .day span {
        font-size: 10.5px;
        color: var(--vivid-muted);
      }
      .mean {
        position: absolute;
        left: 0;
        right: 0;
        border-top: 1px dashed rgba(var(--vivid-rgb-text), 0.5);
      }
    `,
  ];

  protected override render() {
    const view = this.view;
    const hass = this.hass;
    if (!view?.days.length)
      return html`<div class="message">${localize(hass, 'energy_no_data')}</div>`;
    const top = Math.max(...view.days.map((day) => day.kwh), 0.01);
    const last = view.last;
    const weekday = (key: string) => {
      const [year, month, day] = key.split('-').map(Number) as [number, number, number];
      try {
        return new Intl.DateTimeFormat(localeOf(hass), {
          weekday: 'short',
        }).format(new Date(year, month - 1, day, 12));
      } catch {
        return key.slice(8);
      }
    };
    return html`<div class="sub">
        ${localize(hass, 'energy_last_days', { n: view.days.length, v: formatKwh(hass, view.meanKwh) })}
      </div>
      <div class="bars" aria-hidden="true">
        ${view.days.map(
          (day) =>
            html`<div class="day">
              <div class="slot">
                <i
                  style=${styleMap({ height: `${Math.max(3, (day.kwh / top) * 64).toFixed(0)}px`, background: rgb(costColor(day.ratio)) })}
                ></i>
              </div>
              <span>${weekday(day.date)}</span>
            </div>`,
        )}
        <i
          class="mean"
          style=${styleMap({ top: `${(64 - (view.meanKwh / top) * 64).toFixed(0)}px` })}
        ></i>
      </div>
      ${
        last
          ? html`<div class="row">
                <span class="grow">${formatLongDate(hass, last.date)}</span
                ><span class="num">${formatKwh(hass, last.kwh)}</span
                ><span class="num">${formatMoney(hass, last.cost)}</span>
              </div>
              <div class="row">
                <span class="grow">${localize(hass, 'energy_vs_mean')}</span
                ><span
                  class="num"
                  style=${styleMap({ color: rgb(last.ratio > 1.1 ? BAD_RGB : last.ratio < 0.9 ? [102, 187, 106] : PEAK_RGB), fontWeight: '700' })}
                  >${formatDelta(hass, last.ratio - 1)}</span
                >
              </div>`
          : nothing
      }`;
  }
}

defineElement('vivid-recent-days', VividRecentDays);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-bill-summary': VividBillSummary;
    'vivid-tariff-timeline': VividTariffTimeline;
    'vivid-recent-days': VividRecentDays;
  }
}
