import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { haptic, openMoreInfo, pressButton } from '../../core/actions';
import { rgbCss } from '../../core/color';
import { glowSize, glowVars, tintTone } from '../../core/glow';
import type { HomeAssistant, LovelaceGridOptions } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { localize } from '../../i18n';
import { buttonReset, tokens } from '../../components/shared-styles';
import { VividDialog } from '../../components/vivid-dialog';
import '../../components/vivid-source-row';
import type { SourcePhase } from '../../components/vivid-source-row';
import { watchedChanged } from '../led-group/model';
import {
  AMBILIGHT_CARD,
  DEFAULT_PREFIX,
  resolveAmbilightConfig,
  type AmbilightCardConfig,
  type ResolvedAmbilightConfig,
} from './config';
import {
  SEND_TIMEOUT_MS,
  buildAmbilightModel,
  sendOutcome,
  sendSnapshot,
  temperatureColor,
  type AmbilightModel,
  type PendingSend,
} from './model';
import {
  FAN_RGB,
  RED,
  fixed,
  healthColor,
  healthIcon,
  overheatOf,
  piText,
  piTone,
  sourceLabels,
  spinSeconds,
  statusLine,
} from './view';
import { devicePrefix, lookupDevices } from './devices';
import './vivid-ambilight-card-editor';
import './vivid-ambilight-details';

/** How long the result of a send stays on its button. */
const PHASE_MS: Record<Exclude<SourcePhase, 'sending'>, number> = {
  ok: 1600,
  remote: 1400,
  sent: 1400,
  fail: 3500,
};
/** The "Cut?" confirmation of the Pi switch waits this long for the second tap. */
const ARM_MS = 3000;
/** A clean shutdown (shutdown over SSH, then the relay) shows as such this long at most. */
const STOP_MS = 120_000;

/**
 * The box behind the TV that runs the Ambilight: its HDMI switch (sent by
 * IR, confirmed by the echo), the Raspberry Pi's power relay, the box
 * temperature and its fan. The compact card keeps what is used
 * every day under the thumb; a tap opens the details (fan curve, IR learning,
 * maintenance).
 */
