/**
 * Billing cycles: the cycle in progress with its projection, the previous
 * one, and the history of invoices. Pure functions.
 */
import {
  addDays,
  dateKey,
  daysBetween,
  energyCostOf,
  recentRate,
  totals,
  type DayRecord,
  type DayTotals,
} from './days';
import { dailySubscription, type Invoice, type Tariff } from './tariff';

/** Days of recent consumption the projection follows, and the slower reference. */
export const FAST_RATE_DAYS = 7;
export const SLOW_RATE_DAYS = 30;

/** First day (YYYY-MM-DD) of the billing cycle containing `date`. */
export function cycleStartOf(date: string, billingDay: number): string {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  const start =
    day >= billingDay
      ? new Date(year, month - 1, billingDay, 12)
      : new Date(year, month - 2, billingDay, 12);
  return dateKey(start.getTime());
}

/** First day of the next cycle (the end, excluded). */
export function nextCycleStart(start: string): string {
  const [year, month, day] = start.split('-').map(Number) as [number, number, number];
  return dateKey(new Date(year, month, day, 12).getTime());
}

export interface CycleSummary {
  /** First day and the first day of the next cycle (excluded), YYYY-MM-DD. */
  start: string;
  end: string;
  length: number;
  /** Days with data, and the last of them. */
  dataDays: number;
  lastDate?: string;
  /** Days since the start, today included (1 on the first day). */
  dayIndex: number;
  ended: boolean;
  totals: DayTotals;
  /** Energy and subscription for the days with data. */
  toDate: number;
  /** Estimated amount at the end of the cycle, and its range. */
  projected: number;
  low: number;
  high: number;
  /** Subscription over the whole cycle. */
  subscription: number;
  /** The invoice received for this cycle. */
  invoice?: Invoice;
}

/** An invoice's period as a cycle [start, end). */
function invoiceRange(invoice: Invoice): { start: string; end: string } {
  return { start: invoice.from, end: addDays(invoice.to, 1) };
}

/** Summary of the cycle [start, end) on `today` (YYYY-MM-DD). */
export function summarizeCycle(
  days: readonly DayRecord[],
  tariff: Tariff,
  start: string,
  end: string,
  today: string,
): CycleSummary {
  const inCycle = days.filter((day) => day.date >= start && day.date < end);
  const sums = totals(inCycle, tariff);
  const length = daysBetween(start, end);
  const fixed = dailySubscription(tariff);
  const ended = today >= end;
  const known = days.filter((day) => day.date < today);
  const fast = recentRate(known, tariff, FAST_RATE_DAYS);
  const slow = recentRate(known, tariff, SLOW_RATE_DAYS);
  const remaining = ended ? 0 : Math.max(0, length - inCycle.length);
  const base = sums.energyCost + fixed * length;
  const atFast = base + fast * remaining;
  const atSlow = base + slow * remaining;
  const invoice = tariff.invoices.find((item) => {
    const range = invoiceRange(item);
    return range.start === start && range.end === end;
  });
  const projected = invoice ? invoice.total : atFast;
  return {
    start,
    end,
    length,
    dataDays: inCycle.length,
    lastDate: inCycle.at(-1)?.date,
    dayIndex: Math.min(length, Math.max(0, daysBetween(start, today) + 1)),
    ended,
    totals: sums,
    toDate: sums.total,
    projected,
    low: invoice ? invoice.total : Math.min(atFast, atSlow),
    high: invoice ? invoice.total : Math.max(atFast, atSlow),
    subscription: fixed * length,
    invoice,
  };
}

/** The cycle in progress on `today`. */
export function currentCycle(
  days: readonly DayRecord[],
  tariff: Tariff,
  today: string,
): CycleSummary {
  const start = cycleStartOf(today, tariff.billingDay);
  return summarizeCycle(days, tariff, start, nextCycleStart(start), today);
}

/**
 * The cycle before the current one: its invoice when one covers it, else the
 * cycle computed from the data.
 */
export function previousCycle(
  days: readonly DayRecord[],
  tariff: Tariff,
  today: string,
): CycleSummary | undefined {
  const current = cycleStartOf(today, tariff.billingDay);
  const invoice = [...tariff.invoices].reverse().find((item) => addDays(item.to, 1) === current);
  if (invoice) {
    const range = invoiceRange(invoice);
    return summarizeCycle(days, tariff, range.start, range.end, today);
  }
  const start = cycleStartOf(addDays(current, -1), tariff.billingDay);
  const summary = summarizeCycle(days, tariff, start, current, today);
  return summary.dataDays > 0 ? summary : undefined;
}

/** What one bar of the bill history shows. */
export interface BillBar {
  start: string;
  end: string;
  kind: 'invoice' | 'computed' | 'current' | 'next';
  total: number;
  /** Parts of `total`; `energy` when peak and off-peak are not known. */
  peak?: number;
  offPeak?: number;
  energy?: number;
  subscription: number;
  kwh?: number;
  /** The current cycle: what is already spent, and the range of its end. */
  spent?: number;
  low?: number;
  high?: number;
}

