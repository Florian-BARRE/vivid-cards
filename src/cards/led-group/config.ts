import { normalizeAction, type ActionConfig } from '../../core/action-handler';
import { domainOf } from '../../core/entities';
import type { ColorPreset } from '../../core/actions';
import { parseColor } from '../../core/color';
import {
  DEFAULT_POWER_COLORS,
  GLOW_LEVELS,
  GLOW_MAX,
  glowPercent,
  type GlowSetting,
  type PowerScale,
} from '../../core/glow';
import type { LovelaceCardConfig, Rgb } from '../../core/hass-types';
import type { PowerDefaults, PowerMode } from '../../integrations/power';

export const CARD_TYPE = 'vivid-led-group';

export type ColorBarMode = 'auto' | 'hue' | 'temperature' | 'none';
export type StateText = 'brightness' | 'none';
export type MemberOrder = 'name' | 'group' | 'custom';

export const COLOR_BAR_MODES: ColorBarMode[] = ['auto', 'hue', 'temperature', 'none'];
export const STATE_TEXTS: StateText[] = ['brightness', 'none'];
export const MEMBER_ORDERS: MemberOrder[] = ['name', 'group', 'custom'];
export const POWER_MODES: PowerMode[] = ['auto', 'sensor', 'voltage', 'none'];

/** `"#ff8800"`, `[255, 136, 0]` or `{ rgb | color | kelvin, brightness }`. */
export type FavoriteInput =
  string | Rgb | { rgb?: Rgb; color?: string; kelvin?: number; brightness?: number };

/** An entity id, or an entity with its own name and icon. */
export type BadgeInput = string | { entity: string; name?: string; icon?: string };

export interface BadgeConfig {
  entity: string;
  name?: string;
  icon?: string;
}

export interface LedGroupMemberConfig {
  entity: string;
  name?: string;
  icon?: string;
  hidden?: boolean;
  /** Responds to the ambilight (WLED live override) buttons. */
  ambilight?: boolean;
  power_mode?: PowerMode;
  power_sensor?: string;
  voltage?: number;
  /** Seconds of fade for this light, instead of `tile.transition`. */
  transition?: number;
}

export interface LedGroupCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  icon?: string;
  tile?: {
    state?: StateText;
    color_bar?: ColorBarMode;
    effects?: boolean;
    tap_action?: unknown;
    hold_action?: unknown;
    double_tap_action?: unknown;
    favorites?: FavoriteInput[];
    brightness_min?: number;
    brightness_step?: number;
    transition?: number;
  };
  appearance?: {
    /** Halo strength in percent (100 = default), or off / soft / normal / strong. */
    glow?: GlowSetting;
    /** How much the halo grows with the brightness, in percent (100 = default). */
    glow_boost?: number;
    header?: boolean;
    compact?: boolean;
    gradient?: boolean;
    animate_effects?: boolean;
  };
  badges?: BadgeInput[];
  power?: {
    enabled?: boolean;
    sensor_pattern?: string;
    voltage?: number;
    idle?: number;
    max?: number;
    steps?: [number, number];
    colors?: [FavoriteInput, FavoriteInput, FavoriteInput];
    /** Price of a kWh, to show what today cost. */
    price?: number;
    /** A sensor or input_number holding the price of a kWh; wins over `price`. */
    price_entity?: string;
    /** ISO 4217 code; defaults to Home Assistant's currency. */
    currency?: string;
  };
  ambilight?: {
    enabled?: boolean;
  };
  details?: {
    enabled?: boolean;
    hash?: string;
    sort?: MemberOrder;
    summary?: boolean;
    effects?: boolean;
    color_bar?: ColorBarMode;
    favorites?: boolean;
    wled_controls?: boolean;
    health?: boolean;
    history?: boolean;
    /** Entity ids in display order, with `sort: custom`. */
    order?: string[];
  };
  members?: LedGroupMemberConfig[];
}

