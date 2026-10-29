/**
 * How a LED group meets the Ambilight box behind the TV: which box, which of
 * the group's strips the screen drives right now, and with which colors.
 * Pure functions over `hass`, reusing the Ambilight and HyperHDR models.
 */
import {
  DEFAULT_PREFIX,
  ENTITY_SUFFIXES,
  resolveAmbilightConfig,
  type AmbilightCardConfig,
  type ResolvedAmbilightConfig,
} from '../ambilight/config';
import { devicePrefix, lookupDevices } from '../ambilight/devices';
import { buildAmbilightModel, type Alarm, type AmbilightModel } from '../ambilight/model';
import {
  CAPTURE_RGB,
  buildModel,
  findDevices,
  instanceColor,
  type HubModel,
  type InstanceModel,
} from '../hyperhdr/model';
import { domainOf, isAvailable, objectIdOf } from '../../core/entities';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import type { ResolvedLedGroupConfig } from './config';
import type { LedGroupModel, StripModel } from './model';

/** Where the box's entities are: its device, or the prefix of their ids. */
export type BoxTarget = { device: string } | { prefix: string };

/** A device that carries the box's relay and fan, under one entity prefix. */
export function isBoxDevice(hass: HomeAssistant, deviceId: string): boolean {
  const prefix = devicePrefix(hass, deviceId);
  return (
    prefix !== undefined &&
    hass.states[`switch.${prefix}relay`] !== undefined &&
    hass.states[`fan.${prefix}jonsbo_fan`] !== undefined
  );
}

/**
 * Registry lookups are cached per registry snapshot: Home Assistant replaces
 * `hass.entities` and `hass.devices` when they change, not on state changes.
 */
const registryCache = new WeakMap<object, Map<string, unknown>>();

function cached<T>(hass: HomeAssistant, key: string, compute: () => T): T {
  const registry = hass.entities as object | undefined;
  if (!registry) return compute();
  let entries = registryCache.get(registry);
  if (!entries) {
    entries = new Map();
    registryCache.set(registry, entries);
  }
  const devices = hass.devices as object | undefined;
  const full = `${key}|${devices ? 'd' : '-'}`;
  const hit = entries.get(full) as { devices?: object; value: T } | undefined;
  if (hit && hit.devices === devices) return hit.value;
  const value = compute();
  entries.set(full, { devices, value });
  return value;
}

/** Every Ambilight box of the installation (device ids, sorted). */
export function findBoxes(hass: HomeAssistant): string[] {
  return cached(hass, 'boxes', () =>
    Object.keys(hass.devices ?? {})
      .filter((id) => isBoxDevice(hass, id))
      .sort(),
  );
}

/** Prefix of a box from one of its entity ids: `switch.salon_x_relay` → `salon_x_`. */
export function prefixFromEntity(entityId: string): string | undefined {
  const domain = domainOf(entityId);
  const object = objectIdOf(entityId);
  let best: string | undefined;
  for (const suffix of Object.values(ENTITY_SUFFIXES)) {
    const [suffixDomain, suffixObject] = suffix.split('.') as [string, string];
    if (suffixDomain !== domain || !object.endsWith(suffixObject)) continue;
    const prefix = object.slice(0, object.length - suffixObject.length);
    if (prefix && !prefix.endsWith('_')) continue;
    // The longest known name wins ("fan_auto_t1" over "t1").
    if (best === undefined || prefix.length < best.length) best = prefix;
  }
  return best;
}

/** Areas of the group: its own, and the ones of its strips' devices. */
export function groupAreas(hass: HomeAssistant, entityId: string, strips: string[]): Set<string> {
  const areas = new Set<string>();
  for (const id of [entityId, ...strips]) {
    const entry = hass.entities?.[id];
    const area =
      entry?.area_id ?? (entry?.device_id ? hass.devices?.[entry.device_id]?.area_id : undefined);
    if (area) areas.add(area);
  }
  return areas;
}

/**
 * The box of the card:
 * - `box: false` (or Ambilight turned off without a box): none;
 * - a device id, or an entity of the box: that one;
 * - left out: the only box there is, when it shares an area with the group
 *   or HyperHDR drives one of its strips (so a bedroom card stays without it).
 */
