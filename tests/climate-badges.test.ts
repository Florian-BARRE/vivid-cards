import { describe, expect, it } from 'vitest';
import { createMockHass, ILLUMINANCE_GROUP_ID, WINDOWS_GROUP_ID } from '../dev/mock-hass';
import {
  FAHRENHEIT,
  SDB_CO2,
  SDB_HUMIDITY,
  SDB_ILLUMINANCE,
  SDB_PRESSURE,
  SDB_TEMPERATURE,
  TEMPERATURES_GROUP,
  withClimate,
} from '../dev/climate-mock';
import { lookVars, type BadgeView } from '../src/badges/base/vivid-badge';
import { ConfigReader, resolveBase } from '../src/badges/base/config';
import {
  buildClimateModel,
  climateKindOf,
  climateStatus,
  climateTone,
  comfortRange,
  fromScale,
  historyNeeds,
  recentRise,
  resolveClimateBadge,
  seriesDelta,
  toScale,
  trendOf,
} from '../src/badges/climate/model';
import {
  buildIlluminanceModel,
  lightLevel,
  nearestLevel,
  resolveIlluminanceBadge,
} from '../src/badges/illuminance/model';
import { buildOpeningModel, openingLabel, resolveOpeningBadge } from '../src/badges/opening/model';
import { resolveLightBadgeConfig } from '../src/badges/light/config';
import { climateColor } from '../src/core/climate';
import { rgbCss } from '../src/core/color';
import { DARK_ICON } from '../src/core/glow';
import type { HistorySeries } from '../src/core/history';

const NOW = Date.parse('2026-10-29T12:00:00Z');
const MIN = 60_000;
const hass = () => withClimate(createMockHass('fr').hass);
const temperature = (extra: Record<string, unknown> = {}) =>
  resolveClimateBadge({ type: 'custom:vivid-temperature-badge', ...extra });

describe('climate badge config', () => {
  it('reads the kind from the type', () => {
    expect(climateKindOf('custom:vivid-humidity-badge')).toBe('humidity');
    expect(climateKindOf('custom:vivid-air-quality-badge')).toBe('co2');
    expect(climateKindOf('custom:vivid-pressure-badge')).toBe('pressure');
    expect(climateKindOf('nonsense')).toBe('temperature');
  });

  it('applies defaults and validates the comfort range', () => {
    const config = temperature({ entity: SDB_TEMPERATURE });
    expect(config).toMatchObject({
      kind: 'temperature',
      comfort: undefined,
      aggregate: undefined,
      range: '24h',
      trend: true,
      iconColor: 'white',
    });
    expect(temperature({ entity: SDB_TEMPERATURE, comfort: [18, 22] }).comfort).toEqual({
      low: 18,
      high: 22,
    });
    expect(temperature({ entity: SDB_TEMPERATURE, aggregate: 'auto' }).aggregate).toBeUndefined();
    expect(() => temperature({ entity: SDB_TEMPERATURE, comfort: [23, 19] })).toThrow(/comfort/);
    expect(() => temperature({ entity: SDB_TEMPERATURE, comfort: 21 })).toThrow(/comfort/);
    expect(() => temperature({ entity: SDB_TEMPERATURE, range: '2h' })).toThrow(/range/);
    expect(() => temperature({ entity: 'light.salon' })).toThrow(/sensor/);
  });
});

describe('climate units', () => {
  it('converts to the scale units and back', () => {
    expect(toScale('temperature', 68, '°F')).toBeCloseTo(20);
    expect(fromScale('temperature', 20, '°F')).toBeCloseTo(68);
    expect(toScale('pressure', 29.92, 'inHg')).toBeCloseTo(1013.2, 0);
    expect(toScale('pressure', 101.3, 'kPa')).toBeCloseTo(1013);
    expect(toScale('humidity', 50, '%')).toBe(50);
  });

  it('reads the comfort range in the sensor unit', () => {
    expect(comfortRange('temperature', undefined, '°C')).toEqual({ low: 19, high: 23 });
    const fahrenheit = comfortRange('temperature', { low: 66.2, high: 73.4 }, '°F');
    expect(fahrenheit.low).toBeCloseTo(19);
    expect(fahrenheit.high).toBeCloseTo(23);
  });
});

