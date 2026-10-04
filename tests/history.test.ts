import { describe, expect, it } from 'vitest';
import { GROUP_ID, createMockHass } from '../dev/mock-hass';
import { resolveConfig } from '../src/cards/led-group/config';
import { buildLedGroupModel } from '../src/cards/led-group/model';
import { formatCost, formatEnergy } from '../src/components/vivid-power-history';
import {
  energyWh,
  fetchHistory,
  resample,
  scaleReadings,
  startOfDay,
  valueAt,
  type Reading,
} from '../src/core/history';

const HOUR = 3_600_000;

describe('history math', () => {
  const readings: Reading[] = [
    { t: 0, v: 10 },
    { t: HOUR, v: 20 },
    { t: 2 * HOUR, v: undefined },
    { t: 3 * HOUR, v: 40 },
  ];

  it('reads a step series', () => {
    expect(valueAt(readings, -1)).toBeUndefined();
    expect(valueAt(readings, 0)).toBe(10);
    expect(valueAt(readings, 1.5 * HOUR)).toBe(20);
    expect(valueAt(readings, 2.5 * HOUR)).toBeUndefined();
  });

  it('integrates watts into watt-hours, skipping unknown stretches', () => {
    // 10 W for 1 h + 20 W for 1 h + unknown for 1 h + 40 W for 1 h.
    expect(energyWh(readings, 0, 4 * HOUR)).toBeCloseTo(70);
    expect(energyWh(readings, 0.5 * HOUR, 1.5 * HOUR)).toBeCloseTo(15);
    expect(energyWh(readings, -HOUR, 0)).toBe(0);
  });

  it('averages each slice over its known part', () => {
    expect(resample(readings, 0, 4 * HOUR, 4)).toEqual([10, 20, undefined, 40]);
    expect(resample(readings, 0, 2 * HOUR, 1)).toEqual([15]);
  });

  it('scales values and finds the start of the day', () => {
    expect(
      scaleReadings(
        [
          { t: 1, v: 2000 },
          { t: 2, v: undefined },
        ],
        0.005,
      ),
    ).toEqual([
      { t: 1, v: 10 },
      { t: 2, v: undefined },
    ]);
    const noon = new Date(2026, 9, 4, 12, 30).getTime();
    expect(startOfDay(noon)).toBe(new Date(2026, 9, 4).getTime());
  });

  it('formats energy and cost', () => {
    const { hass } = createMockHass('fr');
    expect(formatEnergy(hass, 4.2)).toBe('4,2 Wh');
    expect(formatEnergy(hass, 420)).toBe('420 Wh');
    expect(formatEnergy(hass, 1234)).toBe('1,23 kWh');
    expect(formatCost(hass, 0.105, 'EUR')).toMatch(/^0,1[01]\s€$/);
    expect(formatCost(hass, 1, 'NOPE')).toBe('1.00 NOPE');
  });
});

describe('fetchHistory', () => {
  it('decodes compressed states', async () => {
    const calls: Record<string, unknown>[] = [];
    const hass = {
      ...createMockHass().hass,
      callWS: async <T>(message: Record<string, unknown>) => {
        calls.push(message);
        return {
          'sensor.a': [
            { s: '12.5', lu: 20 },
            { s: 'unavailable', lu: 10 },
          ],
        } as T;
      },
    };
    const series = await fetchHistory(hass, ['sensor.a'], 0, 60_000);
    expect(series['sensor.a']).toEqual([
      { t: 10_000, v: undefined },
      { t: 20_000, v: 12.5 },
    ]);
    expect(calls[0]).toMatchObject({
      type: 'history/history_during_period',
      entity_ids: ['sensor.a'],
      minimal_response: true,
      no_attributes: true,
    });
  });

  it('returns nothing without a websocket or entities', async () => {
    const { hass } = createMockHass();
    expect(await fetchHistory({ ...hass, callWS: undefined }, ['sensor.a'], 0, 1)).toEqual({});
    expect(await fetchHistory(hass, [], 0, 1)).toEqual({});
  });
});

describe('custom order and price', () => {
  it('orders the listed lights first, the others keep the group order', () => {
    const { hass } = createMockHass();
    const model = buildLedGroupModel(
      hass,
      resolveConfig({
        type: 'custom:vivid-led-group',
        entity: GROUP_ID,
        details: { sort: 'custom', order: ['light.salon_canape_wled'] },
      }),
    );
    expect(model.detected.map((strip) => strip.name)).toEqual(['Canape', 'Ambilight', 'Buffet']);
  });

  it('reads the price and validates the currency', () => {
    const config = resolveConfig({
      type: 'custom:vivid-led-group',
      entity: GROUP_ID,
      power: { price: 0.2516, currency: 'chf' },
    });
    expect(config.power).toMatchObject({ price: 0.2516, currency: 'CHF' });
    expect(() =>
      resolveConfig({
        type: 'custom:vivid-led-group',
        entity: GROUP_ID,
        power: { currency: 'euro' },
      }),
    ).toThrow(/currency/);
    expect(() =>
      resolveConfig({
        type: 'custom:vivid-led-group',
        entity: GROUP_ID,
        details: { order: [1] as never },
      }),
    ).toThrow(/order/);
  });
});
