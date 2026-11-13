/* ====== Code Summary ======
 * Visual editor of the room header, in the order the card shows things:
 *   Source        Vivid Pilot (a room, or the whole home) or manual;
 *   Title         the title (the room's name unless written), the subtitle
 *                 and the lamps, LEDs, switches and power it counts;
 *   Power button  when it shows, what a tap does with everything off (the
 *                 room's last lighting or its lights, in Vivid Pilot mode)
 *                 and with a light on, a hold — or any action;
 *   Badges        every badge, shown or hidden, in order, with its options;
 *   Look          halo.
 * In manual mode the same sections ask for every entity by hand.
 */

import { LitElement, css, html, nothing } from 'lit';
import { fireEvent } from '../../core/actions';
import { friendlyName } from '../../core/entities';
import { GLOW_SLIDER } from '../../core/glow';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { HOME_NODE, PilotIndex } from '../../core/pilot';
import { defineElement } from '../../core/register';
import type { SlotMode, SlotValue } from '../../core/slots';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { pilotNodeLabel } from '../../i18n/pilot';
import { tokens } from '../../components/shared-styles';
import '../../components/editor/vivid-action-field';
import { sourceSection } from '../../components/editor/source-section';
import '../../components/editor/vivid-editor-section';
import '../../components/editor/vivid-slot-editor';
import {
  POWER_ON,
  POWER_SHOW,
  resolveRoomHeaderConfig,
  type PowerButtonConfig,
  type ResolvedRoomHeaderConfig,
  type RoomHeaderCardConfig,
} from './config';
import {
  headerSource,
  setOption,
  setPowerButton,
  setSlot,
  setSource,
  shownBadges,
  type HeaderSource,
} from './editor-model';
import { roomEditorStyles } from './editor-styles';
import { buttonScope, memoryScene } from './model';
import { powerPlan, type PowerPlan } from './power-action';
import { describeWay, powerHint } from './power-text';
import { roomSlots, type RoomSlots } from './room-slots';
import { ROOM_ROLES, type RoleSpec, type RoomRole } from './roles';
import './vivid-room-badges-editor';

type Form = Record<string, unknown>;

/** The lights and the power the title counts (and the button and the halo use). */
const TITLE_ROLES: readonly RoomRole[] = ['light', 'led', 'switch', 'power'];

/** The room as the editor reads it now; `error` when the config is incomplete. */
interface RoomState {
  resolved?: ResolvedRoomHeaderConfig;
  slots?: RoomSlots;
  plan?: PowerPlan;
  /** What the button controls, and the memory scene it restores. */
  scope?: string[];
  scene?: string;
  error?: string;
}

/* ============================== Element ============================== */

