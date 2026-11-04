import { isAvailable, parseNumericState } from '../../core/entities';
import type { HassEntity, HomeAssistant, Rgb } from '../../core/hass-types';
import type { EntityKey, ResolvedAirStationConfig } from './config';

/** The station's overall comfort (its "Comfort Level" sensor). */
export type Comfort = 'excellent' | 'good' | 'fair' | 'poor';

/** CO₂ level against the station's own thresholds, as its screen words it. */
export type Co2Level = 'excellent' | 'good' | 'fair' | 'bad' | 'critical';

/** Pages of the station's screen. */
export type StationPage = 'boot' | 'data' | 'co2' | 'temp' | 'hum' | 'config';
export const STATION_PAGES: readonly Exclude<StationPage, 'boot'>[] = [
  'data',
  'co2',
  'temp',
  'hum',
  'config',
];

/** The station's ventilation advice. */
export type Advice = 'now' | 'needed' | 'degrading' | 'excellent' | 'ok';

/** Where a reading stands against its comfort range. */
export type Side = -1 | 0 | 1;

export interface NumberSetting {
  entityId: string;
  value?: number;
  min: number;
  max: number;
  step: number;
}

/** What the LED frame shows, mirrored from the firmware's effects. */
export interface FrameView {
  /** The effect running now (the page's own while LED Sync follows the pages). */
  effect?: string;
  /** Its main color; undefined when the frame is dark. */
  rgb?: Rgb;
  /** The boot chase runs through every hue. */
  rainbow: boolean;
  /** The CO₂ alarm flashes red. */
  strobe: boolean;
}

export interface AirStationModel {
  online: boolean;
  /** The station is on: frame and screen lit (measures run either way). */
  power: boolean;
  powerAvailable: boolean;
  night: boolean;
  /** CO₂ above the alert threshold. */
  alert: boolean;
  co2?: number;
  temperature?: number;
  humidity?: number;
  dewPoint?: number;
  ldr?: number;
  /** Brightness the frame runs at (0–255). */
  ledBrightness?: number;
  comfort?: Comfort;
  co2Level?: Co2Level;
  advice?: Advice;
  /** Where the temperature and the humidity stand against their comfort range. */
  temperatureSide?: Side;
  humiditySide?: Side;
  thresholds: {
    excellent: NumberSetting;
    good: NumberSetting;
    watch: NumberSetting;
    alert: NumberSetting;
  };
  temperatureRange: { min: NumberSetting; max: NumberSetting };
  humidityRange: { min: NumberSetting; max: NumberSetting };
  nightThreshold: NumberSetting;
  brightness: {
    night: NumberSetting;
    min: NumberSetting;
    max: NumberSetting;
    manual: NumberSetting;
  };
  color: { red: NumberSetting; green: NumberSetting; blue: NumberSetting };
  pageDuration: NumberSetting;
  backlight?: boolean;
  autoCycle?: boolean;
  ledSync?: boolean;
  autoBrightness?: boolean;
  /** Effect picked in the select (used while LED Sync is off). */
  effect?: string;
  effects: string[];
  page?: StationPage;
  frame: FrameView;
  uptime?: number;
  rssi?: number;
  ip?: string;
  ssid?: string;
  /** Entity ids whose changes redraw the card. */
  watched: string[];
}

/** Colors of the firmware's effects (`Color(r, g, b)` in the YAML). */
export const COMFORT_RGB: Record<Comfort, Rgb> = {
  excellent: [0, 255, 90],
  good: [150, 220, 0],
  fair: [255, 140, 0],
  poor: [255, 30, 0],
};
const CO2_LEVEL_RGB: Record<Co2Level, Rgb> = {
  excellent: [0, 255, 90],
  good: [180, 220, 0],
  fair: [255, 140, 0],
  bad: [255, 60, 0],
  critical: [255, 0, 40],
};
const UNKNOWN_RGB: Rgb = [80, 80, 90];
const GALAXY_RGB: Rgb = [255, 191, 140];
const STROBE_RGB: Rgb = [255, 0, 0];

