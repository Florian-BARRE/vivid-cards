import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { fireEvent } from '../core/actions';
import { defineElement } from '../core/register';
import { tokens } from './shared-styles';

/** A thumb of the slider. */
export interface RangeThumb {
  value?: number;
  label: string;
  /** Own limits of the setting behind the thumb. */
  min?: number;
  max?: number;
  /** Color of the label's dot. */
  color?: string;
}

function clampTo(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * One track with one or more thumbs that keep their order (a range, or
 * ordered thresholds). Each thumb is a native range input, so it works with
 * a keyboard and a screen reader; the value is sent on release
 * (`vivid-range-change` with `{ index, value }`).
 */
export class VividRangeSlider extends LitElement {
  static override properties = {
    thumbs: { attribute: false },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    unit: {},
    locale: {},
    digits: { type: Number },
    track: {},
    band: {},
    marker: { type: Number },
    markerLabel: { attribute: 'marker-label' },
    disabled: { type: Boolean },
    dragging: { state: true },
  };

  declare thumbs: RangeThumb[];
  declare min: number;
  declare max: number;
  declare step: number;
  declare unit: string;
  /** Language of the numbers. */
  declare locale?: string;
  declare digits: number;
  /** CSS background of the track (a gradient for thresholds). */
  declare track?: string;
  /** Color of the part between the first and the last thumb. */
  declare band?: string;
  /** A reading shown on the track (the value now). */
  declare marker?: number;
  declare markerLabel?: string;
  declare disabled: boolean;
  /** Values while a thumb is dragged, then until Home Assistant reports them. */
  declare dragging?: (number | undefined)[];

  private sentAt = 0;

  constructor() {
    super();
    this.thumbs = [];
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.unit = '';
    this.digits = 0;
    this.disabled = false;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .wrap {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px 14px 12px;
        border-radius: 16px;
        background: var(--vivid-layer-1);
      }
      .wrap.disabled {
        opacity: 0.5;
      }
      .rail {
        position: relative;
        height: 22px;
        margin: 0 10px;
      }
      .bar {
        position: absolute;
        left: 0;
        right: 0;
        top: 7px;
        height: 8px;
        border-radius: 4px;
        background: var(--track, rgba(var(--vivid-rgb-text), 0.12));
      }
      .bar .band {
        position: absolute;
        top: 0;
        bottom: 0;
        border-radius: 4px;
        background: var(--band);
      }
      .marker {
        position: absolute;
        top: 1px;
        width: 2px;
        height: 20px;
        margin-left: -1px;
        border-radius: 1px;
        background: var(--primary-text-color);
        opacity: 0.75;
        pointer-events: none;
      }
      input {
        position: absolute;
        inset: 0 -10px;
        width: calc(100% + 20px);
        height: 22px;
        margin: 0;
        background: none;
        appearance: none;
        -webkit-appearance: none;
        pointer-events: none;
        outline: none;
      }
      input::-webkit-slider-runnable-track {
        background: none;
        height: 22px;
      }
      input::-moz-range-track {
        background: none;
      }
      input::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        margin-top: 1px;
        border: none;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
        pointer-events: auto;
        cursor: grab;
      }
      input::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border: none;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
        pointer-events: auto;
        cursor: grab;
      }
      input:focus-visible::-webkit-slider-thumb {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      input:focus-visible::-moz-range-thumb {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      input:disabled::-webkit-slider-thumb {
        cursor: default;
      }
      .labels {
        display: grid;
        grid-template-columns: repeat(var(--count, 1), minmax(0, 1fr));
        gap: 6px;
      }
      .labels div {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        font-size: 11.5px;
        color: var(--secondary-text-color);
      }
      .labels b {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        font-variant-numeric: tabular-nums;
      }
      .labels i {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex: none;
      }
      .labels .end {
        text-align: right;
      }
      .labels .end b {
        justify-content: flex-end;
      }
    `,
  ];

  protected override willUpdate(changed: PropertyValues<this>): void {
    // Home Assistant reported the values (or took too long): show them again.
    if (changed.has('thumbs') && this.dragging && Date.now() - this.sentAt > 600) {
      const reported = this.thumbs.every(
        (thumb, index) =>
          this.dragging?.[index] === undefined ||
          (thumb.value !== undefined &&
            Math.abs(thumb.value - (this.dragging[index] ?? 0)) < this.step / 2),
      );
      if (reported || Date.now() - this.sentAt > 4000) this.dragging = undefined;
    }
  }

  private values(): (number | undefined)[] {
    return this.thumbs.map((thumb, index) => this.dragging?.[index] ?? thumb.value);
  }

  /** The value a thumb may take: its own limits, and between its neighbours. */
  private allowed(index: number, raw: number): number {
    const thumb = this.thumbs[index];
    const values = this.values();
    let value = clampTo(raw, thumb?.min ?? this.min, thumb?.max ?? this.max);
    const before = values.slice(0, index).filter((item): item is number => item !== undefined);
    const after = values.slice(index + 1).filter((item): item is number => item !== undefined);
    if (before.length) value = Math.max(value, Math.max(...before) + this.step);
    if (after.length) value = Math.min(value, Math.min(...after) - this.step);
    return Math.round(value / this.step) * this.step;
  }

  private onInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = this.allowed(index, Number(input.value));
    input.value = String(value);
    const next = [...(this.dragging ?? this.thumbs.map(() => undefined))];
    next[index] = value;
    this.dragging = next;
  }

  private onChange(index: number, event: Event): void {
    const value = this.allowed(index, Number((event.target as HTMLInputElement).value));
    this.sentAt = Date.now();
    fireEvent(this, 'vivid-range-change', { index, value: Math.round(value * 1000) / 1000 });
  }

  private text(value: number | undefined): string {
    if (value === undefined) return '—';
    const shown = value.toLocaleString(this.locale, {
      minimumFractionDigits: this.digits,
      maximumFractionDigits: this.digits,
    });
    return this.unit ? `${shown}\u00a0${this.unit}` : shown;
  }

  private ratio(value: number): number {
    return clampTo((value - this.min) / Math.max(this.max - this.min, 1e-9), 0, 1) * 100;
  }

  protected override render() {
    const values = this.values();
    const known = values.filter((value): value is number => value !== undefined);
    const band =
      this.band && known.length >= 2
        ? {
            left: `${this.ratio(Math.min(...known))}%`,
            width: `${this.ratio(Math.max(...known)) - this.ratio(Math.min(...known))}%`,
          }
        : undefined;
    const count = this.thumbs.length;
    return html`<div
      class=${classMap({ wrap: true, disabled: this.disabled })}
      style=${styleMap({ '--track': this.track, '--band': this.band, '--count': String(count) })}
    >
      <div class="rail">
        <div class="bar">
          ${band ? html`<span class="band" style=${styleMap(band)}></span>` : nothing}
        </div>
        ${
          this.marker === undefined
            ? nothing
            : html`<span
                class="marker"
                title=${this.markerLabel ?? ''}
                style=${styleMap({ left: `${this.ratio(this.marker)}%` })}
              ></span>`
        }
        ${this.thumbs.map(
          (thumb, index) =>
            html`<input
              type="range"
              aria-label=${thumb.label}
              .min=${String(this.min)}
              .max=${String(this.max)}
              .step=${String(this.step)}
              .value=${String(values[index] ?? this.min)}
              ?disabled=${this.disabled || values[index] === undefined}
              @input=${(event: Event) => this.onInput(index, event)}
              @change=${(event: Event) => this.onChange(index, event)}
            />`,
        )}
      </div>
      <div class="labels">
        ${this.thumbs.map(
          (thumb, index) =>
            html`<div class=${classMap({ end: count === 2 && index === 1 })}>
              <b
                >${
                  thumb.color
                    ? html`<i style=${styleMap({ background: thumb.color })}></i>`
                    : nothing
                }${this.text(values[index])}</b
              >${thumb.label}
            </div>`,
        )}
      </div>
    </div>`;
  }
}

defineElement('vivid-range-slider', VividRangeSlider);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-range-slider': VividRangeSlider;
  }
}
