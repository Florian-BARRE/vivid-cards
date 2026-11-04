import { devicePrefixFor } from '../../core/entities';
import type { HomeAssistant } from '../../core/hass-types';
import {
  ENTITY_SUFFIXES,
  HYPERHDR_KEYS,
  type AmbilightCardConfig,
  type DeviceLookup,
  type EntityKey,
  type EntityMap,
} from './config';

/** Integration of the Ambilight manager (an ESPHome device). */
export const MANAGER_INTEGRATION = 'esphome';

/** Entity ids attached to a device in the registry. */
export function deviceEntities(hass: HomeAssistant, deviceId: string): string[] {
  return Object.values(hass.entities ?? {})
    .filter((entry) => entry.device_id === deviceId)
    .map((entry) => entry.entity_id);
}

/** Entity id prefix of the Ambilight manager from its device. */
export function devicePrefix(hass: HomeAssistant, deviceId: string): string | undefined {
  return devicePrefixFor(hass, deviceId, Object.values(ENTITY_SUFFIXES));
}

/** Which of the card's entities exist in Home Assistant. */
export function coverage(
  hass: HomeAssistant,
  entities: EntityMap,
): { found: number; total: number; missing: string[] } {
  let keys = Object.keys(entities) as EntityKey[];
  // A firmware without HyperHDR has none of its entities: they are not missing.
  if (HYPERHDR_KEYS.every((key) => !hass.states[entities[key]])) {
    keys = keys.filter((key) => !HYPERHDR_KEYS.includes(key));
  }
  const missing = keys.map((key) => entities[key]).filter((id) => !hass.states[id]);
  return { found: keys.length - missing.length, total: keys.length, missing };
}

/** Prefix of the configured device. */
export function lookupDevices(hass: HomeAssistant, config: AmbilightCardConfig): DeviceLookup {
  return { prefix: config.device ? devicePrefix(hass, config.device) : undefined };
}