/** The effect the firmware runs on each page while LED Sync is on. */
export const PAGE_EFFECTS: Record<StationPage, string> = {
  boot: 'Boot Chase',
  data: 'Aurora',
  co2: 'CO2 Comet',
  temp: 'Thermal Plasma',
  hum: 'Ocean Wave',
  config: 'Galaxy Spin',
};
export const ALERT_EFFECT = 'Alert Strobe';
export const CUSTOM_EFFECT = 'Custom Color';

const COMFORT_STATES: Record<string, Comfort> = {
  EXCELLENT: 'excellent',
  BON: 'good',
  MOYEN: 'fair',
  INCONFORT: 'poor',
};

const ADVICE_STATES: [RegExp, Advice][] = [
  [/^aerez maintenant/i, 'now'],
  [/^aeration necessaire/i, 'needed'],
  [/^air en degradation/i, 'degrading'],
  [/^air excellent/i, 'excellent'],
  [/^qualite acceptable/i, 'ok'],
];

function numberSetting(
  hass: HomeAssistant,
  entityId: string,
  fallback: { min: number; max: number; step: number },
): NumberSetting {
  const state = hass.states[entityId];
  const attr = (name: string, value: number): number => {
    const raw = Number(state?.attributes[name]);
    return Number.isFinite(raw) ? raw : value;
  };
  return {
    entityId,
    value: parseNumericState(state),
    min: attr('min', fallback.min),
    max: attr('max', fallback.max),
    step: attr('step', fallback.step),
  };
}

function switchState(state: HassEntity | undefined): boolean | undefined {
  return isAvailable(state) ? state.state === 'on' : undefined;
}

/** Level of a CO₂ reading against the station's thresholds (its screen's words). */
export function co2LevelOf(
  ppm: number,
  thresholds: { excellent: number; good: number; watch: number; alert: number },
): Co2Level {
  if (ppm > thresholds.alert) return 'critical';
  if (ppm > thresholds.watch) return 'bad';
  if (ppm > thresholds.good) return 'fair';
  if (ppm < thresholds.excellent) return 'excellent';
  return 'good';
}

/** Comfort from the readings, as the firmware computes it (when its sensor is missing). */
export function computeComfort(
  co2: number | undefined,
  temperature: number,
  humidity: number,
  limits: { good: number; tMin: number; tMax: number; hMin: number; hMax: number },
): Comfort {
  const ok =
    (co2 === undefined || co2 < limits.good ? 1 : 0) +
    (temperature >= limits.tMin && temperature <= limits.tMax ? 1 : 0) +
    (humidity >= limits.hMin && humidity <= limits.hMax ? 1 : 0);
  return (['poor', 'fair', 'good', 'excellent'] as const)[ok] ?? 'poor';
}

export function sideOf(value: number | undefined, min?: number, max?: number): Side | undefined {
  if (value === undefined || min === undefined || max === undefined) return undefined;
  if (value < min) return -1;
  if (value > max) return 1;
  return 0;
}

