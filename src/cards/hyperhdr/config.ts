import { glowPercent, type GlowSetting } from '../../core/glow';
import type { LovelaceCardConfig } from '../../core/hass-types';

export const HYPERHDR_CARD = 'vivid-hyperhdr-card';

/**
 * `strip`: one LED strip (a HyperHDR instance); `hub`: the machine HyperHDR
 * runs on and what it captures; `all`: the hub and every strip.
 */
export type HyperHdrMode = 'all' | 'hub' | 'strip';
export const MODES: HyperHdrMode[] = ['all', 'hub', 'strip'];

/** What a strip's line tells, in this order. */
export const STRIP_INFO = ['source', 'device', 'fps', 'leds', 'brightness'] as const;
export type StripInfo = (typeof STRIP_INFO)[number];
export const DEFAULT_STRIP_INFO: StripInfo[] = ['source', 'device', 'fps'];

/** What the hub's line tells, in this order. */
export const HUB_INFO = [
  'input',
  'video_mode',
  'capture_fps',
  'temperature',
  'cpu',
  'memory',
  'version',
  'strips',
] as const;
export type HubInfo = (typeof HUB_INFO)[number];
export const DEFAULT_HUB_INFO: HubInfo[] = ['input', 'video_mode', 'capture_fps'];

/** Values on the right of the hub's line. */
export const HUB_VALUES = ['temperature', 'cpu', 'memory', 'capture_fps'] as const;
export type HubValue = (typeof HUB_VALUES)[number];
export const DEFAULT_HUB_VALUES: HubValue[] = ['temperature', 'cpu'];

/** Components a strip's line can show the state of. */
export const STRIP_ICONS = [
  'led_output',
  'video_capture',
  'hdr',
  'smoothing',
  'black_border',
] as const;
export type StripIcon = (typeof STRIP_ICONS)[number];
export const DEFAULT_STRIP_ICONS: StripIcon[] = ['hdr'];

/** Seconds the picture plays in the details before it stops by itself. */
export const PICTURE_TIMEOUTS = [60, 120, 300] as const;
export const DEFAULT_PICTURE_TIMEOUT = 120;

export interface HyperHdrCardConfig extends LovelaceCardConfig {
  mode?: HyperHdrMode;
  /** The HyperHDR server device; the first one found when left out. */
  server?: string;
  /** The instance device shown by the `strip` mode; the first one when left out. */
  instance?: string;
  name?: string;
  /** Second line of the hub, in this order. */
  hub_info?: string[];
  /** Values on the right of the hub's line. */
  hub_values?: string[];
  /** Second line of each strip, in this order. */
  strip_info?: string[];
  /** Components whose state each strip's line shows. */
  strip_icons?: string[];
  /** `all` mode: one line per strip (default on). */
  show_strips?: boolean;
  /** Each strip's power button (default on). */
  show_power?: boolean;
  /** Seconds the picture plays in the details before it stops (60, 120 or 300). */
  picture_timeout?: number;
  glow?: GlowSetting;
}

export interface ResolvedHyperHdrConfig {
  mode: HyperHdrMode;
  server?: string;
  instance?: string;
  name?: string;
  hubInfo: HubInfo[];
  hubValues: HubValue[];
  stripInfo: StripInfo[];
  stripIcons: StripIcon[];
  showStrips: boolean;
  showPower: boolean;
  pictureTimeout: number;
  glow: number;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/** The known items of `value`, in its order, without repeats; `fallback` when not a list. */
function pick<T extends string>(value: unknown, known: readonly T[], fallback: T[]): T[] {
  if (!Array.isArray(value)) return [...fallback];
  const out: T[] = [];
  for (const item of value) {
    if (known.includes(item as T) && !out.includes(item as T)) out.push(item as T);
  }
  return out;
}

export function resolveHyperHdrConfig(config: HyperHdrCardConfig): ResolvedHyperHdrConfig {
  if (!config || typeof config !== 'object') throw new Error('Invalid configuration');
  const mode = MODES.includes(config.mode as HyperHdrMode) ? (config.mode as HyperHdrMode) : 'all';
  const timeout = Number(config.picture_timeout);
  return {
    mode,
    server: text(config.server),
    instance: text(config.instance),
    name: text(config.name),
    hubInfo: pick(config.hub_info, HUB_INFO, DEFAULT_HUB_INFO),
    hubValues: pick(config.hub_values, HUB_VALUES, DEFAULT_HUB_VALUES),
    stripInfo: pick(config.strip_info, STRIP_INFO, DEFAULT_STRIP_INFO),
    stripIcons: pick(config.strip_icons, STRIP_ICONS, DEFAULT_STRIP_ICONS),
    showStrips: config.show_strips !== false,
    showPower: config.show_power !== false,
    pictureTimeout: (PICTURE_TIMEOUTS as readonly number[]).includes(timeout)
      ? timeout
      : DEFAULT_PICTURE_TIMEOUT,
    glow: glowPercent(config.glow) ?? 100,
  };
}
