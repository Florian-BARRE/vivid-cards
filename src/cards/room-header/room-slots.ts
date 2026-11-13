/* ====== Code Summary ======
 * Resolves every slot of a room header: what Vivid Pilot generated for the
 * room's role (its light group, its mean temperature…), then the slot's mode
 * (Pilot, adjusted, manual or off).
 */

import type { HomeAssistant } from '../../core/hass-types';
import { PilotSource, discover, resolveSlot, type ResolvedSlot } from '../../core/slots';
import type { ResolvedRoomHeaderConfig } from './config';
import { ROOM_ROLES, roleNode, type RoomRole } from './roles';

export type RoomSlots = Record<RoomRole, ResolvedSlot>;

/** Every role's slot, in the order of the role table. */
export function roomSlots(hass: HomeAssistant, config: ResolvedRoomHeaderConfig): RoomSlots {
  const slots = {} as RoomSlots;
  for (const spec of ROOM_ROLES) {
    const sources = config.pilot ? [new PilotSource(roleNode(config.pilot, spec), spec.kind)] : [];
    slots[spec.role] = resolveSlot(
      config.slots[spec.role],
      discover(hass, sources, spec),
      spec.multiple,
    );
  }
  return slots;
}
