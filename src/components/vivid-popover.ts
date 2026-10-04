import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { fireEvent } from '../core/actions';
import { defineElement } from '../core/register';
import { tokens } from './shared-styles';

const GAP = 8;
const MARGIN = 8;

/**
 * Floating panel anchored under (or above) an element, mounted on
 * `document.body` so no dashboard layout clips it. Follows its anchor on
 * scroll and resize, and asks to close (`vivid-popover-close-request`) on
 * Escape or a press outside of it and of its anchor.
 */
export class VividPopover extends LitElement {
  static override properties = {
    content: { attribute: false },
    label: {},
    open: { type: Boolean, reflect: true },
    _place: { state: true },
  };

  declare content?: TemplateResult;
  declare label?: string;
  declare open: boolean;
  declare _place?: { top: number; left: number; width: number; above: boolean };

  /** The element the panel hangs from. */
  anchor?: HTMLElement;
  private frame?: number;

  constructor() {
    super();
    this.open = false;
  }

  static override styles = [
    tokens,
    css`
      :host {
        position: fixed;
        inset: 0;
        z-index: 999;
        pointer-events: none;
        font-family: var(--ha-font-family-body, inherit);
        color: var(--primary-text-color);
        -webkit-font-smoothing: antialiased;
      }
      .panel {
        position: fixed;
        box-sizing: border-box;
        max-height: min(70vh, 560px);
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 8px;
        border-radius: 20px;
        background: var(--vivid-layer-0);
        border: 1px solid rgba(var(--vivid-rgb-text), 0.08);
        box-shadow: var(--vivid-popover-shadow, 0 16px 44px rgba(0, 0, 0, 0.35));
        pointer-events: auto;
        opacity: 0;
        transform: translateY(-6px) scale(0.98);
        transform-origin: top center;
        transition:
          opacity 0.16s ease,
          transform 0.16s ease;
      }
      .panel.above {
        transform-origin: bottom center;
        transform: translateY(6px) scale(0.98);
      }
      :host([open]) .panel {
        opacity: 1;
        transform: none;
      }
      @media (prefers-reduced-motion: reduce) {
        .panel {
          transition: none;
        }
      }
    `,
  ];

  /** Shows the panel under `anchor`. */
  show(anchor: HTMLElement): void {
    this.anchor = anchor;
    if (!this.isConnected) document.body.appendChild(this);
    this.place();
    document.addEventListener('pointerdown', this.onOutside, true);
    document.addEventListener('keydown', this.onKey, true);
    window.addEventListener('resize', this.onMove);
    document.addEventListener('scroll', this.onMove, true);
    requestAnimationFrame(() => (this.open = true));
  }

  hide(): void {
    this.open = false;
    document.removeEventListener('pointerdown', this.onOutside, true);
    document.removeEventListener('keydown', this.onKey, true);
    window.removeEventListener('resize', this.onMove);
    document.removeEventListener('scroll', this.onMove, true);
    window.setTimeout(() => {
      if (!this.open) this.remove();
    }, 180);
  }

  private readonly onOutside = (event: PointerEvent): void => {
    const path = event.composedPath();
    if (path.includes(this) || (this.anchor && path.includes(this.anchor))) return;
    fireEvent(this, 'vivid-popover-close-request');
  };

  private readonly onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      fireEvent(this, 'vivid-popover-close-request');
    }
  };

  private readonly onMove = (): void => {
    if (this.frame !== undefined) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = undefined;
      this.place();
    });
  };

  /** Under the anchor, centered on it and kept on screen; above it when there is no room. */
  private place(): void {
    const anchor = this.anchor;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(360, window.innerWidth - 2 * MARGIN);
    const center = rect.left + rect.width / 2;
    const left = Math.min(Math.max(center - width / 2, MARGIN), window.innerWidth - width - MARGIN);
    const height = this.renderRoot.querySelector('.panel')?.getBoundingClientRect().height ?? 240;
    const below = window.innerHeight - rect.bottom - GAP - MARGIN;
    const above = below < Math.min(height, 240) && rect.top > below;
    this._place = {
      left,
      width,
      top: above ? Math.max(MARGIN, rect.top - GAP - height) : rect.bottom + GAP,
      above,
    };
  }

  protected override updated(): void {
    // The height is known once the content is rendered: place again when it moves.
    const panel = this.renderRoot.querySelector('.panel');
    if (this._place?.above && panel) {
      const top = Math.max(
        MARGIN,
        (this.anchor?.getBoundingClientRect().top ?? 0) -
          GAP -
          panel.getBoundingClientRect().height,
      );
      if (Math.abs(top - this._place.top) > 1) this._place = { ...this._place, top };
    }
  }

  protected override render() {
    const place = this._place;
    if (!place) return nothing;
    return html`<div
      class="panel ${place.above ? 'above' : ''}"
      role="dialog"
      aria-label=${this.label ?? ''}
      style=${`top: ${place.top}px; left: ${place.left}px; width: ${place.width}px`}
    >
      ${this.content}
    </div>`;
  }
}

defineElement('vivid-popover', VividPopover);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-popover': VividPopover;
  }
}
