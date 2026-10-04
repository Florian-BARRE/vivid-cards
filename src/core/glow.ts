import { clamp, rgbCss } from './color';
import type { Rgb } from './hass-types';

/**
 * Visual tone of a chip. Every field is a ready-to-use CSS value; an empty
 * field keeps the theme default.
 */
export interface ChipTone {
  background?: string;
  color?: string;
  iconColor?: string;
  shadow?: string;
  /** Duration of the icon pulse animation; no pulse when undefined. */
  pulse?: string;
}

export interface PowerScale {
  /** Below this consumption (W) the device is considered idle. */
  idle: number;
  /** Consumption (W) at which the glow reaches its maximum. */
  max: number;
  /** Two thresholds (W) switching the hue from yellow to amber to orange. */
  steps: readonly [number, number];
}

const POWER_LOW: Rgb = [255, 213, 79];
const POWER_MID: Rgb = [255, 179, 0];
const POWER_HIGH: Rgb = [255, 112, 67];
const AMBER: Rgb = [255, 193, 7];
const WHITE = '#ffffff';

/** 0 when idle, 1 at `max`. */
export function powerRatio(watts: number, scale: PowerScale): number {
  if (watts < scale.idle) return 0;
  if (scale.max <= scale.idle) return 1;
  return clamp((watts - scale.idle) / (scale.max - scale.idle), 0, 1);
}

export function powerColor(watts: number, scale: PowerScale): Rgb {
  if (watts < scale.steps[0]) return POWER_LOW;
  if (watts < scale.steps[1]) return POWER_MID;
  return POWER_HIGH;
}

/**
 * The more a device draws, the brighter, wider and faster its badge glows.
 * Idle devices get the neutral theme tone and no animation.
 */
export function powerTone(watts: number | undefined, scale: PowerScale): ChipTone {
  if (watts === undefined || watts < scale.idle) {
    return { iconColor: 'var(--disabled-text-color, rgba(255, 255, 255, 0.4))' };
  }
  const ratio = powerRatio(watts, scale);
  const rgb = powerColor(watts, scale);
  return {
    background: rgbCss(rgb, 0.15 + 0.35 * ratio),
    iconColor: 'var(--primary-text-color)',
    shadow: `0 0 ${Math.round(6 + 22 * ratio)}px ${rgbCss(rgb, 0.25 + 0.5 * ratio)}`,
    pulse: `${(2.6 - 1.8 * ratio).toFixed(2)}s`,
  };
}

/** Power button: filled with the light's own color and haloed while on; white icon on it. */
export function lightTone(rgb: Rgb | undefined, isOn: boolean): ChipTone {
  if (!isOn || !rgb) return {};
  return {
    background: rgbCss(rgb),
    iconColor: WHITE,
    shadow: `0 0 14px ${rgbCss(rgb, 0.45)}`,
  };
}

/** Amber when active, muted when inactive. */
export function toggleTone(active: boolean): ChipTone {
  if (!active) return { iconColor: 'var(--disabled-text-color, rgba(255, 255, 255, 0.4))' };
  return {
    background: rgbCss(AMBER, 0.2),
    iconColor: `var(--amber-color, ${rgbCss(AMBER)})`,
    shadow: `0 0 10px ${rgbCss(AMBER, 0.25)}`,
  };
}
