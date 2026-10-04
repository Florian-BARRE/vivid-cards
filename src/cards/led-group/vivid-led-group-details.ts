import { LitElement, css, html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { fireEvent } from '../../core/actions';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { tokens } from '../../components/shared-styles';
import '../../components/vivid-light-header';
import '../../components/vivid-light-tile';
import type { ResolvedLedGroupConfig } from './config';
import type { LedGroupModel, StripModel } from './model';

/**
 * Content of the details dialog: group badges on top, then one header and tile
 * per strip. Re-fires tile holds as `vivid-more-info`.
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

  private readonly onTileHold = (event: CustomEvent<{ entityId?: string }>): void => {
    event.stopPropagation();
    if (event.detail.entityId)
      fireEvent(this, 'vivid-more-info', { entityId: event.detail.entityId });
  };

  private renderStrip(strip: StripModel, config: ResolvedLedGroupConfig) {
    const liveOverride = strip.liveOverride
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
        .showPower=${config.showPower}
        .hasPower=${strip.powerEntity !== undefined}
        .watts=${strip.watts}
        .scale=${this.model?.stripScale}
        .powerEntity=${strip.powerEntity}
        .showLiveOverride=${config.showLiveOverride}
        .liveOverride=${liveOverride}
      ></vivid-light-header>
      <vivid-light-tile
        .hass=${this.hass}
        .entityId=${strip.entityId}
        .icon=${config.icon}
        .name=${strip.name}
        .showEffects=${config.showEffects}
        .showHue=${config.showHue}
        @vivid-hold=${this.onTileHold}
      ></vivid-light-tile>
    </section>`;
  }

  protected override render() {
    const model = this.model;
    const config = this.config;
    if (!model || !config) return nothing;
    return html`<vivid-light-header
        class="summary"
        variant="summary"
        .hass=${this.hass}
        .lightEntity=${model.entityId}
        .available=${model.available}
        .isOn=${model.isOn}
        .rgb=${model.rgb}
        .showPower=${config.showPower}
        .hasPower=${model.members.some((m) => m.powerEntity !== undefined)}
        .watts=${model.watts}
        .scale=${model.groupScale}
        .showLiveOverride=${config.showLiveOverride}
        .liveOverride=${model.liveOverride}
      ></vivid-light-header>
      ${repeat(
        model.members,
        (strip) => strip.entityId,
        (strip) => this.renderStrip(strip, config),
      )}`;
  }
}

defineElement('vivid-led-group-details', VividLedGroupDetails);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-led-group-details': VividLedGroupDetails;
  }
}