export class VividAmbilightCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    phases: { state: true },
    armed: { state: true },
    stopping: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: ResolvedAmbilightConfig;
  declare phases: Partial<Record<number, SourcePhase>>;
  /** The Pi switch waits for a second tap before cutting the power. */
  declare armed: boolean;
  /** When the clean shutdown of the Pi was asked, until the relay opens. */
  declare stopping?: number;

  private model?: AmbilightModel;
  private rawConfig?: AmbilightCardConfig;
  /** Registry the devices were last looked up in. */
  private resolvedFor?: HomeAssistant['entities'];
  private dialog?: VividDialog;
  private pending?: PendingSend;
  private pendingTimer?: number;
  private phaseTimers = new Map<number, number>();
  private armTimer?: number;
  private stopTimer?: number;
  /** Last confirmed input and when, to notice a change made with the remote. */
  private lastActive?: { index?: number; changed?: string };

  constructor() {
    super();
    this.phases = {};
    this.armed = false;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement('vivid-ambilight-card-editor');
  }

  static getStubConfig(hass?: HomeAssistant): Partial<AmbilightCardConfig> {
    const devices = Object.keys(hass?.devices ?? {});
    const manager =
      hass &&
      devices.find((id) => {
        const prefix = devicePrefix(hass, id);
        return (
          prefix !== undefined &&
          !!hass.states[`switch.${prefix}relay`] &&
          !!hass.states[`fan.${prefix}jonsbo_fan`]
        );
      });
    return manager ? { device: manager } : { prefix: DEFAULT_PREFIX };
  }

  setConfig(config: AmbilightCardConfig): void {
    this.rawConfig = config;
    this.resolvedFor = undefined;
    this._config = resolveAmbilightConfig(config);
    this.lastActive = undefined;
  }

  /** Finds the entities of the configured devices again when the registry changes. */
  private resolveDevices(hass: HomeAssistant): void {
    const raw = this.rawConfig;
    if (!raw || !raw.device || this.resolvedFor === hass.entities) return;
    this.resolvedFor = hass.entities;
    this._config = resolveAmbilightConfig(raw, lookupDevices(hass, raw));
  }

  getCardSize(): number {
    return 3;
  }

  getGridOptions(): LovelaceGridOptions {
    return { columns: 12, min_columns: 6, rows: 3, min_rows: 3 };
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
      .panel {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
        container-type: inline-size;
      }
      .panel.offline {
        opacity: 0.6;
        filter: grayscale(0.85);
      }
      .panel vivid-source-row {
        --vivid-layer-1: var(--vivid-layer-2);
        --vivid-layer-2: color-mix(in srgb, var(--vivid-layer-0) 45%, var(--vivid-layer-1));
      }
      .head {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .title {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1 1 auto;
        min-width: 0;
        padding: 2px;
        border-radius: 14px;
        text-align: left;
      }
      .disc {
        position: relative;
        display: grid;
        place-items: center;
        flex: none;
        --vivid-glow-size: ${unsafeCSS(glowSize(40))};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--disc-bg, var(--vivid-layer-2));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
        transition:
          background 0.4s ease,
          box-shadow 0.4s ease,
          color 0.4s ease;
      }
      .disc ha-icon {
        --mdc-icon-size: 22px;
        display: inline-flex;
      }
      .disc.spin ha-icon {
        animation: spin var(--spin, 1.2s) linear infinite;
        animation-play-state: var(--vivid-glow-play, running);
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .names {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .name {
        font-size: 15px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .status {
        font-size: 12px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .status.alarm {
        color: var(--error-color, #ef5350);
        font-weight: 600;
      }
      .status.warn {
        color: var(--warning-color, #f9a825);
        font-weight: 600;
      }
      .values {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: none;
        padding: 4px 2px;
        border-radius: 12px;
      }
      .value {
        display: inline-flex;
        align-items: center;
        gap: 1px;
        font-size: 16px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .value ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
      }
      .value small {
        margin-left: 1px;
        font-size: 11px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .value.alarm {
        color: var(--error-color, #ef5350);
      }

      .pi {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex: none;
        height: 36px;
        padding: 0 4px 0 3px;
        box-sizing: border-box;
        border-radius: 18px;
        background: var(--vivid-layer-2);
        font-size: 12.5px;
        font-weight: 600;
        transition: background 0.2s ease;
      }
      .pi.armed {
        background: color-mix(in srgb, var(--error-color, #ef5350) 22%, var(--vivid-layer-2));
        color: var(--error-color, #ef5350);
      }
      .pi.stopping {
        color: rgb(255, 193, 7);
      }
      .pi.stopping:disabled {
        opacity: 1;
      }
      .pi:disabled {
        opacity: 0.5;
        cursor: default;
      }
      .pid {
        display: grid;
        place-items: center;
        --vivid-glow-size: ${unsafeCSS(glowSize(30))};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(
          --disc-bg,
          color-mix(in srgb, var(--vivid-layer-0) 45%, var(--vivid-layer-1))
        );
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
      }
      .pid ha-icon {
        --mdc-icon-size: 17px;
        display: inline-flex;
      }
      .switch {
        position: relative;
        width: 34px;
        height: 22px;
        border-radius: 11px;
        background: rgba(var(--vivid-rgb-text), 0.18);
        transition: background-color 0.2s ease;
      }
      .switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--primary-text-color);
        opacity: 0.85;
        transition: transform 0.2s ease;
      }
      .switch.on {
        background: var(--success-color, #66bb6a);
      }
      .switch.on::after {
        transform: translateX(12px);
        background: #fff;
        opacity: 1;
      }
      .pi.armed .switch {
        background: var(--error-color, #ef5350);
      }
      /* Narrow cards: the Pi label goes, the values tighten. */
      @container (max-width: 400px) {
        .pi:not(.armed):not(.stopping) .label {
          display: none;
        }
        .head:has(.pi.armed) .values,
        .head:has(.pi.stopping) .values {
          display: none;
        }

        .values {
          gap: 5px;
        }
        .value {
          font-size: 15px;
        }
      }
      .warning {
        padding: 16px;
        color: var(--error-color, #db4437);
      }
      @media (prefers-reduced-motion: reduce) {
        .disc.spin ha-icon {
          animation: none;
        }
      }
    `,
  ];

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.pendingTimer);
    window.clearTimeout(this.armTimer);
    window.clearTimeout(this.stopTimer);
    for (const timer of this.phaseTimers.values()) window.clearTimeout(timer);
    this.phaseTimers.clear();
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
    const hass = this.hass;
    if (hass) this.resolveDevices(hass);
    const config = this._config;
    if (!hass || !config) return;
    this.model = buildAmbilightModel(hass, config);
    this.trackSends(hass, config);
    // The relay opened: the shutdown is over.
    if (this.stopping !== undefined && !this.model.relay.on) this.stopping = undefined;
  }

  protected override updated(): void {
    if (this.dialog?.open) this.renderDialogContent();
  }

  /* ---------------------------------- sends --------------------------------- */

  private setPhase(index: number, phase: SourcePhase | undefined): void {
    window.clearTimeout(this.phaseTimers.get(index));
    this.phaseTimers.delete(index);
    const phases = { ...this.phases };
    if (phase) phases[index] = phase;
    else delete phases[index];
    this.phases = phases;
    if (phase && phase !== 'sending') {
      this.phaseTimers.set(
        index,
        window.setTimeout(() => this.setPhase(index, undefined), PHASE_MS[phase]),
      );
    }
  }

  /** Resolves a pending send, and notices inputs changed with the original remote. */
  private trackSends(hass: HomeAssistant, config: ResolvedAmbilightConfig): void {
    const snapshot = sendSnapshot(hass, config);
    const pending = this.pending;
    if (pending) {
      const outcome = sendOutcome(pending, snapshot, Date.now());
      if (outcome !== 'pending') {
        this.pending = undefined;
        window.clearTimeout(this.pendingTimer);
        this.setPhase(pending.index, outcome);
        haptic(this, outcome === 'ok' ? 'success' : outcome === 'fail' ? 'failure' : 'light');
      }
    } else if (
      this.lastActive &&
      snapshot.active !== undefined &&
      snapshot.activeChanged !== this.lastActive.changed &&
      snapshot.active !== this.lastActive.index
    ) {
      this.setPhase(snapshot.active, 'remote');
    }
    this.lastActive = { index: snapshot.active, changed: snapshot.activeChanged };
  }

  private readonly selectSource = (event: CustomEvent<{ index: number }>): void => {
    const hass = this.hass;
    const config = this._config;
    const input = this.model?.hdmi.inputs[event.detail.index];
    if (!hass || !config || !input?.available) return;
    const index = event.detail.index;
    haptic(this, 'light');
    if (this.pending && this.pending.index !== index) this.setPhase(this.pending.index, undefined);
    this.pending = { index, at: Date.now(), before: sendSnapshot(hass, config) };
    this.setPhase(index, 'sending');
    window.clearTimeout(this.pendingTimer);
    // Nothing may come back: decide when the wait is over.
    this.pendingTimer = window.setTimeout(() => {
      if (this.hass && this._config) this.trackSends(this.hass, this._config);
    }, SEND_TIMEOUT_MS + 50);
    void pressButton(hass, input.button);
  };

  /* ----------------------------------- Pi ----------------------------------- */

  private disarm(): void {
    window.clearTimeout(this.armTimer);
    this.armTimer = undefined;
    this.armed = false;
  }

  private readonly togglePi = (): void => {
    const hass = this.hass;
    const config = this._config;
    const model = this.model;
    if (!hass || !config || !model?.relay.available) return;
    const power = model.power.entityId;
    if (this.stopping !== undefined || model.power.stopping) return;
    if (!model.relay.on) {
      haptic(this, 'light');
      void hass.callService('switch', 'turn_on', {}, { entity_id: power });
      return;
    }
    if (config.confirmPiOff && !this.armed) {
      haptic(this, 'warning');
      this.armed = true;
      window.clearTimeout(this.armTimer);
      this.armTimer = window.setTimeout(() => this.disarm(), ARM_MS);
      return;
    }
    this.disarm();
    haptic(this, 'medium');
    if (model.power.clean) {
      this.stopping = Date.now();
      window.clearTimeout(this.stopTimer);
      this.stopTimer = window.setTimeout(() => {
        this.stopping = undefined;
      }, STOP_MS);
    }
    void hass.callService('switch', 'turn_off', {}, { entity_id: power });
  };

  /* --------------------------------- details -------------------------------- */

  openDetails(): void {
    if (!this.model) return;
    if (!this.dialog) {
      this.dialog = new VividDialog();
      this.dialog.addEventListener('vivid-dialog-close-request', () => this.dialog?.hide());
      this.dialog.addEventListener('vivid-source-select', this.selectSource as EventListener);
      this.dialog.addEventListener('vivid-more-info', ((
        event: CustomEvent<{ entityId: string }>,
      ) => {
        const entityId = event.detail.entityId;
        this.dialog?.hide();
        window.setTimeout(() => openMoreInfo(this, entityId), 50);
      }) as EventListener);
    }
    haptic(this, 'light');
    this.renderDialogContent();
    this.dialog.show();
  }

  private renderDialogContent(): void {
    const dialog = this.dialog;
    const model = this.model;
    const config = this._config;
    if (!dialog || !model || !config) return;
    dialog.label = model.name;
    dialog.closeLabel = localize(this.hass, 'close');
    for (const [name, value] of Object.entries(glowVars(config.glow))) {
      dialog.style.setProperty(name, value);
    }
    dialog.content = html`<vivid-ambilight-details
      .hass=${this.hass}
      .model=${model}
      .config=${config}
      .phases=${this.phases}
    ></vivid-ambilight-details>`;
  }

  /* --------------------------------- render --------------------------------- */

  private renderHead(model: AmbilightModel) {
    const hass = this.hass;
    const color = healthColor(model);
    const alarm = model.alarms.some(
      (item) => item === 'overheat' || item === 'cpuoverheat' || item === 'stalled',
    );
    const tone = color ? tintTone(color, alarm ? 0.95 : 0.8) : undefined;
    const spin = model.online ? spinSeconds(model.fan.percentage) : undefined;
    const status = statusLine(hass, model);
    // Box temperature, and the Pi's CPU when HyperHDR sends it: the one that
    // drives the fan stands out.
    const box = model.temperature ?? model.temperatureBmp;
    const boxColor = box === undefined ? undefined : temperatureColor(box, overheatOf(model));
    const cpu = model.cpuTemperature;
    const cpuColor =
      cpu === undefined ? undefined : temperatureColor(cpu, model.cpu?.overheat.value ?? 80);
    const byCpu = model.fan.source === 'cpu';
    // The head has room for one temperature: the one that overheats, else
    // the one that drives the fan.
    const boxHot = model.alarms.includes('overheat');
    const cpuHot = model.alarms.includes('cpuoverheat') && cpu !== undefined;
    const showCpu = boxHot || cpuHot ? cpuHot : byCpu && cpu !== undefined;
    const showBox = boxHot || !showCpu;
    const speed = model.fan.percentage;
    const pi = piTone(model.pi);
    const stopping = this.stopping !== undefined || model.power.stopping;
    const piLabel = stopping
      ? localize(hass, 'amb_stopping')
      : this.armed
        ? localize(hass, model.power.clean ? 'amb_shutdown_confirm' : 'amb_cut_confirm')
        : localize(hass, 'amb_pi');
    const piTitle = `${localize(hass, 'amb_pi_title')} · ${piText(hass, model.pi)}`;
    return html`<div class="head">
      <button
        type="button"
        class="reset title"
        title=${localize(hass, 'details')}
        @click=${() => this.openDetails()}
      >
        <span
          class=${classMap({ disc: true, spin: spin !== undefined })}
          style=${styleMap({
            '--disc-bg': tone?.background,
            '--disc-shadow': tone?.shadow,
            '--disc-color': tone?.iconColor,
            '--spin': spin === undefined ? undefined : `${spin}s`,
          })}
          ><ha-icon .icon=${healthIcon(model)}></ha-icon
        ></span>
        <span class="names">
          <span class="name">${model.name}</span>
          <span class=${classMap({ status: true, [status.tone ?? 'plain']: true })}
            >${status.text}</span
          >
        </span>
      </button>
      <button
        type="button"
        class="reset values"
        title=${localize(hass, 'details')}
        @click=${() => this.openDetails()}
      >
        ${
          showBox
            ? html`<span
                class=${classMap({ value: true, alarm: model.alarms.includes('overheat') })}
              >
                <ha-icon
                  icon="mdi:thermometer"
                  style=${styleMap({ color: boxColor ? rgbCss(boxColor) : 'var(--secondary-text-color)' })}
                ></ha-icon
                >${box === undefined ? '—' : fixed(hass, box, 1)}<small>°C</small>
              </span>`
            : nothing
        }
        ${
          showCpu && cpu !== undefined
            ? html`<span
                class=${classMap({ value: true, alarm: model.alarms.includes('cpuoverheat') })}
                title=${localize(hass, 'amb_curve_cpu')}
              >
                <ha-icon
                  icon="mdi:cpu-64-bit"
                  style=${styleMap({ color: cpuColor ? rgbCss(cpuColor) : 'var(--secondary-text-color)' })}
                ></ha-icon
                >${fixed(hass, cpu, 1)}<small>°C</small>
              </span>`
            : nothing
        }
        <span class=${classMap({ value: true, alarm: model.fan.stalled })}>
          <ha-icon
            icon="mdi:fan"
            style=${styleMap({ color: rgbCss(model.fan.stalled ? RED : FAN_RGB) })}
          ></ha-icon
          >${speed === undefined ? '—' : speed}<small>%</small>
        </span>
      </button>
      <button
        type="button"
        class=${classMap({ reset: true, pi: true, armed: this.armed, stopping })}
        role="switch"
        aria-checked=${model.relay.on ? 'true' : 'false'}
        aria-label=${piTitle}
        title=${piTitle}
        ?disabled=${!model.online || !model.relay.available || stopping}
        @click=${this.togglePi}
      >
        <span
          class="pid"
          style=${styleMap({
            '--disc-bg': this.armed ? undefined : pi?.background,
            '--disc-shadow': this.armed ? undefined : pi?.shadow,
            '--disc-color': this.armed ? 'var(--error-color, #ef5350)' : pi?.iconColor,
          })}
          ><ha-icon icon="mdi:raspberry-pi"></ha-icon
        ></span>
        <span class="label">${piLabel}</span>
        <span class=${classMap({ switch: true, on: model.relay.on })}></span>
      </button>
    </div>`;
  }

  protected override render() {
    const config = this._config;
    const model = this.model;
    if (!config || !this.hass) return nothing;
    if (
      !model ||
      (!model.fan.available && !model.relay.available && !this.hass.states[config.entities.online])
    ) {
      return html`<ha-card
        ><div class="warning">Ambilight manager not found: ${config.entities.relay}</div></ha-card
      >`;
    }
    const items = model.hdmi.inputs.map((input) => ({
      name: input.name,
      icon: input.icon,
      available: model.online && input.available,
    }));
    return html`<ha-card>
      <div
        class=${classMap({ panel: true, offline: !model.online })}
        style=${styleMap(glowVars(config.glow))}
      >
        ${this.renderHead(model)}
        <vivid-source-row
          .items=${items}
          .active=${model.hdmi.active}
          .phases=${this.phases}
          .labels=${sourceLabels(this.hass)}
          ?disabled=${!model.online}
          @vivid-source-select=${this.selectSource}
        ></vivid-source-row>
      </div>
    </ha-card>`;
  }
}

defineElement(AMBILIGHT_CARD, VividAmbilightCard);

registerCard({
  type: AMBILIGHT_CARD,
  name: 'Vivid Ambilight manager',
  description:
    'The box behind the TV: HDMI source by IR with echo confirmation, Raspberry Pi power, box temperature and fan curve.',
  preview: false,
  documentationURL: `${REPOSITORY_URL}#vivid-ambilight-card`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-ambilight-card': VividAmbilightCard;
  }
}
