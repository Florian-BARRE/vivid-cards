/* ====== Code Summary ======
 * The Vivid Pilot mode of a card or badge: `pilot: <node>` stands for the
 * entity Vivid Pilot generated for that node (its group, its mean, its
 * power…). A home-level measure (`all__temperature`) stands for each room's
 * own entity instead, so details list rooms ("Salon", "Chambre") rather than
 * raw sensors. An entity or a list written by hand wins (manual mode).
 */

import type { HomeAssistant } from '../hass-types';
import { nodeKey, parseNodeKey, type PilotCategory } from './node-key';
import { PilotIndex, type PilotKind } from './pilot-index';

/** What a card says about its target. */
export interface PilotTargetConfig {
  entity?: string;
  entities?: string[];
  /** Vivid Pilot node (`salon__light`). */
  pilot?: string;
}

/** The entity a `pilot` node stands for, when nothing is written by hand. */
export function pilotTarget(
  hass: HomeAssistant,
  config: PilotTargetConfig,
  kind: PilotKind,
): string | undefined {
  if (config.entity || config.entities?.length || !config.pilot) return undefined;
  return PilotIndex.of(hass).entity(config.pilot, kind);
}

/** Kinds whose home-level node reads best room by room. */
// Batteries stay one by one: what matters is which device to recharge.
const PER_ROOM_KINDS: ReadonlySet<PilotKind> = new Set(['mean', 'any', 'power', 'energy']);

/** Each room's entity for a home-level node (`all__temperature` → the rooms' means). */
export function pilotRoomTargets(hass: HomeAssistant, node: string, kind: PilotKind): string[] {
  const { area, category } = parseNodeKey(node);
  if (area || !category || !PER_ROOM_KINDS.has(kind)) return [];
  const index = PilotIndex.of(hass);
  return index
    .rooms()
    .map((room) => index.entity(nodeKey(room.area, category), kind))
    .filter((entity): entity is string => !!entity);
}

/**
 * Pilot mode: the config with `entity` set to the node's entity, or
 * `entities` to the rooms' for a home-level measure. Unchanged otherwise.
 */
export function withPilotEntity<T extends PilotTargetConfig>(
  hass: HomeAssistant,
  config: T,
  kind: PilotKind,
): T {
  const entity = pilotTarget(hass, config, kind);
  if (!entity) return config;
  const rooms = pilotRoomTargets(hass, config.pilot!, kind);
  return rooms.length > 1 ? { ...config, entities: rooms } : { ...config, entity };
}

/**
 * The first Vivid Pilot node with an entity of `kind` in one of `categories`
 * (none: room nodes), for a new card's starting config; the home node of the
 * first category when Vivid Pilot has none yet.
 */
export function pilotStub(
  hass: HomeAssistant | undefined,
  kind: PilotKind,
  categories: readonly (PilotCategory | undefined)[],
): { pilot: string } {
  const index = hass ? PilotIndex.of(hass) : undefined;
  const node = index
    ?.nodes()
    .find((key) => index.entity(key, kind) && categories.includes(parseNodeKey(key).category));
  return { pilot: node ?? nodeKey(undefined, categories[0]) };
}
