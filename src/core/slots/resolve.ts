/* ====== Code Summary ======
 * Resolves a slot: what the discovery found, minus what was left out, plus
 * what was added, or only what was written (manual), or nothing (off). Every
 * entity keeps its origin so the editor can show where it comes from.
 */

import type { HomeAssistant } from '../hass-types';
import type { DiscoverySource, Found, RoleQuery } from './discovery';
import type { ParsedSlot, SlotMode } from './slot-value';

/* ============================== Types ============================== */

export type EntryOrigin = 'found' | 'added' | 'manual';

/** One entity of a slot as the editor lists it. */
export interface SlotEntry {
  entity: string;
  origin: EntryOrigin;
  /** How it was found (origin `found`). */
  found?: Found;
  /** Found but left out (kept in the list so it can be put back). */
  excluded: boolean;
}

export interface ResolvedSlot {
  mode: SlotMode;
  /** Auto with entities left out or added. */
  tweaked: boolean;
  /** Entities the card uses, in order. */
  entities: string[];
  /** Every entity the editor shows: found (left out ones too), added, manual. */
  entries: SlotEntry[];
}

/* ============================== Discovery ============================== */

/** Asks the sources in order; the first that finds something wins. */
export function discover(
  hass: HomeAssistant,
  sources: readonly DiscoverySource[],
  query: RoleQuery,
): Found[] {
  for (const source of sources) {
    const found = source.find(hass, query);
    if (found.length) return found;
  }
  return [];
}

/* ============================== Resolution ============================== */

/**
 * The entities of a slot. A one-entity slot keeps the first entity left after
 * the exclusions (or the last one added, which replaces the found one).
 */
export function resolveSlot(
  slot: ParsedSlot,
  found: readonly Found[],
  multiple: boolean,
): ResolvedSlot {
  if (slot.mode === 'off') return { mode: 'off', tweaked: false, entities: [], entries: [] };
  if (slot.mode === 'manual') {
    const manual = multiple ? slot.manual : slot.manual.slice(0, 1);
    return {
      mode: 'manual',
      tweaked: false,
      entities: [...manual],
      entries: manual.map((entity) => ({ entity, origin: 'manual', excluded: false })),
    };
  }
  const all = slot.exclude.includes('*');
  const entries: SlotEntry[] = found.map((item) => ({
    entity: item.entity,
    origin: 'found',
    found: item,
    excluded: all || slot.exclude.includes(item.entity),
  }));
  for (const entity of slot.add) {
    if (entries.some((entry) => entry.entity === entity && !entry.excluded)) continue;
    entries.push({ entity, origin: 'added', excluded: false });
  }
  const kept = entries.filter((entry) => !entry.excluded).map((entry) => entry.entity);
  return {
    mode: 'auto',
    tweaked: slot.exclude.length > 0 || slot.add.length > 0,
    entities: multiple ? kept : kept.slice(0, 1),
    entries,
  };
}
