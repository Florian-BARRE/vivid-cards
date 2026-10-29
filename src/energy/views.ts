/**
 * What each energy card and badge shows, computed from the energy data.
 * Pure functions, tested without a browser.
 */
import {
  billHistory,
  currentCycle,
  previousCycle,
  FAST_RATE_DAYS,
  type BillBar,
  type CycleSummary,
} from './cycle';
import type { DeviceEnergy } from './data';
import {
  addDays,
  dateKey,
  dayTotal,
  energyCostOf,
  isSplit,
  recentRate,
  totals,
  type Change,
  type DayRecord,
} from './days';
import { median } from './format';
import { dailySubscription, offPeakShareOfHour, type Tariff } from './tariff';

/* ---------------------------------- bill ---------------------------------- */

export interface BillView {
  tariff: Tariff;
  cycle: CycleSummary;
  previous?: CycleSummary;
  /** Projected amount against the previous bill (0.25 = +25 %). */
  delta?: number;
  /** Energy cost per day over the last days, subscription excluded. */
  pace: number;
  /** The same, subscription included: what a day costs at this pace. */
  dailyCost: number;
  /** The last day with data. */
  lastDay?: { date: string; kwh: number; cost: number };
}

export function billView(days: readonly DayRecord[], tariff: Tariff, today: string): BillView {
  const cycle = currentCycle(days, tariff, today);
  const previous = previousCycle(days, tariff, today);
  const known = days.filter((day) => day.date < today);
  const last = known.at(-1);
  return {
    tariff,
    cycle,
    previous,
    delta:
      previous && previous.projected > 0 ? cycle.projected / previous.projected - 1 : undefined,
    pace: recentRate(known, tariff, FAST_RATE_DAYS),
    dailyCost: recentRate(known, tariff, FAST_RATE_DAYS) + dailySubscription(tariff),
    lastDay: last ? { date: last.date, kwh: last.kwh, cost: dayTotal(last, tariff) } : undefined,
  };
}

/* ------------------------------ recent days ------------------------------- */

export interface RecentDay {
  date: string;
  kwh: number;
  cost: number;
  /** kWh against the mean of the days shown. */
  ratio: number;
}

export interface RecentView {
  days: RecentDay[];
  meanKwh: number;
  last?: RecentDay;
}

/** The last `count` days with data, before today. */
export function recentDays(
  days: readonly DayRecord[],
  tariff: Tariff,
  today: string,
  count = 7,
): RecentView {
  const recent = days.filter((day) => day.date < today).slice(-count);
  const meanKwh = recent.length ? recent.reduce((sum, day) => sum + day.kwh, 0) / recent.length : 0;
  const list = recent.map((day) => ({
    date: day.date,
    kwh: day.kwh,
    cost: dayTotal(day, tariff),
    ratio: meanKwh > 0 ? day.kwh / meanKwh : 1,
  }));
  return { days: list, meanKwh, last: list.at(-1) };
}

/* -------------------------------- calendar -------------------------------- */

export interface CalendarCell {
  date: string;
  day: number;
  /** Cost of the day, subscription included; undefined without data. */
  cost?: number;
  kwh?: number;
  /** Off-peak share of the energy, when the day came hour by hour. */
  offPeakShare?: number;
  /** Cost against the usual day (the median of the days read). */
  ratio?: number;
  today: boolean;
  future: boolean;
}

export interface CalendarMonth {
  year: number;
  month: number;
  /** Empty cells before the first day, Monday first. */
  lead: number;
  cells: CalendarCell[];
  total: number;
  kwh: number;
  dataDays: number;
}

/** Days before a month that also set what a usual day costs. */
export const CALENDAR_REFERENCE_DAYS = 30;

