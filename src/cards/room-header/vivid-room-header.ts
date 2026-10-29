import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { haptic, openMoreInfo } from '../../core/actions';
import { rgbCss } from '../../core/color';
import { glowVars } from '../../core/glow';
import type { HomeAssistant, LovelaceGridOptions } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { formatNumber, localize } from '../../i18n';
import { buttonReset, tokens } from '../../components/shared-styles';
import { watchedChanged } from '../led-group/model';
import {
  ROOM_HEADER_CARD,
  resolveRoomHeaderConfig,
  type ResolvedRoomHeaderConfig,
  type RoomBadgeConfig,
  type RoomHeaderCardConfig,
} from './config';
import {
  buildRoomHeaderModel,
  discoverRoom,
  powerAction,
  type HaloSource,
  type RoomHeaderModel,
} from './model';
import './vivid-room-header-editor';

const HOLD_MS = 500;
const MOVE_TOLERANCE_PX = 10;
/** Opacity of a glow at full brightness and 100 % halo. */
const GLOW_ALPHA = 0.3;

type BadgeElement = HTMLElement & {
  hass?: HomeAssistant;
  setConfig?(config: Record<string, unknown>): void;
};

/** A badge of the row: its element, or why it could not be built. */
interface BadgeSlot {
  key: string;
  element?: BadgeElement;
  error?: string;
}

/**
 * Header of a room: its title with the room power button, the lights on and
 * the consumption under it, and the room badges below. Behind the title, one
 * soft glow per light source in its real color (amber lamps, each LED strip
 * in its color), as bright as the light.
 */
