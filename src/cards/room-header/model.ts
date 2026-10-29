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
import type { ClimateKind } from '../../core/climate';
import type { ResolvedRoomHeaderConfig, RoomBadgeConfig } from './config';

/** Halo of lamps, plugs and white lights. */
export const AMBER: Rgb = [255, 193, 7];

/** Color modes of a light that can show a color of its own (LED strips). */
const COLOR_MODES = new Set(['hs', 'rgb', 'rgbw', 'rgbww', 'xy']);

/** Climate badges, built only when another bundle (or branch) defines them. */
export const CLIMATE_BADGES: Partial<Record<ClimateKind, string>> = {
  temperature: 'vivid-temperature-badge',
  humidity: 'vivid-humidity-badge',
  co2: 'vivid-air-quality-badge',
};

/** French suffixes of the owner's naming convention, per climate measure. */
const CLIMATE_SUFFIXES: Record<ClimateKind, string> = {
  temperature: 'temperature',
  humidity: 'humidite',
  pressure: 'pression',
  co2: 'co2',
};

/** What the naming convention finds for a room, or what the config sets instead. */
export interface RoomEntities {
  /** Lamps and switches first (left of the halo), then LED strips. */
  lights: string[];
  power?: string;
  illuminance?: string;
  presence?: string;
  windows?: string;
  doors?: string;
  climate: Partial<Record<ClimateKind, string>>;
}

/** `light.salon_leds`, `switch.salon_lampes`, … that exist in Home Assistant. */
export function discoverRoom(hass: HomeAssistant, room: string): RoomEntities {
  const found = (id: string): string | undefined => (hass.states[id] ? id : undefined);
  const lights = [`switch.${room}_lampes`, `switch.${room}_interrupteurs`, `light.${room}_leds`]
    .map(found)
    .filter((id): id is string => id !== undefined);
  const climate: Partial<Record<ClimateKind, string>> = {};
  for (const [kind, suffix] of Object.entries(CLIMATE_SUFFIXES) as [ClimateKind, string][]) {
    const id = found(`sensor.${room}_${suffix}`);
    if (id) climate[kind] = id;
  }
  return {
    lights,
    power: found(`sensor.${room}_puissance`),
    illuminance: found(`sensor.${room}_eclairement`),
    presence: found(`binary_sensor.${room}_presence`),
    windows: found(`binary_sensor.${room}_fenetres`),
    doors: found(`binary_sensor.${room}_portes`),
    climate,
  };
}

/** Discovered entities, with the config's `lights` and `power` taking over. */
export function roomEntities(hass: HomeAssistant, config: ResolvedRoomHeaderConfig): RoomEntities {
  const found: RoomEntities = config.room
    ? discoverRoom(hass, config.room)
    : { lights: [], climate: {} };
  return {
    ...found,
    lights: config.lights ?? found.lights,
    power: config.power ?? found.power,
  };
}

/** `salon` → `Salon`, `salle_de_bain` → `Salle de bain`. */
export function roomTitle(room: string): string {
  const words = room.replace(/_+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Badge type of a light group: lamps, LED strips, or any light. */
export function lightBadgeType(entityId: string): string {
  const object = objectIdOf(entityId);
  if (domainOf(entityId) === 'switch' && !object.endsWith('_interrupteurs')) {
    return 'custom:vivid-lamp-badge';
  }
  if (domainOf(entityId) === 'light' && /(^|_)leds?($|_)/.test(object)) {
    return 'custom:vivid-led-badge';
  }
  return 'custom:vivid-light-badge';
}

/**
 * Badges for what was found: lights, illuminance, presence, windows, doors,
 * then the climate badges whose element `isDefined` reports.
 */
export function autoBadges(
  entities: RoomEntities,
  isDefined: (tag: string) => boolean = () => false,
): RoomBadgeConfig[] {
  const badges: RoomBadgeConfig[] = entities.lights.map((entity) => ({
    type: lightBadgeType(entity),
    entity,
  }));
  const add = (tag: string, entity: string | undefined): void => {
    if (entity) badges.push({ type: `custom:${tag}`, entity });
  };
  add('vivid-illuminance-badge', entities.illuminance);
  add('vivid-presence-badge', entities.presence);
  add('vivid-window-badge', entities.windows);
  add('vivid-door-badge', entities.doors);
  for (const [kind, tag] of Object.entries(CLIMATE_BADGES) as [ClimateKind, string][]) {
    if (entities.climate[kind] && isDefined(tag)) add(tag, entities.climate[kind]);
  }
  return badges;
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
  /** Entity of the more-info a hold on the power button opens. */
  mainEntity?: string;
  /** Entities read by the title, the subtitle and the halo (badges watch their own). */
  watched: string[];
}

export function buildRoomHeaderModel(
  hass: HomeAssistant,
  config: ResolvedRoomHeaderConfig,
  isDefined: (tag: string) => boolean = () => false,
): RoomHeaderModel {
  const entities = roomEntities(hass, config);
  const members = [...new Set(entities.lights.flatMap((id) => expandGroup(hass, id)))];
  const readable = members.filter((id) => isAvailable(hass.states[id]));
  const on = readable.filter((id) => isOn(hass, id)).length;
  const name =
    config.name ??
    (config.room
      ? roomTitle(config.room)
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
    badges: config.badges ?? autoBadges(entities, isDefined),
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
