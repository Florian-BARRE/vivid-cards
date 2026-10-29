import { describe, expect, it } from 'vitest';
import {
  billHistory,
  currentCycle,
  cycleStartOf,
  nextCycleStart,
  previousCycle,
} from '../src/energy/cycle';
import {
  addDays,
  buildDays,
  dateKey,
  dateStart,
  dayTotal,
  daysBetween,
  offPeakShare,
  totals,
  type Change,
} from '../src/energy/days';
import { resolveEnergyBase } from '../src/energy/config';
import { costColor, deltaColor, median } from '../src/energy/format';
import {
  dailySubscription,
  offPeakShareOfDay,
  offPeakShareOfHour,
  parseRange,
  periodAt,
  resolveTariff,
  type Tariff,
} from '../src/energy/tariff';

const fail = (message: string): never => {
  throw new Error(message);
};

/** Flo's contract (Primeo, HP / HC). */
const TARIFF: Tariff = resolveTariff(
  {
    peak: 0.1787,
    off_peak: 0.1344,
    off_peak_hours: ['00:36-05:36', '14:06-17:06'],
    subscription: 16.58,
    billing_day: 12,
    invoices: [
      { from: '2026-09-02', to: '2026-09-11', total: 23.24, kwh: 106 },
      {
        from: '2026-09-12',
        to: '2026-10-11',
        total: 79.52,
        peak_kwh: 285,
        off_peak_kwh: 91,
        subscription: 16.36,
      },
    ],
  },
  fail,
);

/** Daily kWh from Linky, 18 August to 28 October 2026. */
const SERIES = [
  2.1, 10.3, 7.4, 13.2, 12.8, 13.9, 12.5, 13.5, 11.2, 11.5, 13.2, 16.5, 16.1, 13.8, 11.6, 13.4,
  10.5, 8.0, 13.1, 13.4, 13.2, 9.8, 10.4, 14.6, 14.2, 11.1, 9.7, 14.2, 12.5, 9.4, 11.7, 12.6, 11.7,
  15.0, 14.4, 10.4, 14.4, 12.5, 11.3, 14.3, 15.5, 11.1, 9.9, 16.9, 11.0, 14.4, 7.2, 8.6, 15.7, 12.1,
  16.2, 12.4, 12.7, 13.7, 19.2, 13.9, 12.6, 13.6, 12.6, 16.9, 9.0, 19.6, 16.8, 10.1, 16.5, 7.8,
  23.0, 16.7, 20.6, 17.7, 12.9, 20.0,
];
const BLEND = 0.168;

function daily(): { energy: Change[]; cost: Change[] } {
  const energy: Change[] = [];
  const cost: Change[] = [];
  SERIES.forEach((kwh, index) => {
    const start = dateStart(addDays('2026-08-18', index));
    energy.push({ start, change: kwh });
    cost.push({ start, change: kwh * BLEND });
  });
  return { energy, cost };
}

describe('tariff', () => {
  it('parses off-peak hours', () => {
    expect(parseRange('00:36-05:36')).toEqual({ from: 36, to: 336 });
    expect(parseRange('22:00 – 06:00')).toEqual({ from: 1320, to: 360 });
    expect(parseRange('25:00-06:00')).toBeUndefined();
    expect(parseRange('nope')).toBeUndefined();
  });

  it('splits hours and days', () => {
    const ranges = TARIFF.offPeakRanges;
    expect(offPeakShareOfHour(ranges, 0)).toBeCloseTo(24 / 60);
    expect(offPeakShareOfHour(ranges, 60)).toBe(1);
    expect(offPeakShareOfHour(ranges, 5 * 60)).toBeCloseTo(36 / 60);
    expect(offPeakShareOfHour(ranges, 18 * 60)).toBe(0);
    expect(offPeakShareOfDay(ranges)).toBeCloseTo(1 / 3);
    const night = [parseRange('22:00-06:00')!];
    expect(offPeakShareOfHour(night, 23 * 60)).toBe(1);
    expect(offPeakShareOfDay(night)).toBeCloseTo(1 / 3);
  });

  it('finds the current period', () => {
    const now = new Date(2026, 9, 29, 16, 35).getTime();
    const period = periodAt(TARIFF.offPeakRanges, now)!;
    expect(period.offPeak).toBe(true);
    expect(new Date(period.start).getHours()).toBe(14);
    expect(new Date(period.start).getMinutes()).toBe(6);
    expect(new Date(period.end).getHours()).toBe(17);
    expect(new Date(period.end).getMinutes()).toBe(6);
    const evening = periodAt(TARIFF.offPeakRanges, new Date(2026, 9, 29, 18, 0).getTime())!;
    expect(evening.offPeak).toBe(false);
    const end = new Date(evening.end);
    expect([end.getDate(), end.getHours(), end.getMinutes()]).toEqual([30, 0, 36]);
    expect(periodAt([], now)).toBeUndefined();
  });

  it('validates the options', () => {
    expect(() => resolveTariff(undefined, fail)).toThrow(/peak/);
    expect(() => resolveTariff({ peak: 0.2, off_peak_hours: ['22:00-06:00'] }, fail)).toThrow(
      /off_peak/,
    );
    expect(() => resolveTariff({ peak: 0.2, billing_day: 31 }, fail)).toThrow(/billing_day/);
    expect(() =>
      resolveTariff(
        { peak: 0.2, invoices: [{ from: '2026-10-11', to: '2026-09-12', total: 3 }] },
        fail,
      ),
    ).toThrow(/invoices/);
    expect(dailySubscription(TARIFF)).toBeCloseTo(0.5451, 3);
  });

  it('reads the shared options', () => {
    const base = resolveEnergyBase('vivid-bill-card', {
      type: 'custom:vivid-bill-card',
      energy: 'linky:214',
      tariff: { peak: 0.2 },
    });
    expect(base.energy).toBe('linky:214');
    expect(() =>
      resolveEnergyBase('vivid-bill-card', { energy: 'not an id', tariff: { peak: 0.2 } }),
    ).toThrow(/statistic/);
  });
});

