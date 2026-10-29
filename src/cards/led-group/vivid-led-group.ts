import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { runAction, type ActionConfig } from '../../core/action-handler';
import { haptic, openMoreInfo, selectOption, toggleEntity } from '../../core/actions';
import { domainOf } from '../../core/entities';
import { glowVars, lightTone, toggleTone } from '../../core/glow';
import type { HomeAssistant, LovelaceGridOptions } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { localize } from '../../i18n';
import { buttonReset, tokens } from '../../components/shared-styles';
import { VividDialog } from '../../components/vivid-dialog';
import '../../components/vivid-chip';
import '../../components/vivid-light-header';
import { formatWatts } from '../../components/vivid-light-header';
import '../../components/vivid-light-tile';
import { buildAmbilightSide, type AmbilightSide } from './ambilight-link';
import { readExpanded, writeExpanded } from './fold';
import type { VividAmbilightRail } from './vivid-ambilight-rail';
import './vivid-ambilight-rail';
import {
  CARD_TYPE,
  resolveConfig,
  type LedGroupCardConfig,
  type ResolvedLedGroupConfig,
} from './config';
import { buildLedGroupModel, watchedChanged, type LedGroupModel } from './model';
import './vivid-led-group-details';
import './vivid-led-group-editor';

const NAVIGATION_EVENTS = ['location-changed', 'popstate', 'hashchange'] as const;

/**
 * A light group (or a single light) with its strips one tap away: header with
 * consumption, live override and power badges, a brightness/color tile, and a
 * details dialog listing every strip.
 */
