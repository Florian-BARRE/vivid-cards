/* ====== Code Summary ======
 * Entities of a device card (Air Station, Ambilight Manager), one slot row
 * per key: auto = the entity the device names after its prefix, manual = any
 * entity picked instead, off = none (that part of the card is left out).
 * Fires `entities-changed` with the new `entities` map of the config.
 */

import { LitElement, css, html } from 'lit';
import { fireEvent } from '../../core/actions';
import { friendlyName } from '../../core/entities';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { parseSlot, readSlot, resolveSlot, type SlotValue } from '../../core/slots';
import { slotText } from '../../i18n/slots';
import { tokens } from '../shared-styles';
import './vivid-editor-section';
import './vivid-slot-editor';

/** One key of the device: its id and the entity the prefix gives it. */
export interface DeviceKey {
  key: string;
  entity: string;
}

/** The `entities` value with one key changed (auto removes it). */
export function setDeviceEntity(
  entities: Record<string, unknown> | undefined,
  key: string,
  value: SlotValue,
): Record<string, unknown> | undefined {
  const next: Record<string, unknown> = { ...(entities ?? {}) };
  if (value === undefined) delete next[key];
  else next[key] = Array.isArray(value) ? value[0] : value;
  return Object.keys(next).length ? next : undefined;
}

export class VividDeviceEntitiesEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    keys: { attribute: false },
    entities: { attribute: false },
    device: {},
  };

  declare hass?: HomeAssistant;
  declare keys: DeviceKey[];
  declare entities?: Record<string, unknown>;
  /** Name of the device, for "from the device …". */
  declare device?: string;

  constructor() {
    super();
    this.keys = [];
  }

  private label(item: DeviceKey): string {
    const hass = this.hass;
    const name = hass?.states[item.entity] ? friendlyName(hass, item.entity) : '';
    return name ? `${name} · ${item.key}` : item.key;
  }

  protected override render() {
    const hass = this.hass;
    const found = this.keys.filter((item) => hass?.states[item.entity]).length;
    return html`<vivid-editor-section
      icon="mdi:format-list-checks"
      .heading=${slotText(hass, 'device_entities')}
      .hint=${slotText(hass, 'device_entities_hint', { found, total: this.keys.length })}
    >
      <div class="list">
        ${this.keys.map((item) => {
          const value = this.entities?.[item.key];
          const discovered = hass?.states[item.entity]
            ? [{ entity: item.entity, source: 'device' as const, via: this.device ?? '' }]
            : [];
          let slot = readSlot(value);
          try {
            slot = parseSlot(value, item.key);
          } catch {
            // An invalid value reads as auto; the card says what is wrong.
          }
          return html`<vivid-slot-editor
            .hass=${hass}
            .label=${this.label(item)}
            .multiple=${false}
            .domains=${[item.entity.split('.')[0] ?? '']}
            .value=${value}
            .resolved=${resolveSlot(slot, discovered, false)}
            .searched=${item.entity}
            @slot-changed=${(event: CustomEvent<{ value: SlotValue }>) =>
              fireEvent(this, 'entities-changed', {
                value: setDeviceEntity(this.entities, item.key, event.detail.value),
              })}
          ></vivid-slot-editor>`;
        })}
      </div>
    </vivid-editor-section>`;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
    `,
  ];
}

defineElement('vivid-device-entities-editor', VividDeviceEntitiesEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-device-entities-editor': VividDeviceEntitiesEditor;
  }
}
