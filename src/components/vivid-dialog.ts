import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { fireEvent } from '../core/actions';
import { defineElement } from '../core/register';
import { buttonReset, tokens } from './shared-styles';

const CLOSE_ANIMATION_MS = 220;
const SWIPE_CLOSE_PX = 90;

/**
 * Modal sheet mounted on `document.body`, so no dashboard layout can clip it.
 * Bottom sheet on narrow screens, centered panel otherwise. Closes on backdrop
 * click, Escape and a downward swipe on the handle; it only fires
 * `vivid-dialog-close-request` — the owner decides when to call `hide()`.
 */
export class VividDialog extends LitElement {
  static override properties = {
    label: {},
    content: { attribute: false },
    open: { type: Boolean, reflect: true },
    closeLabel: { attribute: 'close-label' },
  };

  declare label?: string;
  declare content?: TemplateResult;
  declare open: boolean;
  declare closeLabel?: string;

  private hideTimer?: number;
  private previousFocus?: Element | null;
  private previousOverflow = '';
  private swipe?: { pointerId: number; startY: number; offset: number };

  constructor() {
    super();
    this.open = false;
  }

  static override styles = [
    tokens,
    buttonReset,
    css`
      :host {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: block;
        pointer-events: none;
        font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, inherit));
        color: var(--primary-text-color);
        -webkit-font-smoothing: antialiased;
      }
      :host([open]) {
        pointer-events: auto;
      }
      .backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        opacity: 0;
        transition: opacity ${CLOSE_ANIMATION_MS}ms ease;
      }
      :host([open]) .backdrop {
        opacity: 1;
      }
      .sheet {
        position: absolute;
        left: 50%;
        top: 50%;
        box-sizing: border-box;
        width: min(560px, calc(100vw - 32px));
        max-height: min(86vh, 900px);
        display: flex;
        flex-direction: column;
        border-radius: var(--vivid-card-radius, 28px);
        background: var(--ha-card-background, var(--card-background-color, #1c1c1c));
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
        opacity: 0;
        transform: translate(-50%, calc(-50% + 24px)) scale(0.98);
        transition:
          opacity ${CLOSE_ANIMATION_MS}ms ease,
          transform ${CLOSE_ANIMATION_MS}ms ease;
        outline: none;
      }
      :host([open]) .sheet {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
      .handle {
        flex: none;
        display: flex;
        justify-content: center;
        padding: 10px 0 2px;
        touch-action: none;
        cursor: grab;
      }
      .handle span {
        width: 40px;
        height: 4px;
        border-radius: 2px;
        background: rgba(var(--vivid-rgb-text), 0.22);
      }
      .close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }
      .close:focus-visible {
        width: auto;
        height: auto;
        clip-path: none;
        padding: 6px 10px;
        border-radius: 12px;
        background: var(--vivid-chip-surface);
      }
      .body {
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 6px 16px 20px;
      }
      @media (max-width: 600px) {
        .sheet {
          left: 0;
          right: 0;
          top: auto;
          bottom: 0;
          width: 100%;
          max-height: 90vh;
          border-radius: var(--vivid-card-radius, 28px) var(--vivid-card-radius, 28px) 0 0;
          transform: translateY(100%);
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        :host([open]) .sheet {
          transform: translateY(var(--swipe-offset, 0px));
        }
        .body {
          padding: 4px 12px 16px;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .backdrop,
        .sheet {
          transition: none;
        }
      }
    `,
  ];

  /** Mounts the dialog on `document.body` and animates it in. */
  show(): void {
    window.clearTimeout(this.hideTimer);
    if (!this.isConnected) {
      this.previousFocus = document.activeElement;
      this.previousOverflow = document.body.style.overflow;
      document.body.appendChild(this);
      document.body.style.overflow = 'hidden';
    }
    requestAnimationFrame(() => {
      this.open = true;
      void this.updateComplete.then(() => {
        (this.renderRoot.querySelector('.sheet') as HTMLElement | null)?.focus({
          preventScroll: true,
        });
      });
    });
  }

  /** Animates out, then unmounts. */
  hide(): void {
    if (!this.isConnected) return;
    this.open = false;
    window.clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => this.unmount(), CLOSE_ANIMATION_MS);
  }

  /** Unmounts immediately (owner disconnected). */
  unmount(): void {
    window.clearTimeout(this.hideTimer);
    if (!this.isConnected) return;
    this.open = false;
    document.body.style.overflow = this.previousOverflow;
    this.remove();
    if (this.previousFocus instanceof HTMLElement && this.previousFocus.isConnected) {
      this.previousFocus.focus({ preventScroll: true });
    }
  }

  private readonly requestClose = (): void => {
    fireEvent(this, 'vivid-dialog-close-request');
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.requestClose();
    }
  };

  private setSwipeOffset(offset: number): void {
    this.style.setProperty('--swipe-offset', `${offset}px`);
  }

  private readonly onHandleDown = (event: PointerEvent): void => {
    this.swipe = { pointerId: event.pointerId, startY: event.clientY, offset: 0 };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    const sheet = this.renderRoot.querySelector('.sheet') as HTMLElement | null;
    if (sheet) sheet.style.transition = 'none';
  };

  private readonly onHandleMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.swipe?.pointerId) return;
    this.swipe.offset = Math.max(0, event.clientY - this.swipe.startY);
    this.setSwipeOffset(this.swipe.offset);
  };

  private readonly onHandleUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.swipe?.pointerId) return;
    const close = this.swipe.offset > SWIPE_CLOSE_PX;
    this.swipe = undefined;
    const sheet = this.renderRoot.querySelector('.sheet') as HTMLElement | null;
    if (sheet) sheet.style.transition = '';
    this.setSwipeOffset(0);
    if (close) this.requestClose();
  };

  protected override render() {
    return html`<div class="backdrop" @click=${this.requestClose}></div>
      <div
        class="sheet"
        role="dialog"
        aria-modal="true"
        aria-label=${ifDefined(this.label)}
        tabindex="-1"
        @keydown=${this.onKeyDown}
      >
        <div
          class="handle"
          @pointerdown=${this.onHandleDown}
          @pointermove=${this.onHandleMove}
          @pointerup=${this.onHandleUp}
          @pointercancel=${this.onHandleUp}
        >
          <span></span>
        </div>
        <button type="button" class="reset close" @click=${this.requestClose}>
          ${this.closeLabel ?? 'Close'}
        </button>
        <div class="body">${this.content ?? nothing}</div>
      </div>`;
  }
}

defineElement('vivid-dialog', VividDialog);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-dialog': VividDialog;
  }
}