/** Days of a month, colored against the median day of the month and the 30 days before. */
export function calendarMonth(
  days: readonly DayRecord[],
  tariff: Tariff,
  year: number,
  month: number,
  today: string,
): CalendarMonth {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const first = new Date(year, month - 1, 1, 12);
  const length = new Date(year, month, 0, 12).getDate();
  // A usual day: the median of the month and the 30 days before it.
  const firstKey = dateKey(first.getTime());
  const from = addDays(firstKey, -CALENDAR_REFERENCE_DAYS);
  const to = addDays(firstKey, length);
  const usual = median(
    days
      .filter((day) => day.date >= from && day.date < to && day.date < today)
      .map((day) => dayTotal(day, tariff)),
  );
  const cells: CalendarCell[] = [];
  let total = 0;
  let kwh = 0;
  let dataDays = 0;
  for (let day = 1; day <= length; day++) {
    const date = dateKey(new Date(year, month - 1, day, 12).getTime());
    const record = byDate.get(date);
    const cell: CalendarCell = { date, day, today: date === today, future: date > today };
    if (record) {
      cell.cost = dayTotal(record, tariff);
      cell.kwh = record.kwh;
      if (isSplit(record) && record.kwh > 0)
        cell.offPeakShare = (record.offPeakKwh ?? 0) / record.kwh;
      cell.ratio = usual > 0 ? cell.cost / usual : 1;
      total += cell.cost;
      kwh += record.kwh;
      dataDays += 1;
    }
    cells.push(cell);
  }
  return { year, month, lead: (first.getDay() + 6) % 7, cells, total, kwh, dataDays };
}

/* ---------------------------------- rings --------------------------------- */

/** The bill a ring shows: the last closed one (an invoice when there is one), or the current one. */
export function ringBill(bars: readonly BillBar[], which: 'last' | 'current'): BillBar | undefined {
  if (which === 'current') return bars.find((bar) => bar.kind === 'current');
  return [...bars].reverse().find((bar) => bar.kind === 'invoice' || bar.kind === 'computed');
}

export interface RingPart {
  key: 'peak' | 'off_peak' | 'energy' | 'subscription';
  value: number;
}

export interface BillRingView {
  bar: BillBar;
  /** Money: peak, off-peak (or energy when not split), subscription. */
  money: RingPart[];
  /** What the money ring adds to: the bill, or what is spent so far for the current one. */
  total: number;
  kwh?: number;
  /** kWh split, for the inner ring. */
  peakKwh?: number;
  offPeakKwh?: number;
}

/**
 * The money ring of a bill. For the current cycle it shows what is spent so
 * far: the subscription of the days elapsed and the energy of the days read.
 */
export function billRing(
  days: readonly DayRecord[],
  tariff: Tariff,
  today: string,
  which: 'last' | 'current',
): BillRingView | undefined {
  const bars = billHistory(days, tariff, today, 24);
  const bar = ringBill(bars, which);
  if (!bar) return undefined;
  const inCycle = days.filter((day) => day.date >= bar.start && day.date < bar.end);
  const sums = totals(inCycle, tariff);
  const view: BillRingView = { bar, money: [], total: 0, kwh: bar.kwh };
  if (bar.kind === 'current') {
    const subscription = dailySubscription(tariff) * inCycle.length;
    if (sums.splitDays === sums.days && sums.days > 0) {
      const raw = sums.peakKwh * tariff.peak + sums.offPeakKwh * (tariff.offPeak ?? tariff.peak);
      const scale = raw > 0 ? sums.energyCost / raw : 1;
      view.money.push({ key: 'peak', value: sums.peakKwh * tariff.peak * scale });
      view.money.push({
        key: 'off_peak',
        value: sums.offPeakKwh * (tariff.offPeak ?? tariff.peak) * scale,
      });
      view.peakKwh = sums.peakKwh;
      view.offPeakKwh = sums.offPeakKwh;
    } else {
      view.money.push({ key: 'energy', value: sums.energyCost });
    }
    view.money.push({ key: 'subscription', value: subscription });
    view.kwh = sums.kwh;
  } else {
    if (bar.peak !== undefined && bar.offPeak !== undefined) {
      view.money.push({ key: 'peak', value: bar.peak }, { key: 'off_peak', value: bar.offPeak });
    } else {
      view.money.push({ key: 'energy', value: bar.energy ?? 0 });
    }
    view.money.push({ key: 'subscription', value: bar.subscription });
    const invoice = tariff.invoices.find((item) => item.from === bar.start);
    if (invoice?.peakKwh !== undefined && invoice.offPeakKwh !== undefined) {
      view.peakKwh = invoice.peakKwh;
      view.offPeakKwh = invoice.offPeakKwh;
    } else if (sums.splitDays === sums.days && sums.days > 0) {
      view.peakKwh = sums.peakKwh;
      view.offPeakKwh = sums.offPeakKwh;
    }
  }
  view.total = view.money.reduce((sum, part) => sum + part.value, 0);
  return view;
}

