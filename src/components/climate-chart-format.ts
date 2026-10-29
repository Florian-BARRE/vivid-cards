import type { ClimateKind } from '../core/climate';
import type { HomeAssistant } from '../core/hass-types';
import { formatNumber, localize, type StringKey, localeOf } from '../i18n';
import type { ClimateRange } from './vivid-climate-chart';
import type { TickFormat } from './climate-chart-model';

/** Labels and number formats shared by the climate charts. */

export const RANGE_LABELS: Record<ClimateRange, StringKey> = {
  '6h': 'range_6h',
  '24h': 'range_24h',
  '7d': 'range_7d',
  '30d': 'cc_range_30d',
};

export const KIND_LABELS: Record<ClimateKind, StringKey> = {
  temperature: 'cc_temperature',
  humidity: 'cc_humidity',
  pressure: 'cc_pressure',
  co2: 'cc_co2',
};

export const KIND_ICONS: Record<ClimateKind, string> = {
  temperature: 'mdi:thermometer',
  humidity: 'mdi:water-percent',
  pressure: 'mdi:gauge',
  co2: 'mdi:molecule-co2',
};

const DIGITS: Record<ClimateKind, number> = { temperature: 1, humidity: 0, pressure: 0, co2: 0 };

function locale(hass: HomeAssistant | undefined): string {
  return localeOf(hass);
}

/**
 * Like the i18n `formatNumber`, with a fixed number of decimals so a
 * reading keeps its precision ("18,0°", not "18°").
 */
export function fixedNumber(
  hass: HomeAssistant | undefined,
  value: number,
  digits: number,
): string {
  try {
    return new Intl.NumberFormat(locale(hass), {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return formatNumber(hass, value, digits);
  }
}

/** "19,6 °C", "58 %", "1 008 hPa"; `short` drops the temperature unit letter: "19,6°". */
export function formatClimate(
  hass: HomeAssistant | undefined,
  kind: ClimateKind,
  value: number,
  unit: string,
  short = false,
  digits = DIGITS[kind],
): string {
  const number = fixedNumber(hass, value, digits);
  if (kind === 'temperature') return short ? `${number}°` : `${number} ${unit}`;
  return `${number} ${unit}`;
}

/** A difference with its sign: "+0,8°", "−3 %". */
export function formatDelta(
  hass: HomeAssistant | undefined,
  kind: ClimateKind,
  value: number,
  unit: string,
  digits = DIGITS[kind],
): string {
  const rounded = Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value;
  const sign = rounded > 0 ? '+' : rounded < 0 ? '−' : '±';
  return `${sign}${formatClimate(hass, kind, Math.abs(rounded), unit, true, digits)}`;
}

/** Trend per hour: "−0,3 °C/h". */
export function formatTrend(
  hass: HomeAssistant | undefined,
  kind: ClimateKind,
  perHour: number,
  unit: string,
): string {
  const digits = kind === 'temperature' || kind === 'pressure' ? 1 : 0;
  const value = formatDelta(hass, kind, perHour, unit, digits).replace(/°$/, ` ${unit}`);
  return localize(hass, 'cc_per_hour', { value });
}

/** Hours and minutes: "13:05". */
export function formatClock(hass: HomeAssistant | undefined, time: number): string {
  return new Intl.DateTimeFormat(locale(hass), { hour: '2-digit', minute: '2-digit' }).format(
    new Date(time),
  );
}

/** A dated point: the clock over a day, the weekday and clock over a week, the date beyond. */
export function formatWhen(
  hass: HomeAssistant | undefined,
  time: number,
  range: ClimateRange,
  compact = false,
): string {
  if (range === '6h' || range === '24h') {
    return compact
      ? new Intl.DateTimeFormat(locale(hass), { hour: '2-digit' }).format(new Date(time))
      : formatClock(hass, time);
  }
  if (compact) {
    return new Intl.DateTimeFormat(locale(hass), {
      weekday: range === '7d' ? 'short' : undefined,
      day: range === '30d' ? 'numeric' : undefined,
      month: range === '30d' ? 'short' : undefined,
    }).format(new Date(time));
  }
  return new Intl.DateTimeFormat(locale(hass), {
    weekday: range === '30d' ? undefined : 'short',
    day: range === '30d' ? 'numeric' : undefined,
    month: range === '30d' ? 'short' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(time));
}

/** Time axis label. */
export function formatTick(hass: HomeAssistant | undefined, time: number, format: TickFormat) {
  const options: Intl.DateTimeFormatOptions =
    format === 'hour'
      ? { hour: '2-digit' }
      : format === 'weekday'
        ? { weekday: 'short' }
        : { day: 'numeric', month: 'short' };
  return new Intl.DateTimeFormat(locale(hass), options).format(new Date(time));
}

/** Day label next to a midnight separator: "jeu. 29". */
export function formatDay(hass: HomeAssistant | undefined, time: number): string {
  return new Intl.DateTimeFormat(locale(hass), { weekday: 'short', day: 'numeric' }).format(
    new Date(time),
  );
}

/** A round bound (axis tick, comfort limit) without needless decimals: "19 °C", "66,2 °F". */
export function formatBound(
  hass: HomeAssistant | undefined,
  kind: ClimateKind,
  value: number,
  unit: string,
  short = false,
): string {
  const rounded = Math.round(value * 10) / 10;
  return formatClimate(
    hass,
    kind,
    rounded,
    unit,
    short,
    Number.isInteger(rounded) ? 0 : DIGITS[kind],
  );
}
