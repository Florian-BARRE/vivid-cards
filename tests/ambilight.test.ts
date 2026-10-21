import { describe, expect, it, vi } from 'vitest';
import { AMBILIGHT_IDS, HUB_DEVICE, HUB_IDS, createAmbilightMock } from '../dev/ambilight-mock';
import { DEFAULT_PREFIX, entityMap, resolveAmbilightConfig } from '../src/cards/ambilight/config';
import {
  SEND_TIMEOUT_MS,
  buildAmbilightModel,
  curveAt,
  hyperhdrLink,
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
    const mock = createAmbilightMock({ hyperhdr: 'none' });
    const model = buildAmbilightModel(mock.hass, config());
    expect(model.online).toBe(true);
    expect(model.temperature).toBe(37.2);
    expect(model.fan.percentage).toBe(61);
    expect(model.fan.mode).toBe('auto');
    expect(model.fan.options).toEqual({ auto: 'Auto (temperature curve)', manual: 'Manual' });
    expect(model.hdmi.active).toBe(1);
    expect(model.hdmi.inputs[3]?.code).toBeNull();
    expect(model.curve.points.map((point) => point.t.value)).toEqual([30, 35, 40, 45]);
    expect(model.curve.points[0]?.t.step).toBe(0.5);
    expect(model.pi).toBe('on');
    expect(model.alarms).toEqual([]);
  });

  it('flags a missing climate sensor and keeps the fan at 100 %', () => {
    const model = buildAmbilightModel(
      createAmbilightMock({ noSensor: true, hyperhdr: 'none' }).hass,
      config(),
    );
    expect(model.temperature).toBeUndefined();
    expect(model.controlTemperature).toBeUndefined();
    expect(model.fan.percentage).toBe(100);
    expect(model.alarms).toEqual(['nosensor']);
  });

  it('falls back to the BMP280 temperature for the controller', () => {
    const mock = createAmbilightMock({ hyperhdr: 'none' });
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

  it('reads the Pi power from its relay', () => {
    expect(buildAmbilightModel(createAmbilightMock({ piOff: true }).hass, config()).pi).toBe('off');
    expect(buildAmbilightModel(createAmbilightMock().hass, config()).pi).toBe('on');
    const mock = createAmbilightMock();
    mock.setState(AMBILIGHT_IDS.relay, 'unavailable');
    expect(buildAmbilightModel(mock.hass, config()).pi).toBe('unknown');
  });
});