export interface ResolvedLedGroupConfig {
  type: string;
  entity: string;
  name?: string;
  /** Icon of every tile; `undefined` uses each light's own icon. */
  icon?: string;
  tile: {
    state: StateText;
    colorBar: ColorBarMode;
    effects: boolean;
    tapAction: ActionConfig;
    /** `undefined` means: details for a group, more-info for a single light. */
    holdAction?: ActionConfig;
    doubleTapAction: ActionConfig;
    favorites: ColorPreset[];
    /** Lowest brightness (percent) a drag sets; dragging to 0 still turns off. */
    brightnessMin: number;
    brightnessStep: number;
    /** Seconds, sent with every light call when set. */
    transition?: number;
  };
  appearance: {
    /** Percent. */
    glow: number;
    /** Percent. */
    glowBoost: number;
    header: boolean;
    compact: boolean;
    gradient: boolean;
    animateEffects: boolean;
  };
  badges: BadgeConfig[];
  power: PowerDefaults & {
    enabled: boolean;
    /** Scale of one strip; the group total adds up its strips. */
    scale: PowerScale;
    /** `max` was not set: use WLED's current limit × voltage when known. */
    autoMax: boolean;
    /** `steps` were not set: they follow `max`. */
    autoSteps: boolean;
    price?: number;
    priceEntity?: string;
    currency?: string;
  };
  ambilight: { enabled: boolean };
  details: {
    /** `undefined` means: enabled for groups only. */
    enabled?: boolean;
    hash?: string;
    sort: MemberOrder;
    summary: boolean;
    effects: boolean;
    colorBar: ColorBarMode;
    favorites: boolean;
    wledControls: boolean;
    health: boolean;
    history: boolean;
    order: string[];
  };
  members: Map<string, LedGroupMemberConfig>;
}

export const DEFAULT_ICON = 'mdi:led-strip-variant';
export const DEFAULT_SCALE: PowerScale = {
  idle: 3,
  max: 40,
  steps: [10, 25],
  colors: DEFAULT_POWER_COLORS,
};
/** Most favorites shown; more would not fit on a phone. */
export const MAX_FAVORITES = 8;

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

function resolvePriceEntity(value: unknown): string | undefined {
  const entity = optionalString(value, 'power.price_entity');
  if (entity && !['sensor', 'input_number'].includes(domainOf(entity))) {
    fail('"power.price_entity" must be a sensor or an input_number.');
  }
  return entity;
}

function optionalBoolean(value: unknown, field: string): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'boolean') fail(`"${field}" must be true or false.`);
  return value;
}

function optionalChoice<T extends string>(
  value: unknown,
  field: string,
  choices: readonly T[],
): T | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !choices.includes(value as T)) {
    fail(`"${field}" must be one of: ${choices.join(', ')}.`);
  }
  return value as T;
}

function section(value: unknown, field: string): Record<string, unknown> {
  if (value === undefined || value === null) return {};
  if (typeof value !== 'object' || Array.isArray(value)) fail(`"${field}" must be an object.`);
  return value as Record<string, unknown>;
}

function action(value: unknown, field: string): ActionConfig | undefined {
  try {
    return normalizeAction(value, field);
  } catch (error) {
    fail((error as Error).message);
  }
}

