import type { HomeAssistant } from './hass-types';

/** Compressed state of `history/history_during_period` (times in seconds). */
interface CompressedState {
  s: string;
  lu?: number;
  lc?: number;
}

/** A reading: time in milliseconds and a value, `undefined` while unavailable. */
export interface Reading {
  t: number;
  v: number | undefined;
}

/** Readings per entity, oldest first. */
export type HistorySeries = Record<string, Reading[]>;

/** Fetches the state history of `entityIds` between `start` and `end` (ms). */
export async function fetchHistory(
  hass: HomeAssistant,
  entityIds: readonly string[],
  start: number,
  end: number,
): Promise<HistorySeries> {
  if (!hass.callWS || entityIds.length === 0) return {};
  const result = await hass.callWS<Record<string, CompressedState[]>>({
    type: 'history/history_during_period',
    start_time: new Date(start).toISOString(),
    end_time: new Date(end).toISOString(),
    entity_ids: [...entityIds],
    minimal_response: true,
    no_attributes: true,
  });
  const series: HistorySeries = {};
  for (const [entityId, states] of Object.entries(result ?? {})) {
    series[entityId] = states
      .map((state) => {
        const seconds = state.lu ?? state.lc;
        const value = Number.parseFloat(state.s);
        return {
          t: seconds === undefined ? Number.NaN : seconds * 1000,
          v: Number.isFinite(value) ? value : undefined,
        };
      })
      .filter((reading) => Number.isFinite(reading.t))
      .sort((a, b) => a.t - b.t);
  }
  return series;
}

/** Value of a step series at `time`: the last reading at or before it. */
export function valueAt(readings: readonly Reading[], time: number): number | undefined {
  let value: number | undefined;
  for (const reading of readings) {
    if (reading.t > time) break;
    value = reading.v;
  }
  return value;
}

/**
 * Average of a step series over `buckets` equal slices of [start, end).
 * Unknown stretches count as missing, not as zero; a slice with no known value
 * is `undefined`.
 */
export function resample(
  readings: readonly Reading[],
  start: number,
  end: number,
  buckets: number,
): (number | undefined)[] {
  const width = (end - start) / buckets;
  return Array.from({ length: buckets }, (_, index) => {
    const from = start + index * width;
    const to = from + width;
    const { energy, known } = integrate(readings, from, to);
    return known > 0 ? energy / known : undefined;
  });
}

/** Integral (value × ms) of a step series over [from, to), and the known duration. */
function integrate(
  readings: readonly Reading[],
  from: number,
  to: number,
): { energy: number; known: number } {
  let energy = 0;
  let known = 0;
  let current = valueAt(readings, from);
  let cursor = from;
  for (const reading of readings) {
    if (reading.t <= from) continue;
    if (reading.t >= to) break;
    if (current !== undefined) {
      energy += current * (reading.t - cursor);
      known += reading.t - cursor;
    }
    current = reading.v;
    cursor = reading.t;
  }
  if (current !== undefined) {
    energy += current * (to - cursor);
    known += to - cursor;
  }
  return { energy, known };
}

/** Energy in watt-hours of a power series (W) over [from, to). */
export function energyWh(readings: readonly Reading[], from: number, to: number): number {
  return integrate(readings, from, to).energy / 3_600_000;
}

/** Scales every known value, e.g. mA × V / 1000 to get watts. */
export function scaleReadings(readings: readonly Reading[], factor: number): Reading[] {
  return readings.map((reading) => ({
    t: reading.t,
    v: reading.v === undefined ? undefined : reading.v * factor,
  }));
}

/** Start of the current day, in the browser's time zone. */
export function startOfDay(now: number): number {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** One period of `recorder/statistics_during_period` (times in ms). */
interface StatisticValue {
  start: number;
  end: number;
  mean?: number | null;
}

/**
 * Hourly mean of `entityIds` between `start` and `end` (ms), from the long-term
 * statistics: light even over weeks. Entities without statistics (no
 * `state_class`) are missing from the result. Each period becomes a step that
 * ends with the period; gaps stay unknown.
 */
export async function fetchStatistics(
  hass: HomeAssistant,
  entityIds: readonly string[],
  start: number,
  end: number,
): Promise<HistorySeries> {
  if (!hass.callWS || entityIds.length === 0) return {};
  const result = await hass.callWS<Record<string, StatisticValue[]>>({
    type: 'recorder/statistics_during_period',
    start_time: new Date(start).toISOString(),
    end_time: new Date(end).toISOString(),
    statistic_ids: [...entityIds],
    period: 'hour',
    types: ['mean'],
  });
  const series: HistorySeries = {};
  for (const [entityId, values] of Object.entries(result ?? {})) {
    const readings: Reading[] = [];
    const sorted = [...values].sort((a, b) => a.start - b.start);
    sorted.forEach((value, index) => {
      const mean =
        typeof value.mean === 'number' && Number.isFinite(value.mean) ? value.mean : undefined;
      readings.push({ t: value.start, v: mean });
      const next = sorted[index + 1];
      if (!next || next.start > value.end) readings.push({ t: value.end, v: undefined });
    });
    series[entityId] = readings;
  }
  return series;
}

/** Keeps the readings before `time` and closes them there, to append a newer series. */
export function cutBefore(readings: readonly Reading[], time: number): Reading[] {
  const kept = readings.filter((reading) => reading.t < time);
  return kept.length ? [...kept, { t: time, v: undefined }] : [];
}
