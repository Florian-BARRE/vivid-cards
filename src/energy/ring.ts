/**
 * The rings of a bill, shared by the Bill card (its ring layout) and the
 * bill ring card: where each euro goes (peak, off-peak, subscription, the kWh
 * inside), or the share of kWh and money in off-peak hours.
 */
import { css, html, nothing, svg } from 'lit';
import type { HomeAssistant, Rgb } from '../core/hass-types';
import { localize, type StringKey } from '../i18n';
import type { EnergyData } from './data';
import { formatKwh, formatMoney, rgb, OFF_PEAK_RGB, PEAK_RGB, SUBSCRIPTION_RGB } from './format';
import { offPeakShareOfDay, type Tariff } from './tariff';
import { billRing, offPeakRing, type RingPart } from './views';

/** The last closed bill, or the one in progress. */
export type RingCycle = 'last' | 'current';
export const RING_CYCLES: RingCycle[] = ['last', 'current'];

const SIZE = 240;
const CENTER = SIZE / 2;
const GAP_PX = 3;

export const PART_COLORS: Record<RingPart['key'], Rgb> = {
  peak: PEAK_RGB,
  off_peak: OFF_PEAK_RGB,
  energy: [255, 138, 61],
  subscription: SUBSCRIPTION_RGB,
};

const PART_NAMES: Record<RingPart['key'], StringKey> = {
  peak: 'energy_peak',
  off_peak: 'energy_off_peak',
  energy: 'energy_consumption',
  subscription: 'energy_subscription',
};

/** Arcs of a ring, starting at the top, with a small gap between them. */
function arcs(
  radius: number,
  width: number,
  parts: { value: number; color: Rgb; opacity?: number }[],
) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  const length = 2 * Math.PI * radius;
  let start = 0;
  const shown = parts.filter((part) => part.value > 0);
  return [
    svg`<circle cx=${CENTER} cy=${CENTER} r=${radius} fill="none" stroke="currentColor" stroke-opacity="0.1" stroke-width=${width}></circle>`,
    ...shown.map((part) => {
      const share = total > 0 ? part.value / total : 0;
      const dash = Math.max(0, share * length - (shown.length > 1 ? GAP_PX : 0));
      const arc = svg`<circle
        cx=${CENTER}
        cy=${CENTER}
        r=${radius}
        fill="none"
        stroke=${rgb(part.color)}
        stroke-opacity=${part.opacity ?? 1}
        stroke-width=${width}
        stroke-dasharray=${`${dash.toFixed(1)} ${length.toFixed(1)}`}
        transform=${`rotate(${(-90 + start * 360).toFixed(2)} ${CENTER} ${CENTER})`}
      ></circle>`;
      start += share;
      return arc;
    }),
  ];
}

/** A white mark across a ring at a share of the turn. */
function mark(radius: number, width: number, share: number) {
  const angle = share * 2 * Math.PI - Math.PI / 2;
  const inner = radius - width / 2 - 4;
  const outer = radius + width / 2 + 4;
  return svg`<line
    x1=${(CENTER + inner * Math.cos(angle)).toFixed(1)}
    y1=${(CENTER + inner * Math.sin(angle)).toFixed(1)}
    x2=${(CENTER + outer * Math.cos(angle)).toFixed(1)}
    y2=${(CENTER + outer * Math.sin(angle)).toFixed(1)}
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
  ></line>`;
}

function percent(share: number): string {
  return `${Math.round(share * 100)} %`;
}

/** The parts of a bill to come, each with its amount (peak, off-peak or energy, subscription). */
export interface PlannedPart {
  key: RingPart['key'];
  value: number;
}

/**
 * The bill to come as a ring: each part of the forecast in its color, the
 * forecast in the middle, and inside the kWh read so far split peak /
 * off-peak (when known).
 */
