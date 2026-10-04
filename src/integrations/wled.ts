import {
  domainOf,
  isAvailable,
  objectIdOf,
  parseNumericState,
  siblingEntities,
} from '../core/entities';
import type { HomeAssistant } from '../core/hass-types';

/** WLED entities attached to the same device as a light. */
export interface WledEntities {
  /** `select` deciding whether WLED ignores realtime data (UDP, E1.31, HyperHDR…). */
  liveOverride?: string;
  /** `sensor` in mA, computed by WLED from the LED count and colors. */
  estimatedCurrent?: string;
  /** `sensor` in mA: the brightness limiter setting (0 when disabled). */
  maxCurrent?: string;
  ledCount?: string;
  preset?: string;
  playlist?: string;
  palette?: string;
  /** `number` entities of the effect. */
  speed?: string;
  intensity?: string;
  nightlight?: string;
  /** `switch` entities of the segment. */
  reverse?: string;
  freeze?: string;
  syncSend?: string;
  syncReceive?: string;
  wifiSignal?: string;
  wifiRssi?: string;
  freeHeap?: string;
  ip?: string;
  /** `sensor` with the boot time. */
  uptime?: string;
  restart?: string;
  update?: string;
}

type Role = keyof WledEntities;

const LIVE_OVERRIDE_OPTIONS = ['0', '1', '2'];

/** Translation keys of the Home Assistant WLED integration. */
const BY_TRANSLATION_KEY: Record<string, Role> = {
  live_override: 'liveOverride',
  estimated_current: 'estimatedCurrent',
  info_leds_max_power: 'maxCurrent',
  info_leds_count: 'ledCount',
  preset: 'preset',
  playlist: 'playlist',
  color_palette: 'palette',
  segment_color_palette: 'palette',
  speed: 'speed',
  segment_speed: 'speed',
  intensity: 'intensity',
  segment_intensity: 'intensity',
  nightlight: 'nightlight',
  reverse: 'reverse',
  segment_reverse: 'reverse',
  freeze: 'freeze',
  segment_freeze: 'freeze',
  sync_send: 'syncSend',
  sync_receive: 'syncReceive',
  wifi_signal: 'wifiSignal',
  wifi_rssi: 'wifiRssi',
  free_heap: 'freeHeap',
  ip: 'ip',
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

/** Entities without a translation key, recognized by domain and device class. */
function roleWithoutKey(hass: HomeAssistant, entityId: string): Role | undefined {
  const domain = domainOf(entityId);
  if (domain === 'update') return 'update';
  const deviceClass = hass.states[entityId]?.attributes.device_class;
  if (domain === 'button' && deviceClass === 'restart') return 'restart';
  if (domain === 'sensor' && deviceClass === 'timestamp') return 'uptime';
  return undefined;
}

/**
 * Finds the WLED companions of `lightId` through the entity registry.
 * Entities are matched by their integration translation key; the live override
 * select is also recognized by its options for setups where the key is missing.
 *
 * On a device with several segments, per-segment entities (speed, intensity,
 * palette) whose id starts with the light's own id win, then the first segment.
 */
export function findWledEntities(hass: HomeAssistant, lightId: string): WledEntities {
  const found: WledEntities = {};
  const scores: Partial<Record<Role, number>> = {};
  const lightObjectId = objectIdOf(lightId);
  for (const entityId of siblingEntities(hass, lightId)) {
    const entry = hass.entities[entityId];
    if (entry?.platform !== 'wled') {
      if (found.liveOverride === undefined && looksLikeLiveOverride(hass, entityId)) {
        found.liveOverride = entityId;
      }
      continue;
    }
    const key = entry.translation_key;
    const role = key ? BY_TRANSLATION_KEY[key] : roleWithoutKey(hass, entityId);
    if (!role) {
      if (found.liveOverride === undefined && looksLikeLiveOverride(hass, entityId)) {
        found.liveOverride = entityId;
      }
      continue;
    }
    const score =
      (objectIdOf(entityId).startsWith(`${lightObjectId}_`) ? 2 : 0) +
      (key?.startsWith('segment_') ? 0 : 1);
    if (found[role] === undefined || score > (scores[role] ?? 0)) {
      found[role] = entityId;
      scores[role] = score;
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

/** Maximum watts allowed by WLED's brightness limiter, when it is enabled. */
export function maxWatts(
  hass: HomeAssistant,
  entities: WledEntities,
  voltage: number | undefined,
): number | undefined {
  if (!entities.maxCurrent || !voltage || voltage <= 0) return undefined;
  const milliamps = parseNumericState(hass.states[entities.maxCurrent]);
  if (!milliamps || milliamps <= 0) return undefined;
  return (milliamps * voltage) / 1000;
}

export interface WledHealth {
  /** Wi-Fi signal in percent. */
  signal?: number;
  rssi?: number;
  /** Seconds since the last boot. */
  uptime?: number;
  ledCount?: number;
  maxCurrent?: number;
  /** Free memory in bytes. */
  freeHeap?: number;
  ip?: string;
  firmware?: string;
  latestFirmware?: string;
  updateAvailable: boolean;
  updateEntity?: string;
  restartEntity?: string;
}

/** Device facts shown in the details, read from the WLED diagnostic entities. */
export function wledHealth(
  hass: HomeAssistant,
  entities: WledEntities,
  now: number = Date.now(),
): WledHealth {
  const read = (entityId: string | undefined) =>
    entityId ? parseNumericState(hass.states[entityId]) : undefined;
  const text = (entityId: string | undefined) => {
    const state = entityId ? hass.states[entityId] : undefined;
    return isAvailable(state) ? state.state : undefined;
  };
  const boot = text(entities.uptime);
  const bootTime = boot ? Date.parse(boot) : Number.NaN;
  const update = entities.update ? hass.states[entities.update] : undefined;
  const installed = update?.attributes.installed_version;
  const latest = update?.attributes.latest_version;
  return {
    signal: read(entities.wifiSignal),
    rssi: read(entities.wifiRssi),
    uptime: Number.isFinite(bootTime)
      ? Math.max(0, Math.round((now - bootTime) / 1000))
      : undefined,
    ledCount: read(entities.ledCount),
    maxCurrent: read(entities.maxCurrent),
    freeHeap: read(entities.freeHeap),
    ip: text(entities.ip),
    firmware: typeof installed === 'string' ? installed : undefined,
    latestFirmware: typeof latest === 'string' ? latest : undefined,
    updateAvailable: update?.state === 'on',
    updateEntity: entities.update,
    // A button's state is the time of its last press ("unknown" if never pressed).
    restartEntity:
      entities.restart &&
      hass.states[entities.restart] !== undefined &&
      hass.states[entities.restart]?.state !== 'unavailable'
        ? entities.restart
        : undefined,
  };
}

/** Icon of a Wi-Fi signal in percent. */
export function wifiIcon(signal: number | undefined): string {
  if (signal === undefined) return 'mdi:wifi-strength-off-outline';
  if (signal >= 75) return 'mdi:wifi-strength-4';
  if (signal >= 50) return 'mdi:wifi-strength-3';
  if (signal >= 25) return 'mdi:wifi-strength-2';
  return 'mdi:wifi-strength-1';
}
