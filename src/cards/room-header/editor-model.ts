/* ====== Code Summary ======
 * The room header editor's changes to the config, as pure functions: the
 * 0.14–0.17 options moved to the slots once (so everything shows in the
 * editor), a slot's value, the discovery settings, the power button, and the
 * badges list (add, move, remove, options). Each writes the shortest config:
 * a default is left out.
 */

import type { HomeAssistant } from '../../core/hass-types';
import { readSlot, writeSlot, type SlotValue } from '../../core/slots';
import {
  resolveRoomHeaderConfig,
  type PowerButtonConfig,
  type RoomBadgeConfig,
  type RoomHeaderCardConfig,
} from './config';
import { lightRoleOf } from './light-roles';
import { roomSlots } from './room-slots';
import { ROOM_ROLES, roleOf, roleSpec, type RoomRole } from './roles';

type Config = RoomHeaderCardConfig;

/* ============================== 0.14–0.17 options ============================== */

/**
 * Moves `exclude`, `lights`, `power` and badges without `slot` into the slots
 * and the badges list, so the editor shows all of it. Entity ids left out go
 * to the slot that finds them (needs `hass`; kept as they are without it).
 */
export function migrateRoomHeaderConfig(config: Config, hass?: HomeAssistant): Config {
  const next: Record<string, unknown> = { ...config };
  const entities: Partial<Record<RoomRole, SlotValue>> = { ...(config.entities ?? {}) };
  const exclude = Array.isArray(config.exclude)
    ? config.exclude.filter((item) => typeof item === 'string')
    : [];
  const keptExclusions: string[] = [];
  for (const item of exclude) {
    if (item.includes('.')) continue;
    const role = roleOf(item);
    if (role && entities[role] === undefined) entities[role] = false;
  }
  const ids = exclude.filter((item) => item.includes('.'));
  if (ids.length) {
    let slots: ReturnType<typeof roomSlots> | undefined;
    try {
      slots = hass
        ? roomSlots(hass, resolveRoomHeaderConfig({ ...config, exclude: [] }))
        : undefined;
    } catch {
      slots = undefined;
    }
    for (const id of ids) {
      const role = slots
        ? ROOM_ROLES.find((spec) => slots![spec.role].entries.some((entry) => entry.entity === id))
            ?.role
        : undefined;
      if (!role) {
        keptExclusions.push(id);
        continue;
      }
      const slot = readSlot(entities[role]);
      if (slot.mode !== 'auto') continue;
      entities[role] = writeSlot(
        { ...slot, exclude: [...slot.exclude, id] },
        roleSpec(role).multiple,
      );
    }
  }
  if (Array.isArray(config.lights) && config.lights.length) {
    const lists: Partial<Record<RoomRole, string[]>> = {};
    for (const id of config.lights) (lists[lightRoleOf(id)] ??= []).push(id);
    for (const role of ['lampes', 'leds', 'interrupteurs'] as const)
      entities[role] = lists[role] ?? false;
  }
  if (typeof config.power === 'string' && config.power) entities.puissance = config.power;
  if (
    Array.isArray(config.badges) &&
    config.badges.length &&
    !config.badges.some((item) => item.slot !== undefined)
  ) {
    next.badges = [{ slot: '*' }, ...config.badges];
  }
  delete next.lights;
  delete next.power;
  if (keptExclusions.length) next.exclude = keptExclusions;
  else delete next.exclude;
  return withEntities(next as Config, entities);
}

function withEntities(config: Config, entities: Partial<Record<RoomRole, SlotValue>>): Config {
  const next: Record<string, unknown> = { ...config };
  const kept = Object.fromEntries(
    Object.entries(entities).filter(([, value]) => value !== undefined),
  );
  if (Object.keys(kept).length) next.entities = kept;
  else delete next.entities;
  return next as Config;
}

/* ============================== Slots and discovery ============================== */

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

/** Sets the name pattern (the default one is left out). */
export function setPattern(config: Config, pattern: string): Config {
  const next: Record<string, unknown> = { ...config };
  const value = pattern.trim();
  if (!value || value === '{room}-{role}') delete next.naming;
  else next.naming = { ...(config.naming ?? {}), pattern: value };
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
