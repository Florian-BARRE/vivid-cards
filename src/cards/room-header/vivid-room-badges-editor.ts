/* ====== Code Summary ======
 * Badges part of the room header editor. Shows every badge the header gets:
 * the ones found for the room (a tap leaves one out) and the ones added to
 * its `badges` list (with their entity, so nothing shows up without a
 * source), which can be moved or removed; then a form to add one. Fires
 * `room-config-changed` with the new config.
 */

import { LitElement, html, nothing } from 'lit';
import { fireEvent } from '../../core/actions';
import { friendlyName } from '../../core/entities';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { tokens } from '../../components/shared-styles';
import { BADGE_KINDS, badgeKindOf } from './badge-kinds';
import type { RoomBadgeConfig, RoomHeaderCardConfig } from './config';
import {
  addBadge,
  addedBadges,
  isRoleExcluded,
  moveBadge,
  removeBadge,
  setRoleIncluded,
} from './editor-model';
import { roomEditorStyles } from './editor-styles';
import { discoverRoom } from './model';
import { roleSpec, type FoundRole } from './roles';

/* ============================== Element ============================== */

export class VividRoomBadgesEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    config: { attribute: false },
    _kind: { state: true },
    _entity: { state: true },
  };

  declare hass?: HomeAssistant;
  declare config?: RoomHeaderCardConfig;
  declare _kind: string;
  declare _entity: string;

  static override styles = [tokens, roomEditorStyles];

  constructor() {
    super();
    this._kind = BADGE_KINDS[0]!.key;
    this._entity = '';
  }

  private t(key: EditorStringKey, values?: Record<string, string | number>): string {
    return editorText(this.hass, key, values);
  }

  private emit(config: RoomHeaderCardConfig): void {
    fireEvent(this, 'room-config-changed', { config });
  }

  /* ------------------------------ found ------------------------------ */

  /** Badge roles found for the room (lights and scripts live in the Room section). */
  private foundBadges(): FoundRole[] {
    const room = typeof this.config?.room === 'string' ? this.config.room.trim() : '';
    if (!this.hass || !room || this.config?.discover === false) return [];
    return discoverRoom(this.hass, room).filter((item) => roleSpec(item.role).feeds === 'badge');
  }

  private renderFound(config: RoomHeaderCardConfig) {
    const found = this.foundBadges();
    if (!found.length) return nothing;
    return html`<div class="group-title">${this.t('rh_badges_found')}</div>
      <div class="chips">
        ${found.map((item) => {
          const on = !isRoleExcluded(config, item);
          return html`<button
            class="role ${on ? 'on' : ''}"
            role="switch"
            aria-checked=${on ? 'true' : 'false'}
            title=${item.entity}
            @click=${() => this.emit(setRoleIncluded(config, item, !on))}
          >
            <ha-icon .icon=${on ? 'mdi:check-circle' : 'mdi:minus-circle-outline'}></ha-icon>
            <span class="role-text">
              <span class="role-name">${this.t(`rh_role_${item.role}` as EditorStringKey)}</span>
              <span class="role-id">${item.entity}</span>
            </span>
          </button>`;
        })}
      </div>
      <div class="note">
        <ha-icon .icon=${'mdi:information-outline'}></ha-icon>
        <span>${this.t('rh_badges_lights_note')}</span>
      </div>`;
  }

  /* ------------------------------ added ------------------------------ */

  private renderRow(
    config: RoomHeaderCardConfig,
    badge: RoomBadgeConfig,
    index: number,
    count: number,
  ) {
    const hass = this.hass;
    const kind = badgeKindOf(badge.type);
    const entity = typeof badge.entity === 'string' ? badge.entity : undefined;
    const known = !!entity && !!hass?.states[entity];
    const replaces =
      !!entity &&
      this.foundBadges().some((item) => item.entity === entity && !isRoleExcluded(config, item));
    const kindName = kind
      ? this.t(`rh_kind_${kind.key}` as EditorStringKey)
      : badge.type.replace(/^custom:/, '');
    const name = entity && hass && known ? friendlyName(hass, entity) : undefined;
    return html`<div class="row">
      <ha-icon .icon=${'mdi:label-outline'}></ha-icon>
      <span class="row-text">
        <span class="row-name"
          >${kindName}${name ? html` · ${name}` : nothing}${
            replaces ? html`<span class="tag">${this.t('rh_badge_replaces')}</span>` : nothing
          }${
            entity && !known
              ? html`<span class="tag warn">${this.t('rh_badge_unknown')}</span>`
              : nothing
          }</span
        >
        ${entity ? html`<span class="row-id">${entity}</span>` : nothing}
      </span>
      <button
        class="icon-button"
        title=${this.t('rh_badge_up')}
        aria-label=${this.t('rh_badge_up')}
        ?disabled=${index === 0}
        @click=${() => this.emit(moveBadge(config, index, -1))}
      >
        <ha-icon .icon=${'mdi:arrow-up'}></ha-icon>
      </button>
      <button
        class="icon-button"
        title=${this.t('rh_badge_down')}
        aria-label=${this.t('rh_badge_down')}
        ?disabled=${index === count - 1}
        @click=${() => this.emit(moveBadge(config, index, 1))}
      >
        <ha-icon .icon=${'mdi:arrow-down'}></ha-icon>
      </button>
      <button
        class="icon-button danger"
        title=${this.t('rh_badge_remove')}
        aria-label=${this.t('rh_badge_remove')}
        @click=${() => this.emit(removeBadge(config, index))}
      >
        <ha-icon .icon=${'mdi:close'}></ha-icon>
      </button>
    </div>`;
  }

  private renderAdded(config: RoomHeaderCardConfig) {
    const badges = addedBadges(config);
    return html`<div class="group-title">${this.t('rh_badges_added')}</div>
      ${
        badges.length
          ? html`<div class="rows">
              ${badges.map((badge, index) => this.renderRow(config, badge, index, badges.length))}
            </div>`
          : html`<div class="note">
              <ha-icon .icon=${'mdi:information-outline'}></ha-icon>
              <span>${this.t('rh_badges_added_none')}</span>
            </div>`
      }`;
  }

  /* ------------------------------ add ------------------------------ */

  private renderAdd(config: RoomHeaderCardConfig) {
    const kind = BADGE_KINDS.find((item) => item.key === this._kind) ?? BADGE_KINDS[0]!;
    const schema = [
      {
        name: 'kind',
        selector: {
          select: {
            mode: 'dropdown',
            options: BADGE_KINDS.map((item) => ({
              value: item.key,
              label: this.t(`rh_kind_${item.key}` as EditorStringKey),
            })),
          },
        },
      },
      { name: 'entity', selector: { entity: { domain: [...kind.domains] } } },
    ];
    const labels: Record<string, string> = {
      kind: this.t('rh_badge_kind'),
      entity: this.t('rh_badge_entity'),
    };
    return html`<div class="add">
      <div class="group-title">${this.t('rh_badge_add')}</div>
      <ha-form
        .hass=${this.hass}
        .data=${{ kind: kind.key, entity: this._entity }}
        .schema=${schema}
        .computeLabel=${(field: { name: string }) => labels[field.name]}
        @value-changed=${(event: CustomEvent<{ value: { kind?: string; entity?: string } }>) => {
          event.stopPropagation();
          const value = event.detail.value;
          if (value.kind && value.kind !== this._kind) {
            this._kind = value.kind;
            this._entity = '';
            return;
          }
          this._entity = value.entity ?? '';
        }}
      ></ha-form>
      <button
        class="add-button"
        ?disabled=${!this._entity}
        @click=${() => {
          this.emit(addBadge(config, kind.tag, this._entity));
          this._entity = '';
        }}
      >
        ${this.t('rh_badge_add_button')}
      </button>
    </div>`;
  }

  protected override render() {
    const config = this.config;
    if (!config) return nothing;
    return html`<div class="editor">
      ${this.renderFound(config)} ${this.renderAdded(config)} ${this.renderAdd(config)}
      <div class="note">
        <ha-icon .icon=${'mdi:code-braces'}></ha-icon>
        <span>${this.t('rh_badges_yaml_note')}</span>
      </div>
    </div>`;
  }
}

defineElement('vivid-room-badges-editor', VividRoomBadgesEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-room-badges-editor': VividRoomBadgesEditor;
  }
}
