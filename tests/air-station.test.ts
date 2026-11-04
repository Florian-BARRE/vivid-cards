import { describe, expect, it } from 'vitest';
import { AIR_DEVICE, AIR_IDS, SUFFIX_COUNT, createAirStationMock } from '../dev/air-station-mock';
import {
  DEFAULT_PREFIX,
  entityMap,
  resolveAirStationConfig,
} from '../src/cards/air-station/config';
import {
  buildAirStationModel,
  co2LevelOf,
  computeComfort,
  condensationRisk,
  culprit,
  effectColor,
} from '../src/cards/air-station/model';
import { lineColor, lineIcon, statusLine, valueViews } from '../src/cards/air-station/view';
import { devicePrefixFor } from '../src/core/entities';
import { ENTITY_SUFFIXES } from '../src/cards/air-station/config';

const config = (extra: Record<string, unknown> = {}) =>
  resolveAirStationConfig({ type: 'custom:vivid-air-station-card', ...extra });

const model = (scenario: Parameters<typeof createAirStationMock>[0] = {}, extra = {}) =>
  buildAirStationModel(createAirStationMock(scenario).hass, config(extra));

const THRESHOLDS = { excellent: 600, good: 800, watch: 1000, alert: 1200 };

describe('air station config', () => {
  it('builds the ids of the firmware from the prefix, prefix doubled as in the device', () => {
    const map = entityMap(DEFAULT_PREFIX);
    expect(map.co2).toBe('sensor.salon_salon_air_station_co2');
    expect(map.power).toBe('switch.salon_salon_air_station_station_power');
    expect(map.co2Alert).toBe('number.salon_salon_air_station_co2_alert_threshold');
    expect(map.calibrate).toBe('button.salon_salon_air_station_calibrate_co2_426_ppm');
    expect(map.pageHumidity).toBe('button.salon_salon_air_station_page_humidite');
    // The 48 entities of the firmware but "Uptime Human" (the card formats the seconds).
    expect(SUFFIX_COUNT).toBe(47);
  });

  it('fills the defaults and keeps the known values in their order', () => {
    expect(config()).toMatchObject({
      info: ['co2', 'temperature', 'humidity'],
      showPower: true,
      tab: 'air',
      glow: 100,
    });
    expect(
      config({ info: ['humidity', 'nope', 'co2', 'humidity'], tab: 'settings', show_power: false }),
    ).toMatchObject({ info: ['humidity', 'co2'], tab: 'settings', showPower: false });
    expect(config({ tab: 'nope' }).tab).toBe('air');
  });

  it('points single keys elsewhere and wins with an explicit prefix', () => {
    const resolved = config({ prefix: 'bureau_air_', entities: { co2: 'sensor.other_co2' } });
    expect(resolved.entities.co2).toBe('sensor.other_co2');
    expect(resolved.entities.temperature).toBe('sensor.bureau_air_temperature');
  });

  it('finds the prefix from the device', () => {
    const { hass } = createAirStationMock();
    expect(devicePrefixFor(hass, AIR_DEVICE, Object.values(ENTITY_SUFFIXES))).toBe(DEFAULT_PREFIX);
    const resolved = resolveAirStationConfig(
      { type: 'custom:vivid-air-station-card', device: AIR_DEVICE },
      { prefix: devicePrefixFor(hass, AIR_DEVICE, Object.values(ENTITY_SUFFIXES)) },
    );
    expect(resolved.entities.co2).toBe(AIR_IDS.co2);
  });
});

describe('air station levels', () => {
  it('words the CO₂ like the station screen', () => {
    expect(co2LevelOf(540, THRESHOLDS)).toBe('excellent');
    expect(co2LevelOf(600, THRESHOLDS)).toBe('good');
    expect(co2LevelOf(800, THRESHOLDS)).toBe('good');
    expect(co2LevelOf(801, THRESHOLDS)).toBe('fair');
    expect(co2LevelOf(1001, THRESHOLDS)).toBe('bad');
    expect(co2LevelOf(1201, THRESHOLDS)).toBe('critical');
  });

  it('computes the comfort as the firmware when its sensor is missing', () => {
    const limits = { good: 800, tMin: 18, tMax: 24, hMin: 40, hMax: 60 };
    expect(computeComfort(612, 21.4, 48, limits)).toBe('excellent');
    expect(computeComfort(910, 21.4, 48, limits)).toBe('good');
    expect(computeComfort(910, 24.6, 48, limits)).toBe('fair');
    expect(computeComfort(910, 24.6, 70, limits)).toBe('poor');
    expect(computeComfort(undefined, 21, 50, limits)).toBe('excellent');
  });

  it('rates the condensation risk like the humidity page', () => {
    expect(condensationRisk(21, 19)).toBe('high');
    expect(condensationRisk(21, 17)).toBe('moderate');
    expect(condensationRisk(21, 10)).toBe('low');
    expect(condensationRisk(undefined, 10)).toBeUndefined();
  });
});

