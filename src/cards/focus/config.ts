/**
 * Options of the focused cards, read and checked without the DOM (the cards
 * themselves import Lit), plus the lookups they share.
 */
import { CLIMATE_KINDS, type ClimateKind, type ComfortRange } from '../../core/climate';
import { domainOf } from '../../core/entities';
import { glowPercent, type GlowSetting } from '../../core/glow';
import type { HomeAssistant, LovelaceCardConfig } from '../../core/hass-types';
import { resolvePowerSource, type PowerSource } from '../../integrations/power';
import { findDevices } from '../hyperhdr/model';

export interface FocusBaseConfig extends LovelaceCardConfig {
  name?: string;
  icon?: string;
  glow?: GlowSetting;
}

/** Device classes of each climate measure. */
const DEVICE_CLASSES: Record<ClimateKind, string[]> = {
  temperature: ['temperature'],
  humidity: ['humidity'],
  pressure: ['atmospheric_pressure', 'pressure'],
  co2: ['carbon_dioxide'],
};

/** Time spans the climate chart offers (kept here so the options need no DOM). */
export const CLIMATE_RANGES = ['6h', '24h', '7d', '30d'] as const;
export type ClimateRange = (typeof CLIMATE_RANGES)[number];

/** A consumption reading, as the chart takes it. */
export interface PowerSeries {
  entityId: string;
  factor: number;
  name: string;
}

