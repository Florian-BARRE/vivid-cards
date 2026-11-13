/* ====== Code Summary ======
 * The badges a room header shows, from its badges list: the badge of a role
 * (one per light for the light roles) with its options — a badge whose
 * entity comes straight from Vivid Pilot gets the node instead (`pilot:`),
 * so a home-level badge lists the rooms — "the rest" (`*`:
 * every role's badge not listed elsewhere, in the order of the roles), and
 * free badges. A free badge on the entity of a found badge takes its place.
 * Each badge can carry state conditions (shown only when…).
 */

import type { HomeAssistant } from '../../core/hass-types';
import type { RoomBadgeConfig, StateCondition } from './config';
import type { RoomSlots } from './room-slots';
import { ROOM_ROLES, roleSpec, type RoomRole } from './roles';

/** One badge to show. */
export interface ShownBadge {
  /** Stable across updates while the list does not change. */
  key: string;
  /** Element config: `type`, `entity` and the badge's own options. */
  config: { type: string; entity?: string; [key: string]: unknown };
  /** The role it shows, or none for a free badge. */
  role?: RoomRole;
  /** The entity it shows (a role's, even when its config names the Pilot node). */
  entity?: string;
  visibility?: StateCondition[];
}

function roleBadges(
  slots: RoomSlots,
  role: RoomRole,
  options: Record<string, unknown>,
  key: string,
  isDefined: (tag: string) => boolean,
): ShownBadge[] {
  const spec = roleSpec(role);
  const tag = typeof options.type === 'string' ? options.type.replace(/^custom:/, '') : spec.badge;
  if (!tag || !isDefined(tag)) return [];
  const { slot: _slot, visibility, type: _type, ...rest } = options;
  const slot = slots[role];
  return slot.entities.map((entity) => {
    const found = slot.entries.find((entry) => entry.entity === entity)?.found;
    const target = found?.source === 'pilot' ? { pilot: found.via } : { entity };
    return {
      key: `${key}:${entity}`,
      config: { ...spec.badgeOptions, ...rest, type: `custom:${tag}`, ...target },
      role,
      entity,
      visibility: visibility as StateCondition[] | undefined,
    };
  });
}

/** Badges in the order of the list, `*` expanded. */
export function roomBadges(
  slots: RoomSlots,
  items: readonly RoomBadgeConfig[],
  isDefined: (tag: string) => boolean = () => true,
): ShownBadge[] {
  const listed = new Set(items.map((item) => item.slot).filter((slot) => slot && slot !== '*'));
  const freeEntities = new Set(
    items
      .filter((item) => item.slot === undefined && typeof item.entity === 'string')
      .map((item) => item.entity as string),
  );
  return items.flatMap((item, index) => {
    if (item.slot === '*') {
      return ROOM_ROLES.filter((spec) => spec.badge && !listed.has(spec.role)).flatMap((spec) =>
        roleBadges(slots, spec.role, {}, `*:${spec.role}`, isDefined).filter(
          (badge) => !freeEntities.has(badge.entity ?? ''),
        ),
      );
    }
    if (item.slot)
      return roleBadges(slots, item.slot as RoomRole, item, `${index}:${item.slot}`, isDefined);
    const { visibility, ...config } = item;
    const tag = String(item.type ?? '').replace(/^custom:/, '');
    if (!tag || !isDefined(tag)) return [];
    return [{ key: `${index}:free`, config: { ...config, type: `custom:${tag}` }, visibility }];
  });
}

/* ============================== Visibility ============================== */

function matches(value: string | undefined, expected: string | string[]): boolean {
  return Array.isArray(expected) ? expected.includes(value ?? '') : value === expected;
}

/** True when every condition holds (no condition: always). */
export function isVisible(
  hass: HomeAssistant,
  conditions: readonly StateCondition[] | undefined,
): boolean {
  return (conditions ?? []).every((condition) => {
    const state = hass.states[condition.entity]?.state;
    if (condition.state !== undefined && !matches(state, condition.state)) return false;
    if (condition.state_not !== undefined && matches(state, condition.state_not)) return false;
    return true;
  });
}
