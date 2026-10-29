import { domainOf, objectIdOf } from '../../core/entities';
import type { HomeAssistant } from '../../core/hass-types';

/**
 * Roles of a room in the owner's naming convention: group helpers titled
 * `<room>-<role>` ("salon-présence"), whose entity ids become
 * `<domain>.<room>_<role>` without accents (`binary_sensor.salon_presence`).
 */
export type RoomRole =
  | 'lampes'
  | 'leds'
  | 'interrupteurs'
  | 'puissance'
  | 'eclairement'
  | 'presence'
  | 'fenetres'
  | 'portes'
  | 'temperature'
  | 'humidite'
  | 'pression'
  | 'co2';

/** What a role feeds: the lights (count, power button, halo), the power, or a badge only. */
export type RoleFeed = 'light' | 'power' | 'badge';

export interface RoleSpec {
  role: RoomRole;
  /** French and English names accepted after the room (and in `exclude`). */
  aliases: readonly string[];
  /** Domains the entity may have, preferred first. */
  domains: readonly string[];
  feeds: RoleFeed;
  /** Badge tag shown for it; none for the power (it is in the subtitle). */
  badge?: string;
}

/** Every role, in the order of the badges. Battery is not a room role. */
export const ROOM_ROLES: readonly RoleSpec[] = [
  {
    role: 'lampes',
    aliases: ['lampes', 'lamps', 'lampe', 'lamp'],
    domains: ['switch', 'light', 'group'],
    feeds: 'light',
    badge: 'vivid-lamp-badge',
  },
  {
    role: 'leds',
    aliases: ['leds', 'led'],
    domains: ['light', 'group'],
    feeds: 'light',
    badge: 'vivid-led-badge',
  },
  {
    role: 'interrupteurs',
    aliases: ['interrupteurs', 'switches', 'interrupteur', 'switch'],
    domains: ['switch', 'light', 'group'],
    feeds: 'light',
    badge: 'vivid-light-badge',
  },
  { role: 'puissance', aliases: ['puissance', 'power'], domains: ['sensor'], feeds: 'power' },
  {
    role: 'eclairement',
    aliases: ['eclairement', 'illuminance', 'luminosite', 'lux'],
    domains: ['sensor'],
    feeds: 'badge',
    badge: 'vivid-illuminance-badge',
  },
  {
    role: 'presence',
    aliases: ['presence', 'occupancy', 'mouvement', 'motion'],
    domains: ['binary_sensor'],
    feeds: 'badge',
    badge: 'vivid-presence-badge',
  },
  {
    role: 'fenetres',
    aliases: ['fenetres', 'windows', 'fenetre', 'window'],
    domains: ['binary_sensor'],
    feeds: 'badge',
    badge: 'vivid-window-badge',
  },
  {
    role: 'portes',
    aliases: ['portes', 'doors', 'porte', 'door'],
    domains: ['binary_sensor'],
    feeds: 'badge',
    badge: 'vivid-door-badge',
  },
  {
    role: 'temperature',
    aliases: ['temperature'],
    domains: ['sensor'],
    feeds: 'badge',
    badge: 'vivid-temperature-badge',
  },
  {
    role: 'humidite',
    aliases: ['humidite', 'humidity'],
    domains: ['sensor'],
    feeds: 'badge',
    badge: 'vivid-humidity-badge',
  },
  {
    role: 'pression',
    aliases: ['pression', 'pressure'],
    domains: ['sensor'],
    feeds: 'badge',
    badge: 'vivid-pressure-badge',
  },
  {
    role: 'co2',
    aliases: ['co2', 'air'],
    domains: ['sensor'],
    feeds: 'badge',
    badge: 'vivid-air-quality-badge',
  },
];

const BY_ROLE = new Map(ROOM_ROLES.map((spec) => [spec.role, spec]));

export function roleSpec(role: RoomRole): RoleSpec {
  return BY_ROLE.get(role)!;
}

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

const ALIAS_INDEX = new Map<string, RoomRole>();
for (const spec of ROOM_ROLES) {
  for (const alias of spec.aliases) ALIAS_INDEX.set(nameKey(alias), spec.role);
}

/** The role an alias names ("lamps", "présence"), or `undefined`. */
export function roleOf(alias: string): RoomRole | undefined {
  return ALIAS_INDEX.get(nameKey(alias));
}

/** One role found for a room. */
export interface FoundRole {
  role: RoomRole;
  entity: string;
  /** Found by its entity id, or by its name (`<room>-<role>`). */
  via: 'id' | 'name';
}

/**
 * Finds the entity of each role for `room`, by entity id
 * (`<domain>.<room>_<role>`) or by name (friendly or registry name
 * `<room>-<role>`), accents, case and separators ignored. When several
 * entities fit a role, a match by id wins over one by name, then the
 * preferred domain, then the entity id order. Results follow the role table.
 */
export function findRoles(hass: HomeAssistant, room: string): FoundRole[] {
  const roomKey = nameKey(room);
  if (!roomKey) return [];
  const prefix = `${roomKey}_`;
  const best = new Map<RoomRole, { found: FoundRole; rank: [number, number, string] }>();
  const consider = (entity: string, key: string, via: 'id' | 'name'): void => {
    if (!key.startsWith(prefix)) return;
    const role = ALIAS_INDEX.get(key.slice(prefix.length));
    if (!role) return;
    const domainRank = roleSpec(role).domains.indexOf(domainOf(entity));
    if (domainRank === -1) return;
    const rank: [number, number, string] = [via === 'id' ? 0 : 1, domainRank, entity];
    const current = best.get(role);
    if (!current || compareRank(rank, current.rank) < 0) {
      best.set(role, { found: { role, entity, via }, rank });
    }
  };
  for (const [entity, state] of Object.entries(hass.states)) {
    consider(entity, nameKey(objectIdOf(entity)), 'id');
    const friendly = state.attributes.friendly_name;
    if (typeof friendly === 'string') consider(entity, cachedKey(friendly), 'name');
    const registry = hass.entities?.[entity]?.name;
    if (typeof registry === 'string') consider(entity, cachedKey(registry), 'name');
  }
  return ROOM_ROLES.flatMap((spec) => {
    const found = best.get(spec.role);
    return found ? [found.found] : [];
  });
}

function compareRank(a: [number, number, string], b: [number, number, string]): number {
  return a[0] - b[0] || a[1] - b[1] || a[2].localeCompare(b[2]);
}

/** Names are normalized on every update: remember the last ones. */
const keyCache = new Map<string, string>();

function cachedKey(name: string): string {
  let key = keyCache.get(name);
  if (key === undefined) {
    if (keyCache.size > 5000) keyCache.clear();
    key = nameKey(name);
    keyCache.set(name, key);
  }
  return key;
}
