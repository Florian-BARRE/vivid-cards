import { curveAt } from '../../core/curve';
import { blendStops } from '../../core/glow';
import { isAvailable, parseNumericState } from '../../core/entities';
import type { HassEntity, HomeAssistant, Rgb } from '../../core/hass-types';
import { INPUT_COUNT, type EntityKey, type ResolvedAmbilightConfig } from './config';

/** How long after the relay closes HyperHDR counts as booting rather than down. */
export const BOOT_MS = 180_000;

export type FanMode = 'auto' | 'manual';

/**
 * State of the Pi and HyperHDR: `off` relay open; `on` relay closed and no
 * HyperHDR entity configured; `booting` / `unreachable` relay closed but
 * HyperHDR not answering (yet / for long); `ready` HyperHDR answering;
 * `paused` HyperHDR answering with its output off.
 */
export type PiStatus = 'off' | 'on' | 'booting' | 'unreachable' | 'ready' | 'paused' | 'unknown';

export type Alarm = 'offline' | 'overheat' | 'stalled' | 'nosensor';

export interface NumberSetting {
  entityId: string;
  value?: number;
  min: number;
  max: number;
  step: number;
}

export interface CurvePoint {
  /** Position in the device settings (point 1 to 4). */
  index: number;
  t: NumberSetting;
  s: NumberSetting;
}

export interface InputModel {
  name: string;
  icon: string;
  button: string;
  available: boolean;
  /** Stored NEC code, `null` when the slot is empty, `undefined` when unknown. */
  code?: string | null;
}

export interface AmbilightModel {
  name: string;
  online: boolean;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  temperatureBmp?: number;
  /** The temperature the fan controller uses (AHT20, else BMP280). */
  controlTemperature?: number;
  fan: {
    entityId: string;
    available: boolean;
    on: boolean;
    percentage?: number;
    mode?: FanMode;
    /** Options of the mode select for each mode. */
    options: Partial<Record<FanMode, string>>;
    target?: number;
    control?: string;
    rpm?: number;
    stalled: boolean;
    overheat: boolean;
  };
  curve: {
    points: CurvePoint[];
    hysteresis: NumberSetting;
    overheat: NumberSetting;
    stopBelowT1?: boolean;
  };
  hdmi: {
    /** Index (0-based) of the last confirmed input. */
    active?: number;
    verified?: boolean;
    inputs: InputModel[];
  };
  ir: {
    status?: string;
    lastReceived?: string;
    /** Index of the learning target input. */
    target?: number;
    targetOptions: string[];
  };
  relay: { available: boolean; on: boolean; changedAt?: number };
  pi: PiStatus;
  alarms: Alarm[];
  diag: { rssi?: number; ip?: string; ssid?: string; uptime?: number };
  tests: {
    status?: string;
    rxFrames?: number;
    pwm: NumberSetting;
    irDebug?: boolean;
    ledSteady?: boolean;
  };
  watched: string[];
}

function textState(state: HassEntity | undefined): string | undefined {
  if (!isAvailable(state)) return undefined;
  const value = state.state.trim();
  return value && value !== 'unknown' ? value : undefined;
}

function boolState(state: HassEntity | undefined): boolean | undefined {
  if (!isAvailable(state) || state.state === 'unknown') return undefined;
  return state.state === 'on';
}

function numberSetting(
  hass: HomeAssistant,
  entityId: string,
  fallback: { min: number; max: number; step: number },
): NumberSetting {
  const state = hass.states[entityId];
  const attr = (name: string, value: number) => {
    const raw = state?.attributes[name];
    return typeof raw === 'number' && Number.isFinite(raw) ? raw : value;
  };
  return {
    entityId,
    value: parseNumericState(state),
    min: attr('min', fallback.min),
    max: attr('max', fallback.max),
    step: attr('step', fallback.step),
  };
}

/** "HDMI 3" → 2. */
export function parseInputIndex(value: string | undefined): number | undefined {
  const match = value?.match(/(\d+)/);
  if (!match) return undefined;
  const index = Number(match[1]) - 1;
  return index >= 0 && index < INPUT_COUNT ? index : undefined;
}

/** "1: 0x00FF/0xF708 | 2: - | …" → codes per input (`null`: empty slot). */
export function parseStoredCodes(value: string | undefined): (string | null | undefined)[] {
  const codes: (string | null | undefined)[] = Array.from({ length: INPUT_COUNT }, () => undefined);
  if (!value) return codes;
  for (const part of value.split('|')) {
    const match = part.match(/^\s*(\d+)\s*:\s*(.*?)\s*$/);
    if (!match) continue;
    const index = Number(match[1]) - 1;
    if (index < 0 || index >= INPUT_COUNT) continue;
    const code = match[2] ?? '';
    codes[index] = code === '' || code === '-' || code === '—' ? null : code;
  }
  return codes;
}

