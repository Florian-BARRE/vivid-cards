import { glowPercent, type GlowSetting } from '../../core/glow';
import type { LovelaceCardConfig } from '../../core/hass-types';

export const AIR_STATION_CARD = 'vivid-air-station-card';

/** Entity id prefix of the "Salon Air Station" ESPHome device. */
export const DEFAULT_PREFIX = 'salon_salon_air_station_';

/**
 * Every entity of the station, as `domain.suffix` after the prefix (the
 * object ids ESPHome derives from the names in the firmware). A key can be
 * pointed at another entity with `entities:` in the card configuration.
 */
export const ENTITY_SUFFIXES = {
  online: 'binary_sensor.node_status',
  co2: 'sensor.co2',
  temperature: 'sensor.temperature',
  humidity: 'sensor.humidity',
  dewPoint: 'sensor.dew_point',
  comfort: 'sensor.comfort_level',
  advice: 'sensor.ventilation_advice',
  alert: 'binary_sensor.co2_alert',
  night: 'binary_sensor.night_mode',
  ldr: 'sensor.ldr_raw',
  ledBrightness: 'sensor.led_brightness',
  page: 'sensor.current_page',
  uptime: 'sensor.uptime',
  rssi: 'sensor.wifi_rssi',
  ip: 'sensor.device_ip',
  ssid: 'sensor.wifi_ssid',
  power: 'switch.station_power',
  backlight: 'switch.screen_backlight',
  autoCycle: 'switch.auto_page_cycle',
  ledSync: 'switch.led_sync_pages',
  autoBrightness: 'switch.led_auto_brightness',
  effect: 'select.led_effect',
  pageDuration: 'number.page_cycle_duration',
  co2Excellent: 'number.co2_thr_excellent',
  co2Good: 'number.co2_thr_good',
  co2Watch: 'number.co2_thr_watch',
  co2Alert: 'number.co2_alert_threshold',
  tempMin: 'number.temp_comfort_min',
  tempMax: 'number.temp_comfort_max',
  humMin: 'number.hum_comfort_min',
  humMax: 'number.hum_comfort_max',
  nightThreshold: 'number.night_mode_threshold',
  brightnessNight: 'number.led_brightness_night',
  brightnessMin: 'number.led_brightness_min',
  brightnessMax: 'number.led_brightness_max',
  brightnessManual: 'number.led_manual_brightness',
  red: 'number.led_red',
  green: 'number.led_green',
  blue: 'number.led_blue',
  pageNext: 'button.page_suivante',
  pagePrevious: 'button.page_precedente',
  pageData: 'button.page_data',
  pageCo2: 'button.page_co2',
  pageTemperature: 'button.page_temperature',
  pageHumidity: 'button.page_humidite',
  pageConfig: 'button.page_config',
  calibrate: 'button.calibrate_co2_426_ppm',
} as const;

export type EntityKey = keyof typeof ENTITY_SUFFIXES;
export type EntityMap = Record<EntityKey, string>;

/** Values shown next to the name, in this order. */
export const AIR_INFO = ['co2', 'temperature', 'humidity', 'dew_point'] as const;
export type AirInfo = (typeof AIR_INFO)[number];
export const DEFAULT_AIR_INFO: AirInfo[] = ['co2', 'temperature', 'humidity'];

/** Tabs of the details. */
export const AIR_TABS = ['air', 'frame', 'screen', 'settings'] as const;
export type AirTab = (typeof AIR_TABS)[number];

export interface AirStationCardConfig extends LovelaceCardConfig {
  /** The station (ESPHome device): its entities are found from it. */
  device?: string;
  /** Entity id prefix of the station (the part after the domain); wins over `device`. */
  prefix?: string;
  /** Entities that do not follow the prefix. */
  /** Per key: another entity, or false for none. */
  entities?: Partial<Record<EntityKey, string | false>>;
  name?: string;
  /** Values next to the name. */
  info?: string[];
  /** The station's power button on the line. */
  show_power?: boolean;
  /** Tab the details open on. */
  tab?: string;
  glow?: GlowSetting;
}

export interface ResolvedAirStationConfig {
  name?: string;
  entities: EntityMap;
  info: AirInfo[];
  showPower: boolean;
  tab: AirTab;
  glow: number;
}

/** Entity ids of the station from its prefix, with per-key overrides. */
export function entityMap(
  prefix: string,
  overrides: Partial<Record<EntityKey, string>> = {},
): EntityMap {
  const map = {} as EntityMap;
  for (const [key, suffix] of Object.entries(ENTITY_SUFFIXES) as [EntityKey, string][]) {
    const [domain, object] = suffix.split('.') as [string, string];
    map[key] = overrides[key] ?? `${domain}.${prefix}${object}`;
  }
  return map;
}

/** What the configured device points to, once Home Assistant is known. */
export interface DeviceLookup {
  prefix?: string;
}

function optionalEntity(value: unknown): string | undefined {
  return typeof value === 'string' && /^[a-z_]+\.[a-z0-9_]+$/.test(value.trim())
    ? value.trim()
    : undefined;
}

export function resolveAirStationConfig(
  config: AirStationCardConfig,
  lookup: DeviceLookup = {},
): ResolvedAirStationConfig {
  if (!config || typeof config !== 'object') throw new Error('Invalid configuration');
  const prefix =
    typeof config.prefix === 'string' && config.prefix.trim()
      ? config.prefix.trim()
      : (lookup.prefix ?? DEFAULT_PREFIX);
  const overrides: Partial<Record<EntityKey, string>> = {};
  if (config.entities && typeof config.entities === 'object') {
    for (const [key, value] of Object.entries(config.entities)) {
      if (!(key in ENTITY_SUFFIXES)) continue;
      // false: that part of the card is left out (no entity).
      const entity = value === false ? '' : optionalEntity(value);
      if (entity !== undefined) overrides[key as EntityKey] = entity;
    }
  }
  return {
    name: typeof config.name === 'string' && config.name.trim() ? config.name.trim() : undefined,
    entities: entityMap(prefix, overrides),
    info: Array.isArray(config.info)
      ? config.info.filter(
          (item, index, list): item is AirInfo =>
            (AIR_INFO as readonly string[]).includes(item) && list.indexOf(item) === index,
        )
      : [...DEFAULT_AIR_INFO],
    showPower: config.show_power !== false,
    tab: (AIR_TABS as readonly string[]).includes(config.tab as string)
      ? (config.tab as AirTab)
      : 'air',
    glow: glowPercent(config.glow) ?? 100,
  };
}
