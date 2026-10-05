import { LitElement, css, html, nothing, unsafeCSS } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { fireEvent, haptic, toggleEntity } from '../../core/actions';
import { rgbCss } from '../../core/color';
import { LIGHT_AMBER } from '../../core/glow';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { localize } from '../../i18n';
import { buttonReset, tokens } from '../../components/shared-styles';
import { formatCost, formatEnergy } from '../../components/vivid-power-history';
import { lampStatus, lampTone, lampWatts, type LampGroupModel, type LampModel } from './model';

/** Energy of the day, per lamp and in total (Wh). */
export interface LampEnergy {
  total: number;
  lamps: Record<string, number>;
}

/**
 * Details of a lamp card: every lamp with its consumption, how long it has
 * been on or off, when it was on today and a switch; the energy and cost of
 * the day at the bottom. A tap on a name asks for the lamp's Home Assistant
 * dialog (`vivid-more-info`); switching a lamp fires `vivid-lamp-switched`.
 */
export class VividLampGroupDetails extends LitElement {
  static override properties = {
    hass: { attribute: false },
    model: { attribute: false },
    showPower: { type: Boolean },
    showDuration: { type: Boolean },
    showEnergy: { type: Boolean },
    spans: { attribute: false },
    energy: { attribute: false },
  };

  declare hass?: HomeAssistant;
  declare model?: LampGroupModel;
  declare showPower: boolean;
  declare showDuration: boolean;
  declare showEnergy: boolean;
  /** Today's spans (fractions of the day so far) per lamp, once the history is in. */
  declare spans?: Record<string, [number, number][]>;
  declare energy?: LampEnergy;

  constructor() {
    super();
    this.showPower = true;
    this.showDuration = true;
    this.showEnergy = true;
  }

