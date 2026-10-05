import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { runAction } from '../../core/action-handler';
import { haptic, openMoreInfo } from '../../core/actions';
import { domainOf } from '../../core/entities';
import { glowVars, lightTone, softLightTone } from '../../core/glow';
import type { HomeAssistant } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerBadge } from '../../core/register';
import { localize } from '../../i18n';
import { buttonReset, tokens } from '../../components/shared-styles';
import { VividPopover } from '../../components/vivid-popover';
import { watchedChanged } from '../../cards/led-group/model';
import {
  BADGE_TYPE,
  resolveLightBadgeConfig,
  type LightBadgeConfig,
  type ResolvedLightBadgeConfig,
} from './config';
import { buildLightBadgeModel, type LightBadgeModel } from './model';
import './vivid-light-badge-details';
import './vivid-light-badge-editor';

const HOLD_MS = 500;
const MOVE_TOLERANCE_PX = 10;

/** Halos are scaled down next to the card's: a badge is a much smaller surface. */
const BADGE_GLOW = 0.6;

/** CSS variables of the badge for its look, while something is on. */
function badgeLook(
  config: ResolvedLightBadgeConfig,
  model: LightBadgeModel,
): Record<string, string | undefined> {
  const glow = glowVars(config.glow, BADGE_GLOW);
  if (model.on === 0 || model.colors.length === 0) return glow;
  // White lights take Home Assistant's amber, translucent; colored lights fill solid.
  const tone = (model.white ? softLightTone : lightTone)(
    model.colors,
    true,
    model.brightness,
    config.glowBoost,
  );
  // White ink only: dark ink is chosen precisely because the surface is light.
  const ink =
    tone.iconColor === '#ffffff'
      ? {
          '--badge-ink-shadow': 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35))',
          '--badge-text-shadow': '0 1px 2px rgba(0, 0, 0, 0.35)',
        }
      : {};
  if (config.look === 'pill') {
    return {
      ...glow,
      ...ink,
      // A translucent fill lies over the badge's own background.
      '--badge-bg': model.white
        ? `linear-gradient(${tone.background}, ${tone.background}), var(--ha-card-background, var(--card-background-color, #1c1c1c))`
        : tone.background,
      '--badge-color': tone.iconColor,
      '--badge-shadow': tone.shadow,
      '--badge-border': 'transparent',
      '--badge-weight': '600',
      '--icon-color': tone.iconColor,
    };
  }
  return {
    ...glow,
    ...ink,
    '--icon-bg': tone.background,
    '--icon-color': tone.iconColor,
    '--icon-shadow': tone.shadow,
  };
}

/**
 * Badge for a light group (or one light), for the badge bar of a dashboard.
 *
 * - Everything off: the crossed-out icon, greyed, nothing else.
 * - Something on: the icon on a disc filled with the lights' colors (a
 *   gradient for a group), haloed with the brightness, and "on / total".
 *
 * A tap toggles the whole group (anything on turns everything off); a hold
 * opens the details under the badge: every light with its color, brightness
 * slider and switch.
 */
