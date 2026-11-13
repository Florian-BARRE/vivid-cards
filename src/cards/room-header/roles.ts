/* ====== Code Summary ======
 * The slots of a room header, one per role: its lights, its power, each
 * badge sensor. Each role names what Vivid Pilot generates for it in the
 * room (the node's category and the kind of entity), the domains a hand-
 * picked entity may have, what it feeds, and its badge. The role keys are the
 * Vivid Pilot categories, so `entities.presence` is the room's presence.
 */

import { nodeKey, type PilotCategory, type PilotKind } from '../../core/pilot';
import type { RoleQuery } from '../../core/slots';

/* ============================== Types ============================== */

export type RoomRole =
  | 'light'
  | 'led'
  | 'switch'
  | 'power'
  | 'illuminance'
  | 'presence'
  | 'window'
  | 'door'
  | 'temperature'
  | 'humidity'
  | 'pressure'
  | 'co2'
  | 'battery';

/** What a role feeds: the lights, the power, or a badge. */
export type RoleFeed = 'light' | 'power' | 'badge';

export interface RoleSpec extends RoleQuery {
  role: RoomRole;
  /** Vivid Pilot node category (none: the room node itself). */
  category?: PilotCategory;
  /** Kind of the generated entity the role uses. */
  kind: PilotKind;
  feeds: RoleFeed;
  /** A list of entities (lights) or one. */
  multiple: boolean;
  /** Badge tag shown for it (lights: one per entity). */
  badge?: string;
  /** Icon of the slot in the editor. */
  icon: string;
}

/* ============================== Table ============================== */

const LIGHT_DOMAINS = ['light', 'switch', 'group', 'input_boolean'];

function light(role: 'light' | 'led' | 'switch', badge: string, icon: string): RoleSpec {
  return {
    role,
    category: role,
    kind: 'group',
    domains: LIGHT_DOMAINS,
    feeds: 'light',
    multiple: true,
    badge,
    icon,
  };
}

function sensor(
  role: RoomRole,
  category: PilotCategory,
  kind: PilotKind,
  domain: string,
  badge: string,
  icon: string,
): RoleSpec {
  return { role, category, kind, domains: [domain], feeds: 'badge', multiple: false, badge, icon };
}

/** Every role, in the order of the badges. */
export const ROOM_ROLES: readonly RoleSpec[] = [
  light('light', 'vivid-lamp-badge', 'mdi:lamp'),
  light('led', 'vivid-led-badge', 'mdi:led-strip-variant'),
  light('switch', 'vivid-light-badge', 'mdi:light-switch'),
  {
    role: 'power',
    kind: 'power',
    domains: ['sensor'],
    feeds: 'power',
    multiple: false,
    icon: 'mdi:flash',
  },
  sensor(
    'illuminance',
    'illuminance',
    'mean',
    'sensor',
    'vivid-illuminance-badge',
    'mdi:brightness-5',
  ),
  sensor(
    'presence',
    'presence',
    'any',
    'binary_sensor',
    'vivid-presence-badge',
    'mdi:motion-sensor',
  ),
  sensor(
    'window',
    'window',
    'any',
    'binary_sensor',
    'vivid-window-badge',
    'mdi:window-closed-variant',
  ),
  sensor('door', 'door', 'any', 'binary_sensor', 'vivid-door-badge', 'mdi:door'),
  sensor(
    'temperature',
    'temperature',
    'mean',
    'sensor',
    'vivid-temperature-badge',
    'mdi:thermometer',
  ),
  sensor('humidity', 'humidity', 'mean', 'sensor', 'vivid-humidity-badge', 'mdi:water-percent'),
  sensor('pressure', 'pressure', 'mean', 'sensor', 'vivid-pressure-badge', 'mdi:gauge'),
  sensor('co2', 'co2', 'mean', 'sensor', 'vivid-air-quality-badge', 'mdi:molecule-co2'),
  sensor('battery', 'battery', 'battery', 'sensor', 'vivid-battery-badge', 'mdi:battery'),
];

const BY_ROLE = new Map(ROOM_ROLES.map((spec) => [spec.role, spec]));

export function roleSpec(role: RoomRole): RoleSpec {
  return BY_ROLE.get(role)!;
}

export function isRoomRole(value: string): value is RoomRole {
  return BY_ROLE.has(value as RoomRole);
}

/** The Vivid Pilot node a role reads in a room (`salon__light`, or `salon` for the power). */
export function roleNode(room: string, spec: RoleSpec): string {
  return nodeKey(room, spec.category);
}