  static override styles = [
    tokens,
    buttonReset,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .head {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 2px 10px;
        padding: 0 6px 6px;
      }
      .title {
        font-size: 18px;
        font-weight: 600;
      }
      .summary {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .row {
        display: grid;
        grid-template-columns: 40px minmax(0, 1fr) minmax(48px, 28%) 40px;
        align-items: center;
        gap: 12px;
        padding: 6px 10px 6px 6px;
        border-radius: 18px;
        background: var(--vivid-layer-1);
      }
      .row.off {
        background: color-mix(in srgb, var(--vivid-layer-1) 60%, transparent);
      }
      .disc {
        position: relative;
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--disc-bg, rgba(var(--vivid-rgb-text), 0.08));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
        transition:
          background 0.4s ease,
          box-shadow 0.4s ease,
          color 0.4s ease;
      }
      .disc ha-icon {
        --mdc-icon-size: 20px;
        display: inline-flex;
      }
      .warn {
        position: absolute;
        right: -3px;
        bottom: -3px;
        display: grid;
        place-items: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--error-color, #db4437);
        color: #fff;
        box-shadow: 0 0 0 2px var(--vivid-layer-1);
      }
      .warn ha-icon {
        --mdc-icon-size: 12px;
      }
      .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
        text-align: left;
      }
      .name {
        font-size: 14px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .status {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        font-size: 12px;
        line-height: 1.35;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        overflow: hidden;
      }
      .status.alert {
        color: var(--error-color, #db4437);
      }
      .timeline {
        position: relative;
        height: 8px;
        border-radius: 4px;
        background: rgba(var(--vivid-rgb-text), 0.08);
        overflow: hidden;
      }
      .timeline span {
        position: absolute;
        top: 0;
        bottom: 0;
        min-width: 3px;
        border-radius: 4px;
        background: var(--span);
      }
      .toggle {
        position: relative;
        width: 40px;
        height: 24px;
        border-radius: 12px;
        background: rgba(var(--vivid-rgb-text), 0.18);
        transition: background-color 0.2s ease;
      }
      .toggle::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-text-color);
        opacity: 0.85;
        transition: transform 0.2s ease;
      }
      .toggle[aria-checked='true'] {
        background: var(--amber-color, ${unsafeCSS(rgbCss(LIGHT_AMBER))});
      }
      .toggle[aria-checked='true']::after {
        transform: translateX(16px);
        background: #fff;
        opacity: 1;
      }
      .toggle:disabled,
      .disc:disabled {
        opacity: 0.45;
        cursor: default;
      }
      .labels {
        display: grid;
        grid-template-columns: 40px minmax(0, 1fr) minmax(48px, 28%) 40px;
        gap: 12px;
        padding: 0 10px 0 6px;
        font-size: 10px;
        color: var(--secondary-text-color);
      }
      .labels .scale {
        grid-column: 3;
        display: flex;
        justify-content: space-between;
      }
      .foot {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 8px;
        padding: 8px 6px 2px;
        font-size: 13px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }
      .foot b {
        color: var(--primary-text-color);
        font-weight: 600;
      }
      @media (prefers-reduced-motion: reduce) {
        .disc,
        .toggle,
        .toggle::after {
          transition: none;
        }
      }
    `,
  ];

  private toggle(lamp: LampModel): void {
    if (!this.hass || !lamp.available) return;
    haptic(this, 'light');
    fireEvent(this, 'vivid-lamp-switched');
    void toggleEntity(this.hass, lamp.entityId);
  }

  private renderTimeline(lamp: LampModel) {
    const spans = this.spans?.[lamp.entityId];
    return html`<div class="timeline" style=${styleMap({ '--span': rgbCss(LIGHT_AMBER, 0.85) })}>
      ${(spans ?? []).map(
        ([from, to]) =>
          html`<span style=${`left: ${from * 100}%; width: ${(to - from) * 100}%`}></span>`,
      )}
    </div>`;
  }

  private renderRow(lamp: LampModel) {
    const hass = this.hass;
    const tone = lamp.isOn ? lampTone(lamp.level) : undefined;
    const energy = this.energy?.lamps[lamp.entityId];
    const status = lampStatus(hass, lamp, {
      showPower: this.showPower,
      showDuration: this.showDuration,
      explainWarning: true,
    });
    return html`<div class=${classMap({ row: true, off: !lamp.isOn })}>
      <button
        type="button"
        class="reset disc"
        style=${styleMap({
          '--disc-bg': tone?.background,
          '--disc-shadow': tone?.shadow,
          '--disc-color': tone?.iconColor,
        })}
        ?disabled=${!lamp.available}
        aria-label=${`${lamp.name} · ${localize(hass, lamp.isOn ? 'power_off' : 'power_on')}`}
        @click=${() => this.toggle(lamp)}
      >
        <ha-icon .icon=${lamp.isOn ? lamp.icon : lamp.iconOff}></ha-icon>
        ${
          lamp.warn
            ? html`<span class="warn"><ha-icon icon="mdi:lightbulb-alert-outline"></ha-icon></span>`
            : nothing
        }
      </button>
      <button
        type="button"
        class="reset text"
        title=${
          energy !== undefined && this.showEnergy
            ? `${localize(hass, 'today')} : ${formatEnergy(hass, energy)}`
            : lamp.name
        }
        @click=${() => fireEvent(this, 'vivid-more-info', { entityId: lamp.entityId })}
      >
        <span class="name">${lamp.name}</span>
        <span class=${classMap({ status: true, alert: lamp.warn })}>${status}</span>
      </button>
      ${this.renderTimeline(lamp)}
      <button
        type="button"
        class="reset toggle"
        role="switch"
        aria-checked=${lamp.isOn ? 'true' : 'false'}
        aria-label=${lamp.name}
        ?disabled=${!lamp.available}
        @click=${() => this.toggle(lamp)}
      ></button>
    </div>`;
  }

  private renderFoot() {
    const model = this.model;
    const energy = this.energy;
    if (!model || !this.showEnergy || !model.hasPower || !energy) return nothing;
    const hass = this.hass;
    const cost =
      model.price !== undefined
        ? formatCost(hass, (energy.total / 1000) * model.price, model.currency)
        : undefined;
    return html`<div class="foot">
      <span>${localize(hass, 'today')} : <b>${formatEnergy(hass, energy.total)}</b></span>
      ${cost ? html`<span>·</span><span><b>${cost}</b></span>` : nothing}
    </div>`;
  }

  protected override render() {
    const model = this.model;
    if (!model) return nothing;
    const hass = this.hass;
    const summary = [
      localize(hass, 'lights_on', { on: model.on, total: model.total }),
      this.showPower && model.watts !== undefined ? lampWatts(hass, model.watts) : undefined,
      model.warnings
        ? localize(hass, model.warnings === 1 ? 'lamps_warn_one' : 'lamps_warn', {
            n: model.warnings,
          })
        : undefined,
    ].filter(Boolean);
    return html`<div class="head">
        <span class="title">${model.name}</span>
        <span class="summary">${summary.join(' · ')}</span>
      </div>
      ${repeat(
        model.lamps,
        (lamp) => lamp.entityId,
        (lamp) => this.renderRow(lamp),
      )}
      <div class="labels">
        <span class="scale"><span>0 h</span><span>${localize(hass, 'now')}</span></span>
      </div>
      ${this.renderFoot()}`;
  }
}

defineElement('vivid-lamp-group-details', VividLampGroupDetails);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-lamp-group-details': VividLampGroupDetails;
  }
}
