import { parseColor } from '../../core/color';
import { isAvailable, parseNumericState } from '../../core/entities';
import type { HassEntity, HomeAssistant, LightAttributes, Rgb } from '../../core/hass-types';

/** Domain of the HA-HyperHDR integration (github.com/Florian-BARRE/HA-HyperHDR). */
export const HYPERHDR_INTEGRATION = 'ha_hyperhdr';
/** Model of the integration's instance devices. */
export const INSTANCE_MODEL = 'LED instance';

/** The light's effect that gives the LEDs back to the capture, and the one that keeps a color. */
export const EFFECT_CAPTURE = 'Capture';
export const EFFECT_SOLID = 'Solid';

/**
 * The integration's entities of one device, by `domain.translation_key`
 * (`switch.hdr`, `sensor.cpu`); the instance light, which has no
 * translation key, is `light.main`.
 */
export type EntityIndex = Record<string, string>;

export interface HyperHdrDevices {
  /** Server devices (they carry the connection sensor). */
  servers: string[];
  /** Instance devices, by the server they hang under. */
  instances: Record<string, string[]>;
  /** Entities of every device of the integration. */
  entities: Record<string, EntityIndex>;
}

/** Devices and entities of the integration, from the entity and device registries. */
export function findDevices(hass: HomeAssistant): HyperHdrDevices {
  const entities: Record<string, EntityIndex> = {};
  for (const entry of Object.values(hass.entities ?? {})) {
    if (entry.platform !== HYPERHDR_INTEGRATION || !entry.device_id) continue;
    const domain = entry.entity_id.split('.')[0] ?? '';
    const key = `${domain}.${entry.translation_key ?? 'main'}`;
    (entities[entry.device_id] ??= {})[key] = entry.entity_id;
  }
  const servers = Object.keys(entities).filter((id) => entities[id]?.['binary_sensor.connected']);
  const instances: Record<string, string[]> = {};
  for (const [id, index] of Object.entries(entities)) {
    if (!index['light.main']) continue;
    const via = hass.devices?.[id]?.via_device_id;
    // An instance without a known server goes under the only server there is.
    const server = via && servers.includes(via) ? via : servers.length === 1 ? servers[0] : via;
    if (!server) continue;
    (instances[server] ??= []).push(id);
  }
  for (const list of Object.values(instances)) {
    list.sort((a, b) => deviceName(hass, a).localeCompare(deviceName(hass, b)));
  }
  return { servers: servers.sort(), instances, entities };
}

export function deviceName(hass: HomeAssistant, deviceId: string): string {
  const device = hass.devices?.[deviceId];
  return device?.name_by_user || device?.name || 'HyperHDR';
}

/* ---------------------------------------------------------------- server */

export type HubHealth = 'ok' | 'warn' | 'alarm' | 'offline';

export interface HubModel {
  deviceId: string;
  name: string;
  connected: boolean;
  /** `undefined` when HyperHDR cannot tell (not a Raspberry Pi). */
  undervoltage?: boolean;
  cpu?: number;
  temperature?: number;
  memory?: number;
  memoryUsedMb?: number;
  memoryTotalMb?: number;
  captureFps?: number;
  grabber?: string;
  videoMode?: string;
  version?: string;
  architecture?: string;
  /** The captured picture camera (needs the admin password). */
  camera?: string;
  health: HubHealth;
  entities: EntityIndex;
}

/** Temperatures (°C) at which the hub turns orange, then red. */
export const TEMP_WARN = 70;
export const TEMP_ALARM = 80;

function stateOf(hass: HomeAssistant, entities: EntityIndex, key: string): HassEntity | undefined {
  const id = entities[key];
  return id ? hass.states[id] : undefined;
}

function numberOf(hass: HomeAssistant, entities: EntityIndex, key: string): number | undefined {
  return parseNumericState(stateOf(hass, entities, key));
}

