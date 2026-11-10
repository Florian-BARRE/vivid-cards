/* ====== Code Summary ======
 * Config of the room header and its validation. One slot per role under
 * `entities` (auto when absent, `{ exclude, add }`, a list, or false), the
 * discovery settings (room, name pattern, area, order of the sources), the
 * power button (its two actions, its hold, when it shows), the badges list
 * (badges of the roles, free badges, "the rest"). The options of 0.14–0.17
 * (`exclude`, `lights`, `power`, badges without `slot`) are read into this.
 */

import { normalizeAction, type ActionConfig } from '../../core/action-handler';
import { domainOf } from '../../core/entities';
import { GLOW_LEVELS, GLOW_MAX, glowPercent, type GlowSetting } from '../../core/glow';
import type { LovelaceCardConfig } from '../../core/hass-types';
import {
  DEFAULT_PATTERN,
  isValidPattern,
  nameKey,
  parseSlot,
  type ParsedSlot,
  type SlotValue,
} from '../../core/slots';
import { ROOM_ROLES, isRoomRole, roleOf, type RoomRole } from './roles';
import { lightRoleOf } from './light-roles';

export const ROOM_HEADER_CARD = 'vivid-room-header';

/** Lights, plugs or wall switches driving lights, and groups of them. */
export const ROOM_LIGHT_DOMAINS = ['light', 'switch', 'group', 'input_boolean'];

/** Order in which the discovery looks. */
export const DISCOVER_ORDERS = ['naming_area', 'area_naming', 'naming', 'area'] as const;
export type DiscoverOrder = (typeof DISCOVER_ORDERS)[number];

export const POWER_SHOW = ['auto', 'always', 'never'] as const;
export type PowerShow = (typeof POWER_SHOW)[number];

/** A simple visibility condition, as Home Assistant writes it. */
export interface StateCondition {
  condition: 'state';
  entity: string;
  state?: string | string[];
  state_not?: string | string[];
}

/** A badge of the row: the badge of a role, "the rest" (`*`), or a free badge. */
export interface RoomBadgeConfig {
  /** A role (`presence`), or `*` for every found badge not listed. */
  slot?: string;
  /** Badge element (`custom:vivid-door-badge`) of a free badge, or to change a role's. */
  type?: string;
  entity?: string;
  visibility?: StateCondition[];
  [key: string]: unknown;
}

export interface PowerButtonConfig {
  on_action?: unknown;
  off_action?: unknown;
  hold_action?: unknown;
  show?: PowerShow;
}

export interface RoomHeaderCardConfig extends LovelaceCardConfig {
  room?: string;
  name?: string;
  /** Finds the room's entities (default: on when `room` is set). */
  discover?: boolean;
  /** Name pattern (`{room}-{role}`). */
  naming?: { pattern?: string };
  /** Home Assistant area (default: the area named like the room). */
  area?: string;
  discover_by?: DiscoverOrder;
  /** One slot per role. */
  entities?: Partial<Record<RoomRole, SlotValue>>;
  /** Entity of the main group (more-info of a hold); the first light when unset. */
  entity?: string;
  power_button?: PowerButtonConfig;
  badges?: RoomBadgeConfig[];
  show_subtitle?: boolean;
  show_badges?: boolean;
  glow?: GlowSetting;
  /** 0.14–0.17: roles or entity ids left out. */
  exclude?: string[];
  /** 0.14–0.17: the lights instead of the found ones. */
  lights?: string[];
  /** 0.14–0.17: the power sensor. */
  power?: string;
}

export interface ResolvedRoomHeaderConfig {
  type: string;
  /** Room key: lower case, no accents, `_` between words (`salle_de_bain`). */
  room?: string;
  /** The room as written, for the title and the pattern. */
  roomLabel?: string;
  discover: boolean;
  pattern: string;
  area?: string;
  discoverBy: DiscoverOrder;
  slots: Record<RoomRole, ParsedSlot>;
  /** Entities left out of every slot (0.14–0.17 `exclude`). */
  excludeEntities: string[];
  name?: string;
  entity?: string;
  onAction?: ActionConfig;
  offAction?: ActionConfig;
  holdAction?: ActionConfig;
  powerShow: PowerShow;
  badges: RoomBadgeConfig[];
  showSubtitle: boolean;
  showBadges: boolean;
  /** Percent. */
  glow: number;
}

/* ============================== Readers ============================== */

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

function choice<T extends string>(
  value: unknown,
  field: string,
  values: readonly T[],
  fallback: T,
): T {
  if (value === undefined || value === null || value === '') return fallback;
  if (!values.includes(value as T)) fail(`"${field}" must be one of: ${values.join(', ')}.`);
  return value as T;
}

function action(value: unknown, field: string): ActionConfig | undefined {
  try {
    return normalizeAction(value, field);
  } catch (error) {
    fail((error as Error).message);
  }
}

function conditions(value: unknown, field: string): StateCondition[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) fail(`"${field}" must be a list of conditions.`);
  return value.map((item, index) => {
    const condition = item as StateCondition;
    if (condition?.condition !== 'state' || typeof condition.entity !== 'string') {
      fail(`"${field}[${index}]" must be { condition: state, entity, state or state_not }.`);
    }
    return condition;
  });
}

