import { domainOf } from '../../core/entities';
import { GLOW_LEVELS, GLOW_MAX, glowPercent, type GlowSetting } from '../../core/glow';
import type { LovelaceCardConfig } from '../../core/hass-types';

export const LAMP_CARD = 'vivid-lamp-group';

/** Lamps on lights, smart plugs or wall switches, and groups of them. */
export const LAMP_DOMAINS = ['light', 'switch', 'group', 'input_boolean'];

/**
 * `ambiance`: optional scene presets, then a round button per lamp.
 * `line`: the whole group on one line, a small button per lamp.
 */
export type LampLayout = 'ambiance' | 'line';
export const LAMP_LAYOUTS: LampLayout[] = ['ambiance', 'line'];

export interface LampMemberConfig {
  entity: string;
  name?: string;
  icon?: string;
  icon_off?: string;
  /** Power sensor of this lamp, when it is not on the lamp's own device. */
  power_sensor?: string;
  /** Leaves the lamp out of the card (it still counts in the group). */
  hidden?: boolean;
}

/** A quick preset: these lamps on and the others off, or a Home Assistant scene. */
export interface LampSceneConfig {
  name: string;
  icon?: string;
  /** Lamps on in this preset; every other lamp of the card is turned off. */
  lamps?: string[];
  /** A Home Assistant scene to activate instead. */
  scene?: string;
}

export interface LampGroupCardConfig extends LovelaceCardConfig {
  entity?: string;
  entities?: string[];
  name?: string;
  icon?: string;
  layout?: LampLayout;
  show_power?: boolean;
  show_duration?: boolean;
  /** Energy and cost of the day, from the power history. */
  show_energy?: boolean;
  /** Price of a kWh, in the Home Assistant currency. */
  price?: number;
  /** A sensor holding the price of a kWh (a tariff that changes). */
  price_entity?: string;
  /** Watts at which a lamp's halo is the brightest. */
  max_watts?: number;
  /** A lamp on but drawing less than this (W) is flagged (bulb out?). 0 turns it off. */
  warn_below?: number;
  glow?: GlowSetting;
  members?: LampMemberConfig[];
  scenes?: LampSceneConfig[];
}

export interface ResolvedLampMember {
  name?: string;
  icon?: string;
  iconOff?: string;
  powerSensor?: string;
  hidden: boolean;
}

export interface ResolvedLampScene {
  name: string;
  icon: string;
  lamps?: string[];
  scene?: string;
}

export interface ResolvedLampGroupConfig {
  type: string;
  entity?: string;
  entities?: string[];
  name?: string;
  icon?: string;
  layout: LampLayout;
  showPower: boolean;
  showDuration: boolean;
  showEnergy: boolean;
  price?: number;
  priceEntity?: string;
  maxWatts: number;
  warnBelow: number;
  /** Percent. */
  glow: number;
  members: Map<string, ResolvedLampMember>;
  scenes: ResolvedLampScene[];
}

function fail(message: string): never {
  throw new Error(`${LAMP_CARD}: ${message}`);
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

function number(value: unknown, field: string, min: number): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < min)
    fail(`"${field}" must be a number of at least ${min}.`);
  return parsed;
}

function entityList(value: unknown, field: string): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    fail(`"${field}" must be a list of entity ids.`);
  }
  return (value as string[]).map((item) => item.trim()).filter(Boolean);
}

function resolveMembers(raw: unknown): Map<string, ResolvedLampMember> {
  const members = new Map<string, ResolvedLampMember>();
  if (raw === undefined || raw === null) return members;
  if (!Array.isArray(raw)) fail('"members" must be a list.');
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) fail('each member must be an object.');
    const member = item as LampMemberConfig;
    const entity = text(member.entity, 'members[].entity');
    if (!entity) fail('each member needs an "entity".');
    members.set(entity, {
      name: text(member.name, 'members[].name'),
      icon: text(member.icon, 'members[].icon'),
      iconOff: text(member.icon_off, 'members[].icon_off'),
      powerSensor: text(member.power_sensor, 'members[].power_sensor'),
      hidden: bool(member.hidden, 'members[].hidden', false),
    });
  }
  return members;
}

function resolveScenes(raw: unknown): ResolvedLampScene[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) fail('"scenes" must be a list.');
  return raw.map((item, index) => {
    if (typeof item !== 'object' || item === null) fail('each scene must be an object.');
    const scene = item as LampSceneConfig;
    const name = text(scene.name, `scenes[${index}].name`);
    if (!name) fail(`scenes[${index}] needs a "name".`);
    const lamps = entityList(scene.lamps, `scenes[${index}].lamps`);
    const target = text(scene.scene, `scenes[${index}].scene`);
    if (target && domainOf(target) !== 'scene') fail(`"${target}" is not a scene.`);
    if (!target && lamps === undefined) {
      fail(`scenes[${index}] needs "lamps" (the lamps it turns on) or a "scene".`);
    }
    return {
      name,
      icon:
        text(scene.icon, `scenes[${index}].icon`) ??
        (target ? 'mdi:palette' : lamps?.length ? 'mdi:lamps' : 'mdi:power-off'),
      lamps: target ? undefined : lamps,
      scene: target,
    };
  });
}

export function resolveLampConfig(raw: unknown): ResolvedLampGroupConfig {
  if (typeof raw !== 'object' || raw === null) fail('invalid configuration.');
  const config = raw as LampGroupCardConfig;
  const entity = text(config.entity, 'entity');
  const entities = entityList(config.entities, 'entities');
  if (!entity && !entities?.length) fail('set "entity" to a group of lamps, or list "entities".');
  for (const id of [entity, ...(entities ?? [])]) {
    if (id && !LAMP_DOMAINS.includes(domainOf(id))) {
      fail(`"${id}" must be a light, a switch or a group of them.`);
    }
  }
  if (config.layout !== undefined && !LAMP_LAYOUTS.includes(config.layout)) {
    fail(`"layout" must be one of: ${LAMP_LAYOUTS.join(', ')}.`);
  }
  const glow = config.glow === undefined ? 100 : glowPercent(config.glow);
  if (glow === undefined) {
    fail(`"glow" must be a percentage from 0 to ${GLOW_MAX}, or ${GLOW_LEVELS.join(', ')}.`);
  }
  const priceEntity = text(config.price_entity, 'price_entity');
  if (
    priceEntity &&
    domainOf(priceEntity) !== 'sensor' &&
    domainOf(priceEntity) !== 'input_number'
  ) {
    fail('"price_entity" must be a sensor or an input_number.');
  }
  return {
    type: String(config.type ?? ''),
    entity,
    entities: entities?.length ? entities : undefined,
    name: text(config.name, 'name'),
    icon: text(config.icon, 'icon'),
    layout: config.layout ?? 'ambiance',
    showPower: bool(config.show_power, 'show_power', true),
    showDuration: bool(config.show_duration, 'show_duration', true),
    showEnergy: bool(config.show_energy, 'show_energy', true),
    price: number(config.price, 'price', 0),
    priceEntity,
    maxWatts: number(config.max_watts, 'max_watts', 1) ?? 60,
    warnBelow: number(config.warn_below, 'warn_below', 0) ?? 1,
    glow,
    members: resolveMembers(config.members),
    scenes: resolveScenes(config.scenes),
  };
}
