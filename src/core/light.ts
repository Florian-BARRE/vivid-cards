import type { HassEntity, LightAttributes } from './hass-types';

export type ColorBar = 'hue' | 'temperature' | 'none';

const COLOR_MODES = new Set(['hs', 'rgb', 'rgbw', 'rgbww', 'xy']);

function modes(state: HassEntity | undefined): string[] {
  const value = (state?.attributes as LightAttributes | undefined)?.supported_color_modes;
  return Array.isArray(value) ? value : [];
}

export function supportsHue(state: HassEntity | undefined): boolean {
  return modes(state).some((mode) => COLOR_MODES.has(mode));
}

export function supportsTemperature(state: HassEntity | undefined): boolean {
  return modes(state).includes('color_temp');
}

/**
 * The color bar a light can actually use. `auto` picks hue for color lights,
 * temperature for tunable whites and nothing for dimmable-only lights; an
 * explicit choice the light cannot honor falls back to nothing.
 */
export function resolveColorBar(mode: 'auto' | ColorBar, state: HassEntity | undefined): ColorBar {
  if (mode === 'none') return 'none';
  const hue = supportsHue(state);
  const temperature = supportsTemperature(state);
  if (mode === 'hue') return hue ? 'hue' : 'none';
  if (mode === 'temperature') return temperature ? 'temperature' : 'none';
  return hue ? 'hue' : temperature ? 'temperature' : 'none';
}

export interface TemperatureRange {
  min: number;
  max: number;
}

/** Kelvin range of a tunable white light (HA defaults when not reported). */
export function temperatureRange(state: HassEntity | undefined): TemperatureRange {
  const attributes = (state?.attributes ?? {}) as Record<string, unknown>;
  const min =
    typeof attributes.min_color_temp_kelvin === 'number' ? attributes.min_color_temp_kelvin : 2000;
  const max =
    typeof attributes.max_color_temp_kelvin === 'number' ? attributes.max_color_temp_kelvin : 6535;
  return min < max ? { min, max } : { min: 2000, max: 6535 };
}
