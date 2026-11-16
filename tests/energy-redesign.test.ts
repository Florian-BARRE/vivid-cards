import { describe, expect, it } from 'vitest';
import { resolveBillCard } from '../src/cards/bill/config';
import { resolveEnergyCalendar } from '../src/cards/energy-calendar/config';
import { flowLeaves, resolvePeriodCard } from '../src/cards/energy-flow/model';
import { barSegments } from '../src/energy/bill-history';
import { DEVICE_COLORS, deviceColor } from '../src/energy/device-colors';
import type { DeviceRow } from '../src/energy/views';

const TARIFF = { peak: 0.2, subscription: 16, billing_day: 12 };
const row = (stat: string, kwh: number, children: DeviceRow[] = []): DeviceRow => ({
  stat,
  name: stat,
  kwh,
  cost: 0,
  children,
});

describe('electricity options', () => {
  it('reads the bill layouts and its history', () => {
    const bill = (extra: Record<string, unknown>) =>
      resolveBillCard({ type: 'custom:vivid-bill-card', tariff: TARIFF, ...extra });
    expect(bill({})).toMatchObject({ layout: 'card', history: true });
    expect(bill({ layout: 'ring', history: false })).toMatchObject({
      layout: 'ring',
      history: false,
    });
    expect(() => bill({ layout: 'donut' })).toThrow(/layout/);
    expect(() => bill({ history: 'yes' })).toThrow(/history/);
  });

  it('reads the calendar and flow views', () => {
    const base = { tariff: TARIFF };
    expect(resolveEnergyCalendar({ type: 'x', ...base }).show).toBe('month');
    expect(resolveEnergyCalendar({ type: 'x', ...base, show: 'day' }).show).toBe('day');
    expect(resolvePeriodCard('vivid-energy-flow', { ...base }).view).toBe('flow');
    expect(resolvePeriodCard('vivid-energy-flow', { ...base, view: 'list' }).view).toBe('list');
    expect(() => resolvePeriodCard('vivid-energy-flow', { ...base, view: 'pie' })).toThrow(/view/);
  });
});

describe('where the energy goes', () => {
  it('splits each room into its devices, or keeps it whole', () => {
    const salon = row('salon', 7, [row('salon_led', 3), row('salon_light', 3.9)]);
    const bath = row('sdb', 1.5);
    const leaves = flowLeaves([salon, bath]);
    expect(leaves.map((leaf) => leaf.row.stat)).toEqual(['salon_led', 'salon_light', 'sdb']);
    expect(leaves.every((leaf) => leaf.room === salon || leaf.room === bath)).toBe(true);
  });

  it('keeps what a room measures beyond its devices on a band of its own', () => {
    const salon = row('salon', 10, [row('salon_led', 4)]);
    const leaves = flowLeaves([salon]);
    expect(leaves.map((leaf) => [leaf.row.stat, leaf.row.kwh])).toEqual([
      ['salon_led', 4],
      ['salon:rest', 6],
    ]);
  });

  it('gives each consumer a color of its own, the same every time', () => {
    expect(deviceColor('sensor.vivid_pilot_salon_energy')).toEqual(
      deviceColor('sensor.vivid_pilot_salon_energy'),
    );
    expect(DEVICE_COLORS).toContainEqual(deviceColor('anything'));
  });
});

describe('previous cycles', () => {
  it('stacks a closed bill by part, and the one in progress with what is to come', () => {
    const closed = barSegments({
      start: '2026-09-12',
      end: '2026-10-12',
      kind: 'invoice',
      total: 80,
      peak: 50,
      offPeak: 14,
      subscription: 16,
    });
    expect(closed.map((part) => part.cls)).toEqual(['peak', 'off-peak', 'subscription']);
    const current = barSegments(
      { start: '2026-11-12', end: '2026-12-12', kind: 'current', total: 100, subscription: 16 },
      30,
    );
    expect(current).toEqual([
      { cls: 'rest', value: 54 },
      { cls: 'spent', value: 30 },
      { cls: 'subscription', value: 16 },
    ]);
  });
});
