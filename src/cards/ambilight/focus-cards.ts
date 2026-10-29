/**
 * The Ambilight box, one part per card: the fan, the HDMI inputs and the
 * Raspberry Pi. Each reads the box exactly like `vivid-ambilight-card` (same
 * options: `device`, `prefix`, `entities`, `inputs`, `name`…) and shows one
 * part of it, for dashboards that place them apart.
 */
import { css, html, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { openMoreInfo } from '../../core/actions';
import { glowVars } from '../../core/glow';
import type { HomeAssistant, LovelaceGridOptions } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { formEditor, type FormField } from '../../core/vivid-form-editor';
import { localize, type StringKey } from '../../i18n';
import { VividAmbilightRail } from '../led-group/vivid-ambilight-rail';
import { resolveAmbilightConfig, type AmbilightCardConfig } from './config';
import { VividAmbilightCard } from './vivid-ambilight-card';
import type { AmbilightPane } from './vivid-ambilight-details';

export const FAN_CARD = 'vivid-fan-card';
export const HDMI_CARD = 'vivid-hdmi-card';
export const PI_CARD = 'vivid-pi-card';

/** Options shared by the three cards in the visual editor. */
const BOX_FIELDS: FormField[] = [
  { name: 'device', label: 'focus_box', selector: { device: { integration: 'esphome' } } },
  { name: 'name', label: 'name', selector: { text: {} } },
];

function boxEditor(): HTMLElement {
  return formEditor({
    fields: BOX_FIELDS,
    validate: (config) => resolveAmbilightConfig(config as AmbilightCardConfig),
  });
}

/** A part of the box under its own head: the fan curve, or the input tiles. */
abstract class VividBoxPaneCard extends VividAmbilightCard {
  protected abstract readonly pane: AmbilightPane;
  protected abstract readonly heading: StringKey;

  static override styles = [
    ...VividAmbilightCard.styles,
    css`
      .panel {
        padding: 14px;
        gap: 12px;
      }
    `,
  ];

  static override getConfigElement(): HTMLElement {
    return boxEditor();
  }

  override getCardSize(): number {
    return this.pane === 'fan' ? 8 : 3;
  }

  override getGridOptions(): LovelaceGridOptions {
    return { columns: 12, min_columns: 6, rows: 'auto' };
  }

  private readonly moreInfo = (event: CustomEvent<{ entityId: string }>): void => {
    event.stopPropagation();
    openMoreInfo(this, event.detail.entityId);
  };

  protected override render() {
    const config = this._config;
    const model = this.model;
    const hass = this.hass;
    if (!config || !hass) return nothing;
    if (
      !model ||
      (!model.fan.available && !model.relay.available && !hass.states[config.entities.online])
    ) {
      return html`<ha-card
        ><div class="warning">Ambilight manager not found: ${config.entities.relay}</div></ha-card
      >`;
    }
    return html`<ha-card>
      <div class="panel" style=${styleMap(glowVars(config.glow))}>
        <vivid-ambilight-details
          .hass=${hass}
          .model=${model}
          .config=${config}
          .phases=${this.phases}
          .pane=${this.pane}
          .heading=${config.name ?? localize(hass, this.heading)}
          @vivid-source-select=${this.selectSource}
          @vivid-more-info=${this.moreInfo}
        ></vivid-ambilight-details>
      </div>
    </ha-card>`;
  }
}

/** The fan: its mode, speeds and the curve that drives it, editable. */
export class VividFanCard extends VividBoxPaneCard {
  protected readonly pane = 'fan';
  protected readonly heading = 'amb_tab_fan';
}

/** The HDMI inputs as tiles: a tap sends the input, the echo confirms it. */
export class VividHdmiCard extends VividBoxPaneCard {
  protected readonly pane = 'inputs';
  protected readonly heading = 'focus_hdmi';
}

/**
 * The Raspberry Pi on one line: its state, the box temperature and fan, the
 * HDMI input menu and the switch with its clean shutdown.
 */
export class VividPiCard extends VividAmbilightRail {
  static override styles = [
    ...VividAmbilightRail.styles,
    css`
      .pi-surface {
        overflow: hidden;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
      }
      .pi-surface .rail {
        min-height: 64px;
        padding: 10px 12px 10px 14px;
        border-top: none;
        background: none;
      }
      .pi-surface .rail.alert {
        background: rgba(239, 83, 80, 0.12);
      }
      .pi-surface .missing {
        border-top: none;
      }
    `,
  ];

  static override getConfigElement(): HTMLElement {
    return boxEditor();
  }

  static override getStubConfig(hass?: HomeAssistant): Partial<AmbilightCardConfig> {
    return VividAmbilightCard.getStubConfig(hass);
  }

  override getCardSize(): number {
    return 1;
  }

  override getGridOptions(): LovelaceGridOptions {
    return { columns: 12, min_columns: 6, rows: 'auto', min_rows: 1 };
  }

  protected override render() {
    const content = super.render();
    if (content === nothing) return nothing;
    return html`<ha-card><div class="pi-surface">${content}</div></ha-card>`;
  }
}

defineElement(FAN_CARD, VividFanCard);
defineElement(HDMI_CARD, VividHdmiCard);
defineElement(PI_CARD, VividPiCard);

registerCard({
  type: FAN_CARD,
  name: 'Vivid Fan',
  description: 'The fan of the Ambilight box: mode, speeds and its temperature curve.',
  preview: false,
  documentationURL: `${REPOSITORY_URL}/blob/main/docs/cards/fan.md`,
});
registerCard({
  type: HDMI_CARD,
  name: 'Vivid HDMI input',
  description: 'The HDMI inputs of the Ambilight box as tiles, sent by IR and confirmed.',
  preview: false,
  documentationURL: `${REPOSITORY_URL}/blob/main/docs/cards/hdmi.md`,
});
registerCard({
  type: PI_CARD,
  name: 'Vivid Raspberry Pi',
  description: 'The Raspberry Pi of the Ambilight box on one line, with its clean shutdown.',
  preview: false,
  documentationURL: `${REPOSITORY_URL}/blob/main/docs/cards/pi.md`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-fan-card': VividFanCard;
    'vivid-hdmi-card': VividHdmiCard;
    'vivid-pi-card': VividPiCard;
  }
}
