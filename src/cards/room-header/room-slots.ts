/* ====== Code Summary ======
 * Resolves every slot of a room header: the discovery sources chosen in the
 * config (the name pattern for the room, the room's area, in the order set),
 * then each role's slot (auto, tweaked, manual or off). Also says, per role,
 * which names were looked for, for the editor's "nothing found" line.
 */

import type { HomeAssistant } from '../../core/hass-types';
import {
  AreaSource,
  NamingSource,
  areaForRoom,
  discover,
  fillPattern,
  resolveSlot,
  type DiscoverySource,
  type ResolvedSlot,
} from '../../core/slots';
import type { ResolvedRoomHeaderConfig } from './config';
import { ROOM_ROLES, type RoleSpec, type RoomRole } from './roles';

export type RoomSlots = Record<RoomRole, ResolvedSlot>;

/** The area the room uses: the configured one, else the one named like the room. */
export function roomArea(
  hass: HomeAssistant,
  config: ResolvedRoomHeaderConfig,
): string | undefined {
  return config.area ?? (config.roomLabel ? areaForRoom(hass, config.roomLabel) : undefined);
}

function sourcesFor(
  hass: HomeAssistant,
  config: ResolvedRoomHeaderConfig,
  spec: RoleSpec,
): DiscoverySource[] {
  if (!config.discover) return [];
  const naming = config.roomLabel ? new NamingSource(config.roomLabel, config.pattern) : undefined;
  const areaId = spec.inArea ? roomArea(hass, config) : undefined;
  const area = areaId ? new AreaSource(areaId) : undefined;
  const order: (DiscoverySource | undefined)[] =
    config.discoverBy === 'area_naming'
      ? [area, naming]
      : config.discoverBy === 'naming'
        ? [naming]
        : config.discoverBy === 'area'
          ? [area]
          : [naming, area];
  return order.filter((source): source is DiscoverySource => !!source);
}

/** Every role's slot, in the order of the role table. */
export function roomSlots(hass: HomeAssistant, config: ResolvedRoomHeaderConfig): RoomSlots {
  const slots = {} as RoomSlots;
  for (const spec of ROOM_ROLES) {
    const found = discover(hass, sourcesFor(hass, config, spec), spec).filter(
      (item) => !config.excludeEntities.includes(item.entity),
    );
    slots[spec.role] = resolveSlot(config.slots[spec.role], found, spec.multiple);
  }
  return slots;
}

/** What the name pattern looks for, for a role ("sdb-présence"), when there is a room. */
export function searchedNames(
  config: ResolvedRoomHeaderConfig,
  spec: RoleSpec,
): string | undefined {
  if (!config.discover || !config.roomLabel) return undefined;
  return fillPattern(config.pattern, config.roomLabel, spec.aliases[0] ?? spec.role);
}
