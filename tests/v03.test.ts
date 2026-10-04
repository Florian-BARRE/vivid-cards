import { describe, expect, it } from 'vitest';
import { GROUP_ID, SPOTS_GROUP_ID, createMockHass } from '../dev/mock-hass';
import { resolveConfig, type LedGroupCardConfig } from '../src/cards/led-group/config';
import {
  addBadge,
  addFavorite,
  removeBadge,
  removeFavorite,
  setOption,
} from '../src/cards/led-group/editor-model';
import { buildLedGroupModel } from '../src/cards/led-group/model';
import { snapBrightness } from '../src/components/vivid-light-tile';
import { badgeModel } from '../src/core/badges';
import { formatDuration } from '../src/i18n';
import { findWledEntities, maxWatts, wifiIcon, wledHealth } from '../src/integrations/wled';

const base: LedGroupCardConfig = { type: 'custom:vivid-led-group', entity: GROUP_ID };

describe('v0.3 options', () => {
  it('has sensible defaults', () => {
    const config = resolveConfig(base);
    expect(config.appearance).toEqual({
      glow: 'normal',
      header: true,
      compact: false,
      gradient: true,
      animateEffects: true,
    });
    expect(config.tile).toMatchObject({ favorites: [], brightnessMin: 1, brightnessStep: 1 });
    expect(config.tile.transition).toBeUndefined();
    expect(config.badges).toEqual([]);
    expect(config.details).toMatchObject({ favorites: true, wledControls: true, health: true });
    expect(config.power).toMatchObject({ autoMax: true, autoSteps: true });
  });

  it('reads favorites in every form', () => {
    const config = resolveConfig({
      ...base,
      tile: {
        favorites: [
          '#ff8800',
          [0, 0, 255],
          { kelvin: 2700, brightness: 40 },
          { color: '#00ff00' },
          { rgb: [1, 2, 3], brightness: 100 },
        ],
      },
    });
    expect(config.tile.favorites).toEqual([
      { rgb: [255, 136, 0] },
      { rgb: [0, 0, 255] },
      { kelvin: 2700, brightness: 40 },
      { rgb: [0, 255, 0], brightness: undefined },
      { rgb: [1, 2, 3], brightness: 100 },
    ]);
  });

  it('keeps at most 8 favorites', () => {
    const favorites = Array.from({ length: 12 }, () => '#ffffff');
    expect(resolveConfig({ ...base, tile: { favorites } }).tile.favorites).toHaveLength(8);
  });

  it('rejects invalid values with a readable message', () => {
    expect(() => resolveConfig({ ...base, tile: { favorites: ['nope'] } })).toThrow(/color/);
    expect(() => resolveConfig({ ...base, tile: { favorites: [{ brightness: 10 }] } })).toThrow(
      /kelvin/,
    );
    expect(() =>
      resolveConfig({ ...base, tile: { favorites: [{ kelvin: 3000, brightness: 150 }] } }),
    ).toThrow(/between 1 and 100/);
    expect(() => resolveConfig({ ...base, tile: { brightness_min: 0 } })).toThrow(/1 and 100/);
    expect(() => resolveConfig({ ...base, appearance: { glow: 'huge' as never } })).toThrow(
      /off, soft, normal, strong/,
    );
    expect(() => resolveConfig({ ...base, badges: ['nope'] })).toThrow(/badge/);
    expect(() => resolveConfig({ ...base, power: { colors: ['#fff', '#000'] as never } })).toThrow(
      /three colors/,
    );
  });

  it('reads badges and power colors', () => {
    const config = resolveConfig({
      ...base,
      badges: ['sensor.salon_temperature', { entity: 'binary_sensor.salon_presence', name: 'Là' }],
      power: { colors: ['#00ff00', '#0000ff', '#ff0000'] },
    });
    expect(config.badges).toEqual([
      { entity: 'sensor.salon_temperature' },
      { entity: 'binary_sensor.salon_presence', name: 'Là', icon: undefined },
    ]);
    expect(config.power.scale.colors).toEqual([
      [0, 255, 0],
      [0, 0, 255],
      [255, 0, 0],
    ]);
  });
});

