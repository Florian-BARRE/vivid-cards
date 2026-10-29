import { LitElement, css, html, nothing } from 'lit';
import { fireEvent } from '../../core/actions';
import { GLOW_SLIDER } from '../../core/glow';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { tokens } from '../../components/shared-styles';
import { ROOM_LIGHT_DOMAINS, type RoomHeaderCardConfig } from './config';
import {
  applyRoomHeaderForm,
  isRoleExcluded,
  roomHeaderFormData,
  setRoleIncluded,
} from './editor-model';
import { discoverRoom } from './model';
import type { FoundRole } from './roles';

type FormData = Record<string, unknown>;

const ROOM_SCHEMA = [
  { name: 'room', selector: { text: {} } },
  { name: 'discover', selector: { boolean: {} } },
];

const SCHEMA = [
  { name: 'name', selector: { text: {} } },
  { name: 'lights', selector: { entity: { domain: ROOM_LIGHT_DOMAINS, multiple: true } } },
  { name: 'power', selector: { entity: { domain: ['sensor'] } } },
  { name: 'entity', selector: { entity: {} } },
  {
    type: 'grid',
    name: '',
    schema: [
      { name: 'show_subtitle', selector: { boolean: {} } },
      { name: 'show_badges', selector: { boolean: {} } },
    ],
  },
  { name: 'glow', selector: GLOW_SLIDER },
];

const LABELS: Record<string, EditorStringKey> = {
  room: 'rh_room',
  discover: 'rh_discover',
  name: 'rh_name',
  lights: 'rh_lights',
  power: 'rh_power',
  entity: 'rh_entity',
  show_subtitle: 'rh_show_subtitle',
  show_badges: 'rh_show_badges',
  glow: 'glow',
};

const HELPERS: Record<string, EditorStringKey> = {
  room: 'rh_room_helper',
  lights: 'rh_lights_helper',
  entity: 'rh_entity_helper',
  glow: 'glow_helper',
};

/** Visual editor: the room, what it found there, overrides and options. */
export class VividRoomHeaderEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: RoomHeaderCardConfig;

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .editor {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .status {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.05);
        font-size: 12.5px;
        line-height: 1.4;
        color: var(--secondary-text-color);
        overflow-wrap: anywhere;
      }
      .status ha-icon {
        --mdc-icon-size: 16px;
        margin-top: 1px;
        flex: none;
      }
      .roles {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .roles-title {
        font-size: 12.5px;
        color: var(--secondary-text-color);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .role {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 100%;
        padding: 5px 10px 5px 6px;
        border-radius: 12px;
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
        background: none;
        color: var(--secondary-text-color);
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .role.on {
        border-color: transparent;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.14);
        color: var(--primary-text-color);
      }
      .role ha-icon {
        --mdc-icon-size: 18px;
        flex: none;
      }
      .role.on ha-icon {
        color: var(--primary-color, #03a9f4);
      }
      .role:not(.on) .role-name {
        text-decoration: line-through;
      }
      .role:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .role-text {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .role-name {
        font-size: 13px;
        font-weight: 500;
      }
      .role-id {
        font-size: 11px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .status.ok ha-icon {
        color: var(--success-color, #43a047);
      }
      .status.warn ha-icon {
        color: var(--warning-color, #ffa000);
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

  private t(key: EditorStringKey, values?: Record<string, string | number>): string {
    return editorText(this.hass, key, values);
  }

  private onChange(value: FormData): void {
    if (!this._config) return;
    const config = applyRoomHeaderForm(this._config, value);
    this._config = config;
    fireEvent(this, 'config-changed', { config });
  }

  private toggleRole(found: FoundRole, included: boolean): void {
    if (!this._config) return;
    const config = setRoleIncluded(this._config, found, included);
    this._config = config;
    fireEvent(this, 'config-changed', { config });
  }

  /** One chip per role found: on while kept, off when excluded. */
  private roles() {
    const hass = this.hass;
    const config = this._config;
    const room = typeof config?.room === 'string' ? config.room.trim() : '';
    if (!hass || !config || !room || config.discover === false) return nothing;
    const found = discoverRoom(hass, room);
    if (!found.length) {
      return html`<div class="status warn">
        <ha-icon .icon=${'mdi:alert-outline'}></ha-icon>
        <span>${this.t('rh_none_found')}</span>
      </div>`;
    }
    return html`<div class="roles">
      <div class="roles-title">${this.t('rh_roles_title')}</div>
      <div class="chips">
        ${found.map((item) => {
          const on = !isRoleExcluded(config, item);
          return html`<button
            class="role ${on ? 'on' : ''}"
            role="switch"
            aria-checked=${on ? 'true' : 'false'}
            title=${item.entity}
            @click=${() => this.toggleRole(item, !on)}
          >
            <ha-icon .icon=${on ? 'mdi:check-circle' : 'mdi:minus-circle-outline'}></ha-icon>
            <span class="role-text">
              <span class="role-name">${this.t(`rh_role_${item.role}` as EditorStringKey)}</span>
              <span class="role-id">${item.entity}</span>
            </span>
          </button>`;
        })}
      </div>
    </div>`;
  }

  private form(schema: Record<string, unknown>[], config: RoomHeaderCardConfig) {
    return html`<ha-form
      .hass=${this.hass}
      .data=${roomHeaderFormData(config)}
      .schema=${schema}
      .computeLabel=${(field: { name: string }) =>
        LABELS[field.name] ? this.t(LABELS[field.name]!) : undefined}
      .computeHelper=${(field: { name: string }) =>
        HELPERS[field.name] ? this.t(HELPERS[field.name]!) : undefined}
      @value-changed=${(event: CustomEvent<{ value: FormData }>) => {
        event.stopPropagation();
        this.onChange({ ...roomHeaderFormData(this._config ?? config), ...event.detail.value });
      }}
    ></ha-form>`;
  }

  protected override render() {
    const config = this._config;
    if (!config) return nothing;
    const badges = Array.isArray(config.badges) ? config.badges.length : 0;
    return html`<div class="editor">
      ${this.form(ROOM_SCHEMA, config)} ${this.roles()} ${this.form(SCHEMA, config)}
      <div class="status">
        <ha-icon .icon=${'mdi:information-outline'}></ha-icon>
        <span
          >${badges ? this.t('rh_badges_yaml', { count: badges }) : ''}
          ${this.t('rh_badges_auto')}</span
        >
      </div>
    </div>`;
  }
}

defineElement('vivid-room-header-editor', VividRoomHeaderEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-room-header-editor': VividRoomHeaderEditor;
  }
}
