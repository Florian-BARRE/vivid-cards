import { glowPercent, type GlowSetting } from '../../core/glow';
import type { LovelaceCardConfig } from '../../core/hass-types';

export const HYPERHDR_CARD = 'vivid-hyperhdr-card';

/**
 * `strip`: one LED strip (a HyperHDR instance) with the captured picture;
 * `hub`: the machine HyperHDR runs on; `all`: the hub and every strip.
 */
export type HyperHdrMode = 'all' | 'hub' | 'strip';
export const MODES: HyperHdrMode[] = ['all', 'hub', 'strip'];

export interface HyperHdrCardConfig extends LovelaceCardConfig {
  mode?: HyperHdrMode;
  /** The HyperHDR server device; the first one found when left out. */
  server?: string;
  /** The instance device shown by the `strip` mode; the first one when left out. */
  instance?: string;
  name?: string;
  /** `strip` mode: show the captured picture with its LED frame (default on). */
  picture?: boolean;
  glow?: GlowSetting;
}

export interface ResolvedHyperHdrConfig {
  mode: HyperHdrMode;
  server?: string;
  instance?: string;
  name?: string;
  picture: boolean;
  glow: number;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function resolveHyperHdrConfig(config: HyperHdrCardConfig): ResolvedHyperHdrConfig {
  if (!config || typeof config !== 'object') throw new Error('Invalid configuration');
  const mode = MODES.includes(config.mode as HyperHdrMode) ? (config.mode as HyperHdrMode) : 'all';
  return {
    mode,
    server: text(config.server),
    instance: text(config.instance),
    name: text(config.name),
    picture: config.picture !== false,
    glow: glowPercent(config.glow) ?? 100,
  };
}
