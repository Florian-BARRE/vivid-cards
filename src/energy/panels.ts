/**
 * Panels shared by the energy cards and the details of the energy badges:
 * the day's tariff timeline and the last days (the bill summary is in
 * bill-summary.ts, loaded with them).
 */
import { LitElement, css, html, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import { tokens } from '../components/shared-styles';
import { localize, localeOf } from '../i18n';
import {
  costColor,
  formatDelta,
  formatKwh,
  formatLongDate,
  formatMoney,
  rgb,
  BAD_RGB,
  PEAK_RGB,
} from './format';
import './bill-summary';
import { energyStyles } from './styles';
import { formatRange, periodAt, type Tariff } from './tariff';
import type { RecentView } from './views';

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
    'vivid-tariff-timeline': VividTariffTimeline;
    'vivid-recent-days': VividRecentDays;
  }
}
