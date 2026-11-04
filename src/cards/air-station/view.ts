import { climateColor, climateLineColor } from '../../core/climate';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import { localeOf, localize, type StringKey } from '../../i18n';
import type { AirInfo } from './config';
import {
  culprit,
  type Advice,
  type AirStationModel,
  type Co2Level,
  type Comfort,
  type StationPage,
} from './model';

/** Card colors of the comfort levels: the frame's hues, toned down for a white icon. */
export const COMFORT_UI: Record<Comfort, Rgb> = {
  excellent: [0, 200, 100],
  good: [124, 179, 66],
  fair: [245, 124, 0],
  poor: [229, 57, 53],
};
export const ALERT_RGB: Rgb = [229, 57, 53];
export const GREY: Rgb = [158, 158, 158];
export const GREEN: Rgb = [102, 187, 106];
export const AMBER: Rgb = [255, 167, 38];

export const COMFORT_TEXT: Record<Comfort, StringKey> = {
  excellent: 'air_comfort_excellent',
  good: 'air_comfort_good',
  fair: 'air_comfort_fair',
  poor: 'air_comfort_poor',
};
export const CO2_TEXT: Record<Co2Level, StringKey> = {
  excellent: 'air_co2_excellent',
  good: 'air_co2_good',
  fair: 'air_co2_fair',
  bad: 'air_co2_bad',
  critical: 'air_co2_critical',
};
export const ADVICE_TEXT: Record<Advice, StringKey> = {
  now: 'air_advice_now',
  needed: 'air_advice_needed',
  degrading: 'air_advice_degrading',
  excellent: 'air_advice_excellent',
  ok: 'air_advice_ok',
};
export const PAGE_TEXT: Record<StationPage, StringKey> = {
  boot: 'air_page_boot',
  data: 'air_page_data',
  co2: 'air_page_co2',
  temp: 'air_page_temp',
  hum: 'air_page_hum',
  config: 'air_page_config',
};

/** Names of the firmware's effects. */
const EFFECT_TEXT: Record<string, StringKey> = {
  Aurora: 'air_fx_aurora',
  'CO2 Comet': 'air_fx_comet',
  'Thermal Plasma': 'air_fx_plasma',
  'Ocean Wave': 'air_fx_wave',
  'Boot Chase': 'air_fx_boot',
  'Galaxy Spin': 'air_fx_galaxy',
  'Custom Color': 'air_fx_custom',
  'Alert Strobe': 'air_fx_alert',
};

export function effectName(hass: HomeAssistant | undefined, effect: string): string {
  const key = EFFECT_TEXT[effect];
  return key ? localize(hass, key) : effect;
}

/** A small swatch of each effect, for the effect picker. */
export const EFFECT_SWATCH: Record<string, string> = {
  Aurora: 'linear-gradient(90deg, #00e676, #0a7a40, #00e676)',
  'CO2 Comet': 'linear-gradient(90deg, transparent, #43d17a)',
  'Thermal Plasma': 'linear-gradient(90deg, #1e5fd0, #ffd54f, #f4511e)',
  'Ocean Wave': 'linear-gradient(90deg, #00acc1, #1565c0, #00acc1)',
  'Boot Chase': 'linear-gradient(90deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f)',
  'Galaxy Spin': 'linear-gradient(90deg, #ffffff, #b39b7a, #ffffff)',
  'Alert Strobe': 'repeating-linear-gradient(90deg, #ff3b3b 0 6px, #000 6px 12px)',
};

