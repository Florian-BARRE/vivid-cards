import {
  LitElement,
  css,
  html,
  nothing,
  type CSSResultGroup,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { runAction, type ActionConfig } from '../../core/action-handler';
import { haptic, openMoreInfo } from '../../core/actions';
import { GLOW_REFERENCE_PX, glowSize, glowVars, type ChipTone } from '../../core/glow';
import type { HomeAssistant } from '../../core/hass-types';
import { buttonReset, tokens } from '../../components/shared-styles';
import { VividPopover } from '../../components/vivid-popover';
import { watchedChanged } from '../../cards/led-group/model';
import type { BadgeLook, ResolvedBaseBadge } from './config';

const HOLD_MS = 500;
const MOVE_TOLERANCE_PX = 10;
/** Durations on badges ("open for 12 min") refresh at this pace. */
const TICK_MS = 30_000;
/** Diameter (px) of the icon disc, where the halo of the disc look sits. */
const DISC_PX = 28;

/** What the badge shows, computed from `hass` and the config by each badge. */
export interface BadgeView {
  /** Title of the details and of the tooltip. */
  name: string;
  /** Colored and haloed; greyed otherwise. */
  active: boolean;
  icon: string;
  /** Draw a stroke across the icon (no crossed-out variant exists). */
  strike?: boolean;
  /** Next to the icon; nothing when undefined. */
  text?: string;
  /** Text in the secondary color ("0/7", a stale duration). */
  textMuted?: boolean;
  /** CSS values while active. */
  tone?: ChipTone;
  /** Translucent tone: in the pill look it lies over the badge background. */
  soft?: boolean;
  /** Duration of the pulse ring around the icon; no pulse when undefined. */
  pulse?: string;
  /** 0–1: a gauge ring around the icon. */
  ring?: number;
  ringColor?: string;
  /** Tooltip and accessible state ("2/7 open"). */
  state: string;
  /** Entities read: other state changes do not render. */
  watched: string[];
  /** The view depends on the time (durations): render it again regularly. */
  ticking?: boolean;
  /** Nothing can be read: the badge is dimmed. */
  unavailable?: boolean;
  /** What 100 % of `glow` is for this badge, as a share of the common halo (1). */
  glowScale?: number;
}

/** CSS variables of a view for a look. */
export function lookVars(
  view: BadgeView,
  look: BadgeLook,
  glow: number,
): Record<string, string | undefined> {
  const vars: Record<string, string | undefined> = {
    ...glowVars(glow * (view.glowScale ?? 1)),
    // The pill glows around the whole badge, the disc around its icon.
    '--vivid-glow-size': glowSize(look === 'pill' ? GLOW_REFERENCE_PX : DISC_PX),
  };
  const tone = view.active ? view.tone : undefined;
  if (!tone) return vars;
  // White ink only: dark ink is chosen precisely because the surface is light.
  if (tone.iconColor === '#ffffff') {
    vars['--badge-ink-shadow'] = 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35))';
    vars['--badge-text-shadow'] = '0 1px 2px rgba(0, 0, 0, 0.35)';
  }
  if (view.pulse) vars['--pulse-duration'] = view.pulse;
  if (look === 'pill') {
    return {
      ...vars,
      // A translucent fill lies over the badge's own background.
      '--badge-bg': view.soft
        ? `linear-gradient(${tone.background}, ${tone.background}), var(--ha-card-background, var(--card-background-color, #1c1c1c))`
        : tone.background,
      // Text on a translucent fill leans further towards the text color to stay readable.
      '--badge-color': view.soft
        ? `color-mix(in srgb, ${tone.iconColor} 70%, var(--primary-text-color, #ffffff))`
        : tone.iconColor,
      '--badge-shadow': tone.shadow,
      '--badge-border': 'transparent',
      '--badge-weight': '600',
      '--icon-color': tone.iconColor,
    };
  }
  return {
    ...vars,
    '--icon-bg': tone.background,
    '--icon-color': tone.iconColor,
    '--icon-shadow': tone.shadow,
  };
}

/**
 * Base of the Vivid badges: a pill for the badge bar with an icon disc and a
 * short text, tap and hold gestures, and details opened under the badge.
 *
 * A badge implements `resolveConfig`, `buildView` and `renderDetails`;
 * `toggle` handles the `toggle` action when the badge can switch something.
 */
