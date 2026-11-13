/* ====== Code Summary ======
 * What a room header shows, from its resolved config and Home Assistant:
 * its slots, its lights (the light, LED and switch slots), the lights on,
 * the power, the halo, the power button's two ways (the room's Vivid Pilot
 * memory scene first), the badges.
 */

import { expandGroup, friendlyName, isAvailable, parseNumericState } from '../../core/entities';
import type { HomeAssistant } from '../../core/hass-types';
import { PilotIndex } from '../../core/pilot';
import { isVisible, roomBadges, type ShownBadge } from './badges';
import type { ResolvedRoomHeaderConfig } from './config';
import { haloSources, isOn, type HaloSource } from './halo';
import { powerPlan, type PowerPlan } from './power-action';
import { roomSlots, type RoomSlots } from './room-slots';

export { AMBER, haloSources, type HaloSource } from './halo';

/** The room's memory scene when it can restore something now. */
export function memoryScene(hass: HomeAssistant, room: string | undefined): string | undefined {
  if (!room) return undefined;
  const scene = PilotIndex.of(hass).entity(room, 'state');
  const state = scene ? hass.states[scene] : undefined;
  return state && isAvailable(state) && state.attributes.saved_at ? scene : undefined;
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
  const lights = [...slots.light.entities, ...slots.led.entities, ...slots.switch.entities];
  const members = [...new Set(lights.flatMap((id) => expandGroup(hass, id)))];
  const readable = members.filter((id) => isAvailable(hass.states[id]));
  const power = slots.power.entities[0];
  const plan = powerPlan(config, memoryScene(hass, config.pilot), lights);
  const name =
    config.name ??
    (config.pilot
      ? PilotIndex.of(hass).areaName(config.pilot)
      : lights[0]
        ? friendlyName(hass, lights[0])
        : '');
  const mainEntity = config.entity ?? lights[0];
  const hasAction = plan.on.source !== 'none' || plan.off.source !== 'none';
  const watched = new Set<string>([...lights, ...members]);
  if (power) watched.add(power);
  for (const entity of plan.on.entities) watched.add(entity);
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