describe('climate history', () => {
  const readings = [
    { t: NOW - 70 * MIN, v: 20.5 },
    { t: NOW - 30 * MIN, v: 21 },
    { t: NOW - 5 * MIN, v: 21.6 },
  ];

  it('measures the change over a window', () => {
    expect(seriesDelta(readings, NOW, 60 * MIN, 21.6)).toBeCloseTo(1.1);
    expect(seriesDelta([], NOW, 60 * MIN, 21.6)).toBeUndefined();
    // Nothing known before the window: the first reading stands in.
    expect(seriesDelta([{ t: NOW - 10 * MIN, v: 21 }], NOW, 60 * MIN, 22)).toBe(1);
  });

  it('measures a fast rise from the lowest recent value', () => {
    const shower = [
      { t: NOW - 20 * MIN, v: 55 },
      { t: NOW - 8 * MIN, v: 60 },
      { t: NOW - 2 * MIN, v: 80 },
    ];
    expect(recentRise(shower, NOW, 15 * MIN, 86)).toBe(31);
  });

  it('draws arrows past the thresholds only', () => {
    expect(trendOf('temperature', 0.4)).toBeUndefined();
    expect(trendOf('temperature', 0.6)).toBe('up');
    expect(trendOf('humidity', -6)).toBe('down');
    expect(trendOf('humidity', 4)).toBeUndefined();
    expect(trendOf('co2', 500)).toBeUndefined();
  });

  it('asks for the little history the trends need', () => {
    const h = hass();
    const pressure = buildClimateModel(
      h,
      resolveClimateBadge({ type: 'custom:vivid-pressure-badge', entity: SDB_PRESSURE }),
    );
    expect(historyNeeds(pressure)).toEqual({ ids: [SDB_PRESSURE], window: 3 * 60 * MIN });
    const air = buildClimateModel(
      h,
      resolveClimateBadge({ type: 'custom:vivid-air-quality-badge', entity: SDB_CO2 }),
    );
    expect(historyNeeds(air).ids).toEqual([]);
  });
});

describe('climate model', () => {
  it('colors one sensor with the exact color of its value, no halo in comfort', () => {
    const model = buildClimateModel(hass(), temperature({ entity: SDB_TEMPERATURE }), {}, NOW);
    expect(model.scaled).toBe(21.8);
    const status = climateStatus(model, { trend: true });
    expect(status?.colors).toEqual([climateColor('temperature', 21.8)]);
    expect(status?.halo).toBe(0);
    expect(status?.pulse).toBe(false);
  });

  it('honours a custom comfort range', () => {
    const model = buildClimateModel(
      hass(),
      temperature({ entity: SDB_TEMPERATURE, comfort: [18, 20] }),
      {},
      NOW,
    );
    expect(climateStatus(model, { trend: true })?.halo).toBeGreaterThan(0);
  });

  it('shows the range of the rooms, colored by the coldest and the warmest', () => {
    const model = buildClimateModel(hass(), temperature({ entity: TEMPERATURES_GROUP }), {}, NOW);
    expect(model.display).toBe('range');
    expect(model.low?.scaled).toBe(17.9);
    expect(model.high?.scaled).toBe(22.7);
    expect(model.worst?.entityId).toBe('sensor.chambre_temperature');
    const status = climateStatus(model, { trend: true });
    expect(status?.colors).toEqual([
      climateColor('temperature', 17.9),
      climateColor('temperature', 22.7),
    ]);
    expect(status?.haloColor).toEqual(climateColor('temperature', 17.9));
    expect(status?.halo).toBeGreaterThan(0);
    const tone = climateTone(status!.colors, status!.halo, status!.haloColor);
    expect(tone.background).toContain('linear-gradient(90deg');
  });

  it('lets aggregate override the group display', () => {
    const model = buildClimateModel(
      hass(),
      temperature({ entity: TEMPERATURES_GROUP, aggregate: 'mean' }),
      {},
      NOW,
    );
    expect(model.display).toBe('mean');
    expect(model.scaled).toBeCloseTo((21.4 + 17.9 + 22.7 + 20.6 + 21.8) / 5);
  });

  it('shows the most humid room and the worst air by default', () => {
    const h = hass();
    const humidity = buildClimateModel(
      h,
      resolveClimateBadge({ type: 'custom:vivid-humidity-badge', entity: 'sensor.all_humidites' }),
    );
    expect(humidity.display).toBe('max');
    expect(humidity.scaled).toBe(58);
    const air = buildClimateModel(
      h,
      resolveClimateBadge({ type: 'custom:vivid-air-quality-badge', entity: 'sensor.all_co2' }),
    );
    expect(air.scaled).toBe(1150);
    expect(climateStatus(air, { trend: true })?.level).toBe('moderate');
  });

  it('colors °F sensors through °C', () => {
    const model = buildClimateModel(hass(), temperature({ entity: FAHRENHEIT }), {}, NOW);
    expect(model.unit).toBe('°F');
    expect(model.scaled).toBeCloseTo(15.22, 1);
    expect(climateStatus(model, { trend: true })?.colors[0]).toEqual(
      climateColor('temperature', (59.4 - 32) * (5 / 9)),
    );
  });

  it('pulses during a shower and on toxic air', () => {
    const history: HistorySeries = {
      [SDB_HUMIDITY]: [
        { t: NOW - 60 * MIN, v: 55 },
        { t: NOW - 10 * MIN, v: 56 },
        { t: NOW - 3 * MIN, v: 80 },
      ],
    };
    const humidity = buildClimateModel(
      hass(),
      resolveClimateBadge({ type: 'custom:vivid-humidity-badge', entity: SDB_HUMIDITY }),
      history,
      NOW,
    );
    const status = climateStatus(humidity, { trend: true });
    expect(status?.shower).toBe(true);
    expect(status?.pulse).toBe(true);
    expect(status?.trend).toBe('up');
    expect(climateStatus(humidity, { trend: false })?.pulse).toBe(false);
    const toxic = buildClimateModel(
      hass(),
      resolveClimateBadge({ type: 'custom:vivid-air-quality-badge', entity: 'sensor.demo_co2_3' }),
    );
    expect(climateStatus(toxic, { trend: true })).toMatchObject({ level: 'toxic', pulse: true });
  });

  it('raises the alert halo when the pressure drops fast', () => {
    const history: HistorySeries = {
      [SDB_PRESSURE]: [
        { t: NOW - 200 * MIN, v: 1006.5 },
        { t: NOW - 60 * MIN, v: 1004 },
      ],
    };
    const model = buildClimateModel(
      hass(),
      resolveClimateBadge({ type: 'custom:vivid-pressure-badge', entity: SDB_PRESSURE }),
      history,
      NOW,
    );
    const status = climateStatus(model, { trend: true });
    expect(status).toMatchObject({ dropAlert: true, halo: 1, trend: 'down' });
  });

  it('is unavailable without a value', () => {
    const model = buildClimateModel(
      hass(),
      temperature({ entity: 'sensor.missing_temperature' }),
      {},
      NOW,
    );
    expect(climateStatus(model, { trend: true })).toBeUndefined();
  });
});

