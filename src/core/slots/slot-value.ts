/* ====== Code Summary ======
 * The value of a slot in a card config, in its four forms:
 *   undefined                   auto: the discovery decides;
 *   { exclude: [], add: [] }    semi-auto: the discovery minus / plus;
 *   "light.x" | ["light.x"]     manual: only what is written;
 *   false                       off: nothing for this slot.
 * Parsing (with precise errors) and the editor's transforms, which always
 * write the shortest config (an empty semi-auto goes back to auto).
 */

/* ============================== Types ============================== */

export type SlotMode = 'auto' | 'manual' | 'off';

/** A slot value read from a config. */
export interface ParsedSlot {
  mode: SlotMode;
  /** Manual entities, in order. */
  manual: string[];
  /** Discovered entities left out (`"*"` leaves them all out). */
  exclude: string[];
  /** Entities added after the discovered ones. */
  add: string[];
}

/** What a slot value may be in YAML. */
export type SlotValue = undefined | false | string | string[] | SlotTweaks;

export interface SlotTweaks {
  exclude?: string[];
  add?: string[];
}

/** Matches an entity id (`domain.object_id`). */
const ENTITY_ID = /^[a-z0-9_]+\.[a-z0-9_]+$/;

/* ============================== Parsing ============================== */

function entityList(value: unknown, field: string, allowStar = false): string[] {
  if (value === undefined || value === null) return [];
  const list = typeof value === 'string' ? [value] : value;
  if (!Array.isArray(list)) throw new Error(`"${field}" must be a list of entity ids.`);
  return list.map((item, index) => {
    const id = typeof item === 'string' ? item.trim() : '';
    if (allowStar && id === '*') return id;
    if (!ENTITY_ID.test(id)) {
      throw new Error(
        `"${field}[${index}]" must be an entity id such as light.salon (got "${String(item)}").`,
      );
    }
    return id;
  });
}

/** Reads a slot value; `field` names it in errors (`entities.presence`). */
export function parseSlot(value: unknown, field: string): ParsedSlot {
  if (value === undefined || value === null || value === true) {
    return { mode: 'auto', manual: [], exclude: [], add: [] };
  }
  if (value === false) return { mode: 'off', manual: [], exclude: [], add: [] };
  if (typeof value === 'string' || Array.isArray(value)) {
    const manual = entityList(value, field);
    return manual.length
      ? { mode: 'manual', manual, exclude: [], add: [] }
      : { mode: 'auto', manual: [], exclude: [], add: [] };
  }
  if (typeof value === 'object') {
    const tweaks = value as Record<string, unknown>;
    const unknown = Object.keys(tweaks).filter((key) => key !== 'exclude' && key !== 'add');
    if (unknown.length) {
      throw new Error(`"${field}" only takes "exclude" and "add" (got "${unknown.join('", "')}").`);
    }
    return {
      mode: 'auto',
      manual: [],
      exclude: entityList(tweaks.exclude, `${field}.exclude`, true),
      add: entityList(tweaks.add, `${field}.add`),
    };
  }
  throw new Error(`"${field}" must be an entity, a list of entities, false, or { exclude, add }.`);
}

/** Reads a slot value without throwing (editors): an invalid value reads as auto. */
export function readSlot(value: unknown): ParsedSlot {
  try {
    return parseSlot(value, 'slot');
  } catch {
    return { mode: 'auto', manual: [], exclude: [], add: [] };
  }
}

/** True when the slot is auto with tweaks (semi-auto). */
export function isTweaked(slot: ParsedSlot): boolean {
  return slot.mode === 'auto' && (slot.exclude.length > 0 || slot.add.length > 0);
}

/* ============================== Writing ============================== */

/** The shortest config value for a parsed slot; `undefined` = leave the key out. */
export function writeSlot(slot: ParsedSlot, multiple: boolean): SlotValue {
  if (slot.mode === 'off') return false;
  if (slot.mode === 'manual') {
    if (!slot.manual.length) return undefined;
    return multiple ? [...slot.manual] : slot.manual[0];
  }
  if (!slot.exclude.length && !slot.add.length) return undefined;
  const tweaks: SlotTweaks = {};
  if (slot.exclude.length) tweaks.exclude = [...slot.exclude];
  if (slot.add.length) tweaks.add = [...slot.add];
  return tweaks;
}

/* ============================== Editor transforms ============================== */

/** Switches the mode; going manual copies `current` (what the slot shows now). */
export function setMode(_slot: ParsedSlot, mode: SlotMode, current: readonly string[]): ParsedSlot {
  if (mode === 'manual') return { mode, manual: [...current], exclude: [], add: [] };
  return { mode, manual: [], exclude: [], add: [] };
}

/** Keeps or leaves out a discovered entity (auto mode). */
export function setExcluded(slot: ParsedSlot, entity: string, excluded: boolean): ParsedSlot {
  const rest = slot.exclude.filter((item) => item !== entity);
  return { ...slot, mode: 'auto', exclude: excluded ? [...rest, entity] : rest };
}

/**
 * Adds an entity: to the manual list in manual mode, after the discovery
 * otherwise. A one-entity slot has nothing to add to: picking one makes it
 * manual.
 */
export function addEntity(slot: ParsedSlot, entity: string, multiple: boolean): ParsedSlot {
  if (!multiple) return { mode: 'manual', manual: [entity], exclude: [], add: [] };
  if (slot.mode === 'manual') {
    return { ...slot, manual: [...slot.manual.filter((item) => item !== entity), entity] };
  }
  return { ...slot, mode: 'auto', add: [...slot.add.filter((item) => item !== entity), entity] };
}

/** Removes an entity that was added (auto) or written (manual). */
export function removeEntity(slot: ParsedSlot, entity: string): ParsedSlot {
  return {
    ...slot,
    add: slot.add.filter((item) => item !== entity),
    manual: slot.manual.filter((item) => item !== entity),
  };
}

/** Moves a manual or added entity one place earlier (-1) or later (+1). */
export function moveEntity(slot: ParsedSlot, entity: string, offset: -1 | 1): ParsedSlot {
  const key = slot.mode === 'manual' ? 'manual' : 'add';
  const list = [...slot[key]];
  const index = list.indexOf(entity);
  const target = index + offset;
  if (index < 0 || target < 0 || target >= list.length) return slot;
  [list[index], list[target]] = [list[target]!, list[index]!];
  return { ...slot, [key]: list };
}
