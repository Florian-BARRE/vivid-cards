import { LitElement, css, html, nothing, svg } from 'lit';
import { fireEvent } from '../core/actions';
import { clamp, rgbCss } from '../core/color';
import { curveAt } from '../core/curve';
import type { Rgb } from '../core/hass-types';
import { defineElement } from '../core/register';
import { tokens } from './shared-styles';

export interface CurveHandle {
  t: number;
  s: number;
  /** Limits and steps of the two settings behind the point. */
  tMin: number;
  tMax: number;
  tStep: number;
  sMin: number;
  sMax: number;
  sStep: number;
}

const OVERHEAT_RGB: Rgb = [239, 83, 80];

function snap(value: number, step: number, min: number, max: number): number {
  const snapped = Math.round((value - min) / step) * step + min;
  return clamp(Math.round(snapped * 1000) / 1000, min, max);
}

/**
 * A fan curve: speed (Y) against temperature (X), with the current
 * temperature on it. `mini` draws the bare line for a card; the full chart
 * has axes, the hysteresis band, the overheat zone and draggable points.
 * Fires `vivid-curve-select` `{ index }` and `vivid-curve-change`
 * `{ index, t, s }` when a point is dropped.
 */
export class VividFanCurve extends LitElement {
  static override properties = {
    points: { attribute: false },
    temperature: { type: Number },
    stop: { type: Boolean },
    hysteresis: { type: Number },
    overheat: { type: Number },
    selected: { type: Number },
    mini: { type: Boolean, reflect: true },
    editable: { type: Boolean },
    colorAt: { attribute: false },
    format: { attribute: false },
    drag: { state: true },
  };

  declare points: CurveHandle[];
  declare temperature?: number;
  declare stop: boolean;
  declare hysteresis?: number;
  declare overheat?: number;
  declare selected?: number;
  declare mini: boolean;
  declare editable: boolean;
  /** Color of the line at a temperature. */
  declare colorAt?: (t: number) => Rgb;
  /** Number formatting (locale) for the labels. */
  declare format?: (value: number, digits: number) => string;
  declare drag?: { index: number; pointerId: number; t: number; s: number };

