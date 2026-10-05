import type { Rgb } from '../../core/hass-types';

/** Status colors shared by the badges. */
export const BLUE: Rgb = [66, 165, 245];
export const AMBER: Rgb = [255, 193, 7];
export const RED: Rgb = [239, 83, 80];
export const GREEN: Rgb = [102, 187, 106];

/** Halo level and pulse of each severity: calm, to watch, alert. */
export const SEVERITY = [
  { color: BLUE, level: 0.45, pulse: undefined },
  { color: AMBER, level: 0.65, pulse: undefined },
  { color: RED, level: 0.9, pulse: '1.6s' },
] as const;
