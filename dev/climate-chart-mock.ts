/**
 * Simulated climate sensors for the preview pages: five rooms (temperature
 * and humidity), a bathroom with a morning shower, a kitchen with an evening
 * oven, a veranda in °F, a cellar that went offline, an attic without
 * history and a living room CO₂ sensor. Serves their history and hourly
 * statistics like the recorder, and can wrap another mock's `callWS`.
 */
import type { HassEntity, HomeAssistant } from '../src/core/hass-types';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

interface Profile {
  name: string;
  unit: string;
  device_class: string;
  /** Value at the coolest moment of the day. */
  base: number;
  /** Daily swing (peak to trough). */
  swing: number;
  /** Local hour of the daily peak. */
  peak: number;
  /** Short events: local hour, height, rise and decay (hours). */
  events?: [number, number, number, number][];
  noise: number;
  /** Offline since that many hours ago. */
  offlineFor?: number;
  /** No recorder history at all. */
  noHistory?: boolean;
  /** No long-term statistics (no state_class). */
  noStatistics?: boolean;
  digits: number;
}

export const CLIMATE_PROFILES: Record<string, Profile> = {
  'sensor.sdb_temperature': {
    name: 'Salle de bain',
    unit: '°C',
    device_class: 'temperature',
    base: 18.1,
    swing: 2.2,
    peak: 18,
    events: [[7.6, 4.2, 0.25, 1.1]],
    noise: 0.08,
    digits: 1,
  },
  'sensor.sdb_humidite': {
    name: 'Salle de bain',
    unit: '%',
    device_class: 'humidity',
    base: 54,
    swing: 5,
    peak: 4,
    events: [
      [7.6, 32, 0.2, 0.9],
      [21.5, 14, 0.2, 0.7],
    ],
    noise: 0.6,
    digits: 0,
  },
  'sensor.chambre_temperature': {
    name: 'Chambre',
    unit: '°C',
    device_class: 'temperature',
    base: 16.1,
    swing: 1.8,
    peak: 16,
    noise: 0.05,
    digits: 1,
  },
  'sensor.salon_temperature': {
    name: 'Salon',
    unit: '°C',
    device_class: 'temperature',
    base: 20.3,
    swing: 2.4,
    peak: 19,
    events: [[19.2, 0.6, 0.5, 1.5]],
    noise: 0.06,
    digits: 1,
  },
  'sensor.bureau_temperature': {
    name: 'Bureau',
    unit: '°C',
    device_class: 'temperature',
    base: 20,
    swing: 1.4,
    peak: 17,
    noise: 0.05,
    digits: 1,
  },
  'sensor.cuisine_temperature': {
    name: 'Cuisine',
    unit: '°C',
    device_class: 'temperature',
    base: 20.2,
    swing: 1,
    peak: 14,
    events: [
      [19.3, 2.6, 0.4, 1.2],
      [12.4, 1.2, 0.3, 0.8],
    ],
    noise: 0.06,
    digits: 1,
  },
  'sensor.chambre_humidite': {
    name: 'Chambre',
    unit: '%',
    device_class: 'humidity',
    base: 44,
    swing: 6,
    peak: 7,
    noise: 0.5,
    digits: 0,
  },
  'sensor.salon_humidite': {
    name: 'Salon',
    unit: '%',
    device_class: 'humidity',
    base: 38,
    swing: 5,
    peak: 20,
    noise: 0.5,
    digits: 0,
  },
  'sensor.bureau_humidite': {
    name: 'Bureau',
    unit: '%',
    device_class: 'humidity',
    base: 41,
    swing: 4,
    peak: 10,
    noise: 0.5,
    digits: 0,
  },
  'sensor.cuisine_humidite': {
    name: 'Cuisine',
    unit: '%',
    device_class: 'humidity',
    base: 47,
    swing: 4,
    peak: 13,
    events: [[19.5, 12, 0.4, 1]],
    noise: 0.5,
    digits: 0,
  },
  'sensor.cave_humidite': {
    name: 'Cave',
    unit: '%',
    device_class: 'humidity',
    base: 70,
    swing: 3,
    peak: 6,
    noise: 0.5,
    offlineFor: 5,
    digits: 0,
  },
  'sensor.veranda_temperature': {
    name: 'Véranda',
    unit: '°F',
    device_class: 'temperature',
    base: 61,
    swing: 19,
    peak: 15,
    noise: 0.3,
    digits: 1,
  },
  'sensor.cave_temperature': {
    name: 'Cave',
    unit: '°C',
    device_class: 'temperature',
    base: 13.5,
    swing: 0.6,
    peak: 18,
    noise: 0.04,
    offlineFor: 5,
    digits: 1,
  },
  'sensor.grenier_temperature': {
    name: 'Grenier',
    unit: '°C',
    device_class: 'temperature',
    base: 21,
    swing: 3,
    peak: 16,
    noise: 0.1,
    noHistory: true,
    noStatistics: true,
    digits: 1,
  },
  'sensor.salon_co2': {
    name: 'Salon',
    unit: 'ppm',
    device_class: 'carbon_dioxide',
    base: 520,
    swing: 380,
    peak: 22,
    events: [[20.5, 450, 1.2, 1.5]],
    noise: 15,
    digits: 0,
  },
};

/** Deterministic noise in [-1, 1]. */
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/** Hours since the local `hour` today (wrapped to [0, 24)). */
function hoursSince(time: number, hour: number): number {
  const date = new Date(time);
  const local = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  return (((local - hour) % 24) + 24) % 24;
}