export class VividLedGroup extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _expanded: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: ResolvedLedGroupConfig;
  /** `layout: collapsible`: the tile is unfolded. */
  declare _expanded: boolean;

  private model?: LedGroupModel;
  /** The Ambilight box and what the screen drives, when the card has a box. */
  private side?: AmbilightSide;
  private dialog?: VividDialog;
  /** The details hash was pushed by this card, so closing goes back in history. */
  private pushedHash = false;

  static getConfigElement(): HTMLElement {
    return document.createElement('vivid-led-group-editor');
  }

  static getStubConfig(hass?: HomeAssistant): Partial<LedGroupCardConfig> {
    const lights = Object.values(hass?.states ?? {}).filter(
      (state) => domainOf(state.entity_id) === 'light',
    );
    const group = lights.find((state) => Array.isArray(state.attributes.entity_id));
    return { entity: (group ?? lights[0])?.entity_id ?? 'light.example' };
  }

  setConfig(config: LedGroupCardConfig): void {
    const previous = this._config;
    const next = resolveConfig(config);
    this._config = next;
    if (previous && previous.entity === next.entity && previous.expanded !== next.expanded) {
      // The option was just changed (editor): it wins over the remembered state.
      writeExpanded(next.entity, next.expanded);
      this._expanded = next.expanded;
    } else {
      this._expanded = readExpanded(next.entity, next.expanded);
    }
  }

  getCardSize(): number {
    const config = this._config;
    if (!config) return 3;
    const rail = this.side ? 1 : 0;
    if (config.layout === 'collapsible') {
      return 1 + rail + (this._expanded ? 1 + (config.tile.favorites.length ? 1 : 0) : 0);
    }
    return (config.appearance.header ? 1 : 0) + 2 + (config.tile.favorites.length ? 1 : 0) + rail;
  }

  getGridOptions(): LovelaceGridOptions {
    if (this._config?.layout === 'collapsible') {
      // Its height changes when it folds: the grid follows the content.
      return { columns: 12, min_columns: 6, rows: 'auto', min_rows: 1 };
    }
    const rows = this.getCardSize();
    return { columns: 12, min_columns: 6, rows, min_rows: Math.min(rows, 2) };
  }

  static override styles = [
    tokens,
    buttonReset,
    css`
      :host {
        display: block;
      }
      /* The tile and the Ambilight rail share one surface. */
      .surface {
        position: relative;
        overflow: hidden;
        isolation: isolate;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
      }
      .surface.rail vivid-light-tile::part(tile) {
        border-radius: 0;
      }
      .tile-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .chevron {
        display: grid;
        place-items: center;
        width: 28px;
        height: 40px;
        border-radius: 14px;
        color: var(--secondary-text-color);
      }
      .chevron ha-icon {
        --mdc-icon-size: 22px;
        display: inline-flex;
        transition: transform 0.28s ease;
      }
      .chevron.open ha-icon {
        transform: rotate(180deg);
      }
      @media (prefers-reduced-motion: reduce) {
        .chevron ha-icon {
          transition: none;
        }
      }
      ha-card {
        height: 100%;
        box-sizing: border-box;
        background: none;
        border: none;
        box-shadow: none;
        overflow: visible;
      }
      .card {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      vivid-light-header {
        padding: 0 4px;
      }
      .warning {
        padding: 16px;
        color: var(--error-color, #db4437);
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    for (const type of NAVIGATION_EVENTS) window.addEventListener(type, this.syncWithLocation);
    this.syncWithLocation();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const type of NAVIGATION_EVENTS) window.removeEventListener(type, this.syncWithLocation);
    this.dialog?.unmount();
  }

  protected override shouldUpdate(changed: PropertyValues<this>): boolean {
    if (!this.hass || !this._config) return changed.has('_config');
    if (changed.size === 1 && changed.has('hass')) {
      return watchedChanged(changed.get('hass'), this.hass, this.model?.watched ?? []);
    }
    return true;
  }

  protected override willUpdate(): void {
    if (!this.hass || !this._config) return;
    const model = buildLedGroupModel(this.hass, this._config);
    this.side = buildAmbilightSide(this.hass, this._config, model);
    // The box and HyperHDR redraw the card too.
    if (this.side) model.watched = [...new Set([...model.watched, ...this.side.watched])];
    this.model = model;
  }

  private get rail(): VividAmbilightRail | null {
    return this.renderRoot.querySelector('vivid-ambilight-rail');
  }

  private readonly toggleFold = (): void => {
    const config = this._config;
    if (!config) return;
    haptic(this, 'light');
    this._expanded = !this._expanded;
    writeExpanded(config.entity, this._expanded);
  };

  /** Gives the strips back to the card: WLED ignores the screen again. */
  private readonly takeControl = (event: Event): void => {
    event.stopPropagation();
    const overrides = this.side?.drive.overrides ?? [];
    if (!this.hass || overrides.length === 0) return;
    void selectOption(this.hass, overrides, '1');
  };

  private readonly onRailChange = (): void => {
    if (this.dialog?.open) this.renderDialogContent();
  };

  protected override updated(): void {
    // Covers a page opened directly on the details hash, before `hass` was set.
    if (!this.dialog?.isConnected) this.syncWithLocation();
    else this.renderDialogContent();
  }

  /** CSS variables of the appearance options, for the card and its dialog. */
  private appearanceVars(): Record<string, string> {
    const appearance = this._config?.appearance;
    if (!appearance) return {};
    return {
      ...glowVars(appearance.glow),
      ...(appearance.compact ? { '--vivid-card-chip-height': '30px' } : {}),
    };
  }

  private get lightOptions() {
    return { transition: this._config?.tile.transition };
  }

  /* ----------------------------- details dialog ----------------------------- */

  private get detailsHash(): string | undefined {
    return this.model?.detailsEnabled === false ? undefined : this._config?.details.hash;
  }

  private readonly syncWithLocation = (): void => {
    const hash = this.detailsHash;
    if (!hash) return;
    const matches = window.location.hash === hash;
    if (matches && !this.dialog?.open) this.showDetails();
    else if (!matches && this.dialog?.open) {
      this.pushedHash = false;
      this.dialog.hide();
    }
  };

  private readonly openDetails = (): void => {
    if (!this.model?.detailsEnabled) {
      if (this.model) openMoreInfo(this, this.model.entityId);
      return;
    }
    const hash = this.detailsHash;
    if (hash && window.location.hash !== hash) {
      window.history.pushState(null, '', hash);
      this.pushedHash = true;
      window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
      return;
    }
    this.showDetails();
  };

  private readonly closeDetails = (): void => {
    const hash = this.detailsHash;
    if (hash && window.location.hash === hash) {
      if (this.pushedHash) {
        this.pushedHash = false;
        window.history.back();
      } else {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: true } }));
      }
      return;
    }
    this.dialog?.hide();
  };

  private showDetails(): void {
    if (!this.model) return;
    if (!this.dialog) {
      this.dialog = new VividDialog();
      this.dialog.addEventListener('vivid-dialog-close-request', this.closeDetails);
      this.dialog.addEventListener('vivid-more-info', this.onDialogMoreInfo as EventListener);
      // HDMI inputs sent from the box's details go through the rail, which tracks the echo.
      this.dialog.addEventListener('vivid-source-select', ((
        event: CustomEvent<{ index: number }>,
      ) => this.rail?.sendInput(event.detail.index)) as EventListener);
    }
    this.renderDialogContent();
    this.dialog.show();
  }

  private renderDialogContent(): void {
    if (!this.dialog || !this.model) return;
    this.dialog.label = this.model.name;
    this.dialog.closeLabel = localize(this.hass, 'close');
    this.dialog.wide = this.model.members.length > 1;
    this.dialog.removeAttribute('style');
    for (const [name, value] of Object.entries(this.appearanceVars())) {
      this.dialog.style.setProperty(name, value);
    }
    const rail = this.rail;
    this.dialog.content = html`<vivid-led-group-details
      .hass=${this.hass}
      .model=${this.model}
      .config=${this._config}
      .side=${this.side}
      .box=${rail?.boxModel ?? this.side?.box}
      .phases=${rail?.phases ?? {}}
    ></vivid-led-group-details>`;
  }

  /** More-info is opened from the card (inside the HA tree) after the dialog closes. */
  private readonly onDialogMoreInfo = (event: CustomEvent<{ entityId: string }>): void => {
    const entityId = event.detail.entityId;
    this.closeDetails();
    window.setTimeout(() => openMoreInfo(this, entityId), 50);
  };

  private readonly onMoreInfo = (event: CustomEvent<{ entityId: string }>): void => {
    event.stopPropagation();
    openMoreInfo(this, event.detail.entityId);
  };

  private readonly onTileGesture = (event: CustomEvent<{ gesture: string }>): void => {
    event.stopPropagation();
    const config = this._config;
    const model = this.model;
    if (!config || !model || !this.hass) return;
    const actions: Record<string, ActionConfig> = {
      tap: config.tile.tapAction,
      hold: model.holdAction,
      double_tap: config.tile.doubleTapAction,
    };
    runAction(actions[event.detail.gesture], {
      node: this,
      hass: this.hass,
      entityId: model.entityId,
      openDetails: model.detailsEnabled ? this.openDetails : undefined,
    });
  };

  /* --------------------------------- render --------------------------------- */

  /** Second line of the collapsible layout: lights on, then the consumption. */
  private subtitle(model: LedGroupModel, config: ResolvedLedGroupConfig): string | undefined {
    const parts: string[] = [];
    if (model.isGroup && model.available) {
      const on = model.detected.filter((strip) => strip.isOn).length;
      parts.push(`${on}/${model.detected.length}`);
    }
    if (config.power.enabled && model.hasPower && model.watts !== undefined) {
      parts.push(formatWatts(this.hass, model.watts));
    }
    return parts.length ? parts.join(' · ') : undefined;
  }

  /** Power button, live override (without a box) and fold chevron of the collapsible line. */
  private renderLineActions(model: LedGroupModel, config: ResolvedLedGroupConfig) {
    const capture = this.side?.drive.driven.length ? this.side.drive.colors : undefined;
    const colors = capture ?? (model.colors.length ? model.colors : model.rgb);
    const override = model.liveOverride;
    const showOverride = this._expanded && !this.side && config.ambilight.enabled && override;
    return html`<span slot="actions" class="tile-actions">
      ${
        showOverride
          ? html`<vivid-chip
              .icon=${'mdi:television-ambient-light'}
              .tooltip=${localize(this.hass, override.active ? 'ambilight_off' : 'ambilight_on')}
              .tone=${toggleTone(!override.active && override.available.length > 0)}
              .pressed=${!override.active}
              ?disabled=${override.available.length === 0}
              @click=${() => {
                if (!this.hass) return;
                haptic(this, 'light');
                void selectOption(this.hass, override.available, override.active ? '0' : '1');
              }}
            ></vivid-chip>`
          : nothing
      }
      <vivid-chip
        wide
        .icon=${'mdi:power'}
        .tooltip=${localize(this.hass, model.isOn ? 'power_off' : 'power_on')}
        .tone=${lightTone(colors, model.isOn, model.brightness, config.appearance.glowBoost)}
        .pressed=${model.isOn}
        ?disabled=${!model.available}
        @click=${() => {
          if (!this.hass) return;
          haptic(this, 'light');
          void toggleEntity(this.hass, model.entityId, this.lightOptions);
        }}
      ></vivid-chip>
      <button
        type="button"
        class=${`reset chevron${this._expanded ? ' open' : ''}`}
        aria-expanded=${this._expanded ? 'true' : 'false'}
        aria-label=${localize(this.hass, this._expanded ? 'led_collapse' : 'led_expand')}
        title=${localize(this.hass, this._expanded ? 'led_collapse' : 'led_expand')}
        @click=${this.toggleFold}
      >
        <ha-icon .icon=${'mdi:chevron-down'}></ha-icon>
      </button>
    </span>`;
  }

  protected override render() {
    const config = this._config;
    const model = this.model;
    if (!config || !this.hass) return nothing;
    if (!model || !this.hass.states[config.entity]) {
      return html`<ha-card><div class="warning">Entity not found: ${config.entity}</div></ha-card>`;
    }
    const collapsible = config.layout === 'collapsible';
    const side = this.side;
    const capture = side?.drive.driven.length ? side.drive.colors : undefined;
    const header =
      config.appearance.header && !collapsible
        ? html`<vivid-light-header
            .hass=${this.hass}
            .icon=${model.icon}
            .name=${model.name}
            name-interactive
            .lightEntity=${model.entityId}
            .available=${model.available}
            .isOn=${model.isOn}
            .rgb=${model.rgb}
            .colors=${capture ?? model.colors}
            .brightness=${model.brightness}
            .glowBoost=${config.appearance.glowBoost}
            .lightOptions=${this.lightOptions}
            .showPower=${config.power.enabled}
            .hasPower=${model.hasPower}
            .watts=${model.watts}
            .scale=${model.groupScale}
            .showLiveOverride=${config.ambilight.enabled && !side}
            .liveOverride=${model.liveOverride}
            @vivid-name-click=${this.openDetails}
            @vivid-more-info=${this.onMoreInfo}
          ></vivid-light-header>`
        : nothing;
    const tile = html`<vivid-light-tile
      .hass=${this.hass}
      .entityId=${model.entityId}
      .icon=${model.icon}
      .name=${model.name}
      .showEffects=${config.tile.effects}
      .showState=${config.tile.state !== 'none' || collapsible}
      .colorBar=${model.tileColorBar}
      .saturationBar=${config.tile.saturationBar}
      .doubleTap=${config.tile.doubleTapAction.action !== 'none'}
      .favorites=${config.tile.favorites}
      .badges=${model.badges}
      @vivid-more-info=${this.onMoreInfo}
      .brightnessMin=${config.tile.brightnessMin}
      .brightnessStep=${config.tile.brightnessStep}
      .lightOptions=${this.lightOptions}
      .animateEffects=${config.appearance.animateEffects}
      .collapsible=${collapsible}
      .collapsed=${collapsible && !this._expanded}
      .subtitle=${collapsible ? this.subtitle(model, config) : undefined}
      .capture=${capture}
      .captureLabel=${localize(this.hass, 'led_screen_colors')}
      @vivid-take-control=${this.takeControl}
      @vivid-gesture=${this.onTileGesture}
      >${collapsible ? this.renderLineActions(model, config) : nothing}</vivid-light-tile
    >`;
    const body = side
      ? html`<div class="surface rail">
          ${tile}
          <vivid-ambilight-rail
            .hass=${this.hass}
            .railConfig=${side.rail}
            .drive=${side.drive}
            @vivid-rail-change=${this.onRailChange}
          ></vivid-ambilight-rail>
        </div>`
      : tile;
    return html`<ha-card>
      <div class="card" style=${styleMap(this.appearanceVars())}>${header}${body}</div>
    </ha-card>`;
  }
}

defineElement(CARD_TYPE, VividLedGroup);

registerCard({
  type: CARD_TYPE,
  name: 'Vivid LED group',
  description:
    'Light group with brightness, color, effects, glowing consumption badges and a details dialog per strip. WLED aware.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-led-group`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-led-group': VividLedGroup;
  }
}
