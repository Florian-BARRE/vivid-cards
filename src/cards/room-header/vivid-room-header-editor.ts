/* ====== Code Summary ======
 * Visual editor of the room header, in folding sections:
 *   Room          the room, discovery, what was found (lights, power, scripts);
 *   Power button  what a tap runs when everything is off / when a light is on,
 *                 and the script, scene, automation or button to run instead;
 *   Badges        found and added badges (vivid-room-badges-editor);
 *   Look          title, subtitle, halo;
 *   Replace…      lights and power sensor instead of the found ones.
 */

import { LitElement, html, nothing } from 'lit';
import { fireEvent } from '../../core/actions';
import { friendlyName } from '../../core/entities';
import { GLOW_SLIDER } from '../../core/glow';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { editorSections, tokens } from '../../components/shared-styles';
import { ROOM_LIGHT_DOMAINS, resolveRoomHeaderConfig, type RoomHeaderCardConfig } from './config';
import {
  addedBadges,
  applyRoomHeaderForm,
  isRoleExcluded,
  roomHeaderFormData,
  setRoleIncluded,
} from './editor-model';
import { roomEditorStyles } from './editor-styles';
import { discoverRoom, mergeBadges, roomEntities } from './model';
import { POWER_ACTION_DOMAINS, powerPlan, type PowerPlan, type PowerStep } from './power-action';
import { roleSpec, type FoundRole } from './roles';
import './vivid-room-badges-editor';

type FormData = Record<string, unknown>;
type Schema = Record<string, unknown>[];

/* ============================== Schemas ============================== */

const ROOM_SCHEMA: Schema = [
  { name: 'room', selector: { text: {} } },
  { name: 'discover', selector: { boolean: {} } },
];

const POWER_SCHEMA: Schema = [
  { name: 'turn_on', selector: { entity: { domain: POWER_ACTION_DOMAINS } } },
  { name: 'turn_off', selector: { entity: { domain: POWER_ACTION_DOMAINS } } },
  { name: 'entity', selector: { entity: {} } },
];

const BADGES_SCHEMA: Schema = [{ name: 'show_badges', selector: { boolean: {} } }];

const LOOK_SCHEMA: Schema = [
  { name: 'name', selector: { text: {} } },
  { name: 'show_subtitle', selector: { boolean: {} } },
  { name: 'glow', selector: GLOW_SLIDER },
];

const ADVANCED_SCHEMA: Schema = [
  { name: 'lights', selector: { entity: { domain: ROOM_LIGHT_DOMAINS, multiple: true } } },
  { name: 'power', selector: { entity: { domain: ['sensor'] } } },
];

const LABELS: Record<string, EditorStringKey> = {
  room: 'rh_room',
  discover: 'rh_discover',
  name: 'rh_name',
  lights: 'rh_lights',
  power: 'rh_power',
  entity: 'rh_entity',
  turn_on: 'rh_turn_on',
  turn_off: 'rh_turn_off',
  show_subtitle: 'rh_show_subtitle',
  show_badges: 'rh_show_badges',
  glow: 'glow',
};

const HELPERS: Record<string, EditorStringKey> = {
  room: 'rh_room_helper',
  lights: 'rh_lights_helper',
  entity: 'rh_entity_helper',
  turn_on: 'rh_turn_on_helper',
  turn_off: 'rh_turn_off_helper',
  glow: 'glow_helper',
};

/** What the editor knows about the room as configured now. */
interface RoomState {
  found: FoundRole[];
  lights: string[];
  plan: PowerPlan;
  /** Badges the header shows (found and added, an added one replacing a found one). */
  badges: number;
}

/* ============================== Element ============================== */

