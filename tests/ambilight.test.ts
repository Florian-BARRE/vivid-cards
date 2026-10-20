import { describe, expect, it } from 'vitest';
import { AMBILIGHT_IDS, HYPERHDR_ENTITY, createAmbilightMock } from '../dev/ambilight-mock';
import { DEFAULT_PREFIX, entityMap, resolveAmbilightConfig } from '../src/cards/ambilight/config';
import {
  BOOT_MS,
  SEND_TIMEOUT_MS,
  buildAmbilightModel,
  curveAt,
  parseInputIndex,
  parseStoredCodes,
  sendOutcome,
  temperatureColor,
  type PendingSend,
} from '../src/cards/ambilight/model';

const config = (extra: Record<string, unknown> = {}) =>
  resolveAmbilightConfig({ type: 'custom:vivid-ambilight-card', ...extra });

describe('ambilight config', () => {
  it('builds every entity id from the prefix, prefix doubled as in the device', () => {
    const map = entityMap(DEFAULT_PREFIX);
    expect(map.relay).toBe('switch.salon_salon_ambilight_manager_relay');
    expect(map.fan).toBe('fan.salon_salon_ambilight_manager_jonsbo_fan');
    expect(map.relayPulse).toBe(
      'button.salon_salon_ambilight_manager_test_relay_pulse_3_s_may_cut_the_pi',
    );
    expect(map.learn4).toBe('button.salon_salon_ambilight_manager_ir_learn_4_save_to_target_input');
  });

  it('fills the defaults and the input names', () => {
    const resolved = config({ inputs: ['Freebox', { name: 'PS5', icon: 'mdi:gamepad-variant' }] });
    expect(resolved.inputs.map((input) => input.name)).toEqual([
      'Freebox',
      'PS5',
      'HDMI 3',
      'HDMI 4',
      'HDMI 5',
    ]);
    expect(resolved.inputs[1]?.icon).toBe('mdi:gamepad-variant');
    expect(resolved.confirmPiOff).toBe(true);
    expect(resolved.glow).toBe(100);
  });

  it('accepts another prefix and per-entity overrides', () => {
    const resolved = config({
      prefix: 'box_',
      entities: { relay: 'switch.pi_power', bogus: 'x.y' },
    });
    expect(resolved.entities.relay).toBe('switch.pi_power');
    expect(resolved.entities.fan).toBe('fan.box_jonsbo_fan');
    expect(Object.keys(resolved.entities)).not.toContain('bogus');
  });
});

