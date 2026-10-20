import { glowPercent, type GlowSetting } from '../../core/glow';
import type { LovelaceCardConfig } from '../../core/hass-types';

export const AMBILIGHT_CARD = 'vivid-ambilight-card';

/** Entity id prefix of the "Salon Ambilight Manager" ESPHome device. */
export const DEFAULT_PREFIX = 'salon_salon_ambilight_manager_';

/** Number of HDMI inputs of the switch. */
export const INPUT_COUNT = 5;

/**
 * Every entity the card uses, as `domain.suffix` after the prefix. A key can
 * be pointed at another entity with `entities:` in the card configuration.
 */
export const ENTITY_SUFFIXES = {
  online: 'binary_sensor.node_status',
  temperature: 'sensor.temperature',
  humidity: 'sensor.humidity',
  pressure: 'sensor.pressure',
  temperatureBmp: 'sensor.temperature_bmp280',
  overheat: 'binary_sensor.overheat',
  rssi: 'sensor.wifi_rssi',
  uptime: 'sensor.uptime',
  ip: 'sensor.device_ip',
  ssid: 'sensor.wifi_ssid',
  fan: 'fan.jonsbo_fan',
  fanMode: 'select.fan_mode',
  fanControl: 'sensor.fan_control',
  fanTarget: 'sensor.fan_target_speed',
  rpmRaw: 'sensor.jonsbo_fan_rpm_raw',
  rpm: 'sensor.jonsbo_fan_rpm',
  stalled: 'binary_sensor.fan_stalled',
  fan0: 'button.fan_off',
  fan25: 'button.fan_25',
  fan50: 'button.fan_50',
  fan75: 'button.fan_75',
  fan100: 'button.fan_100',
  t1: 'number.fan_auto_t1',
  s1: 'number.fan_auto_s1',
  t2: 'number.fan_auto_t2',
  s2: 'number.fan_auto_s2',
  t3: 'number.fan_auto_t3',
  s3: 'number.fan_auto_s3',
  t4: 'number.fan_auto_t4',
  s4: 'number.fan_auto_s4',
  hysteresis: 'number.fan_auto_hysteresis',
  overheatTemp: 'number.fan_auto_overheat_temp',
  stopBelowT1: 'switch.fan_auto_stop_below_t1',
  hdmi1: 'button.hdmi_input_1',
  hdmi2: 'button.hdmi_input_2',
  hdmi3: 'button.hdmi_input_3',
  hdmi4: 'button.hdmi_input_4',
  hdmi5: 'button.hdmi_input_5',
  hdmiActive: 'sensor.hdmi_active_input',
  irVerified: 'binary_sensor.ir_last_send_verified',
  irStatus: 'sensor.ir_status',
  irLast: 'sensor.ir_last_received',
  irCodes: 'sensor.ir_stored_codes',
  learn1: 'button.ir_learn_1_start_capture',
  learn2: 'button.ir_learn_2_finish_capture',
  learn3: 'button.ir_learn_3_test_replay',
  learn4: 'button.ir_learn_4_save_to_target_input',
  learnTarget: 'select.ir_learn_target_input',
  learnCancel: 'button.ir_learn_cancel',
  learnClear: 'button.ir_learn_clear_target_input',
  relay: 'switch.relay',
  relayPulse: 'button.test_relay_pulse_3_s_may_cut_the_pi',
  refresh: 'button.test_sensors_refresh_now',
  restart: 'button.restart',
  testStatus: 'sensor.test_status',
  irDebug: 'switch.ir_debug',
  ledSteady: 'switch.test_ir_led_steady_on_10_s_camera',
  burst: 'button.test_ir_38_khz_burst_1_s_camera',
  echoTest: 'button.test_ir_echo_test_led_receiver',
  sendCaptured: 'button.test_ir_send_captured_code_standard_tx_no_check',
  rxFrames: 'sensor.test_ir_rx_frames',
  fanSelfTest: 'button.test_fan_self_test',
  fanSweep: 'button.test_fan_sweep',
  fanStopTests: 'button.test_fan_stop_tests',
  pwm: 'number.test_fan_pwm_frequency',
} as const;

export type EntityKey = keyof typeof ENTITY_SUFFIXES;
export type EntityMap = Record<EntityKey, string>;

export interface AmbilightInputConfig {
  name?: string;
  icon?: string;
}

export interface AmbilightCardConfig extends LovelaceCardConfig {
  /** The Ambilight manager device (ESPHome): its entities are found from it. */
  device?: string;
  /** Entity id prefix of the device (the part after the domain); wins over `device`. */
  prefix?: string;
  name?: string;
  /** Names and icons of the HDMI inputs, in order. */
  inputs?: (AmbilightInputConfig | string)[];
  /** A sensor that changes on every send confirmed by the echo (optional firmware counter). */
  send_counter_entity?: string;
  /** Turning the Pi off asks for a second tap (it is a hard power cut). */
  confirm_pi_off?: boolean;
  /** Entities that do not follow the prefix. */
  entities?: Partial<Record<EntityKey, string>>;
  glow?: GlowSetting;
}

export interface ResolvedInput {
  name: string;
  icon: string;
}

export interface ResolvedAmbilightConfig {
  name?: string;
  entities: EntityMap;
  inputs: ResolvedInput[];
  sendCounterEntity?: string;
  confirmPiOff: boolean;
  glow: number;
}

const DEFAULT_INPUT_ICON = 'mdi:video-input-hdmi';

/** Entity ids of the device from its prefix, with per-key overrides. */
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

function resolveInput(
  value: AmbilightInputConfig | string | undefined,
  index: number,
): ResolvedInput {
  const fallback = `HDMI ${index + 1}`;
  if (typeof value === 'string')
    return { name: value.trim() || fallback, icon: DEFAULT_INPUT_ICON };
  return {
    name: value?.name?.trim() || fallback,
    icon: value?.icon?.trim() || DEFAULT_INPUT_ICON,
  };
}

function optionalEntity(value: unknown): string | undefined {
  return typeof value === 'string' && value.includes('.') ? value.trim() : undefined;
}

/** What the devices of the configuration point to, once Home Assistant is known. */
export interface DeviceLookup {
  prefix?: string;
}

export function resolveAmbilightConfig(
  config: AmbilightCardConfig,
  lookup: DeviceLookup = {},
): ResolvedAmbilightConfig {
  if (!config || typeof config !== 'object') throw new Error('Invalid configuration');
  const prefix =
    typeof config.prefix === 'string' && config.prefix.trim()
      ? config.prefix.trim()
      : (lookup.prefix ?? DEFAULT_PREFIX);
  const inputs = Array.from({ length: INPUT_COUNT }, (_, index) =>
    resolveInput(Array.isArray(config.inputs) ? config.inputs[index] : undefined, index),
  );
  const overrides: Partial<Record<EntityKey, string>> = {};
  if (config.entities && typeof config.entities === 'object') {
    for (const [key, value] of Object.entries(config.entities)) {
      const entity = optionalEntity(value);
      if (entity && key in ENTITY_SUFFIXES) overrides[key as EntityKey] = entity;
    }
  }
  return {
    name: typeof config.name === 'string' && config.name.trim() ? config.name.trim() : undefined,
    entities: entityMap(prefix, overrides),
    inputs,
    sendCounterEntity: optionalEntity(config.send_counter_entity),
    confirmPiOff: config.confirm_pi_off !== false,
    glow: glowPercent(config.glow) ?? 100,
  };
}