export class VividRoomHeaderEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _open: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: RoomHeaderCardConfig;
  declare _open: Set<string>;

  static override styles = [tokens, editorSections, roomEditorStyles];

  constructor() {
    super();
    this._open = new Set(['room', 'power']);
  }

  setConfig(config: RoomHeaderCardConfig): void {
    this._config = config;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void ensureHaForm().then(() => this.requestUpdate());
  }

  private t(key: EditorStringKey, values?: Record<string, string | number>): string {
    return editorText(this.hass, key, values);
  }

  private commit(config: RoomHeaderCardConfig): void {
    this._config = config;
    fireEvent(this, 'config-changed', { config });
  }

  /** The room key the helpers mention ("salon" by default). */
  private roomName(): string {
    const room = typeof this._config?.room === 'string' ? this._config.room.trim() : '';
    return room || 'salon';
  }

  /** Found roles, lights and power plan; empty while the config is incomplete. */
  private roomState(config: RoomHeaderCardConfig): RoomState {
    const hass = this.hass;
    const room = typeof config.room === 'string' ? config.room.trim() : '';
    const found = hass && room && config.discover !== false ? discoverRoom(hass, room) : [];
    try {
      const resolved = resolveRoomHeaderConfig(config);
      const entities = hass
        ? roomEntities(hass, resolved)
        : { lights: resolved.lights ?? [], scripts: {}, roleBadges: [] };
      return {
        found,
        lights: entities.lights,
        plan: powerPlan(resolved, entities.scripts),
        badges: mergeBadges(entities.roleBadges, resolved.badges).length,
      };
    } catch {
      return { found, lights: [], plan: {}, badges: addedBadges(config).length };
    }
  }

  /* ------------------------------ building blocks ------------------------------ */

  private form(schema: Schema, config: RoomHeaderCardConfig) {
    const room = this.roomName();
    return html`<ha-form
      .hass=${this.hass}
      .data=${roomHeaderFormData(config)}
      .schema=${schema}
      .computeLabel=${(field: { name: string }) =>
        LABELS[field.name] ? this.t(LABELS[field.name]!) : undefined}
      .computeHelper=${(field: { name: string }) =>
        HELPERS[field.name] ? this.t(HELPERS[field.name]!, { room }) : undefined}
      @value-changed=${(event: CustomEvent<{ value: FormData }>) => {
        event.stopPropagation();
        const current = this._config ?? config;
        this.commit(
          applyRoomHeaderForm(current, { ...roomHeaderFormData(current), ...event.detail.value }),
        );
      }}
    ></ha-form>`;
  }

  private section(id: string, icon: string, title: string, hint: string, body: () => unknown) {
    const open = this._open.has(id);
    return html`<details
      class="section"
      ?open=${open}
      @toggle=${(event: Event) => {
        const isOpen = (event.target as HTMLDetailsElement).open;
        if (isOpen === this._open.has(id)) return;
        const next = new Set(this._open);
        if (isOpen) next.add(id);
        else next.delete(id);
        this._open = next;
      }}
    >
      <summary>
        <ha-icon .icon=${icon}></ha-icon>
        <span class="section-title">${title}</span>
        <span class="hint">${hint}</span>
        <ha-icon class="chevron" .icon=${'mdi:chevron-down'}></ha-icon>
      </summary>
      <div class="section-body">${open ? body() : nothing}</div>
    </details>`;
  }

  private note(icon: string, text: string, warn = false) {
    return html`<div class="note ${warn ? 'warn' : ''}">
      <ha-icon .icon=${icon}></ha-icon>
      <span>${text}</span>
    </div>`;
  }

  /* ------------------------------ room ------------------------------ */

  /** Lights, power sensor and scripts found (badges have their own section). */
  private renderRoom(config: RoomHeaderCardConfig, state: RoomState) {
    const room = typeof config.room === 'string' ? config.room.trim() : '';
    const roles = state.found.filter((item) => roleSpec(item.role).feeds !== 'badge');
    let found: unknown = nothing;
    if (room && config.discover !== false) {
      found = !state.found.length
        ? this.note('mdi:alert-outline', this.t('rh_none_found'), true)
        : !roles.length
          ? this.note('mdi:information-outline', this.t('rh_roles_none_here'))
          : html`<div class="group-title">${this.t('rh_roles_title')}</div>
              <div class="chips">${roles.map((item) => this.renderChip(config, item))}</div>`;
    }
    return html`${this.form(ROOM_SCHEMA, config)} ${found}`;
  }

  private renderChip(config: RoomHeaderCardConfig, item: FoundRole) {
    const on = !isRoleExcluded(config, item);
    return html`<button
      class="role ${on ? 'on' : ''}"
      role="switch"
      aria-checked=${on ? 'true' : 'false'}
      title=${item.entity}
      @click=${() => this.commit(setRoleIncluded(config, item, !on))}
    >
      <ha-icon .icon=${on ? 'mdi:check-circle' : 'mdi:minus-circle-outline'}></ha-icon>
      <span class="role-text">
        <span class="role-name">${this.t(`rh_role_${item.role}` as EditorStringKey)}</span>
        <span class="role-id">${item.entity}</span>
      </span>
    </button>`;
  }

  /* ------------------------------ power button ------------------------------ */

  private powerHint(state: RoomState): string {
    const steps = [state.plan.on, state.plan.off].filter((step): step is PowerStep => !!step);
    if (steps.some((step) => step.source === 'config')) return this.t('rh_power_hint_config');
    if (steps.length) return this.t('rh_power_hint_room');
    return state.lights.length ? this.t('rh_power_hint_lights') : this.t('rh_power_hint_none');
  }

  /** One line: when it applies, then what a tap runs (and where that comes from). */
  private renderTap(state: RoomState, way: 'on' | 'off') {
    const hass = this.hass;
    const step = state.plan[way];
    let what: unknown;
    if (step) {
      const name = hass?.states[step.entity] ? friendlyName(hass, step.entity) : step.entity;
      what = html`${name}<span class="tag"
          >${this.t(step.source === 'config' ? 'rh_source_config' : 'rh_source_room')}</span
        >`;
    } else if (state.lights.length) {
      what = this.t(way === 'on' ? 'rh_tap_lights_on' : 'rh_tap_lights_off');
    } else {
      what = this.t('rh_tap_nothing');
    }
    const id = step?.entity ?? state.lights.join(', ');
    return html`<div class="tap">
      <ha-icon .icon=${way === 'on' ? 'mdi:power' : 'mdi:power-off'}></ha-icon>
      <span class="row-text">
        <span class="when">${this.t(way === 'on' ? 'rh_tap_when_off' : 'rh_tap_when_on')}</span>
        <span class="what">${what}</span>
        ${id ? html`<span class="row-id">${id}</span>` : nothing}
      </span>
    </div>`;
  }

  private renderPower(config: RoomHeaderCardConfig, state: RoomState) {
    const none = !state.plan.on && !state.plan.off && !state.lights.length;
    return html`<div class="taps">
        ${this.renderTap(state, 'on')} ${this.renderTap(state, 'off')}
      </div>
      ${none ? this.note('mdi:information-outline', this.t('rh_power_none')) : nothing}
      ${this.form(POWER_SCHEMA, config)}`;
  }

  /* ------------------------------ render ------------------------------ */

  protected override render() {
    const config = this._config;
    if (!config) return nothing;
    const state = this.roomState(config);
    return html`<div class="editor">
      ${this.section(
        'room',
        'mdi:home-outline',
        this.t('rh_section_room'),
        this.t('rh_section_room_hint', { count: state.found.length }),
        () => this.renderRoom(config, state),
      )}
      ${this.section('power', 'mdi:power', this.t('rh_section_power'), this.powerHint(state), () =>
        this.renderPower(config, state),
      )}
      ${this.section(
        'badges',
        'mdi:label-multiple-outline',
        this.t('rh_section_badges'),
        this.t('rh_section_badges_hint', { count: state.badges }),
        () =>
          html`${this.form(BADGES_SCHEMA, config)}
            <vivid-room-badges-editor
              .hass=${this.hass}
              .config=${config}
              @room-config-changed=${(event: CustomEvent<{ config: RoomHeaderCardConfig }>) => {
                event.stopPropagation();
                this.commit(event.detail.config);
              }}
            ></vivid-room-badges-editor>`,
      )}
      ${this.section(
        'look',
        'mdi:palette-outline',
        this.t('rh_section_look'),
        this.t('rh_section_look_hint'),
        () => this.form(LOOK_SCHEMA, config),
      )}
      ${this.section(
        'advanced',
        'mdi:swap-horizontal',
        this.t('rh_section_advanced'),
        this.t('rh_section_advanced_hint'),
        () => this.form(ADVANCED_SCHEMA, config),
      )}
    </div>`;
  }
}

defineElement('vivid-room-header-editor', VividRoomHeaderEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-room-header-editor': VividRoomHeaderEditor;
  }
}
