import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { fireEvent, haptic, setBrightness, setEffect, setHue, toggleEntity } from '../core/actions';
import { clamp, lightColor } from '../core/color';
import { isAvailable } from '../core/entities';
import type { HomeAssistant, LightAttributes } from '../core/hass-types';
import { defineElement } from '../core/register';
import { localize } from '../i18n';
import { tokens } from './shared-styles';
import './vivid-hue-slider';
import './vivid-select-chip';

const HOLD_MS = 500;
const SLIDE_THRESHOLD_PX = 8;
const SCROLL_THRESHOLD_PX = 10;
const PENDING_TIMEOUT_MS = 2000;
const KEY_STEP = 5;
const KEY_COMMIT_DELAY_MS = 400;
const COLOR_MODES = new Set(['hs', 'rgb', 'rgbw', 'rgbww', 'xy']);

type Gesture = {
  pointerId: number;
  startX: number;
  startY: number;
  sliding: boolean;
  cancelled: boolean;
  held: boolean;
  holdTimer?: number;
};

/**
 * Brightness tile for a light: drag horizontally to dim, tap to toggle, hold to
 * fire `vivid-hold` (`{ entityId }`). Optional effect picker and hue bar.
 */
export class VividLightTile extends LitElement {
  static override properties = {
    hass: { attribute: false },
    entityId: { attribute: 'entity-id' },
    icon: {},
    name: {},
    showName: { type: Boolean, attribute: 'show-name' },
    showEffects: { type: Boolean, attribute: 'show-effects' },
    showHue: { type: Boolean, attribute: 'show-hue' },
    _preview: { state: true },
  };

  declare hass?: HomeAssistant;
  declare entityId?: string;
  declare icon?: string;
  declare name?: string;
  declare showName: boolean;
  declare showEffects: boolean;
  declare showHue: boolean;
  /** Brightness shown while dragging or until Home Assistant confirms the change. */
  declare _preview?: number;

  private gesture?: Gesture;
  private pendingTimer?: number;
  private keyTimer?: number;

