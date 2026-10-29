import { css, html, nothing, svg, type CSSResultGroup } from 'lit';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { localize } from '../../i18n';
import { SAMPLE_TARIFF } from '../../energy/config';
import type { EnergyData, EnergyNeeds } from '../../energy/data';
import { formatKwh, formatMoney, rgb, PEAK_RGB } from '../../energy/format';
import { periodChips, VividEnergyCard, type EnergyHead } from '../../energy/vivid-energy-card';
import { energyEditor } from '../../energy/vivid-energy-editor';
import {
  devicesView,
  ENERGY_PERIODS,
  periodDays,
  periodRange,
  type DevicesView,
  type EnergyPeriod,
} from '../../energy/views';
import {
  ENERGY_FLOW,
  PERIOD_NAMES,
  resolvePeriodCard,
  shownDevices,
  spreadLabels,
  statName,
  type ResolvedPeriodCard,
} from './model';

export { ENERGY_FLOW, PERIOD_NAMES, resolvePeriodCard, type ResolvedPeriodCard };

const W = 640;
const H = 320;
const TOP = 24;
const HEIGHT = 272;
const NODE = 10;
const X = [8, 150, 290, 450];

function band(
  x1: number,
  a1: number,
  b1: number,
  x2: number,
  a2: number,
  b2: number,
  fill: string,
  opacity: number,
) {
  const xm = (x1 + x2) / 2;
  return svg`<path
    d=${`M${x1},${a1.toFixed(1)} C${xm},${a1.toFixed(1)} ${xm},${a2.toFixed(1)} ${x2},${a2.toFixed(1)} L${x2},${b2.toFixed(1)} C${xm},${b2.toFixed(1)} ${xm},${b1.toFixed(1)} ${x1},${b1.toFixed(1)} Z`}
    fill=${fill}
    fill-opacity=${opacity}
  ></path>`;
}

function label(x: number, y: number, title: string, sub: string) {
  return svg`<text x=${x} y=${y.toFixed(1)} class="label"><tspan class="label-title" x=${x} dy="-0.2em">${title}</tspan><tspan class="label-sub" x=${x} dy="1.25em">${sub}</tspan></text>`;
}

const LABEL_GAP = 30;

/**
 * Energy flow, from the meter to the home, then to what is measured and what
 * is not; the measured part is zoomed so each device stays readable.
 */
export class VividEnergyFlow extends VividEnergyCard<ResolvedPeriodCard> {
  static override properties = {
    ...VividEnergyCard.properties,
    _period: { state: true },
  };

  declare _period?: EnergyPeriod;

