import { describe, expect, it } from 'vitest';
import { createHyperHdrMock } from '../dev/hyperhdr-mock';
import { createMockHass } from '../dev/mock-hass';
import { createClimateHass } from '../dev/climate-chart-mock';
import {
  hyperhdrCamera,
  kindOfSensor,
  powerReadings,
  resolveClimateCard,
  resolveLightCard,
  resolvePowerCard,
  resolveScreenCard,
  seriesSources,
} from '../src/cards/focus/config';

describe('focused cards options', () => {
  it('reads the screen card with its defaults', () => {
    expect(resolveScreenCard({})).toEqual({
      camera: undefined,
      name: undefined,
      onDemand: false,
      timeout: 120,
      glow: 100,
    });
    expect(resolveScreenCard({ camera: 'camera.tv', on_demand: true, timeout: 5 }).timeout).toBe(
      120,
    );
    expect(resolveScreenCard({ camera: 'not an entity' }).camera).toBeUndefined();
  });

  it('needs a light for the light card', () => {
    expect(() => resolveLightCard({})).toThrow();
    const config = resolveLightCard({ entity: 'light.buffet', color_bar: 'rainbow', wled: false });
    expect(config.colorBar).toBe('auto');
    expect(config.wled).toBe(false);
    expect(config.effects).toBe(true);
  });

  it('keeps the climate options that make sense', () => {
    const config = resolveClimateCard({
      entity: 'sensor.sdb_humidite',
      kind: 'wind',
      range: '1y',
      comfort: { low: 60, high: 40 },
    });
    expect(config.kind).toBeUndefined();
    expect(config.range).toBe('24h');
    expect(config.comfort).toBeUndefined();
    expect(resolveClimateCard({ comfort: { low: 40, high: 55 } }).comfort).toEqual({
      low: 40,
      high: 55,
    });
  });

  it('cleans the power entities and price', () => {
    const config = resolvePowerCard({
      entities: ['light.a', 'light.a', { entity: 'sensor.b' }, 'junk'],
      price: -1,
      currency: 'eur',
    });
    expect(config.entities).toEqual(['light.a', 'sensor.b']);
    expect(config.price).toBeUndefined();
    expect(config.currency).toBe('EUR');
  });
});

describe('focused cards lookups', () => {
  it('finds the HyperHDR picture', () => {
    const { hass } = createHyperHdrMock();
    const found = hyperhdrCamera(hass);
    expect(found.camera).toMatch(/^camera\..*captured_picture$/);
    expect(found.server).toBeDefined();
  });

  it('reads the measure from the device class', () => {
    const hass = createClimateHass('en');
    expect(kindOfSensor(hass, 'sensor.sdb_humidite')).toBe('humidity');
    expect(kindOfSensor(hass, 'sensor.sdb_temperature')).toBe('temperature');
    expect(kindOfSensor(hass, undefined)).toBe('temperature');
  });

  it('finds the consumption of WLED strips from their current', () => {
    const { hass } = createMockHass('en', { allOnline: true });
    const config = resolvePowerCard({ entities: ['light.salon_buffet_wled'], voltage: 5 });
    const readings = powerReadings(hass, config);
    expect(readings).toHaveLength(1);
    const [series] = seriesSources(hass, readings);
    expect(series?.factor).toBe(5 / 1000);
    // Without a voltage the estimated current cannot become watts.
    expect(
      powerReadings(hass, resolvePowerCard({ entities: ['light.salon_buffet_wled'] })),
    ).toHaveLength(0);
  });
});
