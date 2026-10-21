import { LitElement, css, html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { fireEvent } from '../core/actions';
import { rgbCss } from '../core/color';
import { glowSize, tintTone } from '../core/glow';
import type { Rgb } from '../core/hass-types';
import { defineElement } from '../core/register';
import { buttonReset, tokens } from './shared-styles';

/** Accent of the sources: a cool blue, apart from the amber of the lights. */
export const SOURCE_RGB: Rgb = [77, 182, 245];
const FAIL_RGB: Rgb = [255, 112, 67];

/**
 * Feedback of a source: `sending` the command is out and the card waits;
 * `ok` the device confirmed it; `fail` it did not; `sent` it left but no
 * confirmation is possible; `remote` the source changed from elsewhere.
 */
export type SourcePhase = 'sending' | 'ok' | 'fail' | 'sent' | 'remote';

export interface SourceItem {
  name: string;
  icon: string;
  available: boolean;
  /** Second line under the name (none by default). */
  hint?: string;
}

export interface SourceLabels {
  sending: string;
  ok: string;
  fail: string;
  sent: string;
}

/**
 * A row of source buttons (HDMI inputs, amplifier inputs…): the active one
 * lit, and a send animation — waves while the command is out, a check when
 * the device confirms it, orange when it does not. Fires
 * `vivid-source-select` with `{ index }`.
 */
export class VividSourceRow extends LitElement {
  static override properties = {
    items: { attribute: false },
    active: { type: Number },
    phases: { attribute: false },
    labels: { attribute: false },
    disabled: { type: Boolean },
    size: { reflect: true },
  };

  declare items: SourceItem[];
  declare active?: number;
  declare phases: Partial<Record<number, SourcePhase>>;
  declare labels?: SourceLabels;
  declare disabled: boolean;
  /** `compact` for the dashboard card, `large` for the details. */
  declare size: 'compact' | 'large';

  constructor() {
    super();
    this.items = [];
    this.phases = {};
    this.disabled = false;
    this.size = 'compact';
  }

  static override styles = [
    tokens,
    buttonReset,
    css`
      :host {
        display: block;
        --source-disc: 34px;
        --source-icon: 18px;
      }
      :host([size='large']) {
        --source-disc: 42px;
        --source-icon: 22px;
      }
      .row {
        display: grid;
        grid-template-columns: repeat(var(--source-count, 5), minmax(0, 1fr));
        gap: 6px;
      }
      .source {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        min-width: 0;
        padding: 7px 2px 7px;
        border-radius: 16px;
        background: var(--vivid-layer-1);
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        transition:
          background 0.3s ease,
          box-shadow 0.3s ease,
          transform 0.12s ease;
      }
      :host([size='large']) .source {
        padding: 10px 2px 8px;
        gap: 4px;
      }
      .source:active {
        transform: scale(0.95);
      }
      .source:disabled {
        opacity: 0.45;
        cursor: default;
        transform: none;
      }
      .disc {
        position: relative;
        display: grid;
        place-items: center;
        --vivid-glow-size: var(--source-glow);
        width: var(--source-disc);
        height: var(--source-disc);
        border-radius: 50%;
        background: var(--disc-bg, rgba(var(--vivid-rgb-text), 0.07));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
        transition:
          background 0.3s ease,
          box-shadow 0.3s ease,
          color 0.3s ease;
      }
      .disc ha-icon {
        --mdc-icon-size: var(--source-icon);
        display: inline-flex;
      }
      .name {
        max-width: 100%;
        margin-top: 2px;
        font-size: 12px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .hint {
        max-width: 100%;
        font-size: 10.5px;
        line-height: 1.2;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .source.active {
        background: rgba(var(--source-rgb), 0.15);
        box-shadow: inset 0 0 0 1.5px rgba(var(--source-rgb), 0.55);
      }
      .source.active .name {
        color: color-mix(in srgb, rgb(var(--source-rgb)) 60%, var(--primary-text-color));
      }
      .source.sending {
        background: rgba(var(--source-rgb), 0.1);
        box-shadow: inset 0 0 0 1.5px rgba(var(--source-rgb), 0.35);
      }
      .source.fail {
        background: rgba(var(--fail-rgb), 0.12);
        box-shadow: inset 0 0 0 1.5px rgba(var(--fail-rgb), 0.7);
        animation: shake 0.42s ease;
      }
      .name.phase {
        color: rgb(var(--source-rgb));
      }
      .name.ok {
        color: var(--success-color, #66bb6a);
      }
      .name.fail {
        color: rgb(var(--fail-rgb));
      }
      /* IR waves leaving the disc while the command is out. */
      .waves::before,
      .waves::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2.5px solid rgba(var(--source-rgb), 0.9);
        animation: wave 1.1s ease-out infinite;
        pointer-events: none;
      }
      .waves::after {
        animation-delay: 0.55s;
      }
      .pop {
        animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes wave {
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(1.95);
          opacity: 0;
        }
      }
      @keyframes pop {
        0% {
          transform: scale(0.7);
        }
        60% {
          transform: scale(1.14);
        }
        100% {
          transform: scale(1);
        }
      }
      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        25% {
          transform: translateX(-3px);
        }
        50% {
          transform: translateX(3px);
        }
        75% {
          transform: translateX(-2px);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .source,
        .disc {
          transition: none;
        }
        .waves::before,
        .waves::after,
        .pop,
        .source.fail {
          animation: none;
        }
      }
    `,
  ];

  private select(index: number): void {
    fireEvent(this, 'vivid-source-select', { index });
  }

  private renderItem(item: SourceItem, index: number) {
    const phase = this.phases[index];
    const active = index === this.active && phase !== 'fail';
    const lit = active || phase === 'ok' || phase === 'remote';
    const tone =
      phase === 'fail'
        ? tintTone(FAIL_RGB, 0.8)
        : phase === 'sending'
          ? tintTone(SOURCE_RGB, 0.45)
          : lit
            ? tintTone(SOURCE_RGB, phase === 'ok' || phase === 'remote' ? 1 : 0.85)
            : undefined;
    const icon =
      phase === 'ok' || phase === 'remote'
        ? 'mdi:check-bold'
        : phase === 'fail'
          ? 'mdi:alert'
          : item.icon;
    const labels = this.labels;
    // The send's state takes the name's place for a moment: the tile keeps its height.
    const name =
      phase && phase !== 'remote' && labels
        ? html`<span
            class=${classMap({ name: true, phase: true, ok: phase === 'ok', fail: phase === 'fail' })}
            >${labels[phase]}</span
          >`
        : html`<span class="name">${item.name}</span>`;
    const hint = item.hint ? html`<span class="hint">${item.hint}</span>` : nothing;
    return html`<button
      type="button"
      class=${classMap({
        reset: true,
        source: true,
        active: lit && phase !== 'sending',
        sending: phase === 'sending',
        fail: phase === 'fail',
      })}
      aria-pressed=${active ? 'true' : 'false'}
      aria-label=${item.name}
      title=${item.name}
      ?disabled=${this.disabled || !item.available}
      @click=${() => this.select(index)}
    >
      <span
        class=${classMap({ disc: true, waves: phase === 'sending', pop: phase === 'ok' || phase === 'remote' })}
        style=${styleMap({
          '--disc-bg': tone?.background,
          '--disc-shadow': tone?.shadow,
          '--disc-color': tone?.iconColor,
        })}
        ><ha-icon .icon=${icon}></ha-icon
      ></span>
      ${name} ${hint}
    </button>`;
  }

  protected override render() {
    if (!this.items.length) return nothing;
    const disc = this.size === 'large' ? 42 : 34;
    return html`<div
      class="row"
      style=${styleMap({
        '--source-count': String(this.items.length),
        '--source-rgb': SOURCE_RGB.join(', '),
        '--fail-rgb': FAIL_RGB.join(', '),
        '--source-glow': glowSize(disc),
        '--source-ink': rgbCss(SOURCE_RGB),
      })}
    >
      ${this.items.map((item, index) => this.renderItem(item, index))}
    </div>`;
  }
}

defineElement('vivid-source-row', VividSourceRow);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-source-row': VividSourceRow;
  }
}
