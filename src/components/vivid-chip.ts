import { LitElement, css, html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { ChipTone } from '../core/glow';
import { defineElement } from '../core/register';
import { tokens } from './shared-styles';

/**
 * Pill-shaped badge. Interactive by default (renders a button); `readonly`
 * renders a plain status badge. The glow comes from `tone`.
 */
export class VividChip extends LitElement {
  static override properties = {
    icon: {},
    label: {},
    tooltip: {},
    tone: { attribute: false },
    wide: { type: Boolean },
    readonly: { type: Boolean },
    disabled: { type: Boolean, reflect: true },
    pressed: { type: Boolean },
  };

  declare icon?: string;
  declare label?: string;
  declare tooltip?: string;
  declare tone?: ChipTone;
  declare wide: boolean;
  declare readonly: boolean;
  declare disabled: boolean;
  declare pressed?: boolean;

  constructor() {
    super();
    this.wide = false;
    this.readonly = false;
    this.disabled = false;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: inline-flex;
        flex: none;
      }
      .chip {
        appearance: none;
        border: none;
        margin: 0;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: var(--vivid-chip-height);
        min-width: var(--vivid-chip-height);
        padding: 0 12px;
        border-radius: calc(var(--vivid-chip-height) / 2);
        background: var(--chip-bg, var(--vivid-chip-surface));
        box-shadow: var(--chip-shadow, none);
        color: var(--primary-text-color);
        font: inherit;
        font-size: 13px;
        font-weight: 500;
        line-height: 1;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
        transition:
          background-color 0.4s ease,
          box-shadow 0.4s ease,
          transform 0.12s ease;
        -webkit-tap-highlight-color: transparent;
      }
      button.chip {
        cursor: pointer;
      }
      button.chip:active {
        transform: scale(0.95);
      }
      button.chip:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      button.chip:disabled {
        cursor: default;
        opacity: 0.45;
        transform: none;
      }
      .chip.icon-only {
        padding: 0;
        width: var(--vivid-chip-height);
      }
      .chip.wide {
        width: 56px;
      }
      .icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        color: var(--chip-icon, var(--primary-text-color));
        transition: color 0.4s ease;
      }
      .chip.pulse .icon {
        animation: vivid-pulse var(--chip-pulse, 2s) ease-in-out infinite;
      }
      @keyframes vivid-pulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.18);
          opacity: 0.75;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .chip,
        .icon {
          transition: none;
        }
        .chip.pulse .icon {
          animation: none;
        }
      }
    `,
  ];

  protected override render() {
    const tone = this.tone ?? {};
    const classes = classMap({
      chip: true,
      wide: this.wide,
      'icon-only': !this.label && !this.wide,
      pulse: Boolean(tone.pulse),
    });
    const style = styleMap({
      '--chip-bg': tone.background,
      '--chip-shadow': tone.shadow,
      '--chip-icon': tone.iconColor,
      '--chip-pulse': tone.pulse,
    });
    const content = html`${
      this.icon ? html`<ha-icon class="icon" .icon=${this.icon}></ha-icon>` : nothing
    }${this.label ? html`<span>${this.label}</span>` : nothing}`;

    if (this.readonly) {
      return html`<span class=${classes} style=${style} title=${ifDefined(this.tooltip)}>
        ${content}
      </span>`;
    }
    return html`<button
      type="button"
      class=${classes}
      style=${style}
      ?disabled=${this.disabled}
      title=${ifDefined(this.tooltip)}
      aria-label=${ifDefined(this.tooltip ?? this.label)}
      aria-pressed=${ifDefined(this.pressed === undefined ? undefined : String(this.pressed))}
    >
      ${content}
    </button>`;
  }
}

defineElement('vivid-chip', VividChip);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-chip': VividChip;
  }
}
