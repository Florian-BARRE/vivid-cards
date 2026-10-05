import { expandGroup, friendlyName, isAvailable } from '../../core/entities';
import type { HassEntity, HomeAssistant } from '../../core/hass-types';
import { shortenSiblingNames } from '../../core/naming';
import type { Aggregate, ResolvedBaseBadge } from './config';

/** One entity behind a badge. */
export interface Member {
  entityId: string;
  /** Shortened against its siblings ("Salon Fenêtre", "Chambre Fenêtre" → "Salon", "Chambre"). */
  name: string;
  state?: HassEntity;
  available: boolean;
}

/**
 * Entities behind a badge: `entities` when listed, else the members of the
 * `entity` group (or the entity itself), else `fallback` (auto discovery).
 */
export function memberIds(
  hass: HomeAssistant,
  config: Pick<ResolvedBaseBadge, 'entity' | 'entities'>,
  fallback: () => string[] = () => [],
): string[] {
  const roots = config.entities ?? (config.entity ? [config.entity] : undefined);
  if (!roots) return fallback();
  const ids = roots.flatMap((id) => expandGroup(hass, id));
  return [...new Set(ids)];
}

export function members(hass: HomeAssistant, ids: readonly string[]): Member[] {
  const names = shortenSiblingNames(ids.map((id) => friendlyName(hass, id)));
  return ids.map((entityId, index) => {
    const state = hass.states[entityId];
    return { entityId, name: names[index] ?? entityId, state, available: isAvailable(state) };
  });
}

/** True when the badge stands for a group rather than one entity. */
export function isGroupBadge(
  config: Pick<ResolvedBaseBadge, 'entity' | 'entities'>,
  count: number,
) {
  return Boolean(config.entities) || count > 1 || !config.entity;
}

/** Entities the badge reads: the group itself and its members. */
export function watchedIds(
  config: Pick<ResolvedBaseBadge, 'entity' | 'entities'>,
  ids: readonly string[],
): string[] {
  return [...(config.entity ? [config.entity] : []), ...(config.entities ?? []), ...ids];
}

/** Combines values; `undefined` when there are none. */
export function aggregate(values: readonly number[], mode: Aggregate): number | undefined {
  if (values.length === 0) return undefined;
  switch (mode) {
    case 'sum':
      return values.reduce((sum, value) => sum + value, 0);
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    case 'median': {
      const sorted = [...values].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      return sorted.length % 2
        ? (sorted[middle] as number)
        : ((sorted[middle - 1] as number) + (sorted[middle] as number)) / 2;
    }
    default:
      return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
}

/** Seconds since the entity last changed state (0 when unknown). */
export function secondsSince(state: HassEntity | undefined, now: number): number {
  const changed = state ? Date.parse(state.last_changed) : Number.NaN;
  return Number.isFinite(changed) ? Math.max(0, Math.round((now - changed) / 1000)) : 0;
}

/** Numeric state of a member, converted by `scale` from its unit (kW → W…). */
export function numericValue(
  state: HassEntity | undefined,
  scale: (unit: string | undefined) => number = () => 1,
): number | undefined {
  if (!isAvailable(state)) return undefined;
  const value = Number.parseFloat(state.state);
  if (!Number.isFinite(value)) return undefined;
  return value * scale(state.attributes.unit_of_measurement);
}
