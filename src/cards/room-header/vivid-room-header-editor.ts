import { LitElement, css, html, nothing } from 'lit';
import { fireEvent } from '../../core/actions';
import { GLOW_SLIDER } from '../../core/glow';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { tokens } from '../../components/shared-styles';
import { ROOM_LIGHT_DOMAINS, type RoomHeaderCardConfig } from './config';
import { applyRoomHeaderForm, roomHeaderFormData } from './editor-model';
import { discoverRoom } from './model';

type FormData = Record<string, unknown>;

const SCHEMA = [
  { name: 'room', selector: { text: {} } },
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

  private status() {
    const hass = this.hass;
    const room = typeof this._config?.room === 'string' ? this._config.room.trim() : '';
    if (!hass || !room) return nothing;
    const found = discoverRoom(hass, room.toLowerCase());
    const items = [
      ...found.lights,
      found.power,
      found.illuminance,
      found.presence,
      found.windows,
      found.doors,
      ...Object.values(found.climate),
    ].filter((id): id is string => typeof id === 'string');
    const ok = items.length > 0;
    return html`<div class="status ${ok ? 'ok' : 'warn'}">
      <ha-icon .icon=${ok ? 'mdi:check-circle-outline' : 'mdi:alert-outline'}></ha-icon>
      <span>${ok ? this.t('rh_found', { items: items.join(', ') }) : this.t('rh_none_found')}</span>
    </div>`;
  }

  protected override render() {
    const config = this._config;
    if (!config) return nothing;
    const badges = Array.isArray(config.badges) ? config.badges.length : 0;
    return html`<div class="editor">
      ${this.status()}
      <ha-form
        .hass=${this.hass}
        .data=${roomHeaderFormData(config)}
        .schema=${SCHEMA}
        .computeLabel=${(field: { name: string }) =>
          LABELS[field.name] ? this.t(LABELS[field.name]!) : undefined}
        .computeHelper=${(field: { name: string }) =>
          HELPERS[field.name] ? this.t(HELPERS[field.name]!) : undefined}
        @value-changed=${(event: CustomEvent<{ value: FormData }>) => {
          event.stopPropagation();
          this.onChange(event.detail.value);
        }}
      ></ha-form>
      <div class="status">
        <ha-icon .icon=${'mdi:information-outline'}></ha-icon>
        <span
          >${badges ? this.t('rh_badges_yaml', { count: badges }) : this.t('rh_badges_auto')}</span
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