function textOf(hass: HomeAssistant, entities: EntityIndex, key: string): string | undefined {
  const state = stateOf(hass, entities, key);
  return isAvailable(state) && state.state !== 'unknown' && state.state !== ''
    ? state.state
    : undefined;
}

function onOf(hass: HomeAssistant, entities: EntityIndex, key: string): boolean | undefined {
  const state = stateOf(hass, entities, key);
  if (!isAvailable(state) || state.state === 'unknown') return undefined;
  return state.state === 'on';
}

export function hubHealth(model: Omit<HubModel, 'health'>): HubHealth {
  if (!model.connected) return 'offline';
  if (model.undervoltage || (model.temperature ?? 0) >= TEMP_ALARM) return 'alarm';
  if ((model.temperature ?? 0) >= TEMP_WARN) return 'warn';
  return 'ok';
}

export function buildHub(hass: HomeAssistant, deviceId: string, entities: EntityIndex): HubModel {
  const memory = stateOf(hass, entities, 'sensor.memory');
  const version = stateOf(hass, entities, 'sensor.version');
  const grabber = stateOf(hass, entities, 'sensor.grabber');
  const camera = entities['camera.capture'];
  const base = {
    deviceId,
    name: deviceName(hass, deviceId),
    connected: onOf(hass, entities, 'binary_sensor.connected') === true,
    undervoltage: onOf(hass, entities, 'binary_sensor.undervoltage'),
    cpu: numberOf(hass, entities, 'sensor.cpu'),
    temperature: numberOf(hass, entities, 'sensor.cpu_temperature'),
    memory: numberOf(hass, entities, 'sensor.memory'),
    memoryUsedMb: numeric(memory?.attributes.used_mb),
    memoryTotalMb: numeric(memory?.attributes.total_mb),
    captureFps: numberOf(hass, entities, 'sensor.capture_fps'),
    grabber:
      textOf(hass, entities, 'sensor.grabber') ??
      (typeof grabber?.attributes.active === 'string' ? grabber.attributes.active : undefined),
    videoMode: textOf(hass, entities, 'sensor.video_mode'),
    version: textOf(hass, entities, 'sensor.version'),
    architecture:
      typeof version?.attributes.architecture === 'string'
        ? version.attributes.architecture
        : undefined,
    camera: camera && isAvailable(hass.states[camera]) ? camera : undefined,
    entities,
  };
  return { ...base, health: hubHealth(base) };
}

