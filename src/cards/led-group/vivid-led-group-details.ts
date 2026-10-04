import { LitElement, css, html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { fireEvent, toggleEntity } from '../../core/actions';
import type { HomeAssistant } from '../../core/hass-types';
import { resolveColorBar } from '../../core/light';
import { defineElement } from '../../core/register';
import { tokens } from '../../components/shared-styles';
import '../../components/vivid-light-header';
import '../../components/vivid-light-tile';
import type { ResolvedLedGroupConfig } from './config';
import type { LedGroupModel, StripModel } from './model';

/**
 * Content of the details dialog: group badges on top, then one header and tile
 * per strip. A tap toggles a strip, a hold asks for its more-info dialog
 * (`vivid-more-info`).
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
      }
      .summary {
        padding: 4px 0 2px;
      }
      section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    `,
  ];

  private readonly onTileGesture = (
    event: CustomEvent<{ gesture: string; entityId?: string }>,
  ): void => {
    event.stopPropagation();
    const { gesture, entityId } = event.detail;
    if (!entityId || !this.hass) return;
    if (gesture === 'tap') void toggleEntity(this.hass, entityId);
    else if (gesture === 'hold') fireEvent(this, 'vivid-more-info', { entityId });
  };

  private renderStrip(strip: StripModel, config: ResolvedLedGroupConfig) {
    const liveOverride =
      strip.ambilight && strip.liveOverride
        ? {
            available: strip.liveOverride.available ? [strip.liveOverride.entityId] : [],
            active: strip.liveOverride.active,
          }
        : undefined;
    return html`<section>
      <vivid-light-header
        .hass=${this.hass}
        .icon=${config.icon}
        .name=${strip.name}
        .lightEntity=${strip.entityId}
        .available=${strip.available}
        .isOn=${strip.isOn}
        .rgb=${strip.rgb}
        .showPower=${config.power.enabled}
        .hasPower=${strip.power !== undefined}
        .watts=${strip.watts}
        .scale=${this.model?.stripScale}
        .powerEntity=${strip.power?.entityId}
        .showLiveOverride=${config.ambilight.enabled}
        .liveOverride=${liveOverride}
      ></vivid-light-header>
      <vivid-light-tile
        .hass=${this.hass}
        .entityId=${strip.entityId}
        .icon=${config.icon}
        .name=${strip.name}
        .showEffects=${config.details.effects}
        .showState=${config.tile.state !== 'none'}
        .colorBar=${resolveColorBar(config.details.colorBar, this.hass?.states[strip.entityId])}
        @vivid-gesture=${this.onTileGesture}
      ></vivid-light-tile>
    </section>`;
  }

  protected override render() {
    const model = this.model;
    const config = this.config;
    if (!model || !config) return nothing;
    return html`${config.details.summary ? this.renderSummary(model, config) : nothing}
    ${repeat(
      model.members,
      (strip) => strip.entityId,
      (strip) => this.renderStrip(strip, config),
    )}`;
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