describe('brightness snapping', () => {
  it('keeps 0 as off and applies the minimum and the step', () => {
    expect(snapBrightness(0)).toBe(0);
    expect(snapBrightness(0.4)).toBe(1);
    expect(snapBrightness(3, 10)).toBe(10);
    expect(snapBrightness(47, 1, 5)).toBe(45);
    expect(snapBrightness(48, 1, 5)).toBe(50);
    expect(snapBrightness(99, 1, 25)).toBe(100);
    expect(snapBrightness(2, 1, 25)).toBe(1);
  });
});

describe('automatic glow scale', () => {
  it('uses the WLED current limit × voltage when max is not set', () => {
    const { hass } = createMockHass();
    const model = buildLedGroupModel(
      hass,
      resolveConfig({
        ...base,
        power: { sensor_pattern: 'sensor.{object_id}_puissance', voltage: 5 },
      }),
    );
    const buffet = model.detected.find((strip) => strip.entityId === 'light.salon_buffet_wled');
    // 7000 mA × 5 V = 35 W; the steps follow (10/40 and 25/40 of it).
    expect(buffet?.scale).toMatchObject({ max: 35, steps: [8.75, 21.875] });
    // Every strip has a pattern sensor, so the group adds the three scales up. The offline
    // strip reports no limit and keeps the default 40 W.
    expect(model.groupScale.max).toBe(35 + 35 + 40);
    expect(model.groupScale.idle).toBe(9);
  });

  it('keeps an explicit max and needs a voltage', () => {
    const { hass } = createMockHass();
    const explicit = buildLedGroupModel(
      hass,
      resolveConfig({ ...base, power: { voltage: 5, max: 30 } }),
    );
    expect(explicit.detected.every((strip) => strip.scale.max === 30)).toBe(true);
    const noVoltage = buildLedGroupModel(hass, resolveConfig(base));
    expect(noVoltage.detected.every((strip) => strip.scale.max === 40)).toBe(true);
    const entities = findWledEntities(hass, 'light.salon_buffet_wled');
    expect(maxWatts(hass, entities, undefined)).toBeUndefined();
    expect(maxWatts(hass, entities, 12)).toBe(84);
  });

  it('ignores a disabled limiter', () => {
    const mock = createMockHass();
    mock.setState('sensor.salon_buffet_wled_max_current', '0');
    expect(maxWatts(mock.hass, findWledEntities(mock.hass, 'light.salon_buffet_wled'), 5)).toBe(
      undefined,
    );
  });
});

describe('group colors', () => {
  it('lists the colors of the lit strips for the gradient', () => {
    const { hass } = createMockHass();
    const model = buildLedGroupModel(hass, resolveConfig(base));
    expect(model.colors).toHaveLength(2);
    const plain = buildLedGroupModel(
      hass,
      resolveConfig({ ...base, appearance: { gradient: false } }),
    );
    expect(plain.colors).toEqual([plain.rgb]);
  });

  it('flags running effects', () => {
    const { hass } = createMockHass();
    const model = buildLedGroupModel(hass, resolveConfig(base));
    const byName = Object.fromEntries(model.detected.map((s) => [s.name, s.effectActive]));
    expect(byName).toEqual({ Ambilight: false, Buffet: false, Canape: true });
  });
});

