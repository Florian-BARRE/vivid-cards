import type { HassEntity, LightAttributes, Rgb } from './hass-types';

/** Warm white used when a light reports no color (white-only strips, color temp off). */
export const WARM_WHITE: Rgb = [255, 214, 170];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isRgb(value: unknown): value is Rgb {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((c) => typeof c === 'number' && Number.isFinite(c))
  );
}

/** HSV (value = 100 %) to RGB. Hue in degrees, saturation in percent. */
export function hsToRgb(hue: number, saturation: number): Rgb {
  const h = (((hue % 360) + 360) % 360) / 60;
  const s = clamp(saturation, 0, 100) / 100;
  const chroma = s;
  const x = chroma * (1 - Math.abs((h % 2) - 1));
  const m = 1 - chroma;
  const [r, g, b] =
    h < 1
      ? [chroma, x, 0]
      : h < 2
        ? [x, chroma, 0]
        : h < 3
          ? [0, chroma, x]
          : h < 4
            ? [0, x, chroma]
            : h < 5
              ? [x, 0, chroma]
              : [chroma, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/** Approximate RGB of a black body at `kelvin` (Tanner Helland's fit). */
export function kelvinToRgb(kelvin: number): Rgb {
  const t = clamp(kelvin, 1000, 40000) / 100;
  const red = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  const green =
    t <= 66
      ? 99.4708025861 * Math.log(t) - 161.1195681661
      : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  const blue = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return [
    Math.round(clamp(red, 0, 255)),
    Math.round(clamp(green, 0, 255)),
    Math.round(clamp(blue, 0, 255)),
  ];
}

/** The color a light currently emits, or `undefined` when it does not report one. */
export function lightColor(state: HassEntity | undefined): Rgb | undefined {
  if (!state) return undefined;
  const attributes = state.attributes as LightAttributes;
  if (isRgb(attributes.rgb_color)) return attributes.rgb_color;
  const hs = attributes.hs_color;
  if (Array.isArray(hs) && typeof hs[0] === 'number' && typeof hs[1] === 'number') {
    return hsToRgb(hs[0], hs[1]);
  }
  if (typeof attributes.color_temp_kelvin === 'number') {
    return kelvinToRgb(attributes.color_temp_kelvin);
  }
  return undefined;
}

export function rgbCss(rgb: Rgb, alpha = 1): string {
  const [r, g, b] = rgb;
  return alpha >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${round2(alpha)})`;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** `"#ff8800"`, `"#f80"`, `"ff8800"` or `[255, 136, 0]`; `undefined` when invalid. */
export function parseColor(value: unknown): Rgb | undefined {
  if (isRgb(value)) {
    return value.every((c) => c >= 0 && c <= 255) ? (value.map(Math.round) as Rgb) : undefined;
  }
  if (typeof value !== 'string') return undefined;
  const hex = value.trim().replace(/^#/, '');
  const full = /^[0-9a-f]{3}$/i.test(hex) ? [...hex].map((c) => c + c).join('') : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return undefined;
  return [0, 2, 4].map((index) => Number.parseInt(full.slice(index, index + 2), 16)) as Rgb;
}

export function rgbHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** Euclidean distance between two colors, 0–441. */
export function colorDistance(a: Rgb, b: Rgb): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
