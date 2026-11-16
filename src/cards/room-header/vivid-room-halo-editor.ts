/* ====== Code Summary ======
 * Halo section of the room header editor: its strength, then what lights it
 * (and counts in the lights on). Each light role (lamps, LEDs, switches)
 * follows its badge, or always or never counts; below, every light of the
 * room can override its group, and a light from elsewhere can be added.
 * Fires `room-config-changed` with the new config.
 */

import { LitElement, html, nothing } from 'lit';
import { fireEvent } from '../../core/actions';
import { expandGroup, friendlyName } from '../../core/entities';
import { GLOW_SLIDER } from '../../core/glow';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { tokens } from '../../components/shared-styles';
import type { RoomHeaderCardConfig } from './config';
import { setHaloEntity, setHaloRole, setOption } from './editor-model';
import { roomEditorStyles } from './editor-styles';
import {
  HALO_ROLES,
  roleHasBadge,
  type HaloEntityMode,
  type HaloMode,
  type HaloRole,
} from './halo-scope';
import type { RoomSlots } from './room-slots';

type Form = Record<string, unknown>;

/** The select value of an entity that follows its group. */
const INHERIT = 'inherit';

/* ============================== Element ============================== */

export class VividRoomHaloEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    config: { attribute: false },
    slots: { attribute: false },
  };

  declare hass?: HomeAssistant;
  declare config?: RoomHeaderCardConfig;
  /** The room's slots as resolved now (its lights). */
  declare slots?: RoomSlots;

  static override styles = [tokens, roomEditorStyles];

  private rh(key: EditorStringKey): string {
    return editorText(this.hass, key);
  }

  private emit(config: RoomHeaderCardConfig): void {
    fireEvent(this, 'room-config-changed', { config });
  }

  private name(entity: string): string {
    return this.hass?.states[entity] ? friendlyName(this.hass, entity) : entity;
  }

  private form(
    schema: Form[],
    data: Form,
    label: (name: string) => string | undefined,
    helper: (name: string) => string | undefined,
    apply: (value: Form) => void,
  ) {
    return html`<ha-form
      .hass=${this.hass}
      .data=${data}
      .schema=${schema}
      .computeLabel=${(field: { name: string }) => label(field.name)}
      .computeHelper=${(field: { name: string }) => helper(field.name)}
      @value-changed=${(event: CustomEvent<{ value: Form }>) => {
        event.stopPropagation();
        apply(event.detail.value);
      }}
    ></ha-form>`;
  }

  /* ------------------------------ strength ------------------------------ */

  private renderStrength(config: RoomHeaderCardConfig) {
    return this.form(
      [{ name: 'glow', selector: GLOW_SLIDER }],
      { glow: typeof config.glow === 'number' ? config.glow : 100 },
      () => this.rh('glow'),
      () => this.rh('glow_helper'),
      (value) => this.emit(setOption(config, 'glow', value.glow, 100)),
    );
  }

  /* ------------------------------ roles ------------------------------ */

  /** The roles that have lights in this room. */
  private roles(): HaloRole[] {
    return HALO_ROLES.filter((role) => this.slots?.[role]?.entities.length);
  }

  private renderRoles(config: RoomHeaderCardConfig) {
    const badges = config.badges ?? [{ slot: '*' }];
    const options = (role: HaloRole) => [
      {
        value: 'auto',
        label: this.rh(roleHasBadge(badges, role) ? 'rh_halo_auto_shown' : 'rh_halo_auto_hidden'),
      },
      { value: 'always', label: this.rh('rh_halo_always') },
      { value: 'never', label: this.rh('rh_halo_never') },
    ];
    const roles = this.roles();
    return this.form(
      roles.map((role) => ({
        name: role,
        selector: { select: { mode: 'dropdown', options: options(role) } },
      })),
      Object.fromEntries(roles.map((role) => [role, config.halo?.[role] ?? 'auto'])),
      (name) => this.rh(`rh_role_${name}` as EditorStringKey),
      (name) => (name === roles[roles.length - 1] ? this.rh('rh_halo_roles_helper') : undefined),
      (value) => {
        let next = config;
        for (const role of roles) next = setHaloRole(next, role, value[role] as HaloMode);
        this.emit(next);
      },
    );
  }

  /* ------------------------------ entities ------------------------------ */

  /** Every light of the room, then the added ones, each once. */
  private entities(config: RoomHeaderCardConfig): string[] {
    const hass = this.hass;
    const room = hass
      ? this.roles().flatMap((role) =>
          (this.slots?.[role]?.entities ?? []).flatMap((group) => expandGroup(hass, group)),
        )
      : [];
    const added = Object.keys(config.halo?.entities ?? {});
    return [...new Set([...room, ...added])];
  }

  private renderEntities(config: RoomHeaderCardConfig) {
    const entities = this.entities(config);
    if (!entities.length) return nothing;
    const own = config.halo?.entities ?? {};
    const options = [
      { value: INHERIT, label: this.rh('rh_halo_inherit') },
      { value: 'always', label: this.rh('rh_halo_always') },
      { value: 'never', label: this.rh('rh_halo_never') },
    ];
    const field = (index: number) => `e${index}`;
    return html`<div class="group-title">${this.rh('rh_halo_entities')}</div>
      ${this.form(
        entities.map((_, index) => ({
          name: field(index),
          selector: { select: { mode: 'dropdown', options } },
        })),
        Object.fromEntries(entities.map((entity, index) => [field(index), own[entity] ?? INHERIT])),
        (name) => this.name(entities[Number(name.slice(1))] ?? ''),
        () => undefined,
        (value) => {
          let next = config;
          entities.forEach((entity, index) => {
            const mode = value[field(index)];
            next = setHaloEntity(
              next,
              entity,
              mode === INHERIT ? undefined : (mode as HaloEntityMode),
            );
          });
          this.emit(next);
        },
      )}`;
  }

  /** A light from elsewhere that also lights the halo. */
  private renderAdd(config: RoomHeaderCardConfig) {
    return this.form(
      [{ name: 'add', selector: { entity: { domain: ['light', 'switch'] } } }],
      { add: '' },
      () => this.rh('rh_halo_add'),
      () => this.rh('rh_halo_add_helper'),
      (value) => {
        if (typeof value.add === 'string' && value.add)
          this.emit(setHaloEntity(config, value.add, 'always'));
      },
    );
  }

  protected override render() {
    const config = this.config;
    if (!config) return nothing;
    return html`<div class="editor">
      ${this.renderStrength(config)} ${this.renderRoles(config)} ${this.renderEntities(config)}
      ${this.renderAdd(config)}
    </div>`;
  }
}

defineElement('vivid-room-halo-editor', VividRoomHaloEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-room-halo-editor': VividRoomHaloEditor;
  }
}
