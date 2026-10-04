import { LitElement, css, html, type PropertyValues } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { fireEvent } from '../core/actions';
import { clamp } from '../core/color';
import { defineElement } from '../core/register';
import { tokens } from './shared-styles';

const PENDING_TIMEOUT_MS = 2000;
const KEY_STEP = 10;

/** Rainbow bar to pick a hue. Fires `hue-changed` with `{ hue }` (0–360) on release. */
export class VividHueSlider extends LitElement {
  static override properties = {
    hue: { type: Number },
    dimmed: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    label: {},
    _preview: { state: true },
  };

  declare hue?: number;
  declare dimmed: boolean;
  declare disabled: boolean;
  declare label?: string;
  declare _preview?: number;

  private pointerId?: number;
  private pendingTimer?: number;

  constructor() {
    super();
    this.dimmed = false;
    this.disabled = false;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .track {
        position: relative;
        height: 34px;
        border-radius: 17px;
        background: linear-gradient(
          90deg,
          #ff0000 0%,
          #ffff00 16.67%,
          #00ff00 33.33%,
          #00ffff 50%,
          #0000ff 66.67%,
          #ff00ff 83.33%,
          #ff0000 100%
        );
        cursor: pointer;
        touch-action: pan-y;
        transition: filter 0.4s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .track:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      :host([disabled]) .track {
        cursor: default;
        background: rgba(var(--vivid-rgb-text), 0.06);
        filter: none;
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
      @media (prefers-reduced-motion: reduce) {
        .track {
          transition: none;
        }
      }
    `,
  ];

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('hue') && this.pointerId === undefined) this._preview = undefined;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.pendingTimer);
  }

  private hueAt(event: PointerEvent): number {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
    return Math.round(clamp(ratio, 0, 1) * 360);
  }

  private commit(hue: number): void {
    this._preview = hue;
    window.clearTimeout(this.pendingTimer);
    this.pendingTimer = window.setTimeout(() => (this._preview = undefined), PENDING_TIMEOUT_MS);
    fireEvent(this, 'hue-changed', { hue });
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (this.disabled || event.button !== 0) return;
    event.stopPropagation();
    this.pointerId = event.pointerId;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this._preview = this.hueAt(event);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    this._preview = this.hueAt(event);
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    this.pointerId = undefined;
    this.commit(this.hueAt(event));
  };

  private readonly onPointerCancel = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    this.pointerId = undefined;
    this._preview = undefined;
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    const current = this._preview ?? this.hue ?? 0;
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowUp'
        ? current + KEY_STEP
        : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
          ? current - KEY_STEP
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? 360
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    this.commit(clamp(next, 0, 360));
  };

  protected override render() {
    const hue = this._preview ?? this.hue;
    const position = hue === undefined ? 0 : clamp(hue / 360, 0, 1);
    const left = `calc(7px + (100% - 14px) * ${position})`;
    return html`<div
      class="track"
      role="slider"
      tabindex=${this.disabled ? -1 : 0}
      aria-label=${ifDefined(this.label)}
      aria-valuemin="0"
      aria-valuemax="360"
      aria-valuenow=${ifDefined(hue)}
      aria-disabled=${String(this.disabled)}
      @pointerdown=${this.onPointerDown}
      @pointermove=${this.onPointerMove}
      @pointerup=${this.onPointerUp}
      @pointercancel=${this.onPointerCancel}
      @keydown=${this.onKeyDown}
    >
      ${hue === undefined ? '' : html`<div class="thumb" style=${styleMap({ left })}></div>`}
    </div>`;
  }
}

defineElement('vivid-hue-slider', VividHueSlider);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-hue-slider': VividHueSlider;
  }
}