/** The frame's main color for an effect, from the same formulas as the firmware. */
export function effectColor(
  effect: string,
  model: Pick<AirStationModel, 'comfort' | 'co2' | 'temperature' | 'humidity' | 'co2Level'> & {
    custom?: Rgb;
  },
): Pick<FrameView, 'rgb' | 'rainbow' | 'strobe'> {
  switch (effect) {
    case 'Aurora':
      return {
        rgb: model.comfort ? COMFORT_RGB[model.comfort] : UNKNOWN_RGB,
        rainbow: false,
        strobe: false,
      };
    case 'CO2 Comet':
      return {
        rgb: CO2_LEVEL_RGB[model.co2Level ?? 'good'],
        rainbow: false,
        strobe: false,
      };
    case 'Thermal Plasma': {
      const t = model.temperature ?? 20;
      const tr = Math.min(Math.max((t - 10) / 30, 0), 1);
      let rgb: Rgb;
      if (tr < 0.33) {
        const k = tr / 0.33;
        rgb = [0, Math.round(k * 80), 255];
      } else if (tr < 0.66) {
        const k = (tr - 0.33) / 0.33;
        rgb = [Math.round(k * 255), Math.round(80 + k * 120), Math.round((1 - k) * 255)];
      } else {
        const k = (tr - 0.66) / 0.34;
        rgb = [255, Math.round((1 - k) * 200), 0];
      }
      return { rgb, rainbow: false, strobe: false };
    }
    case 'Ocean Wave': {
      const hr = (model.humidity ?? 50) / 100;
      return {
        rgb: [0, Math.round((0.55 + (1 - hr) * 0.45) * 255), Math.round((0.8 + hr * 0.2) * 255)],
        rainbow: false,
        strobe: false,
      };
    }
    case 'Galaxy Spin':
      return { rgb: GALAXY_RGB, rainbow: false, strobe: false };
    case 'Boot Chase':
      return { rgb: [255, 255, 255], rainbow: true, strobe: false };
    case ALERT_EFFECT:
      return { rgb: STROBE_RGB, rainbow: false, strobe: true };
    case CUSTOM_EFFECT:
      return { rgb: model.custom ?? [0, 180, 0], rainbow: false, strobe: false };
    default:
      return { rgb: undefined, rainbow: false, strobe: false };
  }
}

function pageOf(state: HassEntity | undefined): StationPage | undefined {
  if (!isAvailable(state)) return undefined;
  const value = state.state.trim().toLowerCase();
  return (['boot', ...STATION_PAGES] as string[]).includes(value)
    ? (value as StationPage)
    : undefined;
}

function textState(state: HassEntity | undefined): string | undefined {
  return isAvailable(state) && state.state.trim() !== '' ? state.state.trim() : undefined;
}

