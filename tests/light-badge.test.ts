import { describe, expect, it } from 'vitest';
import { GROUP_ID, LAMPS_GROUP_ID, SPOTS_GROUP_ID, createMockHass } from '../dev/mock-hass';
import { resolveLightBadgeConfig } from '../src/badges/light/config';
import { buildLightBadgeModel } from '../src/badges/light/model';
import { iconOn, lightTone, luminance } from '../src/core/glow';

const config = (extra: Record<string, unknown> = {}) =>
  resolveLightBadgeConfig({ type: 'custom:vivid-light-badge', entity: GROUP_ID, ...extra });

describe('light badge config', () => {
  it('fills the defaults', () => {
    expect(config()).toMatchObject({
      entity: GROUP_ID,
      showCount: true,
      glow: 100,
      glowBoost: 100,
      look: 'disc',
      layout: 'list',
      tapAction: { action: 'toggle' },
      holdAction: { action: 'details' },
    });
  });

  it('accepts actions written as text', () => {
    expect(config({ tap_action: 'more-info', hold_action: 'none' })).toMatchObject({
      tapAction: { action: 'more-info' },
      holdAction: { action: 'none' },
    });
  });

  it('rejects what it cannot use', () => {
    expect(() => config({ entity: 'switch.salon' })).toThrow(/not a light/);
    expect(() => config({ entity: undefined })).toThrow(/set "entity"/);
    expect(() => config({ glow: 'huge' })).toThrow(/glow/);
    expect(() => config({ look: 'neon' })).toThrow(/look/);
    expect(() => config({ layout: 'grid' })).toThrow(/layout/);
    expect(() => config({ transition: -1 })).toThrow(/transition/);
    expect(() => config({ show_count: 'yes' })).toThrow(/show_count/);
    expect(() => config({ tap_action: 'explode' })).toThrow(/unknown action/);
  });
});

describe('light badge model', () => {
  it('counts the lights on out of the reachable ones', () => {
    const { hass } = createMockHass();
    const model = buildLightBadgeModel(hass, config());
    // The ambilight strip is offline in the mock: it is not counted.
    expect(model.isGroup).toBe(true);
    expect(model.lights).toHaveLength(3);
    expect(model.total).toBe(2);
    expect(model.on).toBe(2);
    expect(model.colors).toHaveLength(2);
    expect(model.brightness).toBeGreaterThan(0);
  });

  it('counts every light when all are online', () => {
    const { hass } = createMockHass('en', { allOnline: true });
    expect(buildLightBadgeModel(hass, config()).total).toBe(3);
  });

  it('uses the crossed-out LED strip icon for WLED groups', () => {
    const { hass } = createMockHass();
    const model = buildLightBadgeModel(hass, config());
    expect(model.icon).toBe('mdi:led-strip-variant');
    expect(model.iconOff).toBe('mdi:led-strip-variant-off');
    expect(model.strike).toBe(false);
  });

  it('strikes an icon without a crossed-out variant', () => {
    const { hass } = createMockHass();
    const model = buildLightBadgeModel(hass, config({ entity: LAMPS_GROUP_ID }));
    expect(model.icon).toBe('mdi:lamps');
    expect(model.iconOff).toBe('mdi:lamps');
    expect(model.strike).toBe(true);
    expect([model.on, model.total]).toEqual([1, 3]);
  });

  it('follows the configured icons', () => {
    const { hass } = createMockHass();
    const model = buildLightBadgeModel(
      hass,
      config({ entity: SPOTS_GROUP_ID, icon: 'mdi:lightbulb-group', icon_off: 'mdi:sleep' }),
    );
    expect(model.icon).toBe('mdi:lightbulb-group');
    expect(model.iconOff).toBe('mdi:sleep');
    expect(model.strike).toBe(false);
    const auto = buildLightBadgeModel(
      hass,
      config({ entity: SPOTS_GROUP_ID, icon: 'mdi:lightbulb-group' }),
    );
    expect(auto.iconOff).toBe('mdi:lightbulb-group-off');
  });

  it('treats a single light as a group of one', () => {
    const { hass } = createMockHass();
    const model = buildLightBadgeModel(hass, config({ entity: 'light.salon_buffet_wled' }));
    expect(model.isGroup).toBe(false);
    expect(model.lights.map((light) => light.entityId)).toEqual(['light.salon_buffet_wled']);
    expect(model.icon).toBe('mdi:led-strip-variant');
  });

  it('shortens the names of the lights', () => {
    const { hass } = createMockHass();
    const model = buildLightBadgeModel(hass, config({ entity: LAMPS_GROUP_ID }));
    expect(model.lights.map((light) => light.name)).toEqual([
      'Lampe Canapé',
      'Lampe Lecture',
      'Lampadaire',
    ]);
  });

  it('turns the whole group off, then on, through the group entity', async () => {
    const mock = createMockHass();
    const off = buildLightBadgeModel(mock.hass, config({ entity: LAMPS_GROUP_ID }));
    expect(off.on).toBeGreaterThan(0);
    await mock.hass.callService('light', 'turn_off', {}, { entity_id: LAMPS_GROUP_ID });
    expect(buildLightBadgeModel(mock.hass, config({ entity: LAMPS_GROUP_ID })).on).toBe(0);
    await mock.hass.callService('light', 'turn_on', {}, { entity_id: LAMPS_GROUP_ID });
    expect(buildLightBadgeModel(mock.hass, config({ entity: LAMPS_GROUP_ID })).on).toBe(3);
  });
});

describe('ink on light colors', () => {
  it('keeps white ink on saturated colors and goes dark on light ones', () => {
    expect(luminance([255, 255, 255])).toBeCloseTo(1);
    expect(iconOn([255, 138, 61])).toBe('#ffffff');
    expect(iconOn([138, 43, 226])).toBe('#ffffff');
    expect(iconOn([255, 255, 255])).not.toBe('#ffffff');
    expect(iconOn([255, 214, 170])).not.toBe('#ffffff');
    expect(lightTone([255, 255, 255], true).iconColor).not.toBe('#ffffff');
  });
});

describe('light badge halo and white lights', () => {
  it('reads the halo strength and boost', () => {
    expect(config({ glow: 'soft', glow_boost: 0 })).toMatchObject({ glow: 50, glowBoost: 0 });
    expect(config({ glow: 140 })).toMatchObject({ glow: 140 });
    expect(() => config({ glow: 300 })).toThrow(/glow/);
    expect(() => config({ glow_boost: 300 })).toThrow(/glow_boost/);
  });

  it('shows warm white lamps in amber and keeps the LED colors', () => {
    const { hass } = createMockHass();
    const lamps = buildLightBadgeModel(hass, config({ entity: LAMPS_GROUP_ID }));
    expect(lamps.white).toBe(true);
    expect(lamps.colors).toEqual([[255, 193, 7]]);
    const leds = buildLightBadgeModel(hass, config());
    expect(leds.white).toBe(false);
    expect(leds.lights.every((light) => !light.white)).toBe(true);
  });
});
