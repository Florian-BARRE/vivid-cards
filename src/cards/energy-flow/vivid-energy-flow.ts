import { css, html, nothing, svg, type CSSResultGroup } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { localize } from '../../i18n';
import { SAMPLE_TARIFF } from '../../energy/config';
import type { EnergyData, EnergyNeeds } from '../../energy/data';
import { deviceColor } from '../../energy/device-colors';
import { deviceList, deviceListStyles } from '../../energy/device-list';
import { formatKwh, formatMoney, rgb } from '../../energy/format';
import { periodBar, VividEnergyCard, type EnergyHead } from '../../energy/vivid-energy-card';
import { energyEditor } from '../../energy/vivid-energy-editor';
import {
  devicesView,
  ENERGY_PERIODS,
  periodDays,
  periodRange,
  type DeviceRow,
  type DevicesView,
  type EnergyPeriod,
} from '../../energy/views';
import {
  ENERGY_FLOW,
  flowLeaves,
  PERIOD_NAMES,
  resolvePeriodCard,
  shownDevices,
  spreadLabels,
  statName,
  type FlowView,
  type ResolvedPeriodCard,
} from './model';

export { ENERGY_FLOW, PERIOD_NAMES, resolvePeriodCard, type ResolvedPeriodCard };

/* ------------------------------ geometry ------------------------------ */

/** Width of the drawing; it scales with the card. */
const W = 440;
const ROOM_X = 112;
const DEVICE_X = 300;
const NODE = 8;
const LABEL_GAP = 32;
const DEVICE_GAP = 10;
const ROOM_GAP = 16;

/** A curved band from one node to another. */
function band(
  x1: number,
  a1: number,
  b1: number,
  x2: number,
  a2: number,
  b2: number,
  fill: string,
) {
  const xm = (x1 + x2) / 2;
  return svg`<path
    d=${`M${x1},${a1.toFixed(1)} C${xm},${a1.toFixed(1)} ${xm},${a2.toFixed(1)} ${x2},${a2.toFixed(1)} L${x2},${b2.toFixed(1)} C${xm},${b2.toFixed(1)} ${xm},${b1.toFixed(1)} ${x1},${b1.toFixed(1)} Z`}
    fill=${fill}
    fill-opacity="0.38"
  ></path>`;
}

/** A label of two lines (name, figures), anchored at its start or its end. */
function label(x: number, y: number, title: string, sub: string, anchor: 'start' | 'end') {
  return svg`<text x=${x} y=${y.toFixed(1)} text-anchor=${anchor}><tspan class="label-title" x=${x} dy="-0.15em">${title}</tspan><tspan class="label-sub" x=${x} dy="1.25em">${sub}</tspan></text>`;
}

/** A device's name without its room's in front ("Salon LEDs" → "LEDs"). */
function shortName(device: string, room: string): string {
  return device.startsWith(`${room} `) ? device.slice(room.length + 1) : device;
}

/**
 * Where the energy goes over a period: the part the meter shows that devices
 * measure (the rest of the home apart), then that part as a flow from the
 * rooms to their lights, LEDs and switches, each in its own color, or as a
 * ranked list. It also stands for the former ranking card.
 */
export class VividEnergyFlow extends VividEnergyCard<ResolvedPeriodCard> {
  static override properties = {
    ...VividEnergyCard.properties,
    _period: { state: true },
    _view: { state: true },
  };

  declare _period?: EnergyPeriod;
  declare _view?: FlowView;