describe('air station model', () => {
  it('reads the station', () => {
    const m = model({ co2: 612, temperature: 21.4, humidity: 48 });
    expect(m).toMatchObject({
      online: true,
      power: true,
      alert: false,
      co2: 612,
      comfort: 'excellent',
      co2Level: 'good',
      advice: 'ok',
      temperatureSide: 0,
      humiditySide: 0,
      ledSync: true,
      page: 'co2',
    });
    expect(m.thresholds.alert).toMatchObject({ value: 1200, min: 600, max: 2000, step: 10 });
    expect(m.effects).toHaveLength(8);
  });

  it('raises the alarm above the threshold and names the culprit', () => {
    const m = model({ co2: 1240, temperature: 22.1, humidity: 58 });
    expect(m.alert).toBe(true);
    expect(m.advice).toBe('now');
    expect(culprit(m)).toBe('co2');
    expect(lineIcon(m)).toBe('mdi:window-open-variant');
    expect(lineColor(m)).toEqual([229, 57, 53]);
    // LED Sync on: the frame flashes red.
    expect(m.frame).toMatchObject({ effect: 'Alert Strobe', strobe: true, rgb: [255, 0, 0] });
  });

  it('mirrors the frame: the page effect while synced, the picked one otherwise', () => {
    expect(model({ co2: 612, page: 'data' }).frame.effect).toBe('Aurora');
    expect(model({ co2: 612, page: 'hum' }).frame.effect).toBe('Ocean Wave');
    const custom = model({ effect: 'Custom Color' });
    expect(custom.frame).toMatchObject({ effect: 'Custom Color', rgb: [0, 180, 0] });
    expect(model({ off: true }).frame.effect).toBeUndefined();
    expect(model({ offline: true }).frame.effect).toBeUndefined();
  });

  it('colors the effects with the firmware formulas', () => {
    expect(effectColor('Aurora', { comfort: 'fair' }).rgb).toEqual([255, 140, 0]);
    expect(effectColor('CO2 Comet', { co2Level: 'bad' }).rgb).toEqual([255, 60, 0]);
    // 10 °C: blue; 40 °C: red.
    expect(effectColor('Thermal Plasma', { temperature: 10 }).rgb).toEqual([0, 0, 255]);
    expect(effectColor('Thermal Plasma', { temperature: 40 }).rgb).toEqual([255, 0, 0]);
    expect(effectColor('Ocean Wave', { humidity: 100 }).rgb).toEqual([0, 140, 255]);
    expect(effectColor('Boot Chase', {}).rainbow).toBe(true);
    expect(effectColor('Power Off', {}).rgb).toBeUndefined();
  });

  it('words the line for each state', () => {
    const fr = (scenario: Parameters<typeof createAirStationMock>[0]) => {
      const mock = createAirStationMock({ ...scenario, language: 'fr' });
      return statusLine(mock.hass, buildAirStationModel(mock.hass, config()));
    };
    expect(fr({ co2: 612, temperature: 21.4, humidity: 48 }).text).toBe(
      'Excellent · qualité acceptable',
    );
    expect(fr({ co2: 1240 })).toEqual({ text: 'Aérez maintenant', tone: 'alarm' });
    expect(fr({ co2: 540, temperature: 19.6, humidity: 51, night: true }).text).toBe(
      'Excellent · veilleuse 3/255',
    );
    expect(fr({ off: true })).toEqual({ text: 'Station éteinte · mesures actives', tone: 'muted' });
    expect(fr({ offline: true })).toEqual({ text: 'Hors ligne', tone: 'alarm' });
  });

  it('greys the values while the station is off and flags those outside comfort', () => {
    const mock = createAirStationMock({ co2: 910, temperature: 24.6, humidity: 57 });
    const m = buildAirStationModel(mock.hass, config());
    const views = valueViews(mock.hass, m, ['co2', 'temperature', 'humidity']);
    expect(views.map((view) => view.alarm)).toEqual([false, true, false]);
    expect(views[1]?.text).toBe('24.6');
    const off = createAirStationMock({ off: true });
    const offViews = valueViews(off.hass, buildAirStationModel(off.hass, config()), ['co2']);
    expect(offViews[0]?.rgb).toBeUndefined();
  });
});

describe('air station mock', () => {
  it('moves the pages like the buttons of the firmware', async () => {
    const mock = createAirStationMock({ page: 'config' });
    await mock.hass.callService('button', 'press', {}, { entity_id: AIR_IDS.pageNext });
    expect(mock.hass.states[AIR_IDS.page]?.state).toBe('data');
    await mock.hass.callService('button', 'press', {}, { entity_id: AIR_IDS.pageHumidity });
    expect(mock.hass.states[AIR_IDS.page]?.state).toBe('hum');
  });
});