export function plannedRing(
  hass: HomeAssistant | undefined,
  parts: readonly PlannedPart[],
  forecast: number,
  kwh: { peak?: number; offPeak?: number; total: number },
  note?: string,
) {
  const shown = parts.map((part) => ({ ...part, color: PART_COLORS[part.key] }));
  const inner =
    kwh.peak !== undefined && kwh.offPeak !== undefined
      ? arcs(SIZE / 2 - 56, 10, [
          { value: kwh.peak, color: PEAK_RGB, opacity: 0.75 },
          { value: kwh.offPeak, color: OFF_PEAK_RGB, opacity: 0.75 },
        ])
      : nothing;
  return html`<div class="layout">
    <svg
      viewBox="0 0 ${SIZE} ${SIZE}"
      role="img"
      aria-label=${localize(hass, 'energy_planned_split')}
    >
      ${arcs(SIZE / 2 - 22, 26, shown)} ${inner}
      <text class="center-big" x=${CENTER} y=${CENTER + 4} text-anchor="middle">
        ${formatMoney(hass, forecast, 0)}
      </text>
      <text class="center-small" x=${CENTER} y=${CENTER + 24} text-anchor="middle">
        ${localize(hass, 'energy_kwh_so_far', { v: formatKwh(hass, kwh.total, 0) })}
      </text>
    </svg>
    <div class="side">
      ${shown.map(
        (part) =>
          html`<div class="row">
            <i class="dot" style="background: ${rgb(part.color)}"></i
            ><span class="grow">${localize(hass, PART_NAMES[part.key])}</span
            ><span class="num">${formatMoney(hass, part.value)}</span
            ><span class="num share">${percent(forecast > 0 ? part.value / forecast : 0)}</span>
          </div>`,
      )}
      ${note ? html`<div class="note">${note}</div>` : nothing}
    </div>
  </div>`;
}

export function moneyRing(
  hass: HomeAssistant | undefined,
  data: EnergyData,
  tariff: Tariff,
  cycle: RingCycle,
) {
  const view = billRing(data.days, tariff, data.today, cycle);
  if (!view) return html`<div class="message">${localize(hass, 'energy_no_data')}</div>`;
  const parts = view.money.map((part) => ({ ...part, color: PART_COLORS[part.key] }));
  const inner =
    view.peakKwh !== undefined && view.offPeakKwh !== undefined
      ? arcs(SIZE / 2 - 56, 10, [
          { value: view.peakKwh, color: PEAK_RGB, opacity: 0.75 },
          { value: view.offPeakKwh, color: OFF_PEAK_RGB, opacity: 0.75 },
        ])
      : nothing;
  const kwh = view.kwh;
  const offPeakMoney = view.money.find((part) => part.key === 'off_peak')?.value;
  const note =
    offPeakMoney !== undefined &&
    view.peakKwh !== undefined &&
    view.offPeakKwh !== undefined &&
    view.total > 0
      ? localize(hass, 'energy_off_peak_note', {
          k: percent(view.offPeakKwh / Math.max(view.peakKwh + view.offPeakKwh, 0.001)),
          e: percent(offPeakMoney / view.total),
        })
      : undefined;
  return html`<div class="layout">
    <svg
      viewBox="0 0 ${SIZE} ${SIZE}"
      role="img"
      aria-label=${localize(hass, 'energy_where_title')}
    >
      ${arcs(SIZE / 2 - 22, 26, parts)} ${inner}
      <text class="center-big" x=${CENTER} y=${CENTER + 4} text-anchor="middle">
        ${formatMoney(hass, view.total, 0)}
      </text>
      ${kwh !== undefined ? svg`<text class="center-small" x=${CENTER} y=${CENTER + 24} text-anchor="middle">${formatKwh(hass, kwh, 0)}</text>` : nothing}
    </svg>
    <div class="side">
      ${parts.map(
        (part) =>
          html`<div class="row">
            <i class="dot" style="background: ${rgb(part.color)}"></i
            ><span class="grow">${localize(hass, PART_NAMES[part.key])}</span
            ><span class="num">${formatMoney(hass, part.value)}</span
            ><span class="num share">${percent(view.total > 0 ? part.value / view.total : 0)}</span>
          </div>`,
      )}
      ${note ? html`<div class="note">${note}</div>` : nothing}
    </div>
  </div>`;
}

