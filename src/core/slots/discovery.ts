/* ====== Code Summary ======
 * Where a slot's entities can be found automatically. Each source answers a
 * role query (the role's names, the domains and device classes it accepts)
 * with the entities it finds and how it found them, so the editor can say
 * "found by its name sdb-présence" or "found in the area Salle de bain".
 *   NamingSource   a name pattern such as "{room}-{role}", matched on the
 *                  entity id, the friendly name and the registry name;
 *   AreaSource     the entities of a Home Assistant area;
 *   GroupSource    the members of a group.
 * (`device` entries come from the device cards, by entity id prefix.)
 * Accents, case and separators are ignored everywhere ("Salon-Présence" =
 * salon_presence).
 */

import { domainOf, expandGroup, objectIdOf } from '../entities';
import type { HomeAssistant } from '../hass-types';

/* ============================== Types ============================== */

export type SourceKind = 'naming' | 'area' | 'group' | 'device' | 'energy';

/** All source kinds, in the default order. */
export const SOURCE_KINDS: readonly SourceKind[] = ['naming', 'area', 'group', 'device', 'energy'];

/** What a slot is looking for. */
export interface RoleQuery {
  /** Names of the role ("presence", "présence", "motion"). */
  aliases: readonly string[];
  /** Domains accepted, preferred first. */
  domains: readonly string[];
  /** Device classes accepted (area source); any when unset. */
  deviceClasses?: readonly string[];
}

/** One entity found, and how. */
export interface Found {
  entity: string;
  source: SourceKind;
  /** What matched: the name for `naming`, the area name for `area`, the group for `group`. */
  via: string;
}

/** A way of finding entities. */
export abstract class DiscoverySource {
  abstract readonly kind: SourceKind;

  /** Entities answering the query, best first. */
  abstract find(hass: HomeAssistant, query: RoleQuery): Found[];
}

/* ============================== Names ============================== */

/**
 * Lower case, accents removed, every run of other characters as one `_`:
 * "Salon-Présence" and `salon_presence` both give `salon_presence`.
 */
export function nameKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/** The default name pattern: the room, a dash, the role ("salon-présence"). */
export const DEFAULT_PATTERN = '{room}-{role}';

/** A pattern is valid when it holds {role} (and {room} when there is a room). */
export function isValidPattern(pattern: string, withRoom: boolean): boolean {
  return pattern.includes('{role}') && (!withRoom || pattern.includes('{room}'));
}

/** The name a pattern gives a role, as written: "{room}-{role}" → "sdb-présence". */
export function fillPattern(pattern: string, room: string, role: string): string {
  return pattern.split('{room}').join(room).split('{role}').join(role);
}

interface NameIndex {
  /** Name key → entities whose entity id gives it. */
  byId: Map<string, string[]>;
  /** Name key → entities whose friendly or registry name gives it. */
  byName: Map<string, string[]>;
}

const indexCache = new WeakMap<object, NameIndex>();

function push(map: Map<string, string[]>, key: string, entity: string): void {
  const list = map.get(key);
  if (!list) map.set(key, [entity]);
  else if (!list.includes(entity)) list.push(entity);
}

/** Name keys of every entity, built once per states object. */
function nameIndex(hass: HomeAssistant): NameIndex {
  let index = indexCache.get(hass.states);
  if (index) return index;
  index = { byId: new Map(), byName: new Map() };
  for (const [entity, state] of Object.entries(hass.states)) {
    push(index.byId, nameKey(objectIdOf(entity)), entity);
    const friendly = state.attributes.friendly_name;
    if (typeof friendly === 'string') push(index.byName, nameKey(friendly), entity);
    const registry = hass.entities?.[entity]?.name;
    if (typeof registry === 'string') push(index.byName, nameKey(registry), entity);
  }
  indexCache.set(hass.states, index);
  return index;
}

/* ============================== Sources ============================== */

/** Entities named after a pattern ("{room}-{role}"), by id first, then by name. */
export class NamingSource extends DiscoverySource {
  readonly kind = 'naming' as const;

  constructor(
    private readonly room: string,
    private readonly pattern: string = DEFAULT_PATTERN,
  ) {
    super();
  }

  find(hass: HomeAssistant, query: RoleQuery): Found[] {
    const index = nameIndex(hass);
    const found: { item: Found; rank: [number, number, number, string] }[] = [];
    query.aliases.forEach((alias, aliasRank) => {
      const written = fillPattern(this.pattern, this.room, alias);
      const key = nameKey(written);
      if (!key) return;
      const add = (entity: string, byName: number) => {
        const domainRank = query.domains.indexOf(domainOf(entity));
        if (domainRank === -1 || found.some((entry) => entry.item.entity === entity)) return;
        found.push({
          item: { entity, source: 'naming', via: written },
          rank: [byName, domainRank, aliasRank, entity],
        });
      };
      for (const entity of index.byId.get(key) ?? []) add(entity, 0);
      for (const entity of index.byName.get(key) ?? []) add(entity, 1);
    });
    return found.sort((a, b) => compare(a.rank, b.rank)).map((entry) => entry.item);
  }
}

function compare(a: [number, number, number, string], b: [number, number, number, string]): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3].localeCompare(b[3]);
}

/** The area of an entity: its own, else its device's. */
export function areaOf(hass: HomeAssistant, entity: string): string | undefined {
  const entry = hass.entities?.[entity];
  if (entry?.area_id) return entry.area_id;
  const device = entry?.device_id ? hass.devices?.[entry.device_id] : undefined;
  return device?.area_id ?? undefined;
}

/** Entities placed in a Home Assistant area, filtered by domain and device class. */
export class AreaSource extends DiscoverySource {
  readonly kind = 'area' as const;

  constructor(private readonly area: string) {
    super();
  }

  find(hass: HomeAssistant, query: RoleQuery): Found[] {
    const name = hass.areas?.[this.area]?.name ?? this.area;
    return Object.keys(hass.states)
      .filter((entity) => {
        if (!query.domains.includes(domainOf(entity))) return false;
        if (areaOf(hass, entity) !== this.area) return false;
        if (hass.entities?.[entity]?.hidden || hass.entities?.[entity]?.entity_category)
          return false;
        const deviceClass = hass.states[entity]?.attributes.device_class;
        return !query.deviceClasses || query.deviceClasses.includes(String(deviceClass));
      })
      .sort(
        (a, b) =>
          query.domains.indexOf(domainOf(a)) - query.domains.indexOf(domainOf(b)) ||
          a.localeCompare(b),
      )
      .map((entity) => ({ entity, source: 'area', via: name }));
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
      .filter((entity) => !query.domains.length || query.domains.includes(domainOf(entity)))
      .map((entity) => ({ entity, source: 'group', via: this.group }));
  }
}

/** The area whose id or name is the room ("salon" → area "salon" or "Salon"). */
export function areaForRoom(hass: HomeAssistant, room: string): string | undefined {
  const key = nameKey(room);
  if (!key) return undefined;
  return Object.values(hass.areas ?? {}).find(
    (area) => nameKey(area.area_id) === key || nameKey(area.name) === key,
  )?.area_id;
}