function numeric(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** `mdi:raspberry-pi` on ARM, a server otherwise. */
export function hubIcon(model: HubModel): string {
  const arch = model.architecture?.toLowerCase() ?? 'arm';
  return arch.includes('arm') || arch.includes('aarch') ? 'mdi:raspberry-pi' : 'mdi:server';
}

/* -------------------------------------------------------------- instance */

export type SourceKind = 'capture' | 'effect' | 'color' | 'other' | 'none';

export interface Toggle {
  entity: string;
  on: boolean;
  available: boolean;
}

export interface InstanceModel {
  deviceId: string;
  name: string;
  light: string;
  available: boolean;
  on: boolean;
  /** Luminance gain in percent (100 = HyperHDR's default). */
  brightness?: number;
  /** What drives the LEDs now. */
  source: SourceKind;
  /** The running effect, when an effect drives the LEDs. */
  effect?: string;
  /** Effects the light offers (Capture and Solid left out). */
  effects: string[];
  /** The color set from Home Assistant, when one drives the LEDs. */
  color?: Rgb;
  /** Mean color of the LEDs, when its sensor is enabled. */
  average?: Rgb;
  outputFps?: number;
  /** Frames sent to the LED device per second (its sensor is off by default). */
  ledFps?: number;
  ledCount?: number;
  /** The LED device HyperHDR drives (`wled`, `adalight`…) and where it sends (admin). */
  device?: { type: string; address?: string };
  /** HyperHDR components and settings, by key, when they exist. */
  toggles: Partial<Record<ToggleKey, Toggle>>;
  /** The LED colors camera, when it is enabled. */
  ledCamera?: string;
  entities: EntityIndex;
}

export const TOGGLE_KEYS = [
  'hdr',
  'smoothing',
  'black_border',
  'video_capture',
  'led_output',
  'auto_tone_mapping',
  'continuous_output',
  'anti_flickering',
  'background_effect',
  'boot_effect',
] as const;
export type ToggleKey = (typeof TOGGLE_KEYS)[number];

function sourceOf(hass: HomeAssistant, entities: EntityIndex, effect?: string | null): SourceKind {
  const visible = textOf(hass, entities, 'sensor.visible_source');
  if (visible === 'videograbber' || visible === 'systemgrabber') return 'capture';
  if (visible === 'effect') return 'effect';
  if (visible === 'color') return 'color';
  if (visible && visible !== 'none') return 'other';
  if (effect === EFFECT_SOLID) return 'color';
  if (effect && effect !== EFFECT_CAPTURE) return 'effect';
  return visible === 'none' ? 'none' : 'capture';
}

function deviceOf(hass: HomeAssistant, entities: EntityIndex): InstanceModel['device'] | undefined {
  const state = stateOf(hass, entities, 'sensor.led_device');
  const type = textOf(hass, entities, 'sensor.led_device');
  if (!type) return undefined;
  const address = state?.attributes.address;
  return { type, address: typeof address === 'string' && address ? address : undefined };
}

export function buildInstance(
  hass: HomeAssistant,
  deviceId: string,
  entities: EntityIndex,
): InstanceModel {
  const light = entities['light.main'] ?? '';
  const state = hass.states[light];
  const attributes = (state?.attributes ?? {}) as LightAttributes;
  const effect = typeof attributes.effect === 'string' ? attributes.effect : undefined;
  const source = sourceOf(hass, entities, effect);
  const gain = numberOf(hass, entities, 'number.brightness_gain');
  const toggles: Partial<Record<ToggleKey, Toggle>> = {};
  for (const key of TOGGLE_KEYS) {
    const id = entities[`switch.${key}`];
    const entity = id ? hass.states[id] : undefined;
    if (id && entity)
      toggles[key] = { entity: id, on: entity.state === 'on', available: isAvailable(entity) };
  }
  const average = stateOf(hass, entities, 'sensor.average_color');
  const ledCamera = entities['camera.led_colors'];
  const visible = stateOf(hass, entities, 'sensor.visible_source');
  return {
    deviceId,
    name: deviceName(hass, deviceId),
    light,
    available: isAvailable(state),
    on: state?.state === 'on',
    brightness:
      gain ??
      (typeof attributes.brightness === 'number'
        ? Math.round((attributes.brightness / 255) * 100)
        : undefined),
    source,
    effect:
      source === 'effect'
        ? effect && effect !== EFFECT_CAPTURE && effect !== EFFECT_SOLID
          ? effect
          : typeof visible?.attributes.origin === 'string'
            ? visible.attributes.origin.split('@')[0]
            : undefined
        : undefined,
    effects: (attributes.effect_list ?? []).filter(
      (name) => name !== EFFECT_CAPTURE && name !== EFFECT_SOLID,
    ),
    color:
      source === 'color' && Array.isArray(attributes.rgb_color) ? attributes.rgb_color : undefined,
    average: isAvailable(average)
      ? (parseColor(average.attributes.rgb_color) ?? parseColor(average.state))
      : undefined,
    outputFps: numberOf(hass, entities, 'sensor.output_fps'),
    ledFps: numberOf(hass, entities, 'sensor.led_fps'),
    ledCount: numberOf(hass, entities, 'sensor.led_count'),
    device: deviceOf(hass, entities),
    toggles,
    ledCamera: ledCamera && isAvailable(hass.states[ledCamera]) ? ledCamera : undefined,
    entities,
  };
}

/* ------------------------------------------------------------------ card */

export interface HyperHdrModel {
  hub?: HubModel;
  instances: InstanceModel[];
  /** Every strip of the server, for its count and its list. */
  strips: InstanceModel[];
  /** Entities whose changes redraw the card. */
  watched: string[];
}

/** The hub and its instances; `instance` keeps only that one. */
export function buildModel(
  hass: HomeAssistant,
  devices: HyperHdrDevices,
  server: string | undefined,
  instance?: string,
): HyperHdrModel {
  const serverId =
    server && devices.servers.includes(server)
      ? server
      : instance
        ? Object.keys(devices.instances).find((id) => devices.instances[id]?.includes(instance))
        : devices.servers[0];
  const hubEntities = serverId ? devices.entities[serverId] : undefined;
  const hub = serverId && hubEntities ? buildHub(hass, serverId, hubEntities) : undefined;
  const ids = (serverId ? devices.instances[serverId] : undefined) ?? [];
  const chosen = instance ? (devices.entities[instance]?.['light.main'] ? [instance] : []) : ids;
  const strips = ids.map((id) => buildInstance(hass, id, devices.entities[id] ?? {}));
  const instances = instance
    ? chosen.map(
        (id) =>
          strips.find((item) => item.deviceId === id) ??
          buildInstance(hass, id, devices.entities[id] ?? {}),
      )
    : strips;
  const watched = [
    ...Object.values(hubEntities ?? {}),
    ...instances.flatMap((item) => Object.values(item.entities)),
    // Other strips only for the count of strips on.
    ...strips.filter((item) => !instances.includes(item)).map((item) => item.light),
  ];
  return { hub, instances, strips, watched };
}

/** A stable color for an effect name, so each effect keeps its tint. */
export function effectColor(name: string | undefined): Rgb {
  const palette: Rgb[] = [
    [126, 87, 194],
    [38, 198, 218],
    [102, 187, 106],
    [255, 167, 38],
    [236, 64, 122],
    [92, 107, 192],
  ];
  let hash = 0;
  for (const char of name ?? '') hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length] as Rgb;
}

