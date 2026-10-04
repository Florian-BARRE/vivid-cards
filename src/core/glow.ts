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
export function halo(blur: number, color: string, spread = 0): string {
  const grow = spread ? ` calc(${spread}px * var(--vivid-glow, 1))` : '';
  return `0 0 calc(${blur}px * var(--vivid-glow, 1))${grow} ${color}`;
}

/** Like `halo`, shifted sideways (the shift follows `--vivid-glow` too). */
function sideHalo(x: number, blur: number, color: string, spread = 0): string {
  const grow = spread ? ` calc(${spread}px * var(--vivid-glow, 1))` : '';
  return `calc(${x}px * var(--vivid-glow, 1)) 0 calc(${blur}px * var(--vivid-glow, 1))${grow} ${color}`;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
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
const DARK_ICON = 'rgba(0, 0, 0, 0.72)';

/** Relative luminance (0–1) of an sRGB color. */
export function luminance([r, g, b]: Rgb): number {
  const linear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** White on colored surfaces, dark on very light ones (white or warm white light). */
export function iconOn(rgb: Rgb): string {
  return luminance(rgb) >= 0.6 ? DARK_ICON : WHITE;
}

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
 * icon on it. Several colors (a group) make a gradient, haloed with their mean
 * and with the first and last colors bleeding out on each side.
 *
 * The halo grows with the brightness (percent): a soft rim when dimmed, a wide
 * bright bloom at full power.
 */
export function lightTone(
  rgb: Rgb | readonly Rgb[] | undefined,
  isOn: boolean,
  brightness = 100,
): ChipTone {
  const colors = rgb === undefined ? [] : isRgbList(rgb) ? rgb : [rgb];
  const first = colors[0];
  if (!isOn || !first) return {};
  // Slightly steeper than linear: dimmed lights stay calm, full power really blooms.
  const level = (clamp(brightness, 0, 100) / 100) ** 1.2;
  const inner = (color: Rgb) => halo(round(4 + 14 * level), rgbCss(color, 0.3 + 0.5 * level));
  const bloomBlur = round(8 + 52 * level);
  const bloomSpread = round(4 * level);
  const bloomAlpha = 0.08 + 0.72 * level;
  if (colors.length === 1) {
    return {
      background: rgbCss(first),
      iconColor: iconOn(first),
      shadow: `${inner(first)}, ${halo(bloomBlur, rgbCss(first, bloomAlpha), bloomSpread)}`,
    };
  }
  const last = colors[colors.length - 1] ?? first;
  const shift = round(4 + 8 * level);
  const stops = colors.map(
    (color, index) => `${rgbCss(color)} ${Math.round((index / (colors.length - 1)) * 100)}%`,
  );
  return {
    background: `linear-gradient(120deg, ${stops.join(', ')})`,
    iconColor: iconOn(meanColor(colors)),
    shadow: [
      inner(meanColor(colors)),
      sideHalo(-shift, bloomBlur, rgbCss(first, bloomAlpha), bloomSpread),
      sideHalo(shift, bloomBlur, rgbCss(last, bloomAlpha), bloomSpread),
    ].join(', '),
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
