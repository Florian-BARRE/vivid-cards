import { domainOf } from '../../core/entities';
import { GLOW_LEVELS, GLOW_MAX, glowPercent, type GlowSetting } from '../../core/glow';
import type { LovelaceCardConfig } from '../../core/hass-types';
import { ROOM_ROLES, nameKey, roleOf, type RoomRole } from './roles';

export const ROOM_HEADER_CARD = 'vivid-room-header';

/** Lights, plugs or wall switches driving lights, and groups of them. */
export const ROOM_LIGHT_DOMAINS = ['light', 'switch', 'group', 'input_boolean'];

/** A Vivid badge shown under the title, e.g. `{ type: custom:vivid-door-badge, entity: … }`. */
export interface RoomBadgeConfig {
  type: string;
  [key: string]: unknown;
}

export interface RoomHeaderCardConfig extends LovelaceCardConfig {
  /** Room of the naming convention (`salon` finds `light.salon_leds`, "salon-présence", …). */
  room?: string;
  /** Finds the room's entities from their names (default: on when `room` is set). */
  discover?: boolean;
  /** Discovered roles (`presence`, `windows`…) or entity ids to leave out. */
  exclude?: string[];
  /** Title; the room id, capitalized, when unset. */
  name?: string;
  /** Lights and switches of the room, instead of the discovered groups. */
  lights?: string[];
  /** Power sensor of the room, instead of `sensor.<room>_puissance`. */
  power?: string;
  /** Entity whose more-info a hold on the power button opens; the first light when unset. */
  entity?: string;
  /**
   * Vivid badges added after the discovered ones; one on a discovered entity
   * replaces its discovered badge (to change its options).
   */
  badges?: RoomBadgeConfig[];
  /** "4 on · 138 W" under the title. */
  show_subtitle?: boolean;
  /** Badges row (discovered or listed). */
  show_badges?: boolean;
  /** Halo strength in percent (100 = default), or off / soft / normal / strong. */
  glow?: GlowSetting;
}

export interface ResolvedRoomHeaderConfig {
  type: string;
  /** Room key: lower case, no accents, `_` between words (`salle_de_bain`). */
  room?: string;
  /** The room as written, for the title. */
  roomLabel?: string;
  discover: boolean;
  /** Roles left out. */
  excludeRoles: RoomRole[];
  /** Entity ids left out. */
  excludeEntities: string[];
  name?: string;
  lights?: string[];
  power?: string;
  entity?: string;
  badges?: RoomBadgeConfig[];
  showSubtitle: boolean;
  showBadges: boolean;
  /** Percent. */
  glow: number;
}

function fail(message: string): never {
  throw new Error(`${ROOM_HEADER_CARD}: ${message}`);
}

function text(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') fail(`"${field}" must be text.`);
  return value.trim() || undefined;
}

function bool(value: unknown, field: string, fallback: boolean): boolean {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'boolean') fail(`"${field}" must be true or false.`);
  return value;
}

function entityList(value: unknown, field: string): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    fail(`"${field}" must be a list of entity ids.`);
  }
  return (value as string[]).map((item) => item.trim()).filter(Boolean);
}

function badgeList(value: unknown): RoomBadgeConfig[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) fail('"badges" must be a list of badge configurations.');
  return value.map((item, index) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      fail(`badges[${index}] must be a badge configuration.`);
    }
    const type = (item as { type?: unknown }).type;
    if (typeof type !== 'string' || !/^custom:vivid-[a-z0-9-]+$/.test(type.trim())) {
      fail(`badges[${index}] needs a "type" such as custom:vivid-lamp-badge.`);
    }
    return { ...(item as RoomBadgeConfig), type: type.trim() };
  });
}

/** `exclude`: role names (French or English) and entity ids. */
function exclusions(value: unknown): { roles: RoomRole[]; entities: string[] } {
  const roles: RoomRole[] = [];
  const entities: string[] = [];
  if (value === undefined || value === null) return { roles, entities };
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    fail('"exclude" must be a list of roles (presence, windows…) or entity ids.');
  }
  for (const raw of value as string[]) {
    const item = raw.trim();
    if (!item) continue;
    if (item.includes('.')) {
      entities.push(item);
      continue;
    }
    const role = roleOf(item);
    if (!role) {
      fail(
        `"exclude" has an unknown role "${item}". Roles: ${ROOM_ROLES.map((spec) => spec.role).join(', ')} (or their English names), or an entity id.`,
      );
    }
    if (!roles.includes(role)) roles.push(role);
  }
  return { roles, entities };
}

export function resolveRoomHeaderConfig(raw: unknown): ResolvedRoomHeaderConfig {
  if (typeof raw !== 'object' || raw === null) fail('invalid configuration.');
  const config = raw as RoomHeaderCardConfig;
  const roomLabel = text(config.room, 'room');
  const room = roomLabel === undefined ? undefined : nameKey(roomLabel);
  if (roomLabel !== undefined && !room) fail('"room" must be a room name such as salon.');
  const discover = bool(config.discover, 'discover', room !== undefined);
  if (discover && !room) fail('"discover" needs a "room".');
  const { roles: excludeRoles, entities: excludeEntities } = exclusions(config.exclude);
  const name = text(config.name, 'name');
  const lights = entityList(config.lights, 'lights');
  for (const id of lights ?? []) {
    if (!ROOM_LIGHT_DOMAINS.includes(domainOf(id))) {
      fail(`"${id}" must be a light, a switch or a group of them.`);
    }
  }
  const power = text(config.power, 'power');
  if (power && domainOf(power) !== 'sensor') fail('"power" must be a sensor.');
  if (!room && !name && !lights?.length && !config.badges) {
    fail('set "room" (e.g. salon), or a "name" and its "lights".');
  }
  const glow = config.glow === undefined ? 100 : glowPercent(config.glow);
  if (glow === undefined) {
    fail(`"glow" must be a percentage from 0 to ${GLOW_MAX}, or ${GLOW_LEVELS.join(', ')}.`);
  }
  return {
    type: String(config.type ?? ''),
    room,
    roomLabel,
    discover,
    excludeRoles,
    excludeEntities,
    name,
    lights: lights?.length ? lights : undefined,
    power,
    entity: text(config.entity, 'entity'),
    badges: badgeList(config.badges),
    showSubtitle: bool(config.show_subtitle, 'show_subtitle', true),
    showBadges: bool(config.show_badges, 'show_badges', true),
    glow,
  };
}
