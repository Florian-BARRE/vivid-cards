import { WARM_WHITE, clamp, lightColor } from '../../core/color';
import {
  domainOf,
  expandGroup,
  friendlyName,
  isAvailable,
  objectIdOf,
  parseNumericState,
} from '../../core/entities';
import type { HomeAssistant, LightAttributes, Rgb } from '../../core/hass-types';
import type { ResolvedRoomHeaderConfig, RoomBadgeConfig } from './config';
import { findRoles, roleOf, roleSpec, type FoundRole } from './roles';

/** Halo of lamps, plugs and white lights. */
export const AMBER: Rgb = [255, 193, 7];

/** Color modes of a light that can show a color of its own (LED strips). */
const COLOR_MODES = new Set(['hs', 'rgb', 'rgbw', 'rgbww', 'xy']);

/** What the room shows: its lights, its power sensor and its badges before the manual ones. */
export interface RoomEntities {
  /** Lamps and switches first (left of the halo), then LED strips. */
  lights: string[];
  power?: string;
  /** Badges of the roles found and kept, in the order of the role table. */
  roleBadges: RoomBadgeConfig[];
  /** Every role found, excluded ones included (for the editor). */
  found: (FoundRole & { excluded: boolean })[];
}

/** The roles found for a room, by entity id or by name. */
export function discoverRoom(hass: HomeAssistant, room: string): FoundRole[] {
  return findRoles(hass, room);
}

/**
 * Discovered roles minus the exclusions, with the config's `lights` and
 * `power` taking over theirs. Without discovery, only `lights` and `power`.
 */
export function roomEntities(
  hass: HomeAssistant,
  config: ResolvedRoomHeaderConfig,
  isDefined: (tag: string) => boolean = () => true,
): RoomEntities {
  const found = (config.discover && config.room ? findRoles(hass, config.room) : []).map(
    (item) => ({
      ...item,
      excluded:
        config.excludeRoles.includes(item.role) || config.excludeEntities.includes(item.entity),
    }),
  );
  const kept = found.filter((item) => !item.excluded);
  const feeds = (item: FoundRole) => roleSpec(item.role).feeds;
  const lights =
    config.lights ?? kept.filter((item) => feeds(item) === 'light').map((item) => item.entity);
  const power = config.power ?? kept.find((item) => feeds(item) === 'power')?.entity;
  const badge = (tag: string | undefined, entity: string): RoomBadgeConfig[] =>
    tag && isDefined(tag) ? [{ type: `custom:${tag}`, entity }] : [];
  let roleBadges: RoomBadgeConfig[] = [];
  if (config.discover) {
    const lightBadges = config.lights
      ? config.lights.flatMap((entity) => {
          const role = found.find((item) => item.entity === entity)?.role;
          return badge(
            role ? roleSpec(role).badge : lightBadgeType(entity).replace(/^custom:/, ''),
            entity,
          );
        })
      : [];
    roleBadges = kept.flatMap((item) => {
      if (feeds(item) === 'light') {
        return config.lights ? [] : badge(roleSpec(item.role).badge, item.entity);
      }
      return badge(roleSpec(item.role).badge, item.entity);
    });
    roleBadges = [...lightBadges, ...roleBadges];
  }
  return { lights, power, roleBadges, found };
}

/**
 * Manual badges after the discovered ones; a manual badge on the entity of a
 * discovered badge takes its place.
 */
export function mergeBadges(
  discovered: RoomBadgeConfig[],
  manual: RoomBadgeConfig[] = [],
): RoomBadgeConfig[] {
  const rest = [...manual];
  const merged = discovered.map((item) => {
    const index = rest.findIndex(
      (badge) => typeof badge.entity === 'string' && badge.entity === item.entity,
    );
    return index === -1 ? item : rest.splice(index, 1)[0]!;
  });
  return [...merged, ...rest];
}

