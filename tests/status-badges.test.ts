import { describe, expect, it } from 'vitest';
import {
  DOORS_GROUP_ID,
  ILLUMINANCE_GROUP_ID,
  POWER_GROUP_ID,
  PRESENCE_GROUP_ID,
  WINDOWS_GROUP_ID,
  createMockHass,
} from '../dev/mock-hass';
import { aggregate, memberIds } from '../src/badges/base/members';
import { ConfigReader, resolveBase } from '../src/badges/base/config';
import { batteryIcon, buildBatteryModel, resolveBatteryBadge } from '../src/badges/battery/model';
import {
  buildIlluminanceModel,
  luxIcon,
  luxRatio,
  resolveIlluminanceBadge,
} from '../src/badges/illuminance/model';
import { buildOpeningModel, resolveOpeningBadge } from '../src/badges/opening/model';
import {
  buildPowerModel,
  formatPower,
  resolvePowerBadge,
  wattsPerUnit,
} from '../src/badges/power/model';
import { buildPresenceModel, resolvePresenceBadge } from '../src/badges/presence/model';
import { onSpans } from '../src/core/history';
import { shortDuration } from '../src/i18n';

describe('badge base', () => {
  it('combines values', () => {
    expect(aggregate([1, 2, 6], 'mean')).toBe(3);
    expect(aggregate([1, 2, 6], 'sum')).toBe(9);
    expect(aggregate([4, 1, 9], 'min')).toBe(1);
    expect(aggregate([4, 1, 9], 'max')).toBe(9);
    expect(aggregate([4, 1, 9, 10], 'median')).toBe(6.5);
    expect(aggregate([], 'mean')).toBeUndefined();
  });

  it('reads members from a group, a list or a fallback', () => {
    const { hass } = createMockHass();
    expect(memberIds(hass, { entity: DOORS_GROUP_ID })).toEqual([
      'binary_sensor.porte_entree',
      'binary_sensor.porte_jardin',
      'binary_sensor.porte_garage',
    ]);
    expect(
      memberIds(hass, { entities: ['binary_sensor.porte_entree', 'binary_sensor.porte_entree'] }),
    ).toEqual(['binary_sensor.porte_entree']);
    expect(memberIds(hass, {}, () => ['x'])).toEqual(['x']);
  });

  it('validates the common options', () => {
    const base = (raw: Record<string, unknown>) =>
      resolveBase(new ConfigReader('test-badge', raw), { domains: ['binary_sensor'] });
    expect(base({ entity: 'binary_sensor.a' })).toMatchObject({
      look: 'disc',
      glow: 100,
      tapAction: { action: 'details' },
      holdAction: { action: 'details' },
    });
    expect(() => base({})).toThrow(/test-badge: set "entity"/);
    expect(() => base({ entity: 'light.a' })).toThrow(/binary_sensor/);
    expect(() => base({ entities: 'binary_sensor.a' })).toThrow(/list/);
    expect(() => base({ entity: 'binary_sensor.a', look: 'neon' })).toThrow(/look/);
  });

  it('writes short durations', () => {
    expect(shortDuration(undefined, 30)).toBe('< 1 min');
    expect(shortDuration(undefined, 12 * 60)).toBe('12 min');
    expect(shortDuration(undefined, 3 * 3600 + 100)).toBe('3 h');
    expect(shortDuration(undefined, 50 * 3600)).toBe('2 d');
  });

  it('turns state changes into spans', () => {
    const changes = [
      { t: 0, s: 'off' },
      { t: 25, s: 'on' },
      { t: 50, s: 'off' },
      { t: 90, s: 'on' },
    ];
    expect(onSpans(changes, 0, 100)).toEqual([
      [0.25, 0.5],
      [0.9, 1],
    ]);
  });
});

describe('opening badge', () => {
  it('counts open windows and colors by the oldest', () => {
    const { hass } = createMockHass();
    const config = resolveOpeningBadge({ entity: WINDOWS_GROUP_ID });
    const model = buildOpeningModel(hass, config);
    expect([model.open, model.total, model.kind]).toEqual([3, 7, 'window']);
    // The salon window has been open for 52 min: past alert_after (45).
    expect(model.severity).toBe(2);
    expect(Math.round(model.longest / 60)).toBe(52);
    const relaxed = buildOpeningModel(
      hass,
      resolveOpeningBadge({ entity: WINDOWS_GROUP_ID, warn_after: 30, alert_after: 60 }),
    );
    expect(relaxed.severity).toBe(1);
  });

  it('treats doors and a garage door as doors, all closed', () => {
    const { hass } = createMockHass();
    const model = buildOpeningModel(hass, resolveOpeningBadge({ entity: DOORS_GROUP_ID }));
    expect([model.open, model.total, model.kind, model.severity]).toEqual([0, 3, 'door', 0]);
  });

  it('rejects thresholds in the wrong order', () => {
    expect(() =>
      resolveOpeningBadge({ entity: WINDOWS_GROUP_ID, warn_after: 30, alert_after: 10 }),
    ).toThrow(/alert_after/);
  });
});

