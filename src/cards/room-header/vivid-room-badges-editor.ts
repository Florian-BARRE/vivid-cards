/* ====== Code Summary ======
 * Badges list of the room header editor: every badge the room can show, the
 * shown ones first in their order, then the hidden ones. A tick shows or
 * hides a badge, arrows move it, and a row unfolds to where its entity comes
 * from (Vivid Pilot, adjustable, or picked by hand) and its options: name,
 * icon, tap and hold actions, visibility. Free badges (a kind and any
 * entity) can be added. Fires `room-config-changed` with the new config.
 */

import { LitElement, html, nothing } from 'lit';
import { fireEvent } from '../../core/actions';
import { friendlyName } from '../../core/entities';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { slotText, type SlotStringKey } from '../../i18n/slots';
import { tokens } from '../../components/shared-styles';
import { BADGE_KINDS, badgeKindOf } from './badge-kinds';
import type { RoomBadgeConfig, RoomHeaderCardConfig, StateCondition } from './config';
import {
  addBadgeItem,
  listShownBadges,
  moveShownBadge,
  removeShownBadge,
  setRoleBadge,
  setShownBadgeOptions,
  setSlot,
  shownBadges,
  type HeaderSource,
} from './editor-model';
import { roomEditorStyles } from './editor-styles';
import {
  visibilityConditions,
  visibilityFields,
  visibilityLabel,
  visibilityModeField,
} from './visibility-form';
import '../../components/editor/vivid-native-editor';
import type { RoomSlots } from './room-slots';
import { ROOM_ROLES, roleSpec, type RoomRole } from './roles';
import '../../components/editor/vivid-slot-editor';
import type { SlotMode, SlotValue } from '../../core/slots';

type Form = Record<string, unknown>;

/* ============================== Element ============================== */