function badgeList(value: unknown): RoomBadgeConfig[] {
  if (value === undefined || value === null) return [{ slot: '*' }];
  if (!Array.isArray(value)) fail('"badges" must be a list.');
  const items = value.map((item, index) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      fail(`badges[${index}] must be a badge.`);
    }
    const badge = item as RoomBadgeConfig;
    if (badge.slot !== undefined) {
      if (badge.slot !== '*' && !roleOf(String(badge.slot)))
        fail(`badges[${index}] has an unknown slot "${String(badge.slot)}".`);
    } else if (
      typeof badge.type !== 'string' ||
      !/^custom:vivid-[a-z0-9-]+$/.test(badge.type.trim())
    ) {
      fail(`badges[${index}] needs a "slot" (a role) or a "type" such as custom:vivid-lamp-badge.`);
    }
    const slot =
      badge.slot === undefined || badge.slot === '*' ? badge.slot : roleOf(String(badge.slot));
    const visibility = conditions(badge.visibility, `badges[${index}].visibility`);
    const next: RoomBadgeConfig = { ...badge };
    if (slot) next.slot = slot;
    if (typeof badge.type === 'string') next.type = badge.type.trim();
    if (visibility) next.visibility = visibility;
    return next;
  });
  // 0.14–0.17: listed badges came after the found ones.
  return items.some((item) => item.slot !== undefined) ? items : [{ slot: '*' }, ...items];
}

/* ============================== Slots ============================== */

/** 0.14–0.17 `exclude`: roles become off slots, entity ids are left out everywhere. */
function legacyExclusions(value: unknown): { roles: RoomRole[]; entities: string[] } {
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

function readSlots(config: RoomHeaderCardConfig): {
  slots: Record<RoomRole, ParsedSlot>;
  excludeEntities: string[];
} {
  const raw = config.entities ?? {};
  if (typeof raw !== 'object' || Array.isArray(raw)) fail('"entities" must map roles to entities.');
  for (const key of Object.keys(raw)) {
    if (!isRoomRole(key)) fail(`"entities" has an unknown role "${key}".`);
  }
  const legacy = legacyExclusions(config.exclude);
  const slots = {} as Record<RoomRole, ParsedSlot>;
  for (const spec of ROOM_ROLES) {
    const slot = parseSlot(raw[spec.role], `entities.${spec.role}`);
    slots[spec.role] =
      legacy.roles.includes(spec.role) && raw[spec.role] === undefined
        ? { ...slot, mode: 'off' }
        : slot;
  }
  // 0.14–0.17 `lights`: each light in the slot its name or domain points to.
  if (Array.isArray(config.lights) && config.lights.length) {
    const lists: Partial<Record<RoomRole, string[]>> = {};
    for (const id of config.lights) {
      if (typeof id !== 'string' || !ROOM_LIGHT_DOMAINS.includes(domainOf(id.trim()))) {
        fail(`"${String(id)}" must be a light, a switch or a group of them.`);
      }
      const role = lightRoleOf(id.trim());
      (lists[role] ??= []).push(id.trim());
    }
    for (const role of ['lampes', 'leds', 'interrupteurs'] as const) {
      slots[role] = lists[role]
        ? { mode: 'manual', manual: lists[role]!, exclude: [], add: [] }
        : { mode: 'off', manual: [], exclude: [], add: [] };
    }
  }
  const power = text(config.power, 'power');
  if (power) {
    if (domainOf(power) !== 'sensor') fail('"power" must be a sensor.');
    slots.puissance = { mode: 'manual', manual: [power], exclude: [], add: [] };
  }
  return { slots, excludeEntities: legacy.entities };
}

/* ============================== Resolve ============================== */

export function resolveRoomHeaderConfig(raw: unknown): ResolvedRoomHeaderConfig {
  if (typeof raw !== 'object' || raw === null) fail('invalid configuration.');
  const config = raw as RoomHeaderCardConfig;
  const roomLabel = text(config.room, 'room');
  const room = roomLabel === undefined ? undefined : nameKey(roomLabel);
  if (roomLabel !== undefined && !room) fail('"room" must be a room name such as salon.');
  const area = text(config.area, 'area');
  const discover = bool(config.discover, 'discover', room !== undefined || area !== undefined);
  if (discover && !room && !area) fail('"discover" needs a "room" or an "area".');
  const pattern = text(config.naming?.pattern, 'naming.pattern') ?? DEFAULT_PATTERN;
  if (!isValidPattern(pattern, true))
    fail('"naming.pattern" must hold {room} and {role}, e.g. "{room}-{role}".');
  const { slots, excludeEntities } = readSlots(config);
  const name = text(config.name, 'name');
  const button = config.power_button ?? {};
  if (typeof button !== 'object') fail('"power_button" must be a set of options.');
  if (!room && !area && !name && !Object.values(slots).some((slot) => slot.mode === 'manual')) {
    fail('set "room" (e.g. salon), or a "name" and its entities.');
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
    pattern,
    area,
    discoverBy: choice(config.discover_by, 'discover_by', DISCOVER_ORDERS, 'naming_area'),
    slots,
    excludeEntities,
    name,
    entity: text(config.entity, 'entity'),
    onAction: action(button.on_action, 'power_button.on_action'),
    offAction: action(button.off_action, 'power_button.off_action'),
    holdAction: action(button.hold_action, 'power_button.hold_action'),
    powerShow: choice(button.show, 'power_button.show', POWER_SHOW, 'auto'),
    badges: badgeList(config.badges),
    showSubtitle: bool(config.show_subtitle, 'show_subtitle', true),
    showBadges: bool(config.show_badges, 'show_badges', true),
    glow,
  };
}
