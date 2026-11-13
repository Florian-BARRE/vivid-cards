/* ====== Code Summary ======
 * Where a slot's entities come from when nothing is written by hand. Each
 * source answers a query (the domains a slot accepts) with the entities it
 * finds and how, so the editor can say "Vivid Pilot · Salon › Lumières".
 *   PilotSource   an entity Vivid Pilot generated for a node (a room's light
 *                 group, its mean temperature…), or its members;
 *   GroupSource   the members of a group picked by hand.
 * (`device` entries come from the device cards, `energy` from the Energy
 * dashboard's grid.) Nothing is ever found from an entity's name or area:
 * Vivid Pilot sorts the home, the cards read it.
 */

import { domainOf, expandGroup } from '../entities';
import type { HomeAssistant } from '../hass-types';
import { PilotIndex, type PilotKind } from '../pilot';

/* ============================== Types ============================== */

export type SourceKind = 'pilot' | 'group' | 'device' | 'energy';

/** What a slot accepts. */
export interface RoleQuery {
  /** Domains accepted, preferred first; any when empty. */
  domains: readonly string[];
}

/** One entity found, and how. */
export interface Found {
  entity: string;
  source: SourceKind;
  /** The node for `pilot`, the group for `group`, the device for `device`. */
  via: string;
}

/** A way of finding entities. */
export abstract class DiscoverySource {
  abstract readonly kind: SourceKind;

  /** Entities answering the query, best first. */
  abstract find(hass: HomeAssistant, query: RoleQuery): Found[];
}

function accepts(query: RoleQuery, entity: string): boolean {
  return !query.domains.length || query.domains.includes(domainOf(entity));
}

/* ============================== Sources ============================== */

/**
 * What Vivid Pilot generated for a node: the entity of a kind (the room's
 * light group, its mean temperature) or, with `members`, what it lists.
 */
export class PilotSource extends DiscoverySource {
  readonly kind = 'pilot' as const;

  constructor(
    private readonly node: string,
    private readonly pilotKind: PilotKind,
    private readonly members = false,
  ) {
    super();
  }

  find(hass: HomeAssistant, query: RoleQuery): Found[] {
    const index = PilotIndex.of(hass);
    const entity = index.entity(this.node, this.pilotKind);
    if (!entity) return [];
    const ids = this.members ? index.members(this.node, this.pilotKind) : [entity];
    return ids
      .filter((id) => accepts(query, id))
      .map((id) => ({ entity: id, source: 'pilot', via: this.node }));
  }
}

/** The members of a group (nested groups flattened). */
export class GroupSource extends DiscoverySource {
  readonly kind = 'group' as const;

  constructor(private readonly group: string) {
    super();
  }

  find(hass: HomeAssistant, query: RoleQuery): Found[] {
    return expandGroup(hass, this.group)
      .filter((entity) => accepts(query, entity))
      .map((entity) => ({ entity, source: 'group', via: this.group }));
  }
}