/**
 * Past invoices, cycles computed since the last invoice, the cycle in progress
 * with its projection, and the next one if the recent pace holds.
 */
export function billHistory(
  days: readonly DayRecord[],
  tariff: Tariff,
  today: string,
  count = 6,
): BillBar[] {
  const bars: BillBar[] = [];
  const priceOff = tariff.offPeak ?? tariff.peak;
  for (const invoice of tariff.invoices) {
    const range = invoiceRange(invoice);
    if (range.end > today) continue;
    const subscription =
      invoice.subscription ?? dailySubscription(tariff) * daysBetween(range.start, range.end);
    const bar: BillBar = {
      start: range.start,
      end: range.end,
      kind: 'invoice',
      total: invoice.total,
      subscription,
    };
    if (invoice.peakKwh !== undefined && invoice.offPeakKwh !== undefined) {
      // Taxes per kWh are in the prices: split what is left in proportion to them.
      const rawPeak = invoice.peakKwh * tariff.peak;
      const rawOff = invoice.offPeakKwh * priceOff;
      const energy = Math.max(0, invoice.total - subscription);
      const scale = rawPeak + rawOff > 0 ? energy / (rawPeak + rawOff) : 0;
      bar.peak = rawPeak * scale;
      bar.offPeak = rawOff * scale;
      bar.kwh = invoice.peakKwh + invoice.offPeakKwh;
    } else {
      bar.energy = Math.max(0, invoice.total - subscription);
      bar.kwh = invoice.kwh;
    }
    bars.push(bar);
  }
  const currentStart = cycleStartOf(today, tariff.billingDay);
  const lastInvoiced = bars.at(-1)?.end;
  // Cycles after the last invoice (or since the first data) and before the
  // current one, computed from the data.
  const firstDate = days[0]?.date ?? currentStart;
  let cursor: string;
  if (lastInvoiced) {
    const startOfIt = cycleStartOf(lastInvoiced, tariff.billingDay);
    cursor = startOfIt === lastInvoiced ? lastInvoiced : nextCycleStart(startOfIt);
  } else {
    cursor = cycleStartOf(firstDate, tariff.billingDay);
  }
  while (cursor < currentStart) {
    const end = nextCycleStart(cursor);
    const summary = summarizeCycle(days, tariff, cursor, end, today);
    if (summary.dataDays > 0) bars.push(cycleBar(summary, 'computed', tariff));
    cursor = end;
  }
  const current = summarizeCycle(days, tariff, currentStart, nextCycleStart(currentStart), today);
  bars.push(cycleBar(current, 'current', tariff));
  const nextStart = current.end;
  const nextEnd = nextCycleStart(nextStart);
  const known = days.filter((day) => day.date < today);
  const pace = recentRate(known, tariff, FAST_RATE_DAYS);
  const length = daysBetween(nextStart, nextEnd);
  const subscription = dailySubscription(tariff) * length;
  bars.push({
    start: nextStart,
    end: nextEnd,
    kind: 'next',
    total: pace * length + subscription,
    energy: pace * length,
    subscription,
  });
  return bars.slice(-count);
}

function cycleBar(summary: CycleSummary, kind: 'computed' | 'current', tariff: Tariff): BillBar {
  const sums = summary.totals;
  const bar: BillBar = {
    start: summary.start,
    end: summary.end,
    kind,
    total:
      kind === 'current'
        ? summary.projected
        : sums.energyCost + dailySubscription(tariff) * summary.dataDays,
    subscription:
      kind === 'current' ? summary.subscription : dailySubscription(tariff) * summary.dataDays,
    kwh: sums.kwh,
  };
  if (sums.splitDays === sums.days && sums.days > 0) {
    const priceOff = tariff.offPeak ?? tariff.peak;
    bar.peak = sums.peakKwh * tariff.peak;
    bar.offPeak = sums.offPeakKwh * priceOff;
    // Keep the cost statistic's total when it differs from the tariff a little.
    const scale = bar.peak + bar.offPeak > 0 ? sums.energyCost / (bar.peak + bar.offPeak) : 1;
    bar.peak *= scale;
    bar.offPeak *= scale;
  } else {
    bar.energy = sums.energyCost;
  }
  if (kind === 'current') {
    bar.spent = summary.toDate;
    bar.low = summary.low;
    bar.high = summary.high;
  }
  return bar;
}

/** Energy cost of the days of a cycle, for the cumulative curve. */
export function cumulative(
  days: readonly DayRecord[],
  tariff: Tariff,
  start: string,
  end: string,
): number[] {
  const fixed = dailySubscription(tariff);
  let sum = 0;
  return days
    .filter((day) => day.date >= start && day.date < end)
    .map((day) => (sum += energyCostOf(day, tariff) + fixed));
}
