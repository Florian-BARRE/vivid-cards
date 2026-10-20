/**
 * A simulated "Salon Ambilight Manager" (ESPHome Wemos) and HyperHDR for the
 * preview page and the tests: buttons, selects, numbers and switches behave
 * like the firmware described in the device brief.
 */
import { DEFAULT_PREFIX, ENTITY_SUFFIXES, entityMap } from '../src/cards/ambilight/config';
import { curveAt } from '../src/cards/ambilight/model';
import type { HassEntity, HomeAssistant } from '../src/core/hass-types';

export const HYPERHDR_ENTITY = 'light.hyperhdr';
export const AMBILIGHT_IDS = entityMap(DEFAULT_PREFIX);

export interface AmbilightScenario {
  /** Climate board not detected: temperature, humidity and pressure unavailable. */
  noSensor?: boolean;
  overheat?: boolean;
  stalled?: boolean;
  offline?: boolean;
  piOff?: boolean;
  /** Relay closed moments ago: HyperHDR still booting. */
  booting?: boolean;
  /** HyperHDR answering with its output off. */
  paused?: boolean;
  manual?: boolean;
  /** Inputs (0-based) whose echo never comes back. */
  failInputs?: number[];
  /** Milliseconds the device takes to confirm a send. */
  echoMs?: number;
  /** Milliseconds HyperHDR takes to answer after the relay closes. */
  bootMs?: number;
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
  const bootMs = scenario.bootMs ?? 6000;

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
  const temperature = scenario.overheat ? 56 : scenario.stalled ? 46 : 37.2;
  const autoSpeed = () =>
    Math.round(
      curveAt(
        curve.t.map((t, i) => ({ t, s: curve.s[i] ?? 0 })),
        temperature,
        true,
      ),
    );
  let mode: 'Auto (temperature curve)' | 'Manual' = scenario.manual
    ? 'Manual'
    : 'Auto (temperature curve)';
  let speed =
    scenario.noSensor || scenario.overheat || scenario.stalled
      ? 100
      : scenario.manual
        ? 75
        : autoSpeed();

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
    if (scenario.noSensor) return 'no temperature reading -> 100 %';
    if (scenario.overheat) return `OVERHEAT ${temperature.toFixed(1)} C -> 100 %`;
    return `Auto: ${temperature.toFixed(1)} C -> ${speed} %`;
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

  const relayOn = !scenario.piOff;
  put(ids.relay, sensorState(relayOn ? 'on' : 'off'), {}, scenario.booting ? 20_000 : 2 * 3600_000);
  const hyperhdr =
    !relayOn || scenario.booting || offline ? 'unavailable' : scenario.paused ? 'off' : 'on';
  put(HYPERHDR_ENTITY, hyperhdr, { friendly_name: 'HyperHDR' });

  put(ids.testStatus, sensorState('Self-test OK: 0 rpm stopped, 2090 rpm at 100 %'));
  put(ids.irDebug, sensorState('off'));
  put(ids.ledSteady, sensorState('off'));
  put(ids.rxFrames, sensorState('142'));
  put(ids.pwm, sensorState('100'), { min: 50, max: 1000, step: 1, unit_of_measurement: 'Hz' });

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
      } else if (entityId === ids.relayPulse) {
        put(ids.relay, 'off');
        put(HYPERHDR_ENTITY, 'unavailable');
        later(3000, () => put(ids.relay, 'on'));
        later(3000 + bootMs, () => put(HYPERHDR_ENTITY, 'on'));
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
        if (mode !== 'Manual' && !scenario.noSensor && !scenario.overheat) speed = autoSpeed();
        publishFan();
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
      if (mode !== 'Manual' && !scenario.noSensor && !scenario.overheat) {
        speed = autoSpeed();
        publishFan();
      }
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
      put(entityId, on ? 'on' : 'off');
      if (entityId === ids.relay) {
        put(HYPERHDR_ENTITY, 'unavailable');
        if (on) later(bootMs, () => put(HYPERHDR_ENTITY, 'on'));
      }
      publish();
    }
  };

  hass = {
    states,
    entities: {},
    devices: {},
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
