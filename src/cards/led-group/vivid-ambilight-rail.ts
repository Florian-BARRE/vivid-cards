import { css, html, nothing, unsafeCSS } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { fireEvent } from '../../core/actions';
import { rgbCss } from '../../core/color';
import { glowSize, lightTone, tintTone } from '../../core/glow';
import type { Rgb } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { localize } from '../../i18n';
import { VividAmbilightCard } from '../ambilight/vivid-ambilight-card';
import type { AmbilightCardConfig } from '../ambilight/config';
import type { AmbilightModel } from '../ambilight/model';
import { RED, celsius, piStatusText, piText, statusLine } from '../ambilight/view';
import { railAlert, railTint, type AmbilightDrive } from './ambilight-link';

/**
 * The Ambilight rail at the bottom of a LED group: the box's state, the HDMI
 * input menu and a switch that starts or stops the Raspberry Pi. It is an
 * Ambilight card drawn as one line, so the input sends (with their echo), the
 * Pi's clean shutdown and its confirmation, and the box's details dialog are
 * exactly the ones of `vivid-ambilight-card`. Fires `vivid-rail-change` after
 * each render, so the group's dialog can follow.
 */
export class VividAmbilightRail extends VividAmbilightCard {
  static override properties = {
    ...VividAmbilightCard.properties,
    drive: { attribute: false },
    screen: { type: Boolean },
    screenColors: { attribute: false },
    drift: { type: Boolean },
    lightColors: { attribute: false },
  };

  /** What the screen drives in the group, from the card. */
  declare drive?: AmbilightDrive;
  /** Ambilight mode: the strips follow the screen. */
  declare screen: boolean;
  /** Colors of the screen in Ambilight mode. */
  declare screenColors?: Rgb[];
  /** The screen's colors drift (the picture cannot be read). */
  declare drift: boolean;
  /** Colors of the strips when the card sets them (the fixed color). */
  declare lightColors?: Rgb[];

  private railKey?: string;

  /** The Ambilight card configuration built by the group; set again only when it changes. */
  set railConfig(config: AmbilightCardConfig | undefined) {
    const key = JSON.stringify(config ?? null);
    if (!config || key === this.railKey) return;
    this.railKey = key;
    this.setConfig(config);
  }

  /** The box as the card reads it, for the group's details. */
  get boxModel(): AmbilightModel | undefined {
    return this.model;
  }

  /** Sends an HDMI input picked in the group's details. */
  sendInput(index: number): void {
    this.selectSource(new CustomEvent('vivid-source-select', { detail: { index } }));
  }

  static override styles = [
    ...VividAmbilightCard.styles,
    css`
      .rail {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 56px;
        box-sizing: border-box;
        padding: 8px 10px 8px 12px;
        border-top: 1px solid rgba(var(--vivid-rgb-text), 0.1);
        background: rgba(var(--vivid-rgb-text), 0.025);
        container-type: inline-size;
        transition: background-color 0.3s ease;
      }
      .rail.active {
        background: rgba(var(--vivid-rgb-text), 0.045);
      }
      .rail.alert {
        background: rgba(239, 83, 80, 0.12);
        border-top-color: rgba(239, 83, 80, 0.35);
      }
      .rail.offline .rtitle {
        opacity: 0.6;
      }
      .rtitle {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1 1 auto;
        min-width: 0;
        padding: 2px;
        border-radius: 14px;
        text-align: left;
      }
      .rdisc {
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${unsafeCSS(glowSize(32))};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--disc-bg, var(--vivid-layer-2));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
        transition:
          background 0.4s ease,
          box-shadow 0.4s ease;
      }
      .rdisc ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
      }
      .rail .names {
        flex: 1 1 auto;
        gap: 2px;
      }
      .rail .name {
        font-size: 13.5px;
        font-weight: 700;
      }
      .rail:not(.active):not(.alert) .name {
        color: var(--secondary-text-color);
      }
      .rail .inline .value {
        font-size: 12.5px;
      }
      .toggle {
        position: relative;
        flex: none;
        width: 42px;
        height: 24px;
        border-radius: 12px;
        background: rgba(var(--vivid-rgb-text), 0.18);
        transition: background 0.25s ease;
      }
      .toggle::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--secondary-text-color);
        transition:
          transform 0.2s ease,
          background-color 0.2s ease;
      }
      .toggle.on {
        background: var(--toggle-bg);
      }
      .toggle.on::after {
        transform: translateX(18px);
        background: #fff;
      }
      /* Ambilight mode: the screen's colors drift, like a picture. */
      .rdisc.screen,
      .toggle.on.screen {
        animation: vivid-screen-drift 8s linear infinite;
        animation-play-state: var(--vivid-glow-play, running);
      }
      @keyframes vivid-screen-drift {
        to {
          filter: hue-rotate(360deg);
        }
      }
      .toggle.armed {
        background: var(--error-color, #ef5350);
        animation: pulse 1s ease-in-out infinite;
      }
      .toggle.stopping {
        background: rgb(255, 193, 7);
      }
      .toggle:disabled {
        cursor: default;
      }
      .toggle:disabled:not(.stopping) {
        opacity: 0.5;
      }
      .missing {
        padding: 10px 12px;
        font-size: 13px;
        color: var(--error-color, #db4437);
        border-top: 1px solid rgba(var(--vivid-rgb-text), 0.1);
      }
      @media (prefers-reduced-motion: reduce) {
        .toggle.armed,
        .rdisc.screen,
        .toggle.on.screen {
          animation: none;
        }
        .toggle,
        .toggle::after,
        .rdisc,
        .rail {
          transition: none;
        }
      }
    `,
  ];