  static getConfigElement(): HTMLElement {
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
      validate: (config) => resolvePeriodCard(ENERGY_FLOW, config),
    });
  }

  static getStubConfig(): Record<string, unknown> {
    return { tariff: SAMPLE_TARIFF };
  }

  static override styles: CSSResultGroup = [
    VividEnergyCard.styles,
    css`
      svg {
        color: var(--primary-text-color);
        width: 100%;
        height: auto;
        overflow: visible;
      }
      .label-title {
        font-size: 13px;
        font-weight: 700;
        fill: var(--primary-text-color);
      }
      .label-sub {
        font-size: 11.5px;
        fill: var(--secondary-text-color);
      }
      .zoom {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        fill: rgb(255, 193, 7);
      }
      .hatch-a {
        fill: rgba(var(--vivid-rgb-text), 0.06);
      }
      .hatch-b {
        fill: rgba(var(--vivid-rgb-text), 0.16);
      }
    `,
  ];

  protected resolveConfig(raw: unknown): ResolvedPeriodCard {
    return resolvePeriodCard(ENERGY_FLOW, raw);
  }

  protected period(config: ResolvedPeriodCard): EnergyPeriod {
    return this._period ?? config.period;
  }

  protected needs(config: ResolvedPeriodCard, today: string): EnergyNeeds {
    const days = periodDays(this.period(config), today);
    return { days, hourlyDays: 0, devices: true, deviceDays: days };
  }

  protected view(config: ResolvedPeriodCard, data: EnergyData): DevicesView {
    const range = periodRange(
      this.period(config),
      data.today,
      data.days.filter((day) => day.date < data.today).at(-1)?.date,
    );
    return devicesView(data.days, data.devices, config.tariff, range.from, range.to, (stat) =>
      statName(this.hass, stat),
    );
  }

  protected head(config: ResolvedPeriodCard, _data?: EnergyData): EnergyHead {
    return {
      icon: 'mdi:transit-connection-variant',
      color: [66, 165, 245],
      title: config.name ?? localize(this.hass, 'energy_flow'),
      sub: localize(this.hass, 'energy_flow_sub'),
      aside: periodChips(
        ENERGY_PERIODS,
        this.period(config),
        (period) => localize(this.hass, PERIOD_NAMES[period]),
        (period) => {
          this._period = period;
        },
      ),
    };
  }

  protected renderBody(config: ResolvedPeriodCard, data: EnergyData) {
    const hass = this.hass;
    const view = this.view(config, data);
    if (!data.devices.length)
      return html`<div class="message">${localize(hass, 'energy_no_devices')}</div>`;
    if (view.kwh <= 0) return html`<div class="message">${localize(hass, 'energy_no_data')}</div>`;
    const total = Math.max(view.kwh, view.tracked);
    const scale = HEIGHT / total;
    const gap = 12;
    const untrackedH = view.untracked * scale;
    const trackedH = Math.max(view.tracked * scale, view.tracked > 0 ? 3 : 0);
    const trackedTop = TOP + untrackedH + (untrackedH > 0 ? gap : 0);
    const devices = shownDevices(
      view.rows,
      config.maxDevices,
      localize(hass, 'energy_others'),
    ).filter((row) => row.kwh > 0);
    const deviceGap = 8;
    const zoomRoom = HEIGHT - deviceGap * Math.max(0, devices.length - 1);
    const zoomScale = view.tracked > 0 ? zoomRoom / view.tracked : 0;
    let y = TOP;
    const items = devices.map((row) => {
      const height = Math.max(row.kwh * zoomScale, 3);
      const item = { row, y, height };
      y += height + deviceGap;
      return item;
    });
    const zoomBottom = y - deviceGap;
    const labels = spreadLabels(
      items.map((item) => item.y + item.height / 2),
      LABEL_GAP,
      TOP + 6,
      H - 12,
    );
    const amber = rgb(PEAK_RGB);
    const share = (value: number) => `${Math.round((value / Math.max(view.kwh, 0.001)) * 100)} %`;
    const zoom = scale > 0 && zoomScale > 0 ? Math.round(zoomScale / scale) : 1;
    const money = (kwh: number) => formatMoney(hass, kwh * view.price);
    return html`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label=${localize(hass, 'energy_flow')}>
      <defs>
        <pattern
          id="hatch"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect class="hatch-a" width="8" height="8"></rect>
          <rect class="hatch-b" width="3" height="8"></rect>
        </pattern>
      </defs>
      ${band(X[0]! + NODE, TOP, TOP + HEIGHT, X[1]!, TOP, TOP + HEIGHT, 'rgb(66, 165, 245)', 0.3)}
      <rect
        x=${X[0]}
        y=${TOP}
        width=${NODE}
        height=${HEIGHT}
        rx="4"
        fill="rgb(66, 165, 245)"
      ></rect>
      <rect
        x=${X[1]}
        y=${TOP}
        width=${NODE}
        height=${HEIGHT}
        rx="4"
        fill="currentColor"
        style="color: var(--primary-text-color)"
      ></rect>
      ${untrackedH > 0 ? band(X[1]! + NODE, TOP, TOP + untrackedH, X[2]!, TOP, TOP + untrackedH, 'url(#hatch)', 1) : nothing}
      ${
        view.tracked > 0
          ? band(
              X[1]! + NODE,
              TOP + untrackedH,
              TOP + untrackedH + view.tracked * scale,
              X[2]!,
              trackedTop,
              trackedTop + trackedH,
              amber,
              0.6,
            )
          : nothing
      }
      ${untrackedH > 0 ? svg`<rect x=${X[2]} y=${TOP} width=${NODE} height=${untrackedH.toFixed(1)} rx="4" fill="rgba(158, 158, 158, 0.7)"></rect>` : nothing}
      ${trackedH > 0 ? svg`<rect x=${X[2]} y=${trackedTop.toFixed(1)} width=${NODE} height=${trackedH.toFixed(1)} rx="2" fill=${amber}></rect>` : nothing}
      ${
        items.length
          ? svg`<path
              d=${`M${X[2]! + NODE},${trackedTop.toFixed(1)} L${X[3]},${TOP} L${X[3]},${zoomBottom.toFixed(1)} L${X[2]! + NODE},${(trackedTop + trackedH).toFixed(1)} Z`}
              fill=${amber}
              fill-opacity="0.07"
              stroke=${rgb(PEAK_RGB, 0.5)}
              stroke-dasharray="4 4"
            ></path>
            <text class="zoom" x=${X[3]! - 6} y=${TOP - 8} text-anchor="end">${localize(hass, 'energy_zoom', { z: zoom })}</text>`
          : nothing
      }
      ${items.map((item) => svg`<rect x=${X[3]} y=${item.y.toFixed(1)} width=${NODE} height=${item.height.toFixed(1)} rx="3" fill=${amber}></rect>`)}
      ${label(X[0]! + NODE + 8, TOP + HEIGHT / 2, localize(hass, 'energy_grid'), `${formatKwh(hass, view.kwh, 0)} · ${formatMoney(hass, view.cost)}`)}
      ${label(X[1]! + NODE + 8, TOP + HEIGHT / 2 + (untrackedH > HEIGHT / 2 ? 44 : 0), localize(hass, 'energy_home'), '')}
      ${untrackedH > 0 ? label(X[2]! + NODE + 8, TOP + untrackedH / 2, localize(hass, 'energy_untracked'), `${formatKwh(hass, view.untracked, 0)} · ${share(view.untracked)}`) : nothing}
      ${view.tracked > 0 ? label(X[2]! + NODE + 8, Math.min(TOP + HEIGHT - 10, trackedTop + trackedH / 2 + 16), localize(hass, 'energy_tracked'), `${formatKwh(hass, view.tracked)} · ${share(view.tracked)}`) : nothing}
      ${items.map((item, index) => {
        const at = item.y + item.height / 2;
        const placed = labels[index] ?? at;
        const leader =
          Math.abs(placed - at) > 4
            ? svg`<path d=${`M${X[3]! + NODE + 1},${at.toFixed(1)} L${X[3]! + NODE + 5},${placed.toFixed(1)}`} stroke="currentColor" stroke-opacity="0.35" fill="none"></path>`
            : nothing;
        return svg`${leader}${label(X[3]! + NODE + 8, placed, item.row.name, `${formatKwh(hass, item.row.kwh)} · ${money(item.row.kwh)}`)}`;
      })}
    </svg>`;
  }
}

defineElement(ENERGY_FLOW, VividEnergyFlow);

registerCard({
  type: ENERGY_FLOW,
  name: 'Vivid Energy Flow',
  description: 'Energy from the meter to the devices, the measured part zoomed in.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-energy-flow`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-energy-flow': VividEnergyFlow;
  }
}
