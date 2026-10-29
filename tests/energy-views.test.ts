import { describe, expect, it } from 'vitest';
import { addDays, buildDays, dateStart, type Change } from '../src/energy/days';
import { resolveTariff, type Tariff } from '../src/energy/tariff';
import {
  billRing,
  billView,
  calendarMonth,
  curveDates,
  devicesView,
  loadCurve,
  offPeakRing,
  periodRange,
  recentDays,
} from '../src/energy/views';
import { shownDevices, spreadLabels } from '../src/cards/energy-flow/model';
import { powerCost, resolvePowerBadge } from '../src/badges/power/model';

const fail = (message: string): never => {
  throw new Error(message);
};

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

/** 10 kWh a day from 1 September to 28 October, priced at 0.168. */
function flatDays(): ReturnType<typeof buildDays> {
  const energy: Change[] = [];
  const cost: Change[] = [];
  for (let index = 0; index < 58; index++) {
    const start = dateStart(addDays('2026-09-01', index));
    energy.push({ start, change: 10 });
    cost.push({ start, change: 1.68 });
  }
  return buildDays(energy, cost, undefined, TARIFF);
}

describe('energy views', () => {
  it('summarizes the bill', () => {
    const view = billView(flatDays(), TARIFF, '2026-10-29');
    expect(view.cycle.start).toBe('2026-10-12');
    expect(view.pace).toBeCloseTo(1.68);
    expect(view.previous?.projected).toBe(79.52);
    expect(view.delta).toBeCloseTo(view.cycle.projected / 79.52 - 1);
    expect(view.lastDay?.date).toBe('2026-10-28');
  });

  it('colors the last days against their mean', () => {
    const days = flatDays();
    days[days.length - 1]!.kwh = 20;
    const recent = recentDays(days, TARIFF, '2026-10-29', 7);
    expect(recent.days).toHaveLength(7);
    expect(recent.last?.ratio).toBeGreaterThan(1.5);
  });

  it('lays out a month, Monday first', () => {
    const month = calendarMonth(flatDays(), TARIFF, 2026, 10, '2026-10-29');
    // 1 October 2026 is a Thursday.
    expect(month.lead).toBe(3);
    expect(month.cells).toHaveLength(31);
    expect(month.dataDays).toBe(28);
    expect(month.cells[28]?.today).toBe(true);
    expect(month.cells[0]?.ratio).toBeCloseTo(1);
    expect(month.total).toBeCloseTo(28 * (1.68 + (16.58 * 12) / 365), 2);
  });

  it('splits the last invoice in rings', () => {
    const ring = billRing(flatDays(), TARIFF, '2026-10-29', 'last')!;
    expect(ring.bar.start).toBe('2026-09-12');
    expect(ring.total).toBeCloseTo(79.52, 2);
    expect(ring.money.map((part) => part.key)).toEqual(['peak', 'off_peak', 'subscription']);
    const offPeak = offPeakRing(flatDays(), TARIFF, '2026-10-29', 'last')!;
    expect(offPeak.kwhShare).toBeCloseTo(91 / 376);
    expect(offPeak.moneyShare).toBeLessThan(offPeak.kwhShare);
    // The current cycle has no hourly data: no split to show.
    expect(offPeakRing(flatDays(), TARIFF, '2026-10-29', 'current')).toBeUndefined();
    const current = billRing(flatDays(), TARIFF, '2026-10-29', 'current')!;
    expect(current.money.map((part) => part.key)).toEqual(['energy', 'subscription']);
    expect(current.total).toBeCloseTo(17 * (1.68 + (16.58 * 12) / 365), 2);
  });

  it('ends the periods with the last day of the meter', () => {
    expect(periodRange('day', '2026-10-29', '2026-10-28')).toEqual({
      from: '2026-10-28',
      to: '2026-10-29',
    });
    expect(periodRange('week', '2026-10-29', '2026-10-28')).toEqual({
      from: '2026-10-22',
      to: '2026-10-29',
    });
    expect(periodRange('month', '2026-10-29', '2026-10-27')).toEqual({
      from: '2026-10-01',
      to: '2026-10-28',
    });
    expect(periodRange('year', '2026-10-29', undefined)).toEqual({
      from: '2026-01-01',
      to: '2026-10-29',
    });
  });

  it('ranks the devices and nests the included ones', () => {
    const daily = (kwh: number): Change[] => [{ start: dateStart('2026-10-20'), change: kwh }];
    const view = devicesView(
      flatDays(),
      [
        { stat: 'sensor.plug', name: 'Plug', daily: daily(3), kwh: 3 },
        { stat: 'sensor.strip', name: 'Strip', includedIn: 'sensor.plug', daily: daily(2), kwh: 2 },
        { stat: 'sensor.lamp', daily: daily(1), kwh: 1 },
      ],
      TARIFF,
      '2026-10-01',
      '2026-10-29',
      (stat) => stat.toUpperCase(),
    );
    expect(view.kwh).toBeCloseTo(280);
    expect(view.price).toBeCloseTo(0.168);
    expect(view.rows.map((row) => row.name)).toEqual(['Plug', 'SENSOR.LAMP']);
    expect(view.rows[0]?.children.map((row) => row.name)).toEqual(['Strip']);
    expect(view.tracked).toBeCloseTo(4);
    expect(view.untracked).toBeCloseTo(276);
    const shown = shownDevices(view.rows, 1, 'Others');
    expect(shown).toHaveLength(1);
    expect(shown[0]?.kwh).toBeCloseTo(4);
  });

  it('spreads labels', () => {
    expect(spreadLabels([10, 12, 14], 30, 0, 200)).toEqual([10, 40, 70]);
    expect(spreadLabels([190, 195], 30, 0, 200)).toEqual([170, 200]);
  });

  it('reads an hourly curve', () => {
    const start = dateStart('2026-10-28');
    const hours: Change[] = Array.from({ length: 24 }, (_, hour) => ({
      start: start + hour * 3_600_000,
      change: hour === 19 ? 2 : 0.3,
    }));
    expect(curveDates(hours)).toEqual(['2026-10-28']);
    expect(curveDates([{ start, change: 20 }])).toEqual([]);
    const curve = loadCurve(hours, TARIFF, '2026-10-28')!;
    expect(curve.peakKwh + curve.offPeakKwh).toBeCloseTo(0.3 * 23 + 2);
    expect(curve.offPeakKwh).toBeCloseTo(0.3 * 8);
    expect(curve.standbyWatts).toBeCloseTo(300);
  });

  it('prices a power', () => {
    expect(() => resolvePowerBadge({ entity: 'sensor.power', cost: 'month' })).toThrow(/tariff/);
    const config = resolvePowerBadge({
      entity: 'sensor.power',
      cost: 'month',
      tariff: { peak: 0.2 },
    });
    expect(powerCost(100, config.tariff!, 'month', Date.now())).toBeCloseTo(0.1 * 720 * 0.2);
    const evening = new Date(2026, 9, 29, 15, 0).getTime();
    expect(powerCost(1000, TARIFF, 'hour', evening)).toBeCloseTo(0.1344);
    expect(powerCost(1000, TARIFF, 'month', evening)).toBeCloseTo(
      720 * (0.1787 * (2 / 3) + 0.1344 / 3),
    );
  });
});
