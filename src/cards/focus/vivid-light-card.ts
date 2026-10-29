import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { openMoreInfo, toggleEntity } from '../../core/actions';
import { glowVars } from '../../core/glow';
import type { HomeAssistant, LovelaceGridOptions } from '../../core/hass-types';
import { resolveColorBar, type ColorBar } from '../../core/light';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { formEditor } from '../../core/vivid-form-editor';
import { buttonReset, tokens } from '../../components/shared-styles';
import '../../components/vivid-light-tile';
import '../../components/vivid-wled-panel';
import { findWledEntities, type WledEntities } from '../../integrations/wled';
import { watchedChanged } from '../led-group/model';
import { STATIC_EFFECTS, resolveLightCard, type ResolvedLightCard } from './config';

export const LIGHT_CARD = 'vivid-light-card';

function wledWatched(entities: WledEntities): string[] {
  return Object.values(entities).filter((value): value is string => typeof value === 'string');
}

/**
 * One light as a Vivid tile: drag to dim, tap to toggle, hold for its dialog,
 * the color bar and the effects. A WLED strip also gets its Settings and
 * Device panels under the tile.
 */
export class VividLightCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: ResolvedLightCard;

  static getConfigElement(): HTMLElement {
    return formEditor({
      fields: [
        {
          name: 'entity',
          label: 'focus_light',
          selector: { entity: { domain: 'light' } },
          required: true,
        },
        { name: 'name', label: 'name', selector: { text: {} } },
        { name: 'icon', label: 'icon', selector: { icon: {} } },
        { name: 'effects', label: 'focus_effects', selector: { boolean: {} }, default: true },
        {
          name: 'color_bar',
          label: 'focus_color_bar',
          selector: {},
          options: [
            { value: 'auto', label: 'focus_auto' },
            { value: 'hue', label: 'color_hue' },
            { value: 'temperature', label: 'color_temperature' },
            { value: 'none', label: 'color_none' },
          ],
          default: 'auto',
        },
        { name: 'wled', label: 'focus_wled_panels', selector: { boolean: {} }, default: true },
      ],
      validate: resolveLightCard,
    });
  }

  static getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    const light = Object.keys(hass?.states ?? {}).find((id) => id.startsWith('light.'));
    return { entity: light ?? 'light.example' };
  }

  setConfig(config: unknown): void {
    this._config = resolveLightCard(config);
  }

  getCardSize(): number {
    return 2;
  }

  getGridOptions(): LovelaceGridOptions {
    return { columns: 12, rows: 'auto', min_columns: 6 };
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
      .card {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .warning {
        padding: 16px;
        color: var(--error-color, #db4437);
      }
    `,
  ];

  private wled(): WledEntities | undefined {
    const hass = this.hass;
    const config = this._config;
    if (!hass || !config?.wled) return undefined;
    const entities = findWledEntities(hass, config.entity);
    return wledWatched(entities).length ? entities : undefined;
  }

  protected override shouldUpdate(changed: PropertyValues<this>): boolean {
    if (!this.hass || !this._config) return changed.has('_config');
    if (changed.size === 1 && changed.has('hass')) {
      const wled = this.wled();
      return watchedChanged(changed.get('hass') as HomeAssistant | undefined, this.hass, [
        this._config.entity,
        ...(wled ? wledWatched(wled) : []),
      ]);
    }
    return true;
  }

  private readonly onGesture = (event: CustomEvent<{ gesture: string }>): void => {
    event.stopPropagation();
    const hass = this.hass;
    const config = this._config;
    if (!hass || !config) return;
    if (event.detail.gesture === 'tap') void toggleEntity(hass, config.entity);
    else if (event.detail.gesture === 'hold') openMoreInfo(this, config.entity);
  };

  private readonly onMoreInfo = (event: CustomEvent<{ entityId: string }>): void => {
    event.stopPropagation();
    openMoreInfo(this, event.detail.entityId);
  };

  protected override render() {
    const hass = this.hass;
    const config = this._config;
    if (!hass || !config) return nothing;
    const state = hass.states[config.entity];
    if (!state) {
      return html`<ha-card><div class="warning">Entity not found: ${config.entity}</div></ha-card>`;
    }
    const colorBar: ColorBar = resolveColorBar(config.colorBar, state);
    const effect = state.attributes.effect;
    const wled = this.wled();
    return html`<ha-card>
      <div class="card" style=${styleMap(glowVars(config.glow))}>
        <vivid-light-tile
          .hass=${hass}
          .entityId=${config.entity}
          .icon=${
            config.icon ??
            (state.attributes.icon as string | undefined) ??
            (wled ? 'mdi:led-strip-variant' : 'mdi:lightbulb')
          }
          show-name
          .name=${config.name ?? (state.attributes.friendly_name as string | undefined)}
          .showEffects=${config.effects}
          .colorBar=${colorBar}
          @vivid-gesture=${this.onGesture}
          @vivid-more-info=${this.onMoreInfo}
        ></vivid-light-tile>
        ${
          wled && state.state !== 'unavailable'
            ? html`<vivid-wled-panel
                .hass=${hass}
                .entities=${wled}
                .effectActive=${
                  state.state === 'on' &&
                  typeof effect === 'string' &&
                  !STATIC_EFFECTS.has(effect.toLowerCase())
                }
                settings
                device
              ></vivid-wled-panel>`
            : nothing
        }
      </div>
    </ha-card>`;
  }
}

defineElement(LIGHT_CARD, VividLightCard);

registerCard({
  type: LIGHT_CARD,
  name: 'Vivid Light',
  description: 'One light as a Vivid tile; a WLED strip also gets its settings and device panels.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}/blob/main/docs/cards/light.md`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-light-card': VividLightCard;
  }
}
