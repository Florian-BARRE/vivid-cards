import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { haptic, openMoreInfo, toggleEntity } from '../../core/actions';
import { domainOf } from '../../core/entities';
import { glowVars } from '../../core/glow';
import type { HomeAssistant, LovelaceGridOptions } from '../../core/hass-types';
import {
  energyWh,
  fetchHistory,
  fetchStates,
  onSpans,
  scaleReadings,
  startOfDay,
  type StateChange,
} from '../../core/history';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { localize } from '../../i18n';
import type { PowerSource } from '../../integrations/power';
import { buttonReset, tokens } from '../../components/shared-styles';
import { VividDialog } from '../../components/vivid-dialog';
import '../../components/vivid-chip';
import '../../components/vivid-light-header';
import { watchedChanged } from '../led-group/model';
import {
  LAMP_CARD,
  resolveLampConfig,
  type LampGroupCardConfig,
  type ResolvedLampGroupConfig,
} from './config';
import {
  buildLampGroupModel,
  lampStatus,
  lampTone,
  lampWatts,
  presetCalls,
  switchCalls,
  type LampGroupModel,
  type LampModel,
  type LampSceneModel,
} from './model';
import type { LampEnergy } from './vivid-lamp-group-details';
import './vivid-lamp-group-details';
import './vivid-lamp-group-editor';

const HOLD_MS = 500;
const MOVE_TOLERANCE_PX = 10;
/** Durations ("on for 35 min") refresh at this pace. */
const TICK_MS = 30_000;
/** Controls on the page get this surface under their translucent amber. */
const SURFACE = 'var(--vivid-layer-1)';
/** Title icon while a lamp is on. */
const AMBER_INK = 'var(--amber-color, rgb(255, 193, 7))';

interface Press {
  target: string;
  pointerId: number;
  x: number;
  y: number;
  held: boolean;
  timer: number;
}

/** Today's history behind the details: state changes and energy until `fetched`. */
interface DayHistory {
  start: number;
  fetched: number;
  changes: Record<string, StateChange[]>;
  energy: Record<string, number>;
}

/** Watts per unit of a power source (W, kW, or mA × V). */
function sourceFactor(hass: HomeAssistant, source: PowerSource): number {
  if (source.kind === 'current') return source.voltage / 1000;
  return hass.states[source.entityId]?.attributes.unit_of_measurement === 'kW' ? 1000 : 1;
}

/**
 * Lamps on smart plugs, switches or lights: on/off and consumption only.
 *
 * - `ambiance`: a header (consumption, a button for the whole group), quick
 *   presets, then a round button per lamp glowing with what it draws, with
 *   its consumption and how long it has been on or off.
 * - `line`: the whole group on one line, a small button per lamp.
 *
 * A tap switches a lamp, a hold (or a tap on the title) opens the details:
 * every lamp with today's timeline, and the energy and cost of the day.
 */