export class VividRoomBadgesEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    config: { attribute: false },
    slots: { attribute: false },
    source: {},
    _open: { state: true },
  };

  declare hass?: HomeAssistant;
  declare config?: RoomHeaderCardConfig;
  /** The room's slots as resolved now (what each role badge shows). */
  declare slots?: RoomSlots;
  /** Vivid Pilot or manual: where a role badge takes its entity. */
  declare source: HeaderSource;
  /** Open row: a shown badge's index, or `hidden:<role>`. */
  declare _open: number | string;

  static override styles = [tokens, roomEditorStyles];

  constructor() {
    super();
    this._open = -1;
    this.source = 'pilot';
  }

  private rh(key: EditorStringKey): string {
    return editorText(this.hass, key);
  }

  private s(key: SlotStringKey, values?: Record<string, string | number>): string {
    return slotText(this.hass, key, values);
  }

  private emit(config: RoomHeaderCardConfig): void {
    fireEvent(this, 'room-config-changed', { config });
  }

  private name(entity: string): string {
    return this.hass?.states[entity] ? friendlyName(this.hass, entity) : entity;
  }

  /* ------------------------------ rows ------------------------------ */

  private describe(item: RoomBadgeConfig): {
    icon: string;
    title: string;
    detail: string;
    warn?: string;
  } {
    if (item.slot === '*') {
      return {
        icon: 'mdi:auto-fix',
        title: this.s('badges_rest'),
        detail: this.s('badges_rest_hint'),
      };
    }
    if (item.slot) {
      const role = item.slot as RoomRole;
      const entities = this.slots?.[role]?.entities ?? [];
      return {
        icon: roleSpec(role).icon,
        title: this.rh(`rh_role_${role}` as EditorStringKey),
        detail: entities.map((id) => this.name(id)).join(', '),
        warn: entities.length ? undefined : this.s('badge_nothing'),
      };
    }
    const kind = badgeKindOf(String(item.type ?? ''));
    const entity = typeof item.entity === 'string' ? item.entity : '';
    return {
      icon: 'mdi:label-outline',
      title: `${kind ? this.rh(`rh_kind_${kind.key}` as EditorStringKey) : String(item.type ?? '')} · ${this.s('badge_free')}`,
      detail: entity ? `${this.name(entity)} — ${entity}` : this.s('summary_none'),
      warn: entity && !this.hass?.states[entity] ? this.s('missing') : undefined,
    };
  }

  private renderRow(
    config: RoomHeaderCardConfig,
    item: RoomBadgeConfig,
    index: number,
    count: number,
  ) {
    const info = this.describe(item);
    const open = this._open === index;
    const role = item.slot as RoomRole | undefined;
    return html`<div class="badge-item">
      <div class="row">
        <ha-checkbox
          .checked=${true}
          title=${this.rh('rh_badge_hide')}
          @change=${() => {
            this._open = -1;
            this.emit(
              role
                ? setRoleBadge(config, this.slots, role, false)
                : removeShownBadge(config, this.slots, index),
            );
          }}
        ></ha-checkbox>
        <ha-icon .icon=${info.icon}></ha-icon>
        <button class="row-text plain" @click=${() => (this._open = open ? -1 : index)}>
          <span class="row-name">${info.title}</span>
          <span class="row-id">${info.detail}</span>
          ${info.warn ? html`<span class="tag warn">${info.warn}</span>` : nothing}
        </button>
        <button
          class="icon-button"
          title=${this.s('up')}
          ?disabled=${index === 0}
          @click=${() => this.emit(moveShownBadge(config, this.slots, index, -1))}
        >
          <ha-icon .icon=${'mdi:arrow-up'}></ha-icon>
        </button>
        <button
          class="icon-button"
          title=${this.s('down')}
          ?disabled=${index === count - 1}
          @click=${() => this.emit(moveShownBadge(config, this.slots, index, 1))}
        >
          <ha-icon .icon=${'mdi:arrow-down'}></ha-icon>
        </button>
      </div>
      ${
        open
          ? html`${role ? this.renderSlot(config, role) : nothing}
            ${this.renderBadgeOptions(config, item, index)}`
          : nothing
      }
    </div>`;
  }

  /** A hidden role: ticking it shows its badge last; unfolded, where its entity comes from. */
  private renderHidden(config: RoomHeaderCardConfig, role: RoomRole) {
    const info = this.describe({ slot: role });
    const key = `hidden:${role}`;
    const open = this._open === key;
    return html`<div class="badge-item hidden">
      <div class="row">
        <ha-checkbox
          .checked=${false}
          title=${this.rh('rh_badge_show')}
          @change=${() => this.emit(setRoleBadge(config, this.slots, role, true))}
        ></ha-checkbox>
        <ha-icon .icon=${info.icon}></ha-icon>
        <button class="row-text plain" @click=${() => (this._open = open ? -1 : key)}>
          <span class="row-name">${info.title}</span>
          <span class="row-id">${info.detail}</span>
          ${info.warn ? html`<span class="tag">${info.warn}</span>` : nothing}
        </button>
      </div>
      ${open ? this.renderSlot(config, role) : nothing}
    </div>`;
  }

  /** Where a role badge takes its entity: Vivid Pilot (adjustable) or picked by hand. */
  private renderSlot(config: RoomHeaderCardConfig, role: RoomRole) {
    const spec = roleSpec(role);
    const modes: readonly SlotMode[] =
      this.source === 'pilot' ? ['auto', 'off'] : ['manual', 'off'];
    return html`<vivid-slot-editor
      class="badge-slot"
      .hass=${this.hass}
      .label=${this.rh(`rh_role_${role}` as EditorStringKey)}
      .icon=${spec.icon}
      .pilot=${this.source === 'pilot'}
      .modes=${modes}
      .multiple=${spec.multiple}
      .domains=${spec.domains}
      .value=${config.entities?.[role]}
      .resolved=${this.slots?.[role]}
      @slot-changed=${(event: CustomEvent<{ value: SlotValue }>) =>
        this.emit(setSlot(config, role, event.detail.value))}
    ></vivid-slot-editor>`;
  }

  /* ------------------------------ options ------------------------------ */

  private renderBadgeOptions(config: RoomHeaderCardConfig, item: RoomBadgeConfig, index: number) {
    const free = item.slot === undefined;
    const kind = badgeKindOf(String(item.type ?? ''));
    const condition = item.visibility?.[0];
    const visibleMode = !condition ? 'always' : condition.state_not !== undefined ? 'not' : 'is';
    if (free && customElements.get(String(item.type ?? '').replace(/^custom:/, ''))) {
      return this.renderFreeOptions(config, item, index, visibleMode, condition);
    }
    const schema: Form[] = [];
    if (free) {
      schema.push(
        {
          name: 'kind',
          selector: {
            select: {
              mode: 'dropdown',
              options: BADGE_KINDS.map((option) => ({
                value: option.key,
                label: this.rh(`rh_kind_${option.key}` as EditorStringKey),
              })),
            },
          },
        },
        { name: 'entity', selector: { entity: kind ? { domain: [...kind.domains] } : {} } },
      );
    }
    schema.push(
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'name', selector: { text: {} } },
          { name: 'icon', selector: { icon: {} } },
        ],
      },
      { name: 'tap_action', selector: { ui_action: {} } },
      { name: 'hold_action', selector: { ui_action: {} } },
      visibilityModeField(this.hass),
    );
    if (visibleMode !== 'always') schema.push(visibilityFields());
    const value = (condition?.state_not ?? condition?.state) as string | undefined;
    const data = {
      kind: kind?.key,
      entity: item.entity ?? '',
      name: item.name ?? '',
      icon: item.icon ?? '',
      tap_action: item.tap_action,
      hold_action: item.hold_action,
      visible_mode: visibleMode,
      visible_entity: condition?.entity ?? '',
      visible_state: value ?? '',
    };
    const labels: Record<string, string> = {
      kind: this.s('badge_kind'),
      entity: this.s('badge_entity'),
      name: this.s('badge_name'),
      icon: this.s('badge_icon'),
      tap_action: this.s('badge_tap'),
      hold_action: this.s('badge_hold'),
      visible_mode: this.s('visible'),
      visible_entity: this.s('visible_entity'),
      visible_state: this.s(visibleMode === 'not' ? 'visible_state_not' : 'visible_state'),
    };
    return html`<div class="options">
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${schema}
        .computeLabel=${(field: { name: string }) => labels[field.name]}
        @value-changed=${(event: CustomEvent<{ value: Form }>) => {
          event.stopPropagation();
          this.emit(
            setShownBadgeOptions(config, this.slots, index, this.options(event.detail.value)),
          );
        }}
      ></ha-form>
    </div>`;
  }

  /** A free badge: its own editor (every option), then its visibility. */
  private renderFreeOptions(
    config: RoomHeaderCardConfig,
    item: RoomBadgeConfig,
    index: number,
    visibleMode: string,
    condition: StateCondition | undefined,
  ) {
    const { visibility: _visibility, ...badge } = item;
    const schema: Form[] = [visibilityModeField(this.hass)];
    if (visibleMode !== 'always') schema.push(visibilityFields());
    return html`<div class="options">
      <vivid-native-editor
        .hass=${this.hass}
        .config=${badge}
        @native-config-changed=${(event: CustomEvent<{ config: Record<string, unknown> }>) => {
          const next = { ...event.detail.config };
          // Options the badge's editor removed are removed here too.
          const cleared = Object.fromEntries(
            Object.keys(badge)
              .filter((key) => !(key in next))
              .map((key) => [key, undefined]),
          );
          this.emit(setShownBadgeOptions(config, this.slots, index, { ...cleared, ...next }));
        }}
      ></vivid-native-editor>
      <ha-form
        .hass=${this.hass}
        .data=${{
          visible_mode: visibleMode,
          visible_entity: condition?.entity ?? '',
          visible_state: ((condition?.state_not ?? condition?.state) as string | undefined) ?? '',
        }}
        .schema=${schema}
        .computeLabel=${(field: { name: string }) => visibilityLabel(this.hass, field.name, visibleMode)}
        @value-changed=${(event: CustomEvent<{ value: Form }>) => {
          event.stopPropagation();
          this.emit(
            setShownBadgeOptions(config, this.slots, index, {
              visibility: visibilityConditions(event.detail.value),
            }),
          );
        }}
      ></ha-form>
    </div>`;
  }

  /** Form values → badge options (kind → type, the visibility fields → one condition). */
  private options(value: Form): Record<string, unknown> {
    const options: Record<string, unknown> = {
      name: value.name,
      icon: value.icon,
      tap_action: value.tap_action,
      hold_action: value.hold_action,
    };
    if (value.kind !== undefined) {
      options.type = `custom:${BADGE_KINDS.find((kind) => kind.key === value.kind)?.tag ?? ''}`;
      options.entity = value.entity;
    }
    options.visibility = visibilityConditions(value);
    return options;
  }

  /* ------------------------------ add ------------------------------ */

  /** A free badge: a kind of badge on any entity, added last. */
  private renderAdd(config: RoomHeaderCardConfig, items: RoomBadgeConfig[]) {
    const options = BADGE_KINDS.map((kind) => ({
      value: kind.key,
      label: this.rh(`rh_kind_${kind.key}` as EditorStringKey),
    }));
    return html`<ha-form
      .hass=${this.hass}
      .data=${{ add: '' }}
      .schema=${[{ name: 'add', selector: { select: { mode: 'dropdown', options } } }]}
      .computeLabel=${() => this.rh('rh_badge_add_free')}
      @value-changed=${(event: CustomEvent<{ value: { add?: string } }>) => {
        event.stopPropagation();
        const kind = BADGE_KINDS.find((option) => option.key === event.detail.value.add);
        if (!kind) return;
        this._open = items.length;
        // The shown badges are written out first, so the new one goes last.
        this.emit(
          addBadgeItem(listShownBadges(config, this.slots), { type: `custom:${kind.tag}` }),
        );
      }}
    ></ha-form>`;
  }

  protected override render() {
    const config = this.config;
    if (!config) return nothing;
    const items = shownBadges(config, this.slots);
    const shownRoles = new Set(items.map((item) => item.slot));
    const hidden = ROOM_ROLES.filter((spec) => spec.badge && !shownRoles.has(spec.role));
    return html`<div class="editor">
      <div class="rows">
        ${items.map((item, index) => this.renderRow(config, item, index, items.length))}
      </div>
      ${
        hidden.length
          ? html`<div class="group-title">${this.rh('rh_badges_hidden')}</div>
              <div class="rows">${hidden.map((spec) => this.renderHidden(config, spec.role))}</div>`
          : nothing
      }
      ${this.renderAdd(config, items)}
    </div>`;
  }
}

defineElement('vivid-room-badges-editor', VividRoomBadgesEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-room-badges-editor': VividRoomBadgesEditor;
  }
}
