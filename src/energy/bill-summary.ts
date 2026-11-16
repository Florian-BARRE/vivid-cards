/**
 * The bill in progress, shared by the Bill card and the details of the bill
 * badge: the forecast at the end of the cycle, a bar filling with what is
 * already spent (peak and off-peak, the rest hatched, the previous bill as a
 * mark), three figures, and the planned split between peak hours, off-peak
 * hours and the subscription.
 */
import { LitElement, css, html, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import { tokens } from '../components/shared-styles';
import { localize } from '../i18n';
import { FAST_RATE_DAYS } from './cycle';
import { addDays } from './days';
import { deltaColor, formatDelta, formatKwh, formatMoney, formatShortDate, rgb } from './format';
import { energyStyles } from './styles';
import type { Tariff } from './tariff';
import type { BillView } from './views';

/** Percent with one decimal, for CSS. */
function pct(value: number): string {
  return `${(Math.max(0, Math.min(1, value)) * 100).toFixed(1)}%`;
}

/** Whole percent, for text. */
function percent(share: number): string {
  return `${Math.round(share * 100)} %`;
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

/** Share of the money already spent on energy in peak hours (undefined when not split). */
export function spentPeakShare(view: BillView): number | undefined {
  const sums = view.cycle.totals;
  if (!view.tariff || sums.days === 0 || sums.splitDays !== sums.days) return undefined;
  const peak = sums.peakKwh * view.tariff.peak;
  const offPeak = sums.offPeakKwh * (view.tariff.offPeak ?? view.tariff.peak);
  return peak + offPeak > 0 ? peak / (peak + offPeak) : undefined;
}

export class VividBillSummary extends LitElement {
  static override properties = {
    hass: { attribute: false },
    view: { attribute: false },
    tariff: { attribute: false },
    compact: { type: Boolean, reflect: true },
    parts: { type: Boolean },
  };

  declare hass?: HomeAssistant;
  declare view?: BillView;
  declare tariff?: Tariff;
  declare compact: boolean;
  /** The planned split under the figures (off when a ring shows it instead). */
  declare parts: boolean;

  constructor() {
    super();
    this.compact = false;
    this.parts = true;
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
      .forecast {
        display: flex;
        flex-direction: column;
        gap: 2px;
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
        background: var(--energy-hatch);
      }
      :host([compact]) .track {
        height: 12px;
      }
      .track .done {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        display: flex;
        border-radius: inherit;
        overflow: hidden;
        background: var(--energy-accent);
      }
      .track .done i {
        display: block;
        height: 100%;
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
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 2px 12px;
        font-size: 12px;
        color: var(--vivid-muted);
      }
      .labels b {
        color: var(--primary-text-color);
        font-weight: 600;
      }
      .parts {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .parts h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      .columns {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
        gap: 8px;
        font-size: 13px;
      }
      .columns div {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .columns b {
        font-variant-numeric: tabular-nums;
      }
      .insight {
        font-size: 12.5px;
        line-height: 1.45;
        color: var(--secondary-text-color);
      }
      .rows .row {
        min-height: 24px;
      }
    `,
  ];

  private renderProgress(view: BillView) {
    const hass = this.hass;
    const cycle = view.cycle;
    const previous = view.previous?.projected;
    const scale = Math.max(cycle.high, previous ?? 0, cycle.toDate, 0.01);
    const markAt = previous !== undefined ? previous / scale : undefined;
    const peakShare = spentPeakShare(view);
    return html`<div class="progress" aria-hidden="true">
      <div class="track">
        <span class="done" style=${styleMap({ width: pct(cycle.toDate / scale) })}
          >${
            peakShare !== undefined
              ? html`<i class="peak" style=${styleMap({ width: pct(peakShare) })}></i
                  ><i class="off-peak" style="flex: 1"></i>`
              : nothing
          }</span
        >
        <i class="end" style=${styleMap({ width: pct(1 - cycle.high / scale) })}></i>
        ${markAt !== undefined ? html`<i class="mark" style=${styleMap({ left: pct(markAt) })}></i>` : nothing}
      </div>
      <div class="labels">
        <span
          >${localize(hass, 'energy_spent_label')} <b>${formatMoney(hass, cycle.toDate)}</b></span
        >
        ${
          previous !== undefined
            ? html`<span
                >${localize(hass, 'energy_previous_label')}
                <b>${formatMoney(hass, previous)}</b></span
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
        ? [{ cls: 'peak', value: parts.energy, name: localize(hass, 'energy_consumption') }]
        : [
            { cls: 'peak', value: parts.peak ?? 0, name: localize(hass, 'energy_peak') },
            { cls: 'off-peak', value: parts.offPeak ?? 0, name: localize(hass, 'energy_off_peak') },
          ];
    segments.push({
      cls: 'subscription',
      value: parts.subscription,
      name: localize(hass, 'energy_subscription'),
    });
    const sums = view.cycle.totals;
    const kwhSplit = sums.peakKwh + sums.offPeakKwh;
    const insight =
      parts.offPeak !== undefined && kwhSplit > 0
        ? localize(hass, 'energy_off_peak_note', {
            k: percent(sums.offPeakKwh / kwhSplit),
            e: percent(parts.offPeak / total),
          })
        : parts.energy !== undefined && this.tariff?.offPeakRanges.length
          ? localize(hass, 'energy_split_pending')
          : undefined;
    return html`<div class="parts">
      <h3>${localize(hass, 'energy_planned_split')}</h3>
      <div class="split" aria-hidden="true">
        ${segments.map((segment) => html`<i class=${segment.cls} style=${styleMap({ width: pct(segment.value / total) })}></i>`)}
      </div>
      <div class="columns">
        ${segments.map(
          (segment) =>
            html`<div>
              <span><i class="dot ${segment.cls}"></i>${segment.name}</span>
              <span
                ><b>${formatMoney(hass, segment.value)}</b>
                <span class="sub">· ${percent(segment.value / total)}</span></span
              >
            </div>`,
        )}
      </div>
      ${insight ? html`<div class="insight">${insight}</div>` : nothing}
    </div>`;
  }

  private renderCompact(view: BillView) {
    const hass = this.hass;
    const cycle = view.cycle;
    const range = localize(hass, 'energy_bill_range', {
      from: formatShortDate(hass, cycle.start),
      to: formatShortDate(hass, addDays(cycle.end, -1)),
    });
    return html`<div class="sub">${localize(hass, 'energy_bill')} · ${range}</div>
      <div class="amount">
        <span class="big">${formatMoney(hass, cycle.projected)}</span>
        <span class="sub"
          >${localize(hass, 'energy_estimated', { day: cycle.dayIndex, total: cycle.length })}</span
        >
      </div>
      ${this.renderProgress(view)}
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

  protected override render() {
    const view = this.view;
    if (!view) return nothing;
    if (this.compact) return this.renderCompact(view);
    const hass = this.hass;
    const cycle = view.cycle;
    return html`<div class="forecast">
        <span class="sub">${localize(hass, 'energy_forecast')}</span>
        <div class="amount">
          <span class="big">${formatMoney(hass, cycle.projected)}</span>
          <span class="sub">${localize(hass, 'energy_forecast_pace', { n: FAST_RATE_DAYS })}</span>
        </div>
      </div>
      ${this.renderProgress(view)}
      <div class="tiles">
        <div class="tile">
          <div class="sub">${localize(hass, 'energy_pace_days', { n: FAST_RATE_DAYS })}</div>
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
      ${this.parts ? this.renderParts(view) : nothing}`;
  }
}

defineElement('vivid-bill-summary', VividBillSummary);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-bill-summary': VividBillSummary;
  }
}