describe('ambilight parsing', () => {
  it('reads the active input', () => {
    expect(parseInputIndex('HDMI 3')).toBe(2);
    expect(parseInputIndex('Unknown')).toBeUndefined();
    expect(parseInputIndex('HDMI 9')).toBeUndefined();
  });

  it('reads the stored codes', () => {
    expect(parseStoredCodes('1: 0x00FF/0xF708 | 2: - | 3: 0x00FF/0xE11E | 4: - | 5: -')).toEqual([
      '0x00FF/0xF708',
      null,
      '0x00FF/0xE11E',
      null,
      null,
    ]);
    expect(parseStoredCodes(undefined)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('follows the firmware curve', () => {
    const points = [
      { t: 30, s: 30 },
      { t: 35, s: 50 },
      { t: 40, s: 75 },
      { t: 45, s: 100 },
    ];
    expect(curveAt(points, 37.2, true)).toBeCloseTo(61, 5);
    expect(curveAt(points, 20, true)).toBe(0);
    expect(curveAt(points, 20, false)).toBe(30);
    expect(curveAt(points, 60, true)).toBe(100);
    // Out-of-order points still work: sorted by temperature.
    expect(curveAt([points[2]!, points[0]!, points[3]!, points[1]!], 37.2, true)).toBeCloseTo(
      61,
      5,
    );
  });

  it('colors the temperature up to the overheat threshold', () => {
    expect(temperatureColor(56)).toEqual([239, 83, 80]);
    expect(temperatureColor(20)).toEqual([66, 165, 245]);
    // A lower threshold reaches red sooner.
    expect(temperatureColor(45, 45)).toEqual([239, 83, 80]);
  });
});

describe('ambilight model', () => {
  it('reads a healthy device', () => {
    const mock = createAmbilightMock();
    const model = buildAmbilightModel(mock.hass, config({ hyperhdr_entity: HYPERHDR_ENTITY }));
    expect(model.online).toBe(true);
    expect(model.temperature).toBe(37.2);
    expect(model.fan.percentage).toBe(61);
    expect(model.fan.mode).toBe('auto');
    expect(model.fan.options).toEqual({ auto: 'Auto (temperature curve)', manual: 'Manual' });
    expect(model.hdmi.active).toBe(1);
    expect(model.hdmi.inputs[3]?.code).toBeNull();
    expect(model.curve.points.map((point) => point.t.value)).toEqual([30, 35, 40, 45]);
    expect(model.curve.points[0]?.t.step).toBe(0.5);
    expect(model.pi).toBe('ready');
    expect(model.alarms).toEqual([]);
  });

  it('flags a missing climate sensor and keeps the fan at 100 %', () => {
    const model = buildAmbilightModel(createAmbilightMock({ noSensor: true }).hass, config());
    expect(model.temperature).toBeUndefined();
    expect(model.controlTemperature).toBeUndefined();
    expect(model.fan.percentage).toBe(100);
    expect(model.alarms).toEqual(['nosensor']);
  });

  it('falls back to the BMP280 temperature for the controller', () => {
    const mock = createAmbilightMock();
    mock.setState(AMBILIGHT_IDS.temperature, 'unavailable');
    const model = buildAmbilightModel(mock.hass, config());
    expect(model.controlTemperature).toBeCloseTo(37.8, 5);
    expect(model.alarms).toEqual([]);
  });

  it('raises overheat and stall alarms, and only offline when the device is down', () => {
    expect(
      buildAmbilightModel(createAmbilightMock({ overheat: true }).hass, config()).alarms,
    ).toEqual(['overheat']);
    expect(
      buildAmbilightModel(createAmbilightMock({ stalled: true }).hass, config()).alarms,
    ).toEqual(['stalled']);
    const offline = buildAmbilightModel(createAmbilightMock({ offline: true }).hass, config());
    expect(offline.online).toBe(false);
    expect(offline.alarms).toEqual(['offline']);
  });

  it('tells the Pi and HyperHDR states apart', () => {
    const pi = (scenario: Parameters<typeof createAmbilightMock>[0], extra = {}) =>
      buildAmbilightModel(
        createAmbilightMock(scenario).hass,
        config({ hyperhdr_entity: HYPERHDR_ENTITY, ...extra }),
      ).pi;
    expect(pi({ piOff: true })).toBe('off');
    expect(pi({ booting: true })).toBe('booting');
    expect(pi({ paused: true })).toBe('paused');
    expect(pi({})).toBe('ready');
    const mock = createAmbilightMock();
    expect(buildAmbilightModel(mock.hass, config()).pi).toBe('on');
    // Relay closed long ago and HyperHDR still silent: unreachable.
    mock.setState(HYPERHDR_ENTITY, 'unavailable');
    const model = buildAmbilightModel(
      mock.hass,
      config({ hyperhdr_entity: HYPERHDR_ENTITY }),
      Date.now() + BOOT_MS,
    );
    expect(model.pi).toBe('unreachable');
  });
});

describe('HDMI send tracking', () => {
  const before = { active: 1, activeChanged: 'a0', verified: true, verifiedChanged: 'v0' };
  const pending = (index: number, extra: Partial<PendingSend['before']> = {}): PendingSend => ({
    index,
    at: 0,
    before: { ...before, ...extra },
  });

  it('confirms when the device reports the new input', () => {
    expect(sendOutcome(pending(2), { ...before, active: 2, activeChanged: 'a1' }, 800)).toBe('ok');
  });

  it('waits, then fails without an answer', () => {
    expect(sendOutcome(pending(2), before, 800)).toBe('pending');
    expect(sendOutcome(pending(2), before, SEND_TIMEOUT_MS)).toBe('fail');
  });

  it('fails as soon as the echo is reported missing', () => {
    expect(
      sendOutcome(pending(2), { ...before, verified: false, verifiedChanged: 'v1' }, 900),
    ).toBe('fail');
  });

  it('cannot tell for a repeated input without a counter, but can with one', () => {
    expect(sendOutcome(pending(1), before, SEND_TIMEOUT_MS)).toBe('sent');
    const counted = pending(1, { counter: '41' });
    expect(sendOutcome(counted, { ...before, counter: '42' }, 600)).toBe('ok');
    expect(sendOutcome(counted, { ...before, counter: '41' }, SEND_TIMEOUT_MS)).toBe('fail');
  });

  it('recovers after a failed send: the echo comes back on', () => {
    const afterFail = pending(2, { verified: false });
    expect(
      sendOutcome(
        afterFail,
        { ...before, active: 2, activeChanged: 'a1', verifiedChanged: 'v1' },
        700,
      ),
    ).toBe('ok');
  });
});