/** Trimmed text option, or undefined. */
export function textOption(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/** Entity id option, or undefined. */
export function entityOption(value: unknown): string | undefined {
  return typeof value === 'string' && /^[a-z_]+\.[a-z0-9_]+$/.test(value.trim())
    ? value.trim()
    : undefined;
}

export function glowOption(value: unknown): number {
  return glowPercent(value as GlowSetting) ?? 100;
}

export interface ScreenCardConfig extends FocusBaseConfig {
  /** The captured picture camera; the HyperHDR server's when left out. */
  camera?: string;
  /** The picture plays only once asked, for `timeout` seconds. */
  on_demand?: boolean;
  timeout?: number;
}

export interface ResolvedScreenCard {
  camera?: string;
  name?: string;
  onDemand: boolean;
  timeout: number;
  glow: number;
}

export function resolveScreenCard(raw: unknown): ResolvedScreenCard {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid configuration');
  const config = raw as ScreenCardConfig;
  const timeout = Number(config.timeout);
  return {
    camera: entityOption(config.camera),
    name: textOption(config.name),
    onDemand: config.on_demand === true,
    timeout: Number.isFinite(timeout) && timeout >= 10 ? Math.round(timeout) : 120,
    glow: glowOption(config.glow),
  };
}

/** The captured picture camera of the first HyperHDR server, and that server. */
export function hyperhdrCamera(hass: HomeAssistant): { camera?: string; server?: string } {
  const devices = findDevices(hass);
  for (const server of devices.servers) {
    const camera = devices.entities[server]?.['camera.capture'];
    if (camera) return { camera, server };
  }
  return {};
}

export interface ClimateCardConfig extends FocusBaseConfig {
  entity?: string;
  /** What the sensor measures; read from its device class when left out. */
  kind?: ClimateKind;
  /** The time span shown first. */
  range?: ClimateRange;
  /** Comfort band, in the sensor's units. */
  comfort?: { low?: number; high?: number };
}

export interface ResolvedClimateCard {
  entity?: string;
  kind?: ClimateKind;
  range: ClimateRange;
  comfort?: ComfortRange;
  name?: string;
  icon?: string;
  glow: number;
}

export function resolveClimateCard(raw: unknown): ResolvedClimateCard {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid configuration');
  const config = raw as ClimateCardConfig;
  const low = Number(config.comfort?.low);
  const high = Number(config.comfort?.high);
  return {
    entity: entityOption(config.entity),
    kind: CLIMATE_KINDS.includes(config.kind as ClimateKind) ? config.kind : undefined,
    range: CLIMATE_RANGES.includes(config.range as ClimateRange)
      ? (config.range as ClimateRange)
      : '24h',
    comfort:
      Number.isFinite(low) && Number.isFinite(high) && low < high ? { low, high } : undefined,
    name: textOption(config.name),
    icon: textOption(config.icon),
    glow: glowOption(config.glow),
  };
}

/** What a sensor measures, from its device class (temperature when unknown). */
export function kindOfSensor(hass: HomeAssistant, entityId: string | undefined): ClimateKind {
  const deviceClass = entityId ? hass.states[entityId]?.attributes.device_class : undefined;
  const found = (Object.entries(DEVICE_CLASSES) as [ClimateKind, string[]][]).find(([, classes]) =>
    classes.includes(String(deviceClass)),
  );
  return found?.[0] ?? 'temperature';
}

export interface PowerCardConfig extends FocusBaseConfig {
  /** Lights (their consumption is found) or power sensors. */
  entities?: string[];
  /** Price of a kWh, for the cost of the period. */
  price?: number;
  /** ISO 4217 code; Home Assistant's currency when left out. */
  currency?: string;
  /** Strip voltage, to turn WLED's estimated current into watts. */
  voltage?: number;
}

export interface ResolvedPowerCard {
  entities: string[];
  price?: number;
  currency?: string;
  voltage?: number;
  name?: string;
  icon?: string;
  glow: number;
}

export function resolvePowerCard(raw: unknown): ResolvedPowerCard {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid configuration');
  const config = raw as PowerCardConfig;
  const list = Array.isArray(config.entities)
    ? config.entities
    : typeof config.entities === 'string'
      ? [config.entities]
      : [];
  const entities = list
    .map((item) =>
      entityOption(typeof item === 'object' && item ? (item as { entity?: unknown }).entity : item),
    )
    .filter((item, index, all): item is string => !!item && all.indexOf(item) === index);
  const price = Number(config.price);
  const voltage = Number(config.voltage);
  const currency = textOption(config.currency)?.toUpperCase();
  return {
    entities,
    price: Number.isFinite(price) && price > 0 ? price : undefined,
    currency: currency && /^[A-Z]{3}$/.test(currency) ? currency : undefined,
    voltage: Number.isFinite(voltage) && voltage > 0 ? voltage : undefined,
    name: textOption(config.name),
    icon: textOption(config.icon),
    glow: glowOption(config.glow),
  };
}

export interface Reading {
  name: string;
  source: PowerSource;
}

/** Where the consumption of each entity comes from: itself for a sensor, found for a light. */
export function powerReadings(hass: HomeAssistant, config: ResolvedPowerCard): Reading[] {
  return config.entities.flatMap((entityId) => {
    const state = hass.states[entityId];
    if (!state) return [];
    const name = (state.attributes.friendly_name as string | undefined) ?? entityId;
    const source: PowerSource | undefined =
      domainOf(entityId) === 'sensor'
        ? { kind: 'power', entityId, origin: 'sensor' }
        : resolvePowerSource(hass, entityId, { voltage: config.voltage });
    return source ? [{ name, source }] : [];
  });
}

/** The readings as series of the chart, in watts. */
export function seriesSources(hass: HomeAssistant, readings: Reading[]): PowerSeries[] {
  return readings.map(({ name, source }) => {
    const unit = hass.states[source.entityId]?.attributes.unit_of_measurement;
    const factor = source.kind === 'current' ? source.voltage / 1000 : unit === 'kW' ? 1000 : 1;
    return { entityId: source.entityId, factor, name };
  });
}

export const COLOR_BARS = ['auto', 'hue', 'temperature', 'none'] as const;
export type ColorBarMode = (typeof COLOR_BARS)[number];
export const STATIC_EFFECTS = new Set(['solid', 'none', 'off', '']);

export interface LightCardConfig extends FocusBaseConfig {
  entity?: string;
  /** The effect picker on the tile. */
  effects?: boolean;
  color_bar?: ColorBarMode;
  /** For a WLED strip: its Settings and Device panels under the tile. */
  wled?: boolean;
}

export interface ResolvedLightCard {
  entity: string;
  name?: string;
  icon?: string;
  effects: boolean;
  colorBar: ColorBarMode;
  wled: boolean;
  glow: number;
}

export function resolveLightCard(raw: unknown): ResolvedLightCard {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid configuration');
  const config = raw as LightCardConfig;
  const entity = entityOption(config.entity);
  if (!entity) throw new Error('Pick a light: `entity` is required.');
  return {
    entity,
    name: textOption(config.name),
    icon: textOption(config.icon),
    effects: config.effects !== false,
    colorBar: COLOR_BARS.includes(config.color_bar as ColorBarMode)
      ? (config.color_bar as ColorBarMode)
      : 'auto',
    wled: config.wled !== false,
    glow: glowOption(config.glow),
  };
}