export class VividLightBadge extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _open: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: ResolvedLightBadgeConfig;
  declare _open: boolean;

  private model?: LightBadgeModel;
  private detailsPopover?: VividPopover;
  private press?: { x: number; y: number; timer: number; held: boolean; pointerId: number };

  constructor() {
    super();
    this._open = false;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement('vivid-light-badge-editor');
  }

  static getStubConfig(hass?: HomeAssistant): Partial<LightBadgeConfig> {
    const lights = Object.values(hass?.states ?? {}).filter((state) =>
      state.entity_id.startsWith('light.'),
    );
    const group = lights.find((state) => Array.isArray(state.attributes.entity_id));
    return { entity: (group ?? lights[0])?.entity_id ?? 'light.example' };
  }

  setConfig(config: LightBadgeConfig): void {
    this._config = resolveLightBadgeConfig(config);
  }

  static override styles = [
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
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        transition:
          box-shadow 0.4s ease,
          transform 0.12s ease;
      }
      .badge.count {
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
      /* White on a gradient that may hold a white light: a soft shadow keeps it readable. */
      .lit .icon ha-icon {
        filter: var(--badge-ink-shadow, none);
      }
      .lit.pill {
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
      .zero {
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
      }
    `,
  ];

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.closeDetails();
    this.cancelPress();
  }

  protected override shouldUpdate(changed: PropertyValues<this>): boolean {
    if (!this.hass || !this._config) return changed.has('_config');
    if (changed.size === 1 && changed.has('hass')) {
      return watchedChanged(changed.get('hass'), this.hass, this.model?.watched ?? []);
    }
    return true;
  }

  protected override willUpdate(): void {
    if (this.hass && this._config) this.model = buildLightBadgeModel(this.hass, this._config);
  }

  protected override updated(): void {
    if (this._open) this.renderDetails();
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
        this.hold();
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
    if (!press.held) this.tap();
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.tap();
    } else if (event.key === 'ArrowDown' || event.key === 'ContextMenu') {
      event.preventDefault();
      this.hold();
    }
  };

  private run(which: 'tap' | 'hold'): void {
    const config = this._config;
    if (!config || !this.hass) return;
    const action = which === 'tap' ? config.tapAction : config.holdAction;
    haptic(this, which === 'hold' ? 'medium' : 'light');
    if (action.action === 'toggle') {
      this.toggleAll();
      return;
    }
    runAction(action, {
      node: this,
      hass: this.hass,
      entityId: config.entity,
      openDetails: () => this.toggleDetails(),
    });
  }

  private tap(): void {
    this.run('tap');
  }

  private hold(): void {
    this.run('hold');
  }

  /** Anything on: everything off. Everything off: everything on. */
  private toggleAll(): void {
    const config = this._config;
    if (!config || !this.hass || !this.model) return;
    const service = this.model.on > 0 ? 'turn_off' : 'turn_on';
    const isLight = domainOf(config.entity) === 'light';
    // Switches and old-style groups have no transition.
    const data =
      isLight && config.transition !== undefined ? { transition: config.transition } : {};
    void this.hass.callService(isLight ? 'light' : 'homeassistant', service, data, {
      entity_id: config.entity,
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
    this.renderDetails();
    this.detailsPopover.show(anchor);
  }

  private closeDetails(): void {
    if (!this._open) return;
    this._open = false;
    this.detailsPopover?.hide();
  }

  private renderDetails(): void {
    if (!this.detailsPopover || !this.model || !this._config) return;
    for (const [name, value] of Object.entries(glowVars(this._config.glow))) {
      this.detailsPopover.style.setProperty(name, value);
    }
    this.detailsPopover.label = this.model.name;
    this.detailsPopover.content = html`<vivid-light-badge-details
      .hass=${this.hass}
      .model=${this.model}
      .transition=${this._config.transition}
      .layout=${this._config.layout}
      .glowBoost=${this._config.glowBoost}
    ></vivid-light-badge-details>`;
  }

  /* --------------------------------- render --------------------------------- */

  protected override render() {
    const config = this._config;
    const model = this.model;
    if (!config || !this.hass || !model) return nothing;
    const on = model.on > 0;
    const count = config.showCount && (on || config.showZero);
    const label = model.isGroup
      ? `${model.on}/${model.total}`
      : `${model.lights[0]?.brightness ?? 0} %`;
    const state = on
      ? localize(this.hass, 'lights_on', { on: model.on, total: model.total })
      : localize(this.hass, 'off');
    return html`<button
      type="button"
      class=${classMap({
        reset: true,
        badge: true,
        count,
        lit: on,
        pill: config.look === 'pill',
        unavailable: model.total === 0,
      })}
      style=${styleMap(badgeLook(config, model))}
      title=${`${model.name} · ${state}`}
      aria-label=${`${model.name} · ${state}`}
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
        <ha-icon .icon=${on ? model.icon : model.iconOff}></ha-icon>
        ${!on && model.strike ? html`<span class="strike"></span>` : nothing}
      </span>
      ${count ? html`<span class=${on ? 'label' : 'label zero'}>${label}</span>` : nothing}
    </button>`;
  }
}

defineElement(BADGE_TYPE, VividLightBadge);

registerBadge({
  type: BADGE_TYPE,
  name: 'Vivid light badge',
  description:
    'LED strips, lamps or lamps on plugs at a glance: lights on out of the total, their colors and glow. Tap to toggle them all, hold for every light.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-light-badge`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-light-badge': VividLightBadge;
  }
}
