import { clamp } from './color';
import { blendStops } from './glow';
import type { Rgb } from './hass-types';

/**
 * Climate measures and their color scales, shared by the climate badges and
 * the climate charts so a value has the same color everywhere.
 */
export type ClimateKind = 'temperature' | 'humidity' | 'pressure' | 'co2';
export const CLIMATE_KINDS: ClimateKind[] = ['temperature', 'humidity', 'pressure', 'co2'];

/** Values inside the range are comfortable: neutral, no halo. */
export interface ComfortRange {
  low: number;
  high: number;
}

/** Comfort ranges in the scale units: °C, %, hPa, ppm. */
export const DEFAULT_COMFORT: Record<ClimateKind, ComfortRange> = {
  temperature: { low: 19, high: 23 },
  humidity: { low: 40, high: 60 },
  pressure: { low: 1005, high: 1025 },
  co2: { low: 400, high: 1000 },
};

type Stops = readonly (readonly [number, Rgb])[];

/** Blue when cold, yellow then orange while comfortable, red when hot (°C). */
export const TEMPERATURE_STOPS: Stops = [
  [14, [30, 95, 208]],
  [17, [63, 155, 240]],
  [19, [143, 208, 240]],
  [20, [255, 241, 168]],
  [21.5, [255, 213, 79]],
  [23, [255, 167, 38]],
  [25, [244, 81, 30]],
  [28, [211, 47, 47]],
];

/** Light cyan when dry to deep blue when very humid (%). */
export const HUMIDITY_STOPS: Stops = [
  [20, [178, 235, 242]],
  [35, [77, 208, 225]],
  [50, [41, 163, 224]],
  [65, [47, 125, 220]],
  [80, [47, 79, 196]],
  [95, [31, 47, 150]],
];

/**
 * Humidity for lines and text on a dark surface: the deepest blues are
 * lightened so a curve stays readable (at least 3:1 on #232323).
 */
export const HUMIDITY_LINE_STOPS: Stops = [
  [40, [63, 196, 224]],
  [50, [41, 163, 224]],
  [65, [58, 142, 240]],
  [80, [84, 112, 242]],
  [95, [106, 92, 245]],
];

/** Deep violet for a low (stormy) pressure to light lavender for a high one (hPa). */
export const PRESSURE_STOPS: Stops = [
  [975, [91, 52, 176]],
  [1000, [126, 92, 200]],
  [1015, [165, 140, 224]],
  [1045, [212, 198, 240]],
];

/** Healthy green to toxic swamp green (CO₂, ppm). */
export const CO2_STOPS: Stops = [
  [400, [67, 209, 122]],
  [800, [139, 211, 70]],
  [1000, [198, 214, 48]],
  [1400, [163, 168, 28]],
  [2000, [107, 122, 18]],
  [2500, [75, 86, 12]],
];

const STOPS: Record<ClimateKind, Stops> = {
  temperature: TEMPERATURE_STOPS,
  humidity: HUMIDITY_STOPS,
  pressure: PRESSURE_STOPS,
  co2: CO2_STOPS,
};

/** Ends of each scale, for gauges, legends and chart axes. */
export const SCALE_DOMAIN: Record<ClimateKind, readonly [number, number]> = {
  temperature: [14, 28],
  humidity: [20, 95],
  pressure: [975, 1045],
  co2: [400, 2500],
};

/** How far outside the comfort range the halo reaches its full strength. */
const FULL_HALO_DISTANCE: Record<ClimateKind, number> = {
  temperature: 4,
  humidity: 20,
  pressure: 20,
  co2: 1000,
};

/** Color of a value (in the scale units) on its scale. */
export function climateColor(kind: ClimateKind, value: number): Rgb {
  return blendStops(STOPS[kind], value);
}

/** Color of a value for a line or text drawn on a dark surface. */
export function climateLineColor(kind: ClimateKind, value: number): Rgb {
  return kind === 'humidity' ? blendStops(HUMIDITY_LINE_STOPS, value) : climateColor(kind, value);
}

/** The stops of a scale, for CSS and SVG gradients. */
export function climateStops(kind: ClimateKind, line = false): Stops {
  return line && kind === 'humidity' ? HUMIDITY_LINE_STOPS : STOPS[kind];
}

/** 0 inside the comfort range, else the distance to its nearest end. */
export function comfortDistance(value: number, comfort: ComfortRange): number {
  if (value < comfort.low) return comfort.low - value;
  if (value > comfort.high) return value - comfort.high;
  return 0;
}

/** Signed position against the comfort range: -1 below, 0 inside, 1 above. */
export function comfortSide(value: number, comfort: ComfortRange): -1 | 0 | 1 {
  if (value < comfort.low) return -1;
  if (value > comfort.high) return 1;
  return 0;
}

/** Halo strength (0–1): none in the comfort range, full well outside it. */
export function climateHalo(kind: ClimateKind, value: number, comfort: ComfortRange): number {
  return clamp(comfortDistance(value, comfort) / FULL_HALO_DISTANCE[kind], 0, 1);
}

/** Converts a temperature to °C from the unit of its sensor. */
export function toCelsius(value: number, unit: string | undefined): number {
  return unit === '°F' ? ((value - 32) * 5) / 9 : value;
}

/** Air quality levels from CO₂ (ppm). */
export type AirLevel = 'excellent' | 'good' | 'moderate' | 'poor' | 'toxic';
export const AIR_LEVELS: AirLevel[] = ['excellent', 'good', 'moderate', 'poor', 'toxic'];

/** Upper bound (ppm, excluded) of each level but the last. */
export const CO2_THRESHOLDS: Record<Exclude<AirLevel, 'toxic'>, number> = {
  excellent: 800,
  good: 1000,
  moderate: 1400,
  poor: 2000,
};

/** Level of a CO₂ reading. From `moderate` on, the room should be aired. */
export function airLevel(ppm: number): AirLevel {
  if (ppm < CO2_THRESHOLDS.excellent) return 'excellent';
  if (ppm < CO2_THRESHOLDS.good) return 'good';
  if (ppm < CO2_THRESHOLDS.moderate) return 'moderate';
  if (ppm < CO2_THRESHOLDS.poor) return 'poor';
  return 'toxic';
}

/** Leaf when the air is fresh, an open window when it is time to air, biohazard when toxic. */
export function airIcon(level: AirLevel): string {
  switch (level) {
    case 'excellent':
      return 'mdi:leaf';
    case 'good':
      return 'mdi:molecule-co2';
    case 'moderate':
    case 'poor':
      return 'mdi:window-open-variant';
    case 'toxic':
      return 'mdi:biohazard';
  }
}

/** The weather a pressure suggests (hPa). */
export function pressureIcon(hpa: number): string {
  if (hpa < 995) return 'mdi:weather-lightning-rainy';
  if (hpa < 1008) return 'mdi:weather-rainy';
  if (hpa < 1020) return 'mdi:weather-partly-cloudy';
  return 'mdi:weather-sunny';
}

/** A pressure drop (hPa) over three hours that announces a storm or strong wind. */
export const PRESSURE_DROP_ALERT = 3;
