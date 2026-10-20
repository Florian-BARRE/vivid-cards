import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { fireEvent } from '../../core/actions';
import { clamp } from '../../core/color';
import { defineElement } from '../../core/register';
import { tokens } from '../../components/shared-styles';
import { hyperhdrStyles } from './view';

/**
 * A wide slider showing its value as a fill. While dragging it shows where
 * the thumb is; the value is sent once, on release (`vivid-slider-change`).
 */
export class VividHyperHdrSlider extends LitElement {
  static override properties = {
    value: { type: Number },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    icon: {},
    label: {},
    unit: {},
    digits: { type: Number },
    color: {},
    disabled: { type: Boolean },
    dragging: { state: true },
  };

  declare value?: number;
  declare min: number;
  declare max: number;
  declare step: number;
  declare icon?: string;
  declare label?: string;
  declare unit: string;
  declare digits: number;
  declare color?: string;
  declare disabled: boolean;
  /** The thumb position while dragging. */
  declare dragging?: number;

  /** A sent value shown until Home Assistant reports it. */
  private sent?: { value: number; at: number };

  constructor() {
    super();
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.unit = '';
    this.digits = 0;
    this.disabled = false;
  }

  static override styles = [
    tokens,
    hyperhdrStyles,
    css`
      :host {
        display: block;
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: 9px;
        padding: 10px 14px 13px;
        border-radius: 16px;
        background: var(--vivid-layer-1);
      }
      .stack.disabled {
        opacity: 0.5;
      }
      .top {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 13px;
      }
      .top b {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .track {
        position: relative;
        display: block;
        height: 8px;
        border-radius: 4px;
        background: rgba(var(--vivid-rgb-text), 0.1);
      }
      .track .fill {
        position: absolute;
        inset: 0 auto 0 0;
        width: var(--value, 50%);
        border-radius: 4px;
        background: var(--bar-color, var(--primary-color));
      }
      .track .thumb {
        position: absolute;
        top: 50%;
        left: var(--value, 50%);
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #fff;
        transform: translate(-50%, -50%);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      }
      .track input {
        position: absolute;
        inset: -10px 0;
        width: 100%;
        height: calc(100% + 20px);
        margin: 0;
        opacity: 0;
        cursor: pointer;
        touch-action: pan-y;
      }
    `,
  ];

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('value') && this.sent && this.value !== undefined) {
      if (
        Math.abs(this.value - this.sent.value) < this.step / 2 ||
        Date.now() - this.sent.at > 4000
      ) {
        this.sent = undefined;
      }
    }
  }

  private readonly onInput = (event: Event): void => {
    this.dragging = Number((event.target as HTMLInputElement).value);
  };

  private readonly onChange = (event: Event): void => {
    const value = Number((event.target as HTMLInputElement).value);
    this.dragging = undefined;
    this.sent = { value, at: Date.now() };
    fireEvent(this, 'vivid-slider-change', { value });
  };

  protected override render() {
    const shown = this.dragging ?? this.sent?.value ?? this.value;
    const ratio =
      shown === undefined
        ? 0
        : clamp((shown - this.min) / Math.max(this.max - this.min, 1e-9), 0, 1);
    const text =
      shown === undefined
        ? '—'
        : `${shown.toFixed(this.digits)}${this.unit ? `\u00a0${this.unit}` : ''}`;
    const input = html`<input
      type="range"
      aria-label=${this.label ?? ''}
      .min=${String(this.min)}
      .max=${String(this.max)}
      .step=${String(this.step)}
      .value=${String(shown ?? this.min)}
      ?disabled=${this.disabled}
      @input=${this.onInput}
      @change=${this.onChange}
    />`;
    const style = styleMap({
      '--value': `${(ratio * 100).toFixed(2)}%`,
      '--bar-color': this.color,
    });
    // A label goes above a slim track, so the thumb never covers it.
    if (this.label && !this.icon) {
      return html`<div class=${classMap({ stack: true, disabled: this.disabled })} style=${style}>
        <div class="top"><span>${this.label}</span><b>${text}</b></div>
        <label class="track"><span class="fill"></span><span class="thumb"></span>${input}</label>
      </div>`;
    }
    return html`<label class=${classMap({ bar: true, disabled: this.disabled })} style=${style}>
      <span class="fill"></span>${ratio > 0.3 ? html`<span class="knob"></span>` : nothing}
      <span class="text"
        >${this.icon ? html`<ha-icon .icon=${this.icon}></ha-icon>` : nothing}${
          this.label ? `${this.label} ` : ''
        }${text}</span
      >
      ${input}
    </label>`;
  }
}

defineElement('vivid-hyperhdr-slider', VividHyperHdrSlider);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-hyperhdr-slider': VividHyperHdrSlider;
  }
}