/** Accepts "salon-leds", "#salon-leds" or "#/salon-leds" and returns "#salon-leds". */
export function normalizeHash(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const body = value.trim().replace(/^#\/?/, '');
  if (body === '') return undefined;
  if (!/^[\w-]+$/.test(body)) {
    fail('"details.hash" may only contain letters, digits, "-" and "_".');
  }
  return `#${body}`;
}

/**
 * Moves v0.1 keys (`show_power`, `details_hash`…) into the v0.2 sections.
 * Values already set in a section win. Returns a new object.
 */
export function migrateConfig(raw: LedGroupCardConfig): LedGroupCardConfig {
  const legacy = raw as LedGroupCardConfig & Record<string, unknown>;
  const {
    show_power: showPower,
    show_live_override: showLiveOverride,
    show_effects: showEffects,
    show_hue: showHue,
    details_hash: detailsHash,
    ...rest
  } = legacy;
  const config: LedGroupCardConfig = { ...rest } as LedGroupCardConfig;

  if (showEffects !== undefined || showHue !== undefined) {
    config.tile = {
      ...(showEffects !== undefined ? { effects: showEffects as boolean } : {}),
      ...(showHue !== undefined ? { color_bar: showHue ? 'auto' : 'none' } : {}),
      ...config.tile,
    } as LedGroupCardConfig['tile'];
  }
  if (showPower !== undefined) {
    config.power = { enabled: showPower as boolean, ...config.power };
  }
  if (showLiveOverride !== undefined) {
    config.ambilight = { enabled: showLiveOverride as boolean, ...config.ambilight };
  }
  if (detailsHash !== undefined) {
    config.details = { hash: detailsHash as string, ...config.details };
  }
  return config;
}

function resolveScale(power: Record<string, unknown>): PowerScale {
  const idle = optionalNumber(power.idle, 'power.idle') ?? DEFAULT_SCALE.idle;
  const max = optionalNumber(power.max, 'power.max') ?? DEFAULT_SCALE.max;
  let steps = DEFAULT_SCALE.steps;
  if (power.steps !== undefined) {
    const raw = power.steps;
    if (!Array.isArray(raw) || raw.length !== 2) fail('"power.steps" must be two numbers.');
    const low = optionalNumber(raw[0], 'power.steps');
    const high = optionalNumber(raw[1], 'power.steps');
    if (low === undefined || high === undefined || low > high) {
      fail('"power.steps" must be two ascending numbers, e.g. [10, 25].');
    }
    steps = [low, high];
  }
  let colors = DEFAULT_POWER_COLORS;
  if (power.colors !== undefined) {
    const raw = power.colors;
    if (!Array.isArray(raw) || raw.length !== 3) fail('"power.colors" must be three colors.');
    const parsed = raw.map((value) => favorite(value, 'power.colors').rgb);
    if (parsed.some((rgb) => !rgb)) fail('"power.colors" must be three RGB colors.');
    colors = parsed as [Rgb, Rgb, Rgb];
  }
  return { idle, max, steps, colors };
}

function favorite(value: unknown, field: string): ColorPreset {
  if (typeof value === 'string' || Array.isArray(value)) {
    const rgb = parseColor(value);
    if (!rgb) fail(`"${field}" has an invalid color: ${JSON.stringify(value)}.`);
    return { rgb };
  }
  if (typeof value !== 'object' || value === null) {
    fail(`"${field}" must be colors such as "#ff8800" or { kelvin: 2700 }.`);
  }
  const item = value as Record<string, unknown>;
  const brightness = optionalNumber(item.brightness, `${field}.brightness`);
  if (brightness !== undefined && (brightness < 1 || brightness > 100)) {
    fail(`"${field}.brightness" must be between 1 and 100.`);
  }
  const kelvin = optionalNumber(item.kelvin, `${field}.kelvin`);
  const color = item.rgb ?? item.color;
  if (color !== undefined) {
    const rgb = parseColor(color);
    if (!rgb) fail(`"${field}" has an invalid color: ${JSON.stringify(color)}.`);
    return { rgb, brightness };
  }
  if (kelvin !== undefined) return { kelvin, brightness };
  fail(`"${field}" needs "rgb", "color" or "kelvin".`);
}

function resolveFavorites(value: unknown): ColorPreset[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) fail('"tile.favorites" must be a list of colors.');
  return value.slice(0, MAX_FAVORITES).map((item) => favorite(item, 'tile.favorites'));
}

function resolveBadges(value: unknown): BadgeConfig[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) fail('"badges" must be a list of entities.');
  return value.map((item) => {
    if (typeof item === 'string' && item.includes('.')) return { entity: item };
    if (typeof item === 'object' && item !== null) {
      const badge = item as Record<string, unknown>;
      const entity = optionalString(badge.entity, 'badges.entity');
      if (entity?.includes('.')) {
        return {
          entity,
          name: optionalString(badge.name, 'badges.name'),
          icon: optionalString(badge.icon, 'badges.icon'),
        };
      }
    }
    fail('each badge must be an entity id or { entity: … }.');
  });
}

function resolveCurrency(value: unknown): string | undefined {
  const code = optionalString(value, 'power.currency');
  if (code === undefined) return undefined;
  if (!/^[A-Za-z]{3}$/.test(code)) fail('"power.currency" must be a currency code such as EUR.');
  return code.toUpperCase();
}

function resolveOrder(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    fail('"details.order" must be a list of entity ids.');
  }
  return value as string[];
}

/** Halo strength in percent: a number up to 200, or a named level. */
function glowStrength(value: unknown, field: string): number {
  if (value === undefined || value === null || value === '') return 100;
  const strength = glowPercent(value);
  if (strength === undefined) {
    fail(`"${field}" must be a percentage from 0 to ${GLOW_MAX}, or ${GLOW_LEVELS.join(', ')}.`);
  }
  return strength;
}

function glowBoost(value: unknown, field: string): number {
  const boost = optionalNumber(value, field);
  if (boost === undefined) return 100;
  if (boost > GLOW_MAX) fail(`"${field}" must be between 0 and ${GLOW_MAX}.`);
  return boost;
}

