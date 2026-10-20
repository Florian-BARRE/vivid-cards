import { domainOf, objectIdOf } from '../../core/entities';
import type { HomeAssistant } from '../../core/hass-types';
import {
  ENTITY_SUFFIXES,
  type AmbilightCardConfig,
  type DeviceLookup,
  type EntityKey,
  type EntityMap,
} from './config';

/** Integration of the Ambilight manager (an ESPHome device). */
export const MANAGER_INTEGRATION = 'esphome';
/** Integration of HyperHDR (HACS: mjoshd/hyperhdr-ha). */
export const HYPERHDR_INTEGRATION = 'hyperhdr';

/** Entity ids attached to a device in the registry. */
export function deviceEntities(hass: HomeAssistant, deviceId: string): string[] {
  return Object.values(hass.entities ?? {})
    .filter((entry) => entry.device_id === deviceId)
    .map((entry) => entry.entity_id);
}

/**
 * Entity id prefix of the Ambilight manager from its device: the part before
 * the known entity names, the most common one among the device's entities.
 */
export function devicePrefix(hass: HomeAssistant, deviceId: string): string | undefined {
  const counts = new Map<string, number>();
  const suffixes = Object.values(ENTITY_SUFFIXES).map((suffix) => {
    const [domain, object] = suffix.split('.') as [string, string];
    return { domain, object };
  });
  for (const entityId of deviceEntities(hass, deviceId)) {
    const domain = domainOf(entityId);
    const object = objectIdOf(entityId);
    for (const suffix of suffixes) {
      if (suffix.domain !== domain || !object.endsWith(suffix.object)) continue;
      const prefix = object.slice(0, object.length - suffix.object.length);
      // A prefix is empty or ends with a separator ("salon_…_manager_").
      if (prefix && !prefix.endsWith('_')) continue;
      counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
    }
  }
  let best: string | undefined;
  let bestCount = 0;
  for (const [prefix, count] of counts) {
    if (count > bestCount) {
      best = prefix;
      bestCount = count;
    }
  }
  return best;
}

/** The HyperHDR entity to follow on its device: its light, else a switch, else any. */
export function hyperhdrEntityOf(hass: HomeAssistant, deviceId: string): string | undefined {
  const ids = deviceEntities(hass, deviceId).sort();
  return (
    ids.find((id) => domainOf(id) === 'light') ??
    ids.find((id) => domainOf(id) === 'switch') ??
    ids[0]
  );
}

/** Which of the card's entities exist in Home Assistant. */
export function coverage(
  hass: HomeAssistant,
  entities: EntityMap,
): { found: number; total: number; missing: string[] } {
  const keys = Object.keys(entities) as EntityKey[];
  const missing = keys.map((key) => entities[key]).filter((id) => !hass.states[id]);
  return { found: keys.length - missing.length, total: keys.length, missing };
}

/** Prefix and HyperHDR entity of the configured devices. */
export function lookupDevices(hass: HomeAssistant, config: AmbilightCardConfig): DeviceLookup {
  return {
    prefix: config.device ? devicePrefix(hass, config.device) : undefined,
    hyperhdrEntity: config.hyperhdr_device
      ? hyperhdrEntityOf(hass, config.hyperhdr_device)
      : undefined,
  };
}
