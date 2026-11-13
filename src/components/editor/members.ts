/* ====== Code Summary ======
 * A group card's members as a slot (LEDs, lamps, badges on a group): auto =
 * the group's members, tweaked with `exclude` / `add` at the top of the
 * config, manual = the `entities` list (cards that accept one). Pure: the
 * editors pass what this returns to `vivid-slot-editor`.
 */

import type { HomeAssistant } from '../../core/hass-types';
import {
  GroupSource,
  parseSlot,
  readSlot,
  resolveSlot,
  type ResolvedSlot,
  type SlotValue,
} from '../../core/slots';

/** The members part of a group card's config. */
export interface MembersConfig {
  entity?: string;
  entities?: string[];
  exclude?: string[];
  add?: string[];
  [key: string]: unknown;
}

/** The slot value the members' config stands for. */
export function membersValue(config: MembersConfig): SlotValue {
  if (Array.isArray(config.entities) && config.entities.length) return [...config.entities];
  const tweaks: { exclude?: string[]; add?: string[] } = {};
  if (config.exclude?.length) tweaks.exclude = [...config.exclude];
  if (config.add?.length) tweaks.add = [...config.add];
  return Object.keys(tweaks).length ? tweaks : undefined;
}

/** The members as the editor shows them: the group's, left out, added, or listed. */
export function membersSlot(
  hass: HomeAssistant,
  config: MembersConfig,
  domains: readonly string[] = [],
): ResolvedSlot {
  const value = membersValue(config);
  let slot = readSlot(value);
  try {
    slot = parseSlot(value, 'members');
  } catch {
    // Shown as auto; the card says what is wrong.
  }
  const found = config.entity ? new GroupSource(config.entity).find(hass, { domains }) : [];
  return resolveSlot(slot, found, true);
}

/** Writes a new members value back: `exclude` / `add`, or `entities` (manual). */
export function applyMembers<T extends MembersConfig>(config: T, value: SlotValue): T {
  const next: Record<string, unknown> = { ...config };
  delete next.exclude;
  delete next.add;
  if (Array.isArray(value) || typeof value === 'string') {
    next.entities = Array.isArray(value) ? value : [value];
    return next as T;
  }
  if (Array.isArray(config.entities) && config.entities.length) delete next.entities;
  if (value && typeof value === 'object') {
    if (value.exclude?.length) next.exclude = value.exclude;
    if (value.add?.length) next.add = value.add;
  }
  return next as T;
}