export function resolveBoxTarget(
  hass: HomeAssistant,
  ambilight: ResolvedLedGroupConfig['ambilight'],
  context: { areas: Set<string>; hyperhdrStrips: number },
): BoxTarget | undefined {
  const option = ambilight.box;
  if (option === false) return undefined;
  if (typeof option === 'string') {
    if (hass.devices?.[option]) return { device: option };
    if (option.includes('.')) {
      const device = hass.entities?.[option]?.device_id;
      if (device) return { device };
      const prefix = prefixFromEntity(option);
      if (prefix !== undefined) return { prefix };
    }
    return { device: option };
  }
  if (!ambilight.enabled) return undefined;
  const boxes = findBoxes(hass);
  if (boxes.length !== 1) return undefined;
  const box = boxes[0] as string;
  const area = hass.devices?.[box]?.area_id;
  const related =
    (area !== null && area !== undefined && context.areas.has(area)) || context.hyperhdrStrips > 0;
  return related ? { device: box } : undefined;
}

/** Configuration of the rail: the Ambilight card's own, built from the group's options. */
export function railConfig(
  target: BoxTarget,
  ambilight: ResolvedLedGroupConfig['ambilight'],
): AmbilightCardConfig {
  return {
    type: 'custom:vivid-ambilight-card',
    ...('device' in target
      ? { device: target.device }
      : { prefix: target.prefix || DEFAULT_PREFIX }),
    ...(ambilight.hyperhdr ? { hyperhdr: ambilight.hyperhdr } : {}),
    ...(ambilight.inputs ? { inputs: ambilight.inputs } : {}),
    confirm_pi_off: ambilight.confirmOff,
    layout: 'line',
  };
}