/** "21,4" with exactly `digits` decimals, in the card's language. */
export function fixed(hass: HomeAssistant | undefined, value: number, digits = 0): string {
  try {
    return new Intl.NumberFormat(localeOf(hass), {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return value.toFixed(digits);
  }
}

/** The color of the line: the alarm, else the comfort level. */
export function lineColor(model: AirStationModel): Rgb | undefined {
  if (!model.online) return undefined;
  if (model.alert) return ALERT_RGB;
  return model.comfort ? COMFORT_UI[model.comfort] : undefined;
}

/** The icon of the line: what to do or what is wrong. */
export function lineIcon(model: AirStationModel): string {
  if (!model.online) return 'mdi:lan-disconnect';
  if (model.alert) return 'mdi:window-open-variant';
  if (model.power && model.night) return 'mdi:weather-night';
  switch (culprit(model)) {
    case 'co2':
      return 'mdi:molecule-co2';
    case 'temperature':
      return 'mdi:thermometer';
    case 'humidity':
      return 'mdi:water-percent';
    default:
      return 'mdi:leaf';
  }
}

/** The line under the name. */
export function statusLine(
  hass: HomeAssistant | undefined,
  model: AirStationModel,
): { text: string; tone?: 'alarm' | 'muted' } {
  if (!model.online) return { text: localize(hass, 'air_offline'), tone: 'alarm' };
  if (model.alert)
    return {
      text: localize(hass, model.advice ? ADVICE_TEXT[model.advice] : 'air_advice_now'),
      tone: 'alarm',
    };
  const comfort = model.comfort ? localize(hass, COMFORT_TEXT[model.comfort]) : undefined;
  if (!model.power) return { text: localize(hass, 'air_off'), tone: 'muted' };
  const second =
    model.night && model.ledBrightness !== undefined
      ? `${localize(hass, 'air_night')} ${Math.round(model.ledBrightness)}/255`
      : model.advice
        ? localize(hass, ADVICE_TEXT[model.advice]).toLocaleLowerCase()
        : undefined;
  return { text: [comfort, second].filter(Boolean).join(' · ') };
}

export interface ValueView {
  key: AirInfo;
  icon: string;
  rgb?: Rgb;
  text: string;
  unit: string;
  alarm: boolean;
  label: string;
}

/** The values next to the name, each in its own color. */
export function valueViews(
  hass: HomeAssistant | undefined,
  model: AirStationModel,
  items: readonly AirInfo[],
): ValueView[] {
  const views: ValueView[] = [];
  const muted = !model.online || !model.power;
  for (const key of items) {
    if (key === 'co2' && model.co2 !== undefined) {
      views.push({
        key,
        icon: 'mdi:molecule-co2',
        rgb: muted ? undefined : climateColor('co2', model.co2),
        text: fixed(hass, model.co2, 0),
        unit: 'ppm',
        alarm: !muted && model.alert,
        label: localize(hass, 'air_co2'),
      });
    } else if (key === 'temperature' && model.temperature !== undefined) {
      views.push({
        key,
        icon: 'mdi:thermometer',
        rgb: muted ? undefined : climateColor('temperature', model.temperature),
        text: fixed(hass, model.temperature, 1),
        unit: '°',
        alarm: !muted && model.temperatureSide !== undefined && model.temperatureSide !== 0,
        label: localize(hass, 'air_temperature'),
      });
    } else if (key === 'humidity' && model.humidity !== undefined) {
      views.push({
        key,
        icon: 'mdi:water-percent',
        rgb: muted ? undefined : climateLineColor('humidity', model.humidity),
        text: fixed(hass, model.humidity, 0),
        unit: '%',
        alarm: !muted && model.humiditySide !== undefined && model.humiditySide !== 0,
        label: localize(hass, 'air_humidity'),
      });
    } else if (key === 'dew_point' && model.dewPoint !== undefined) {
      views.push({
        key,
        icon: 'mdi:water-thermometer',
        rgb: muted ? undefined : [38, 198, 218],
        text: fixed(hass, model.dewPoint, 1),
        unit: '°',
        alarm: false,
        label: localize(hass, 'air_dew_point'),
      });
    }
  }
  return views;
}

export function rgbCss(rgb: Rgb, alpha = 1): string {
  return alpha >= 1 ? `rgb(${rgb.join(', ')})` : `rgba(${rgb.join(', ')}, ${alpha})`;
}
