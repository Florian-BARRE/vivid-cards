/**
 * One color per consumer (a room, its lights, LEDs or switches, a device),
 * always the same for the same statistic, so a device keeps its color in the
 * flow, the list and from one day to the next. Amber and indigo stay for
 * peak and off-peak hours.
 */
import type { Rgb } from '../core/hass-types';

export const DEVICE_COLORS: readonly Rgb[] = [
  [76, 195, 255],
  [255, 107, 154],
  [94, 224, 160],
  [197, 139, 255],
  [255, 162, 92],
  [159, 211, 86],
  [127, 214, 255],
  [255, 209, 102],
];

/** A stable color of a statistic id (a hash of the id into the palette). */
export function deviceColor(stat: string): Rgb {
  let hash = 0;
  for (let index = 0; index < stat.length; index++) {
    hash = (hash * 31 + stat.charCodeAt(index)) | 0;
  }
  return DEVICE_COLORS[Math.abs(hash) % DEVICE_COLORS.length]!;
}