function percent(value: unknown, field: string, fallback: number): number {
  const number = optionalNumber(value, field);
  if (number === undefined) return fallback;
  if (number < 1 || number > 100) fail(`"${field}" must be between 1 and 100.`);
  return number;
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
      icon: optionalString(member.icon, 'members.icon'),
      hidden: optionalBoolean(member.hidden, 'members.hidden'),
      ambilight: optionalBoolean(member.ambilight, 'members.ambilight'),
      power_mode: optionalChoice(member.power_mode, 'members.power_mode', POWER_MODES),
      power_sensor: optionalString(member.power_sensor, 'members.power_sensor'),
      voltage: optionalNumber(member.voltage, 'members.voltage'),
      transition: optionalNumber(member.transition, 'members.transition'),
    });
  }
  return members;
}

export function resolveConfig(raw: unknown): ResolvedLedGroupConfig {
  if (typeof raw !== 'object' || raw === null) fail('invalid configuration.');
  const config = migrateConfig(raw as LedGroupCardConfig);
  const entity = optionalString(config.entity, 'entity');
  if (!entity) fail('set "entity" to a light or a light group.');
  if (domainOf(entity) !== 'light') fail(`"${entity}" is not a light entity.`);

  const tile = section(config.tile, 'tile');
  const power = section(config.power, 'power');
  const ambilight = section(config.ambilight, 'ambilight');
  const details = section(config.details, 'details');
  const appearance = section(config.appearance, 'appearance');
  const tileColorBar = optionalChoice(tile.color_bar, 'tile.color_bar', COLOR_BAR_MODES) ?? 'auto';
  const tileEffects = optionalBoolean(tile.effects, 'tile.effects') ?? true;

  return {
    type: config.type,
    entity,
    name: optionalString(config.name, 'name'),
    icon: optionalString(config.icon, 'icon'),
    tile: {
      state: optionalChoice(tile.state, 'tile.state', STATE_TEXTS) ?? 'brightness',
      colorBar: tileColorBar,
      effects: tileEffects,
      tapAction: action(tile.tap_action, 'tile.tap_action') ?? { action: 'toggle' },
      holdAction: action(tile.hold_action, 'tile.hold_action'),
      doubleTapAction: action(tile.double_tap_action, 'tile.double_tap_action') ?? {
        action: 'none',
      },
      favorites: resolveFavorites(tile.favorites),
      brightnessMin: percent(tile.brightness_min, 'tile.brightness_min', 1),
      brightnessStep: percent(tile.brightness_step, 'tile.brightness_step', 1),
      transition: optionalNumber(tile.transition, 'tile.transition'),
    },
    appearance: {
      glow: glowStrength(appearance.glow, 'appearance.glow'),
      glowBoost: glowBoost(appearance.glow_boost, 'appearance.glow_boost'),
      header: optionalBoolean(appearance.header, 'appearance.header') ?? true,
      compact: optionalBoolean(appearance.compact, 'appearance.compact') ?? false,
      gradient: optionalBoolean(appearance.gradient, 'appearance.gradient') ?? true,
      animateEffects:
        optionalBoolean(appearance.animate_effects, 'appearance.animate_effects') ?? true,
    },
    badges: resolveBadges(config.badges),
    power: {
      enabled: optionalBoolean(power.enabled, 'power.enabled') ?? true,
      sensorPattern: optionalString(power.sensor_pattern, 'power.sensor_pattern'),
      voltage: optionalNumber(power.voltage, 'power.voltage'),
      scale: resolveScale(power),
      autoMax: power.max === undefined || power.max === null || power.max === '',
      autoSteps: power.steps === undefined || power.steps === null,
      price: optionalNumber(power.price, 'power.price'),
      priceEntity: resolvePriceEntity(power.price_entity),
      currency: resolveCurrency(power.currency),
    },
    ambilight: { enabled: optionalBoolean(ambilight.enabled, 'ambilight.enabled') ?? true },
    details: {
      enabled: optionalBoolean(details.enabled, 'details.enabled'),
      hash: normalizeHash(optionalString(details.hash, 'details.hash')),
      sort: optionalChoice(details.sort, 'details.sort', MEMBER_ORDERS) ?? 'name',
      summary: optionalBoolean(details.summary, 'details.summary') ?? true,
      effects: optionalBoolean(details.effects, 'details.effects') ?? tileEffects,
      colorBar:
        optionalChoice(details.color_bar, 'details.color_bar', COLOR_BAR_MODES) ?? tileColorBar,
      favorites: optionalBoolean(details.favorites, 'details.favorites') ?? true,
      wledControls: optionalBoolean(details.wled_controls, 'details.wled_controls') ?? true,
      health: optionalBoolean(details.health, 'details.health') ?? true,
      history: optionalBoolean(details.history, 'details.history') ?? true,
      order: resolveOrder(details.order),
    },
    members: resolveMembers(config.members),
  };
}
