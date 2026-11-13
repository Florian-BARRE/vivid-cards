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

/** A device that carries the box's relay and fan, under one entity prefix. */
export function isBoxDevice(hass: HomeAssistant, deviceId: string): boolean {
  const prefix = devicePrefix(hass, deviceId);
  return (
    prefix !== undefined &&
    hass.states[`switch.${prefix}relay`] !== undefined &&
    hass.states[`fan.${prefix}jonsbo_fan`] !== undefined
  );
}

/**
 * Registry lookups are cached per registry snapshot: Home Assistant replaces
 * `hass.entities` and `hass.devices` when they change, not on state changes.
 */
const registryCache = new WeakMap<object, Map<string, unknown>>();

export function cached<T>(hass: HomeAssistant, key: string, compute: () => T): T {
  const registry = hass.entities as object | undefined;
  if (!registry) return compute();
  let entries = registryCache.get(registry);
  if (!entries) {
    entries = new Map();
    registryCache.set(registry, entries);
  }
  const devices = hass.devices as object | undefined;
  const full = `${key}|${devices ? 'd' : '-'}`;
  const hit = entries.get(full) as { devices?: object; value: T } | undefined;
  if (hit && hit.devices === devices) return hit.value;
  const value = compute();
  entries.set(full, { devices, value });
  return value;
}

/** Every Ambilight box of the installation (device ids, sorted). */
export function findBoxes(hass: HomeAssistant): string[] {
  return cached(hass, 'boxes', () =>
    Object.keys(hass.devices ?? {})
      .filter((id) => isBoxDevice(hass, id))
      .sort(),
  );
}

/**
 * The box the card reads: the device picked, else (no prefix written either)
 * the first Ambilight box found in the registry.
 */
export function boxDevice(hass: HomeAssistant, config: AmbilightCardConfig): string | undefined {
  if (config.device) return config.device;
  return config.prefix ? undefined : findBoxes(hass)[0];
}

/** Prefix of the box the card reads. */
export function lookupDevices(hass: HomeAssistant, config: AmbilightCardConfig): DeviceLookup {
  const device = boxDevice(hass, config);
  return { prefix: device ? devicePrefix(hass, device) : undefined };
}
