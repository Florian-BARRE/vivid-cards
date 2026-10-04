import { LitElement, css, html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import {
  fireEvent,
  haptic,
  selectOption,
  toggleEntity,
  type LightCallOptions,
} from '../core/actions';
import type { BadgeModel } from '../core/badges';
import { activeTone, lightTone, powerTone, toggleTone, type PowerScale } from '../core/glow';
import type { HomeAssistant, Rgb } from '../core/hass-types';
import { defineElement } from '../core/register';
import { formatNumber, localize } from '../i18n';
import { buttonReset, tokens } from './shared-styles';
import './vivid-chip';

export interface LiveOverrideTarget {
  /** Selects that can be switched right now. */
  available: string[];
  active: boolean;
}

export function formatWatts(hass: HomeAssistant | undefined, watts: number): string {
  return `${formatNumber(hass, watts, watts < 10 ? 1 : 0)} W`;
}

/**
 * Title row of a light: icon, name, separator line and badges (consumption,
 * live override, power). `variant="summary"` keeps only the centered badges.
 * Fires `vivid-name-click` and `vivid-more-info` (`{ entityId }`).
 */
export class VividLightHeader extends LitElement {
  static override properties = {
    hass: { attribute: false },
    variant: { reflect: true },
    icon: {},
    name: {},
    nameInteractive: { type: Boolean, attribute: 'name-interactive' },
    lightEntity: { attribute: 'light-entity' },
    available: { type: Boolean },
    isOn: { type: Boolean, attribute: 'is-on' },
    rgb: { attribute: false },
    colors: { attribute: false },
    brightness: { type: Number },
    badges: { attribute: false },
    lightOptions: { attribute: false },
    showPower: { type: Boolean, attribute: 'show-power' },
    hasPower: { type: Boolean, attribute: 'has-power' },
    watts: { type: Number },
    scale: { attribute: false },
    powerEntity: { attribute: 'power-entity' },
    showLiveOverride: { type: Boolean, attribute: 'show-live-override' },
    liveOverride: { attribute: false },
  };

  declare hass?: HomeAssistant;
  declare variant: 'row' | 'summary';
  declare icon?: string;
  declare name?: string;
  declare nameInteractive: boolean;
  declare lightEntity?: string;
  declare available: boolean;
  declare isOn: boolean;
  declare rgb?: Rgb;
  /** Colors of the power button; several make a gradient. Defaults to `rgb`. */
  declare colors?: Rgb[];
  /** 0–100: the power button glows wider and brighter with it. */
  declare brightness?: number;
  declare badges?: BadgeModel[];
  declare lightOptions?: LightCallOptions;
  declare showPower: boolean;
  declare hasPower: boolean;
  declare watts?: number;
  declare scale?: PowerScale;
  declare powerEntity?: string;
  declare showLiveOverride: boolean;
  declare liveOverride?: LiveOverrideTarget;

  constructor() {
    super();
    this.variant = 'row';
    this.nameInteractive = false;
    this.available = true;
    this.isOn = false;
    this.showPower = true;
    this.hasPower = false;
    this.showLiveOverride = true;
  }

  static override styles = [
    tokens,
    buttonReset,
    css`
      :host {
        display: block;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: var(--vivid-chip-height);
      }
      :host([variant='summary']) .row {
        justify-content: center;
      }
      .title {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        flex: 0 1 auto;
        padding: 4px 2px;
        border-radius: 10px;
      }
      .title ha-icon {
        --mdc-icon-size: 24px;
        display: inline-flex;
        flex: none;
        color: var(--primary-text-color);
      }
      .name {
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.01em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .line {
        flex: 1 1 24px;
        min-width: 12px;
        height: 6px;
        border-radius: 3px;
        background: var(--vivid-line-color);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
        flex: 0 1 auto;
        min-width: 0;
      }
      :host([variant='summary']) .chips {
        justify-content: center;
      }
      .muted {
        opacity: 0.55;
      }
    `,
  ];

  private readonly onNameClick = (): void => {
    fireEvent(this, 'vivid-name-click');
  };

  private readonly onPowerClick = (): void => {
    if (this.powerEntity) fireEvent(this, 'vivid-more-info', { entityId: this.powerEntity });
  };

  private readonly onLiveOverrideClick = (): void => {
    const target = this.liveOverride;
    if (!this.hass || !target || target.available.length === 0) return;
    haptic(this, 'light');
    void selectOption(this.hass, target.available, target.active ? '0' : '1');
  };

  private readonly onToggleClick = (): void => {
    if (!this.hass || !this.lightEntity) return;
    haptic(this, 'light');
    void toggleEntity(this.hass, this.lightEntity, this.lightOptions);
  };

  private renderBadges() {
    return (this.badges ?? []).map(
      (badge) =>
        html`<vivid-chip
          class=${classMap({ muted: !badge.available })}
          .icon=${badge.icon}
          .label=${badge.label}
          .tooltip=${badge.label ? `${badge.name} : ${badge.label}` : badge.name}
          .tone=${badge.label === undefined ? activeTone(badge.active) : undefined}
          @click=${() => fireEvent(this, 'vivid-more-info', { entityId: badge.entityId })}
        ></vivid-chip>`,
    );
  }

  private renderTitle() {
    if (this.variant === 'summary') return nothing;
    const content = html`<ha-icon .icon=${this.icon}></ha-icon
      ><span class="name">${this.name}</span>`;
    const title = this.nameInteractive
      ? html`<button
          type="button"
          class="reset title"
          title=${localize(this.hass, 'details')}
          @click=${this.onNameClick}
        >
          ${content}
        </button>`
      : html`<div class="title">${content}</div>`;
    return html`${title}
      <div class="line"></div>`;
  }

  private renderPower() {
    if (!this.showPower || !this.hasPower || !this.scale) return nothing;
    const known = this.watts !== undefined;
    const label = known ? formatWatts(this.hass, this.watts ?? 0) : '— W';
    const tooltip = `${localize(this.hass, 'consumption')} : ${label}`;
    return html`<vivid-chip
      class=${classMap({ muted: !known })}
      .icon=${'mdi:flash'}
      .label=${label}
      .tooltip=${tooltip}
      .tone=${powerTone(this.watts, this.scale)}
      ?readonly=${!this.powerEntity}
      @click=${this.onPowerClick}
    ></vivid-chip>`;
  }

  private renderLiveOverride() {
    const target = this.liveOverride;
    if (!this.showLiveOverride || !target) return nothing;
    const usable = target.available.length > 0;
    // Ambilight is on while WLED shows the realtime stream, i.e. the override is off.
    const ambilightOn = !target.active;
    const tooltip = !usable
      ? localize(this.hass, 'live_override_unavailable')
      : localize(this.hass, ambilightOn ? 'ambilight_on' : 'ambilight_off');
    return html`<vivid-chip
      .icon=${'mdi:television-ambient-light'}
      .tooltip=${tooltip}
      .tone=${toggleTone(ambilightOn && usable)}
      .pressed=${ambilightOn}
      ?disabled=${!usable}
      @click=${this.onLiveOverrideClick}
    ></vivid-chip>`;
  }

  protected override render() {
    return html`<div class="row">
      ${this.renderTitle()}
      <div class="chips">
        ${this.renderBadges()} ${this.renderPower()} ${this.renderLiveOverride()}
        <vivid-chip
          wide
          .icon=${'mdi:power'}
          .tooltip=${localize(this.hass, this.isOn ? 'power_off' : 'power_on')}
          .tone=${lightTone(
            this.colors?.length ? this.colors : this.rgb,
            this.isOn,
            this.brightness ?? 100,
          )}
          .pressed=${this.isOn}
          ?disabled=${!this.available}
          @click=${this.onToggleClick}
        ></vivid-chip>
      </div>
    </div>`;
  }
}

defineElement('vivid-light-header', VividLightHeader);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-light-header': VividLightHeader;
  }
}