/** "192.168.1.42", "http://192.168.1.42:80/json" → "192.168.1.42". */
export function hostOf(address: string | undefined): string | undefined {
  if (!address) return undefined;
  const host = address
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/[/?#].*$/, '')
    .replace(/:\d+$/, '');
  return host || undefined;
}

export interface HyperHdrLinkModel {
  hub?: HubModel;
  /** Every strip of the server. */
  instances: InstanceModel[];
  /** The instance that drives each strip of the group (by light entity id). */
  byStrip: Map<string, InstanceModel>;
  watched: string[];
}

/**
 * The HyperHDR server and the instance driving each strip, matched by the
 * address HyperHDR sends to and the IP the WLED strip reports.
 */
export function hyperhdrLink(
  hass: HomeAssistant,
  strips: readonly StripModel[],
  server: string | undefined,
): HyperHdrLinkModel {
  const devices = cached(hass, 'hyperhdr', () => findDevices(hass));
  if (devices.servers.length === 0) {
    return { instances: [], byStrip: new Map(), watched: [] };
  }
  const model = buildModel(hass, devices, server);
  const byHost = new Map<string, InstanceModel>();
  for (const instance of model.strips) {
    const host = hostOf(instance.device?.address);
    if (host) byHost.set(host, instance);
  }
  const byStrip = new Map<string, InstanceModel>();
  const watched = new Set(model.watched);
  for (const strip of strips) {
    const ip = strip.wledEntities.ip;
    if (!ip) continue;
    watched.add(ip);
    const state = hass.states[ip];
    const host = isAvailable(state) ? hostOf(state.state) : undefined;
    const instance = host ? byHost.get(host) : undefined;
    if (instance) byStrip.set(strip.entityId, instance);
  }
  return { hub: model.hub, instances: model.strips, byStrip, watched: [...watched] };
}

export interface AmbilightDrive {
  /** The capture runs: the Pi is powered (and HyperHDR connected, when it is known). */
  active: boolean;
  /** Strips that show the screen right now (light entity ids, group order). */
  driven: string[];
  /** Live override selects that give the strips back to the card. */
  overrides: string[];
  /** Colors of the driven strips, in the group order. */
  colors: Rgb[];
}

/** HyperHDR sends to the strip: its instance is on and its LED output too. */
function instanceSends(instance: InstanceModel): boolean {
  return instance.available && instance.on && instance.toggles.led_output?.on !== false;
}

/**
 * Which strips the screen drives: WLED listens to realtime data (its live
 * override is off) while the capture runs, and the HyperHDR instance that
 * matches the strip, when there is one, sends to it.
 */
export function ambilightDrive(
  strips: readonly StripModel[],
  link: Pick<HyperHdrLinkModel, 'hub' | 'byStrip'>,
  piOn: boolean,
): AmbilightDrive {
  const active = piOn && (link.hub ? link.hub.connected : true);
  const driven: string[] = [];
  const overrides: string[] = [];
  const colors: Rgb[] = [];
  if (!active) return { active, driven, overrides, colors };
  for (const strip of strips) {
    const override = strip.liveOverride;
    if (!strip.ambilight || !override || !strip.available || override.active) continue;
    const instance = link.byStrip.get(strip.entityId);
    if (instance && !instanceSends(instance)) continue;
    driven.push(strip.entityId);
    if (override.available) overrides.push(override.entityId);
    colors.push(instance ? instanceColor(instance) : (strip.rgb ?? CAPTURE_RGB));
  }
  return { active, driven, overrides, colors };
}

/** Alarms that turn the rail red (offline only dims it). */
const RAIL_ALARMS: Alarm[] = ['overheat', 'cpuoverheat', 'stalled'];

export interface RailAlert {
  alarm: Alarm;
  /** The temperature behind it, when it is one. */
  temperature?: number;
}

/** The alarm the rail shows, the worst first. */
export function railAlert(model: AmbilightModel): RailAlert | undefined {
  if (!model.online) return undefined;
  const alarm = RAIL_ALARMS.find((item) => model.alarms.includes(item));
  if (!alarm) return undefined;
  if (alarm === 'cpuoverheat') return { alarm, temperature: model.cpuTemperature };
  if (alarm === 'overheat') return { alarm, temperature: model.controlTemperature };
  return { alarm };
}

/** Colors of the rail's disc: the captured ones, else the warm capture default. */
export function railColors(drive: AmbilightDrive): Rgb[] {
  if (drive.colors.length > 1) return drive.colors;
  const first = drive.colors[0] ?? CAPTURE_RGB;
  return [first, [195, 60, 255]];
}

export interface AmbilightSide {
  target: BoxTarget;
  /** Configuration handed to the rail (an Ambilight card of its own). */
  rail: AmbilightCardConfig;
  boxConfig: ResolvedAmbilightConfig;
  /** `undefined` when none of the box's entities exist. */
  box?: AmbilightModel;
  hyperhdr: HyperHdrLinkModel;
  drive: AmbilightDrive;
  watched: string[];
}

/** Everything the card needs of the Ambilight side, or `undefined` without a box. */
export function buildAmbilightSide(
  hass: HomeAssistant,
  config: ResolvedLedGroupConfig,
  model: LedGroupModel,
): AmbilightSide | undefined {
  const hyperhdr = hyperhdrLink(hass, model.detected, config.ambilight.hyperhdr);
  const target = resolveBoxTarget(hass, config.ambilight, {
    areas: groupAreas(
      hass,
      config.entity,
      model.detected.map((strip) => strip.entityId),
    ),
    hyperhdrStrips: hyperhdr.byStrip.size,
  });
  if (!target) return undefined;
  const rail = railConfig(target, config.ambilight);
  const lookup = cached(hass, `box:${JSON.stringify(rail)}`, () => lookupDevices(hass, rail));
  const boxConfig = resolveAmbilightConfig(rail, lookup);
  const built = buildAmbilightModel(hass, boxConfig);
  const ids = boxConfig.entities;
  const present =
    isAvailable(hass.states[ids.fan]) ||
    isAvailable(hass.states[ids.relay]) ||
    hass.states[ids.online] !== undefined;
  const box = present ? built : undefined;
  const drive = ambilightDrive(model.detected, hyperhdr, box?.relay.on === true);
  return {
    target,
    rail,
    boxConfig,
    box,
    hyperhdr,
    drive,
    watched: [...new Set([...built.watched, ...hyperhdr.watched])],
  };
}

/**
 * Ambilight mode: the Pi runs and the ambilight strips listen to the screen
 * (their live override is off), i.e. the Ambilight button is pressed. The
 * card then keeps only the brightness: colors, effects and favorites belong
 * to the screen until the strips are taken back.
 */
export function screenMode(
  side: AmbilightSide | undefined,
  liveOverride: { active: boolean } | undefined,
): boolean {
  return Boolean(side?.box?.relay.on && liveOverride && !liveOverride.active);
}

/** The Pi of the box runs. */
export function piRunning(side: AmbilightSide | undefined): boolean {
  return side?.box?.relay.on === true;
}

export interface FoldStep {
  piOn: boolean;
  screen: boolean;
}

/**
 * How the collapsible line reacts to the Ambilight: it folds when the Pi
 * starts (colors are no longer needed), and unfolds when the strips are taken
 * back from the screen while the Pi keeps running. `undefined`: no change.
 */
export function autoFold(previous: FoldStep | undefined, next: FoldStep): boolean | undefined {
  if (!previous) return undefined;
  if (!previous.piOn && next.piOn) return false;
  if (previous.screen && !next.screen && next.piOn) return true;
  return undefined;
}
