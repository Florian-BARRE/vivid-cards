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

/** How strong halos are; applied through the `--vivid-glow` CSS factor. */
export type GlowLevel = 'off' | 'soft' | 'normal' | 'strong';

export const GLOW_FACTORS: Record<GlowLevel, number> = {
  off: 0,
  soft: 0.5,
  normal: 1,
  strong: 1.7,
};

/** Box shadow whose blur follows `--vivid-glow` (0 removes it). */
export function halo(blur: number, color: string): string {
  return `0 0 calc(${blur}px * var(--vivid-glow, 1)) ${color}`;
}

export interface PowerScale {
  /** Below this consumption (W) the device is considered idle. */
  idle: number;
  /** Consumption (W) at which the glow reaches its maximum. */
  max: number;
  /** Two thresholds (W) switching the hue from yellow to amber to orange. */
  steps: readonly [number, number];
  /** Low, mid and high colors. */
  colors?: readonly [Rgb, Rgb, Rgb];
}

/** Yellow, amber, orange. */
export const DEFAULT_POWER_COLORS: [Rgb, Rgb, Rgb] = [
  [255, 213, 79],
  [255, 179, 0],
  [255, 112, 67],
];
const AMBER: Rgb = [255, 193, 7];
const WHITE = '#ffffff';

/** 0 when idle, 1 at `max`. */
export function powerRatio(watts: number, scale: PowerScale): number {
  if (watts < scale.idle) return 0;
  if (scale.max <= scale.idle) return 1;
  return clamp((watts - scale.idle) / (scale.max - scale.idle), 0, 1);
}

export function powerColor(watts: number, scale: PowerScale): Rgb {
  const [low, mid, high] = scale.colors ?? DEFAULT_POWER_COLORS;
  if (watts < scale.steps[0]) return low;
  if (watts < scale.steps[1]) return mid;
  return high;
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
    shadow: halo(Math.round(6 + 22 * ratio), rgbCss(rgb, 0.25 + 0.5 * ratio)),
    pulse: `${(2.6 - 1.8 * ratio).toFixed(2)}s`,
  };
}

/**
 * Power button: filled with the light's own color and haloed while on; white
 * icon on it. Several colors (a group) make a gradient haloed with their mean.
 */
export function lightTone(rgb: Rgb | readonly Rgb[] | undefined, isOn: boolean): ChipTone {
  const colors = rgb === undefined ? [] : isRgbList(rgb) ? rgb : [rgb];
  const first = colors[0];
  if (!isOn || !first) return {};
  if (colors.length === 1) {
    return { background: rgbCss(first), iconColor: WHITE, shadow: halo(14, rgbCss(first, 0.45)) };
  }
  const stops = colors.map(
    (color, index) => `${rgbCss(color)} ${Math.round((index / (colors.length - 1)) * 100)}%`,
  );
  return {
    background: `linear-gradient(120deg, ${stops.join(', ')})`,
    iconColor: WHITE,
    shadow: halo(14, rgbCss(meanColor(colors), 0.45)),
  };
}

function isRgbList(value: Rgb | readonly Rgb[]): value is readonly Rgb[] {
  return Array.isArray(value[0]);
}

export function meanColor(colors: readonly Rgb[]): Rgb {
  const sum = colors.reduce<[number, number, number]>(
    (total, [r, g, b]) => [total[0] + r, total[1] + g, total[2] + b],
    [0, 0, 0],
  );
  return sum.map((value) => Math.round(value / Math.max(colors.length, 1))) as Rgb;
}

/** A switch that is on: tinted with the theme's primary color. */
export function activeTone(active: boolean): ChipTone {
  if (!active) return { iconColor: 'var(--secondary-text-color)' };
  return {
    background: 'rgba(var(--rgb-primary-color, 3, 169, 244), 0.2)',
    iconColor: 'var(--primary-color, #03a9f4)',
  };
}

/** Amber when active, muted when inactive. */
export function toggleTone(active: boolean): ChipTone {
  if (!active) return { iconColor: 'var(--disabled-text-color, rgba(255, 255, 255, 0.4))' };
  return {
    background: rgbCss(AMBER, 0.2),
    iconColor: `var(--amber-color, ${rgbCss(AMBER)})`,
    shadow: halo(10, rgbCss(AMBER, 0.25)),
  };
}