  protected override updated(): void {
    super.updated();
    fireEvent(this, 'vivid-rail-change');
  }

  private discStyle(model: AmbilightModel, alert: boolean, colors: Rgb[]) {
    if (alert) {
      const tone = tintTone(RED, 0.95);
      return {
        '--disc-bg': tone.background,
        '--disc-shadow': tone.shadow,
        '--disc-color': tone.iconColor,
      };
    }
    if (!model.online || !model.relay.on || colors.length === 0) return {};
    if (colors.length === 1) {
      const tone = lightTone(colors, true, 80);
      return { '--disc-bg': tone.background, '--disc-shadow': tone.shadow, '--disc-color': '#fff' };
    }
    const stops = [...colors, colors[0] as Rgb].map((rgb) => rgbCss(rgb)).join(', ');
    return {
      '--disc-bg': `conic-gradient(from 200deg, ${stops})`,
      '--disc-shadow': lightTone(colors, true, 80).shadow,
      '--disc-color': '#fff',
    };
  }

  private renderSubtitle(model: AmbilightModel) {
    const hass = this.hass;
    const stopping = this.stopping !== undefined || model.power.stopping;
    const alert = railAlert(model);
    if (this.armed) {
      const text = localize(hass, model.power.clean ? 'amb_shutdown_again' : 'amb_cut_again');
      return html`<span class="status alarm">${text}</span>`;
    }
    if (stopping) {
      const text = model.power.status
        ? piStatusText(hass, model.power.status)
        : localize(hass, 'amb_stopping');
      return html`<span class="status warn">${text}</span>`;
    }
    if (alert) {
      const text = statusLine(hass, model).text;
      const temperature =
        alert.temperature === undefined ? '' : ` · ${celsius(hass, alert.temperature, 0)}`;
      return html`<span class="status alarm">${text}${temperature}</span>`;
    }
    if (!model.online) {
      return html`<span class="status muted">${statusLine(hass, model).text}</span>`;
    }
    if (model.relay.on) {
      return html`<span class="inline">${this.renderValues(model, ['temperature', 'fan'])}</span>`;
    }
    return html`<span class="status muted"
      >${localize(hass, 'off')} · ${piText(hass, model.pi)}</span
    >`;
  }

  protected override render() {
    const config = this._config;
    const model = this.model;
    const hass = this.hass;
    if (!config || !hass || !model) return nothing;
    if (!model.fan.available && !model.relay.available && !hass.states[config.entities.online]) {
      return html`<div class="missing">${localize(hass, 'rail_missing')}</div>`;
    }
    const alert = railAlert(model) !== undefined;
    const colors = railTint(this.screen, this.lightColors ?? [], this.screenColors);
    const active = model.online && model.relay.on;
    const stopping = this.stopping !== undefined || model.power.stopping;
    const title = `${localize(hass, 'amb_pi_title')} · ${piText(hass, model.pi)}`;
    return html`<div class=${classMap({ rail: true, active, alert, offline: !model.online })}>
      <button
        type="button"
        class="reset rtitle"
        title=${localize(hass, 'details')}
        @click=${() => this.openDetails()}
      >
        <span
          class=${classMap({ rdisc: true, screen: this.screen && this.drift && !alert && active })}
          style=${styleMap(this.discStyle(model, alert, colors))}
          ><ha-icon .icon=${alert ? 'mdi:alert' : 'mdi:television-ambient-light'}></ha-icon
        ></span>
        <span class="names"
          ><span class="name">${model.name}</span>${this.renderSubtitle(model)}</span
        >
      </button>
      ${alert ? nothing : this.renderSourceChip(model)}
      <button
        type="button"
        class=${classMap({
          reset: true,
          toggle: true,
          on: model.relay.on,
          screen: this.screen && this.drift && model.relay.on,
          armed: this.armed,
          stopping,
        })}
        role="switch"
        aria-checked=${model.relay.on ? 'true' : 'false'}
        aria-label=${`${model.name} · ${title}`}
        title=${title}
        ?disabled=${!model.online || !model.relay.available || stopping}
        style=${styleMap({
          '--toggle-bg': colors.length
            ? `linear-gradient(90deg, ${rgbCss(colors[0] as Rgb)}, ${rgbCss(
                colors[colors.length - 1] as Rgb,
              )})`
            : 'var(--primary-color)',
        })}
        @click=${this.togglePi}
      ></button>
    </div>`;
  }
}

defineElement('vivid-ambilight-rail', VividAmbilightRail);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-ambilight-rail': VividAmbilightRail;
  }
}
