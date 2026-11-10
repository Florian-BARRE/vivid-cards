/* ====== Code Summary ======
 * What a room header shows, from its resolved config and Home Assistant:
 * its slots, its lights (the lamps, LEDs and switches slots), the lights on,
 * the power, the halo, the power button's two ways, the badges.
 */

import { expandGroup, friendlyName, isAvailable, parseNumericState } from '../../core/entities';
import type { HomeAssistant } from '../../core/hass-types';
import { isVisible, roomBadges, type ShownBadge } from './badges';
import type { ResolvedRoomHeaderConfig } from './config';
import { haloSources, isOn, type HaloSource } from './halo';
import { powerPlan, type PowerPlan } from './power-action';
import { roomSlots, type RoomSlots } from './room-slots';

export { AMBER, haloSources, type HaloSource } from './halo';

/** `salon` → `Salon`, `salle_de_bain` → `Salle de bain`, `séjour` → `Séjour`. */
export function roomTitle(room: string): string {
  const words = room.replace(/[_-]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Watts of a power sensor (kW converted); `undefined` when it cannot be read. */
export function powerWatts(hass: HomeAssistant, entityId: string | undefined): number | undefined {
  if (!entityId) return undefined;
  const state = hass.states[entityId];
  const value = parseNumericState(state);
  if (value === undefined) return undefined;
  const unit = state?.attributes.unit_of_measurement;
  return unit === 'kW' ? value * 1000 : value;
}

export interface RoomHeaderModel {
  name: string;
  slots: RoomSlots;
  /** Lamps, LED strips, then switches (groups as configured). */
  lights: string[];
  /** Leaf lights and switches of the light groups, each counted once. */
  members: string[];
  on: number;
  total: number;
  /** No light could be read (all unavailable). */
  unavailable: boolean;
  /** Watts. */
  power?: number;
  sources: HaloSource[];
  plan: PowerPlan;
  /** The power button shows. */
  hasPower: boolean;
  /** Badges to show now (their conditions hold). */
  badges: ShownBadge[];
  /** Entity of the more-info a hold opens by default. */
  mainEntity?: string;
  /** Entities read by the title, the subtitle and the halo (badges watch their own). */
  watched: string[];
}

export function buildRoomHeaderModel(
  hass: HomeAssistant,
  config: ResolvedRoomHeaderConfig,
  isDefined: (tag: string) => boolean = () => true,
): RoomHeaderModel {
  const slots = roomSlots(hass, config);
  const lights = [
    ...slots.lampes.entities,
    ...slots.leds.entities,
    ...slots.interrupteurs.entities,
  ];
  const members = [...new Set(lights.flatMap((id) => expandGroup(hass, id)))];
  const readable = members.filter((id) => isAvailable(hass.states[id]));
  const power = slots.puissance.entities[0];
  const plan = powerPlan(config, slots, lights);
  const name =
    config.name ??
    (config.roomLabel
      ? roomTitle(config.roomLabel)
      : lights[0]
        ? friendlyName(hass, lights[0])
        : '');
  const mainEntity = config.entity ?? lights[0];
  const hasAction = plan.on.source !== 'none' || plan.off.source !== 'none';
  const watched = new Set<string>([...lights, ...members]);
  if (power) watched.add(power);
  if (mainEntity) watched.add(mainEntity);
  const badges = roomBadges(slots, config.badges, isDefined);
  for (const badge of badges)
    for (const condition of badge.visibility ?? []) watched.add(condition.entity);
  return {
    name,
    slots,
    lights,
    members,
    on: readable.filter((id) => isOn(hass, id)).length,
    total: readable.length,
    unavailable: members.length > 0 && readable.length === 0,
    power: powerWatts(hass, power),
    sources: haloSources(hass, lights),
    plan,
    hasPower: config.powerShow === 'always' || (config.powerShow === 'auto' && hasAction),
    badges: badges.filter((badge) => isVisible(hass, badge.visibility)),
    mainEntity,
    watched: [...watched],
  };
}

/** The action a tap on the power button runs now (off when a light is on). */
export function powerTap(model: RoomHeaderModel) {
  return (model.on > 0 ? model.plan.off : model.plan.on).action;
}