export function buildAirStationModel(
  hass: HomeAssistant,
  config: ResolvedAirStationConfig,
): AirStationModel {
  const entities = config.entities;
  const state = (key: EntityKey): HassEntity | undefined => hass.states[entities[key]];
  const value = (key: EntityKey): number | undefined => parseNumericState(state(key));
  const setting = (key: EntityKey, min: number, max: number, step = 1): NumberSetting =>
    numberSetting(hass, entities[key], { min, max, step });

  const onlineState = state('online');
  const co2 = value('co2');
  const temperature = value('temperature');
  const humidity = value('humidity');
  const thresholds = {
    excellent: setting('co2Excellent', 300, 800, 10),
    good: setting('co2Good', 400, 1100, 10),
    watch: setting('co2Watch', 500, 1400, 10),
    alert: setting('co2Alert', 600, 2000, 10),
  };
  const temperatureRange = {
    min: setting('tempMin', 10, 25, 0.5),
    max: setting('tempMax', 15, 35, 0.5),
  };
  const humidityRange = { min: setting('humMin', 10, 55), max: setting('humMax', 30, 90) };
  const limits = {
    excellent: thresholds.excellent.value ?? 600,
    good: thresholds.good.value ?? 800,
    watch: thresholds.watch.value ?? 1000,
    alert: thresholds.alert.value ?? 1200,
  };
  const co2Level = co2 === undefined ? undefined : co2LevelOf(co2, limits);
  const comfortText = textState(state('comfort'))?.toUpperCase();
  const comfort =
    (comfortText ? COMFORT_STATES[comfortText] : undefined) ??
    (temperature !== undefined && humidity !== undefined
      ? computeComfort(co2, temperature, humidity, {
          good: limits.good,
          tMin: temperatureRange.min.value ?? 18,
          tMax: temperatureRange.max.value ?? 24,
          hMin: humidityRange.min.value ?? 40,
          hMax: humidityRange.max.value ?? 60,
        })
      : undefined);
  const adviceText = textState(state('advice'));
  const advice = adviceText
    ? ADVICE_STATES.find(([pattern]) => pattern.test(adviceText))?.[1]
    : undefined;
  const alertState = state('alert');
  const alert = isAvailable(alertState)
    ? alertState.state === 'on'
    : co2 !== undefined && co2 > limits.alert;

  const online = onlineState
    ? isAvailable(onlineState) && onlineState.state === 'on'
    : co2 !== undefined || temperature !== undefined;
  const powerState = state('power');
  const power = switchState(powerState) ?? false;
  const ledSync = switchState(state('ledSync'));
  const effectState = state('effect');
  const effect = textState(effectState);
  const effects = Array.isArray(effectState?.attributes.options)
    ? effectState.attributes.options.filter((item): item is string => typeof item === 'string')
    : [];
  const page = pageOf(state('page'));
  const color = {
    red: setting('red', 0, 255),
    green: setting('green', 0, 255),
    blue: setting('blue', 0, 255),
  };

  const running =
    !online || !power
      ? undefined
      : ledSync
        ? alert
          ? ALERT_EFFECT
          : PAGE_EFFECTS[page ?? 'data']
        : effect;
  const frame: FrameView = running
    ? {
        effect: running,
        ...effectColor(running, {
          comfort,
          co2,
          temperature,
          humidity,
          co2Level,
          custom: [color.red.value ?? 0, color.green.value ?? 180, color.blue.value ?? 0],
        }),
      }
    : { rainbow: false, strobe: false };

  return {
    online,
    power,
    powerAvailable: isAvailable(powerState),
    night: switchState(state('night')) ?? false,
    alert,
    co2,
    temperature,
    humidity,
    dewPoint: value('dewPoint'),
    ldr: value('ldr'),
    ledBrightness: value('ledBrightness'),
    comfort,
    co2Level,
    advice,
    temperatureSide: sideOf(temperature, temperatureRange.min.value, temperatureRange.max.value),
    humiditySide: sideOf(humidity, humidityRange.min.value, humidityRange.max.value),
    thresholds,
    temperatureRange,
    humidityRange,
    nightThreshold: setting('nightThreshold', 50, 1500, 10),
    brightness: {
      night: setting('brightnessNight', 0, 30),
      min: setting('brightnessMin', 0, 80),
      max: setting('brightnessMax', 50, 255),
      manual: setting('brightnessManual', 0, 255),
    },
    color,
    pageDuration: setting('pageDuration', 5, 60),
    backlight: switchState(state('backlight')),
    autoCycle: switchState(state('autoCycle')),
    ledSync,
    autoBrightness: switchState(state('autoBrightness')),
    effect,
    effects,
    page,
    frame,
    uptime: value('uptime'),
    rssi: value('rssi'),
    ip: textState(state('ip')),
    ssid: textState(state('ssid')),
    watched: Object.values(entities),
  };
}

/** Risk of condensation from the gap between the temperature and the dew point (as on the screen). */
export function condensationRisk(
  temperature: number | undefined,
  dewPoint: number | undefined,
): 'high' | 'moderate' | 'low' | undefined {
  if (temperature === undefined || dewPoint === undefined) return undefined;
  const gap = temperature - dewPoint;
  if (gap < 3) return 'high';
  if (gap < 5) return 'moderate';
  return 'low';
}

/** Which reading is the problem, for the icon of the line (the worst first). */
export function culprit(model: AirStationModel): 'co2' | 'temperature' | 'humidity' | undefined {
  if (model.co2Level === 'fair' || model.co2Level === 'bad' || model.co2Level === 'critical')
    return 'co2';
  if (model.temperatureSide !== undefined && model.temperatureSide !== 0) return 'temperature';
  if (model.humiditySide !== undefined && model.humiditySide !== 0) return 'humidity';
  return undefined;
}
