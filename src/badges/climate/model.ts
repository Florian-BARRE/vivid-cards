import {
  DEFAULT_COMFORT,
  PRESSURE_DROP_ALERT,
  airLevel,
  climateColor,
  climateHalo,
  comfortDistance,
  toCelsius,
  type AirLevel,
  type ClimateKind,
  type ComfortRange,
} from '../../core/climate';
import { rgbCss } from '../../core/color';
import { friendlyName } from '../../core/entities';
import { glowShadow, iconOn, meanColor, type ChipTone } from '../../core/glow';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import { valueAt, type HistorySeries, type Reading } from '../../core/history';
import { CLIMATE_RANGES, type ClimateRange } from '../../components/vivid-climate-chart';
import {
  AGGREGATES,
  ConfigReader,
  resolveBase,
  type Aggregate,
  type ResolvedBaseBadge,
} from '../base/config';
import { localize, type StringKey } from '../../i18n';
import { aggregate, isGroupBadge, memberIds, members, watchedIds } from '../base/members';

export const CLIMATE_BADGES: Record<ClimateKind, string> = {
  temperature: 'vivid-temperature-badge',
  humidity: 'vivid-humidity-badge',
  pressure: 'vivid-pressure-badge',
  co2: 'vivid-air-quality-badge',
};

export const DOMAINS = ['sensor', 'group'];

/** Device classes offered by the editors and used to find a sensor for the stub. */
export const DEVICE_CLASSES: Record<ClimateKind, string[]> = {
  temperature: ['temperature'],
  humidity: ['humidity'],
  pressure: ['atmospheric_pressure', 'pressure'],
  co2: ['carbon_dioxide'],
};

/** Kind of a badge from its `type` (`custom:vivid-humidity-badge` → `humidity`). */
export function climateKindOf(type: unknown): ClimateKind {
  const tag = typeof type === 'string' ? type.replace(/^custom:/, '') : '';
  const entry = Object.entries(CLIMATE_BADGES).find(([, value]) => value === tag);
  return (entry?.[0] as ClimateKind | undefined) ?? 'temperature';
}

/**
 * What a group shows by default: what asks for action. The range of the rooms
 * for temperature, the most humid room, the worst air, the mean pressure.
 */
export type ClimateDisplay = Aggregate | 'range';
export const GROUP_DISPLAY: Record<ClimateKind, ClimateDisplay> = {
  temperature: 'range',
  humidity: 'max',
  pressure: 'mean',
  co2: 'max',
};

/** Smallest change that draws a trend arrow, in scale units (°C, %, hPa). */
export const TREND_THRESHOLD: Record<ClimateKind, number | undefined> = {
  temperature: 0.5,
  humidity: 5,
  pressure: 1,
  co2: undefined,
};

/** Span of the trend: the last hour, three hours for the pressure (the weather to come). */
export const TREND_WINDOW_MS: Record<ClimateKind, number> = {
  temperature: 3_600_000,
  humidity: 3_600_000,
  pressure: 3 * 3_600_000,
  co2: 3_600_000,
};

/** A shower: humidity rising this many points… */
export const SHOWER_RISE = 10;
/** …within this span. */
export const SHOWER_WINDOW_MS = 15 * 60_000;

/** History is fetched when the badge connects, then at this pace. */
export const HISTORY_REFRESH_MS = 10 * 60_000;

export interface ResolvedClimateBadge extends ResolvedBaseBadge {
  kind: ClimateKind;
  /** As written, in the sensor's unit; the kind's default when unset. */
  comfort?: ComfortRange;
  /** Overrides what a group shows. */
  aggregate?: Aggregate;
  /** Span of the details chart. */
  range: ClimateRange;
  /** Trend arrows, shower and pressure drop alerts (they need the history). */
  trend: boolean;
}