export interface OffPeakRingView {
  start: string;
  end: string;
  kind: BillBar['kind'];
  peakKwh: number;
  offPeakKwh: number;
  /** Shares (0–1) of the kWh and of the energy money in off-peak hours. */
  kwhShare: number;
  moneyShare: number;
  peakCost: number;
  offPeakCost: number;
}

/** The peak / off-peak split of a bill, when it is known. */
export function offPeakRing(
  days: readonly DayRecord[],
  tariff: Tariff,
  today: string,
  which: 'last' | 'current',
): OffPeakRingView | undefined {
  const ring = billRing(days, tariff, today, which);
  if (!ring || ring.peakKwh === undefined || ring.offPeakKwh === undefined) return undefined;
  const kwh = ring.peakKwh + ring.offPeakKwh;
  if (kwh <= 0) return undefined;
  const peakCost =
    ring.money.find((part) => part.key === 'peak')?.value ?? ring.peakKwh * tariff.peak;
  const offPeakCost =
    ring.money.find((part) => part.key === 'off_peak')?.value ??
    ring.offPeakKwh * (tariff.offPeak ?? tariff.peak);
  return {
    start: ring.bar.start,
    end: ring.bar.end,
    kind: ring.bar.kind,
    peakKwh: ring.peakKwh,
    offPeakKwh: ring.offPeakKwh,
    kwhShare: ring.offPeakKwh / kwh,
    moneyShare: peakCost + offPeakCost > 0 ? offPeakCost / (peakCost + offPeakCost) : 0,
    peakCost,
    offPeakCost,
  };
}

/* --------------------------------- devices -------------------------------- */

export type EnergyPeriod = 'day' | 'week' | 'month' | 'year';
export const ENERGY_PERIODS: EnergyPeriod[] = ['day', 'week', 'month', 'year'];

/**
 * Days [from, to) of a period. The meter's data comes the next day, so the
 * day and the week end with the last day it gave; the month and the year are
 * the calendar ones, up to that day.
 */
export function periodRange(
  period: EnergyPeriod,
  today: string,
  lastDate: string | undefined,
): { from: string; to: string } {
  const last = lastDate && lastDate < today ? lastDate : addDays(today, -1);
  const to = addDays(last, 1);
  if (period === 'day') return { from: last, to };
  if (period === 'week') return { from: addDays(last, -6), to };
  if (period === 'month') return { from: `${last.slice(0, 7)}-01`, to };
  return { from: `${last.slice(0, 4)}-01-01`, to };
}

/** Days a period needs read, today included. */
export function periodDays(period: EnergyPeriod, today: string): number {
  const [year, month, day] = today.split('-').map(Number) as [number, number, number];
  if (period === 'day') return 3;
  if (period === 'week') return 9;
  if (period === 'month') return day + 2;
  const start = new Date(year, 0, 1, 12).getTime();
  return Math.round((new Date(year, month - 1, day, 12).getTime() - start) / 86_400_000) + 2;
}

export interface DeviceRow {
  stat: string;
  name: string;
  kwh: number;
  cost: number;
  /** Devices measured inside this one (a strip on a plug). */
  children: DeviceRow[];
}

export interface DevicesView {
  from: string;
  to: string;
  /** Energy and cost of the meter over the period. */
  kwh: number;
  cost: number;
  /** Average price per kWh of the period (the meter's cost over its energy). */
  price: number;
  /** Top-level devices, biggest first; their children inside. */
  rows: DeviceRow[];
  tracked: number;
  untracked: number;
  /** Share (0–1) of the meter's energy measured by the devices. */
  trackedShare: number;
}

function sumRange(changes: readonly Change[], from: string, to: string): number {
  let sum = 0;
  for (const item of changes) {
    const key = dateKey(item.start);
    if (key >= from && key < to) sum += Math.max(0, item.change);
  }
  return sum;
}

