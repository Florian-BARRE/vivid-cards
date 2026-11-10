import type { RoomBadgeConfig, RoomHeaderCardConfig } from './config';
import { roleOf, type FoundRole } from './roles';

type FormData = Record<string, unknown>;

const TEXT_KEYS = ['room', 'name', 'power', 'entity', 'turn_on', 'turn_off'] as const;
const BOOL_KEYS = ['show_subtitle', 'show_badges'] as const;

/** The form's values as the editor shows them (defaults filled in). */
export function roomHeaderFormData(config: RoomHeaderCardConfig): FormData {
  return {
    room: config.room ?? '',
    discover: config.discover !== false,
    name: config.name ?? '',
    lights: Array.isArray(config.lights) ? config.lights : [],
    power: config.power ?? '',
    entity: config.entity ?? '',
    turn_on: config.turn_on ?? '',
    turn_off: config.turn_off ?? '',
    show_subtitle: config.show_subtitle !== false,
    show_badges: config.show_badges !== false,
    glow: typeof config.glow === 'number' ? config.glow : 100,
  };
}

/**
 * Applies the form's values to the config, leaving defaults out so the YAML
 * stays short. `badges` and `exclude` are kept as they are (they have their own controls).
 */
export function applyRoomHeaderForm(
  config: RoomHeaderCardConfig,
  value: FormData,
): RoomHeaderCardConfig {
  const next: Record<string, unknown> = { ...config };
  for (const key of TEXT_KEYS) {
    const text = typeof value[key] === 'string' ? (value[key] as string).trim() : '';
    if (text) next[key] = text;
    else delete next[key];
  }
  const lights = Array.isArray(value.lights)
    ? (value.lights as unknown[]).filter((id): id is string => typeof id === 'string' && !!id)
    : [];
  if (lights.length) next.lights = lights;
  else delete next.lights;
  if (value.discover === false) next.discover = false;
  else delete next.discover;
  for (const key of BOOL_KEYS) {
    if (value[key] === false) next[key] = false;
    else delete next[key];
  }
  if (typeof value.glow === 'number' && value.glow !== 100) next.glow = value.glow;
  else if (typeof value.glow === 'number') delete next.glow;
  return next as RoomHeaderCardConfig;
}

function excludeList(config: RoomHeaderCardConfig): string[] {
  return Array.isArray(config.exclude)
    ? config.exclude.filter((item): item is string => typeof item === 'string')
    : [];
}

/** A found role is left out by its role (any alias) or by its entity id. */
export function isRoleExcluded(config: RoomHeaderCardConfig, found: FoundRole): boolean {
  return excludeList(config).some(
    (item) => item.trim() === found.entity || roleOf(item) === found.role,
  );
}

/** Turns a found role on (removes what excludes it) or off (adds its role to `exclude`). */
export function setRoleIncluded(
  config: RoomHeaderCardConfig,
  found: FoundRole,
  included: boolean,
): RoomHeaderCardConfig {
  const rest = excludeList(config).filter(
    (item) => item.trim() !== found.entity && roleOf(item) !== found.role,
  );
  const exclude = included ? rest : [...rest, found.role];
  const next: Record<string, unknown> = { ...config };
  if (exclude.length) next.exclude = exclude;
  else delete next.exclude;
  return next as RoomHeaderCardConfig;
}

/* ============================== Added badges ============================== */

/** The badges added to the room (the `badges` list), valid entries only. */
export function addedBadges(config: RoomHeaderCardConfig): RoomBadgeConfig[] {
  return Array.isArray(config.badges)
    ? config.badges.filter(
        (item): item is RoomBadgeConfig =>
          typeof item === 'object' && item !== null && typeof item.type === 'string',
      )
    : [];
}

function withBadges(config: RoomHeaderCardConfig, badges: RoomBadgeConfig[]): RoomHeaderCardConfig {
  const next: Record<string, unknown> = { ...config };
  if (badges.length) next.badges = badges;
  else delete next.badges;
  return next as RoomHeaderCardConfig;
}

/** Adds a badge of `type` (`vivid-door-badge` or `custom:vivid-door-badge`) at the end. */
export function addBadge(
  config: RoomHeaderCardConfig,
  type: string,
  entity?: string,
): RoomHeaderCardConfig {
  const tag = type.startsWith('custom:') ? type : `custom:${type}`;
  const badge: RoomBadgeConfig = entity ? { type: tag, entity } : { type: tag };
  return withBadges(config, [...addedBadges(config), badge]);
}

/** Removes the added badge at `index` (in the `badges` list). */
export function removeBadge(config: RoomHeaderCardConfig, index: number): RoomHeaderCardConfig {
  return withBadges(
    config,
    addedBadges(config).filter((_, position) => position !== index),
  );
}

/** Moves the added badge at `index` one place earlier (-1) or later (+1). */
export function moveBadge(
  config: RoomHeaderCardConfig,
  index: number,
  offset: -1 | 1,
): RoomHeaderCardConfig {
  const badges = addedBadges(config);
  const target = index + offset;
  if (index < 0 || index >= badges.length || target < 0 || target >= badges.length) return config;
  [badges[index], badges[target]] = [badges[target]!, badges[index]!];
  return withBadges(config, badges);
}