export function resolveClimateBadge(
  raw: unknown,
  kind: ClimateKind = climateKindOf((raw as { type?: unknown } | null)?.type),
): ResolvedClimateBadge {
  const reader = new ConfigReader(CLIMATE_BADGES[kind], raw);
  const base = resolveBase(reader, { domains: DOMAINS });
  const comfortRaw = reader.config.comfort;
  let comfort: ComfortRange | undefined;
  if (comfortRaw !== undefined && comfortRaw !== null && comfortRaw !== '') {
    const pair = Array.isArray(comfortRaw) ? comfortRaw.map((value) => Number(value)) : [];
    const [low, high] = pair;
    if (
      pair.length !== 2 ||
      low === undefined ||
      high === undefined ||
      !Number.isFinite(low) ||
      !Number.isFinite(high) ||
      low >= high
    ) {
      reader.fail('"comfort" must be two numbers, low then high (comfort: [19, 23]).');
    }
    comfort = { low: low as number, high: high as number };
  }
  const aggregateRaw = reader.config.aggregate;
  return {
    ...base,
    kind,
    comfort,
    aggregate:
      aggregateRaw === undefined ||
      aggregateRaw === null ||
      aggregateRaw === '' ||
      aggregateRaw === 'auto'
        ? undefined
        : reader.choice('aggregate', AGGREGATES, 'mean'),
    range: reader.choice('range', CLIMATE_RANGES, '24h'),
    trend: reader.bool('trend', true),
  };
}

/* --------------------------------- units --------------------------------- */

/** Pressure units to hPa. */
const PRESSURE_FACTORS: Record<string, number> = {
  hPa: 1,
  mbar: 1,
  Pa: 0.01,
  kPa: 10,
  bar: 1000,
  inHg: 33.8639,
  mmHg: 1.33322,
  psi: 68.9476,
};

/** A reading in the units of the color scale (°C, %, hPa, ppm). */
export function toScale(kind: ClimateKind, value: number, unit: string | undefined): number {
  if (kind === 'temperature') return toCelsius(value, unit);
  if (kind === 'pressure') return value * (PRESSURE_FACTORS[unit ?? 'hPa'] ?? 1);
  return value;
}

/** Back from the scale units to a sensor unit. */
export function fromScale(kind: ClimateKind, value: number, unit: string | undefined): number {
  if (kind === 'temperature') return unit === '°F' ? (value * 9) / 5 + 32 : value;
  if (kind === 'pressure') return value / (PRESSURE_FACTORS[unit ?? 'hPa'] ?? 1);
  return value;
}

/** Comfort range in scale units: the config's (written in the sensor's unit) or the default. */
export function comfortRange(
  kind: ClimateKind,
  comfort: ComfortRange | undefined,
  unit: string | undefined,
): ComfortRange {
  if (!comfort) return DEFAULT_COMFORT[kind];
  return { low: toScale(kind, comfort.low, unit), high: toScale(kind, comfort.high, unit) };
}

/** Decimals shown for a unit. */
export function climateDigits(kind: ClimateKind, unit: string | undefined): number {
  if (kind === 'temperature') return 1;
  if (kind === 'pressure') return unit === 'inHg' || unit === 'bar' ? 2 : unit === 'kPa' ? 1 : 0;
  return 0;
}

export function defaultUnit(kind: ClimateKind): string {
  return { temperature: '°C', humidity: '%', pressure: 'hPa', co2: 'ppm' }[kind];
}

/* -------------------------------- history -------------------------------- */

/** How much a series moved over `window` up to `now`, ending at `current`. */
export function seriesDelta(
  readings: readonly Reading[] | undefined,
  now: number,
  window: number,
  current: number,
): number | undefined {
  if (!readings?.length) return undefined;
  const start = now - window;
  const before = valueAt(readings, start) ?? readings.find((reading) => reading.v !== undefined)?.v;
  return before === undefined ? undefined : current - before;
}

/** How far `current` stands above the lowest value of the last `window`. */
export function recentRise(
  readings: readonly Reading[] | undefined,
  now: number,
  window: number,
  current: number,
): number | undefined {
  if (!readings?.length) return undefined;
  const start = now - window;
  const values = [
    valueAt(readings, start),
    ...readings.filter((reading) => reading.t > start && reading.t <= now).map((r) => r.v),
  ].filter((value): value is number => value !== undefined);
  return values.length ? current - Math.min(...values) : undefined;
}

export function trendOf(kind: ClimateKind, delta: number | undefined): 'up' | 'down' | undefined {
  const threshold = TREND_THRESHOLD[kind];
  if (threshold === undefined || delta === undefined || Math.abs(delta) <= threshold) {
    return undefined;
  }
  return delta > 0 ? 'up' : 'down';
}

