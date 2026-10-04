import { domainOf, isAvailable, siblingEntities } from '../core/entities';
import type { HomeAssistant } from '../core/hass-types';

/** WLED entities attached to the same device as a light. */
export interface WledEntities {
  /** `select` deciding whether WLED ignores realtime data (UDP, E1.31, HyperHDR…). */
  liveOverride?: string;
  /** `sensor` in mA, computed by WLED from the LED count and colors. */
  estimatedCurrent?: string;
  preset?: string;
  playlist?: string;
  palette?: string;
}

const LIVE_OVERRIDE_OPTIONS = ['0', '1', '2'];

const BY_TRANSLATION_KEY: Record<string, keyof WledEntities> = {
  live_override: 'liveOverride',
  estimated_current: 'estimatedCurrent',
  preset: 'preset',
  playlist: 'playlist',
  color_palette: 'palette',
};

function looksLikeLiveOverride(hass: HomeAssistant, entityId: string): boolean {
  if (domainOf(entityId) !== 'select') return false;
  const options = hass.states[entityId]?.attributes.options;
  return (
    Array.isArray(options) &&
    options.length === LIVE_OVERRIDE_OPTIONS.length &&
    options.every((option, index) => option === LIVE_OVERRIDE_OPTIONS[index])
  );
}

/**
 * Finds the WLED companions of `lightId` through the entity registry.
 * Entities are matched by their integration translation key; the live override
 * select is also recognized by its options for setups where the key is missing.
 */
export function findWledEntities(hass: HomeAssistant, lightId: string): WledEntities {
  const found: WledEntities = {};
  for (const entityId of siblingEntities(hass, lightId)) {
    const entry = hass.entities[entityId];
    const role =
      entry?.platform === 'wled' && entry.translation_key
        ? BY_TRANSLATION_KEY[entry.translation_key]
        : undefined;
    if (role && found[role] === undefined) {
      found[role] = entityId;
    } else if (found.liveOverride === undefined && looksLikeLiveOverride(hass, entityId)) {
      found.liveOverride = entityId;
    }
  }
  return found;
}

export interface LiveOverrideState {
  entityId: string;
  available: boolean;
  /** WLED ignores realtime data ("1" = on, "2" = on until reboot). */
  active: boolean;
}

export function liveOverrideState(hass: HomeAssistant, entityId: string): LiveOverrideState {
  const state = hass.states[entityId];
  const available = isAvailable(state);
  return {
    entityId,
    available,
    active: available && (state.state === '1' || state.state === '2'),
  };
}
