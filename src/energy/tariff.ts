/**
 * Electricity tariff: prices, off-peak hours, subscription, billing day and the
 * invoices already received. Pure functions, no Home Assistant access.
 */

/** A daily time range in minutes since midnight; `to` below `from` crosses midnight. */
export interface TimeRange {
  from: number;
  to: number;
}

/** An invoice already received, to show its real amounts. */
export interface Invoice {
  /** First day, YYYY-MM-DD. */
  from: string;
  /** Last day included, YYYY-MM-DD. */
  to: string;
  /** Amount paid, taxes and subscription included. */
  total: number;
  /** Energy in peak and off-peak hours, when the invoice splits it. */
  peakKwh?: number;
  offPeakKwh?: number;
  /** Energy when the invoice does not split it. */
  kwh?: number;
  /** Subscription part of `total`. */
  subscription?: number;
}

export interface Tariff {
  /** Price of a kWh in peak hours, or of every kWh without off-peak hours. */
  peak: number;
  /** Price of a kWh in off-peak hours. */
  offPeak?: number;
  /** Off-peak hours; empty for a single-price contract. */
  offPeakRanges: TimeRange[];
  /** Subscription per month, taxes included. */
  subscription: number;
  /** Day of the month a billing cycle starts on (1–28). */
  billingDay: number;
  invoices: Invoice[];
}

/** Tariff options as written in YAML. */
export interface TariffConfig {
  peak?: number;
  off_peak?: number;
  off_peak_hours?: string[];
  subscription?: number;
  billing_day?: number;
  invoices?: {
    from?: string;
    to?: string;
    total?: number;
    peak_kwh?: number;
    off_peak_kwh?: number;
    kwh?: number;
    subscription?: number;
  }[];
}

const DAY_MINUTES = 24 * 60;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** "00:36-05:36" → minutes; undefined when malformed. */
export function parseRange(text: string): TimeRange | undefined {
  const match = /^\s*(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})\s*$/.exec(text);
  if (!match) return undefined;
  const [h1, m1, h2, m2] = match.slice(1).map(Number) as [number, number, number, number];
  if (h1 > 24 || h2 > 24 || m1 > 59 || m2 > 59) return undefined;
  const from = h1 * 60 + m1;
  const to = h2 * 60 + m2;
  if (from > DAY_MINUTES || to > DAY_MINUTES || from === to) return undefined;
  return { from, to };
}