/** Entities whose history the badge needs, and over how long (ms). */
export function historyNeeds(model: Pick<ClimateModel, 'kind' | 'items'>): {
  ids: string[];
  window: number;
} {
  const window = Math.max(
    TREND_WINDOW_MS[model.kind],
    model.kind === 'humidity' ? SHOWER_WINDOW_MS : 0,
  );
  return {
    ids: TREND_THRESHOLD[model.kind] === undefined ? [] : model.items.map((item) => item.entityId),
    window,
  };
}

/* --------------------------------- model --------------------------------- */

export interface ClimateItem {
  entityId: string;
  name: string;
  /** In the sensor's unit. */
  value?: number;
  /** In the scale units (°C, %, hPa, ppm). */
  scaled?: number;
  unit?: string;
  /** Change over the trend window, in scale units. */
  delta?: number;
  /** Rise over the last 15 minutes, in scale units. */
  rise?: number;
}

export interface ClimateModel {
  name: string;
  kind: ClimateKind;
  isGroup: boolean;
  items: ClimateItem[];
  /** Unit everything is written in: the first sensor's. */
  unit: string;
  /** Scale units. */
  comfort: ComfortRange;
  display: ClimateDisplay;
  /** The value shown (scale units), for every display but `range`. */
  scaled?: number;
  /** Coldest and warmest rooms (`range`). */
  low?: ClimateItem;
  high?: ClimateItem;
  /** The room furthest from comfort: it colors the halo. */
  worst?: ClimateItem;
  /** Change of the value shown over the trend window (scale units). */
  delta?: number;
  /** Some sensor rose fast: a shower for the humidity. */
  rise?: number;
  watched: string[];
}

export function buildClimateModel(
  hass: HomeAssistant,
  config: ResolvedClimateBadge,
  history: HistorySeries = {},
  now: number = Date.now(),
): ClimateModel {
  const kind = config.kind;
  const ids = memberIds(hass, config);
  const list = members(hass, ids);
  const items: ClimateItem[] = list.map((member) => {
    const unitRaw = member.state?.attributes.unit_of_measurement;
    const unit = typeof unitRaw === 'string' && unitRaw ? unitRaw : undefined;
    const value = member.available ? Number.parseFloat(member.state?.state ?? '') : Number.NaN;
    if (!Number.isFinite(value)) return { entityId: member.entityId, name: member.name, unit };
    const scaled = toScale(kind, value, unit);
    const readings = history[member.entityId]?.map((reading) => ({
      t: reading.t,
      v: reading.v === undefined ? undefined : toScale(kind, reading.v, unit),
    }));
    return {
      entityId: member.entityId,
      name: member.name,
      value,
      scaled,
      unit,
      delta: seriesDelta(readings, now, TREND_WINDOW_MS[kind], scaled),
      rise: kind === 'humidity' ? recentRise(readings, now, SHOWER_WINDOW_MS, scaled) : undefined,
    };
  });
  const unit = items.find((item) => item.unit)?.unit ?? defaultUnit(kind);
  const comfort = comfortRange(kind, config.comfort, unit);
  const isGroup = isGroupBadge(config, ids.length);
  const known = items.filter((item) => item.scaled !== undefined);
  const scaledOf = (item: ClimateItem) => item.scaled as number;
  const display: ClimateDisplay = config.aggregate ?? (isGroup ? GROUP_DISPLAY[kind] : 'mean');
  // The worse air is always the higher CO₂, even inside the comfort range.
  const badness = (item: ClimateItem) =>
    kind === 'co2' ? scaledOf(item) : comfortDistance(scaledOf(item), comfort);
  const worst = known.reduce<ClimateItem | undefined>(
    (best, item) => (!best || badness(item) > badness(best) ? item : best),
    undefined,
  );
  const model: ClimateModel = {
    name:
      config.name ??
      (config.entity
        ? friendlyName(hass, config.entity)
        : localize(hass, `climate_title_${kind}` as StringKey)),
    kind,
    isGroup,
    items,
    unit,
    comfort,
    display,
    worst,
    rise: known.reduce<number | undefined>(
      (top, item) => (item.rise === undefined ? top : Math.max(top ?? item.rise, item.rise)),
      undefined,
    ),
    watched: watchedIds(config, ids),
  };
  if (!known.length) return model;
  if (display === 'range') {
    model.low = known.reduce((a, b) => (scaledOf(b) < scaledOf(a) ? b : a));
    model.high = known.reduce((a, b) => (scaledOf(b) > scaledOf(a) ? b : a));
    return model;
  }
  const values = known.map(scaledOf);
  model.scaled = aggregate(values, display);
  if (display === 'min' || display === 'max') {
    const holder = known.find((item) => item.scaled === model.scaled);
    model.delta = holder?.delta;
  } else {
    const deltas = known.flatMap((item) => (item.delta === undefined ? [] : [item.delta]));
    model.delta = deltas.length ? aggregate(deltas, display === 'sum' ? 'sum' : 'mean') : undefined;
  }
  return model;
}