export { curveAt };

const TEMP_STOPS: (readonly [number, Rgb])[] = [
  [25, [66, 165, 245]],
  [30, [102, 187, 106]],
  [38, [102, 187, 106]],
  [45, [255, 193, 7]],
  [50, [255, 112, 67]],
  [55, [239, 83, 80]],
];

/** Color of a box temperature: blue when cool, green, amber, orange, red at overheat. */
export function temperatureColor(t: number | undefined, overheat = 55): Rgb {
  if (t === undefined) return [255, 193, 7];
  // The scale ends at the overheat threshold, wherever it is set.
  const shift = overheat - 55;
  return blendStops(
    TEMP_STOPS.map(([at, rgb]) => [at + shift, rgb] as const),
    t,
  );
}

function piStatus(
  hass: HomeAssistant,
  relay: AmbilightModel['relay'],
  hyperhdrEntity: string | undefined,
  now: number,
): PiStatus {
  if (!relay.available) return 'unknown';
  if (!relay.on) return 'off';
  if (!hyperhdrEntity) return 'on';
  const state = hass.states[hyperhdrEntity];
  if (!isAvailable(state)) {
    const since = relay.changedAt === undefined ? Infinity : now - relay.changedAt;
    return since < BOOT_MS ? 'booting' : 'unreachable';
  }
  return state.state === 'off' ? 'paused' : 'ready';
}

export function buildAmbilightModel(
  hass: HomeAssistant,
  config: ResolvedAmbilightConfig,
  now = Date.now(),
): AmbilightModel {
  const ids = config.entities;
  const st = (key: EntityKey) => hass.states[ids[key]];
  const num = (key: EntityKey) => parseNumericState(st(key));

  const onlineState = st('online');
  // Without the status sensor, any available entity of the device means online.
  const online = onlineState
    ? onlineState.state === 'on'
    : isAvailable(st('fan')) || isAvailable(st('relay'));

  const temperature = num('temperature');
  const temperatureBmp = num('temperatureBmp');
  const controlTemperature = temperature ?? temperatureBmp;

  const fanState = st('fan');
  const modeState = st('fanMode');
  const options = (modeState?.attributes.options ?? []).filter(
    (option): option is string => typeof option === 'string',
  );
  const auto = options.find((option) => /^auto/i.test(option));
  const manual = options.find((option) => /^manual/i.test(option));
  const modeText = textState(modeState);
  const mode: FanMode | undefined = modeText
    ? /^auto/i.test(modeText)
      ? 'auto'
      : 'manual'
    : undefined;
  const percentageAttr = fanState?.attributes.percentage;
  const fanOn = fanState?.state === 'on';
  const percentage = !isAvailable(fanState)
    ? undefined
    : !fanOn
      ? 0
      : typeof percentageAttr === 'number'
        ? Math.round(percentageAttr)
        : undefined;
  const stalled = boolState(st('stalled')) === true;
  const overheat = boolState(st('overheat')) === true;

  const points: CurvePoint[] = [1, 2, 3, 4].map((n) => ({
    index: n - 1,
    t: numberSetting(hass, ids[`t${n}` as EntityKey], { min: 15, max: 80, step: 0.5 }),
    s: numberSetting(hass, ids[`s${n}` as EntityKey], { min: 0, max: 100, step: 1 }),
  }));

  const codes = parseStoredCodes(textState(st('irCodes')));
  const inputs: InputModel[] = config.inputs.map((input, index) => {
    const button = ids[`hdmi${index + 1}` as EntityKey];
    return {
      name: input.name,
      icon: input.icon,
      button,
      // A button never pressed reports `unknown`: only `unavailable` means it cannot be used.
      available: hass.states[button] !== undefined && hass.states[button]?.state !== 'unavailable',
      code: codes[index],
    };
  });

  const targetState = st('learnTarget');
  const targetOptions = (targetState?.attributes.options ?? []).filter(
    (option): option is string => typeof option === 'string',
  );

  const relayState = st('relay');
  const changed = relayState ? Date.parse(relayState.last_changed) : Number.NaN;
  const relay = {
    available: isAvailable(relayState),
    on: relayState?.state === 'on',
    changedAt: Number.isFinite(changed) ? changed : undefined,
  };

  const alarms: Alarm[] = [];
  if (!online) alarms.push('offline');
  else {
    if (overheat) alarms.push('overheat');
    if (stalled) alarms.push('stalled');
    if (controlTemperature === undefined) alarms.push('nosensor');
  }

  const watched = new Set<string>(Object.values(ids));
  if (config.hyperhdrEntity) watched.add(config.hyperhdrEntity);
  if (config.sendCounterEntity) watched.add(config.sendCounterEntity);

  return {
    name: config.name ?? 'Ambilight',
    online,
    temperature,
    humidity: num('humidity'),
    pressure: num('pressure'),
    temperatureBmp,
    controlTemperature,
    fan: {
      entityId: ids.fan,
      available: isAvailable(fanState),
      on: fanOn,
      percentage,
      mode,
      options: { auto, manual },
      target: num('fanTarget'),
      control: textState(st('fanControl')),
      rpm: num('rpm') ?? num('rpmRaw'),
      stalled,
      overheat,
    },
    curve: {
      points,
      hysteresis: numberSetting(hass, ids.hysteresis, { min: 0, max: 10, step: 0.5 }),
      overheat: numberSetting(hass, ids.overheatTemp, { min: 30, max: 90, step: 1 }),
      stopBelowT1: boolState(st('stopBelowT1')),
    },
    hdmi: {
      active: parseInputIndex(textState(st('hdmiActive'))),
      verified: boolState(st('irVerified')),
      inputs,
    },
    ir: {
      status: textState(st('irStatus')),
      lastReceived: textState(st('irLast')),
      target: parseInputIndex(textState(targetState)),
      targetOptions,
    },
    relay,
    pi: piStatus(hass, relay, config.hyperhdrEntity, now),
    alarms,
    diag: {
      rssi: num('rssi'),
      ip: textState(st('ip')),
      ssid: textState(st('ssid')),
      uptime: num('uptime'),
    },
    tests: {
      status: textState(st('testStatus')),
      rxFrames: num('rxFrames'),
      pwm: numberSetting(hass, ids.pwm, { min: 50, max: 1000, step: 1 }),
      irDebug: boolState(st('irDebug')),
      ledSteady: boolState(st('ledSteady')),
    },
    watched: [...watched],
  };
}

