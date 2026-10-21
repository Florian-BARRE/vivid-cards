/**
 * A simulated "Salon Ambilight Manager" (ESPHome Wemos) for the
 * preview page and the tests: buttons, selects, numbers and switches behave
 * like the firmware described in the device brief.
 */
import {
  DEFAULT_PREFIX,
  ENTITY_SUFFIXES,
  HYPERHDR_KEYS,
  entityMap,
} from '../src/cards/ambilight/config';
import { curveAt } from '../src/cards/ambilight/model';
import type { HassEntity, HomeAssistant } from '../src/core/hass-types';

export const AMBILIGHT_IDS = entityMap(DEFAULT_PREFIX);
export const MANAGER_DEVICE = 'device_ambilight_manager';
/** The HA-HyperHDR server device, named with the prefix `salon-ambilight-hyperhdr`. */
export const HUB_DEVICE = 'device_hyperhdr_hub';
const HUB = 'salon_ambilight_hyperhdr_hub';
export const HUB_IDS = {
  connected: `binary_sensor.${HUB}_connected`,
  undervoltage: `binary_sensor.${HUB}_undervoltage`,
  cpu: `sensor.${HUB}_cpu`,
  temperature: `sensor.${HUB}_cpu_temperature`,
  memory: `sensor.${HUB}_memory`,
  version: `sensor.${HUB}_version`,
  powerOff: `button.${HUB}_power_off`,
  reboot: `button.${HUB}_restart`,
} as const;
const HUB_KEYS: Record<keyof typeof HUB_IDS, string> = {
  connected: 'connected',
  undervoltage: 'undervoltage',
  cpu: 'cpu',
  temperature: 'cpu_temperature',
  memory: 'memory',
  version: 'version',
  powerOff: 'poweroff',
  reboot: 'reboot',
};

export interface AmbilightScenario {
  /** Climate board not detected: temperature, humidity and pressure unavailable. */
  noSensor?: boolean;
  overheat?: boolean;
  stalled?: boolean;
  offline?: boolean;
  piOff?: boolean;
  manual?: boolean;
  /** Inputs (0-based) whose echo never comes back. */
  failInputs?: number[];
  /** Firmware from before HyperHDR: no CPU curve, no "Pi power". */
  legacy?: boolean;
  /** HyperHDR server: none, or connected (default, while the Pi is on). */
  hyperhdr?: 'none' | 'connected' | 'away';
  /** The Pi's CPU temperature (°C). */
  cpuTemperature?: number;
  /** Milliseconds the device takes to confirm a send. */
  echoMs?: number;
  language?: string;
}

export interface AmbilightMock {
  readonly hass: HomeAssistant;
  readonly calls: { domain: string; service: string; data: unknown; target: unknown }[];
  subscribe(listener: (hass: HomeAssistant) => void): () => void;
  setState(
    entityId: string,
    state: string,
    attributes?: HassEntity['attributes'],
    msAgo?: number,
  ): void;
}

const ids = AMBILIGHT_IDS;

