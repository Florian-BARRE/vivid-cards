/* ====== Code Summary ======
 * The slots of a room header, one per role: its lights, its power sensor,
 * each badge sensor and the room's scripts. Each role has its names (French
 * and English, for the name pattern), the domains and device classes it
 * accepts (for the area), what it feeds, and its badge.
 */

import { nameKey, type RoleQuery } from '../../core/slots';

export { nameKey };

/* ============================== Types ============================== */

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
  | 'co2'
  | 'scripts_on'
  | 'scripts_off'
  | 'scripts_toggle';

/** What a role feeds: the lights, the power, the power button's scripts, or a badge. */
export type RoleFeed = 'light' | 'power' | 'action' | 'badge';

export interface RoleSpec extends RoleQuery {
  role: RoomRole;
  feeds: RoleFeed;
  /** A list of entities (lights) or one. */
  multiple: boolean;
  /** Found in the room's area too (off where an area holds many unrelated ones). */
  inArea: boolean;
  /** Badge tag shown for it (lights: one per entity). */
  badge?: string;
  /** Icon of the slot in the editor. */
  icon: string;
}

/* ============================== Table ============================== */

const LIGHT_DOMAINS = ['switch', 'light', 'group', 'input_boolean'];

/** Every role, in the order of the badges (scripts last). Battery is not a room role. */
export const ROOM_ROLES: readonly RoleSpec[] = [
  {
    role: 'lampes',
    aliases: ['lampes', 'lamps', 'lampe', 'lamp'],
    domains: LIGHT_DOMAINS,
    deviceClasses: ['outlet'],
    feeds: 'light',
    multiple: true,
    inArea: true,
    badge: 'vivid-lamp-badge',
    icon: 'mdi:lamp',
  },
  {
    role: 'leds',
    aliases: ['leds', 'led'],
    domains: ['light', 'group'],
    feeds: 'light',
    multiple: true,
    inArea: true,
    badge: 'vivid-led-badge',
    icon: 'mdi:led-strip-variant',
  },
  {
    role: 'interrupteurs',
    aliases: ['interrupteurs', 'switches', 'interrupteur', 'switch'],
    domains: LIGHT_DOMAINS,
    feeds: 'light',
    multiple: true,
    inArea: false,
    badge: 'vivid-light-badge',
    icon: 'mdi:light-switch',
  },
  {
    role: 'puissance',
    aliases: ['puissance', 'power'],
    domains: ['sensor'],
    feeds: 'power',
    multiple: false,
    inArea: false,
    icon: 'mdi:flash',
  },
  {
    role: 'eclairement',
    aliases: ['eclairement', 'illuminance', 'luminosite', 'lux'],
    domains: ['sensor'],
    deviceClasses: ['illuminance'],
    feeds: 'badge',
    multiple: false,
    inArea: true,
    badge: 'vivid-illuminance-badge',
    icon: 'mdi:brightness-5',
  },
  {
    role: 'presence',
    aliases: ['presence', 'occupancy', 'mouvement', 'motion'],
    domains: ['binary_sensor'],
    deviceClasses: ['occupancy', 'motion', 'presence'],
    feeds: 'badge',
    multiple: false,
    inArea: true,
    badge: 'vivid-presence-badge',
    icon: 'mdi:motion-sensor',
  },
  {
    role: 'fenetres',
    aliases: ['fenetres', 'windows', 'fenetre', 'window'],
    domains: ['binary_sensor'],
    deviceClasses: ['window'],
    feeds: 'badge',
    multiple: false,
    inArea: true,
    badge: 'vivid-window-badge',
    icon: 'mdi:window-closed-variant',
  },
  {
    role: 'portes',
    aliases: ['portes', 'doors', 'porte', 'door'],
    domains: ['binary_sensor'],
    deviceClasses: ['door', 'garage_door'],
    feeds: 'badge',
    multiple: false,
    inArea: true,
    badge: 'vivid-door-badge',
    icon: 'mdi:door',
  },
  {
    role: 'temperature',
    aliases: ['temperature'],
    domains: ['sensor'],
    deviceClasses: ['temperature'],
    feeds: 'badge',
    multiple: false,
    inArea: true,
    badge: 'vivid-temperature-badge',
    icon: 'mdi:thermometer',
  },
  {
    role: 'humidite',
    aliases: ['humidite', 'humidity'],
    domains: ['sensor'],
    deviceClasses: ['humidity'],
    feeds: 'badge',
    multiple: false,
    inArea: true,
    badge: 'vivid-humidity-badge',
    icon: 'mdi:water-percent',
  },
  {
    role: 'pression',
    aliases: ['pression', 'pressure'],
    domains: ['sensor'],
    deviceClasses: ['atmospheric_pressure', 'pressure'],
    feeds: 'badge',
    multiple: false,
    inArea: true,
    badge: 'vivid-pressure-badge',
    icon: 'mdi:gauge',
  },
  {
    role: 'co2',
    aliases: ['co2', 'air'],
    domains: ['sensor'],
    deviceClasses: ['carbon_dioxide'],
    feeds: 'badge',
    multiple: false,
    inArea: true,
    badge: 'vivid-air-quality-badge',
    icon: 'mdi:molecule-co2',
  },
  // The room's scripts ("salon-scripts-on"): the power button runs them
  // instead of switching the lights itself, so they can restore a scene.
  {
    role: 'scripts_on',
    aliases: ['scripts_on', 'script_on'],
    domains: ['script'],
    feeds: 'action',
    multiple: false,
    inArea: false,
    icon: 'mdi:script-text-play-outline',
  },
  {
    role: 'scripts_off',
    aliases: ['scripts_off', 'script_off'],
    domains: ['script'],
    feeds: 'action',
    multiple: false,
    inArea: false,
    icon: 'mdi:script-text-outline',
  },
  {
    role: 'scripts_toggle',
    aliases: ['scripts_toggle', 'script_toggle'],
    domains: ['script'],
    feeds: 'action',
    multiple: false,
    inArea: false,
    icon: 'mdi:script-outline',
  },
];

const BY_ROLE = new Map(ROOM_ROLES.map((spec) => [spec.role, spec]));

export function roleSpec(role: RoomRole): RoleSpec {
  return BY_ROLE.get(role)!;
}

export function isRoomRole(value: string): value is RoomRole {
  return BY_ROLE.has(value as RoomRole);
}

const ALIAS_INDEX = new Map<string, RoomRole>();
for (const spec of ROOM_ROLES) {
  ALIAS_INDEX.set(spec.role, spec.role);
  for (const alias of spec.aliases) ALIAS_INDEX.set(nameKey(alias), spec.role);
}

/** The role an alias names ("lamps", "présence"), or `undefined`. */
export function roleOf(alias: string): RoomRole | undefined {
  return ALIAS_INDEX.get(nameKey(alias));
}
