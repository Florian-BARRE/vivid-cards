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

/** Named halo strengths, kept for older configurations. */
export type GlowLevel = 'off' | 'soft' | 'normal' | 'strong';

/** Halo strength in percent (100 = default), or one of the named levels. */
export type GlowSetting = GlowLevel | number;

export const GLOW_LEVELS: GlowLevel[] = ['off', 'soft', 'normal', 'strong'];

export const GLOW_PERCENT: Record<GlowLevel, number> = {
  off: 0,
  soft: 50,
  normal: 100,
  strong: 170,
};

/** Upper bound of the strength and boost settings, in percent. */
export const GLOW_MAX = 200;

/** Editor field (`ha-form` number selector) for the halo strength and boost. */
export const GLOW_SLIDER = {
  number: { min: 0, max: GLOW_MAX, step: 10, mode: 'slider', unit_of_measurement: '%' },
};

/** Strength in percent of a setting; `undefined` when it is not one. */
export function glowPercent(value: unknown): number | undefined {
  if (typeof value === 'string' && value in GLOW_PERCENT) return GLOW_PERCENT[value as GlowLevel];
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= GLOW_MAX) {
    return value;
  }
  return undefined;
}

/**
 * CSS variables carrying a halo strength (percent) to every halo below them:
 * both the size and the opacity follow it, so 50 % is a discreet halo and
 * 200 % a wide, bright one. The same value looks the same on every component.
 */
