/* ====== Code Summary ======
 * What lights the halo of a room header (and counts in its "lights on"):
 * each light role (lamps, LEDs, switches) follows its badge by default
 * (counted while its badge is in the badges list), or is set to always or
 * never; a single entity can override its group, and an entity outside the
 * room's lights can be added with "always".
 */

import { expandGroup } from '../../core/entities';
import type { HomeAssistant } from '../../core/hass-types';
import type { RoomBadgeConfig } from './config';
import type { RoomSlots } from './room-slots';

/* ============================== Settings ============================== */

export const HALO_ROLES = ['light', 'led', 'switch'] as const;
export type HaloRole = (typeof HALO_ROLES)[number];

/** `auto`: counted while the role's badge is listed in the badges. */
export const HALO_MODES = ['auto', 'always', 'never'] as const;
export type HaloMode = (typeof HALO_MODES)[number];

/** What one entity does, over its group. */
export const HALO_ENTITY_MODES = ['always', 'never'] as const;
export type HaloEntityMode = (typeof HALO_ENTITY_MODES)[number];

export interface HaloSettings {
  roles: Record<HaloRole, HaloMode>;
  /** Overrides by entity id (a leaf light or a whole group). */
  entities: Record<string, HaloEntityMode>;
}

export const DEFAULT_HALO: HaloSettings = {
  roles: { light: 'auto', led: 'auto', switch: 'auto' },
  entities: {},
};

/** True when the badges list shows the role: named, or through "the rest" (`*`). */
export function roleHasBadge(badges: readonly RoomBadgeConfig[], role: HaloRole): boolean {
  return badges.some((badge) => badge.slot === role || badge.slot === '*');
}

/* ============================== Scope ============================== */

/** One glow group: a slot entity (or an added entity) and its members that count. */
export interface HaloGroup {
  id: string;
  members: string[];
}

/**
 * The groups that light the halo and, in each, the members that count: a
 * member follows its own override, then its group's, then its role.
 */
export function haloGroups(
  hass: HomeAssistant,
  slots: RoomSlots,
  halo: HaloSettings,
  badges: readonly RoomBadgeConfig[],
): HaloGroup[] {
  const groups: HaloGroup[] = [];
  const seen = new Set<string>();
  for (const role of HALO_ROLES) {
    const mode = halo.roles[role];
    const roleCounts = mode === 'always' || (mode === 'auto' && roleHasBadge(badges, role));
    for (const group of slots[role].entities) {
      const groupMode = halo.entities[group];
      const members = expandGroup(hass, group).filter((member) => {
        if (seen.has(member)) return false;
        seen.add(member);
        const own = halo.entities[member] ?? groupMode;
        return own ? own === 'always' : roleCounts;
      });
      if (members.length) groups.push({ id: group, members });
    }
  }
  for (const [entity, mode] of Object.entries(halo.entities)) {
    if (mode !== 'always' || seen.has(entity) || slotsHold(slots, entity)) continue;
    seen.add(entity);
    groups.push({ id: entity, members: [entity] });
  }
  return groups;
}

function slotsHold(slots: RoomSlots, entity: string): boolean {
  return HALO_ROLES.some((role) => slots[role].entities.includes(entity));
}