export class VividRoomHeaderEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _source: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: RoomHeaderCardConfig;
  /** Kept while editing: a manual card has nothing written yet right after the switch. */
  declare _source?: HeaderSource;

  static override styles = [
    tokens,
    roomEditorStyles,
    css`
      .error {
        color: var(--error-color, #db4437);
        font-size: 12.5px;
      }
    `,
  ];

  setConfig(config: RoomHeaderCardConfig): void {
    this._config = config;
    this._source ??= headerSource(config);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void ensureHaForm().then(() => this.requestUpdate());
  }

  private rh(key: EditorStringKey, values?: Record<string, string | number>): string {
    return editorText(this.hass, key, values);
  }

  private commit(config: RoomHeaderCardConfig): void {
    this._config = config;
    fireEvent(this, 'config-changed', { config });
  }

  private state(config: RoomHeaderCardConfig): RoomState {
    try {
      const resolved = resolveRoomHeaderConfig(config);
      if (!this.hass) return { resolved };
      const slots = roomSlots(this.hass, resolved);
      const scene =
        resolved.powerOn === 'memory' ? memoryScene(this.hass, resolved.pilot) : undefined;
      const scope = buttonScope(this.hass, slots, scene);
      return { resolved, slots, scope, scene, plan: powerPlan(resolved, scene, scope) };
    } catch (error) {
      return { error: (error as Error).message.replace(/^vivid-room-header: /, '') };
    }
  }

  private form(
    schema: Form[],
    data: Form,
    labels: Record<string, string>,
    helpers: Record<string, string>,
    apply: (value: Form) => RoomHeaderCardConfig,
  ) {
    return html`<ha-form
      .hass=${this.hass}
      .data=${data}
      .schema=${schema}
      .computeLabel=${(field: { name: string }) => labels[field.name]}
      .computeHelper=${(field: { name: string }) => helpers[field.name]}
      @value-changed=${(event: CustomEvent<{ value: Form }>) => {
        event.stopPropagation();
        this.commit(apply(event.detail.value));
      }}
    ></ha-form>`;
  }

  /* ------------------------------ source ------------------------------ */

  private renderSource(config: RoomHeaderCardConfig, source: HeaderSource, state: RoomState) {
    const rooms = this.hass ? PilotIndex.of(this.hass).rooms() : [];
    const roomOptions = [
      { value: HOME_NODE, label: this.rh('rh_room_home') },
      ...rooms.map((room) => ({ value: room.area, label: room.name })),
    ];
    const picker =
      source === 'pilot'
        ? this.form(
            [{ name: 'pilot', selector: { select: { mode: 'dropdown', options: roomOptions } } }],
            { pilot: config.pilot ?? '' },
            { pilot: this.rh('src_pilot_room') },
            {},
            (value) => setOption(config, 'pilot', value.pilot),
          )
        : nothing;
    return sourceSection({
      hass: this.hass,
      choices: ['pilot', 'manual'],
      source,
      hint:
        source === 'pilot' && config.pilot && this.hass
          ? pilotNodeLabel(this.hass, config.pilot)
          : undefined,
      onSource: (next) => {
        const choice: HeaderSource = next === 'pilot' ? 'pilot' : 'manual';
        this._source = choice;
        this.commit(setSource(config, choice));
      },
      content: html`${picker}
      ${
        source === 'pilot' && !rooms.length
          ? html`<div class="error">${this.rh('rh_pilot_missing')}</div>`
          : nothing
      }
      ${
        state.error && !(source === 'pilot' && !config.pilot)
          ? html`<div class="error">${state.error}</div>`
          : nothing
      }`,
    });
  }

  /* ------------------------------ slots ------------------------------ */

  private slotRow(
    config: RoomHeaderCardConfig,
    state: RoomState,
    spec: RoleSpec,
    source: HeaderSource,
  ) {
    const modes: readonly SlotMode[] = source === 'pilot' ? ['auto', 'off'] : ['manual', 'off'];
    return html`<vivid-slot-editor
      .hass=${this.hass}
      .label=${this.rh(`rh_role_${spec.role}` as EditorStringKey)}
      .icon=${spec.icon}
      .pilot=${source === 'pilot'}
      .modes=${modes}
      .multiple=${spec.multiple}
      .domains=${spec.domains}
      .value=${config.entities?.[spec.role]}
      .resolved=${state.slots?.[spec.role]}
      @slot-changed=${(event: CustomEvent<{ value: SlotValue }>) =>
        this.commit(setSlot(this._config ?? config, spec.role, event.detail.value))}
    ></vivid-slot-editor>`;
  }

  /* ------------------------------ title ------------------------------ */

  private renderTitle(config: RoomHeaderCardConfig, state: RoomState, source: HeaderSource) {
    const auto = config.pilot && this.hass ? pilotNodeLabel(this.hass, config.pilot) : '';
    const specs = ROOM_ROLES.filter((spec) => TITLE_ROLES.includes(spec.role));
    return html`${this.form(
        [
          { name: 'name', selector: { text: {} } },
          { name: 'show_subtitle', selector: { boolean: {} } },
        ],
        { name: config.name ?? '', show_subtitle: config.show_subtitle !== false },
        { name: this.rh('rh_name'), show_subtitle: this.rh('rh_show_subtitle') },
        { name: auto ? this.rh('rh_name_auto', { name: auto }) : '' },
        (value) => {
          const name = typeof value.name === 'string' ? value.name.trim() : '';
          const next = setOption(this._config ?? config, 'name', name);
          return setOption(next, 'show_subtitle', value.show_subtitle, true);
        },
      )}
      <div class="group-title">${this.rh('rh_title_lights')}</div>
      <div class="slots">${specs.map((spec) => this.slotRow(config, state, spec, source))}</div>`;
  }

  /* ------------------------------ power button ------------------------------ */

  private actionField(
    config: RoomHeaderCardConfig,
    key: keyof PowerButtonConfig,
    label: string,
    automatic: string,
  ) {
    const value = config.power_button?.[key];
    return html`<vivid-action-field
      .hass=${this.hass}
      .label=${label}
      .value=${typeof value === 'object' ? (value as Record<string, unknown>) : undefined}
      .automatic=${automatic}
      @action-changed=${(event: CustomEvent<{ value?: Record<string, unknown> }>) =>
        this.commit(setPowerButton(this._config ?? config, key, event.detail.value))}
    ></vivid-action-field>`;
  }

  private renderPower(config: RoomHeaderCardConfig, state: RoomState, source: HeaderSource) {
    const plan = state.plan;
    const shows = POWER_SHOW.map((value) => ({
      value,
      label: this.rh(`rh_power_show_${value}` as EditorStringKey),
    }));
    const ons = POWER_ON.map((value) => ({
      value,
      label: this.rh(`rh_power_on_${value}` as EditorStringKey),
    }));
    const lights = state.slots
      ? [...state.slots.light.entities, ...state.slots.led.entities, ...state.slots.switch.entities]
      : [];
    const main = config.entity ?? lights[0];
    const schema: Form[] = [
      { name: 'show', selector: { select: { mode: 'dropdown', options: shows } } },
    ];
    if (source === 'pilot') {
      schema.push({ name: 'on', selector: { select: { mode: 'dropdown', options: ons } } });
    }
    schema.push({ name: 'entity', selector: { entity: {} } });
    return html`${this.form(
        schema,
        {
          show: config.power_button?.show ?? 'auto',
          on: config.power_button?.on ?? 'memory',
          entity: config.entity ?? '',
        },
        {
          show: this.rh('rh_power_show'),
          on: this.rh('rh_power_on'),
          entity: this.rh('rh_entity'),
        },
        { on: this.rh('rh_power_on_helper'), entity: this.rh('rh_entity_helper') },
        (value) => {
          let next = setPowerButton(this._config ?? config, 'show', value.show);
          if (source === 'pilot') {
            next = setPowerButton(next, 'on', value.on === 'memory' ? undefined : value.on);
          }
          return setOption(next, 'entity', value.entity);
        },
      )}
      ${this.renderScope(state)}
      <div class="group-title">${this.rh('rh_power_actions')}</div>
      ${this.actionField(config, 'on_action', this.rh('rh_tap_when_off'), plan ? describeWay(this.hass, plan.on, true) : '')}
      ${this.actionField(config, 'off_action', this.rh('rh_tap_when_on'), plan ? describeWay(this.hass, plan.off, false) : '')}
      ${this.actionField(
        config,
        'hold_action',
        this.rh('rh_power_hold'),
        main
          ? `${this.rh('rh_power_hold_auto')} ${this.hass?.states[main] ? friendlyName(this.hass, main) : main}`
          : '',
      )}`;
  }

  /** What the button controls, in plain words. */
  private renderScope(state: RoomState) {
    const scope = state.scope ?? [];
    const hass = this.hass;
    const names = scope.map((id) => (hass?.states[id] ? friendlyName(hass, id) : id)).join(', ');
    return html`<div class="note">
      <ha-icon .icon=${'mdi:target'}></ha-icon>
      <span
        >${
          scope.length
            ? this.rh(state.scene ? 'rh_scope_memory' : 'rh_scope_lights', { names })
            : this.rh('rh_scope_none')
        }</span
      >
    </div>`;
  }

  /* ------------------------------ badges and look ------------------------------ */

  private renderBadges(config: RoomHeaderCardConfig, state: RoomState, source: HeaderSource) {
    return html`${this.form(
        [{ name: 'show_badges', selector: { boolean: {} } }],
        { show_badges: config.show_badges !== false },
        { show_badges: this.rh('rh_show_badges') },
        {},
        (value) => setOption(this._config ?? config, 'show_badges', value.show_badges, true),
      )}
      <vivid-room-badges-editor
        .hass=${this.hass}
        .config=${config}
        .slots=${state.slots}
        .source=${source}
        @room-config-changed=${(event: CustomEvent<{ config: RoomHeaderCardConfig }>) => {
          event.stopPropagation();
          this.commit(event.detail.config);
        }}
      ></vivid-room-badges-editor>`;
  }

  private renderLook(config: RoomHeaderCardConfig) {
    return this.form(
      [{ name: 'glow', selector: GLOW_SLIDER }],
      { glow: typeof config.glow === 'number' ? config.glow : 100 },
      { glow: this.rh('glow') },
      { glow: this.rh('glow_helper') },
      (value) => setOption(this._config ?? config, 'glow', value.glow, 100),
    );
  }

  /* ------------------------------ render ------------------------------ */

  protected override render() {
    const config = this._config;
    if (!config) return nothing;
    const source = this._source ?? headerSource(config);
    const state = this.state(config);
    const room = config.pilot && this.hass ? pilotNodeLabel(this.hass, config.pilot) : '';
    const title = config.name ?? room;
    const shown = shownBadges(config, state.slots).length;
    return html`<div class="editor">
      ${this.renderSource(config, source, state)}
      <vivid-editor-section
        icon="mdi:format-title"
        .heading=${this.rh('rh_section_title')}
        .hint=${title || this.rh('rh_section_title_hint')}
        >${this.renderTitle(config, state, source)}</vivid-editor-section
      >
      <vivid-editor-section
        icon="mdi:power"
        .heading=${this.rh('rh_section_power')}
        .hint=${powerHint(this.hass, config, state.plan)}
        >${this.renderPower(config, state, source)}</vivid-editor-section
      >
      <vivid-editor-section
        icon="mdi:label-multiple-outline"
        .heading=${this.rh('rh_section_badges')}
        .hint=${this.rh('rh_section_badges_hint', { count: shown })}
        >${this.renderBadges(config, state, source)}</vivid-editor-section
      >
      <vivid-editor-section
        icon="mdi:palette-outline"
        .heading=${this.rh('rh_section_look')}
        .hint=${this.rh('rh_section_look_hint')}
        >${this.renderLook(config)}</vivid-editor-section
      >
    </div>`;
  }
}

defineElement('vivid-room-header-editor', VividRoomHeaderEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-room-header-editor': VividRoomHeaderEditor;
  }
}
