import {
  LitElement,
  css,
  html,
  nothing,
  type CSSResultGroup,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { glowVars } from '../../core/glow';
import type { HomeAssistant, LovelaceGridOptions, Rgb } from '../../core/hass-types';
import { buttonReset, tokens } from '../../components/shared-styles';
import { energyStyles } from '../../energy/styles';
import { watchedChanged } from '../led-group/model';

/** The title row of a focused card. */
export interface FocusHead {
  icon: string;
  color: Rgb;
  title: string;
  sub?: string;
  aside?: TemplateResult | typeof nothing;
}

/**
 * Base of the focused cards, the parts of the large cards offered on their
 * own: a title row with its lit disc, the halo of its color behind, and a
 * body. It renders again only when one of the watched entities changes.
 */
export abstract class VividFocusCard<C extends { glow: number }> extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: C;

  protected abstract resolveConfig(raw: unknown): C;
  /** Entities whose changes render the card again. */
  protected abstract watched(config: C): string[];
  protected abstract head(config: C, hass: HomeAssistant): FocusHead;
  protected abstract renderBody(config: C, hass: HomeAssistant): TemplateResult | typeof nothing;

  setConfig(config: unknown): void {
    this._config = this.resolveConfig(config);
  }

  getCardSize(): number {
    return 4;
  }

  getGridOptions(): LovelaceGridOptions {
    return { columns: 12, rows: 'auto', min_columns: 6 };
  }

  static override styles: CSSResultGroup = [
    tokens,
    buttonReset,
    energyStyles,
    css`
      :host {
        display: block;
      }
      ha-card {
        position: relative;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .halo {
        position: absolute;
        left: -60px;
        top: -90px;
        width: 320px;
        height: 240px;
        pointer-events: none;
        opacity: calc(0.18 * var(--vivid-glow-alpha, 1));
        -webkit-mask-image: radial-gradient(closest-side, #000, transparent);
        mask-image: radial-gradient(closest-side, #000, transparent);
        transition: background 0.6s ease;
      }
      .body {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
      }
      .message {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      /* A card whose content is already a Vivid panel. */
      ha-card.bare {
        padding: 0;
        background: none;
        border: none;
        box-shadow: none;
        overflow: visible;
      }
    `,
  ];

  protected override shouldUpdate(changed: PropertyValues<this>): boolean {
    if (!this.hass || !this._config) return changed.has('_config');
    if (changed.size === 1 && changed.has('hass')) {
      return watchedChanged(
        changed.get('hass') as HomeAssistant | undefined,
        this.hass,
        this.watched(this._config),
      );
    }
    return true;
  }

  protected renderHead(head: FocusHead) {
    return html`<div class="head">
      <span
        class="disc"
        style=${styleMap({ '--disc': `rgb(${head.color.join(', ')})`, '--disc-rgb': head.color.join(', ') })}
        ><ha-icon .icon=${head.icon}></ha-icon
      ></span>
      <div class="grow">
        <div class="title">${head.title}</div>
        ${head.sub ? html`<div class="sub">${head.sub}</div>` : nothing}
      </div>
      ${head.aside ?? nothing}
    </div>`;
  }

  protected override render() {
    const config = this._config;
    const hass = this.hass;
    if (!config || !hass) return nothing;
    const head = this.head(config, hass);
    const body = this.renderBody(config, hass);
    return html`<ha-card style=${styleMap(glowVars(config.glow))}>
      ${
        config.glow > 0
          ? html`<div
              class="halo"
              aria-hidden="true"
              style=${styleMap({ background: `rgb(${head.color.join(', ')})` })}
            ></div>`
          : nothing
      }
      ${this.renderHead(head)} ${body === nothing ? nothing : html`<div class="body">${body}</div>`}
    </ha-card>`;
  }
}
