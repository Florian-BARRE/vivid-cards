/**
 * Money and energy formatting, and the colors shared by the energy cards.
 */
import { blendStops } from '../core/glow';
import type { HomeAssistant, Rgb } from '../core/hass-types';

function locale(hass: HomeAssistant | undefined): string {
  return hass?.locale?.language ?? hass?.language ?? 'en';
}

/** "100,47 €", "100 €" with `digits` 0. */
export function formatMoney(hass: HomeAssistant | undefined, value: number, digits = 2): string {
  const currency = hass?.config?.currency || 'EUR';
  try {
    return new Intl.NumberFormat(locale(hass), {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${value.toFixed(digits)} ${currency}`;
  }
}

/** "20 kWh", "1,6 kWh" (one digit below 10). */
export function formatKwh(hass: HomeAssistant | undefined, kwh: number, digits?: number): string {
  const places = digits ?? (Math.abs(kwh) < 10 ? 1 : 0);
  try {
    return `${new Intl.NumberFormat(locale(hass), { maximumFractionDigits: places, minimumFractionDigits: 0 }).format(kwh)} kWh`;
  } catch {
    return `${kwh.toFixed(places)} kWh`;
  }
}

/** "+25 %", "−8 %". */
export function formatDelta(hass: HomeAssistant | undefined, ratio: number): string {
  const percent = Math.round(ratio * 100);
  const sign = percent > 0 ? '+' : percent < 0 ? '−' : '';
  try {
    return `${sign}${new Intl.NumberFormat(locale(hass)).format(Math.abs(percent))} %`;
  } catch {
    return `${sign}${Math.abs(percent)} %`;
  }
}

/** "12/10" in the user's language order. */
export function formatShortDate(hass: HomeAssistant | undefined, key: string): string {
  const [year, month, day] = key.split('-').map(Number) as [number, number, number];
  try {
    return new Intl.DateTimeFormat(locale(hass), { day: '2-digit', month: '2-digit' }).format(
      new Date(year, month - 1, day, 12),
    );
  } catch {
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
  }
}

/** "vendredi 23 octobre". */
export function formatLongDate(hass: HomeAssistant | undefined, key: string): string {
  const [year, month, day] = key.split('-').map(Number) as [number, number, number];
  try {
    return new Intl.DateTimeFormat(locale(hass), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date(year, month - 1, day, 12));
  } catch {
    return key;
  }
}

/** "octobre 2026". */
export function formatMonth(hass: HomeAssistant | undefined, year: number, month: number): string {
  try {
    return new Intl.DateTimeFormat(locale(hass), { month: 'long', year: 'numeric' }).format(
      new Date(year, month - 1, 15),
    );
  } catch {
    return `${year}-${String(month).padStart(2, '0')}`;
  }
}

/** Off-peak indigo and peak amber, as everywhere in the cards. */
export const OFF_PEAK_RGB: Rgb = [121, 134, 203];
export const PEAK_RGB: Rgb = [255, 193, 7];
export const SUBSCRIPTION_RGB: Rgb = [189, 189, 189];
export const GOOD_RGB: Rgb = [102, 187, 106];
export const WARN_RGB: Rgb = [255, 193, 7];
export const BAD_RGB: Rgb = [255, 112, 67];

/**
 * Color of a day by how much it cost compared with a usual day (the median):
 * cyan for a sober day, amber for a usual one, orange then red for an
 * expensive one.
 */
const COST_STOPS: [number, Rgb][] = [
  [0.55, [38, 198, 218]],
  [1, [255, 193, 7]],
  [1.35, [255, 112, 67]],
  [1.8, [239, 83, 80]],
];

export function costColor(ratio: number): Rgb {
  return blendStops(COST_STOPS, ratio);
}

/** The CSS gradient of the cost scale, for legends. */
export const COST_GRADIENT = `linear-gradient(90deg, ${COST_STOPS.map(([, rgb]) => `rgb(${rgb.join(', ')})`).join(', ')})`;

/** Color of an amount against the previous one: green below, amber up to +10 %, orange above. */
export function deltaColor(ratio: number | undefined): Rgb {
  if (ratio === undefined) return WARN_RGB;
  if (ratio < 0) return GOOD_RGB;
  if (ratio <= 0.1) return WARN_RGB;
  return BAD_RGB;
}

export function rgb(color: Rgb, alpha?: number): string {
  return alpha === undefined ? `rgb(${color.join(', ')})` : `rgba(${color.join(', ')}, ${alpha})`;
}

/** Median of numbers (0 when empty). */
export function median(values: readonly number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? (sorted[middle] ?? 0)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}
