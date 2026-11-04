import type { EntityRegistryDisplayEntry, HassEntity, HomeAssistant } from './hass-types';

const UNAVAILABLE_STATES = new Set(['unavailable', 'unknown']);

export function domainOf(entityId: string): string {
  const dot = entityId.indexOf('.');
  return dot === -1 ? '' : entityId.slice(0, dot);
}

export function objectIdOf(entityId: string): string {
  const dot = entityId.indexOf('.');
  return dot === -1 ? entityId : entityId.slice(dot + 1);
}

export function isAvailable(state: HassEntity | undefined): state is HassEntity {
  return state !== undefined && !UNAVAILABLE_STATES.has(state.state);
}

export function friendlyName(hass: HomeAssistant, entityId: string): string {
  const name = hass.states[entityId]?.attributes.friendly_name;
  return typeof name === 'string' && name.trim() !== '' ? name.trim() : objectIdOf(entityId);
}

/**
 * Expands a group entity into its leaf members (nested groups are flattened).
 * Returns `[entityId]` when the entity is not a group. Members missing from
 * `hass.states` are skipped because there is nothing to render for them.
 */
export function expandGroup(hass: HomeAssistant, entityId: string): string[] {
  const result: string[] = [];
  const visited = new Set<string>();

  const visit = (id: string): void => {
    if (visited.has(id)) return;
    visited.add(id);
    const state = hass.states[id];
    if (!state) return;
    const members = state.attributes.entity_id;
    if (Array.isArray(members) && members.length > 0) {
      for (const member of members) {
        if (typeof member === 'string') visit(member);
      }
      return;
    }
    result.push(id);
  };

  visit(entityId);
  return result;
}

const deviceIndexCache = new WeakMap<
  Record<string, EntityRegistryDisplayEntry>,
  Map<string, string[]>
>();

function deviceIndex(hass: HomeAssistant): Map<string, string[]> {
  const registry = hass.entities ?? {};
  let index = deviceIndexCache.get(registry);
  if (!index) {
    index = new Map();
    for (const entry of Object.values(registry)) {
      if (!entry.device_id) continue;
      const list = index.get(entry.device_id);
      if (list) list.push(entry.entity_id);
      else index.set(entry.device_id, [entry.entity_id]);
    }
    for (const list of index.values()) list.sort();
    deviceIndexCache.set(registry, index);
  }
  return index;
}

export function deviceIdOf(hass: HomeAssistant, entityId: string): string | undefined {
  return hass.entities?.[entityId]?.device_id;
}

/** All entity ids that belong to the same device as `entityId` (sorted). */
export function siblingEntities(hass: HomeAssistant, entityId: string): string[] {
  const deviceId = deviceIdOf(hass, entityId);
  if (!deviceId) return [];
  return deviceIndex(hass).get(deviceId) ?? [];
}

export function parseNumericState(state: HassEntity | undefined): number | undefined {
  if (!isAvailable(state)) return undefined;
  const value = Number.parseFloat(state.state);
  return Number.isFinite(value) ? value : undefined;
}

/**
 * Entity id prefix of a device from known `domain.object` suffixes: the part
 * before them, the most common one among the device's entities. A prefix is
 * empty or ends with "_" ("salon_salon_air_station_").
 */
export function devicePrefixFor(
  hass: HomeAssistant,
  deviceId: string,
  suffixes: readonly string[],
): string | undefined {
  const counts = new Map<string, number>();
  const parsed = suffixes.map((suffix) => {
    const [domain, object] = suffix.split('.') as [string, string];
    return { domain, object };
  });
  for (const entry of Object.values(hass.entities ?? {})) {
    if (entry.device_id !== deviceId) continue;
    const domain = domainOf(entry.entity_id);
    const object = objectIdOf(entry.entity_id);
    for (const suffix of parsed) {
      if (suffix.domain !== domain || !object.endsWith(suffix.object)) continue;
      const prefix = object.slice(0, object.length - suffix.object.length);
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
