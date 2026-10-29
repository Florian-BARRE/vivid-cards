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
import { glowVars } from '../core/glow';
import type { HomeAssistant, LovelaceGridOptions, Rgb } from '../core/hass-types';
import { buttonReset, tokens } from '../components/shared-styles';
import { localize } from '../i18n';
import type { ResolvedEnergyBase } from './config';
import { EnergyController, type EnergyData, type EnergyNeeds } from './data';
import { dateKey } from './days';
import { energyStyles } from './styles';

/** The title row of an energy card. */
export interface EnergyHead {
  icon: string;
  color: Rgb;
  title: string;
  sub?: string;
  /** Next to the title: period chips, a delta. */
  aside?: TemplateResult | typeof nothing;
}

/**
 * Base of the energy cards: reads the config, loads the statistics through
 * an `EnergyController`, and frames the content with a title row and the
 * loading, missing-source and no-data messages.
 */
export abstract class VividEnergyCard<C extends ResolvedEnergyBase> extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: C;

  protected readonly energy = new EnergyController(this, () =>
    this.hass && this._config
      ? {
          hass: this.hass,
          energy: this._config.energy,
          cost: this._config.cost,
          tariff: this._config.tariff,
          needs: this.needs(this._config, this.today()),
        }
      : undefined,
  );

  protected abstract resolveConfig(raw: unknown): C;
  /** What to read; read again when it changes (a period chip, say). */
  protected abstract needs(config: C, today: string): EnergyNeeds;
  protected abstract head(config: C, data: EnergyData | undefined): EnergyHead;
  protected abstract renderBody(config: C, data: EnergyData): TemplateResult | typeof nothing;

  setConfig(config: unknown): void {
    this._config = this.resolveConfig(config);
  }

  getCardSize(): number {
    return 5;
  }

  getGridOptions(): LovelaceGridOptions {
    return { columns: 12, rows: 'auto', min_columns: 6 };
  }

  protected today(): string {
    return dateKey(Date.now());
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
        padding: 18px;
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
      }
      .body {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 14px;
        min-width: 0;
      }
    `,
  ];

  protected override shouldUpdate(changed: PropertyValues<this>): boolean {
    // The content follows the statistics, not the states: a new `hass` only
    // matters for the first render (and the language).
    if (changed.size === 1 && changed.has('hass')) {
      const previous = changed.get('hass') as HomeAssistant | undefined;
      return !previous || previous.language !== this.hass?.language || !this.energy.data;
    }
    return true;
  }

  /** The halo of the title color behind the card. */
  protected halo(color: Rgb) {
    return html`<div
      class="halo"
      aria-hidden="true"
      style=${styleMap({ background: `rgb(${color.join(', ')})` })}
    ></div>`;
  }

  protected renderHead(head: EnergyHead) {
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

  protected renderState(data: EnergyData | undefined): TemplateResult | undefined {
    const error = this.energy.error;
    if (error === 'no_source')
      return html`<div class="message">${localize(this.hass, 'energy_no_source')}</div>`;
    if (error) return html`<div class="message">${error}</div>`;
    if (!data) return html`<div class="message">${localize(this.hass, 'energy_loading')}</div>`;
    if (!data.days.length)
      return html`<div class="message">${localize(this.hass, 'energy_no_data')}</div>`;
    return undefined;
  }

  /** Classes of the `ha-card`. */
  protected cardClass(): string {
    return '';
  }

  /** Whether the card draws the halo of its title color. */
  protected glows(): boolean {
    return false;
  }

  protected override render() {
    const config = this._config;
    if (!config || !this.hass) return nothing;
    const data = this.energy.data;
    const head = this.head(config, data);
    const state = this.renderState(data);
    const body = state ?? (data ? this.renderBody(config, data) : nothing);
    return html`<ha-card class=${this.cardClass()} style=${styleMap(glowVars(config.glow))}>
      ${this.glows() && config.glow > 0 ? this.halo(head.color) : nothing} ${this.renderHead(head)}
      ${body === nothing ? nothing : html`<div class="body">${body}</div>`}
    </ha-card>`;
  }
}

/** Chips choosing a period (day, week, month, year). */
export function periodChips<P extends string>(
  periods: readonly P[],
  current: P,
  label: (period: P) => string,
  pick: (period: P) => void,
) {
  return html`<div class="chips" role="group">
    ${periods.map(
      (period) =>
        html`<button
          type="button"
          class="reset chip"
          aria-pressed=${String(period === current)}
          @click=${() => pick(period)}
        >
          ${label(period)}
        </button>`,
    )}
  </div>`;
}