/** Simulated value of a sensor at `time`. */
export function climateValue(entityId: string, time: number): number | undefined {
  const profile = CLIMATE_PROFILES[entityId];
  if (!profile) return undefined;
  if (profile.offlineFor !== undefined && time > Date.now() - profile.offlineFor * HOUR) {
    return undefined;
  }
  const phase = (hoursSince(time, profile.peak) / 24) * 2 * Math.PI;
  let value = profile.base + (profile.swing * (1 + Math.cos(phase))) / 2;
  // Weekly drift so the long ranges are not a flat repetition.
  value += profile.swing * 0.35 * Math.sin(time / (3.3 * DAY) + entityId.length);
  for (const [hour, height, rise, decay] of profile.events ?? []) {
    const since = hoursSince(time, hour);
    const before = 24 - since;
    if (before < rise) value += height * (1 - before / rise);
    else if (since < decay * 4) value += height * Math.exp(-since / decay);
  }
  value += profile.noise * noise(Math.floor(time / 600_000) + entityId.length * 7);
  const scale = 10 ** profile.digits;
  return Math.round(value * scale) / scale;
}

export function climateStates(now = Date.now()): Record<string, HassEntity> {
  const states: Record<string, HassEntity> = {};
  for (const [entityId, profile] of Object.entries(CLIMATE_PROFILES)) {
    const value = climateValue(entityId, now);
    const changed = new Date(
      profile.offlineFor ? now - profile.offlineFor * HOUR : now - 120_000,
    ).toISOString();
    states[entityId] = {
      entity_id: entityId,
      state: value === undefined ? 'unavailable' : String(value),
      attributes: {
        friendly_name: profile.name,
        unit_of_measurement: profile.unit,
        device_class: profile.device_class,
        ...(profile.noStatistics ? {} : { state_class: 'measurement' }),
      },
      last_changed: changed,
      last_updated: changed,
    };
  }
  return states;
}

/** `history/history_during_period` for the climate sensors (a reading every 5 min, on change). */
export function climateHistory(
  entityIds: readonly string[],
  start: number,
  end: number,
): Record<string, { s: string; lu: number }[]> {
  const result: Record<string, { s: string; lu: number }[]> = {};
  for (const entityId of entityIds) {
    const profile = CLIMATE_PROFILES[entityId];
    if (!profile || profile.noHistory) continue;
    const points: { s: string; lu: number }[] = [];
    let previous: string | undefined;
    const first = Math.ceil(start / 300_000) * 300_000;
    for (let time = first; time <= end; time += 300_000) {
      const value = climateValue(entityId, time);
      const state = value === undefined ? 'unavailable' : String(value);
      if (state === previous) continue;
      previous = state;
      points.push({ s: state, lu: Math.max(time, start) / 1000 });
    }
    if (points[0]) points[0].lu = start / 1000;
    result[entityId] = points;
  }
  return result;
}

/** `recorder/statistics_during_period` (hourly mean, min and max). */
export function climateStatistics(
  entityIds: readonly string[],
  start: number,
  end: number,
): Record<string, { start: number; end: number; mean: number; min: number; max: number }[]> {
  const result: Record<
    string,
    { start: number; end: number; mean: number; min: number; max: number }[]
  > = {};
  for (const entityId of entityIds) {
    const profile = CLIMATE_PROFILES[entityId];
    if (!profile || profile.noStatistics) continue;
    const rows = [];
    for (let hour = Math.ceil(start / HOUR) * HOUR; hour + HOUR <= end; hour += HOUR) {
      const values: number[] = [];
      for (let time = hour; time < hour + HOUR; time += 300_000) {
        const value = climateValue(entityId, time);
        if (value !== undefined) values.push(value);
      }
      if (!values.length) continue;
      rows.push({
        start: hour,
        end: hour + HOUR,
        mean: values.reduce((sum, value) => sum + value, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      });
    }
    result[entityId] = rows;
  }
  return result;
}

/**
 * Wraps a `callWS` so the climate sensors get their history and statistics;
 * every other entity goes to `fallback`.
 */
export function withClimateHistory(
  fallback: HomeAssistant['callWS'],
): NonNullable<HomeAssistant['callWS']> {
  return async <T>(message: Record<string, unknown>): Promise<T> => {
    const start = Date.parse(String(message.start_time));
    const end = Date.parse(String(message.end_time));
    const ids =
      ((message.entity_ids ?? message.statistic_ids) as string[] | undefined) ?? ([] as string[]);
    const ours = ids.filter((id) => id in CLIMATE_PROFILES);
    const others = ids.filter((id) => !(id in CLIMATE_PROFILES));
    const rest =
      others.length && fallback
        ? await fallback<Record<string, unknown>>({
            ...message,
            ...(message.entity_ids ? { entity_ids: others } : { statistic_ids: others }),
          })
        : {};
    // A little latency, like the real websocket.
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (message.type === 'recorder/statistics_during_period') {
      return { ...rest, ...climateStatistics(ours, start, end) } as T;
    }
    if (message.type === 'history/history_during_period') {
      return { ...rest, ...climateHistory(ours, start, end) } as T;
    }
    if (!fallback) throw new Error('unsupported');
    return fallback<T>(message);
  };
}

/** A standalone Home Assistant with the climate sensors only. */
export function createClimateHass(language: string, dark = true): HomeAssistant {
  return {
    states: climateStates(),
    entities: {},
    devices: {},
    language,
    locale: { language },
    themes: { darkMode: dark },
    config: { time_zone: 'Europe/Paris' },
    callService: async () => undefined,
    callWS: withClimateHistory(undefined),
  } as unknown as HomeAssistant;
}
