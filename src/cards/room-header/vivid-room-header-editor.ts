/* ====== Code Summary ======
 * Visual editor of the room header, in folding sections, with nothing left
 * to YAML:
 *   Room          the Vivid Pilot room everything comes from;
 *   Lights        one slot row per light role, and the power sensor;
 *   Power button  when it shows, what a tap runs in each way (the room's
 *                 memory scene, the lights, or any Home Assistant action) and
 *                 a hold;
 *   Badges        what each role shows, then the badges in order with their
 *                 options;
 *   Look          title, subtitle, halo.
 */

import { LitElement, css, html, nothing } from 'lit';
import { fireEvent } from '../../core/actions';
import { friendlyName } from '../../core/entities';
import { GLOW_SLIDER } from '../../core/glow';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { PilotIndex } from '../../core/pilot';
import type { SlotValue } from '../../core/slots';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { tokens } from '../../components/shared-styles';
import '../../components/editor/vivid-action-field';
import '../../components/editor/vivid-editor-section';
import '../../components/editor/vivid-slot-editor';
import {
  POWER_SHOW,
  resolveRoomHeaderConfig,
  type PowerButtonConfig,
  type ResolvedRoomHeaderConfig,
  type RoomHeaderCardConfig,
} from './config';
import { setOption, setPowerButton, setSlot } from './editor-model';
import { roomEditorStyles } from './editor-styles';
import { memoryScene } from './model';
import { powerPlan, type PowerPlan } from './power-action';
import { describeWay, powerHint } from './power-text';
import { roomSlots, type RoomSlots } from './room-slots';
import { ROOM_ROLES, type RoleSpec, type RoomRole } from './roles';
import './vivid-room-badges-editor';

type Form = Record<string, unknown>;

/** The room as the editor reads it now; `error` when the config is incomplete. */
interface RoomState {
  resolved?: ResolvedRoomHeaderConfig;
  slots?: RoomSlots;
  plan?: PowerPlan;
  error?: string;
}

/* ============================== Element ============================== */

