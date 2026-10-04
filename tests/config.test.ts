import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SCALE,
  migrateConfig,
  normalizeHash,
  resolveConfig,
} from '../src/cards/led-group/config';

const base = { type: 'custom:vivid-led-group', entity: 'light.salon_leds' };

describe('resolveConfig', () => {
  it('applies defaults', () => {
    const config = resolveConfig(base);
    expect(config.icon).toBeUndefined();
    expect(config).toMatchObject({
      entity: 'light.salon_leds',
      tile: {
        state: 'brightness',
        colorBar: 'auto',
        effects: true,
        tapAction: { action: 'toggle' },
        doubleTapAction: { action: 'none' },
      },
      power: { enabled: true, scale: DEFAULT_SCALE },
      ambilight: { enabled: true },
      details: { sort: 'name', summary: true, effects: true, colorBar: 'auto' },
    });
    expect(config.tile.holdAction).toBeUndefined();
    expect(config.details.enabled).toBeUndefined();
    expect(config.members.size).toBe(0);
  });

  it('requires a light entity', () => {
    expect(() => resolveConfig({ type: base.type })).toThrow(/set "entity"/);
    expect(() => resolveConfig({ ...base, entity: 'switch.salon' })).toThrow(/not a light/);
  });

  it('reads every section', () => {
    const config = resolveConfig({
      ...base,
      tile: { state: 'none', color_bar: 'temperature', hold_action: 'more-info' },
      power: {
        sensor_pattern: 'sensor.{object_id}_puissance',
        voltage: 5,
        max: 30,
        steps: [8, 20],
      },
      ambilight: { enabled: false },
      details: { hash: 'salon-leds', sort: 'group', summary: false, color_bar: 'none' },
      members: [
        {
          entity: 'light.salon_buffet_wled',
          name: 'Sideboard',
          ambilight: false,
          power_mode: 'voltage',
          voltage: 12,
        },
      ],
    });
    expect(config.tile).toMatchObject({
      state: 'none',
      colorBar: 'temperature',
      holdAction: { action: 'more-info' },
    });
    expect(config.power).toEqual({
      enabled: true,
      sensorPattern: 'sensor.{object_id}_puissance',
      voltage: 5,
      scale: { idle: 3, max: 30, steps: [8, 20] },
    });
    expect(config.ambilight.enabled).toBe(false);
    expect(config.details).toMatchObject({
      hash: '#salon-leds',
      sort: 'group',
      summary: false,
      colorBar: 'none',
      effects: true,
    });
    expect(config.members.get('light.salon_buffet_wled')).toMatchObject({
      name: 'Sideboard',
      ambilight: false,
      power_mode: 'voltage',
      voltage: 12,
    });
  });

  it('accepts full Home Assistant actions', () => {
    const config = resolveConfig({
      ...base,
      tile: { double_tap_action: { action: 'navigate', navigation_path: '/lovelace/leds' } },
    });
    expect(config.tile.doubleTapAction).toEqual({
      action: 'navigate',
      navigation_path: '/lovelace/leds',
    });
  });

  it('rejects invalid values with a readable message', () => {
    expect(() => resolveConfig({ ...base, power: { max: -1 } })).toThrow(/power.max/);
    expect(() => resolveConfig({ ...base, power: { steps: [30, 10] } })).toThrow(/ascending/);
    expect(() => resolveConfig({ ...base, tile: { color_bar: 'rainbow' } })).toThrow(
      /tile.color_bar/,
    );
    expect(() => resolveConfig({ ...base, tile: { tap_action: 'explode' } })).toThrow(/unknown/);
    expect(() =>
      resolveConfig({ ...base, members: [{ entity: 'light.a', power_mode: 'x' }] }),
    ).toThrow(/power_mode/);
    expect(() => resolveConfig({ ...base, members: [{}] })).toThrow(/"entity"/);
  });
});

describe('migrateConfig', () => {
  it('moves v0.1 keys into the sections', () => {
    expect(
      migrateConfig({
        ...base,
        show_power: false,
        show_live_override: false,
        show_effects: false,
        show_hue: false,
        details_hash: 'salon-leds-details',
        power: { sensor_pattern: 'sensor.{object_id}_puissance' },
      }),
    ).toEqual({
      ...base,
      tile: { effects: false, color_bar: 'none' },
      power: { enabled: false, sensor_pattern: 'sensor.{object_id}_puissance' },
      ambilight: { enabled: false },
      details: { hash: 'salon-leds-details' },
    });
  });

  it('lets the new sections win over legacy keys', () => {
    const config = resolveConfig({ ...base, show_hue: false, tile: { color_bar: 'hue' } });
    expect(config.tile.colorBar).toBe('hue');
  });
});

describe('normalizeHash', () => {
  it('accepts several spellings', () => {
    expect(normalizeHash('salon-leds')).toBe('#salon-leds');
    expect(normalizeHash('#salon-leds')).toBe('#salon-leds');
    expect(normalizeHash('#/salon_leds')).toBe('#salon_leds');
    expect(normalizeHash('  ')).toBeUndefined();
    expect(() => normalizeHash('#salon leds')).toThrow(/details.hash/);
  });
});