export class VividRoomHeader extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: ResolvedRoomHeaderConfig;

  private model?: RoomHeaderModel;
  private slots: BadgeSlot[] = [];
  private slotsKey = '';
  private holdTimer?: number;
  private held = false;
  private start?: { x: number; y: number };

  static getConfigElement(): HTMLElement {
    return document.createElement('vivid-room-header-editor');
  }

  static getStubConfig(hass?: HomeAssistant): Partial<RoomHeaderCardConfig> {
    const rooms = ['salon', 'chambre', 'bureau', 'cuisine', 'sdb'];
    const room = hass ? rooms.find((id) => discoverRoom(hass, id).lights.length > 0) : undefined;
    return { room: room ?? 'salon' };
  }

  setConfig(config: RoomHeaderCardConfig): void {
    this._config = resolveRoomHeaderConfig(config);
  }

  getCardSize(): number {
    return this._config?.showBadges === false || !this.model?.badges.length ? 2 : 3;
  }

  getGridOptions(): LovelaceGridOptions {
    return { columns: 'full', rows: 'auto', min_columns: 6 };
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.cancelHold();
  }

  static override styles = [
    tokens,
    buttonReset,
    css`
      :host {
        display: block;
      }
      ha-card {
        height: 100%;
        box-sizing: border-box;
        background: none;
        border: none;
        box-shadow: none;
        overflow: visible;
      }
      .header {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 18px 8px 12px;
        border-radius: var(--vivid-tile-radius);
      }
      .header.bare {
        padding-bottom: 14px;
      }
      .halo {
        position: absolute;
        inset: 0;
        overflow: hidden;
        border-radius: inherit;
        pointer-events: none;
      }
      .glow {
        position: absolute;
        /* The color fades from the center to nothing at 75 % of the radii. */
        -webkit-mask-image: radial-gradient(closest-side, #000, transparent 75%);
        mask-image: radial-gradient(closest-side, #000, transparent 75%);
        transition:
          background-color 0.8s ease,
          opacity 0.6s ease,
          left 0.6s ease,
          top 0.6s ease,
          width 0.6s ease,
          height 0.6s ease;
      }
      .top {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        max-width: 100%;
      }
      .title-row {
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 100%;
      }
      .title {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        line-height: 1.25;
        color: var(--primary-text-color);
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .power {
        display: grid;
        place-items: center;
        flex: none;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: rgba(var(--vivid-rgb-text), 0.07);
        color: var(--vivid-muted);
        touch-action: manipulation;
        user-select: none;
        -webkit-user-select: none;
        transition:
          background-color 0.3s ease,
          color 0.3s ease,
          box-shadow 0.3s ease;
      }
      .power ha-icon {
        --mdc-icon-size: 20px;
      }
      .power.on {
        background: rgba(255, 193, 7, 0.28);
        color: rgb(255, 193, 7);
        box-shadow: 0 0 calc(14px * var(--vivid-glow, 1))
          rgba(255, 193, 7, calc(0.5 * var(--vivid-glow-alpha, 1)));
      }
      .power:disabled {
        cursor: default;
        opacity: 0.5;
      }
      .sub {
        font-size: 12.5px;
        line-height: 1.35;
        color: var(--vivid-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        font-variant-numeric: tabular-nums;
      }
      .sub.on {
        color: rgba(var(--vivid-rgb-text), 0.85);
      }
      .badges {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 8px;
        max-width: 100%;
      }
      .badge-error {
        display: inline-grid;
        place-items: center;
        width: 36px;
        height: 36px;
        border-radius: 18px;
        color: var(--error-color, #db4437);
        background: rgba(var(--vivid-rgb-text), 0.06);
        --mdc-icon-size: 18px;
      }
      @media (prefers-reduced-motion: reduce) {
        .glow,
        .power {
          transition: none;
        }
      }
    `,
  ];

  protected override shouldUpdate(changed: PropertyValues<this>): boolean {
    // Badges watch their own entities: they always get the new state.
    if (this.hass) for (const slot of this.slots) if (slot.element) slot.element.hass = this.hass;
    if (!this.hass || !this._config) return changed.has('_config');
    if (changed.size === 1 && changed.has('hass')) {
      return watchedChanged(changed.get('hass'), this.hass, this.model?.watched ?? []);
    }
    return true;
  }

  protected override willUpdate(): void {
    if (!this.hass || !this._config) return;
    this.model = buildRoomHeaderModel(
      this.hass,
      this._config,
      (tag) => customElements.get(tag) !== undefined,
    );
    this.syncBadges(this._config.showBadges ? this.model.badges : []);
  }

  /** Builds the badge elements again when their configs change. */
  private syncBadges(configs: RoomBadgeConfig[]): void {
    const key = JSON.stringify(configs);
    if (key === this.slotsKey) return;
    this.slotsKey = key;
    this.slots = configs.map((config, index) => this.createBadge(config, `${index}:${key}`));
  }

  private createBadge(config: RoomBadgeConfig, key: string): BadgeSlot {
    const tag = config.type.replace(/^custom:/, '');
    const slot: BadgeSlot = { key };
    const element = document.createElement(tag) as BadgeElement;
    const configure = (): void => {
      try {
        element.setConfig?.({ ...config });
        if (this.hass) element.hass = this.hass;
      } catch (error) {
        slot.error = (error as Error).message;
        slot.element = undefined;
        this.requestUpdate();
      }
    };
    slot.element = element;
    if (customElements.get(tag)) configure();
    else {
      // Defined later (another bundle): configure it once it is.
      void customElements.whenDefined(tag).then(() => {
        customElements.upgrade(element);
        configure();
      });
    }
    return slot;
  }

  private callPower(): void {
    const hass = this.hass;
    const model = this.model;
    if (!hass || !model || model.lights.length === 0) return;
    const { service, entities } = powerAction(model);
    haptic(this, service === 'turn_off' ? 'medium' : 'light');
    void hass.callService('homeassistant', service, {}, { entity_id: entities });
  }

  private cancelHold(): void {
    if (this.holdTimer !== undefined) window.clearTimeout(this.holdTimer);
    this.holdTimer = undefined;
  }

  private onDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    this.held = false;
    this.start = { x: event.clientX, y: event.clientY };
    this.cancelHold();
    this.holdTimer = window.setTimeout(() => {
      this.holdTimer = undefined;
      this.held = true;
      const entity = this.model?.mainEntity;
      if (entity) {
        haptic(this, 'heavy');
        openMoreInfo(this, entity);
      }
    }, HOLD_MS);
  };

  private onMove = (event: PointerEvent): void => {
    if (!this.start || this.holdTimer === undefined) return;
    const moved = Math.hypot(event.clientX - this.start.x, event.clientY - this.start.y);
    if (moved > MOVE_TOLERANCE_PX) this.cancelHold();
  };

  private onUp = (): void => {
    this.cancelHold();
  };

  private onClick = (event: Event): void => {
    event.stopPropagation();
    if (this.held) {
      this.held = false;
      return;
    }
    this.callPower();
  };

  private subtitle(model: RoomHeaderModel): string | undefined {
    const hass = this.hass;
    if (model.on === 0) return model.lights.length ? localize(hass, 'room_all_off') : undefined;
    const parts = [
      model.on === 1
        ? localize(hass, 'room_on_one')
        : localize(hass, 'room_on_other', { count: model.on }),
    ];
    if (model.power !== undefined) parts.push(`${formatNumber(hass, model.power)} W`);
    return parts.join(' · ');
  }

  private renderGlow(source: HaloSource, glow: number): TemplateResult {
    const alpha = source.on
      ? Math.min(0.6, GLOW_ALPHA * (0.35 + 0.65 * source.strength) * glow)
      : 0;
    return html`<span
      class="glow"
      style=${styleMap({
        left: `${source.x - source.rx}%`,
        top: `${source.y - source.ry}%`,
        width: `${source.rx * 2}%`,
        height: `${source.ry * 2}%`,
        backgroundColor: rgbCss(source.rgb),
        opacity: String(Math.round(alpha * 1000) / 1000),
      })}
    ></span>`;
  }

  protected override render() {
    const config = this._config;
    const model = this.model;
    if (!config || !model) return nothing;
    const hass = this.hass;
    const anyOn = model.on > 0;
    const glow = config.glow / 100;
    const subtitle = config.showSubtitle ? this.subtitle(model) : undefined;
    const badges = this.slots;
    const label = localize(hass, anyOn ? 'room_turn_off' : 'room_turn_on', { room: model.name });
    return html`<ha-card>
      <div
        class=${classMap({ header: true, bare: badges.length === 0 })}
        style=${styleMap(glowVars(config.glow))}
      >
        <div class="halo" aria-hidden="true">
          ${
            glow > 0
              ? repeat(
                  model.sources,
                  (source) => source.id,
                  (source) => this.renderGlow(source, glow),
                )
              : nothing
          }
        </div>
        <div class="top">
          <div class="title-row">
            <h2 class="title">${model.name}</h2>
            ${
              model.lights.length
                ? html`<button
                    class=${classMap({ reset: true, power: true, on: anyOn })}
                    aria-label=${label}
                    title=${label}
                    aria-pressed=${anyOn ? 'true' : 'false'}
                    ?disabled=${model.unavailable}
                    @pointerdown=${this.onDown}
                    @pointermove=${this.onMove}
                    @pointerup=${this.onUp}
                    @pointercancel=${this.onUp}
                    @pointerleave=${this.onUp}
                    @contextmenu=${(event: Event) => event.preventDefault()}
                    @click=${this.onClick}
                  >
                    <ha-icon icon="mdi:power"></ha-icon>
                  </button>`
                : nothing
            }
          </div>
          ${subtitle ? html`<div class=${classMap({ sub: true, on: anyOn })}>${subtitle}</div>` : nothing}
        </div>
        ${
          badges.length
            ? html`<div class="badges">
                ${repeat(
                  badges,
                  (slot) => slot.key,
                  (slot) =>
                    slot.element && !slot.error
                      ? slot.element
                      : html`<span class="badge-error" title=${slot.error ?? ''}
                          ><ha-icon icon="mdi:alert-circle-outline"></ha-icon
                        ></span>`,
                )}
              </div>`
            : nothing
        }
      </div>
    </ha-card>`;
  }
}

defineElement(ROOM_HEADER_CARD, VividRoomHeader);

registerCard({
  type: ROOM_HEADER_CARD,
  name: 'Vivid room header',
  description:
    'Title of a room with its power button, the lights on and the consumption, its badges, and a halo in the colors of its lights.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-room-header`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-room-header': VividRoomHeader;
  }
}