  constructor() {
    super();
    this.icon = 'mdi:led-strip-variant';
    this.showName = false;
    this.showEffects = true;
    this.showHue = true;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .tile {
        position: relative;
        overflow: hidden;
        isolation: isolate;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-surface);
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .fill {
        position: absolute;
        inset: 0 auto 0 0;
        width: var(--fill, 0%);
        background: rgba(var(--tile-rgb, 255, 214, 170), 0.42);
        z-index: -1;
        transition:
          width 0.25s ease,
          background-color 0.4s ease;
        pointer-events: none;
      }
      .tile.sliding .fill {
        transition: background-color 0.4s ease;
      }
      .surface {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 40px;
        border-radius: 16px;
        cursor: pointer;
        touch-action: pan-y;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .surface:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .icon {
        flex: none;
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: color-mix(
          in srgb,
          var(--ha-card-background, var(--card-background-color, #1c1c1c)) 72%,
          transparent
        );
        color: var(--vivid-muted);
        transition: color 0.4s ease;
      }
      .tile.on .icon {
        color: var(--primary-text-color);
      }
      .icon ha-icon {
        --mdc-icon-size: 22px;
        display: inline-flex;
      }
      .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1;
        line-height: 1.25;
      }
      .name {
        font-size: 14px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .state {
        font-size: 13px;
        color: var(--vivid-muted);
        font-variant-numeric: tabular-nums;
      }
      .tile.on .state {
        color: var(--primary-text-color);
      }
      vivid-select-chip {
        flex: 0 1 auto;
        max-width: 55%;
      }
      .tile.unavailable {
        opacity: 0.55;
      }
      .tile.unavailable .surface {
        cursor: default;
      }
      @media (prefers-reduced-motion: reduce) {
        .fill,
        .icon {
          transition: none;
        }
      }
    `,
  ];

  protected override shouldUpdate(changed: PropertyValues<this>): boolean {
    if (changed.size === 1 && changed.has('hass') && this.entityId) {
      const previous = changed.get('hass');
      return previous?.states[this.entityId] !== this.hass?.states[this.entityId];
    }
    return true;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('hass') && this.gesture === undefined && this.keyTimer === undefined) {
      const previous = changed.get('hass');
      if (this.entityId && previous?.states[this.entityId] !== this.hass?.states[this.entityId]) {
        this._preview = undefined;
      }
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resetGesture();
    window.clearTimeout(this.pendingTimer);
    window.clearTimeout(this.keyTimer);
  }

  private get stateObj() {
    return this.entityId ? this.hass?.states[this.entityId] : undefined;
  }

  private get available(): boolean {
    return isAvailable(this.stateObj);
  }

  private currentBrightness(): number {
    const state = this.stateObj;
    if (!state || state.state !== 'on') return 0;
    const raw = (state.attributes as LightAttributes).brightness;
    return typeof raw === 'number' ? Math.round((raw / 255) * 100) : 100;
  }

  private percentAt(clientX: number): number {
    const rect = this.renderRoot.querySelector('.tile')?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.round(clamp((clientX - rect.left) / rect.width, 0, 1) * 100);
  }

  private holdPending(): void {
    window.clearTimeout(this.pendingTimer);
    this.pendingTimer = window.setTimeout(() => (this._preview = undefined), PENDING_TIMEOUT_MS);
  }

  private commitBrightness(percent: number): void {
    if (!this.hass || !this.entityId) return;
    this._preview = percent;
    this.holdPending();
    void setBrightness(this.hass, this.entityId, percent);
  }

  private resetGesture(): void {
    if (this.gesture?.holdTimer !== undefined) window.clearTimeout(this.gesture.holdTimer);
    this.gesture = undefined;
    this.renderRoot.querySelector('.tile')?.classList.remove('sliding');
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (!this.available || event.button !== 0 || this.gesture) return;
    const gesture: Gesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      sliding: false,
      cancelled: false,
      held: false,
    };
    gesture.holdTimer = window.setTimeout(() => {
      if (!this.gesture || this.gesture.sliding || this.gesture.cancelled) return;
      this.gesture.held = true;
      haptic(this, 'medium');
      fireEvent(this, 'vivid-hold', { entityId: this.entityId });
    }, HOLD_MS);
    this.gesture = gesture;
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      // Synthetic events cannot be captured; the gesture still works without it.
    }
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const gesture = this.gesture;
    if (!gesture || event.pointerId !== gesture.pointerId || gesture.cancelled || gesture.held) {
      return;
    }
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (!gesture.sliding) {
      if (Math.abs(dy) > SCROLL_THRESHOLD_PX && Math.abs(dy) > Math.abs(dx)) {
        gesture.cancelled = true;
        window.clearTimeout(gesture.holdTimer);
        return;
      }
      if (Math.abs(dx) < SLIDE_THRESHOLD_PX) return;
      gesture.sliding = true;
      window.clearTimeout(gesture.holdTimer);
      this.renderRoot.querySelector('.tile')?.classList.add('sliding');
    }
    this._preview = this.percentAt(event.clientX);
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    const gesture = this.gesture;
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    this.resetGesture();
    if (gesture.sliding) {
      haptic(this, 'light');
      this.commitBrightness(this.percentAt(event.clientX));
      return;
    }
    if (!gesture.cancelled && !gesture.held && this.hass && this.entityId) {
      haptic(this, 'light');
      void toggleEntity(this.hass, this.entityId);
    }
  };

  private readonly onPointerCancel = (event: PointerEvent): void => {
    if (event.pointerId !== this.gesture?.pointerId) return;
    this.resetGesture();
    this._preview = undefined;
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (!this.available || !this.hass || !this.entityId) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      void toggleEntity(this.hass, this.entityId);
      return;
    }
    const current = this._preview ?? this.currentBrightness();
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowUp'
        ? current + KEY_STEP
        : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
          ? current - KEY_STEP
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? 100
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    this._preview = clamp(next, 0, 100);
    window.clearTimeout(this.keyTimer);
    this.keyTimer = window.setTimeout(() => {
      this.keyTimer = undefined;
      if (this._preview !== undefined) this.commitBrightness(this._preview);
    }, KEY_COMMIT_DELAY_MS);
  };

  private readonly onEffectChanged = (event: CustomEvent<{ value: string }>): void => {
    if (this.hass && this.entityId) void setEffect(this.hass, this.entityId, event.detail.value);
  };

  private readonly onHueChanged = (event: CustomEvent<{ hue: number }>): void => {
    if (!this.hass || !this.entityId) return;
    const hs = (this.stateObj?.attributes as LightAttributes | undefined)?.hs_color;
    const saturation = Array.isArray(hs) && typeof hs[1] === 'number' && hs[1] > 0 ? hs[1] : 100;
    void setHue(this.hass, this.entityId, event.detail.hue, saturation);
  };

  protected override render() {
    const state = this.stateObj;
    if (!state) return nothing;
    const attributes = state.attributes as LightAttributes;
    const available = this.available;
    const isOn = available && state.state === 'on';
    const brightness = this._preview ?? this.currentBrightness();
    const rgb = lightColor(state);
    const effects = Array.isArray(attributes.effect_list) ? attributes.effect_list : [];
    const supportsColor = (attributes.supported_color_modes ?? []).some((m) => COLOR_MODES.has(m));
    const hs = attributes.hs_color;
    const hue = isOn && Array.isArray(hs) && typeof hs[0] === 'number' ? hs[0] : undefined;
    const lit = isOn || (this._preview !== undefined && this._preview > 0);

    const stateText = !available
      ? localize(this.hass, 'unavailable')
      : lit
        ? `${brightness} %`
        : localize(this.hass, 'off');

    const tileStyle = styleMap({
      '--fill': lit ? `${brightness}%` : '0%',
      '--tile-rgb': rgb ? rgb.join(', ') : undefined,
    });

    return html`<div
      class=${classMap({ tile: true, on: lit, unavailable: !available })}
      style=${tileStyle}
    >
      <div class="fill"></div>
      <div
        class="surface"
        role="slider"
        tabindex=${available ? 0 : -1}
        aria-label=${`${this.name ?? ''} ${localize(this.hass, 'brightness')}`.trim()}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow=${brightness}
        aria-valuetext=${stateText}
        aria-disabled=${String(!available)}
        @pointerdown=${this.onPointerDown}
        @pointermove=${this.onPointerMove}
        @pointerup=${this.onPointerUp}
        @pointercancel=${this.onPointerCancel}
        @keydown=${this.onKeyDown}
        @contextmenu=${(event: Event) => event.preventDefault()}
      >
        <div class="icon"><ha-icon .icon=${this.icon}></ha-icon></div>
        <div class="text">
          ${this.showName && this.name ? html`<span class="name">${this.name}</span>` : nothing}
          <span class="state">${stateText}</span>
        </div>
        ${
          this.showEffects && effects.length > 0
            ? html`<vivid-select-chip
                .icon=${'mdi:format-list-bulleted'}
                .value=${attributes.effect ?? undefined}
                .options=${effects}
                .tooltip=${localize(this.hass, 'effect')}
                ?disabled=${!available}
                @value-changed=${this.onEffectChanged}
              ></vivid-select-chip>`
            : nothing
        }
      </div>
      ${
        this.showHue && supportsColor
          ? html`<vivid-hue-slider
              .hue=${hue}
              .label=${localize(this.hass, 'hue')}
              ?dimmed=${!isOn}
              ?disabled=${!available}
              @hue-changed=${this.onHueChanged}
            ></vivid-hue-slider>`
          : nothing
      }
    </div>`;
  }
}

defineElement('vivid-light-tile', VividLightTile);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-light-tile': VividLightTile;
  }
}