describe('WLED health', () => {
  it('reads the diagnostics of a strip', () => {
    const { hass } = createMockHass();
    const entities = findWledEntities(hass, 'light.salon_buffet_wled');
    const now = Date.parse('2026-10-04T18:00:00Z');
    expect(wledHealth(hass, entities, now)).toEqual({
      signal: 84,
      rssi: -58,
      uptime: 76 * 3600,
      ledCount: 150,
      maxCurrent: 7000,
      freeHeap: 142336,
      ip: '192.168.1.41',
      firmware: '0.14.4',
      latestFirmware: '0.15.1',
      updateAvailable: true,
      updateEntity: 'update.salon_buffet_wled_firmware',
      restartEntity: 'button.salon_buffet_wled_restart',
    });
  });

  it('hides the restart of an offline strip', () => {
    const { hass } = createMockHass();
    const health = wledHealth(hass, findWledEntities(hass, 'light.salon_ambilight_wled'));
    expect(health.restartEntity).toBeUndefined();
    expect(health.signal).toBeUndefined();
  });

  it('prefers the entities of the light’s own segment', () => {
    const mock = createMockHass();
    const hass = mock.hass;
    const device = hass.entities['light.salon_buffet_wled']?.device_id;
    const entities = {
      ...hass.entities,
      'light.salon_buffet_wled_segment_1': {
        entity_id: 'light.salon_buffet_wled_segment_1',
        device_id: device,
        platform: 'wled',
        translation_key: 'segment',
        labels: [],
      },
      'number.salon_buffet_wled_segment_1_speed': {
        entity_id: 'number.salon_buffet_wled_segment_1_speed',
        device_id: device,
        platform: 'wled',
        translation_key: 'segment_speed',
        labels: [],
      },
    };
    const withSegments = { ...hass, entities };
    expect(findWledEntities(withSegments, 'light.salon_buffet_wled_segment_1').speed).toBe(
      'number.salon_buffet_wled_segment_1_speed',
    );
    expect(findWledEntities(withSegments, 'light.salon_buffet_wled').speed).toBe(
      'number.salon_buffet_wled_speed',
    );
  });

  it('picks a Wi-Fi icon and formats durations', () => {
    expect(wifiIcon(undefined)).toBe('mdi:wifi-strength-off-outline');
    expect(wifiIcon(90)).toBe('mdi:wifi-strength-4');
    expect(wifiIcon(30)).toBe('mdi:wifi-strength-2');
    expect(wifiIcon(5)).toBe('mdi:wifi-strength-1');
    const { hass } = createMockHass('fr');
    expect(formatDuration(hass, 3 * 86400 + 4 * 3600 + 60)).toBe('3 j 4 h');
    expect(formatDuration(hass, 5 * 3600 + 12 * 60)).toBe('5 h 12 min');
    expect(formatDuration(hass, 59)).toBe('0 min');
  });
});

describe('badges', () => {
  it('formats sensors and colors on/off entities', () => {
    const { hass } = createMockHass('fr');
    expect(badgeModel(hass, { entity: 'sensor.salon_temperature' })).toMatchObject({
      icon: 'mdi:thermometer',
      label: '21,4°C',
      active: false,
      available: true,
    });
    expect(badgeModel(hass, { entity: 'binary_sensor.salon_presence', icon: 'mdi:sofa' })).toEqual({
      entityId: 'binary_sensor.salon_presence',
      name: 'Salon Présence',
      icon: 'mdi:sofa',
      label: undefined,
      active: true,
      available: true,
    });
    expect(badgeModel(hass, { entity: 'binary_sensor.salon_presence' }).icon).toBe('mdi:home');
    expect(badgeModel(hass, { entity: 'sensor.missing' })).toMatchObject({
      available: false,
      label: undefined,
    });
  });

  it('watches badge entities', () => {
    const { hass } = createMockHass();
    const model = buildLedGroupModel(
      hass,
      resolveConfig({ ...base, badges: ['sensor.salon_temperature'] }),
    );
    expect(model.watched).toContain('sensor.salon_temperature');
    expect(model.badges.map((badge) => badge.entityId)).toEqual(['sensor.salon_temperature']);
  });
});

describe('editor helpers for v0.3', () => {
  it('adds and removes favorites', () => {
    let config = addFavorite(base, '#ff8800');
    config = addFavorite(config, '#0000ff');
    expect(config.tile?.favorites).toEqual(['#ff8800', '#0000ff']);
    config = removeFavorite(config, 0);
    expect(config.tile?.favorites).toEqual(['#0000ff']);
    expect('tile' in removeFavorite(config, 0)).toBe(false);
  });

  it('stops at 8 favorites', () => {
    let config = base;
    for (let index = 0; index < 10; index += 1) config = addFavorite(config, '#ffffff');
    expect(config.tile?.favorites).toHaveLength(8);
  });

  it('adds badges once and removes them', () => {
    let config = addBadge(base, 'sensor.salon_temperature');
    config = addBadge(config, 'sensor.salon_temperature');
    expect(config.badges).toEqual(['sensor.salon_temperature']);
    expect('badges' in removeBadge(config, 0)).toBe(false);
  });

  it('prunes appearance defaults', () => {
    const config = setOption(base, 'appearance', 'glow', 'strong', 'normal');
    expect(config.appearance).toEqual({ glow: 'strong' });
    expect('appearance' in setOption(config, 'appearance', 'glow', 'normal', 'normal')).toBe(false);
  });

  it('works on the kitchen group', () => {
    const { hass } = createMockHass();
    const model = buildLedGroupModel(hass, resolveConfig({ ...base, entity: SPOTS_GROUP_ID }));
    expect(model.detected.every((strip) => Object.keys(strip.wledEntities).length === 0)).toBe(
      true,
    );
  });
});