export function createAmbilightMock(scenario: AmbilightScenario = {}): AmbilightMock {
  const language = scenario.language ?? 'en';
  const listeners = new Set<(hass: HomeAssistant) => void>();
  const calls: AmbilightMock['calls'] = [];
  let states: Record<string, HassEntity> = {};
  const echoMs = scenario.echoMs ?? 700;

  const iso = (msAgo = 0) => new Date(Date.now() - msAgo).toISOString();
  const put = (
    entityId: string,
    state: string,
    attributes: HassEntity['attributes'] = {},
    msAgo = 0,
  ) => {
    const previous = states[entityId];
    const changed = !previous || previous.state !== state;
    // Copy on write: the previous snapshot keeps its entities, as in Home Assistant.
    states = {
      ...states,
      [entityId]: {
        entity_id: entityId,
        state,
        attributes: { ...(previous?.attributes ?? {}), ...attributes },
        last_changed: changed ? iso(msAgo) : previous.last_changed,
        last_updated: iso(msAgo),
      },
    };
  };

  const curve = { t: [30, 35, 40, 45], s: [30, 50, 75, 100] };
  const cpuCurve = { t: [50, 60, 70, 75], s: [30, 50, 75, 100] };
  const temperature = scenario.overheat ? 56 : scenario.stalled ? 46 : 37.2;
  const cpuTemperature = scenario.cpuTemperature ?? 58;
  const legacy = scenario.legacy === true;
  const withHub = !legacy && scenario.hyperhdr !== 'none';
  let relayOn = !scenario.piOff;
  let hubConnected = withHub && relayOn && scenario.hyperhdr !== 'away';
  const piMin = 50;
  const byCpu = () => hubConnected && !scenario.offline;
  const autoSpeed = () => {
    const pick = byCpu() ? cpuCurve : curve;
    const speed = Math.round(
      curveAt(
        pick.t.map((t, i) => ({ t, s: pick.s[i] ?? 0 })),
        byCpu() ? cpuTemperature : temperature,
        true,
      ),
    );
    // The Pi is on but its temperature is not known: never too slow.
    return !legacy && !byCpu() && relayOn ? Math.max(speed, piMin) : speed;
  };
  let mode: 'Auto (temperature curve)' | 'Manual' = scenario.manual
    ? 'Manual'
    : 'Auto (temperature curve)';
  // No box temperature: 100 %, unless the CPU one drives the fan.
  const forced = () => (scenario.noSensor && !byCpu()) || scenario.overheat === true;
  let speed = forced() || scenario.stalled ? 100 : scenario.manual ? 75 : autoSpeed();

  const offline = scenario.offline === true;
  const sensorState = (value: string) => (offline ? 'unavailable' : value);

  // Every entity of the device starts available.
  for (const id of Object.values(ids)) put(id, sensorState('unknown'));

  put(ids.online, offline ? 'off' : 'on', { device_class: 'connectivity' });
  const climate = (value: string) =>
    offline ? 'unavailable' : scenario.noSensor ? 'unavailable' : value;
  put(ids.temperature, climate(String(temperature)), {
    unit_of_measurement: '°C',
    device_class: 'temperature',
  });
  put(ids.humidity, climate('41'), { unit_of_measurement: '%', device_class: 'humidity' });
  put(ids.pressure, climate('1013.2'), { unit_of_measurement: 'hPa', device_class: 'pressure' });
  put(ids.temperatureBmp, climate(String(temperature + 0.6)), { unit_of_measurement: '°C' });
  put(ids.overheat, sensorState(scenario.overheat ? 'on' : 'off'), { device_class: 'heat' });
  put(ids.rssi, sensorState('-58'), { unit_of_measurement: 'dBm' });
  put(ids.uptime, sensorState(String(3 * 86400 + 4 * 3600 + 12 * 60)), {
    unit_of_measurement: 's',
  });
  put(ids.ip, sensorState('192.168.1.47'));
  put(ids.ssid, sensorState('Maison'));

  const controlText = () => {
    if (mode === 'Manual') return 'Manual';
    if (scenario.noSensor && !byCpu()) return 'no temperature reading -> 100 %';
    if (scenario.overheat) return `OVERHEAT box ${temperature.toFixed(1)} C -> 100 %`;
    if (legacy) return `Auto: ${temperature.toFixed(1)} C -> ${speed} %`;
    if (byCpu()) return `Auto CPU: ${cpuTemperature.toFixed(1)} C -> ${speed} %`;
    return `Auto box: ${temperature.toFixed(1)} C -> ${speed} %`;
  };
  const publishFan = () => {
    put(ids.fan, sensorState(speed > 0 ? 'on' : 'off'), { percentage: speed, percentage_step: 1 });
    put(ids.fanMode, sensorState(mode), { options: ['Auto (temperature curve)', 'Manual'] });
    put(ids.fanControl, sensorState(controlText()));
    put(ids.fanTarget, mode === 'Manual' || offline ? 'unavailable' : String(speed), {
      unit_of_measurement: '%',
    });
    const rpm = scenario.stalled ? 0 : speed === 100 ? 2090 : undefined;
    put(ids.rpm, sensorState(rpm === undefined ? 'unknown' : String(rpm)), {
      unit_of_measurement: 'RPM',
    });
    put(ids.rpmRaw, sensorState(String(scenario.stalled ? 0 : Math.round(speed * 21))), {
      unit_of_measurement: 'RPM',
    });
    if (!legacy) {
      put(ids.fanSource, sensorState(byCpu() ? 'CPU' : 'Box'));
      put(
        ids.fanControlTemp,
        sensorState(String(byCpu() ? cpuTemperature : climate(String(temperature)))),
        { unit_of_measurement: '°C' },
      );
    }
  };
  const refreshAuto = () => {
    if (forced()) speed = 100;
    else if (mode !== 'Manual' && !scenario.stalled) speed = autoSpeed();
    publishFan();
  };
  publishFan();
  put(ids.stalled, sensorState(scenario.stalled ? 'on' : 'off'), { device_class: 'problem' });
  for (let n = 1; n <= 4; n += 1) {
    put(ids[`t${n}` as 't1'], sensorState(String(curve.t[n - 1])), {
      min: 15,
      max: 80,
      step: 0.5,
      unit_of_measurement: '°C',
    });
    put(ids[`s${n}` as 's1'], sensorState(String(curve.s[n - 1])), {
      min: 0,
      max: 100,
      step: 1,
      unit_of_measurement: '%',
    });
  }
  put(ids.hysteresis, sensorState('1.5'), {
    min: 0,
    max: 10,
    step: 0.5,
    unit_of_measurement: '°C',
  });
  put(ids.overheatTemp, sensorState('55'), {
    min: 30,
    max: 90,
    step: 1,
    unit_of_measurement: '°C',
  });
  put(ids.stopBelowT1, sensorState('on'));

  let codes = ['0x00FF/0xF708', '0x00FF/0xF20D', '0x00FF/0xE11E', null, null];
  const publishCodes = () =>
    put(ids.irCodes, sensorState(codes.map((code, i) => `${i + 1}: ${code ?? '-'}`).join(' | ')));
  publishCodes();
  put(ids.hdmiActive, sensorState('HDMI 2'), {}, 40 * 60_000);
  put(ids.irVerified, sensorState('on'), {}, 40 * 60_000);
  put(ids.irStatus, sensorState('Idle. Press Learn 1 to capture a code.'));
  put(ids.irLast, sensorState('0x00FF/0xF20D'));
  put(ids.learnTarget, sensorState('HDMI 4'), {
    options: ['HDMI 1', 'HDMI 2', 'HDMI 3', 'HDMI 4', 'HDMI 5'],
  });
  for (let n = 1; n <= 5; n += 1) put(ids[`hdmi${n}` as 'hdmi1'], sensorState('unknown'));

  put(ids.relay, sensorState(relayOn ? 'on' : 'off'), {}, 2 * 3600_000);

  // Firmware with HyperHDR: the CPU curve and the clean power switch.
  if (legacy) {
    const dropped = new Set(HYPERHDR_KEYS.map((key) => ids[key]));
    states = Object.fromEntries(Object.entries(states).filter(([id]) => !dropped.has(id)));
  } else {
    for (let n = 1; n <= 4; n += 1) {
      put(ids[`c${n}` as 'c1'], sensorState(String(cpuCurve.t[n - 1])), {
        min: 30,
        max: 90,
        step: 0.5,
        unit_of_measurement: '°C',
      });
      put(ids[`cs${n}` as 'cs1'], sensorState(String(cpuCurve.s[n - 1])), {
        min: 0,
        max: 100,
        step: 1,
        unit_of_measurement: '%',
      });
    }
    put(ids.cpuOverheatTemp, sensorState('80'), {
      min: 50,
      max: 95,
      step: 1,
      unit_of_measurement: '°C',
    });
    put(ids.piMinSpeed, sensorState(String(piMin)), {
      min: 0,
      max: 100,
      step: 5,
      unit_of_measurement: '%',
    });
    put(ids.cpuOverheat, sensorState(byCpu() && cpuTemperature >= 80 ? 'on' : 'off'), {
      device_class: 'heat',
    });
    put(ids.piPower, sensorState(relayOn ? 'on' : 'off'), {}, 2 * 3600_000);
    put(ids.piStatus, sensorState(relayOn ? 'Pi powered' : 'Pi off'));
  }
  const publishHub = () => {
    if (!withHub) return;
    const live = (value: string) => (hubConnected ? value : 'unavailable');
    put(HUB_IDS.connected, hubConnected ? 'on' : 'off', { device_class: 'connectivity' });
    put(HUB_IDS.undervoltage, live('off'), { device_class: 'problem' });
    put(HUB_IDS.cpu, live('23'), { unit_of_measurement: '%' });
    put(HUB_IDS.temperature, live(String(cpuTemperature)), {
      unit_of_measurement: '°C',
      device_class: 'temperature',
    });
    put(HUB_IDS.memory, live('41'), { unit_of_measurement: '%' });
    put(HUB_IDS.version, live('22.0.0.0'), { architecture: 'aarch64' });
    put(HUB_IDS.powerOff, live('unknown'));
    put(HUB_IDS.reboot, live('unknown'));
  };
  publishHub();
  if (!legacy) refreshAuto();

  put(ids.testStatus, sensorState('Self-test OK: 0 rpm stopped, 2090 rpm at 100 %'));
  put(ids.irDebug, sensorState('off'));
  put(ids.ledSteady, sensorState('off'));
  put(ids.rxFrames, sensorState('142'));
  put(ids.pwm, sensorState('100'), { min: 50, max: 1000, step: 1, unit_of_measurement: 'Hz' });

  const registry: HomeAssistant['entities'] = {};
  for (const id of Object.values(ids)) {
    if (!states[id]) continue;
    registry[id] = { entity_id: id, device_id: MANAGER_DEVICE, platform: 'esphome', labels: [] };
  }
  if (withHub) {
    for (const [key, id] of Object.entries(HUB_IDS) as [keyof typeof HUB_IDS, string][]) {
      registry[id] = {
        entity_id: id,
        device_id: HUB_DEVICE,
        platform: 'ha_hyperhdr',
        translation_key: HUB_KEYS[key],
        labels: [],
      };
    }
  }

  let hass: HomeAssistant;
  const publish = () => {
    hass = { ...hass, states };
    for (const listener of listeners) listener(hass);
  };
  const later = (ms: number, run: () => void) =>
    setTimeout(() => {
      run();
      publish();
    }, ms);

  let learnCaptured: string | undefined;

  const callService: HomeAssistant['callService'] = async (domain, service, data = {}, target) => {
    calls.push({ domain, service, data, target });
    const entityId = [target?.entity_id].flat()[0] ?? '';
    if (offline) return;
    if (domain === 'button' && service === 'press') {
      const hdmi = Object.entries(ids).find(
        ([key, id]) => key.startsWith('hdmi') && key !== 'hdmiActive' && id === entityId,
      );
      if (hdmi) {
        const index = Number(hdmi[0].slice(4)) - 1;
        const fails = scenario.failInputs?.includes(index) || codes[index] === null;
        later(echoMs, () => {
          if (fails) {
            put(ids.irVerified, 'off');
            put(
              ids.irStatus,
              codes[index] === null
                ? `No code stored for HDMI ${index + 1}.`
                : `HDMI ${index + 1}: echo not received after retry.`,
            );
          } else {
            put(ids.irVerified, 'on');
            put(ids.hdmiActive, `HDMI ${index + 1}`);
            put(ids.irStatus, `HDMI ${index + 1} sent and verified.`);
          }
        });
        return;
      }
      const fanButton = (['fan0', 'fan25', 'fan50', 'fan75', 'fan100'] as const).find(
        (key) => ids[key] === entityId,
      );
      if (fanButton) {
        mode = 'Manual';
        speed = Number(fanButton.slice(3));
        publishFan();
        publish();
        return;
      }
      if (entityId === ids.learn1) {
        put(ids.irStatus, 'Listening… press the button on the original remote.');
        later(1500, () => {
          learnCaptured = '0x00FF/0xF30C';
          put(ids.irLast, learnCaptured);
          put(ids.irStatus, `Received NEC ${learnCaptured}. Press Learn 2 to keep it.`);
        });
      } else if (entityId === ids.learn2) {
        put(
          ids.irStatus,
          learnCaptured
            ? `Captured NEC ${learnCaptured}. Put the LED in front of the receiver, then press Learn 3.`
            : 'Nothing captured. Press Learn 1 and try again.',
        );
      } else if (entityId === ids.learn3) {
        put(ids.irStatus, 'Replaying…');
        later(800, () =>
          put(ids.irStatus, `Replay verified. Choose the target input, then press Learn 4.`),
        );
      } else if (entityId === ids.learn4) {
        const target = Number(states[ids.learnTarget]?.state.slice(5)) - 1;
        if (learnCaptured && target >= 0) {
          codes = codes.map((code, i) => (i === target ? (learnCaptured ?? code) : code));
          publishCodes();
          put(ids.irStatus, `Saved ${learnCaptured} to HDMI ${target + 1}.`);
        }
      } else if (entityId === ids.learnCancel) {
        learnCaptured = undefined;
        put(ids.irStatus, 'Learning cancelled.');
      } else if (entityId === ids.learnClear) {
        const target = Number(states[ids.learnTarget]?.state.slice(5)) - 1;
        codes = codes.map((code, i) => (i === target ? null : code));
        publishCodes();
        put(ids.irStatus, `Code of HDMI ${target + 1} erased.`);
      } else if (entityId === HUB_IDS.reboot) {
        hubConnected = false;
        publishHub();
        refreshAuto();
        later(3000, () => {
          hubConnected = relayOn;
          publishHub();
          refreshAuto();
        });
      } else if (entityId === ids.relayPulse) {
        put(ids.relay, 'off');
        later(3000, () => put(ids.relay, 'on'));
      } else if (entityId === ids.fanSelfTest) {
        put(ids.testStatus, 'Self-test running…');
        later(2500, () => put(ids.testStatus, 'Self-test OK: 0 rpm stopped, 2090 rpm at 100 %'));
      } else if (entityId === ids.fanSweep) {
        put(ids.testStatus, 'Sweep: 100 % (15 s)…');
      } else if (entityId === ids.fanStopTests) {
        put(ids.testStatus, 'Tests stopped.');
      } else if (entityId === ids.echoTest) {
        later(500, () => put(ids.testStatus, 'Echo test OK: frame received back.'));
      }
      publish();
      return;
    }
    if (domain === 'select' && service === 'select_option') {
      const option = String((data as { option?: unknown }).option);
      if (entityId === ids.fanMode) {
        mode = option.startsWith('Auto') ? 'Auto (temperature curve)' : 'Manual';
        refreshAuto();
      } else put(entityId, option);
      publish();
      return;
    }
    if (domain === 'number' && service === 'set_value') {
      const value = Number((data as { value?: unknown }).value);
      put(entityId, String(value));
      for (let n = 1; n <= 4; n += 1) {
        if (entityId === ids[`t${n}` as 't1']) curve.t[n - 1] = value;
        if (entityId === ids[`s${n}` as 's1']) curve.s[n - 1] = value;
      }
      for (let n = 1; n <= 4; n += 1) {
        if (entityId === ids[`c${n}` as 'c1']) cpuCurve.t[n - 1] = value;
        if (entityId === ids[`cs${n}` as 'cs1']) cpuCurve.s[n - 1] = value;
      }
      refreshAuto();
      publish();
      return;
    }
    if (domain === 'fan' && service === 'set_percentage') {
      speed = Math.round(Number((data as { percentage?: unknown }).percentage));
      publishFan();
      publish();
      return;
    }
    if (domain === 'switch' || domain === 'homeassistant') {
      const current = states[entityId]?.state === 'on';
      const on = service === 'toggle' ? !current : service === 'turn_on';
      const setRelay = (value: boolean) => {
        relayOn = value;
        put(ids.relay, value ? 'on' : 'off');
        if (!legacy) put(ids.piPower, value ? 'on' : 'off');
        if (!value) hubConnected = false;
        publishHub();
        refreshAuto();
      };
      if (entityId === ids.piPower && !on && relayOn) {
        // The firmware's clean shutdown: Power off over SSH, HyperHDR goes away,
        // the Pi gets its time to halt, then the relay opens.
        put(ids.piStatus, 'Shutting the Pi down cleanly...');
        later(1500, () => {
          hubConnected = false;
          publishHub();
          refreshAuto();
          put(ids.piStatus, 'Pi shutting down, waiting 20s before cutting the power...');
        });
        later(4000, () => {
          setRelay(false);
          put(ids.piStatus, 'Pi off');
        });
      } else if (entityId === ids.piPower || entityId === ids.relay) {
        setRelay(on);
        if (!legacy) put(ids.piStatus, on ? 'Pi starting' : 'Pi off');
        if (on && withHub && scenario.hyperhdr !== 'away') {
          later(2500, () => {
            hubConnected = relayOn;
            publishHub();
            refreshAuto();
          });
        }
      } else put(entityId, on ? 'on' : 'off');
      publish();
    }
  };

  hass = {
    states,
    entities: registry,
    devices: {
      [MANAGER_DEVICE]: {
        id: MANAGER_DEVICE,
        name: 'Salon Ambilight Manager',
        name_by_user: null,
        manufacturer: 'Espressif',
        model: 'Wemos D1 mini',
        area_id: 'salon',
      },
      ...(withHub
        ? {
            [HUB_DEVICE]: {
              id: HUB_DEVICE,
              name: 'salon-ambilight-hyperhdr-hub',
              name_by_user: null,
              manufacturer: 'HyperHDR',
              model: 'HyperHDR server',
              area_id: 'salon',
            },
          }
        : {}),
    },
    language,
    locale: { language },
    themes: { darkMode: true },
    config: { currency: 'EUR', time_zone: 'Europe/Paris' },
    callService,
  };

  return {
    get hass() {
      return hass;
    },
    calls,
    subscribe(listener) {
      listeners.add(listener);
      listener(hass);
      return () => listeners.delete(listener);
    },
    setState(entityId, state, attributes, msAgo) {
      put(entityId, state, attributes, msAgo);
      publish();
    },
  };
}

/** Every suffix, to check that the map covers the device brief. */
export const SUFFIX_COUNT = Object.keys(ENTITY_SUFFIXES).length;
