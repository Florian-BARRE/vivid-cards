import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  applyColor,
  fireEvent,
  haptic,
  setBrightness,
  setColorTemperature,
  setEffect,
  setHue,
  type ColorPreset,
  type LightCallOptions,
} from '../core/actions';
import type { BadgeModel } from '../core/badges';
import { clamp, colorDistance, kelvinToRgb, lightColor, rgbCss } from '../core/color';
import { activeTone } from '../core/glow';
import { isAvailable } from '../core/entities';
import type { HomeAssistant, LightAttributes } from '../core/hass-types';
import { temperatureRange, type ColorBar } from '../core/light';
import { defineElement } from '../core/register';
import { localize } from '../i18n';
import { tokens } from './shared-styles';
import './vivid-chip';
import './vivid-color-bar';
import './vivid-select-chip';

const HOLD_MS = 500;
/** Saturation (%) sent with a hue picked on the color bar. */
const FULL_SATURATION = 100;
const SLIDE_THRESHOLD_PX = 8;
const SCROLL_THRESHOLD_PX = 10;
const PENDING_TIMEOUT_MS = 2000;
const KEY_STEP = 5;
const KEY_COMMIT_DELAY_MS = 400;
const DOUBLE_TAP_MS = 250;

export type TileGesture = 'tap' | 'hold' | 'double_tap';

type Gesture = {
  pointerId: number;
  startX: number;
  startY: number;
  sliding: boolean;
  cancelled: boolean;
  held: boolean;
  holdTimer?: number;
};

/** Close enough to count as the current color of the light. */
const SAME_COLOR_DISTANCE = 24;

/** Brightness actually sent for a drag to `percent` (0 turns off). */
export function snapBrightness(percent: number, min = 1, step = 1): number {
  if (percent <= 0) return 0;
  const stepped = step > 1 ? Math.round(percent / step) * step : Math.round(percent);
  return clamp(Math.max(stepped, min, 1), 1, 100);
}

/**
 * Brightness tile for a light. Dragging horizontally dims it; taps, holds and
 * double taps are reported as `vivid-gesture` (`{ gesture, entityId }`) so the
 * card decides what they do. Optional effect picker, color bar and favorite
 * colors, and entity badges next to the state.
 */
export class VividLightTile extends LitElement {
  static override properties = {
    hass: { attribute: false },
    entityId: { attribute: 'entity-id' },
    icon: {},
    name: {},
    showName: { type: Boolean, attribute: 'show-name' },
    showEffects: { type: Boolean, attribute: 'show-effects' },
    showState: { type: Boolean, attribute: 'show-state' },
    colorBar: { attribute: 'color-bar' },
    doubleTap: { type: Boolean, attribute: 'double-tap' },
    favorites: { attribute: false },
    badges: { attribute: false },
    brightnessMin: { type: Number, attribute: 'brightness-min' },
    brightnessStep: { type: Number, attribute: 'brightness-step' },
    lightOptions: { attribute: false },
    animateEffects: { type: Boolean, attribute: 'animate-effects' },
    _preview: { state: true },
  };

  declare hass?: HomeAssistant;
  declare entityId?: string;
  declare icon?: string;
  declare name?: string;
  declare showName: boolean;
  declare showEffects: boolean;
  declare showState: boolean;
  declare colorBar: ColorBar;
  /** Waits for a possible second tap before reporting a tap. */
  declare doubleTap: boolean;
  declare favorites: ColorPreset[];
  /** Entity badges shown next to the state; a tap opens their dialog. */
  declare badges: BadgeModel[];
  declare brightnessMin: number;
  declare brightnessStep: number;
  declare lightOptions?: LightCallOptions;
  /** Shimmer while an effect runs. */
  declare animateEffects: boolean;
  /** Brightness shown while dragging or until Home Assistant confirms the change. */
  declare _preview?: number;

  private gesture?: Gesture;
  private pendingTimer?: number;
  private keyTimer?: number;
  private tapTimer?: number;

