/* ====== Code Summary ======
 * The room header editor's changes to the config, as pure functions: the
 * source (Vivid Pilot or manual), a slot's value, an option, the power
 * button, and the badges list (every role badge shown or hidden and in
 * order, free badges, options). Each writes the shortest config: a default
 * is left out.
 */

import type { SlotValue } from '../../core/slots';
import type { PowerButtonConfig, RoomBadgeConfig, RoomHeaderCardConfig } from './config';
import type { RoomSlots } from './room-slots';
import { ROOM_ROLES, type RoomRole } from './roles';

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

/* ============================== Source ============================== */

export type HeaderSource = 'pilot' | 'manual';

/** Vivid Pilot when a room is picked, manual when entities are written by hand. */
export function headerSource(config: Config): HeaderSource {
  if (config.pilot) return 'pilot';
  const written = Object.values(config.entities ?? {}).some(
    (value) => typeof value === 'string' || (Array.isArray(value) && value.length > 0),
  );
  return written ? 'manual' : 'pilot';
}

/** Switches the source: the room and the slots of the other source are dropped. */
export function setSource(config: Config, source: HeaderSource, room?: string): Config {
  const next: Record<string, unknown> = { ...config };
  delete next.entities;
  delete next.pilot;
  if (source === 'pilot' && room) next.pilot = room;
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

/** Writes the badges list; `explicit` keeps an empty list (every badge hidden). */
function withBadges(config: Config, badges: RoomBadgeConfig[], explicit = false): Config {
  const next: Record<string, unknown> = { ...config };
  const isDefault =
    !explicit &&
    badges.length === 1 &&
    badges[0]?.slot === '*' &&
    Object.keys(badges[0]).length === 1;
  if (isDefault) delete next.badges;
  else next.badges = badges;
  return next as Config;
}

/**
 * The badges shown, in order, with "the other badges found" (`*`) turned
 * into the roles it stands for now: what the editor lists as ticked.
 */
export function shownBadges(config: Config, slots: RoomSlots | undefined): RoomBadgeConfig[] {
  const items = badgeItems(config);
  const listed = new Set(items.map((item) => item.slot).filter((slot) => slot && slot !== '*'));
  return items.flatMap((item) =>
    item.slot === '*'
      ? ROOM_ROLES.filter(
          (spec) => spec.badge && !listed.has(spec.role) && slots?.[spec.role]?.entities.length,
        ).map((spec) => ({ slot: spec.role }))
      : [item],
  );
}

/** The shown badges written out (no more `*`), before adding a free one last. */
export function listShownBadges(config: Config, slots: RoomSlots | undefined): Config {
  return withBadges(config, shownBadges(config, slots), true);
}

/** Shows or hides a role's badge; a shown one goes last. */
export function setRoleBadge(
  config: Config,
  slots: RoomSlots | undefined,
  role: RoomRole,
  shown: boolean,
): Config {
  const items = shownBadges(config, slots).filter((item) => item.slot !== role);
  return withBadges(config, shown ? [...items, { slot: role }] : items, true);
}

/** Moves a shown badge one place earlier (-1) or later (+1). */
export function moveShownBadge(
  config: Config,
  slots: RoomSlots | undefined,
  index: number,
  offset: -1 | 1,
): Config {
  const items = [...shownBadges(config, slots)];
  const target = index + offset;
  if (index < 0 || target < 0 || index >= items.length || target >= items.length) return config;
  [items[index], items[target]] = [items[target]!, items[index]!];
  return withBadges(config, items, true);
}

/** Options of a shown badge (an empty value removes the option). */
export function setShownBadgeOptions(
  config: Config,
  slots: RoomSlots | undefined,
  index: number,
  options: Record<string, unknown>,
): Config {
  return setBadgeOptions(withBadges(config, shownBadges(config, slots), true), index, options);
}

/** Removes a shown badge (a free one). */
export function removeShownBadge(
  config: Config,
  slots: RoomSlots | undefined,
  index: number,
): Config {
  return withBadges(
    config,
    shownBadges(config, slots).filter((_, position) => position !== index),
    true,
  );
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