export abstract class VividBadge<C extends ResolvedBaseBadge> extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _open: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: C;
  declare _open: boolean;

  protected view?: BadgeView;
  private detailsPopover?: VividPopover;
  private press?: { x: number; y: number; timer: number; held: boolean; pointerId: number };
  private ticker?: number;

  constructor() {
    super();
    this._open = false;
  }

  protected abstract resolveConfig(raw: unknown): C;
  protected abstract buildView(hass: HomeAssistant, config: C): BadgeView;
  protected abstract renderDetails(): TemplateResult;

  /** Handles the `toggle` action; badges that cannot switch anything leave it to HA. */
  protected toggle?(): void;

  /** Called when the details open (to fetch history, say). */
  protected detailsOpened?(): void;

  setConfig(config: unknown): void {
    this._config = this.resolveConfig(config);
  }

  static override styles: CSSResultGroup = [
    tokens,
    buttonReset,
    css`
      :host {
        display: inline-flex;
        --vivid-badge-size: var(--ha-badge-size, 36px);
      }
      .badge {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: var(--vivid-badge-size);
        min-width: var(--vivid-badge-size);
        padding: 0 4px;
        border-radius: var(--ha-badge-border-radius, calc(var(--vivid-badge-size) / 2));
        background: var(
          --badge-bg,
          var(--ha-card-background, var(--card-background-color, #1c1c1c))
        );
        border: var(--ha-card-border-width, 1px) solid
          var(
            --badge-border,
            var(--ha-card-border-color, var(--divider-color, rgba(255, 255, 255, 0.12)))
          );
        box-shadow: var(--badge-shadow, none);
        color: var(--badge-color, var(--primary-text-color));
        font-size: var(--ha-badge-font-size, 12px);
        font-weight: var(--badge-weight, 500);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        transition:
          box-shadow 0.4s ease,
          transform 0.12s ease;
      }
      .badge.text {
        padding-right: 12px;
      }
      .badge:active {
        transform: scale(0.96);
      }
      .badge:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .badge[aria-expanded='true'] {
        border-color: rgba(var(--vivid-rgb-text), 0.35);
      }
      .icon {
        position: relative;
        display: grid;
        place-items: center;
        width: calc(var(--vivid-badge-size) - 8px);
        height: calc(var(--vivid-badge-size) - 8px);
        border-radius: 50%;
        background: var(--icon-bg, transparent);
        box-shadow: var(--icon-shadow, none);
        color: var(--icon-color, var(--disabled-text-color, rgba(255, 255, 255, 0.4)));
        transition:
          background 0.4s ease,
          box-shadow 0.4s ease,
          color 0.4s ease;
      }
      .icon ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
      }
      .ring {
        position: absolute;
        inset: -1px;
        width: calc(100% + 2px);
        height: calc(100% + 2px);
        transform: rotate(-90deg);
        pointer-events: none;
      }
      .ring circle {
        fill: none;
        stroke-width: 2.4;
      }
      .ring .track {
        stroke: rgba(var(--vivid-rgb-text), 0.12);
      }
      .ring .level {
        stroke: var(--ring-color, currentColor);
        stroke-linecap: round;
        transition: stroke-dasharray 0.6s ease;
      }
      /* A ring growing and fading from the icon: alerts and live presence. */
      .pulse .icon::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        border: 2px solid currentColor;
        opacity: 0;
        animation: vivid-badge-pulse var(--pulse-duration, 2s) ease-out infinite;
        animation-play-state: var(--vivid-glow-play, running);
      }
      @keyframes vivid-badge-pulse {
        0% {
          transform: scale(0.85);
          opacity: 0.55;
        }
        100% {
          transform: scale(1.45);
          opacity: 0;
        }
      }
      /* White on a gradient that may hold a white light: a soft shadow keeps it readable. */
      .active .icon ha-icon {
        filter: var(--badge-ink-shadow, none);
      }
      .active.pill {
        text-shadow: var(--badge-text-shadow, none);
      }
      /* A drawn stroke for icons without a crossed-out variant. */
      .strike {
        position: absolute;
        width: 22px;
        height: 2px;
        border-radius: 1px;
        background: currentColor;
        transform: rotate(-45deg);
        box-shadow: 0 0 0 1.5px var(--ha-card-background, var(--card-background-color, #1c1c1c));
      }
      .muted {
        color: var(--secondary-text-color);
      }
      .unavailable {
        opacity: 0.5;
      }
      @media (prefers-reduced-motion: reduce) {
        .badge,
        .icon {
          transition: none;
        }
        .pulse .icon::after {
          animation: none;
        }
      }
    `,
  ];

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.closeDetails();
    this.cancelPress();
    this.stopTicker();
  }

  protected override shouldUpdate(changed: PropertyValues<this>): boolean {
    if (!this.hass || !this._config) return changed.has('_config');
    if (changed.size === 1 && changed.has('hass')) {
      return watchedChanged(changed.get('hass'), this.hass, this.view?.watched ?? []);
    }
    return true;
  }

  protected override willUpdate(): void {
    if (this.hass && this._config) this.view = this.buildView(this.hass, this._config);
  }

  protected override updated(): void {
    if (this._open) this.refreshDetails();
    if (this.view?.ticking && this.isConnected) this.startTicker();
    else this.stopTicker();
  }

  private startTicker(): void {
    this.ticker ??= window.setInterval(() => this.requestUpdate(), TICK_MS);
  }

  private stopTicker(): void {
    if (this.ticker !== undefined) window.clearInterval(this.ticker);
    this.ticker = undefined;
  }

  /* -------------------------------- gestures -------------------------------- */

  private cancelPress(): void {
    if (this.press) window.clearTimeout(this.press.timer);
    this.press = undefined;
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    this.cancelPress();
    const press = {
      x: event.clientX,
      y: event.clientY,
      held: false,
      pointerId: event.pointerId,
      timer: window.setTimeout(() => {
        press.held = true;
        this.run('hold');
      }, HOLD_MS),
    };
    this.press = press;
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const press = this.press;
    if (!press || event.pointerId !== press.pointerId) return;
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > MOVE_TOLERANCE_PX) {
      this.cancelPress();
    }
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    const press = this.press;
    if (!press || event.pointerId !== press.pointerId) return;
    this.cancelPress();
    if (!press.held) this.run('tap');
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.run('tap');
    } else if (event.key === 'ArrowDown' || event.key === 'ContextMenu') {
      event.preventDefault();
      this.run('hold');
    }
  };

  private run(which: 'tap' | 'hold'): void {
    const config = this._config;
    if (!config || !this.hass) return;
    const action: ActionConfig = which === 'tap' ? config.tapAction : config.holdAction;
    haptic(this, which === 'hold' ? 'medium' : 'light');
    if (action.action === 'toggle' && this.toggle) {
      this.toggle();
      return;
    }
    runAction(action, {
      node: this,
      hass: this.hass,
      entityId: config.entity ?? config.entities?.[0] ?? '',
      openDetails: () => this.toggleDetails(),
    });
  }

  /* --------------------------------- details -------------------------------- */

  private toggleDetails(): void {
    if (this._open) this.closeDetails();
    else this.openDetails();
  }

  private openDetails(): void {
    const anchor = this.renderRoot.querySelector<HTMLElement>('.badge');
    if (!anchor) return;
    if (!this.detailsPopover) {
      this.detailsPopover = new VividPopover();
      this.detailsPopover.addEventListener('vivid-popover-close-request', () =>
        this.closeDetails(),
      );
      this.detailsPopover.addEventListener('vivid-more-info', ((
        event: CustomEvent<{ entityId: string }>,
      ) => {
        this.closeDetails();
        openMoreInfo(this, event.detail.entityId);
      }) as EventListener);
    }
    this._open = true;
    this.detailsOpened?.();
    this.refreshDetails();
    this.detailsPopover.show(anchor);
  }

  protected closeDetails(): void {
    if (!this._open) return;
    this._open = false;
    this.detailsPopover?.hide();
  }

  /** Renders the details again (after an async fetch, say). */
  protected refreshDetails(): void {
    const popover = this.detailsPopover;
    if (!popover || !this.view || !this._config) return;
    const scale = this.view.glowScale ?? 1;
    for (const [name, value] of Object.entries(glowVars(this._config.glow * scale))) {
      popover.style.setProperty(name, value);
    }
    popover.label = this.view.name;
    popover.content = this.renderDetails();
  }

  /* --------------------------------- render --------------------------------- */

  private renderRing(view: BadgeView) {
    if (view.ring === undefined) return nothing;
    const radius = 13;
    const length = 2 * Math.PI * radius;
    const filled = Math.max(0, Math.min(1, view.ring)) * length;
    return html`<svg class="ring" viewBox="0 0 30 30" aria-hidden="true">
      <circle class="track" cx="15" cy="15" r=${radius}></circle>
      <circle
        class="level"
        cx="15"
        cy="15"
        r=${radius}
        style=${styleMap({ '--ring-color': view.ringColor })}
        stroke-dasharray=${`${filled.toFixed(1)} ${length.toFixed(1)}`}
      ></circle>
    </svg>`;
  }

  protected override render() {
    const config = this._config;
    const view = this.view;
    if (!config || !this.hass || !view) return nothing;
    const label = `${view.name} · ${view.state}`;
    return html`<button
      type="button"
      class=${classMap({
        reset: true,
        badge: true,
        text: view.text !== undefined,
        active: view.active,
        pill: config.look === 'pill',
        pulse: view.active && view.pulse !== undefined,
        unavailable: Boolean(view.unavailable),
      })}
      style=${styleMap(lookVars(view, config.look, config.glow))}
      title=${label}
      aria-label=${label}
      aria-haspopup="dialog"
      aria-expanded=${String(this._open)}
      @pointerdown=${this.onPointerDown}
      @pointermove=${this.onPointerMove}
      @pointerup=${this.onPointerUp}
      @pointercancel=${() => this.cancelPress()}
      @pointerleave=${() => this.cancelPress()}
      @keydown=${this.onKeyDown}
      @contextmenu=${(event: Event) => event.preventDefault()}
    >
      <span class="icon">
        ${this.renderRing(view)}
        <ha-icon .icon=${view.icon}></ha-icon>
        ${view.strike ? html`<span class="strike"></span>` : nothing}
      </span>
      ${
        view.text !== undefined
          ? html`<span class=${view.textMuted ? 'label muted' : 'label'}>${view.text}</span>`
          : nothing
      }
    </button>`;
  }
}