/* ---------------------------------- look --------------------------------- */

/** Color and halo strength (0–1) of a value in scale units. */
export function climateLook(
  kind: ClimateKind,
  scaled: number,
  comfort: ComfortRange,
): { color: Rgb; halo: number } {
  return { color: climateColor(kind, scaled), halo: climateHalo(kind, scaled, comfort) };
}

/**
 * The disc filled with the exact color of the value (opaque), white ink
 * (`iconOn` picks dark ink for very light colors; the badge turns it white
 * unless `icon_color: auto`), and a halo only outside the comfort range.
 */
export function climateTone(colors: readonly Rgb[], halo: number, haloColor?: Rgb): ChipTone {
  const first = colors[0] ?? [150, 150, 150];
  const last = colors[colors.length - 1] ?? first;
  const background =
    colors.length > 1
      ? `linear-gradient(90deg, ${rgbCss(first)} 50%, ${rgbCss(last)} 50%)`
      : rgbCss(first);
  return {
    background,
    iconColor: iconOn(meanColor(colors)),
    shadow: halo > 0 ? glowShadow([haloColor ?? first], halo) : 'none',
  };
}

export interface ClimateStatus {
  /** Disc colors: one, or the coldest and the warmest (range). */
  colors: Rgb[];
  /** Halo strength 0–1. */
  halo: number;
  haloColor: Rgb;
  pulse: boolean;
  trend?: 'up' | 'down';
  /** CO₂ only. */
  level?: AirLevel;
  /** The pressure fell fast: storm or strong wind likely. */
  dropAlert: boolean;
  shower: boolean;
}

/** Everything the badge draws from a model; `undefined` when nothing can be read. */
export function climateStatus(
  model: ClimateModel,
  config: Pick<ResolvedClimateBadge, 'trend'>,
): ClimateStatus | undefined {
  const { kind, comfort } = model;
  const worst = model.worst?.scaled;
  if (worst === undefined) return undefined;
  const worstLook = climateLook(kind, worst, comfort);
  const trendOn = config.trend;
  const shower = trendOn && kind === 'humidity' && (model.rise ?? 0) > SHOWER_RISE;
  const dropAlert =
    trendOn &&
    kind === 'pressure' &&
    model.delta !== undefined &&
    model.delta < -PRESSURE_DROP_ALERT;
  if (
    model.display === 'range' &&
    model.low?.scaled !== undefined &&
    model.high?.scaled !== undefined
  ) {
    const colors =
      model.low === model.high
        ? [climateColor(kind, model.low.scaled)]
        : [climateColor(kind, model.low.scaled), climateColor(kind, model.high.scaled)];
    return {
      colors,
      halo: worstLook.halo,
      haloColor: worstLook.color,
      pulse: false,
      dropAlert: false,
      shower: false,
    };
  }
  const value = model.scaled ?? worst;
  const look = climateLook(kind, value, comfort);
  const level = kind === 'co2' ? airLevel(value) : undefined;
  return {
    colors: [look.color],
    halo: dropAlert ? 1 : look.halo,
    haloColor: look.color,
    // Far outside comfort, toxic air, or a shower going on.
    pulse: (kind === 'temperature' && look.halo >= 1) || level === 'toxic' || shower,
    trend: trendOn ? trendOf(kind, model.delta) : undefined,
    level,
    dropAlert,
    shower,
  };
}
