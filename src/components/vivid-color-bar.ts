import { LitElement, css, html, type PropertyValues } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { fireEvent } from '../core/actions';
import { clamp, hsToRgb, kelvinToRgb, rgbCss } from '../core/color';
import { defineElement } from '../core/register';
import { tokens } from './shared-styles';

const PENDING_TIMEOUT_MS = 2000;
const HUE_GRADIENT =
  'linear-gradient(90deg, #ff0000 0%, #ffff00 16.67%, #00ff00 33.33%, #00ffff 50%, #0000ff 66.67%, #ff00ff 83.33%, #ff0000 100%)';
const TEMPERATURE_STOPS = 6;

export type ColorBarKind = 'hue' | 'temperature' | 'saturation';

/**
 * Bar to pick a hue (0–360), a saturation (0–100 %, white on the left, the
 * `hue` at full color on the right) or a color temperature (kelvin, warm on
 * the left).
 * Fires `value-changed` with `{ value }` on release.
 */
export class VividColorBar extends LitElement {
  static override properties = {
    kind: {},
    value: { type: Number },
    min: { type: Number },
    max: { type: Number },
    disabled: { type: Boolean, reflect: true },
    hue: { type: Number },
    label: {},
    _preview: { state: true },
  };

  declare kind: ColorBarKind;
  declare value?: number;
  /** Kelvin range for `temperature`. */
  declare min: number;
  declare max: number;
  declare disabled: boolean;
  /** Hue (degrees) whose saturation the `saturation` bar sets. */
  declare hue: number;
  declare label?: string;
  declare _preview?: number;

  private pointerId?: number;
  private pendingTimer?: number;

  constructor() {
    super();
    this.kind = 'hue';
    this.min = 2000;
    this.max = 6535;
    this.disabled = false;
    this.hue = 0;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .track {
        position: relative;
        height: calc(var(--vivid-chip-height) - 2px);
        border-radius: calc(var(--vivid-chip-height) / 2 - 1px);
        cursor: pointer;
        touch-action: pan-y;
        -webkit-tap-highlight-color: transparent;
      }
      .track:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      :host([disabled]) .track {
        cursor: default;
        background: rgba(var(--vivid-rgb-text), 0.06) !important;
      }
      .thumb {
        position: absolute;
        top: 22%;
        bottom: 22%;
        width: 4px;
        border-radius: 2px;
        background: #fff;
        box-shadow: 0 0 0 1.5px rgba(0, 0, 0, 0.28);
        transform: translateX(-50%);
        pointer-events: none;
      }
    `,
  ];

  private get range(): [number, number] {
    if (this.kind === 'hue') return [0, 360];
    if (this.kind === 'saturation') return [0, 100];
    return [this.min, this.max];
  }

  private get step(): number {
    if (this.kind === 'hue') return 10;
    if (this.kind === 'saturation') return 5;
    return Math.max(Math.round((this.max - this.min) / 20), 50);
  }

  private gradient(): string {
    if (this.kind === 'hue') return HUE_GRADIENT;
    if (this.kind === 'saturation') {
      return `linear-gradient(90deg, #ffffff 0%, ${rgbCss(hsToRgb(this.hue, 100))} 100%)`;
    }
    const stops = Array.from({ length: TEMPERATURE_STOPS }, (_, index) => {
      const ratio = index / (TEMPERATURE_STOPS - 1);
      const kelvin = this.min + (this.max - this.min) * ratio;
      return `${rgbCss(kelvinToRgb(kelvin))} ${Math.round(ratio * 100)}%`;
    });
    return `linear-gradient(90deg, ${stops.join(', ')})`;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('value') && this.pointerId === undefined) this._preview = undefined;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.pendingTimer);
  }

  private valueAt(event: PointerEvent): number {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = rect.width > 0 ? clamp((event.clientX - rect.left) / rect.width, 0, 1) : 0;
    const [low, high] = this.range;
    return Math.round(low + (high - low) * ratio);
  }

  private commit(value: number): void {
    this._preview = value;
    window.clearTimeout(this.pendingTimer);
    this.pendingTimer = window.setTimeout(() => (this._preview = undefined), PENDING_TIMEOUT_MS);
    fireEvent(this, 'value-changed', { value });
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (this.disabled || event.button !== 0) return;
    event.stopPropagation();
    this.pointerId = event.pointerId;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this._preview = this.valueAt(event);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    this._preview = this.valueAt(event);
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    this.pointerId = undefined;
    this.commit(this.valueAt(event));
  };

  private readonly onPointerCancel = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    this.pointerId = undefined;
    this._preview = undefined;
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    const [low, high] = this.range;
    const current = this._preview ?? this.value ?? low;
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowUp'
        ? current + this.step
        : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
          ? current - this.step
          : event.key === 'Home'
            ? low
            : event.key === 'End'
              ? high
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    this.commit(clamp(next, low, high));
  };

  protected override render() {
    const [low, high] = this.range;
    const value = this._preview ?? this.value;
    const position =
      value === undefined || high <= low ? 0 : clamp((value - low) / (high - low), 0, 1);
    const left = `calc(7px + (100% - 14px) * ${position})`;
    return html`<div
      class="track"
      style=${styleMap({ background: this.gradient() })}
      role="slider"
      tabindex=${this.disabled ? -1 : 0}
      aria-label=${ifDefined(this.label)}
      aria-valuemin=${low}
      aria-valuemax=${high}
      aria-valuenow=${ifDefined(value)}
      aria-disabled=${String(this.disabled)}
      @pointerdown=${this.onPointerDown}
      @pointermove=${this.onPointerMove}
      @pointerup=${this.onPointerUp}
      @pointercancel=${this.onPointerCancel}
      @keydown=${this.onKeyDown}
    >
      ${value === undefined ? '' : html`<div class="thumb" style=${styleMap({ left })}></div>`}
    </div>`;
  }
}

defineElement('vivid-color-bar', VividColorBar);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-color-bar': VividColorBar;
  }
}
