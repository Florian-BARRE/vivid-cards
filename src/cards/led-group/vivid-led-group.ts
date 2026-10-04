import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { runAction, type ActionConfig } from '../../core/action-handler';
import { openMoreInfo } from '../../core/actions';
import { domainOf } from '../../core/entities';
import { GLOW_FACTORS } from '../../core/glow';
import type { HomeAssistant, LovelaceGridOptions } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { localize } from '../../i18n';
import { tokens } from '../../components/shared-styles';
import { VividDialog } from '../../components/vivid-dialog';
import '../../components/vivid-light-header';
import '../../components/vivid-light-tile';
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
  };

  declare hass?: HomeAssistant;
  declare _config?: ResolvedLedGroupConfig;

  private model?: LedGroupModel;
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
    this._config = resolveConfig(config);
  }

  getCardSize(): number {
    const config = this._config;
    if (!config) return 3;
    return (config.appearance.header ? 1 : 0) + 2 + (config.tile.favorites.length ? 1 : 0);
  }

  getGridOptions(): LovelaceGridOptions {
    const rows = this.getCardSize();
    return { columns: 12, min_columns: 6, rows, min_rows: Math.min(rows, 2) };
  }

  static override styles = [
    tokens,
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
    if (this.hass && this._config) this.model = buildLedGroupModel(this.hass, this._config);
  }

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
      '--vivid-glow': String(GLOW_FACTORS[appearance.glow]),
      '--vivid-glow-play': appearance.glow === 'off' ? 'paused' : 'running',
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
    this.dialog.content = html`<vivid-led-group-details
      .hass=${this.hass}
      .model=${this.model}
      .config=${this._config}
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

  protected override render() {
    const config = this._config;
    const model = this.model;
    if (!config || !this.hass) return nothing;
    if (!model || !this.hass.states[config.entity]) {
      return html`<ha-card><div class="warning">Entity not found: ${config.entity}</div></ha-card>`;
    }
    const header = config.appearance.header
      ? html`<vivid-light-header
          .hass=${this.hass}
          .icon=${model.icon}
          .name=${model.name}
          name-interactive
          .lightEntity=${model.entityId}
          .available=${model.available}
          .isOn=${model.isOn}
          .rgb=${model.rgb}
          .colors=${model.colors}
          .brightness=${model.brightness}
          .lightOptions=${this.lightOptions}
          .showPower=${config.power.enabled}
          .hasPower=${model.hasPower}
          .watts=${model.watts}
          .scale=${model.groupScale}
          .showLiveOverride=${config.ambilight.enabled}
          .liveOverride=${model.liveOverride}
          @vivid-name-click=${this.openDetails}
          @vivid-more-info=${this.onMoreInfo}
        ></vivid-light-header>`
      : nothing;
    return html`<ha-card>
      <div class="card" style=${styleMap(this.appearanceVars())}>
        ${header}
        <vivid-light-tile
          .hass=${this.hass}
          .entityId=${model.entityId}
          .icon=${model.icon}
          .name=${model.name}
          .showEffects=${config.tile.effects}
          .showState=${config.tile.state !== 'none'}
          .colorBar=${model.tileColorBar}
          .doubleTap=${config.tile.doubleTapAction.action !== 'none'}
          .favorites=${config.tile.favorites}
          .badges=${model.badges}
          @vivid-more-info=${this.onMoreInfo}
          .brightnessMin=${config.tile.brightnessMin}
          .brightnessStep=${config.tile.brightnessStep}
          .lightOptions=${this.lightOptions}
          .animateEffects=${config.appearance.animateEffects}
          @vivid-gesture=${this.onTileGesture}
        ></vivid-light-tile>
      </div>
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
