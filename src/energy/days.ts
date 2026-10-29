/**
 * Days of consumption built from long-term statistics: energy, its cost and,
 * when the meter gives hourly data, the split between peak and off-peak hours.
 */
import { dailySubscription, energyCost, offPeakShareOfHour, type Tariff } from './tariff';

/** One period of `recorder/statistics_during_period` with `types: ['change']` (ms). */
export interface Change {
  start: number;
  change: number;
}

export interface DayRecord {
  /** Local date, YYYY-MM-DD. */
  date: string;
  /** Local midnight, ms. */
  start: number;
  kwh: number;
  /** Energy cost from the cost statistic, without the subscription. */
  statCost?: number;
  /** Peak and off-peak energy, known when the day came hour by hour. */
  peakKwh?: number;
  offPeakKwh?: number;
}

/** A day with at least this many hours of data is split into peak and off-peak hours. */
export const HOURLY_DAY_MIN_HOURS = 3;

/** YYYY-MM-DD of a moment, in the browser's time zone. */
export function dateKey(time: number): string {
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Local midnight of a YYYY-MM-DD date. */
export function dateStart(key: string): number {
  const [year, month, day] = key.split('-').map(Number) as [number, number, number];
  return new Date(year, month - 1, day).getTime();
}

/** A date `days` later (or earlier), YYYY-MM-DD. */
export function addDays(key: string, days: number): string {
  const [year, month, day] = key.split('-').map(Number) as [number, number, number];
  return dateKey(new Date(year, month - 1, day + days, 12).getTime());
}

/** Whole days from `from` to `to` (YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  return Math.round((dateStart(to) - dateStart(from)) / 86_400_000);
}

/**
 * Builds one record per day with energy. `daily` and `dailyCost` come from the
 * `day` period, `hourly` from the `hour` period (any range: only full days
 * covered by enough hours get a peak / off-peak split).
 */
export function buildDays(
  daily: readonly Change[],
  dailyCost: readonly Change[] | undefined,
  hourly: readonly Change[] | undefined,
  tariff: Pick<Tariff, 'offPeakRanges'>,
): DayRecord[] {
  const costs = new Map<string, number>();
  for (const item of dailyCost ?? []) {
    if (Number.isFinite(item.change)) costs.set(dateKey(item.start), item.change);
  }
  const split = new Map<string, { peak: number; offPeak: number; hours: number }>();
  if (tariff.offPeakRanges.length) {
    for (const item of hourly ?? []) {
      if (!Number.isFinite(item.change) || item.change <= 0) continue;
      const date = new Date(item.start);
      const key = dateKey(item.start);
      const share = offPeakShareOfHour(
        tariff.offPeakRanges,
        date.getHours() * 60 + date.getMinutes(),
      );
      const entry = split.get(key) ?? { peak: 0, offPeak: 0, hours: 0 };
      entry.offPeak += item.change * share;
      entry.peak += item.change * (1 - share);
      entry.hours += 1;
      split.set(key, entry);
    }
  }
  const days: DayRecord[] = [];
  for (const item of [...daily].sort((a, b) => a.start - b.start)) {
    if (!Number.isFinite(item.change)) continue;
    const date = dateKey(item.start);
    const record: DayRecord = {
      date,
      start: dateStart(date),
      kwh: Math.max(0, item.change),
      statCost: costs.get(date),
    };
    const parts = split.get(date);
    if (parts && parts.hours >= HOURLY_DAY_MIN_HOURS) {
      const total = parts.peak + parts.offPeak;
      // Hourly statistics may be rounded differently: keep the day's total.
      const scale = total > 0 ? record.kwh / total : 0;
      record.peakKwh = parts.peak * scale;
      record.offPeakKwh = parts.offPeak * scale;
    }
    days.push(record);
  }
  return days;
}

/** Whether the day is split into peak and off-peak hours. */
export function isSplit(day: DayRecord): boolean {
  return day.peakKwh !== undefined && day.offPeakKwh !== undefined;
}

/**
 * Cost of the energy of a day, without the subscription: the cost statistic
 * when there is one, else the tariff (split when known, peak price otherwise).
 */
export function energyCostOf(day: DayRecord, tariff: Tariff): number {
  if (day.statCost !== undefined) return day.statCost;
  if (isSplit(day)) return energyCost(tariff, day.peakKwh ?? 0, day.offPeakKwh ?? 0);
  return day.kwh * tariff.peak;
}

/** Cost of a day, subscription included. */
export function dayTotal(day: DayRecord, tariff: Tariff): number {
  return energyCostOf(day, tariff) + dailySubscription(tariff);
}

/** Totals of a set of days. */
export interface DayTotals {
  kwh: number;
  energyCost: number;
  /** Subscription for the days counted. */
  subscription: number;
  total: number;
  /** Peak and off-peak energy of the split days only. */
  peakKwh: number;
  offPeakKwh: number;
  /** Days counted, and how many of them are split. */
  days: number;
  splitDays: number;
}

export function totals(days: readonly DayRecord[], tariff: Tariff): DayTotals {
  const result: DayTotals = {
    kwh: 0,
    energyCost: 0,
    subscription: 0,
    total: 0,
    peakKwh: 0,
    offPeakKwh: 0,
    days: days.length,
    splitDays: 0,
  };
  const fixed = dailySubscription(tariff);
  for (const day of days) {
    result.kwh += day.kwh;
    result.energyCost += energyCostOf(day, tariff);
    result.subscription += fixed;
    if (isSplit(day)) {
      result.peakKwh += day.peakKwh ?? 0;
      result.offPeakKwh += day.offPeakKwh ?? 0;
      result.splitDays += 1;
    }
  }
  result.total = result.energyCost + result.subscription;
  return result;
}

/** Share (0–1) of off-peak energy among the split days, or undefined when none is split. */
export function offPeakShare(totalsOf: DayTotals): number | undefined {
  const split = totalsOf.peakKwh + totalsOf.offPeakKwh;
  return totalsOf.splitDays > 0 && split > 0 ? totalsOf.offPeakKwh / split : undefined;
}

/** Mean energy cost per day over the last `count` days (subscription excluded). */
export function recentRate(days: readonly DayRecord[], tariff: Tariff, count: number): number {
  const recent = days.slice(-count);
  if (!recent.length) return 0;
  return recent.reduce((sum, day) => sum + energyCostOf(day, tariff), 0) / recent.length;
}
