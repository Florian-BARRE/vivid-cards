/* ====== Code Summary ======
 * PilotIndex: every entity Vivid Pilot generated, found from the card
 * contract only — the `vivid_pilot_node` and `vivid_pilot_kind` attributes of
 * each state — never from names or entity ids. Answers "the light group of
 * the living room", "the mean temperature of the bedroom", "the members of
 * that group", "the rooms". Built once per `hass.states` object.
 */

import type { HomeAssistant } from '../hass-types';
import { HOME_NODE, nodeKey, parseNodeKey, type PilotCategory } from './node-key';

/** What a generated entity is for its node (mirror of the integration's kinds). */
export type PilotKind =
  | 'group'
  | 'state'
  | 'any'
  | 'mean'
  | 'min'
  | 'max'
  | 'power'
  | 'energy'
  | 'battery'
  | 'strip_power';

/** A room known to Vivid Pilot. */
export interface PilotRoom {
  /** Home Assistant area id, also the room's node key. */
  area: string;
  name: string;
  /** Categories with at least one generated entity. */
  categories: PilotCategory[];
}

const NODE_ATTRIBUTE = 'vivid_pilot_node';
const KIND_ATTRIBUTE = 'vivid_pilot_kind';

const cache = new WeakMap<object, PilotIndex>();

export class PilotIndex {
  /** Node key → kind → entity id. */
  private readonly byNode = new Map<string, Map<PilotKind, string>>();
  /** Entity id → its node and kind. */
  private readonly byEntity = new Map<string, { node: string; kind: PilotKind }>();
  /** WLED light → its computed power sensor. */
  private readonly strips = new Map<string, string>();

  private constructor(private readonly hass: HomeAssistant) {
    for (const [entityId, state] of Object.entries(hass.states)) {
      const node = state.attributes[NODE_ATTRIBUTE];
      const kind = state.attributes[KIND_ATTRIBUTE];
      if (typeof node !== 'string' || typeof kind !== 'string') continue;
      const kinds = this.byNode.get(node) ?? new Map<PilotKind, string>();
      kinds.set(kind as PilotKind, entityId);
      this.byNode.set(node, kinds);
      this.byEntity.set(entityId, { node, kind: kind as PilotKind });
      const light = state.attributes.light;
      if (kind === 'strip_power' && typeof light === 'string') this.strips.set(light, entityId);
    }
  }

  /** The index of this `hass.states` (built once, then reused). */
  static of(hass: HomeAssistant): PilotIndex {
    let index = cache.get(hass.states);
    if (!index) {
      index = new PilotIndex(hass);
      cache.set(hass.states, index);
    }
    return index;
  }

  /** True when Vivid Pilot is installed and generated something. */
  get available(): boolean {
    return this.byNode.size > 0;
  }

  /** The entity of a node for a kind (`salon__light`, `group`). */
  entity(node: string, kind: PilotKind): string | undefined {
    return this.byNode.get(node)?.get(kind);
  }

  /** Every kind a node has, with its entity. */
  kinds(node: string): ReadonlyMap<PilotKind, string> {
    return this.byNode.get(node) ?? new Map();
  }

  /** The members a node's entity lists (`entity_id`), e.g. the lamps of a group. */
  members(node: string, kind: PilotKind = 'group'): string[] {
    const entity = this.entity(node, kind);
    const members = entity ? this.hass.states[entity]?.attributes.entity_id : undefined;
    return Array.isArray(members) ? members.filter((id) => typeof id === 'string') : [];
  }

  /** Where a generated entity sits, or `undefined` for any other entity. */
  locate(entityId: string): { node: string; kind: PilotKind } | undefined {
    return this.byEntity.get(entityId);
  }

  /** The computed power sensor of a WLED strip. */
  stripPower(lightId: string): string | undefined {
    return this.strips.get(lightId);
  }

  /** Every node key, the home first, then rooms and their categories by name. */
  nodes(): string[] {
    return [...this.byNode.keys()].sort((a, b) => this.sortKey(a).localeCompare(this.sortKey(b)));
  }

  /** The rooms, by name. */
  rooms(): PilotRoom[] {
    const rooms = new Map<string, PilotRoom>();
    for (const key of this.byNode.keys()) {
      const { area, category } = parseNodeKey(key);
      if (!area) continue;
      const room = rooms.get(area) ?? { area, name: this.areaName(area), categories: [] };
      if (category && !room.categories.includes(category)) room.categories.push(category);
      rooms.set(area, room);
    }
    return [...rooms.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Categories present at the home level. */
  homeCategories(): PilotCategory[] {
    return [...this.byNode.keys()]
      .map((key) => parseNodeKey(key))
      .filter((key) => !key.area && key.category)
      .map((key) => key.category!);
  }

  /** The name of a room's area ("Salon"), its id when unknown. */
  areaName(area: string): string {
    return this.hass.areas?.[area]?.name ?? area;
  }

  private sortKey(key: string): string {
    const { area, category } = parseNodeKey(key);
    const room = area ? `1${this.areaName(area)}` : '0';
    return `${room}\u0000${category ?? ''}`;
  }
}

export { HOME_NODE, nodeKey };
