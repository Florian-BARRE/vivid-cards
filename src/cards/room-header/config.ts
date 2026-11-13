/* ====== Code Summary ======
 * Config of the room header and its validation: the Vivid Pilot room
 * (`pilot`, an area id), one slot per role under `entities` (Pilot when
 * absent, `{ exclude, add }`, a list, or false), the power button (its two
 * actions, its hold, when it shows), the badges list (badges of the roles,
 * free badges, "the rest").
 */

import { normalizeAction, type ActionConfig } from '../../core/action-handler';
import { GLOW_LEVELS, GLOW_MAX, glowPercent, type GlowSetting } from '../../core/glow';
import type { LovelaceCardConfig } from '../../core/hass-types';
import { parseSlot, type ParsedSlot, type SlotValue } from '../../core/slots';
import { ROOM_ROLES, isRoomRole, type RoomRole } from './roles';

export const ROOM_HEADER_CARD = 'vivid-room-header';

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
  /** The Vivid Pilot room: its area id (`salon`). */
  pilot?: string;
  name?: string;
  /** One slot per role. */
  entities?: Partial<Record<RoomRole, SlotValue>>;
  /** Entity of the main group (more-info of a hold); the first light when unset. */
  entity?: string;
  power_button?: PowerButtonConfig;
  badges?: RoomBadgeConfig[];
  show_subtitle?: boolean;
  show_badges?: boolean;
  glow?: GlowSetting;
}

export interface ResolvedRoomHeaderConfig {
  type: string;
  /** The Vivid Pilot room (area id). */
  pilot?: string;
  slots: Record<RoomRole, ParsedSlot>;
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
  return value.map((item, index) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      fail(`badges[${index}] must be a badge.`);
    }
    const badge = item as RoomBadgeConfig;
    if (badge.slot !== undefined) {
      if (badge.slot !== '*' && !isRoomRole(String(badge.slot)))
        fail(`badges[${index}] has an unknown slot "${String(badge.slot)}".`);
    } else if (
      typeof badge.type !== 'string' ||
      !/^custom:vivid-[a-z0-9-]+$/.test(badge.type.trim())
    ) {
      fail(`badges[${index}] needs a "slot" (a role) or a "type" such as custom:vivid-lamp-badge.`);
    }
    const slot = badge.slot === undefined ? undefined : String(badge.slot);
    const visibility = conditions(badge.visibility, `badges[${index}].visibility`);
    const next: RoomBadgeConfig = { ...badge };
    if (slot) next.slot = slot;
    if (typeof badge.type === 'string') next.type = badge.type.trim();
    if (visibility) next.visibility = visibility;
    return next;
  });
}

/* ============================== Slots ============================== */

function readSlots(config: RoomHeaderCardConfig): Record<RoomRole, ParsedSlot> {
  const raw = config.entities ?? {};
  if (typeof raw !== 'object' || Array.isArray(raw)) fail('"entities" must map roles to entities.');
  for (const key of Object.keys(raw)) {
    if (!isRoomRole(key)) {
      fail(
        `"entities" has an unknown role "${key}". Roles: ${ROOM_ROLES.map((spec) => spec.role).join(', ')}.`,
      );
    }
  }
  const slots = {} as Record<RoomRole, ParsedSlot>;
  for (const spec of ROOM_ROLES)
    slots[spec.role] = parseSlot(raw[spec.role], `entities.${spec.role}`);
  return slots;
}

/* ============================== Resolve ============================== */

export function resolveRoomHeaderConfig(raw: unknown): ResolvedRoomHeaderConfig {
  if (typeof raw !== 'object' || raw === null) fail('invalid configuration.');
  const config = raw as RoomHeaderCardConfig;
  const pilot = text(config.pilot, 'pilot');
  if (pilot !== undefined && !/^[a-z0-9_]+$/.test(pilot)) {
    fail('"pilot" must be a Vivid Pilot room (its area id, such as salon).');
  }
  const slots = readSlots(config);
  const name = text(config.name, 'name');
  const button = config.power_button ?? {};
  if (typeof button !== 'object') fail('"power_button" must be a set of options.');
  if (!pilot && !Object.values(slots).some((slot) => slot.mode === 'manual')) {
    fail('pick a Vivid Pilot room ("pilot"), or set the entities by hand.');
  }
  const glow = config.glow === undefined ? 100 : glowPercent(config.glow);
  if (glow === undefined) {
    fail(`"glow" must be a percentage from 0 to ${GLOW_MAX}, or ${GLOW_LEVELS.join(', ')}.`);
  }
  return {
    type: String(config.type ?? ''),
    pilot,
    slots,
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