export function offPeakRingView(
  hass: HomeAssistant | undefined,
  data: EnergyData,
  tariff: Tariff,
  cycle: RingCycle,
) {
  const view = offPeakRing(data.days, tariff, data.today, cycle);
  if (!view) return html`<div class="message">${localize(hass, 'energy_split_waiting')}</div>`;
  const even = offPeakShareOfDay(tariff.offPeakRanges);
  const outer = SIZE / 2 - 22;
  return html`<div class="layout">
    <svg
      viewBox="0 0 ${SIZE} ${SIZE}"
      role="img"
      aria-label=${localize(hass, 'energy_kwh_in_off_peak', { v: percent(view.kwhShare) })}
    >
      ${arcs(outer, 26, [
        { value: view.offPeakKwh, color: OFF_PEAK_RGB },
        { value: view.peakKwh, color: PEAK_RGB },
      ])}
      ${arcs(SIZE / 2 - 56, 10, [
        { value: view.offPeakCost, color: OFF_PEAK_RGB, opacity: 0.75 },
        { value: view.peakCost, color: PEAK_RGB, opacity: 0.75 },
      ])}
      ${even > 0 ? mark(outer, 26, even) : nothing}
      <text class="center-big" x=${CENTER} y=${CENTER + 4} text-anchor="middle">
        ${percent(view.kwhShare)}
      </text>
      <text class="center-small" x=${CENTER} y=${CENTER + 24} text-anchor="middle">
        ${localize(hass, 'energy_in_off_peak')}
      </text>
    </svg>
    <div class="side">
      <div class="figure">
        <div class="label">${localize(hass, 'energy_peak')}</div>
        <div class="value" style="color: ${rgb(PEAK_RGB)}">
          ${formatKwh(hass, view.peakKwh, 0)} · ${formatMoney(hass, view.peakCost)}
        </div>
      </div>
      <div class="figure">
        <div class="label">${localize(hass, 'energy_off_peak')}</div>
        <div class="value" style="color: ${rgb(OFF_PEAK_RGB)}">
          ${formatKwh(hass, view.offPeakKwh, 0)} · ${formatMoney(hass, view.offPeakCost)}
        </div>
      </div>
      ${even > 0 ? html`<div class="note">${localize(hass, 'energy_off_peak_target', { p: percent(even) })}</div>` : nothing}
    </div>
  </div>`;
}

/** Styles of the rings and their side. */
export const ringStyles = css`
  /* Name, amount and share on one line; a long name wraps, never cut. */
  .side .row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 8px;
  }
  .side .row .grow {
    min-width: 0;
    overflow-wrap: break-word;
  }
  .layout {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 18px;
  }
  svg {
    flex: none;
    width: min(${SIZE}px, 100%);
    height: auto;
    color: var(--primary-text-color);
  }
  .center-big {
    font-size: 28px;
    font-weight: 800;
    fill: var(--primary-text-color);
  }
  .center-small {
    font-size: 12px;
    fill: var(--secondary-text-color);
  }
  .side {
    flex: 1;
    min-width: 230px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .dot {
    border-radius: 50%;
  }
  .share {
    min-width: 40px;
    text-align: right;
    color: var(--vivid-muted);
  }
  .figure .label {
    font-size: 12px;
    color: var(--vivid-muted);
  }
  .figure .value {
    font-size: 17px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .note {
    font-size: 12.5px;
    line-height: 1.45;
    color: var(--secondary-text-color);
    margin-top: 6px;
  }
`;
