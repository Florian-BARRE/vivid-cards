import { fetchHistory } from '../core/history';
import type { HomeAssistant } from '../core/hass-types';
import type { ClimateRange } from './vivid-climate-chart';
import { DAY, HOUR, RANGE_SPECS, type ClimateSample } from './climate-chart-model';

/** Samples per entity, oldest first. */
export type ClimateSeries = Record<string, ClimateSample[]>;

/** One period of `recorder/statistics_during_period` (times in ms). */
interface StatisticValue {
  start: number;
  end: number;
  mean?: number | null;
  min?: number | null;
  max?: number | null;
}

const finite = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

/**
 * Hourly mean, min and max of `entityIds` from the long-term statistics. Each
 * hour becomes a sample in its middle; a missing hour leaves a gap. Entities
 * without statistics (no `state_class`) are missing from the result.
 */
export async function fetchClimateStatistics(
  hass: HomeAssistant,
  entityIds: readonly string[],
  start: number,
  end: number,
): Promise<ClimateSeries> {
  if (!hass.callWS || entityIds.length === 0) return {};
  const result = await hass.callWS<Record<string, StatisticValue[]>>({
    type: 'recorder/statistics_during_period',
    start_time: new Date(start).toISOString(),
    end_time: new Date(end).toISOString(),
    statistic_ids: [...entityIds],
    period: 'hour',
    types: ['mean', 'min', 'max'],
  });
  const series: ClimateSeries = {};
  for (const [entityId, values] of Object.entries(result ?? {})) {
    const sorted = [...values].sort((a, b) => a.start - b.start);
    const samples: ClimateSample[] = [];
    sorted.forEach((value, index) => {
      const mean = finite(value.mean);
      const sample: ClimateSample = { t: (value.start + value.end) / 2, v: mean };
      if (mean !== undefined) {
        sample.min = finite(value.min) ?? mean;
        sample.max = finite(value.max) ?? mean;
      }
      samples.push(sample);
      const next = sorted[index + 1];
      if (next && next.start > value.end) samples.push({ t: value.end, v: undefined });
    });
    series[entityId] = samples;
  }
  return series;
}

/**
 * Data of a range, wide enough for the comparison with the day before:
 * 6 h and 24 h come from the history (last 25 hours), 7 and 30 days from the
 * hourly statistics, completed by the history for the hours not compiled yet
 * (and for sensors without statistics).
 */
export async function loadClimateSeries(
  hass: HomeAssistant,
  entityIds: readonly string[],
  range: ClimateRange,
  now: number,
): Promise<ClimateSeries> {
  const spec = RANGE_SPECS[range];
  if (!spec.statistics) return fetchHistory(hass, entityIds, now - DAY - HOUR, now);
  const start = now - spec.hours * HOUR - HOUR;
  const recent = now - 3 * HOUR;
  const [statistics, history] = await Promise.all([
    fetchClimateStatistics(hass, entityIds, start, now),
    fetchHistory(hass, entityIds, recent, now),
  ]);
  const missing = entityIds.filter((id) => !statistics[id]?.some((s) => s.v !== undefined));
  const fallback = missing.length ? await fetchHistory(hass, missing, start, now) : {};
  const series: ClimateSeries = {};
  for (const id of entityIds) {
    const full = fallback[id];
    series[id] = full ?? [
      ...(statistics[id] ?? []).filter((sample) => sample.t < recent),
      ...(history[id] ?? []),
    ];
  }
  return series;
}
