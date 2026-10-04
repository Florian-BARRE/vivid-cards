import { describe, expect, it } from 'vitest';
import { DEFAULT_SCALE, normalizeHash, resolveConfig } from '../src/cards/led-group/config';

const base = { type: 'custom:vivid-led-group', entity: 'light.salon_leds' };

describe('resolveConfig', () => {
  it('applies defaults', () => {
    const config = resolveConfig(base);
    expect(config).toMatchObject({
      entity: 'light.salon_leds',
      icon: 'mdi:led-strip-variant',
      showPower: true,
      showLiveOverride: true,
      showEffects: true,
      showHue: true,
      scale: DEFAULT_SCALE,
    });
    expect(config.detailsHash).toBeUndefined();
    expect(config.members.size).toBe(0);
  });

  it('requires a light entity', () => {
    expect(() => resolveConfig({ type: base.type })).toThrow(/set "entity"/);
    expect(() => resolveConfig({ ...base, entity: 'switch.salon' })).toThrow(/not a light/);
  });

  it('reads power options and member overrides', () => {
    const config = resolveConfig({
      ...base,
      details_hash: 'salon-leds',
      power: {
        sensor_pattern: 'sensor.{object_id}_puissance',
        voltage: 5,
        max: 30,
        steps: [8, 20],
      },
      members: [{ entity: 'light.salon_buffet_wled', name: 'Sideboard', hidden: false }],
    });
    expect(config.detailsHash).toBe('#salon-leds');
    expect(config.power).toEqual({ sensor_pattern: 'sensor.{object_id}_puissance', voltage: 5 });
    expect(config.scale).toEqual({ idle: 3, max: 30, steps: [8, 20] });
    expect(config.members.get('light.salon_buffet_wled')?.name).toBe('Sideboard');
  });

  it('rejects invalid values with a readable message', () => {
    expect(() => resolveConfig({ ...base, power: { max: -1 } })).toThrow(/power.max/);
    expect(() => resolveConfig({ ...base, power: { steps: [30, 10] } })).toThrow(/ascending/);
    expect(() => resolveConfig({ ...base, show_hue: 'yes' })).toThrow(/show_hue/);
    expect(() => resolveConfig({ ...base, members: [{}] })).toThrow(/"entity"/);
  });
});

describe('normalizeHash', () => {
  it('accepts several spellings', () => {
    expect(normalizeHash('salon-leds')).toBe('#salon-leds');
    expect(normalizeHash('#salon-leds')).toBe('#salon-leds');
    expect(normalizeHash('#/salon_leds')).toBe('#salon_leds');
    expect(normalizeHash('  ')).toBeUndefined();
    expect(() => normalizeHash('#salon leds')).toThrow(/details_hash/);
  });
});
