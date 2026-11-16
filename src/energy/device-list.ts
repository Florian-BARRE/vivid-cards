/**
 * The consumers of a period as a ranked list, shared by the energy flow card
 * (its list view) and the ranking card: each room (its lights, LEDs and
 * switches under it) with its color, a bar, its kWh and its cost; then what
 * no device measures, and the share that is identified.
 */
import { css, html, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import type { HomeAssistant } from '../core/hass-types';
import { localize, localeOf } from '../i18n';
import { deviceColor } from './device-colors';
import { formatKwh, formatMoney, rgb } from './format';
import type { DeviceRow, DevicesView } from './views';

function deviceRow(hass: HomeAssistant | undefined, row: DeviceRow, top: number, child = false) {
  const color = rgb(deviceColor(row.stat));
  return html`<div class=${child ? 'device child' : 'device'}>
    <span
      class="mini"
      aria-hidden="true"
      style=${styleMap({ background: rgb(deviceColor(row.stat), 0.2), color })}
      >${child ? nothing : html`<ha-icon icon="mdi:flash"></ha-icon>`}</span
    >
    <span class="name">${row.name}</span>
    <div class="bar" aria-hidden="true">
      <i
        style=${styleMap({ width: `${Math.max(1.5, (row.kwh / top) * 100).toFixed(1)}%`, background: color })}
      ></i>
    </div>
    <span class="num">${formatKwh(hass, row.kwh)}</span>
    <span class="num money">${formatMoney(hass, row.cost)}</span>
  </div>`;
}

/** The ranked list of a period's consumers, the biggest first. */
export function deviceList(hass: HomeAssistant | undefined, view: DevicesView, max: number) {
  const rows = view.rows.slice(0, max);
  const top = Math.max(...rows.map((row) => row.kwh), 0.001);
  return html`<div class="list">
      ${rows.map(
        (row) =>
          html`${deviceRow(hass, row, top)}${row.children.map((childRow) => deviceRow(hass, childRow, top, true))}`,
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
              p: `${new Intl.NumberFormat(localeOf(hass), { maximumFractionDigits: 1 }).format(view.trackedShare * 100)} %`,
            })}
          </div>`
        : nothing
    }`;
}

/** Styles of the list. */
export const deviceListStyles = css`
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
    min-width: 0;
    overflow-wrap: anywhere;
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
`;