  constructor() {
    super();
    this.points = [];
    this.stop = false;
    this.mini = false;
    this.editable = false;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      svg {
        display: block;
        width: 100%;
        height: auto;
        overflow: visible;
        touch-action: none;
      }
      :host([mini]) svg {
        touch-action: auto;
      }
      .axis {
        font-size: 10px;
        fill: var(--secondary-text-color);
      }
      .grid {
        stroke: rgba(var(--vivid-rgb-text), 0.08);
      }
      .label {
        font-size: 10.5px;
        font-weight: 600;
        fill: var(--primary-text-color);
      }
      .handle {
        cursor: grab;
      }
      .handle text {
        font-size: 10px;
        font-weight: 700;
        pointer-events: none;
      }
    `,
  ];

  private get geometry() {
    const mini = this.mini;
    const width = mini ? 200 : 400;
    const height = mini ? 40 : 210;
    const [left, right, top, bottom] = mini ? [3, 3, 5, 5] : [38, 12, 14, 24];
    const temps = this.points.map((point) => point.t);
    const low = Math.min(20, ...temps.map((t) => t - 5));
    const high = Math.max(60, (this.overheat ?? 0) + 5, ...temps.map((t) => t + 5));
    const tMin = Math.floor(low / 5) * 5;
    const tMax = Math.ceil(high / 5) * 5;
    const x = (t: number) => left + ((t - tMin) / (tMax - tMin)) * (width - left - right);
    const y = (s: number) => top + (1 - s / 100) * (height - top - bottom);
    const tOf = (px: number) => tMin + ((px - left) / (width - left - right)) * (tMax - tMin);
    const sOf = (py: number) => (1 - (py - top) / (height - top - bottom)) * 100;
    return { width, height, left, right, top, bottom, tMin, tMax, x, y, tOf, sOf };
  }

  /** Points with the one being dragged at its live position. */
  private get livePoints(): CurveHandle[] {
    const drag = this.drag;
    return this.points.map((point, index) =>
      drag && drag.index === index ? { ...point, t: drag.t, s: drag.s } : point,
    );
  }

  private fmt(value: number, digits = 0): string {
    return this.format ? this.format(value, digits) : value.toFixed(digits);
  }

  private toSvg(event: PointerEvent): { px: number; py: number } | undefined {
    const svgElement = this.renderRoot.querySelector('svg');
    const box = svgElement?.getBoundingClientRect();
    if (!box || !box.width) return undefined;
    const { width, height } = this.geometry;
    return {
      px: ((event.clientX - box.left) / box.width) * width,
      py: ((event.clientY - box.top) / box.height) * height,
    };
  }

  private onDown(event: PointerEvent, index: number): void {
    if (!this.editable) return;
    event.preventDefault();
    const point = this.points[index];
    if (!point) return;
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    this.drag = { index, pointerId: event.pointerId, t: point.t, s: point.s };
    fireEvent(this, 'vivid-curve-select', { index });
  }

  private onMove(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = this.points[drag.index];
    const position = this.toSvg(event);
    if (!point || !position) return;
    const { tOf, sOf } = this.geometry;
    this.drag = {
      ...drag,
      t: snap(tOf(position.px), point.tStep, point.tMin, point.tMax),
      s: snap(sOf(position.py), point.sStep, point.sMin, point.sMax),
    };
  }

  private onUp(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    this.drag = undefined;
    const point = this.points[drag.index];
    if (point && (point.t !== drag.t || point.s !== drag.s)) {
      fireEvent(this, 'vivid-curve-change', { index: drag.index, t: drag.t, s: drag.s });
    }
  }

  private gradient(id: string, tMin: number, tMax: number, x: (t: number) => number) {
    const colorAt = this.colorAt ?? (() => [66, 165, 245] as Rgb);
    const stops = Array.from({ length: 9 }, (_, i) => tMin + ((tMax - tMin) * i) / 8);
    return svg`<linearGradient id=${id} gradientUnits="userSpaceOnUse" x1=${x(tMin)} x2=${x(tMax)} y1="0" y2="0">
      ${stops.map((t, i) => svg`<stop offset=${i / 8} stop-color=${rgbCss(colorAt(t))}></stop>`)}
    </linearGradient>
    <linearGradient id=${`${id}-fade`} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="white" stop-opacity="0.9"></stop>
      <stop offset="1" stop-color="white" stop-opacity="0"></stop>
    </linearGradient>`;
  }

  protected override render() {
    if (this.points.length === 0) return nothing;
    const g = this.geometry;
    const { width, height, top, bottom, left, right, tMin, tMax, x, y } = g;
    const points = this.livePoints;
    const sorted = [...points].sort((a, b) => a.t - b.t);
    const first = sorted[0] as CurveHandle;
    const last = sorted[sorted.length - 1] as CurveHandle;
    const path: [number, number][] = this.stop
      ? [
          [tMin, 0],
          [first.t, 0],
          [first.t, first.s],
        ]
      : [[tMin, first.s]];
    path.push(...sorted.map((point): [number, number] => [point.t, point.s]), [tMax, last.s]);
    const d = path
      .map(([t, s], i) => `${i ? 'L' : 'M'}${x(t).toFixed(1)},${y(s).toFixed(1)}`)
      .join(' ');
    const area = `${d} L${x(tMax).toFixed(1)},${y(0).toFixed(1)} L${x(tMin).toFixed(1)},${y(0).toFixed(1)} Z`;
    const id = this.mini ? 'curve-mini' : 'curve-full';
    const plotBottom = height - bottom;
    const temperature = this.temperature;
    const current =
      temperature === undefined
        ? undefined
        : { t: clamp(temperature, tMin, tMax), s: curveAt(points, temperature, this.stop) };
    const colorAt = this.colorAt ?? (() => [66, 165, 245] as Rgb);

    const grid = this.mini
      ? nothing
      : svg`${[0, 25, 50, 75, 100].map(
          (s) => svg`<line class="grid" x1=${left} x2=${width - right} y1=${y(s)} y2=${y(s)}></line>
            <text class="axis" x=${left - 6} y=${y(s) + 3} text-anchor="end">${s} %</text>`,
        )}
        ${Array.from({ length: Math.floor((tMax - tMin) / 10) + 1 }, (_, i) => tMin + i * 10).map(
          (t) =>
            svg`<text class="axis" x=${x(t)} y=${height - 6} text-anchor="middle">${t} °C</text>`,
        )}`;

    const overheat =
      this.mini || this.overheat === undefined || this.overheat >= tMax
        ? nothing
        : svg`<rect x=${x(this.overheat)} y=${top} width=${x(tMax) - x(this.overheat)} height=${plotBottom - top}
              fill=${rgbCss(OVERHEAT_RGB, 0.12)}></rect>
            <line x1=${x(this.overheat)} x2=${x(this.overheat)} y1=${top} y2=${plotBottom}
              stroke=${rgbCss(OVERHEAT_RGB, 0.8)} stroke-dasharray="3 3"></line>`;

    const hyst = this.hysteresis ?? 0;
    const band =
      this.mini || !this.stop || hyst <= 0
        ? nothing
        : svg`<rect x=${x(first.t - hyst)} y=${top} width=${x(first.t) - x(first.t - hyst)} height=${plotBottom - top}
              fill="rgba(var(--vivid-rgb-text), 0.07)"></rect>
            <line x1=${x(first.t - hyst)} x2=${x(first.t)} y1=${y(first.s)} y2=${y(first.s)}
              stroke=${`url(#${id})`} stroke-width="2" stroke-dasharray="2 3" opacity="0.7"></line>`;

    const marker = current
      ? (() => {
          const color = colorAt(current.t);
          const cx = x(current.t);
          const cy = y(current.s);
          const label = `${this.fmt(temperature ?? current.t, 1)} °C → ${Math.round(current.s)} %`;
          const labelWidth = 92;
          const lx = clamp(cx - labelWidth - 8, left + 2, width - right - labelWidth);
          return svg`<line x1=${cx} x2=${cx} y1=${top} y2=${plotBottom} stroke="rgba(var(--vivid-rgb-text), 0.35)"
              stroke-dasharray=${this.mini ? '2 2' : '3 3'}></line>
            ${
              this.mini
                ? nothing
                : svg`<rect x=${lx} y=${Math.max(top, cy - 32)} width=${labelWidth} height="20" rx="10"
                    fill="var(--vivid-layer-1)" stroke=${rgbCss(color, 0.6)}></rect>
                  <text class="label" x=${lx + labelWidth / 2} y=${Math.max(top, cy - 32) + 13.5} text-anchor="middle">${label}</text>`
            }
            <circle cx=${cx} cy=${cy} r=${this.mini ? 9 : 11} fill=${rgbCss(color, 0.25)}></circle>
            <circle cx=${cx} cy=${cy} r=${this.mini ? 4 : 6} fill=${rgbCss(color)} stroke="var(--vivid-layer-0)" stroke-width="2"></circle>`;
        })()
      : nothing;

    const handles = this.mini
      ? nothing
      : points.map((point, index) => {
          const color = colorAt(point.t);
          const on = this.selected === index || this.drag?.index === index;
          return svg`<g class="handle"
              @pointerdown=${(event: PointerEvent) => this.onDown(event, index)}
              @pointermove=${(event: PointerEvent) => this.onMove(event)}
              @pointerup=${(event: PointerEvent) => this.onUp(event)}
              @pointercancel=${(event: PointerEvent) => this.onUp(event)}>
            <circle cx=${x(point.t)} cy=${y(point.s)} r="18" fill="transparent"></circle>
            <circle cx=${x(point.t)} cy=${y(point.s)} r=${on ? 9.5 : 8} fill=${on ? rgbCss(color) : 'var(--vivid-layer-0)'}
              stroke=${rgbCss(color)} stroke-width="2.5"></circle>
            <text x=${x(point.t)} y=${y(point.s) + 3.5} text-anchor="middle"
              fill=${on ? '#fff' : 'var(--primary-text-color)'}>${index + 1}</text>
          </g>`;
        });

    return html`<svg viewBox=${`0 0 ${width} ${height}`} role="img" aria-label="Fan curve">
      <defs>
        ${this.gradient(id, tMin, tMax, x)}
        <mask id=${`${id}-mask`}>
          <rect x="0" y="0" width=${width} height=${height} fill=${`url(#${id}-fade)`}></rect>
        </mask>
      </defs>
      ${grid}${overheat}${band}
      <path d=${area} fill=${`url(#${id})`} opacity="0.22" mask=${`url(#${id}-mask)`}></path>
      <path
        d=${d}
        fill="none"
        stroke=${`url(#${id})`}
        stroke-width=${this.mini ? 2.2 : 3}
        stroke-linejoin="round"
        stroke-linecap="round"
      ></path>
      ${marker}${handles}
    </svg>`;
  }
}

defineElement('vivid-fan-curve', VividFanCurve);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-fan-curve': VividFanCurve;
  }
}