export class VividRoomHeaderEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: RoomHeaderCardConfig;

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
      const lights = [...slots.light.entities, ...slots.led.entities, ...slots.switch.entities];
      const plan = powerPlan(resolved, memoryScene(this.hass, resolved.pilot), lights);
      return { resolved, slots, plan };
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

  /* ------------------------------ slots ------------------------------ */

  private slotRow(config: RoomHeaderCardConfig, state: RoomState, spec: RoleSpec) {
    return html`<vivid-slot-editor
      .hass=${this.hass}
      .label=${this.rh(`rh_role_${spec.role}` as EditorStringKey)}
      .icon=${spec.icon}
      .pilot=${true}
      .multiple=${spec.multiple}
      .domains=${spec.domains}
      .value=${config.entities?.[spec.role]}
      .resolved=${state.slots?.[spec.role]}
      @slot-changed=${(event: CustomEvent<{ value: SlotValue }>) =>
        this.commit(setSlot(this._config ?? config, spec.role, event.detail.value))}
    ></vivid-slot-editor>`;
  }

  private slotRows(config: RoomHeaderCardConfig, state: RoomState, roles: readonly RoomRole[]) {
    const specs = ROOM_ROLES.filter((spec) => roles.includes(spec.role));
    return html`<div class="slots">${specs.map((spec) => this.slotRow(config, state, spec))}</div>`;
  }

  /* ------------------------------ room ------------------------------ */

  private renderRoom(config: RoomHeaderCardConfig, state: RoomState) {
    const rooms = this.hass ? PilotIndex.of(this.hass).rooms() : [];
    const options = rooms.map((room) => ({ value: room.area, label: room.name }));
    return html`${this.form(
      [{ name: 'pilot', selector: { select: { mode: 'dropdown', options } } }],
      { pilot: config.pilot ?? '' },
      { pilot: this.rh('rh_pilot') },
      { pilot: this.rh('rh_pilot_helper') },
      (value) => setOption(this._config ?? config, 'pilot', value.pilot),
    )}
    ${rooms.length ? nothing : html`<div class="error">${this.rh('rh_pilot_missing')}</div>`}
    ${state.error ? html`<div class="error">${state.error}</div>` : nothing}`;
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

  private renderPower(config: RoomHeaderCardConfig, state: RoomState) {
    const slots = state.slots;
    const lights = slots
      ? [...slots.light.entities, ...slots.led.entities, ...slots.switch.entities]
      : [];
    const plan = state.plan;
    const shows = POWER_SHOW.map((value) => ({
      value,
      label: this.rh(`rh_power_show_${value}` as EditorStringKey),
    }));
    const main = config.entity ?? lights[0];
    return html`${this.form(
        [
          { name: 'show', selector: { select: { mode: 'dropdown', options: shows } } },
          { name: 'entity', selector: { entity: {} } },
        ],
        { show: config.power_button?.show ?? 'auto', entity: config.entity ?? '' },
        { show: this.rh('rh_power_show'), entity: this.rh('rh_entity') },
        { entity: this.rh('rh_entity_helper') },
        (value) =>
          setOption(
            setPowerButton(this._config ?? config, 'show', value.show),
            'entity',
            value.entity,
          ),
      )}
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

  /* ------------------------------ badges and look ------------------------------ */

  private renderBadges(config: RoomHeaderCardConfig, state: RoomState) {
    const roles = ROOM_ROLES.filter((spec) => spec.feeds === 'badge').map((spec) => spec.role);
    return html`${this.form(
        [{ name: 'show_badges', selector: { boolean: {} } }],
        { show_badges: config.show_badges !== false },
        { show_badges: this.rh('rh_show_badges') },
        {},
        (value) => setOption(this._config ?? config, 'show_badges', value.show_badges, true),
      )}
      <div class="group-title">${this.rh('rh_badges_order')}</div>
      <vivid-room-badges-editor
        .hass=${this.hass}
        .config=${config}
        .slots=${state.slots}
        @room-config-changed=${(event: CustomEvent<{ config: RoomHeaderCardConfig }>) => {
          event.stopPropagation();
          this.commit(event.detail.config);
        }}
      ></vivid-room-badges-editor>
      <div class="group-title">${this.rh('rh_badges_sources')}</div>
      ${this.slotRows(config, state, roles)}`;
  }

  private renderLook(config: RoomHeaderCardConfig) {
    return this.form(
      [
        { name: 'name', selector: { text: {} } },
        { name: 'show_subtitle', selector: { boolean: {} } },
        { name: 'glow', selector: GLOW_SLIDER },
      ],
      {
        name: config.name ?? '',
        show_subtitle: config.show_subtitle !== false,
        glow: typeof config.glow === 'number' ? config.glow : 100,
      },
      {
        name: this.rh('rh_name'),
        show_subtitle: this.rh('rh_show_subtitle'),
        glow: this.rh('glow'),
      },
      { glow: this.rh('glow_helper') },
      (value) => {
        let next = setOption(
          this._config ?? config,
          'name',
          typeof value.name === 'string' ? value.name.trim() : '',
        );
        next = setOption(next, 'show_subtitle', value.show_subtitle, true);
        return setOption(next, 'glow', value.glow, 100);
      },
    );
  }

  /* ------------------------------ render ------------------------------ */

  private hint(state: RoomState, roles: RoomRole[]): string {
    const slots = state.slots;
    if (!slots) return '';
    const count = roles.reduce((sum, role) => sum + slots[role].entities.length, 0);
    return this.rh('rh_section_room_hint', { count });
  }

  protected override render() {
    const config = this._config;
    if (!config) return nothing;
    const state = this.state(config);
    const room = config.pilot && this.hass ? PilotIndex.of(this.hass).areaName(config.pilot) : '';
    const badgeRoles = ROOM_ROLES.filter((spec) => spec.feeds === 'badge').map((spec) => spec.role);
    return html`<div class="editor">
      <vivid-editor-section
        open
        icon="mdi:steering"
        .heading=${this.rh('rh_section_pilot')}
        .hint=${room || this.rh('rh_section_pilot_hint_none')}
        >${this.renderRoom(config, state)}</vivid-editor-section
      >
      <vivid-editor-section
        icon="mdi:lightbulb-group-outline"
        .heading=${this.rh('rh_section_lights')}
        .hint=${this.hint(state, ['light', 'led', 'switch', 'power'])}
        >${this.slotRows(config, state, ['light', 'led', 'switch', 'power'])}</vivid-editor-section
      >
      <vivid-editor-section
        icon="mdi:power"
        .heading=${this.rh('rh_section_power')}
        .hint=${powerHint(this.hass, config, state.plan)}
        >${this.renderPower(config, state)}</vivid-editor-section
      >
      <vivid-editor-section
        icon="mdi:label-multiple-outline"
        .heading=${this.rh('rh_section_badges')}
        .hint=${this.hint(state, badgeRoles)}
        >${this.renderBadges(config, state)}</vivid-editor-section
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
