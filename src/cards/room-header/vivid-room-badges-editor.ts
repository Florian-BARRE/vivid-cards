/* ====== Code Summary ======
 * Badges list of the room header editor, in the order they show: the badge
 * of a role (its entity comes from that role's slot), "the other badges
 * found" (every role not listed, so a role found later shows up), and free
 * badges (a kind and an entity). Each row moves, goes away, and unfolds to
 * its options: name, icon, tap and hold actions, visibility; a free badge
 * also its kind and entity. Fires `room-config-changed` with the new config.
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
  badgeItems,
  moveBadgeItem,
  removeBadgeItem,
  setBadgeOptions,
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

type Form = Record<string, unknown>;

/* ============================== Element ============================== */

export class VividRoomBadgesEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    config: { attribute: false },
    slots: { attribute: false },
    _open: { state: true },
  };

  declare hass?: HomeAssistant;
  declare config?: RoomHeaderCardConfig;
  /** The room's slots as resolved now (what each role badge shows). */
  declare slots?: RoomSlots;
  declare _open: number;

  static override styles = [tokens, roomEditorStyles];

  constructor() {
    super();
    this._open = -1;
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
    return html`<div class="badge-item">
      <div class="row">
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
          @click=${() => this.emit(moveBadgeItem(config, index, -1))}
        >
          <ha-icon .icon=${'mdi:arrow-up'}></ha-icon>
        </button>
        <button
          class="icon-button"
          title=${this.s('down')}
          ?disabled=${index === count - 1}
          @click=${() => this.emit(moveBadgeItem(config, index, 1))}
        >
          <ha-icon .icon=${'mdi:arrow-down'}></ha-icon>
        </button>
        <button
          class="icon-button danger"
          title=${this.s('remove')}
          @click=${() => {
            this._open = -1;
            this.emit(removeBadgeItem(config, index));
          }}
        >
          <ha-icon .icon=${'mdi:close'}></ha-icon>
        </button>
      </div>
      ${open && item.slot !== '*' ? this.renderBadgeOptions(config, item, index) : nothing}
    </div>`;
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
          this.emit(setBadgeOptions(config, index, this.options(event.detail.value)));
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
          this.emit(setBadgeOptions(config, index, { ...cleared, ...next }));
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
            setBadgeOptions(config, index, {
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

  private renderAdd(config: RoomHeaderCardConfig, items: RoomBadgeConfig[]) {
    const listed = new Set(items.map((item) => item.slot));
    const options = [
      ...ROOM_ROLES.filter((spec) => spec.badge && !listed.has(spec.role)).map((spec) => ({
        value: `role:${spec.role}`,
        label: this.rh(`rh_role_${spec.role}` as EditorStringKey),
      })),
      ...BADGE_KINDS.map((kind) => ({
        value: `free:${kind.key}`,
        label: `${this.rh(`rh_kind_${kind.key}` as EditorStringKey)} · ${this.s('badge_free')}`,
      })),
      ...(listed.has('*') ? [] : [{ value: 'rest', label: this.s('badge_add_rest') }]),
    ];
    return html`<ha-form
      .hass=${this.hass}
      .data=${{ add: '' }}
      .schema=${[{ name: 'add', selector: { select: { mode: 'dropdown', options } } }]}
      .computeLabel=${() => this.s('badge_add')}
      @value-changed=${(event: CustomEvent<{ value: { add?: string } }>) => {
        event.stopPropagation();
        const choice = event.detail.value.add ?? '';
        let item: RoomBadgeConfig | undefined;
        if (choice === 'rest') item = { slot: '*' };
        else if (choice.startsWith('role:')) item = { slot: choice.slice(5) };
        else if (choice.startsWith('free:')) {
          const kind = BADGE_KINDS.find((option) => option.key === choice.slice(5));
          if (kind) item = { type: `custom:${kind.tag}` };
        }
        if (!item) return;
        this._open = item.slot === '*' ? -1 : items.length;
        this.emit(addBadgeItem(config, item));
      }}
    ></ha-form>`;
  }

  protected override render() {
    const config = this.config;
    if (!config) return nothing;
    const items = badgeItems(config);
    return html`<div class="editor">
      <div class="rows">
        ${items.map((item, index) => this.renderRow(config, item, index, items.length))}
      </div>
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