describe('white icons on colored discs', () => {
  const view: BadgeView = {
    name: 'x',
    active: true,
    icon: 'mdi:x',
    state: '',
    watched: [],
    tone: { background: rgbCss([255, 241, 168]), iconColor: DARK_ICON },
  };

  it('turns dark ink white unless icon_color is auto', () => {
    const white = lookVars(view, 'disc', 100);
    expect(white['--icon-color']).toBe('#ffffff');
    expect(white['--badge-ink-shadow']).toContain('drop-shadow');
    expect(lookVars(view, 'disc', 100, 'auto')['--icon-color']).toBe(DARK_ICON);
  });

  it('validates the option on every badge', () => {
    const base = (raw: Record<string, unknown>) =>
      resolveBase(new ConfigReader('test-badge', raw), { domains: ['sensor'] });
    expect(base({ entity: 'sensor.a' }).iconColor).toBe('white');
    expect(base({ entity: 'sensor.a', icon_color: 'auto' }).iconColor).toBe('auto');
    expect(() => base({ entity: 'sensor.a', icon_color: 'black' })).toThrow(/icon_color/);
    expect(
      resolveLightBadgeConfig({ type: 'custom:vivid-light-badge', entity: 'light.salon_leds' })
        .iconColor,
    ).toBe('white');
    expect(() =>
      resolveLightBadgeConfig({
        type: 'custom:vivid-light-badge',
        entity: 'light.salon_leds',
        icon_color: 'red',
      }),
    ).toThrow(/icon_color/);
  });
});

describe('opening badge count and duration', () => {
  it('shows the count and the longest open duration', () => {
    const { hass: h } = createMockHass();
    const config = resolveOpeningBadge({
      type: 'custom:vivid-window-badge',
      entity: WINDOWS_GROUP_ID,
    });
    const model = buildOpeningModel(h, config);
    const label = openingLabel(model, config);
    expect(label.count).toBe('3/7');
    expect(label.since).toBeGreaterThanOrEqual(52 * 60);
    expect(openingLabel(model, { ...config, showCount: false })).toEqual({});
    expect(openingLabel({ ...model, open: 0 }, config)).toEqual({});
    expect(openingLabel({ ...model, open: 0 }, { ...config, showZero: true })).toEqual({
      count: '0/7',
    });
    expect(openingLabel({ ...model, isGroup: false, open: 1 }, config)).toEqual({
      since: model.longest,
    });
  });
});

describe('illuminance text sensors', () => {
  it('reads the common words, whatever the case', () => {
    expect(lightLevel('bright')).toBe('bright');
    expect(lightLevel('Light')).toBe('bright');
    expect(lightLevel('TWILIGHT')).toBe('dim');
    expect(lightLevel('night')).toBe('dark');
    expect(lightLevel('42')).toBeUndefined();
    expect(nearestLevel(0.8)).toBe('bright');
    expect(nearestLevel(0.3)).toBe('dim');
  });

  it('places a text sensor on the gauge, icon only by default', () => {
    const h = hass();
    const config = resolveIlluminanceBadge({
      type: 'custom:vivid-illuminance-badge',
      entity: SDB_ILLUMINANCE,
    });
    expect(config.showLabel).toBe(false);
    const model = buildIlluminanceModel(h, config);
    expect(model.value).toBeUndefined();
    expect(model.level).toBe('bright');
    expect(
      resolveIlluminanceBadge({
        type: 'custom:vivid-illuminance-badge',
        entity: SDB_ILLUMINANCE,
        show_label: true,
      }).showLabel,
    ).toBe(true);
  });

  it('keeps lux sensors as they were', () => {
    const model = buildIlluminanceModel(
      hass(),
      resolveIlluminanceBadge({
        type: 'custom:vivid-illuminance-badge',
        entity: ILLUMINANCE_GROUP_ID,
      }),
    );
    expect(model.level).toBeUndefined();
    expect(model.value).toBeCloseTo((610 + 230 + 120) / 3);
  });
});