/** Warm default of the capture before any LED color is known. */
export const CAPTURE_RGB: Rgb = [255, 138, 61];
export const GREEN: Rgb = [102, 187, 106];
export const ORANGE: Rgb = [255, 167, 38];
export const RED: Rgb = [239, 83, 80];
export const BLUE: Rgb = [79, 195, 247];

/**
 * A color as lit LEDs show it: the strongest channel at full, so a dark edge
 * of the picture still gives a readable tint. Black stays a dim grey.
 */
export function vivid(rgb: Rgb): Rgb {
  const max = Math.max(...rgb);
  if (max < 8) return [90, 90, 90];
  return rgb.map((value) => Math.round((value / max) * 255)) as Rgb;
}

/**
 * Two tints of a picture's edges for a gradient: the brightest one, and the
 * brightest one that differs clearly from it.
 */
export function accentPair(colors: readonly Rgb[]): [Rgb, Rgb] | undefined {
  if (!colors.length) return undefined;
  const light = (rgb: Rgb) => 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  const sorted = [...colors].sort((a, b) => light(b) - light(a));
  const first = sorted[0] as Rgb;
  const distance = (a: Rgb, b: Rgb) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const second = sorted.find((rgb) => distance(vivid(rgb), vivid(first)) > 90) ?? first;
  return [vivid(first), vivid(second)];
}

/** The color an instance shows: its LEDs when known, else what drives them. */
export function instanceColor(model: InstanceModel, sampled?: Rgb): Rgb {
  if (model.source === 'color' && model.color) return model.color;
  if (model.source === 'effect')
    return model.average ? vivid(model.average) : effectColor(model.effect);
  const seen = sampled ?? model.average;
  return seen ? vivid(seen) : CAPTURE_RGB;
}

export function healthColor(health: HubHealth): Rgb | undefined {
  return health === 'ok'
    ? GREEN
    : health === 'warn'
      ? ORANGE
      : health === 'alarm'
        ? RED
        : undefined;
}
