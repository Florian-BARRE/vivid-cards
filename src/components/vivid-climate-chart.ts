import { LitElement, css, html } from 'lit';
import type { ClimateKind, ComfortRange } from '../core/climate';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import { tokens } from './shared-styles';

/** Time spans the climate charts offer. */
export type ClimateRange = '6h' | '24h' | '7d' | '30d';
export const CLIMATE_RANGES: ClimateRange[] = ['6h', '24h', '7d', '30d'];

/**
 * History of one climate sensor: a curve colored by its value, the comfort
 * band, dated min and max, the current value and a summary row.
 *
 * Interface shared by the climate badges (which mount it in their details)
 * and the chart implementation.
 */
export class VividClimateChart extends LitElement {
  static override properties = {
    hass: { attribute: false },
    entityId: { attribute: false },
    kind: { attribute: false },
    comfort: { attribute: false },
    range: { attribute: false },
  };

  declare hass?: HomeAssistant;
  /** The sensor (or numeric sensor group) to chart. */
  declare entityId?: string;
  declare kind: ClimateKind;
  /** Comfort range in the scale units (°C, %, hPa, ppm); the default of the kind when unset. */
  declare comfort?: ComfortRange;
  declare range: ClimateRange;

  constructor() {
    super();
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
    return html`<div>${this.entityId ?? ''}</div>`;
  }
}

defineElement('vivid-climate-chart', VividClimateChart);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-climate-chart': VividClimateChart;
  }
}