export function glowVars(percent: number): Record<string, string> {
  const factor = Math.max(0, percent) / 100;
  return {
    '--vivid-glow': String(round2(factor)),
    '--vivid-glow-alpha': String(round2(factor)),
    '--vivid-glow-play': factor === 0 ? 'paused' : 'running',
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Halo sizes are given for a 36 px control. Each glowing element sets
 * `--vivid-glow-size` to its own size over 36 (a 56 px lamp button: 1.56),
 * so a halo keeps the same proportions on a badge and on a big button.
 */
export const GLOW_REFERENCE_PX = 36;

/** `--vivid-glow-size` of an element `px` wide. */
export function glowSize(px: number): string {
  return String(round2(px / GLOW_REFERENCE_PX));
}

/** A halo color whose opacity follows `--vivid-glow-alpha`. */
function glowColor([r, g, b]: Rgb, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, calc(${round2(alpha)} * var(--vivid-glow-alpha, 1)))`;
}

/** A length (px for a 36 px element) scaled by the strength and the element size. */
function glowLength(px: number): string {
  return `calc(${px}px * var(--vivid-glow, 1) * var(--vivid-glow-size, 1))`;
}

/**
 * Box shadow whose blur follows `--vivid-glow` and `--vivid-glow-size`, and
 * opacity `--vivid-glow-alpha` (0 removes it).
 */
export function halo(blur: number, rgb: Rgb, alpha: number, spread = 0): string {
  const grow = spread ? ` ${glowLength(spread)}` : '';
  return `0 0 ${glowLength(blur)}${grow} ${glowColor(rgb, alpha)}`;
}

/** Like `halo`, shifted sideways (the shift scales too). */
function sideHalo(x: number, blur: number, rgb: Rgb, alpha: number, spread = 0): string {
  const grow = spread ? ` ${glowLength(spread)}` : '';
  return `${glowLength(x)} 0 ${glowLength(blur)}${grow} ${glowColor(rgb, alpha)}`;
}

/**
 * Halo level (0–1) for a brightness (percent). `boost` (percent) sets how much
 * the brightness matters: 100 is the default curve, 0 the same halo at any
 * brightness, 200 a calm halo when dimmed and a strong one near full.
 */
export function glowLevel(brightness: number, boost = 100): number {
  // Slightly steeper than linear: dimmed lights stay calm, full power really blooms.
  const curve = (clamp(brightness, 0, 100) / 100) ** 1.2;
  return clamp(0.5 + (curve - 0.5) * (Math.max(0, boost) / 100), 0, 1);
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
    shadow: glowShadow([rgb], ratio),
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
  boost = 100,
): ChipTone {
  const colors = rgb === undefined ? [] : isRgbList(rgb) ? rgb : [rgb];
  const first = colors[0];
  if (!isOn || !first) return {};
  const level = glowLevel(brightness, boost);
  if (colors.length === 1) {
    return {
      background: rgbCss(first),
      iconColor: iconOn(first),
      shadow: glowShadow(colors, level),
    };
  }
  const stops = colors.map(
    (color, index) => `${rgbCss(color)} ${Math.round((index / (colors.length - 1)) * 100)}%`,
  );
  return {
    background: `linear-gradient(120deg, ${stops.join(', ')})`,
    iconColor: iconOn(meanColor(colors)),
    shadow: glowShadow(colors, level),
  };
}

/** Luminance of Home Assistant's amber, the reference of `glowAlpha`. */
const AMBER_LUMINANCE = luminance(AMBER);

/**
 * The reference halo: the lamp badge with every lamp on, as validated on a
 * real dashboard (0.9.1 at 50 %). On its 28 px disc that is a 3 px rim and an
 * 11 px bloom at 0.24 opacity; the sizes below are for 36 px.
 */
const AMBER_ALPHA = 0.24;

/**
 * Opacity of a halo at full level. At the same opacity a bright color glows
 * far more than a dark one (amber against purple), so the opacity follows the
 * inverse of the luminance: every color reads about as strong.
 */
export function glowAlpha(rgb: Rgb): number {
  const ratio = AMBER_LUMINANCE / Math.max(luminance(rgb), 0.01);
  return round2(clamp(AMBER_ALPHA * ratio ** 0.75, 0.16, 0.7));
}

/**
 * The one halo of every lit element: a thin rim and a bloom around it, both
 * growing with `level` (0–1: brightness, consumption, severity…). Several
 * colors (a group) bleed out on each side with the first and last.
 */
export function glowShadow(colors: readonly Rgb[], level: number): string {
  const first = colors[0];
  if (!first) return '';
  const k = clamp(level, 0, 1);
  const rim = (color: Rgb) =>
    halo(round(1.5 + 2.7 * k), color, round2((0.35 + 0.65 * k) * glowAlpha(color)));
  const blur = round(3 + 11 * k);
  const spread = round(0.9 * k);
  const bloom = (color: Rgb) => round2((0.1 + 0.9 * k) * glowAlpha(color));
  if (colors.length === 1) return `${rim(first)}, ${halo(blur, first, bloom(first), spread)}`;
  const last = colors[colors.length - 1] ?? first;
  const shift = round(1 + 2 * k);
  return [
    rim(meanColor(colors)),
    sideHalo(-shift, blur, first, bloom(first), spread),
    sideHalo(shift, blur, last, bloom(last), spread),
  ].join(', ');
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
    shadow: glowShadow([AMBER], 0.35),
  };
}

/** Home Assistant's light amber: the color warm white lights take on badges. */
export const LIGHT_AMBER: Rgb = AMBER;

const WHITE_TONES: readonly (readonly [number, Rgb])[] = [
  [2700, AMBER],
  [4000, [255, 222, 150]],
  [5500, [228, 238, 255]],
];

/**
 * Display color of a white light: amber when warm (or when it reports no
 * temperature), paler towards neutral, cool white above 5500 K. Black-body
 * colors look orange next to Home Assistant's own badges.
 */
export function whiteTone(kelvin?: number): Rgb {
  if (kelvin === undefined || !Number.isFinite(kelvin)) return AMBER;
  return blendStops(WHITE_TONES, kelvin);
}

/**
 * Softer look for white lights, close to Home Assistant's: a translucent fill
 * in the light's tone, the icon in that tone, and the same halo as
 * `lightTone`. The icon tone leans towards the text color so it reads on both
 * light and dark themes.
 */
export function softLightTone(
  rgb: Rgb | readonly Rgb[] | undefined,
  isOn: boolean,
  brightness = 100,
  boost = 100,
): ChipTone {
  const colors = rgb === undefined ? [] : isRgbList(rgb) ? rgb : [rgb];
  if (!isOn || colors.length === 0) return {};
  const tone = meanColor(colors);
  const level = glowLevel(brightness, boost);
  return {
    background: rgbCss(tone, 0.24 + 0.16 * level),
    iconColor: `color-mix(in srgb, ${rgbCss(tone)} 78%, var(--primary-text-color, #ffffff))`,
    shadow: lightTone(colors, true, brightness, boost).shadow,
  };
}

/**
 * Tinted tone of a status badge: a translucent fill in `rgb`, the icon in
 * that color and the light halo, all at `level` (0–1) instead of a
 * brightness. Severity-driven badges (an open window for long, a low battery)
 * raise the level as the situation gets worse.
 */
export function tintTone(rgb: Rgb, level: number): ChipTone {
  const k = clamp(level, 0, 1);
  return {
    background: rgbCss(rgb, 0.24 + 0.16 * k),
    iconColor: `color-mix(in srgb, ${rgbCss(rgb)} 78%, var(--primary-text-color, #ffffff))`,
    shadow: glowShadow([rgb], k),
  };
}

/** Linear blend of colors placed at `stops` (ascending positions), at `position`. */
export function blendStops(stops: readonly (readonly [number, Rgb])[], position: number): Rgb {
  const first = stops[0];
  if (!first) return [0, 0, 0];
  if (position <= first[0]) return first[1];
  for (let index = 1; index < stops.length; index += 1) {
    const to = stops[index] as readonly [number, Rgb];
    const from = stops[index - 1] as readonly [number, Rgb];
    if (position <= to[0]) {
      const t = (position - from[0]) / Math.max(to[0] - from[0], Number.EPSILON);
      return from[1].map((value, channel) =>
        Math.round(value + ((to[1][channel] ?? value) - value) * t),
      ) as Rgb;
    }
  }
  return (stops[stops.length - 1] as readonly [number, Rgb])[1];
}