  static getConfigElement(): HTMLElement {
    return energyEditor({
      devices: true,
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
          name: 'view',
          label: 'energy_flow_view',
          default: 'flow',
          options: [
            { value: 'flow', label: 'energy_flow_view_flow' },
            { value: 'list', label: 'energy_flow_view_list' },
          ],
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
    deviceListStyles,
    css`
      .measured {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .measured .bar {
        display: flex;
        gap: 2px;
        height: 14px;
      }
      .measured .bar .part {
        border-radius: 7px 0 0 7px;
        background: var(--energy-accent);
      }
      .measured .bar .rest {
        flex: 1;
        border: 1.5px dashed rgba(var(--vivid-rgb-text), 0.35);
        border-radius: 0 7px 7px 0;
        box-sizing: border-box;
      }
      .measured .figures {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 2px 12px;
        font-size: 13px;
      }
      .note {
        font-size: 12.5px;
        line-height: 1.45;
        color: var(--secondary-text-color);
      }
      .views {
        align-self: flex-start;
      }
      svg {
        width: 100%;
        height: auto;
        overflow: visible;
      }
      .label-title {
        font-size: 12.5px;
        font-weight: 700;
        fill: var(--primary-text-color);
      }
      .label-sub {
        font-size: 11px;
        fill: var(--secondary-text-color);
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

  protected head(config: ResolvedPeriodCard, data?: EnergyData): EnergyHead {
    const hass = this.hass;
    const view = data?.days.length ? this.view(config, data) : undefined;
    const period = localize(hass, PERIOD_NAMES[this.period(config)]);
    return {
      icon: 'mdi:transit-connection-variant',
      title: config.name ?? localize(hass, 'energy_where'),
      sub: view
        ? `${period} · ${formatKwh(hass, view.kwh, 0)} · ${formatMoney(hass, view.cost)}`
        : period,
    };
  }

  /** The part devices measure, the rest of the home apart. */
  private renderMeasured(view: DevicesView) {
    const hass = this.hass;
    const share = view.trackedShare;
    return html`<div class="measured">
      <div class="bar" aria-hidden="true">
        <span
          class="part"
          style=${styleMap({ width: `${Math.max(2, share * 100).toFixed(1)}%` })}
        ></span
        ><span class="rest"></span>
      </div>
      <div class="figures">
        <span
          ><b>${localize(hass, 'energy_measured', { v: formatKwh(hass, view.tracked) })}</b>
          <span class="sub">· ${Math.round(share * 1000) / 10} %</span></span
        >
        <span class="sub"
          >${localize(hass, 'energy_rest_of_home', { v: formatKwh(hass, view.untracked, 0) })}</span
        >
      </div>
      ${share < 0.5 ? html`<div class="note">${localize(hass, 'energy_measured_note')}</div>` : nothing}
    </div>`;
  }

  /** Rooms on the left, their devices on the right, each band as thick as its kWh. */
  private renderFlow(config: ResolvedPeriodCard, view: DevicesView) {
    const hass = this.hass;
    const rooms = shownDevices(
      view.rows,
      config.maxDevices,
      localize(hass, 'energy_others'),
    ).filter((row: DeviceRow) => row.kwh > 0);
    const leaves = flowLeaves(rooms);
    if (!leaves.length) return html`<div class="message">${localize(hass, 'energy_no_data')}</div>`;
    const total = rooms.reduce((sum, room) => sum + room.kwh, 0);
    const height = Math.max(220, leaves.length * 36);
    const k = (height - DEVICE_GAP * (leaves.length - 1)) / total;
    const roomsHeight = total * k + ROOM_GAP * (rooms.length - 1);
    const money = (kwh: number) => formatMoney(hass, kwh * view.price);
    let roomY = (height - roomsHeight) / 2;
    let deviceY = 0;
    const roomNodes: { room: DeviceRow; y: number; h: number }[] = [];
    const deviceNodes: { leaf: (typeof leaves)[number]; y: number; h: number; from: number }[] = [];
    for (const room of rooms) {
      const h = room.kwh * k;
      roomNodes.push({ room, y: roomY, h });
      let from = roomY;
      for (const leaf of leaves.filter((item) => item.room === room)) {
        const leafH = Math.max(leaf.row.kwh * k, 2);
        deviceNodes.push({ leaf, y: deviceY, h: leafH, from });
        from += leaf.row.kwh * k;
        deviceY += leafH + DEVICE_GAP;
      }
      roomY += h + ROOM_GAP;
    }
    const roomLabels = spreadLabels(
      roomNodes.map((node) => node.y + node.h / 2),
      LABEL_GAP,
      14,
      height - 8,
    );
    const deviceLabels = spreadLabels(
      deviceNodes.map((node) => node.y + node.h / 2),
      LABEL_GAP,
      14,
      height - 8,
    );
    return html`<svg
      viewBox="0 0 ${W} ${height}"
      role="img"
      aria-label=${localize(hass, 'energy_where')}
    >
      ${deviceNodes.map((node) =>
        band(
          ROOM_X + NODE,
          node.from,
          node.from + node.leaf.row.kwh * k,
          DEVICE_X,
          node.y,
          node.y + node.h,
          rgb(deviceColor(node.leaf.row.stat)),
        ),
      )}
      ${roomNodes.map(
        (node) =>
          svg`<rect x=${ROOM_X} y=${node.y.toFixed(1)} width=${NODE} height=${node.h.toFixed(1)} rx="3" fill="currentColor" style="color: var(--primary-text-color)"></rect>`,
      )}
      ${deviceNodes.map(
        (node) =>
          svg`<rect x=${DEVICE_X} y=${node.y.toFixed(1)} width=${NODE} height=${node.h.toFixed(1)} rx="3" fill=${rgb(deviceColor(node.leaf.row.stat))}></rect>`,
      )}
      ${roomNodes.map((node, index) =>
        label(
          ROOM_X - 6,
          roomLabels[index] ?? node.y,
          node.room.name,
          formatKwh(hass, node.room.kwh),
          'end',
        ),
      )}
      ${deviceNodes.map((node, index) =>
        label(
          DEVICE_X + NODE + 6,
          deviceLabels[index] ?? node.y,
          node.leaf.row === node.leaf.room || node.leaf.row.stat === `${node.leaf.room.stat}:rest`
            ? node.leaf.room.name
            : shortName(node.leaf.row.name, node.leaf.room.name),
          `${formatKwh(hass, node.leaf.row.kwh)} · ${money(node.leaf.row.kwh)}`,
          'start',
        ),
      )}
    </svg>`;
  }

  protected renderBody(config: ResolvedPeriodCard, data: EnergyData) {
    const hass = this.hass;
    const bar = periodBar(
      ENERGY_PERIODS,
      this.period(config),
      (period) => localize(hass, PERIOD_NAMES[period]),
      (period) => {
        this._period = period;
      },
    );
    if (!data.devices.length)
      return html`${bar}
        <div class="message">${localize(hass, 'energy_no_devices')}</div>`;
    const view = this.view(config, data);
    if (view.kwh <= 0)
      return html`${bar}
        <div class="message">${localize(hass, 'energy_no_data')}</div>`;
    const shown = this._view ?? config.view;
    return html`${bar} ${this.renderMeasured(view)}
      <div class="views">
        ${periodBar(
          ['flow', 'list'] as const,
          shown,
          (value) => localize(hass, value === 'flow' ? 'energy_view_flow' : 'energy_view_list'),
          (value) => {
            this._view = value;
          },
        )}
      </div>
      ${shown === 'flow' ? this.renderFlow(config, view) : deviceList(hass, view, config.maxDevices)}`;
  }
}

defineElement(ENERGY_FLOW, VividEnergyFlow);

registerCard({
  type: ENERGY_FLOW,
  name: 'Vivid energy flow',
  description:
    'Where the energy goes: the part devices measure, as a flow from the rooms to their lights, LEDs and switches, or as a ranked list.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-energy-flow`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-energy-flow': VividEnergyFlow;
  }
}
