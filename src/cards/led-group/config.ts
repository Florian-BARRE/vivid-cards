import { normalizeAction, type ActionConfig } from '../../core/action-handler';
import { domainOf } from '../../core/entities';
import type { PowerScale } from '../../core/glow';
import type { LovelaceCardConfig } from '../../core/hass-types';
import type { PowerDefaults, PowerMode } from '../../integrations/power';

export const CARD_TYPE = 'vivid-led-group';

export type ColorBarMode = 'auto' | 'hue' | 'temperature' | 'none';
export type StateText = 'brightness' | 'none';
export type MemberOrder = 'name' | 'group';

export const COLOR_BAR_MODES: ColorBarMode[] = ['auto', 'hue', 'temperature', 'none'];
export const STATE_TEXTS: StateText[] = ['brightness', 'none'];
export const MEMBER_ORDERS: MemberOrder[] = ['name', 'group'];
export const POWER_MODES: PowerMode[] = ['auto', 'sensor', 'voltage', 'none'];

export interface LedGroupMemberConfig {
  entity: string;
  name?: string;
  hidden?: boolean;
  /** Responds to the ambilight (WLED live override) buttons. */
  ambilight?: boolean;
  power_mode?: PowerMode;
  power_sensor?: string;
  voltage?: number;
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
  };
  power?: {
    enabled?: boolean;
    sensor_pattern?: string;
    voltage?: number;
    idle?: number;
    max?: number;
    steps?: [number, number];
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
  };
  power: PowerDefaults & {
    enabled: boolean;
    /** Scale of one strip; the group total scales with the number of strips. */
    scale: PowerScale;
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
  };
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
      hidden: optionalBoolean(member.hidden, 'members.hidden'),
      ambilight: optionalBoolean(member.ambilight, 'members.ambilight'),
      power_mode: optionalChoice(member.power_mode, 'members.power_mode', POWER_MODES),
      power_sensor: optionalString(member.power_sensor, 'members.power_sensor'),
      voltage: optionalNumber(member.voltage, 'members.voltage'),
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
    },
    power: {
      enabled: optionalBoolean(power.enabled, 'power.enabled') ?? true,
      sensorPattern: optionalString(power.sensor_pattern, 'power.sensor_pattern'),
      voltage: optionalNumber(power.voltage, 'power.voltage'),
      scale: resolveScale(power),
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
    },
    members: resolveMembers(config.members),
  };
}
