import { LitElement, css, html } from 'lit';
import type { ClimateKind, ComfortRange } from '../core/climate';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import type { ClimateRange } from './vivid-climate-chart';
import { tokens } from './shared-styles';

/** One room (or sensor) of a multi-room climate chart. */
export interface ClimateRoomSource {
  entityId: string;
  /** Shown before the curve; the friendly name when unset. */
  name?: string;
}

/**
 * Several climate sensors over the same time span: one small curve per room,
 * all on the same scale and time axis, with the comfort band, dated min and
 * max, the current value and a shared hover cursor.
 *
 * Tapping a room fires `vivid-climate-room-select` with `{ entityId }`.
 */
export class VividClimateRooms extends LitElement {
  static override properties = {
    hass: { attribute: false },
    sources: { attribute: false },
    kind: { attribute: false },
    comfort: { attribute: false },
    range: { attribute: false },
  };

  declare hass?: HomeAssistant;
  declare sources: ClimateRoomSource[];
  declare kind: ClimateKind;
  /** Comfort range in the scale units; the default of the kind when unset. */
  declare comfort?: ComfortRange;
  declare range: ClimateRange;

  constructor() {
    super();
    this.sources = [];
    this.kind = 'temperature';
    this.range = '24h';
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
    `,
  ];

  override render() {
    return html`<div>${this.sources.map((source) => source.entityId).join(', ')}</div>`;
  }
}

defineElement('vivid-climate-rooms', VividClimateRooms);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-climate-rooms': VividClimateRooms;
  }
}