export class VividLampGroup extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: ResolvedLampGroupConfig;

  private model?: LampGroupModel;
  private dialog?: VividDialog;
  private press?: Press;
  private ticker?: number;
  private history?: DayHistory;
  private loading = false;
  /** When this card last switched lamps itself: a scene applied before is no longer current. */
  private switchedAt?: number;

  static getConfigElement(): HTMLElement {
    return document.createElement('vivid-lamp-group-editor');
  }

  static getStubConfig(hass?: HomeAssistant): Partial<LampGroupCardConfig> {
    const states = Object.values(hass?.states ?? {});
    const groups = states.filter(
      (state) =>
        ['switch', 'light'].includes(domainOf(state.entity_id)) &&
        Array.isArray(state.attributes.entity_id),
    );
    const isWled = (id: unknown) => hass?.entities?.[String(id)]?.platform === 'wled';
    const lamps =
      groups.find((state) => domainOf(state.entity_id) === 'switch') ??
      groups.find(
        (state) => !(state.attributes.entity_id as unknown[]).every((id) => isWled(id)),
      ) ??
      groups[0];
    return {
      entity:
        lamps?.entity_id ??
        states.find((state) => domainOf(state.entity_id) === 'switch')?.entity_id ??
        'switch.lamps',
    };
  }

  setConfig(config: LampGroupCardConfig): void {
    this._config = resolveLampConfig(config);
    this.history = undefined;
  }

  getCardSize(): number {
    const config = this._config;
    if (!config) return 3;
    if (config.layout === 'line') return 1;
    return 3 + (config.scenes.length ? 1 : 0);
  }

  getGridOptions(): LovelaceGridOptions {
    const rows = this.getCardSize();
    return { columns: 12, min_columns: 6, rows, min_rows: rows };
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
      vivid-light-header {
        padding: 0 4px;
      }
      .panel {
        --vivid-chip-context: var(--vivid-layer-2);
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 12px;
        border-radius: var(--vivid-tile-radius);
        background: var(--vivid-layer-1);
      }
      .scenes {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .lamps {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(66px, 1fr));
        gap: 12px 4px;
        padding: 2px 0 4px;
      }
      .lamp {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 0;
        padding: 4px 2px;
        border-radius: 16px;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }
      .lamp:active .disc,
      .mini:active {
        transform: scale(0.94);
      }
      .disc {
        position: relative;
        display: grid;
        place-items: center;
        width: 56px;
        height: 56px;
        margin-bottom: 4px;
        border-radius: 50%;
        background: var(--disc-bg, var(--vivid-layer-2));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--disabled-text-color, rgba(255, 255, 255, 0.4)));
        transition:
          background 0.4s ease,
          box-shadow 0.4s ease,
          color 0.4s ease,
          transform 0.12s ease;
      }
      .disc ha-icon {
        --mdc-icon-size: 28px;
        display: inline-flex;
      }
      .lamp .name {
        max-width: 100%;
        font-size: 14px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      /* Two lines at most on narrow cards ("off ·" / "35 min"). */
      .lamp .status {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        max-width: 100%;
        font-size: 12px;
        line-height: 1.35;
        text-align: center;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        overflow: hidden;
      }
      /* Four lamps still fit on one row of a phone. */
      .panel {
        container-type: inline-size;
      }
      @container (max-width: 360px) {
        .disc {
          width: 50px;
          height: 50px;
        }
        .disc ha-icon {
          --mdc-icon-size: 24px;
        }
        .lamp .name {
          font-size: 13px;
        }
        .lamp .status {
          font-size: 11px;
        }
      }
      .lamp.off .name {
        color: var(--secondary-text-color);
      }
      .unavailable {
        opacity: 0.45;
      }
      .warn {
        position: absolute;
        right: -2px;
        bottom: -2px;
        display: grid;
        place-items: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--error-color, #db4437);
        color: #fff;
        box-shadow: 0 0 0 2px var(--vivid-layer-1);
      }
      .warn ha-icon {
        --mdc-icon-size: 13px;
      }
      /* One line. */
      .panel.line {
        flex-direction: row;
        align-items: center;
        gap: 10px;
        padding: 8px 8px 8px 12px;
      }
      .title {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        flex: 1 1 auto;
        padding: 2px;
        border-radius: 12px;
        text-align: left;
      }
      .title > ha-icon {
        --mdc-icon-size: 24px;
        display: inline-flex;
        flex: none;
      }
      .title.on > ha-icon {
        color: ${unsafeCSS(AMBER_INK)};
      }
      .names {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .names .name {
        font-size: 16px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .names .sub {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .minis {
        display: flex;
        justify-content: flex-end;
        gap: 4px;
        flex: none;
      }
      .mini {
        position: relative;
        display: grid;
        place-items: center;
        width: calc(var(--vivid-chip-height) - 4px);
        height: calc(var(--vivid-chip-height) - 4px);
        border-radius: 50%;
        background: var(--disc-bg, var(--vivid-layer-2));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--disabled-text-color, rgba(255, 255, 255, 0.4)));
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        transition:
          background 0.4s ease,
          box-shadow 0.4s ease,
          color 0.4s ease,
          transform 0.12s ease;
      }
      .mini ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
      }
      .mini .warn {
        width: 16px;
        height: 16px;
        right: -4px;
        bottom: -4px;
      }
      .mini .warn ha-icon {
        --mdc-icon-size: 11px;
      }
      .warning {
        padding: 16px;
        color: var(--error-color, #db4437);
      }
      @media (prefers-reduced-motion: reduce) {
        .disc,
        .mini {
          transition: none;
        }
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    this.startTicker();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.cancelPress();
    this.stopTicker();
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
    if (this.hass && this._config)
      this.model = buildLampGroupModel(this.hass, this._config, Date.now(), this.switchedAt);
  }

  protected override updated(): void {
    if (this.dialog?.open) this.renderDialogContent();
  }

  private startTicker(): void {
    this.ticker ??= window.setInterval(() => {
      if (this._config?.showDuration || this.dialog?.open) this.requestUpdate();
    }, TICK_MS);
  }

  private stopTicker(): void {
    if (this.ticker !== undefined) window.clearInterval(this.ticker);
    this.ticker = undefined;
  }

  /* --------------------------------- actions -------------------------------- */

  private call(calls: { domain: string; service: string; entityIds: string[] }[]): void {
    const hass = this.hass;
    if (!hass) return;
    for (const { domain, service, entityIds } of calls) {
      if (entityIds.length) void hass.callService(domain, service, {}, { entity_id: entityIds });
    }
  }

  /** Anything on: everything off. Everything off: everything on. */
  private readonly toggleAll = (): void => {
    const model = this.model;
    if (!model) return;
    const ids = model.all.filter((lamp) => lamp.available).map((lamp) => lamp.entityId);
    this.switchedAt = Date.now();
    this.call(switchCalls(ids, model.on === 0));
  };

  private toggleLamp(lamp: LampModel): void {
    if (!this.hass || !lamp.available) return;
    this.switchedAt = Date.now();
    void toggleEntity(this.hass, lamp.entityId);
  }

  private applyScene(scene: LampSceneModel): void {
    if (!this.model) return;
    haptic(this, 'light');
    if (!scene.scene) this.switchedAt = Date.now();
    this.call(presetCalls(scene, this.model.all));
  }

  /* -------------------------------- gestures -------------------------------- */

  private cancelPress(): void {
    if (this.press) window.clearTimeout(this.press.timer);
    this.press = undefined;
  }

  /** `target`: a lamp's entity id, or `title`. */
  private run(target: string, gesture: 'tap' | 'hold'): void {
    haptic(this, gesture === 'hold' ? 'medium' : 'light');
    if (gesture === 'hold' || target === 'title') {
      this.openDetails();
      return;
    }
    const lamp = this.model?.all.find((item) => item.entityId === target);
    if (lamp) this.toggleLamp(lamp);
  }

  private onPointerDown(event: PointerEvent, target: string): void {
    if (event.button !== 0) return;
    this.cancelPress();
    const press: Press = {
      target,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      held: false,
      timer: window.setTimeout(() => {
        press.held = true;
        this.run(target, 'hold');
      }, HOLD_MS),
    };
    this.press = press;
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const press = this.press;
    if (!press || event.pointerId !== press.pointerId) return;
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > MOVE_TOLERANCE_PX) {
      this.cancelPress();
    }
  };

  private onPointerUp(event: PointerEvent, target: string): void {
    const press = this.press;
    if (!press || event.pointerId !== press.pointerId || press.target !== target) return;
    this.cancelPress();
    if (!press.held) this.run(target, 'tap');
  }

  private onKeyDown(event: KeyboardEvent, target: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.run(target, 'tap');
    } else if (event.key === 'ContextMenu') {
      event.preventDefault();
      this.run(target, 'hold');
    }
  }

  private gestures(target: string) {
    return {
      down: (event: PointerEvent) => this.onPointerDown(event, target),
      up: (event: PointerEvent) => this.onPointerUp(event, target),
      key: (event: KeyboardEvent) => this.onKeyDown(event, target),
    };
  }

  /* --------------------------------- details -------------------------------- */

  private openDetails(): void {
    if (!this.model) return;
    if (!this.dialog) {
      this.dialog = new VividDialog();
      this.dialog.addEventListener('vivid-dialog-close-request', () => this.dialog?.hide());
      this.dialog.addEventListener('vivid-lamp-switched', () => {
        this.switchedAt = Date.now();
      });
      this.dialog.addEventListener('vivid-more-info', ((
        event: CustomEvent<{ entityId: string }>,
      ) => {
        const entityId = event.detail.entityId;
        this.dialog?.hide();
        window.setTimeout(() => openMoreInfo(this, entityId), 50);
      }) as EventListener);
    }
    this.renderDialogContent();
    this.dialog.show();
    void this.loadHistory();
  }

  /** Today's state changes of the lamps and energy of their power sensors. */
  private async loadHistory(): Promise<void> {
    const hass = this.hass;
    const model = this.model;
    const config = this._config;
    if (!hass || !model || !config || this.loading) return;
    const now = Date.now();
    const start = startOfDay(now);
    // A history fetched in the last minutes is extended live; no need to fetch again.
    if (this.history && this.history.start === start && now - this.history.fetched < 300_000) {
      return;
    }
    this.loading = true;
    try {
      const sources = config.showEnergy
        ? model.all.filter((lamp): lamp is LampModel & { power: PowerSource } => !!lamp.power)
        : [];
      const [changes, series] = await Promise.all([
        fetchStates(
          hass,
          model.lamps.map((lamp) => lamp.entityId),
          start,
          now,
        ),
        fetchHistory(
          hass,
          sources.map((lamp) => lamp.power.entityId),
          start,
          now,
        ),
      ]);
      const energy: Record<string, number> = {};
      for (const lamp of sources) {
        const readings = series[lamp.power.entityId];
        if (!readings) continue;
        energy[lamp.entityId] = energyWh(
          scaleReadings(readings, sourceFactor(hass, lamp.power)),
          start,
          now,
        );
      }
      this.history = { start, fetched: now, changes, energy };
      this.renderDialogContent();
    } catch {
      // Without history the details keep the live values only.
    } finally {
      this.loading = false;
    }
  }

  /** Spans of today up to now, the changes since the fetch included. */
  private spans(): Record<string, [number, number][]> | undefined {
    const history = this.history;
    const hass = this.hass;
    if (!history || !hass || !this.model) return undefined;
    const now = Date.now();
    const spans: Record<string, [number, number][]> = {};
    for (const lamp of this.model.lamps) {
      const changes = [...(history.changes[lamp.entityId] ?? [])];
      const state = hass.states[lamp.entityId];
      const changed = state ? Date.parse(state.last_changed) : Number.NaN;
      const last = changes[changes.length - 1];
      if (state && Number.isFinite(changed) && (!last || changed > last.t)) {
        changes.push({ t: changed, s: state.state });
      }
      spans[lamp.entityId] = onSpans(changes, history.start, now);
    }
    return spans;
  }

  /** Energy until the fetch, plus what the lamps drew since at their current power. */
  private energy(): LampEnergy | undefined {
    const history = this.history;
    const model = this.model;
    if (!history || !model) return undefined;
    const hours = Math.max(0, Date.now() - history.fetched) / 3_600_000;
    const lamps: Record<string, number> = {};
    let total = 0;
    for (const lamp of model.all) {
      const base = history.energy[lamp.entityId];
      if (base === undefined) continue;
      const value = base + (lamp.watts ?? 0) * hours;
      lamps[lamp.entityId] = value;
      total += value;
    }
    return { total, lamps };
  }

  private renderDialogContent(): void {
    const dialog = this.dialog;
    const model = this.model;
    const config = this._config;
    if (!dialog || !model || !config) return;
    dialog.label = model.name;
    dialog.closeLabel = localize(this.hass, 'close');
    dialog.removeAttribute('style');
    for (const [name, value] of Object.entries(glowVars(config.glow))) {
      dialog.style.setProperty(name, value);
    }
    dialog.content = html`<vivid-lamp-group-details
      .hass=${this.hass}
      .model=${model}
      .showPower=${config.showPower}
      .showDuration=${config.showDuration}
      .showEnergy=${config.showEnergy}
      .spans=${this.spans()}
      .energy=${this.energy()}
    ></vivid-lamp-group-details>`;
  }

  /* --------------------------------- render --------------------------------- */

  private discStyle(lamp: LampModel) {
    const tone = lamp.isOn ? lampTone(lamp.level) : undefined;
    return styleMap({
      '--disc-bg': tone?.background,
      '--disc-shadow': tone?.shadow,
      '--disc-color': tone?.iconColor,
    });
  }

  private renderWarn(lamp: LampModel) {
    if (!lamp.warn) return nothing;
    return html`<span
      class="warn"
      title=${localize(this.hass, 'lamp_no_draw_hint', {
        w: lampWatts(this.hass, this._config?.warnBelow ?? 1),
      })}
      ><ha-icon icon="mdi:lightbulb-alert-outline"></ha-icon
    ></span>`;
  }

  private renderScenes(model: LampGroupModel) {
    if (!model.scenes.length) return nothing;
    return html`<div class="scenes">
      ${model.scenes.map(
        (scene) =>
          html`<vivid-chip
            .icon=${scene.icon}
            .label=${scene.name}
            .tooltip=${scene.name}
            .tone=${scene.active ? lampTone(0.55) : undefined}
            .pressed=${scene.active}
            @click=${() => this.applyScene(scene)}
          ></vivid-chip>`,
      )}
    </div>`;
  }

  private renderLamp(lamp: LampModel, config: ResolvedLampGroupConfig) {
    const gestures = this.gestures(lamp.entityId);
    const status = lampStatus(this.hass, lamp, config);
    return html`<button
      type="button"
      class=${classMap({ reset: true, lamp: true, off: !lamp.isOn, unavailable: !lamp.available })}
      aria-pressed=${lamp.isOn ? 'true' : 'false'}
      aria-label=${`${lamp.name} · ${status}`}
      ?disabled=${!lamp.available}
      @pointerdown=${gestures.down}
      @pointermove=${this.onPointerMove}
      @pointerup=${gestures.up}
      @pointercancel=${() => this.cancelPress()}
      @keydown=${gestures.key}
      @contextmenu=${(event: Event) => event.preventDefault()}
    >
      <span class="disc" style=${this.discStyle(lamp)}>
        <ha-icon .icon=${lamp.isOn ? lamp.icon : lamp.iconOff}></ha-icon>${this.renderWarn(lamp)}
      </span>
      <span class="name">${lamp.name}</span>
      <span class="status">${status}</span>
    </button>`;
  }

  private renderAmbiance(model: LampGroupModel, config: ResolvedLampGroupConfig) {
    return html`<vivid-light-header
        .hass=${this.hass}
        .icon=${model.on ? model.icon : model.iconOff}
        .name=${model.name}
        .subtitle=${localize(this.hass, 'lights_on', { on: model.on, total: model.total })}
        .iconColor=${model.on ? AMBER_INK : undefined}
        name-interactive
        .available=${model.total > 0}
        .isOn=${model.on > 0}
        .buttonTone=${lampTone(model.level, SURFACE)}
        .showPower=${config.showPower}
        .hasPower=${model.hasPower}
        .watts=${model.watts}
        .scale=${model.scale}
        .showLiveOverride=${false}
        @vivid-name-click=${() => this.openDetails()}
        @vivid-power-click=${this.toggleAll}
      ></vivid-light-header>
      <div class="panel">
        ${this.renderScenes(model)}
        <div class="lamps">
          ${repeat(
            model.lamps,
            (lamp) => lamp.entityId,
            (lamp) => this.renderLamp(lamp, config),
          )}
        </div>
      </div>`;
  }

  private renderMini(lamp: LampModel, config: ResolvedLampGroupConfig) {
    const gestures = this.gestures(lamp.entityId);
    const status = lampStatus(this.hass, lamp, config);
    return html`<button
      type="button"
      class=${classMap({ reset: true, mini: true, unavailable: !lamp.available })}
      style=${this.discStyle(lamp)}
      title=${`${lamp.name} · ${status}`}
      aria-pressed=${lamp.isOn ? 'true' : 'false'}
      aria-label=${`${lamp.name} · ${status}`}
      ?disabled=${!lamp.available}
      @pointerdown=${gestures.down}
      @pointermove=${this.onPointerMove}
      @pointerup=${gestures.up}
      @pointercancel=${() => this.cancelPress()}
      @keydown=${gestures.key}
      @contextmenu=${(event: Event) => event.preventDefault()}
    >
      <ha-icon .icon=${lamp.isOn ? lamp.icon : lamp.iconOff}></ha-icon>${this.renderWarn(lamp)}
    </button>`;
  }

  private renderLine(model: LampGroupModel, config: ResolvedLampGroupConfig) {
    const hass = this.hass;
    const sub = [
      `${model.on}/${model.total}`,
      config.showPower && model.watts !== undefined ? lampWatts(hass, model.watts) : undefined,
    ]
      .filter(Boolean)
      .join(' · ');
    const title = this.gestures('title');
    return html`<div class="panel line">
      <button
        type="button"
        class=${classMap({ reset: true, title: true, on: model.on > 0 })}
        title=${localize(hass, 'details')}
        @pointerdown=${title.down}
        @pointermove=${this.onPointerMove}
        @pointerup=${title.up}
        @pointercancel=${() => this.cancelPress()}
        @keydown=${title.key}
      >
        <ha-icon .icon=${model.on ? model.icon : model.iconOff}></ha-icon>
        <span class="names"
          ><span class="name">${model.name}</span><span class="sub">${sub}</span></span
        >
      </button>
      <div class="minis">
        ${repeat(
          model.lamps,
          (lamp) => lamp.entityId,
          (lamp) => this.renderMini(lamp, config),
        )}
      </div>
      <vivid-chip
        .icon=${'mdi:power'}
        .tooltip=${localize(hass, model.on ? 'power_off' : 'power_on')}
        .tone=${model.on ? lampTone(model.level, 'var(--vivid-layer-2)') : undefined}
        .pressed=${model.on > 0}
        ?disabled=${model.total === 0}
        @click=${() => {
          haptic(this, 'light');
          this.toggleAll();
        }}
      ></vivid-chip>
    </div>`;
  }

  protected override render() {
    const config = this._config;
    const model = this.model;
    if (!config || !this.hass) return nothing;
    if (!model || model.all.length === 0) {
      const missing = config.entity ?? config.entities?.join(', ') ?? '';
      return html`<ha-card><div class="warning">Entity not found: ${missing}</div></ha-card>`;
    }
    return html`<ha-card>
      <div class="card" style=${styleMap(glowVars(config.glow))}>
        ${config.layout === 'line' ? this.renderLine(model, config) : this.renderAmbiance(model, config)}
      </div>
    </ha-card>`;
  }
}

defineElement(LAMP_CARD, VividLampGroup);

registerCard({
  type: LAMP_CARD,
  name: 'Vivid lamp group',
  description:
    'Lamps on smart plugs or switches: a glowing button per lamp with what it draws and for how long, quick presets, and the energy and cost of the day.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-lamp-group`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-lamp-group': VividLampGroup;
  }
}
