import { domainOf } from '../../core/entities';
import { GLOW_LEVELS, GLOW_MAX, glowPercent, type GlowSetting } from '../../core/glow';
import type { LovelaceCardConfig } from '../../core/hass-types';

export const ROOM_HEADER_CARD = 'vivid-room-header';

/** Lights, plugs or wall switches driving lights, and groups of them. */
export const ROOM_LIGHT_DOMAINS = ['light', 'switch', 'group', 'input_boolean'];

/** A Vivid badge shown under the title, e.g. `{ type: custom:vivid-door-badge, entity: … }`. */
export interface RoomBadgeConfig {
  type: string;
  [key: string]: unknown;
}

export interface RoomHeaderCardConfig extends LovelaceCardConfig {
  /** Room id of the naming convention (`salon` finds `light.salon_leds`, …). */
  room?: string;
  /** Title; the room id, capitalized, when unset. */
  name?: string;
  /** Lights and switches of the room, instead of the discovered groups. */
  lights?: string[];
  /** Power sensor of the room, instead of `sensor.<room>_puissance`. */
  power?: string;
  /** Entity whose more-info a hold on the power button opens; the first light when unset. */
  entity?: string;
  /** Vivid badges under the title, instead of the discovered ones. */
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
  room?: string;
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

export function resolveRoomHeaderConfig(raw: unknown): ResolvedRoomHeaderConfig {
  if (typeof raw !== 'object' || raw === null) fail('invalid configuration.');
  const config = raw as RoomHeaderCardConfig;
  const room = text(config.room, 'room')?.toLowerCase();
  if (room !== undefined && !/^[a-z0-9_]+$/.test(room)) {
    fail('"room" must be a room id such as salon (letters, digits and _).');
  }
  const name = text(config.name, 'name');
  const lights = entityList(config.lights, 'lights');
  for (const id of lights ?? []) {
    if (!ROOM_LIGHT_DOMAINS.includes(domainOf(id))) {
      fail(`"${id}" must be a light, a switch or a group of them.`);
    }
  }
  const power = text(config.power, 'power');
  if (power && domainOf(power) !== 'sensor') fail('"power" must be a sensor.');
  if (!room && !name && !lights?.length) {
    fail('set "room" (e.g. salon), or a "name" and its "lights".');
  }
  const glow = config.glow === undefined ? 100 : glowPercent(config.glow);
  if (glow === undefined) {
    fail(`"glow" must be a percentage from 0 to ${GLOW_MAX}, or ${GLOW_LEVELS.join(', ')}.`);
  }
  return {
    type: String(config.type ?? ''),
    room,
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