describe('days', () => {
  it('handles dates', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(daysBetween('2026-10-12', '2026-11-12')).toBe(31);
    expect(dateKey(dateStart('2026-10-25'))).toBe('2026-10-25');
  });

  it('keeps daily data unsplit and splits hourly data', () => {
    const start = dateStart('2026-10-28');
    const hourly: Change[] = [{ start, change: 20 }];
    const days = buildDays([{ start, change: 20 }], undefined, hourly, TARIFF);
    expect(days[0]?.peakKwh).toBeUndefined();
    const hours: Change[] = Array.from({ length: 24 }, (_, hour) => ({
      start: start + hour * 3_600_000,
      change: 1,
    }));
    const split = buildDays([{ start, change: 24 }], undefined, hours, TARIFF)[0]!;
    expect(split.offPeakKwh).toBeCloseTo(8);
    expect(split.peakKwh).toBeCloseTo(16);
    const sums = totals([split], TARIFF);
    expect(offPeakShare(sums)).toBeCloseTo(1 / 3);
    expect(dayTotal(split, TARIFF)).toBeCloseTo(
      16 * 0.1787 + 8 * 0.1344 + dailySubscription(TARIFF),
    );
  });

  it('prefers the cost statistic', () => {
    const { energy, cost } = daily();
    const days = buildDays(energy, cost, undefined, TARIFF);
    expect(days).toHaveLength(SERIES.length);
    expect(days.at(-1)?.statCost).toBeCloseTo(20 * BLEND);
  });
});

describe('billing cycles', () => {
  it('finds cycle bounds', () => {
    expect(cycleStartOf('2026-10-29', 12)).toBe('2026-10-12');
    expect(cycleStartOf('2026-10-05', 12)).toBe('2026-09-12');
    expect(cycleStartOf('2026-01-03', 12)).toBe('2025-12-12');
    expect(nextCycleStart('2026-10-12')).toBe('2026-11-12');
    expect(nextCycleStart('2026-12-12')).toBe('2027-01-12');
  });

  it('projects the current cycle like the invoice', () => {
    const { energy, cost } = daily();
    const days = buildDays(energy, cost, undefined, TARIFF);
    const cycle = currentCycle(days, TARIFF, '2026-10-29');
    expect(cycle.start).toBe('2026-10-12');
    expect(cycle.end).toBe('2026-11-12');
    expect(cycle.length).toBe(31);
    expect(cycle.dataDays).toBe(17);
    expect(cycle.dayIndex).toBe(18);
    expect(cycle.toDate).toBeCloseTo(52.97, 0);
    expect(cycle.projected).toBeCloseTo(100.5, 0);
    expect(cycle.low).toBeCloseTo(94.4, 0);
    expect(cycle.high).toBeCloseTo(cycle.projected, 6);
    const previous = previousCycle(days, TARIFF, '2026-10-29')!;
    expect(previous.invoice?.total).toBe(79.52);
    expect(previous.projected).toBe(79.52);
  });

  it('builds the bill history', () => {
    const { energy, cost } = daily();
    const days = buildDays(energy, cost, undefined, TARIFF);
    const bars = billHistory(days, TARIFF, '2026-10-29');
    expect(bars.map((bar) => bar.kind)).toEqual(['invoice', 'invoice', 'current', 'next']);
    const invoice = bars[1]!;
    expect(invoice.subscription).toBe(16.36);
    expect((invoice.peak ?? 0) + (invoice.offPeak ?? 0) + invoice.subscription).toBeCloseTo(79.52);
    expect(invoice.peak).toBeCloseTo(50.93, 1);
    expect(invoice.offPeak).toBeCloseTo(12.23, 1);
    const current = bars[2]!;
    expect(current.spent).toBeCloseTo(52.97, 0);
    expect(current.energy).toBeDefined();
    expect(bars[3]!.total).toBeGreaterThan(90);
  });

  it('computes cycles without invoices', () => {
    const { energy, cost } = daily();
    const days = buildDays(energy, cost, undefined, TARIFF);
    const bars = billHistory(days, { ...TARIFF, invoices: [] }, '2026-10-29');
    expect(bars.map((bar) => bar.kind)).toEqual(['computed', 'computed', 'current', 'next']);
    expect(bars[1]!.start).toBe('2026-09-12');
  });
});

describe('energy colors', () => {
  it('colors days and deltas', () => {
    expect(costColor(0.4)).toEqual([38, 198, 218]);
    expect(costColor(1)).toEqual([255, 193, 7]);
    expect(costColor(3)).toEqual([239, 83, 80]);
    expect(deltaColor(-0.1)).toEqual([102, 187, 106]);
    expect(deltaColor(0.25)).toEqual([255, 112, 67]);
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });
});
