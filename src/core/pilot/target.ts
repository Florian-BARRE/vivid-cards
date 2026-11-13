/* ====== Code Summary ======
 * The Vivid Pilot mode of a card or badge: `pilot: <node>` stands for the
 * entity Vivid Pilot generated for that node (its group, its mean, its
 * power…). An entity or a list written by hand wins (manual mode).
 */

import type { HomeAssistant } from '../hass-types';
import { nodeKey, parseNodeKey, type PilotCategory } from './node-key';
import { PilotIndex, type PilotKind } from './pilot-index';

/** What a card says about its target. */
export interface PilotTargetConfig {
  entity?: string;
  entities?: string[];
  /** Vivid Pilot node (`salon__light`). */
  pilot?: string;
}

/** The entity a `pilot` node stands for, when nothing is written by hand. */
export function pilotTarget(
  hass: HomeAssistant,
  config: PilotTargetConfig,
  kind: PilotKind,
): string | undefined {
  if (config.entity || config.entities?.length || !config.pilot) return undefined;
  return PilotIndex.of(hass).entity(config.pilot, kind);
}

/** The config with `entity` set to the Pilot node's entity (Pilot mode), else unchanged. */
export function withPilotEntity<T extends PilotTargetConfig>(
  hass: HomeAssistant,
  config: T,
  kind: PilotKind,
): T {
  const entity = pilotTarget(hass, config, kind);
  return entity ? { ...config, entity } : config;
}

/**
 * The first Vivid Pilot node with an entity of `kind` in one of `categories`
 * (none: room nodes), for a new card's starting config; the home node of the
 * first category when Vivid Pilot has none yet.
 */
export function pilotStub(
  hass: HomeAssistant | undefined,
  kind: PilotKind,
  categories: readonly (PilotCategory | undefined)[],
): { pilot: string } {
  const index = hass ? PilotIndex.of(hass) : undefined;
  const node = index
    ?.nodes()
    .find((key) => index.entity(key, kind) && categories.includes(parseNodeKey(key).category));
  return { pilot: node ?? nodeKey(undefined, categories[0]) };
}