describe('ambilight with HyperHDR', () => {
  it('follows the CPU curve while HyperHDR is connected', () => {
    const model = buildAmbilightModel(createAmbilightMock().hass, config());
    expect(model.fan.source).toBe('cpu');
    expect(model.cpuTemperature).toBe(58);
    expect(model.controlTemperature).toBe(58);
    // CPU curve 50 °C → 30 %, 60 °C → 50 %: 58 °C → 46 %.
    expect(model.fan.percentage).toBe(46);
    expect(model.cpu?.points.map((point) => point.t.value)).toEqual([50, 60, 70, 75]);
    expect(model.cpu?.overheat.value).toBe(80);
    expect(model.cpu?.minSpeed.value).toBe(50);
    expect(model.hub?.name).toBe('salon-ambilight-hyperhdr-hub');
    expect(model.hub?.entities['button.reboot']).toBe(HUB_IDS.reboot);
    expect(model.power).toEqual({
      entityId: AMBILIGHT_IDS.piPower,
      clean: true,
      status: 'Pi powered',
      stopping: false,
    });
    expect(model.alarms).toEqual([]);
  });

  it('follows the box curve while HyperHDR is away', () => {
    const model = buildAmbilightModel(createAmbilightMock({ hyperhdr: 'away' }).hass, config());
    expect(model.fan.source).toBe('box');
    expect(model.hub?.connected).toBe(false);
    // A stale CPU temperature is not shown.
    expect(model.cpuTemperature).toBeUndefined();
    expect(model.controlTemperature).toBe(37.2);
  });

  it('keeps the CPU curve without the box sensor', () => {
    const model = buildAmbilightModel(createAmbilightMock({ noSensor: true }).hass, config());
    expect(model.alarms).toEqual(['nosensor']);
    expect(model.controlTemperature).toBe(58);
    expect(model.fan.percentage).toBe(46);
  });

  it('raises the CPU overheat alarm', () => {
    const model = buildAmbilightModel(createAmbilightMock({ cpuTemperature: 84 }).hass, config());
    expect(model.alarms).toEqual(['cpuoverheat']);
  });

  it('picks the configured server, else the only one', () => {
    const hass = createAmbilightMock().hass;
    expect(buildAmbilightModel(hass, config({ hyperhdr: HUB_DEVICE })).hub?.deviceId).toBe(
      HUB_DEVICE,
    );
    expect(buildAmbilightModel(hass, config({ hyperhdr: 'unknown' })).hub?.deviceId).toBe(
      HUB_DEVICE,
    );
    const alone = buildAmbilightModel(createAmbilightMock({ hyperhdr: 'none' }).hass, config());
    expect(alone.hub).toBeUndefined();
    expect(alone.cpuTemperature).toBeUndefined();
  });

  it('shows the clean shutdown until the relay opens', async () => {
    vi.useFakeTimers();
    try {
      const mock = createAmbilightMock();
      await mock.hass.callService('switch', 'turn_off', {}, { entity_id: AMBILIGHT_IDS.piPower });
      let model = buildAmbilightModel(mock.hass, config());
      expect(model.power.stopping).toBe(true);
      expect(model.relay.on).toBe(true);
      vi.advanceTimersByTime(2000);
      model = buildAmbilightModel(mock.hass, config());
      expect(model.power.stopping).toBe(true);
      expect(model.fan.source).toBe('box');
      vi.advanceTimersByTime(3000);
      model = buildAmbilightModel(mock.hass, config());
      expect(model.power.stopping).toBe(false);
      expect(model.relay.on).toBe(false);
      expect(model.power.status).toBe('Pi off');
    } finally {
      vi.useRealTimers();
    }
  });

  it('tells why the box and HyperHDR do not work together', () => {
    const link = (scenario: Parameters<typeof createAmbilightMock>[0]) => {
      const hass = createAmbilightMock(scenario).hass;
      return hyperhdrLink(hass, buildAmbilightModel(hass, config()));
    };
    expect(link({}).state).toBe('ok');
    expect(link({}).noPowerOff).toBe(false);
    expect(link({ hyperhdr: 'away' }).state).toBe('away');
    expect(link({ hyperhdr: 'none' }).state).toBe('none');
    expect(link({ legacy: true }).state).toBe('legacy');
    const blind = link({ espBlind: true });
    expect(blind.state).toBe('unseen');
    // The ids to write in the ESPHome substitutions.
    expect(blind.ids).toEqual({
      connected: HUB_IDS.connected,
      cpuTemperature: HUB_IDS.temperature,
      powerOff: HUB_IDS.powerOff,
    });
    expect(link({ noSsh: true }).noPowerOff).toBe(true);
    // Just connected: the firmware has not switched yet.
    const mock = createAmbilightMock({ espBlind: true });
    mock.setState(HUB_IDS.connected, 'off');
    mock.setState(HUB_IDS.connected, 'on');
    expect(hyperhdrLink(mock.hass, buildAmbilightModel(mock.hass, config())).state).toBe('waiting');
  });

  it('works with the firmware from before HyperHDR', async () => {
    const hass = createAmbilightMock({ legacy: true }).hass;
    const model = buildAmbilightModel(hass, config());
    expect(model.cpu).toBeUndefined();
    expect(model.fan.source).toBeUndefined();
    expect(model.power).toEqual({ entityId: AMBILIGHT_IDS.relay, clean: false, stopping: false });
    const { coverage } = await import('../src/cards/ambilight/devices');
    // Its entities are all there: the HyperHDR ones are not counted as missing.
    expect(coverage(hass, config().entities).missing).toEqual([]);
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

describe('ambilight devices', () => {
  it('finds the prefix from the device', async () => {
    const { MANAGER_DEVICE } = await import('../dev/ambilight-mock');
    const { devicePrefix, lookupDevices, coverage } =
      await import('../src/cards/ambilight/devices');
    const hass = createAmbilightMock().hass;
    expect(devicePrefix(hass, MANAGER_DEVICE)).toBe(DEFAULT_PREFIX);
    expect(devicePrefix(hass, 'device_unknown')).toBeUndefined();
    const raw = { type: 'custom:vivid-ambilight-card', device: MANAGER_DEVICE };
    const resolved = resolveAmbilightConfig(raw, lookupDevices(hass, raw));
    const found = coverage(hass, resolved.entities);
    expect(found.missing).toEqual([]);
    expect(found.found).toBe(found.total);
    // A prefix written in YAML wins over the device.
    expect(
      resolveAmbilightConfig({ ...raw, prefix: 'box_' }, lookupDevices(hass, raw)).entities.relay,
    ).toBe('switch.box_relay');
  });
});