/** `salon` → `Salon`, `salle_de_bain` → `Salle de bain`, `séjour` → `Séjour`. */
export function roomTitle(room: string): string {
  const words = room.replace(/[_-]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Badge type of a light that no role names: lamps, LED strips, or any light. */
export function lightBadgeType(entityId: string): string {
  const object = objectIdOf(entityId);
  const role = roleOf(object.split('_').pop() ?? '');
  if (role === 'lampes' || role === 'leds' || role === 'interrupteurs') {
    return `custom:${roleSpec(role).badge!}`;
  }
  if (domainOf(entityId) === 'switch') return 'custom:vivid-lamp-badge';
  return 'custom:vivid-light-badge';
}

/** One glow behind the title. Positions and sizes are percentages of the card. */
export interface HaloSource {
  /** The group (lamps) or the strip it stands for; stable across updates. */
  id: string;
  rgb: Rgb;
  /** 0–1, from the brightness; 0 when off. */
  strength: number;
  on: boolean;
  x: number;
  y: number;
  /** Radii of the glow. */
  rx: number;
  ry: number;
}

function brightnessShare(hass: HomeAssistant, entityId: string): number {
  const state = hass.states[entityId];
  if (domainOf(entityId) !== 'light') return 1;
  const brightness = (state?.attributes as LightAttributes | undefined)?.brightness;
  return typeof brightness === 'number' ? clamp(brightness / 255, 0, 1) : 1;
}

function isOn(hass: HomeAssistant, entityId: string): boolean {
  return hass.states[entityId]?.state === 'on';
}

/** A light able to show a color of its own: it gets a glow of its own color. */
function isColorLight(hass: HomeAssistant, entityId: string): boolean {
  if (domainOf(entityId) !== 'light') return false;
  const modes = (hass.states[entityId]?.attributes as LightAttributes | undefined)
    ?.supported_color_modes;
  return Array.isArray(modes) && modes.some((mode) => COLOR_MODES.has(mode));
}

/**
 * Glows behind the title: one amber glow per group of lamps or switches (its
 * strength is the mean brightness of the lamps on), one per color light in
 * its current color. Glows that are on are spread from left to right (lamps
 * first); the others stay in the middle, invisible, so they fade in place.
 */
export function haloSources(hass: HomeAssistant, lights: readonly string[]): HaloSource[] {
  const lamps: HaloSource[] = [];
  const colored: HaloSource[] = [];
  const seen = new Set<string>();
  for (const group of lights) {
    const plain: string[] = [];
    for (const member of expandGroup(hass, group)) {
      if (seen.has(member)) continue;
      seen.add(member);
      if (!isColorLight(hass, member)) {
        plain.push(member);
        continue;
      }
      const on = isOn(hass, member);
      colored.push(
        source(
          member,
          on ? (lightColor(hass.states[member]) ?? WARM_WHITE) : WARM_WHITE,
          on ? brightnessShare(hass, member) : 0,
        ),
      );
    }
    if (plain.length === 0) continue;
    const lit = plain.filter((member) => isOn(hass, member));
    const strength = lit.length
      ? lit.reduce((sum, member) => sum + brightnessShare(hass, member), 0) / lit.length
      : 0;
    lamps.push(source(group, AMBER, strength, lit.length > 0));
  }
  const sources = [...lamps, ...colored];
  const lit = sources.filter((item) => item.on);
  const count = lit.length;
  lit.forEach((item, index) => {
    if (count === 1) {
      Object.assign(item, { x: 50, y: 25, rx: 45, ry: 70 });
      return;
    }
    const span = Math.min(48, 24 * (count - 1));
    item.x = round1(50 - span / 2 + (span * index) / (count - 1));
    item.y = index % 2 === 0 ? 22 : 30;
    item.rx = clamp(46 - 4 * count, 24, 45);
    item.ry = 60;
  });
  return sources;
}

function source(id: string, rgb: Rgb, strength: number, on = strength > 0): HaloSource {
  return { id, rgb, strength: round2(strength), on, x: 50, y: 25, rx: 45, ry: 70 };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Watts of a power sensor (kW converted); `undefined` when it cannot be read. */
export function powerWatts(hass: HomeAssistant, entityId: string | undefined): number | undefined {
  if (!entityId) return undefined;
  const state = hass.states[entityId];
  const value = parseNumericState(state);
  if (value === undefined) return undefined;
  const unit = state?.attributes.unit_of_measurement;
  return unit === 'kW' ? value * 1000 : value;
}

export interface RoomHeaderModel {
  name: string;
  lights: string[];
  /** Leaf lights and switches of the light groups, each counted once. */
  members: string[];
  /** Members on. */
  on: number;
  /** Members that can be read. */
  total: number;
  /** No light could be read (all unavailable). */
  unavailable: boolean;
  /** Watts. */
  power?: number;
  sources: HaloSource[];
  badges: RoomBadgeConfig[];
  /** Roles found for the room, excluded ones included. */
  found: (FoundRole & { excluded: boolean })[];
  /** Entity of the more-info a hold on the power button opens. */
  mainEntity?: string;
  /** Entities read by the title, the subtitle and the halo (badges watch their own). */
  watched: string[];
}

export function buildRoomHeaderModel(
  hass: HomeAssistant,
  config: ResolvedRoomHeaderConfig,
  isDefined: (tag: string) => boolean = () => true,
): RoomHeaderModel {
  const entities = roomEntities(hass, config, isDefined);
  const members = [...new Set(entities.lights.flatMap((id) => expandGroup(hass, id)))];
  const readable = members.filter((id) => isAvailable(hass.states[id]));
  const on = readable.filter((id) => isOn(hass, id)).length;
  const name =
    config.name ??
    (config.roomLabel
      ? roomTitle(config.roomLabel)
      : entities.lights[0]
        ? friendlyName(hass, entities.lights[0])
        : '');
  const mainEntity = config.entity ?? entities.lights[0];
  const watched = new Set<string>([...entities.lights, ...members]);
  if (entities.power) watched.add(entities.power);
  if (mainEntity) watched.add(mainEntity);
  return {
    name,
    lights: entities.lights,
    members,
    on,
    total: readable.length,
    unavailable: members.length > 0 && readable.length === 0,
    power: powerWatts(hass, entities.power),
    sources: haloSources(hass, entities.lights),
    badges: mergeBadges(entities.roleBadges, config.badges),
    found: entities.found,
    mainEntity,
    watched: [...watched],
  };
}

/** What a tap on the power button does: everything off when something is on. */
export function powerAction(model: RoomHeaderModel): {
  service: 'turn_on' | 'turn_off';
  entities: string[];
} {
  return { service: model.on > 0 ? 'turn_off' : 'turn_on', entities: [...model.lights] };
}