/* ------------------------------ HDMI send tracking ------------------------------ */

/** What the card knows of the device when it sends, to tell when the send landed. */
export interface SendSnapshot {
  active?: number;
  activeChanged?: string;
  verified?: boolean;
  verifiedChanged?: string;
  counter?: string;
}

export interface PendingSend {
  index: number;
  at: number;
  before: SendSnapshot;
}

/** Longest wait for the echo (the firmware retries once). */
export const SEND_TIMEOUT_MS = 5000;

export type SendOutcome = 'pending' | 'ok' | 'fail' | 'sent';

export function sendSnapshot(hass: HomeAssistant, config: ResolvedAmbilightConfig): SendSnapshot {
  const active = hass.states[config.entities.hdmiActive];
  const verified = hass.states[config.entities.irVerified];
  const counter = config.sendCounterEntity ? hass.states[config.sendCounterEntity] : undefined;
  return {
    active: parseInputIndex(textState(active)),
    activeChanged: active?.last_changed,
    verified: boolState(verified),
    verifiedChanged: verified?.last_changed,
    counter: counter?.state,
  };
}

/**
 * Outcome of a send: `ok` when the device confirmed this input after the
 * press, `fail` when it reported a failed echo or nothing came back in time,
 * `sent` when the input was already active and nothing could change (no
 * send counter): the frame left but the card cannot tell how it went.
 */
export function sendOutcome(pending: PendingSend, now: SendSnapshot, time: number): SendOutcome {
  const before = pending.before;
  if (before.counter !== undefined && now.counter !== undefined) {
    if (now.counter !== before.counter) return now.verified === false ? 'fail' : 'ok';
  }
  const verifiedMoved = now.verifiedChanged !== before.verifiedChanged;
  const activeMoved = now.activeChanged !== before.activeChanged;
  if (verifiedMoved && now.verified === false) return 'fail';
  if (now.active === pending.index && (activeMoved || verifiedMoved) && now.verified !== false) {
    return 'ok';
  }
  if (time - pending.at < SEND_TIMEOUT_MS) return 'pending';
  const repeat = before.active === pending.index && before.verified !== false;
  return repeat && before.counter === undefined ? 'sent' : 'fail';
}