  constructor() {
    super();
    this.icon = 'mdi:led-strip-variant';
    this.showName = false;
    this.showEffects = true;
    this.showState = true;
    this.colorBar = 'hue';
    this.doubleTap = false;
    this.favorites = [];
    this.badges = [];
    this.brightnessMin = 1;
    this.brightnessStep = 1;
    this.animateEffects = true;
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
        background: var(--vivid-layer-1);
        --vivid-chip-context: var(--vivid-layer-2);
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
      .tile.effect .fill::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          100deg,
          transparent 20%,
          rgba(255, 255, 255, 0.16) 45%,
          rgba(var(--tile-rgb, 255, 214, 170), 0.35) 55%,
          transparent 80%
        );
        background-size: 250% 100%;
        animation: vivid-shimmer 3.2s ease-in-out infinite;
      }
      @keyframes vivid-shimmer {
        0% {
          background-position: 120% 0;
        }
        100% {
          background-position: -120% 0;
        }
      }
      .favorites {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 2px;
      }
      .swatch {
        appearance: none;
        border: none;
        margin: 0;
        padding: 0;
        width: calc(var(--vivid-chip-height) - 6px);
        height: calc(var(--vivid-chip-height) - 6px);
        border-radius: 50%;
        background: var(--swatch);
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.18);
        cursor: pointer;
        position: relative;
        transition: transform 0.12s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .swatch:active {
        transform: scale(0.9);
      }
      .swatch:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .swatch.current {
        box-shadow:
          0 0 0 2px var(--vivid-layer-1),
          0 0 0 4px var(--primary-text-color);
      }
      .swatch .level {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: 10px;
        font-weight: 700;
        color: var(--level-color);
      }
      .badges {
        display: flex;
        gap: 6px;
        flex: 0 1 auto;
        min-width: 0;
        overflow: hidden;
      }
      .swatch:disabled {
        opacity: 0.45;
        cursor: default;
      }
      .surface {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: calc(var(--vivid-chip-height) + 4px);
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
        width: calc(var(--vivid-chip-height) + 4px);
        height: calc(var(--vivid-chip-height) + 4px);
        border-radius: 50%;
        background: var(--vivid-layer-2);
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
        .icon,
        .swatch {
          transition: none;
        }
        .tile.effect .fill::after {
          animation: none;
          display: none;
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
    window.clearTimeout(this.tapTimer);
  }

  private emit(gesture: TileGesture): void {
    haptic(this, gesture === 'hold' ? 'medium' : 'light');
    fireEvent(this, 'vivid-gesture', { gesture, entityId: this.entityId });
  }

  private tap(): void {
    if (!this.doubleTap) {
      this.emit('tap');
      return;
    }
    if (this.tapTimer !== undefined) {
      window.clearTimeout(this.tapTimer);
      this.tapTimer = undefined;
      this.emit('double_tap');
      return;
    }
    this.tapTimer = window.setTimeout(() => {
      this.tapTimer = undefined;
      this.emit('tap');
    }, DOUBLE_TAP_MS);
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

  private snap(percent: number): number {
    return snapBrightness(percent, this.brightnessMin, this.brightnessStep);
  }

  private commitBrightness(percent: number): void {
    if (!this.hass || !this.entityId) return;
    const value = this.snap(percent);
    this._preview = value;
    this.holdPending();
    void setBrightness(this.hass, this.entityId, value, this.lightOptions);
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
      this.emit('hold');
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
    this._preview = this.snap(this.percentAt(event.clientX));
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
    if (!gesture.cancelled && !gesture.held) this.tap();
  };

  private readonly onPointerCancel = (event: PointerEvent): void => {
    if (event.pointerId !== this.gesture?.pointerId) return;
    this.resetGesture();
    this._preview = undefined;
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    // Keys pressed on a badge or the effect picker belong to them.
    if (event.target !== event.currentTarget) return;
    if (!this.available || !this.hass || !this.entityId) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.emit('tap');
      return;
    }
    const current = this._preview ?? this.currentBrightness();
    const step = Math.max(this.brightnessStep, KEY_STEP);
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowUp'
        ? current + step
        : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
          ? current - step
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
    if (this.hass && this.entityId) {
      void setEffect(this.hass, this.entityId, event.detail.value);
    }
  };

  private readonly onColorChanged = (event: CustomEvent<{ value: number }>): void => {
    if (!this.hass || !this.entityId) return;
    if (this.colorBar === 'temperature') {
      void setColorTemperature(this.hass, this.entityId, event.detail.value, this.lightOptions);
      return;
    }
    // The bar shows fully saturated hues: send exactly that. Keeping the light's
    // current saturation made every color pale after a white or a pastel favorite.
    void setHue(this.hass, this.entityId, event.detail.value, FULL_SATURATION, this.lightOptions);
  };

  private renderBadges() {
    if (this.badges.length === 0) return nothing;
    return html`<div class="badges" @pointerdown=${(event: Event) => event.stopPropagation()}>
      ${this.badges.map(
        (badge) =>
          html`<vivid-chip
            .icon=${badge.icon}
            .label=${badge.label}
            .tooltip=${badge.label ? `${badge.name} : ${badge.label}` : badge.name}
            .tone=${badge.label === undefined ? activeTone(badge.active) : undefined}
            ?disabled=${!badge.available}
            @click=${(event: Event) => {
              event.stopPropagation();
              fireEvent(this, 'vivid-more-info', { entityId: badge.entityId });
            }}
          ></vivid-chip>`,
      )}
    </div>`;
  }

  private applyFavorite(preset: ColorPreset): void {
    if (!this.hass || !this.entityId) return;
    haptic(this, 'light');
    void applyColor(this.hass, this.entityId, preset, this.lightOptions);
  }

  private renderFavorites(isOn: boolean, available: boolean) {
    if (this.favorites.length === 0) return nothing;
    const current = isOn ? lightColor(this.stateObj) : undefined;
    return html`<div class="favorites" role="group" aria-label=${localize(this.hass, 'favorites')}>
      ${this.favorites.map((preset) => {
        const rgb = preset.rgb ?? kelvinToRgb(preset.kelvin ?? 2700);
        const label = preset.rgb
          ? `rgb(${preset.rgb.join(', ')})`
          : `${Math.round(preset.kelvin ?? 0)} K`;
        const level = preset.brightness !== undefined ? `${Math.round(preset.brightness)}` : '';
        const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
        return html`<button
          type="button"
          class=${classMap({
            swatch: true,
            current: current !== undefined && colorDistance(current, rgb) < SAME_COLOR_DISTANCE,
          })}
          style=${styleMap({
            '--swatch': rgbCss(rgb),
            '--level-color': luminance > 0.6 ? 'rgba(0, 0, 0, 0.65)' : '#ffffff',
          })}
          title=${level ? `${label} · ${level} %` : label}
          aria-label=${level ? `${label} · ${level} %` : label}
          ?disabled=${!available}
          @click=${() => this.applyFavorite(preset)}
        >
          ${level ? html`<span class="level">${level}</span>` : nothing}
        </button>`;
      })}
    </div>`;
  }

  private renderColorBar(isOn: boolean, available: boolean) {
    if (this.colorBar === 'none') return nothing;
    const attributes = (this.stateObj?.attributes ?? {}) as LightAttributes;
    let value: number | undefined;
    if (this.colorBar === 'hue') {
      const hs = attributes.hs_color;
      value = isOn && Array.isArray(hs) && typeof hs[0] === 'number' ? hs[0] : undefined;
    } else if (isOn && attributes.color_mode === 'color_temp') {
      value = attributes.color_temp_kelvin ?? undefined;
    }
    const range = temperatureRange(this.stateObj);
    return html`<vivid-color-bar
      .kind=${this.colorBar}
      .value=${value}
      .min=${range.min}
      .max=${range.max}
      .label=${localize(this.hass, this.colorBar === 'hue' ? 'hue' : 'temperature')}
      ?disabled=${!available}
      @value-changed=${this.onColorChanged}
    ></vivid-color-bar>`;
  }

  protected override render() {
    const state = this.stateObj;
    if (!state) return nothing;
    const attributes = state.attributes as LightAttributes;
    const available = this.available;
    const isOn = available && state.state === 'on';
    const brightness = this._preview ?? this.currentBrightness();
    const rgb = lightColor(state);
    const effects = Array.isArray(attributes.effect_list) ? attributes.effect_list : [];
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

    const effect = attributes.effect;
    const effectActive =
      this.animateEffects &&
      isOn &&
      typeof effect === 'string' &&
      !['solid', 'none', 'off', ''].includes(effect.toLowerCase());

    return html`<div
      class=${classMap({ tile: true, on: lit, unavailable: !available, effect: effectActive })}
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
          ${this.showState ? html`<span class="state">${stateText}</span>` : nothing}
        </div>
        ${this.renderBadges()}
        ${
          this.showEffects && effects.length > 0
            ? html`<vivid-select-chip
                .icon=${'mdi:format-list-bulleted'}
                .value=${attributes.effect ?? undefined}
                .options=${effects}
                .tooltip=${localize(this.hass, 'effect')}
                .placeholder=${localize(this.hass, 'effect')}
                ?disabled=${!available}
                @value-changed=${this.onEffectChanged}
              ></vivid-select-chip>`
            : nothing
        }
      </div>
      ${this.renderColorBar(isOn, available)} ${this.renderFavorites(isOn, available)}
    </div>`;
  }
}

defineElement('vivid-light-tile', VividLightTile);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-light-tile': VividLightTile;
  }
}
