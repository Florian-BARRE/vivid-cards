import { LitElement, css, html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { fireEvent, toggleEntity } from '../../core/actions';
import type { HomeAssistant } from '../../core/hass-types';
import { resolveColorBar } from '../../core/light';
import { defineElement } from '../../core/register';
import { tokens } from '../../components/shared-styles';
import '../../components/vivid-light-header';
import '../../components/vivid-light-tile';
import '../../components/vivid-power-history';
import type { PowerSeriesSource } from '../../components/vivid-power-history';
import '../../components/vivid-wled-panel';
import type { ResolvedLedGroupConfig } from './config';
import type { LedGroupModel, StripModel } from './model';

/**
 * Content of the details dialog: group badges on top, then one header and tile
 * per strip, with its WLED controls and device facts. Two columns when the
 * dialog is wide enough. A tap toggles a strip, a hold asks for its more-info
 * dialog (`vivid-more-info`).
 */
export class VividLedGroupDetails extends LitElement {
  static override properties = {
    hass: { attribute: false },
    model: { attribute: false },
    config: { attribute: false },
  };

  declare hass?: HomeAssistant;
  declare model?: LedGroupModel;
  declare config?: ResolvedLedGroupConfig;

  static override styles = [
    tokens,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 18px;
        container-type: inline-size;
      }
      .summary {
        padding: 4px 0 2px;
      }
      /*
       * One column keeps the group order; two columns (wide dialogs) take every
       * other strip, so opening a device panel never moves a strip across.
       */
      .columns {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .column {
        display: contents;
      }
      section {
        order: var(--order, 0);
      }
      @container (min-width: 760px) {
        .columns {
          flex-direction: row;
          align-items: flex-start;
          gap: 20px;
        }
        .column {
          display: flex;
          flex-direction: column;
          gap: 18px;
          flex: 1;
          min-width: 0;
        }
      }
      section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }
      .extras {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
        --vivid-chip-context: var(--vivid-layer-2);
      }
    `,
  ];

  private readonly onTileGesture = (
    event: CustomEvent<{ gesture: string; entityId?: string }>,
  ): void => {
    event.stopPropagation();
    const { gesture, entityId } = event.detail;
    if (!entityId || !this.hass) return;
    if (gesture === 'tap') {
      void toggleEntity(this.hass, entityId, {
        transition: this.config?.members.get(entityId)?.transition ?? this.config?.tile.transition,
      });
    } else if (gesture === 'hold') fireEvent(this, 'vivid-more-info', { entityId });
  };

  private get lightOptions() {
    return { transition: this.config?.tile.transition };
  }

  /** A light's own transition wins over the card's. */
  private stripOptions(strip: StripModel) {
    return {
      transition:
        this.config?.members.get(strip.entityId)?.transition ?? this.config?.tile.transition,
    };
  }

  /** Consumption sources of every light, in watts. */
  private historySources(model: LedGroupModel): PowerSeriesSource[] {
    return model.detected.flatMap((strip) => {
      const source = strip.power;
      if (!source) return [];
      const unit = this.hass?.states[source.entityId]?.attributes.unit_of_measurement;
      const factor = source.kind === 'current' ? source.voltage / 1000 : unit === 'kW' ? 1000 : 1;
      return [{ entityId: source.entityId, factor, name: strip.name }];
    });
  }

  private renderHistory(model: LedGroupModel, config: ResolvedLedGroupConfig) {
    if (!config.details.history || !config.power.enabled || !model.hasPower) return nothing;
    return html`<vivid-power-history
      .hass=${this.hass}
      .sources=${this.historySources(model)}
      .price=${config.power.price}
      .currency=${config.power.currency}
    ></vivid-power-history>`;
  }

  private renderExtras(strip: StripModel, config: ResolvedLedGroupConfig) {
    if (!strip.wled || !strip.available) return nothing;
    if (!config.details.wledControls && !config.details.health) return nothing;
    return html`<vivid-wled-panel
      class="extras"
      .hass=${this.hass}
      .entities=${strip.wledEntities}
      .effectActive=${strip.effectActive}
      .settings=${config.details.wledControls}
      .device=${config.details.health}
    ></vivid-wled-panel>`;
  }

  private renderStrip(strip: StripModel, config: ResolvedLedGroupConfig, order: number) {
    const liveOverride =
      strip.ambilight && strip.liveOverride
        ? {
            available: strip.liveOverride.available ? [strip.liveOverride.entityId] : [],
            active: strip.liveOverride.active,
          }
        : undefined;
    return html`<section style=${`--order: ${order}`}>
      <vivid-light-header
        .hass=${this.hass}
        .icon=${strip.icon}
        .name=${strip.name}
        .lightEntity=${strip.entityId}
        .available=${strip.available}
        .isOn=${strip.isOn}
        .rgb=${strip.rgb}
        .brightness=${strip.brightness}
        .showPower=${config.power.enabled}
        .hasPower=${strip.power !== undefined}
        .watts=${strip.watts}
        .scale=${strip.scale}
        .lightOptions=${this.stripOptions(strip)}
        .powerEntity=${strip.power?.entityId}
        .showLiveOverride=${config.ambilight.enabled}
        .liveOverride=${liveOverride}
      ></vivid-light-header>
      <vivid-light-tile
        .hass=${this.hass}
        .entityId=${strip.entityId}
        .icon=${strip.icon}
        .name=${strip.name}
        .showEffects=${config.details.effects}
        .showState=${config.tile.state !== 'none'}
        .colorBar=${resolveColorBar(config.details.colorBar, this.hass?.states[strip.entityId])}
        .favorites=${config.details.favorites && strip.available ? config.tile.favorites : []}
        .brightnessMin=${config.tile.brightnessMin}
        .brightnessStep=${config.tile.brightnessStep}
        .lightOptions=${this.stripOptions(strip)}
        .animateEffects=${config.appearance.animateEffects}
        @vivid-gesture=${this.onTileGesture}
      ></vivid-light-tile>
      ${this.renderExtras(strip, config)}
    </section>`;
  }

  protected override render() {
    const model = this.model;
    const config = this.config;
    if (!model || !config) return nothing;
    const columns = [0, 1].map((column) =>
      model.members
        .map((strip, order) => ({ strip, order }))
        .filter(({ order }) => order % 2 === column),
    );
    return html`${config.details.summary ? this.renderSummary(model, config) : nothing}
      ${this.renderHistory(model, config)}
      <div class="columns">
        ${columns.map(
          (items) =>
            html`<div class="column">
              ${repeat(
                items,
                ({ strip }) => strip.entityId,
                ({ strip, order }) => this.renderStrip(strip, config, order),
              )}
            </div>`,
        )}
      </div>`;
  }

  private renderSummary(model: LedGroupModel, config: ResolvedLedGroupConfig) {
    return html`<vivid-light-header
      class="summary"
      variant="summary"
      .hass=${this.hass}
      .lightEntity=${model.entityId}
      .available=${model.available}
      .isOn=${model.isOn}
      .rgb=${model.rgb}
      .brightness=${model.brightness}
      .colors=${model.colors}
      .badges=${model.badges}
      .lightOptions=${this.lightOptions}
      .showPower=${config.power.enabled}
      .hasPower=${model.hasPower}
      .watts=${model.watts}
      .scale=${model.groupScale}
      .showLiveOverride=${config.ambilight.enabled}
      .liveOverride=${model.liveOverride}
    ></vivid-light-header>`;
  }
}

defineElement('vivid-led-group-details', VividLedGroupDetails);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-led-group-details': VividLedGroupDetails;
  }
}