/** Writes a range back as "00:36–05:36". */
export function formatRange(range: TimeRange): string {
  const clock = (minutes: number) =>
    `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  return `${clock(range.from)}–${clock(range.to)}`;
}

/** The parts of a range inside one day, as [from, to) with from < to. */
function spans(range: TimeRange): [number, number][] {
  return range.from < range.to
    ? [[range.from, range.to]]
    : [
        [range.from, DAY_MINUTES],
        [0, range.to],
      ];
}

/** Minutes of [start, end) (minutes since midnight, end ≤ 1440) inside the off-peak ranges. */
export function offPeakMinutes(ranges: readonly TimeRange[], start: number, end: number): number {
  let total = 0;
  for (const range of ranges) {
    for (const [from, to] of spans(range)) {
      total += Math.max(0, Math.min(end, to) - Math.max(start, from));
    }
  }
  return Math.min(total, end - start);
}

/** Share (0–1) of the hour starting at `minute` (since midnight) in off-peak hours. */
export function offPeakShareOfHour(ranges: readonly TimeRange[], minute: number): number {
  return offPeakMinutes(ranges, minute, minute + 60) / 60;
}

/** Share (0–1) of a whole day in off-peak hours: 8 h of off-peak is 1/3. */
export function offPeakShareOfDay(ranges: readonly TimeRange[]): number {
  return offPeakMinutes(ranges, 0, DAY_MINUTES) / DAY_MINUTES;
}

export function isOffPeak(ranges: readonly TimeRange[], minute: number): boolean {
  return offPeakMinutes(ranges, minute, minute + 1) > 0;
}

/** The tariff period around a moment: off-peak or not, since when and until when. */
export interface TariffPeriod {
  offPeak: boolean;
  start: number;
  end: number;
}

function minuteOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

/**
 * The period containing `now` (ms): off-peak or peak, with its bounds in ms.
 * Undefined for a single-price contract.
 */
export function periodAt(ranges: readonly TimeRange[], now: number): TariffPeriod | undefined {
  if (!ranges.length) return undefined;
  const offPeak = isOffPeak(ranges, minuteOfDay(new Date(now)));
  const step = 60_000;
  const limit = 2 * DAY_MINUTES;
  const sameAt = (time: number) => isOffPeak(ranges, minuteOfDay(new Date(time))) === offPeak;
  let start = Math.floor(now / step) * step;
  for (let i = 0; i < limit && sameAt(start - step); i++) start -= step;
  let end = Math.floor(now / step) * step + step;
  for (let i = 0; i < limit && sameAt(end); i++) end += step;
  return { offPeak, start, end };
}

/** Subscription per day, taxes included. */
export function dailySubscription(tariff: Pick<Tariff, 'subscription'>): number {
  return (tariff.subscription * 12) / 365;
}

/** Price of the energy split in peak and off-peak hours. */
export function energyCost(tariff: Tariff, peakKwh: number, offPeakKwh: number): number {
  return peakKwh * tariff.peak + offPeakKwh * (tariff.offPeak ?? tariff.peak);
}

/**
 * Reads the YAML options. `fail` throws with the card's prefix. Prices are per
 * kWh, taxes included; the subscription is per month, taxes included.
 */
export function resolveTariff(raw: unknown, fail: (message: string) => never): Tariff {
  if (raw === undefined || raw === null)
    fail('set "tariff" with at least "peak" (price of a kWh).');
  if (typeof raw !== 'object' || Array.isArray(raw)) fail('"tariff" must be a set of options.');
  const config = raw as Record<string, unknown>;
  const price = (field: string, required: boolean): number | undefined => {
    const value = config[field];
    if (value === undefined || value === null || value === '') {
      if (required) fail(`"tariff.${field}" is required (price of a kWh, taxes included).`);
      return undefined;
    }
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || number > 10) {
      fail(`"tariff.${field}" must be a price per kWh, from 0 to 10.`);
    }
    return number;
  };
  const peak = price('peak', true) as number;
  const offPeak = price('off_peak', false);
  const hours = config.off_peak_hours;
  const offPeakRanges: TimeRange[] = [];
  if (hours !== undefined && hours !== null) {
    if (!Array.isArray(hours)) fail('"tariff.off_peak_hours" must be a list like ["22:00-06:00"].');
    for (const item of hours) {
      const range = typeof item === 'string' ? parseRange(item) : undefined;
      if (!range) fail(`"tariff.off_peak_hours": "${String(item)}" must look like "22:00-06:00".`);
      offPeakRanges.push(range);
    }
  }
  if (offPeakRanges.length && offPeak === undefined) {
    fail('"tariff.off_peak" is required with "off_peak_hours".');
  }
  const subscriptionRaw = config.subscription;
  const subscription =
    subscriptionRaw === undefined || subscriptionRaw === null || subscriptionRaw === ''
      ? 0
      : Number(subscriptionRaw);
  if (!Number.isFinite(subscription) || subscription < 0) {
    fail('"tariff.subscription" must be the monthly subscription, taxes included.');
  }
  const dayRaw = config.billing_day;
  const billingDay = dayRaw === undefined || dayRaw === null || dayRaw === '' ? 1 : Number(dayRaw);
  if (!Number.isInteger(billingDay) || billingDay < 1 || billingDay > 28) {
    fail('"tariff.billing_day" must be a day of the month from 1 to 28.');
  }
  const invoices: Invoice[] = [];
  const list = config.invoices;
  if (list !== undefined && list !== null) {
    if (!Array.isArray(list)) fail('"tariff.invoices" must be a list.');
    list.forEach((item, index) => {
      const entry = (item ?? {}) as Record<string, unknown>;
      const where = `"tariff.invoices[${index}]"`;
      const from = String(entry.from ?? '');
      const to = String(entry.to ?? '');
      if (!DATE.test(from) || !DATE.test(to) || to < from) {
        fail(`${where} needs "from" and "to" dates like 2026-09-12, "to" after "from".`);
      }
      const total = Number(entry.total);
      if (!Number.isFinite(total) || total < 0) fail(`${where} needs "total", the amount paid.`);
      const optional = (field: string) => {
        const value = entry[field];
        if (value === undefined || value === null || value === '') return undefined;
        const number = Number(value);
        if (!Number.isFinite(number) || number < 0) fail(`${where}: "${field}" must be a number.`);
        return number;
      };
      invoices.push({
        from,
        to,
        total,
        peakKwh: optional('peak_kwh'),
        offPeakKwh: optional('off_peak_kwh'),
        kwh: optional('kwh'),
        subscription: optional('subscription'),
      });
    });
    invoices.sort((a, b) => a.from.localeCompare(b.from));
  }
  return { peak, offPeak, offPeakRanges, subscription, billingDay, invoices };
}
