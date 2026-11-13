/* ====== Code Summary ======
 * The room header editor's changes to the config, as pure functions: a
 * slot's value, an option, the power button, and the badges list (add, move,
 * remove, options). Each writes the shortest config: a default is left out.
 */

import type { SlotValue } from '../../core/slots';
import type { PowerButtonConfig, RoomBadgeConfig, RoomHeaderCardConfig } from './config';
import type { RoomRole } from './roles';

type Config = RoomHeaderCardConfig;

function withEntities(config: Config, entities: Partial<Record<RoomRole, SlotValue>>): Config {
  const next: Record<string, unknown> = { ...config };
  const kept = Object.fromEntries(
    Object.entries(entities).filter(([, value]) => value !== undefined),
  );
  if (Object.keys(kept).length) next.entities = kept;
  else delete next.entities;
  return next as Config;
}

/* ============================== Slots and options ============================== */

/** Writes one role's slot (`undefined` = back to auto). */
export function setSlot(config: Config, role: RoomRole, value: SlotValue): Config {
  return withEntities(config, { ...(config.entities ?? {}), [role]: value });
}

/** Sets a top-level option, leaving it out when it is the default. */
export function setOption(
  config: Config,
  key: keyof Config,
  value: unknown,
  fallback?: unknown,
): Config {
  const next: Record<string, unknown> = { ...config };
  const empty = value === undefined || value === '' || value === null;
  if (empty || value === fallback) delete next[key as string];
  else next[key as string] = value;
  return next as Config;
}

/* ============================== Power button ============================== */

export function setPowerButton(
  config: Config,
  key: keyof PowerButtonConfig,
  value: unknown,
): Config {
  const button: Record<string, unknown> = { ...(config.power_button ?? {}) };
  if (value === undefined || value === null || (key === 'show' && value === 'auto'))
    delete button[key];
  else button[key] = value;
  const next: Record<string, unknown> = { ...config };
  if (Object.keys(button).length) next.power_button = button;
  else delete next.power_button;
  return next as Config;
}

/* ============================== Badges ============================== */

/** The badges list as the editor shows it (`[{ slot: "*" }]` when unset). */
export function badgeItems(config: Config): RoomBadgeConfig[] {
  return Array.isArray(config.badges) && config.badges.length ? config.badges : [{ slot: '*' }];
}

function withBadges(config: Config, badges: RoomBadgeConfig[]): Config {
  const next: Record<string, unknown> = { ...config };
  const isDefault =
    badges.length === 1 && badges[0]?.slot === '*' && Object.keys(badges[0]).length === 1;
  if (isDefault) delete next.badges;
  else next.badges = badges;
  return next as Config;
}

export function addBadgeItem(config: Config, item: RoomBadgeConfig): Config {
  return withBadges(config, [...badgeItems(config), item]);
}

export function removeBadgeItem(config: Config, index: number): Config {
  return withBadges(
    config,
    badgeItems(config).filter((_, position) => position !== index),
  );
}

export function moveBadgeItem(config: Config, index: number, offset: -1 | 1): Config {
  const items = [...badgeItems(config)];
  const target = index + offset;
  if (index < 0 || target < 0 || index >= items.length || target >= items.length) return config;
  [items[index], items[target]] = [items[target]!, items[index]!];
  return withBadges(config, items);
}

/** Sets options of a badge (an empty value removes the option). */
export function setBadgeOptions(
  config: Config,
  index: number,
  options: Record<string, unknown>,
): Config {
  const items = badgeItems(config).map((item, position) => {
    if (position !== index) return item;
    const next: Record<string, unknown> = { ...item };
    for (const [key, value] of Object.entries(options)) {
      const empty = value === undefined || value === '' || (Array.isArray(value) && !value.length);
      if (empty) delete next[key];
      else next[key] = value;
    }
    return next as RoomBadgeConfig;
  });
  return withBadges(config, items);
}