describe('presence badge', () => {
  it('counts occupied rooms and reads one room', () => {
    const { hass } = createMockHass();
    const group = buildPresenceModel(hass, resolvePresenceBadge({ entity: PRESENCE_GROUP_ID }));
    expect([group.isGroup, group.present, group.total]).toEqual([true, 2, 4]);
    const room = buildPresenceModel(
      hass,
      resolvePresenceBadge({ entity: 'binary_sensor.salon_presence' }),
    );
    expect([room.isGroup, room.present]).toEqual([false, 1]);
    expect(Math.round(room.since / 60)).toBe(12);
  });
});

describe('illuminance badge', () => {
  it('averages a group, or takes the highest', () => {
    const { hass } = createMockHass();
    const mean = buildIlluminanceModel(
      hass,
      resolveIlluminanceBadge({ entity: ILLUMINANCE_GROUP_ID }),
    );
    expect([mean.value, mean.min, mean.max, mean.unit]).toEqual([320, 120, 610, 'lx']);
    const max = buildIlluminanceModel(
      hass,
      resolveIlluminanceBadge({ entity: ILLUMINANCE_GROUP_ID, aggregate: 'max' }),
    );
    expect(max.value).toBe(610);
  });

  it('places lux on a log gauge and picks an icon', () => {
    expect(luxRatio(1, 2000)).toBe(0);
    expect(luxRatio(2000, 2000)).toBe(1);
    expect(luxRatio(5000, 2000)).toBe(1);
    expect(luxRatio(Math.sqrt(2000), 2000)).toBeCloseTo(0.5);
    expect(luxIcon(2)).toBe('mdi:weather-night');
    expect(luxIcon(320)).toBe('mdi:brightness-6');
    expect(luxIcon(1500)).toBe('mdi:brightness-7');
  });
});

describe('power badge', () => {
  it('sums a group, converting kW', () => {
    const { hass } = createMockHass();
    const model = buildPowerModel(hass, resolvePowerBadge({ entity: POWER_GROUP_ID }));
    expect(model.watts).toBeCloseTo(312 + 186 + 40 + 0.8);
    expect(model.items.find((item) => item.name === 'PC bureau')?.watts).toBeCloseTo(186);
    expect(wattsPerUnit('kW')).toBe(1000);
    expect(formatPower(undefined, 2400)).toBe('2.4 kW');
    expect(formatPower(undefined, 4.25)).toBe('4.3 W');
    expect(() => resolvePowerBadge({ entity: POWER_GROUP_ID, idle: 10, max: 5 })).toThrow(/max/);
  });
});

describe('battery badge', () => {
  it('finds every battery and shows the lowest', () => {
    const { hass } = createMockHass();
    const model = buildBatteryModel(hass, resolveBatteryBadge({}));
    expect(model.items).toHaveLength(8);
    expect(model.value).toBe(9);
    expect(model.lowCount).toBe(2);
    expect(model.severity).toBe(2);
    const mean = buildBatteryModel(hass, resolveBatteryBadge({ aggregate: 'mean' }));
    expect(mean.value).toBeCloseTo((9 + 14 + 27 + 82 + 64 + 71 + 88 + 96) / 8);
  });

  it('draws the level in the icon', () => {
    expect(batteryIcon(100)).toBe('mdi:battery');
    expect(batteryIcon(2)).toBe('mdi:battery-outline');
    expect(batteryIcon(9)).toBe('mdi:battery-10');
    expect(batteryIcon(64)).toBe('mdi:battery-60');
    expect(batteryIcon(undefined, true)).toBe('mdi:battery-alert-variant-outline');
    expect(() => resolveBatteryBadge({ low: 40, warn: 20 })).toThrow(/warn/);
  });
});

describe('window and door badges', () => {
  it('draws windows on a window badge and doors on a door badge', () => {
    const { hass } = createMockHass();
    const windows = buildOpeningModel(
      hass,
      resolveOpeningBadge({ type: 'custom:vivid-window-badge', entity: WINDOWS_GROUP_ID }),
    );
    expect(windows.kind).toBe('window');
    expect(windows.name).toBe('Fenêtres');
    const doors = buildOpeningModel(
      hass,
      resolveOpeningBadge({ type: 'custom:vivid-door-badge', entity: DOORS_GROUP_ID }),
    );
    expect(doors.kind).toBe('door');
    expect(doors.items.map((item) => item.kind)).toEqual(['door', 'door', 'garage']);
    // A door badge pointed at windows still draws doors.
    const forced = buildOpeningModel(
      hass,
      resolveOpeningBadge({ entity: WINDOWS_GROUP_ID }, 'door'),
    );
    expect(forced.kind).toBe('door');
    expect(() => resolveOpeningBadge({ type: 'custom:vivid-door-badge' })).toThrow(
      /^vivid-door-badge:/,
    );
  });
});