/** The devices of the Energy dashboard over a period, priced at its average price. */
export function devicesView(
  days: readonly DayRecord[],
  devices: readonly DeviceEnergy[],
  tariff: Tariff,
  from: string,
  to: string,
  fallbackName: (stat: string) => string,
): DevicesView {
  const inRange = days.filter((day) => day.date >= from && day.date < to);
  const sums = totals(inRange, tariff);
  const price = sums.kwh > 0 ? sums.energyCost / sums.kwh : tariff.peak;
  const rows = new Map<string, DeviceRow>();
  for (const device of devices) {
    const kwh = sumRange(device.daily, from, to);
    rows.set(device.stat, {
      stat: device.stat,
      name: device.name ?? fallbackName(device.stat),
      kwh,
      cost: kwh * price,
      children: [],
    });
  }
  const top: DeviceRow[] = [];
  for (const device of devices) {
    const row = rows.get(device.stat);
    if (!row) continue;
    const parent = device.includedIn ? rows.get(device.includedIn) : undefined;
    if (parent && parent !== row) parent.children.push(row);
    else top.push(row);
  }
  const byEnergy = (a: DeviceRow, b: DeviceRow) => b.kwh - a.kwh;
  top.sort(byEnergy);
  for (const row of top) row.children.sort(byEnergy);
  const tracked = top.reduce((sum, row) => sum + row.kwh, 0);
  return {
    from,
    to,
    kwh: sums.kwh,
    cost: sums.energyCost,
    price,
    rows: top,
    tracked,
    untracked: Math.max(0, sums.kwh - tracked),
    trackedShare: sums.kwh > 0 ? Math.min(1, tracked / sums.kwh) : 0,
  };
}

/* ------------------------------- load curve ------------------------------- */

export interface CurveHour {
  hour: number;
  kwh: number;
  /** Off-peak part of the hour (0–1). */
  offPeakShare: number;
}

export interface CurveView {
  date: string;
  hours: CurveHour[];
  peakKwh: number;
  offPeakKwh: number;
  cost: number;
  /** Lowest steady draw: the mean of the three lowest hours, in watts. */
  standbyWatts: number;
  /** The standby over a year, at the day's average price. */
  standbyYear: number;
}

/** Dates (YYYY-MM-DD) with a full hourly curve: at least 20 hours of data. */
/**
 * Hourly rows a day needs to be drawn hour by hour: fewer means the meter only
 * sends one row a day (or the day is not over), and that row is not an hour.
 */
export const CURVE_MIN_HOURS = 20;

export function curveDates(hourly: readonly Change[]): string[] {
  const counts = new Map<string, number>();
  for (const item of hourly) {
    const key = dateKey(item.start);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= CURVE_MIN_HOURS)
    .map(([key]) => key)
    .sort();
}

export function loadCurve(
  hourly: readonly Change[],
  tariff: Tariff,
  date: string,
): CurveView | undefined {
  const hours: CurveHour[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    kwh: 0,
    offPeakShare: offPeakShareOfHour(tariff.offPeakRanges, hour * 60),
  }));
  let count = 0;
  for (const item of hourly) {
    if (dateKey(item.start) !== date) continue;
    const hour = new Date(item.start).getHours();
    const slot = hours[hour];
    if (!slot) continue;
    slot.kwh += Math.max(0, item.change);
    count += 1;
  }
  if (count < CURVE_MIN_HOURS) return undefined;
  let peakKwh = 0;
  let offPeakKwh = 0;
  for (const slot of hours) {
    offPeakKwh += slot.kwh * slot.offPeakShare;
    peakKwh += slot.kwh * (1 - slot.offPeakShare);
  }
  const cost = peakKwh * tariff.peak + offPeakKwh * (tariff.offPeak ?? tariff.peak);
  const lowest = hours
    .map((slot) => slot.kwh)
    .filter((kwh) => kwh > 0)
    .sort((a, b) => a - b)
    .slice(0, 3);
  const standbyKw = lowest.length ? lowest.reduce((sum, kwh) => sum + kwh, 0) / lowest.length : 0;
  const total = peakKwh + offPeakKwh;
  const price = total > 0 ? cost / total : tariff.peak;
  return {
    date,
    hours,
    peakKwh,
    offPeakKwh,
    cost,
    standbyWatts: standbyKw * 1000,
    standbyYear: standbyKw * 8760 * price,
  };
}

/** Energy cost of a set of days, subscription excluded. */
export function energyOf(days: readonly DayRecord[], tariff: Tariff): number {
  return days.reduce((sum, day) => sum + energyCostOf(day, tariff), 0);
}

/** The busiest hour of a curve, or undefined when nothing was drawn. */
export function busiestHour(curve: CurveView): { hour: number; kwh: number } | undefined {
  let best: { hour: number; kwh: number } | undefined;
  for (const slot of curve.hours) if (slot.kwh > 0 && (!best || slot.kwh > best.kwh)) best = slot;
  return best ? { hour: best.hour, kwh: best.kwh } : undefined;
}
