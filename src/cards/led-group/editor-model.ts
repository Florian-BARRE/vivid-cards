import {
  MAX_FAVORITES,
  type BadgeInput,
  type FavoriteInput,
  type LedGroupCardConfig,
  type LedGroupMemberConfig,
} from './config';

type Section = 'tile' | 'power' | 'ambilight' | 'details' | 'appearance';

function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
  );
}

function prune<T extends Record<string, unknown>>(object: T): T {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => !isEmpty(value))) as T;
}

/** Sets a top-level key; empty values remove it. */
export function setRoot(
  config: LedGroupCardConfig,
  key: 'entity' | 'name' | 'icon',
  value: unknown,
): LedGroupCardConfig {
  const next = { ...config } as Record<string, unknown>;
  if (isEmpty(value)) delete next[key];
  else next[key] = value;
  return next as LedGroupCardConfig;
}

/**
 * Sets `section.key`. Values equal to `fallback` (the default) and empty values
 * are removed, and an empty section disappears, so the YAML only keeps what the
 * user changed.
 */
export function setOption(
  config: LedGroupCardConfig,
  section: Section,
  key: string,
  value: unknown,
  fallback?: unknown,
): LedGroupCardConfig {
  const current = { ...((config[section] as Record<string, unknown> | undefined) ?? {}) };
  if (isEmpty(value) || value === fallback) delete current[key];
  else current[key] = value;
  const next = { ...config } as Record<string, unknown>;
  const cleaned = prune(current);
  if (isEmpty(cleaned)) delete next[section];
  else next[section] = cleaned;
  return next as LedGroupCardConfig;
}

const MEMBER_DEFAULTS: Partial<Record<keyof LedGroupMemberConfig, unknown>> = {
  hidden: false,
  ambilight: true,
  power_mode: 'auto',
};

/**
 * Merges `patch` into the override of `entity`. Defaults are dropped; a member
 * without overrides is removed, and so is an empty `members` list.
 */
export function updateMember(
  config: LedGroupCardConfig,
  entity: string,
  patch: Partial<Omit<LedGroupMemberConfig, 'entity'>>,
): LedGroupCardConfig {
  const members = [...(config.members ?? [])];
  const index = members.findIndex((member) => member.entity === entity);
  const merged: Record<string, unknown> = { ...(index >= 0 ? members[index] : {}), ...patch };
  for (const [key, fallback] of Object.entries(MEMBER_DEFAULTS)) {
    if (merged[key] === fallback) delete merged[key];
  }
  // A sensor or a voltage only matters with the matching mode.
  if (merged.power_mode !== 'sensor' && 'power_mode' in patch) delete merged.power_sensor;
  if (merged.power_mode !== 'voltage' && 'power_mode' in patch) delete merged.voltage;
  const { entity: _entity, ...overrides } = prune(merged);
  const next = { ...config };
  if (Object.keys(overrides).length === 0) {
    if (index >= 0) members.splice(index, 1);
  } else {
    const member = { entity, ...overrides } as LedGroupMemberConfig;
    if (index >= 0) members[index] = member;
    else members.push(member);
  }
  if (members.length === 0) delete next.members;
  else next.members = members;
  return next;
}

/** Reads the override of `entity`, if any. */
export function memberOverride(
  config: LedGroupCardConfig,
  entity: string,
): LedGroupMemberConfig | undefined {
  return config.members?.find((member) => member.entity === entity);
}

/** Adds a favorite color (ignored once the list is full). */
export function addFavorite(config: LedGroupCardConfig, color: FavoriteInput): LedGroupCardConfig {
  const favorites = config.tile?.favorites ?? [];
  if (favorites.length >= MAX_FAVORITES) return config;
  return setOption(config, 'tile', 'favorites', [...favorites, color]);
}

export function removeFavorite(config: LedGroupCardConfig, index: number): LedGroupCardConfig {
  const favorites = (config.tile?.favorites ?? []).filter((_, position) => position !== index);
  return setOption(config, 'tile', 'favorites', favorites);
}

/** Adds a badge, unless that entity already has one. */
export function addBadge(config: LedGroupCardConfig, entity: string): LedGroupCardConfig {
  const badges = config.badges ?? [];
  if (badges.some((badge) => badgeEntity(badge) === entity)) return config;
  return { ...config, badges: [...badges, entity] };
}

export function removeBadge(config: LedGroupCardConfig, index: number): LedGroupCardConfig {
  const badges = (config.badges ?? []).filter((_, position) => position !== index);
  const next = { ...config };
  if (badges.length === 0) delete next.badges;
  else next.badges = badges;
  return next;
}

export function badgeEntity(badge: BadgeInput): string {
  return typeof badge === 'string' ? badge : badge.entity;
}

/** Cycles an optional boolean whose default is `true`: unset → false → unset. */
export function toggleDefaultOn(value: boolean | undefined): boolean | undefined {
  return value === false ? undefined : false;
}
