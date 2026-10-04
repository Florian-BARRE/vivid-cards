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
