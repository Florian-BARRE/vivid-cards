import { domainOf } from '../../core/entities';
import type { PowerScale } from '../../core/glow';
import type { LovelaceCardConfig } from '../../core/hass-types';
import type { PowerOptions } from '../../integrations/power';

export const CARD_TYPE = 'vivid-led-group';

export interface LedGroupMemberConfig {
  entity: string;
  name?: string;
  power_sensor?: string;
  hidden?: boolean;
}

export interface LedGroupPowerConfig extends PowerOptions {
  idle?: number;
  max?: number;
  steps?: [number, number];
}

export interface LedGroupCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  details_hash?: string;
  show_power?: boolean;
  show_live_override?: boolean;
  show_effects?: boolean;
  show_hue?: boolean;
  power?: LedGroupPowerConfig;
  members?: LedGroupMemberConfig[];
}

export interface ResolvedLedGroupConfig {
  type: string;
  entity: string;
  name?: string;
  icon: string;
  detailsHash?: string;
  showPower: boolean;
  showLiveOverride: boolean;
  showEffects: boolean;
  showHue: boolean;
  power: PowerOptions;
  /** Scale of one strip; the group total scales with the number of strips. */
  scale: PowerScale;
  members: Map<string, LedGroupMemberConfig>;
}

export const DEFAULT_ICON = 'mdi:led-strip-variant';
export const DEFAULT_SCALE: PowerScale = { idle: 3, max: 40, steps: [10, 25] };

function fail(message: string): never {
  throw new Error(`${CARD_TYPE}: ${message}`);
}

function optionalNumber(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number) || number < 0) fail(`"${field}" must be a positive number.`);
  return number;
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') fail(`"${field}" must be text.`);
  return value.trim() || undefined;
}

function optionalBoolean(value: unknown, field: string, fallback: boolean): boolean {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'boolean') fail(`"${field}" must be true or false.`);
  return value;
}

/** Accepts "salon-leds", "#salon-leds" or "#/salon-leds" and returns "#salon-leds". */
export function normalizeHash(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const body = value.trim().replace(/^#\/?/, '');
  if (body === '') return undefined;
  if (!/^[\w-]+$/.test(body)) {
    fail('"details_hash" may only contain letters, digits, "-" and "_".');
  }
  return `#${body}`;
}

function resolveScale(power: LedGroupPowerConfig | undefined): PowerScale {
  const idle = optionalNumber(power?.idle, 'power.idle') ?? DEFAULT_SCALE.idle;
  const max = optionalNumber(power?.max, 'power.max') ?? DEFAULT_SCALE.max;
  let steps = DEFAULT_SCALE.steps;
  if (power?.steps !== undefined) {
    const raw = power.steps as unknown;
    if (!Array.isArray(raw) || raw.length !== 2) fail('"power.steps" must be two numbers.');
    const low = optionalNumber(raw[0], 'power.steps');
    const high = optionalNumber(raw[1], 'power.steps');
    if (low === undefined || high === undefined || low > high) {
      fail('"power.steps" must be two ascending numbers, e.g. [10, 25].');
    }
    steps = [low, high];
  }
  return { idle, max, steps };
}

function resolveMembers(raw: unknown): Map<string, LedGroupMemberConfig> {
  const members = new Map<string, LedGroupMemberConfig>();
  if (raw === undefined || raw === null) return members;
  if (!Array.isArray(raw)) fail('"members" must be a list.');
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) fail('each member must be an object.');
    const member = item as Record<string, unknown>;
    const entity = optionalString(member.entity, 'members.entity');
    if (!entity) fail('each member needs an "entity".');
    members.set(entity, {
      entity,
      name: optionalString(member.name, 'members.name'),
      power_sensor: optionalString(member.power_sensor, 'members.power_sensor'),
      hidden: optionalBoolean(member.hidden, 'members.hidden', false),
    });
  }
  return members;
}

export function resolveConfig(raw: unknown): ResolvedLedGroupConfig {
  if (typeof raw !== 'object' || raw === null) fail('invalid configuration.');
  const config = raw as LedGroupCardConfig;
  const entity = optionalString(config.entity, 'entity');
  if (!entity) fail('set "entity" to a light or a light group.');
  if (domainOf(entity) !== 'light') fail(`"${entity}" is not a light entity.`);

  const power = config.power ?? {};
  if (typeof power !== 'object') fail('"power" must be an object.');

  return {
    type: config.type,
    entity,
    name: optionalString(config.name, 'name'),
    icon: optionalString(config.icon, 'icon') ?? DEFAULT_ICON,
    detailsHash: normalizeHash(optionalString(config.details_hash, 'details_hash')),
    showPower: optionalBoolean(config.show_power, 'show_power', true),
    showLiveOverride: optionalBoolean(config.show_live_override, 'show_live_override', true),
    showEffects: optionalBoolean(config.show_effects, 'show_effects', true),
    showHue: optionalBoolean(config.show_hue, 'show_hue', true),
    power: {
      sensor_pattern: optionalString(power.sensor_pattern, 'power.sensor_pattern'),
      voltage: optionalNumber(power.voltage, 'power.voltage'),
    },
    scale: resolveScale(power),
    members: resolveMembers(config.members),
  };
}
