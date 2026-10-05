import { LitElement, css, html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { fireEvent, haptic, setBrightness, toggleEntity } from '../../core/actions';
import { clamp, WARM_WHITE } from '../../core/color';
import { lightTone, softLightTone } from '../../core/glow';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { localize } from '../../i18n';
import { snapBrightness } from '../../components/vivid-light-tile';
import { buttonReset, tokens } from '../../components/shared-styles';
import type { DetailsLayout } from './config';
import type { BadgeLight, LightBadgeModel } from './model';

const HOLD_MS = 500;
const SLIDE_PX = 6;
/** How long a released value is shown before following Home Assistant again. */
const PREVIEW_MS = 1500;

interface Press {
  entityId: string;
  pointerId: number;
  x: number;
  y: number;
  /** Brightness when the press started (relative drags on chips). */
  start: number;
  width: number;
  moved: boolean;
  held: boolean;
  timer?: number;
}

/**
 * Details of a light badge, one entry per light.
 *
 * - `list`: a switch disc in the light's color, the name, a brightness bar to
 *   drag or tap, the percentage.
 * - `compact`: two columns of chips (disc with the percentage, name); tap to
 *   switch, drag sideways to dim.
 *
 * Holding a name (or a chip) asks for the light's Home Assistant dialog
 * (`vivid-more-info`).
 */
export class VividLightBadgeDetails extends LitElement {
  static override properties = {
    hass: { attribute: false },
    model: { attribute: false },
    transition: { type: Number },
    layout: {},
    glowBoost: { type: Number },
    _preview: { state: true },
  };

  declare hass?: HomeAssistant;
  declare model?: LightBadgeModel;
  declare transition?: number;
  declare layout: DetailsLayout;
  /** Percent; see `glowLevel`. */
  declare glowBoost?: number;
  /** Brightness shown while dragging, per light. */
  declare _preview: Record<string, number>;

  private press?: Press;
  private holdTimer?: number;

  constructor() {
    super();
    this.layout = 'list';
    this._preview = {};
  }

  static override styles = [
    tokens,
    buttonReset,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .head {
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding: 4px 6px 2px;
      }
      .title {
        font-size: 14px;
        font-weight: 600;
      }
      .muted {
        color: var(--secondary-text-color);
        font-size: 12px;
      }
      .offline {
        opacity: 0.5;
      }
      .dot {
        /* Halo proportions of a 32 px disc (see glowSize). */
        --vivid-glow-size: 0.89;
        display: grid;
        place-items: center;
        flex: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--dot-bg, rgba(var(--vivid-rgb-text), 0.1));
        box-shadow: var(--dot-shadow, none);
        color: var(--dot-color, var(--secondary-text-color));
        font-size: 11px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        transition:
          background 0.3s ease,
          box-shadow 0.3s ease;
      }
      .dot ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
      }
      .dot:disabled {
        cursor: default;
      }
      .dot:focus-visible,
      .bar:focus-visible,
      .chip:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .name {
        font-size: 13px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: default;
        -webkit-user-select: none;
        user-select: none;
      }

      /* ---------------------------------- list ---------------------------------- */
      .row {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) minmax(88px, 34%) 38px;
        align-items: center;
        gap: 10px;
        padding: 4px 8px 4px 4px;
        border-radius: 16px;
        background: var(--vivid-layer-1);
      }
      .bar {
        position: relative;
        height: 24px;
        border-radius: 12px;
        overflow: hidden;
        background: var(--vivid-layer-2);
        touch-action: pan-y;
        cursor: ew-resize;
      }
      .bar.static {
        cursor: default;
      }
      .fill {
        position: absolute;
        inset: 0 auto 0 0;
        width: var(--level, 0%);
        border-radius: inherit;
        background: linear-gradient(
          90deg,
          rgba(var(--rgb, 255, 214, 170), 0.3),
          rgba(var(--rgb, 255, 214, 170), 0.95)
        );
        transition: width 0.2s ease;
      }
      .sliding .fill,
      .sliding.chip {
        transition: none;
      }
      .percent {
        justify-self: end;
        font-size: 12px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .percent.off {
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      /* --------------------------------- compact -------------------------------- */
      .chips {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
      }
      .chip {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        padding: 4px 10px 4px 4px;
        border-radius: 20px;
        background:
          linear-gradient(
              90deg,
              rgba(var(--rgb, 255, 214, 170), 0.22) var(--level, 0%),
              transparent var(--level, 0%)
            )
            no-repeat,
          var(--vivid-layer-1);
        touch-action: pan-y;
        transition: background 0.2s ease;
      }
      .chip .dot {
        pointer-events: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .dot,
        .fill,
        .chip {
          transition: none;
        }
      }
    `,
  ];

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.holdTimer);
    if (this.press) window.clearTimeout(this.press.timer);
  }

  private options() {
    return { transition: this.transition };
  }

  private levelOf(light: BadgeLight): number {
    return this._preview[light.entityId] ?? light.brightness;
  }

  /** Shows `value` until Home Assistant has had time to report it. */
  private commitBrightness(entityId: string, value: number): void {
    if (!this.hass) return;
    this._preview = { ...this._preview, [entityId]: value };
    haptic(this, 'light');
    void setBrightness(this.hass, entityId, value, this.options());
    window.setTimeout(() => {
      const { [entityId]: _done, ...rest } = this._preview;
      this._preview = rest;
    }, PREVIEW_MS);
  }

  private toggle(light: BadgeLight): void {
    if (!this.hass || !light.available) return;
    haptic(this, 'light');
    void toggleEntity(this.hass, light.entityId, this.options());
  }

  private moreInfo(entityId: string): void {
    haptic(this, 'medium');
    fireEvent(this, 'vivid-more-info', { entityId });
  }

  /* -------------------------------- gestures -------------------------------- */

  private startPress(event: PointerEvent, light: BadgeLight, withHold: boolean): void {
    if (event.button !== 0) return;
    const element = event.currentTarget as HTMLElement;
    if (this.press) window.clearTimeout(this.press.timer);
    const press: Press = {
      entityId: light.entityId,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      start: light.brightness,
      width: element.getBoundingClientRect().width,
      moved: false,
      held: false,
    };
    if (withHold) {
      press.timer = window.setTimeout(() => {
        press.held = true;
        this.moreInfo(light.entityId);
      }, HOLD_MS);
    }
    this.press = press;
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic events cannot be captured.
    }
  }

  /** The press once the pointer slides sideways (it became a drag). */
  private sliding(event: PointerEvent): Press | undefined {
    const press = this.press;
    if (!press || press.pointerId !== event.pointerId || press.held) return undefined;
    if (!press.moved) {
      const dx = Math.abs(event.clientX - press.x);
      if (dx < SLIDE_PX) {
        // A vertical move is a scroll of the panel, not a press.
        if (Math.abs(event.clientY - press.y) > SLIDE_PX) this.cancelPress();
        return undefined;
      }
      press.moved = true;
      window.clearTimeout(press.timer);
      (event.currentTarget as HTMLElement).classList.add('sliding');
    }
    return press;
  }

  /** The press that just ended, unless it was a hold. */
  private endPress(event: PointerEvent): Press | undefined {
    const press = this.press;
    if (!press || press.pointerId !== event.pointerId) return undefined;
    window.clearTimeout(press.timer);
    this.press = undefined;
    (event.currentTarget as HTMLElement).classList.remove('sliding');
    return press.held ? undefined : press;
  }

  private cancelPress(): void {
    if (this.press) window.clearTimeout(this.press.timer);
    this.press = undefined;
  }

  /** Absolute position on a bar. */
  private percentAt(bar: HTMLElement, clientX: number): number {
    const rect = bar.getBoundingClientRect();
    return Math.round(clamp((clientX - rect.left) / Math.max(rect.width, 1), 0, 1) * 100);
  }

  /** Relative drag on a chip: the whole chip width is 100 %. */
  private percentFrom(press: Press, clientX: number): number {
    const delta = ((clientX - press.x) / Math.max(press.width, 1)) * 100;
    return Math.round(clamp(press.start + delta, 0, 100));
  }

  private onKeyDim(event: KeyboardEvent, light: BadgeLight): void {
    if (!light.available || !light.dimmable) return;
    const up = event.key === 'ArrowRight' || event.key === 'ArrowUp';
    const down = event.key === 'ArrowLeft' || event.key === 'ArrowDown';
    if (!up && !down) return;
    event.preventDefault();
    this.commitBrightness(light.entityId, clamp(this.levelOf(light) + (up ? 10 : -10), 0, 100));
  }

  private holdName(entityId: string): void {
    window.clearTimeout(this.holdTimer);
    this.holdTimer = window.setTimeout(() => this.moreInfo(entityId), HOLD_MS);
  }

  /* --------------------------------- render --------------------------------- */

  private stateText(light: BadgeLight, level: number): string {
    if (!light.available) return localize(this.hass, 'unavailable');
    if (!light.isOn && level === 0) return localize(this.hass, 'off');
    // A plug or an on/off lamp has no level to show.
    return light.dimmable ? `${level} %` : localize(this.hass, 'on');
  }

  private dotStyle(light: BadgeLight) {
    const tone = (light.white ? softLightTone : lightTone)(
      light.rgb ?? WARM_WHITE,
      light.isOn,
      light.brightness,
      this.glowBoost,
    );
    return styleMap({
      '--dot-bg': tone.background,
      '--dot-shadow': tone.shadow,
      '--dot-color': tone.iconColor,
    });
  }

  private renderRow(light: BadgeLight) {
    const level = this.levelOf(light);
    const lit = light.isOn || level > 0;
    const state = this.stateText(light, level);
    const action = localize(this.hass, light.isOn ? 'power_off' : 'power_on');
    const dimmable = light.available && light.dimmable;
    return html`<div class=${classMap({ row: true, offline: !light.available })}>
      <button
        type="button"
        class="reset dot"
        style=${this.dotStyle(light)}
        title=${action}
        aria-label=${`${light.name} · ${action}`}
        aria-pressed=${String(light.isOn)}
        ?disabled=${!light.available}
        @click=${() => this.toggle(light)}
      >
        <ha-icon .icon=${'mdi:power'}></ha-icon>
      </button>
      <span
        class="name"
        title=${light.name}
        @pointerdown=${() => this.holdName(light.entityId)}
        @pointerup=${() => window.clearTimeout(this.holdTimer)}
        @pointerleave=${() => window.clearTimeout(this.holdTimer)}
        @contextmenu=${(event: Event) => event.preventDefault()}
        >${light.name}</span
      >
      ${
        light.dimmable
          ? html`<div
              class=${classMap({ bar: true, static: !dimmable })}
              role="slider"
              tabindex=${dimmable ? 0 : -1}
              aria-label=${`${light.name} ${localize(this.hass, 'brightness')}`}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow=${level}
              aria-valuetext=${state}
              aria-disabled=${String(!dimmable)}
              style=${styleMap({
                '--level': lit ? `${level}%` : '0%',
                '--rgb': (light.rgb ?? WARM_WHITE).join(', '),
              })}
              @pointerdown=${(event: PointerEvent) => {
                if (dimmable) this.startPress(event, light, false);
              }}
              @pointermove=${(event: PointerEvent) => {
                if (!this.sliding(event)) return;
                const bar = event.currentTarget as HTMLElement;
                this._preview = {
                  ...this._preview,
                  [light.entityId]: snapBrightness(this.percentAt(bar, event.clientX)),
                };
              }}
              @pointerup=${(event: PointerEvent) => {
                if (!this.endPress(event)) return;
                const bar = event.currentTarget as HTMLElement;
                // A tap sets the level where it lands, a drag where it ends.
                this.commitBrightness(
                  light.entityId,
                  snapBrightness(this.percentAt(bar, event.clientX)),
                );
              }}
              @pointercancel=${() => this.cancelPress()}
              @keydown=${(event: KeyboardEvent) => this.onKeyDim(event, light)}
            >
              <div class="fill"></div>
            </div>`
          : html`<span></span>`
      }
      <span class=${classMap({ percent: true, off: !lit })}>${state}</span>
    </div>`;
  }

  private renderChip(light: BadgeLight) {
    const level = this.levelOf(light);
    const lit = light.isOn || level > 0;
    const state = this.stateText(light, level);
    return html`<div
      class=${classMap({ chip: true, offline: !light.available })}
      role="button"
      tabindex=${light.available ? 0 : -1}
      aria-label=${`${light.name} · ${state}`}
      aria-pressed=${String(light.isOn)}
      style=${styleMap({
        '--level': lit ? `${level}%` : '0%',
        '--rgb': (light.rgb ?? WARM_WHITE).join(', '),
      })}
      @pointerdown=${(event: PointerEvent) => {
        if (light.available) this.startPress(event, light, true);
      }}
      @pointermove=${(event: PointerEvent) => {
        const press = this.sliding(event);
        if (!press || !light.dimmable) return;
        this._preview = {
          ...this._preview,
          [light.entityId]: snapBrightness(this.percentFrom(press, event.clientX)),
        };
      }}
      @pointerup=${(event: PointerEvent) => {
        const press = this.endPress(event);
        if (!press) return;
        if (!press.moved) this.toggle(light);
        else if (light.dimmable) {
          this.commitBrightness(
            light.entityId,
            snapBrightness(this.percentFrom(press, event.clientX)),
          );
        }
      }}
      @pointercancel=${() => this.cancelPress()}
      @contextmenu=${(event: Event) => event.preventDefault()}
      @keydown=${(event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.toggle(light);
        } else this.onKeyDim(event, light);
      }}
    >
      <span class="dot" style=${this.dotStyle(light)}>
        ${
          lit && light.available && light.dimmable
            ? html`${level}`
            : html`<ha-icon .icon=${'mdi:power'}></ha-icon>`
        }
      </span>
      <span class="name" title=${light.name}>${light.name}</span>
    </div>`;
  }

  protected override render() {
    const model = this.model;
    if (!model) return nothing;
    const key = (light: BadgeLight) => light.entityId;
    return html`<div class="head">
        <span class="title">${model.name}</span>
        <span class="muted"
          >${localize(this.hass, 'lights_on', { on: model.on, total: model.total })}</span
        >
      </div>
      ${
        this.layout === 'compact'
          ? html`<div class="chips">
              ${repeat(model.lights, key, (light) => this.renderChip(light))}
            </div>`
          : repeat(model.lights, key, (light) => this.renderRow(light))
      }`;
  }
}

defineElement('vivid-light-badge-details', VividLightBadgeDetails);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-light-badge-details': VividLightBadgeDetails;
  }
}
