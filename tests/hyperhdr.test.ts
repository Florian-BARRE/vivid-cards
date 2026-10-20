import { describe, expect, it } from 'vitest';
import { SERVER_DEVICE, STRIPS, createHyperHdrMock } from '../dev/hyperhdr-mock';
import { resolveHyperHdrConfig } from '../src/cards/hyperhdr/config';
import {
  TEMP_ALARM,
  TEMP_WARN,
  accentPair,
  buildModel,
  effectColor,
  findDevices,
  hubHealth,
  hubIcon,
  instanceColor,
  vivid,
} from '../src/cards/hyperhdr/model';
import { hubStatus, instanceStatus } from '../src/cards/hyperhdr/view';
import { edgeColors, frameGradient } from '../src/cards/hyperhdr/vivid-hyperhdr-screen';
import type { Rgb } from '../src/core/hass-types';

describe('hyperhdr config', () => {
  it('defaults to the hub and every strip, with the picture', () => {
    const config = resolveHyperHdrConfig({ type: 'custom:vivid-hyperhdr-card' });
    expect(config).toMatchObject({ mode: 'all', picture: true, glow: 100 });
  });

  it('keeps a known mode and drops an unknown one', () => {
    expect(resolveHyperHdrConfig({ type: 'x', mode: 'strip', picture: false }).mode).toBe('strip');
    expect(resolveHyperHdrConfig({ type: 'x', mode: 'nope' as never }).mode).toBe('all');
    expect(resolveHyperHdrConfig({ type: 'x', mode: 'strip', picture: false }).picture).toBe(false);
  });
});

describe('hyperhdr devices', () => {
  it('finds the server and its strips from the registries', () => {
    const { hass } = createHyperHdrMock();
    const devices = findDevices(hass);
    expect(devices.servers).toEqual([SERVER_DEVICE]);
    // Sorted by name.
    expect(devices.instances[SERVER_DEVICE]).toEqual([
      'hyperhdr_desk',
      'hyperhdr_bedroom',
      'hyperhdr_tv',
    ]);
    expect(devices.entities.hyperhdr_tv?.['light.main']).toBe('light.tv');
    expect(devices.entities.hyperhdr_tv?.['switch.hdr']).toBe('switch.tv_hdr_tone_mapping');
    expect(devices.entities[SERVER_DEVICE]?.['sensor.cpu']).toBe('sensor.hyperhdr_salon_cpu');
  });

  it('ignores the entities of other integrations', () => {
    const { hass } = createHyperHdrMock();
    const other = {
      ...hass,
      entities: {
        ...hass.entities,
        'light.other': { entity_id: 'light.other', device_id: 'x', platform: 'wled', labels: [] },
      },
    };
    expect(Object.keys(findDevices(other).entities)).not.toContain('x');
  });
});

describe('hyperhdr model', () => {
  it('reads the hub', () => {
    const { hass } = createHyperHdrMock();
    const model = buildModel(hass, findDevices(hass), SERVER_DEVICE);
    expect(model.hub).toMatchObject({
      connected: true,
      undervoltage: false,
      cpu: 23.4,
      temperature: 52.3,
      memory: 18.2,
      memoryUsedMb: 1460,
      captureFps: 60,
      version: '22.0.0',
      architecture: 'aarch64',
      camera: 'camera.hyperhdr_salon_captured_picture',
      health: 'ok',
    });
    expect(hubIcon(model.hub!)).toBe('mdi:raspberry-pi');
    expect(model.instances).toHaveLength(3);
  });

  it('reads each strip: source, effect, brightness, components', () => {
    const { hass } = createHyperHdrMock();
    const model = buildModel(hass, findDevices(hass), SERVER_DEVICE);
    const [desk, bedroom, tv] = model.instances;
    expect(tv).toMatchObject({
      name: 'TV',
      on: true,
      source: 'capture',
      brightness: 78,
      outputFps: 58,
      ledCount: 120,
    });
    expect(tv?.toggles.hdr).toMatchObject({ entity: 'switch.tv_hdr_tone_mapping', on: true });
    expect(desk).toMatchObject({ source: 'effect', effect: 'Northern lights', brightness: 60 });
    expect(desk?.effects).not.toContain('Capture');
    expect(desk?.effects).not.toContain('Solid');
    expect(bedroom).toMatchObject({ on: false, source: 'none' });
  });

  it('keeps one strip, and still counts every strip of the server', () => {
    const { hass } = createHyperHdrMock();
    const model = buildModel(hass, findDevices(hass), undefined, STRIPS[0].device);
    expect(model.instances.map((item) => item.name)).toEqual(['TV']);
    expect(model.strips).toHaveLength(3);
    expect(model.hub?.deviceId).toBe(SERVER_DEVICE);
    // The other lights are watched, for the count of strips on.
    expect(model.watched).toContain('light.bureau');
    expect(hubStatus(undefined, model.hub!, model.strips).text).toBe('22.0.0 · 2 strips on');
  });

  it('turns the hub orange, then red', () => {
    const base = { deviceId: 'x', name: 'x', connected: true, entities: {} };
    expect(hubHealth({ ...base, temperature: TEMP_WARN - 1 })).toBe('ok');
    expect(hubHealth({ ...base, temperature: TEMP_WARN })).toBe('warn');
    expect(hubHealth({ ...base, temperature: TEMP_ALARM })).toBe('alarm');
    expect(hubHealth({ ...base, temperature: 40, undervoltage: true })).toBe('alarm');
    expect(hubHealth({ ...base, connected: false })).toBe('offline');
  });

  it('says what goes wrong', () => {
    const hot = createHyperHdrMock({ hot: true });
    const model = buildModel(hot.hass, findDevices(hot.hass), SERVER_DEVICE);
    expect(model.hub?.health).toBe('alarm');
    expect(hubStatus(undefined, model.hub!, model.strips)).toEqual({
      text: 'Undervoltage detected',
      tone: 'alarm',
    });
    const offline = createHyperHdrMock({ offline: true });
    const down = buildModel(offline.hass, findDevices(offline.hass), SERVER_DEVICE);
    expect(down.hub?.health).toBe('offline');
    expect(instanceStatus(undefined, down.instances[0]!)).toBe('Unavailable');
  });

  it('has no picture without the admin password', () => {
    const { hass } = createHyperHdrMock({ noAdmin: true });
    const model = buildModel(hass, findDevices(hass), SERVER_DEVICE);
    expect(model.hub?.camera).toBeUndefined();
    expect(model.instances[0]?.toggles.boot_effect).toBeUndefined();
  });

  it('writes the status of a strip', () => {
    const { hass } = createHyperHdrMock();
    const model = buildModel(hass, findDevices(hass), SERVER_DEVICE);
    expect(model.instances.map((item) => instanceStatus(undefined, item))).toEqual([
      'Northern lights · 60\u00a0% · 58 fps',
      'Off',
      'Capture · 78\u00a0% · 58 fps',
    ]);
  });
});

describe('hyperhdr colors', () => {
  it('reads the edges clockwise from the top left corner', () => {
    const width = 4;
    const height = 3;
    // Top row red, right column green, bottom row blue, left column white.
    const data: number[] = [];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const rgb: Rgb =
          y === 0
            ? [255, 0, 0]
            : x === width - 1
              ? [0, 255, 0]
              : y === height - 1
                ? [0, 0, 255]
                : [255, 255, 255];
        data.push(...rgb, 255);
      }
    }
    // 4 + 2 + 3 + 1 = 10 pixels around; one color each.
    const ring = edgeColors(data, width, height, 10);
    expect(ring.slice(0, 4)).toEqual(Array(4).fill([255, 0, 0]));
    expect(ring.slice(4, 6)).toEqual(Array(2).fill([0, 255, 0]));
    expect(ring.slice(6, 9)).toEqual(Array(3).fill([0, 0, 255]));
    expect(ring[9]).toEqual([255, 255, 255]);
  });

  it('closes the frame gradient on its first color', () => {
    const gradient = frameGradient([
      [255, 0, 0],
      [0, 0, 255],
    ]);
    expect(gradient).toBe(
      'conic-gradient(from -60deg, rgb(255, 0, 0) 0.0deg, rgb(0, 0, 255) 180.0deg, rgb(255, 0, 0) 360.0deg)',
    );
    expect(frameGradient([])).toBe('none');
  });

  it('lights colors as LEDs do', () => {
    expect(vivid([60, 30, 15])).toEqual([255, 128, 64]);
    expect(vivid([0, 0, 0])).toEqual([90, 90, 90]);
  });

  it('picks two distinct tints of a picture', () => {
    const pair = accentPair([
      [20, 10, 40],
      [255, 200, 120],
      [250, 198, 118],
      [60, 70, 200],
    ]);
    expect(pair?.[0]).toEqual(vivid([255, 200, 120]));
    expect(pair?.[1]).toEqual(vivid([60, 70, 200]));
  });

  it('tints a strip by what drives it', () => {
    const { hass } = createHyperHdrMock();
    const [desk, , tv] = buildModel(hass, findDevices(hass), SERVER_DEVICE).instances;
    expect(instanceColor(desk!)).toEqual(effectColor('Northern lights'));
    expect(instanceColor(tv!, [100, 50, 25])).toEqual([255, 128, 64]);
  });
});

describe('hyperhdr services', () => {
  it('turns a strip off, sets an effect, a color and a component', async () => {
    const mock = createHyperHdrMock();
    const { hass } = mock;
    await hass.callService('light', 'toggle', {}, { entity_id: 'light.tv' });
    expect(mock.hass.states['light.tv']?.state).toBe('off');
    await hass.callService('light', 'turn_on', { effect: 'Candle' }, { entity_id: 'light.tv' });
    let model = buildModel(mock.hass, findDevices(mock.hass), undefined, 'hyperhdr_tv');
    expect(model.instances[0]).toMatchObject({ on: true, source: 'effect', effect: 'Candle' });
    await hass.callService(
      'light',
      'turn_on',
      { rgb_color: [255, 0, 0] },
      { entity_id: 'light.tv' },
    );
    model = buildModel(mock.hass, findDevices(mock.hass), undefined, 'hyperhdr_tv');
    expect(model.instances[0]).toMatchObject({ source: 'color', color: [255, 0, 0] });
    await hass.callService('switch', 'toggle', {}, { entity_id: 'switch.tv_smoothing' });
    expect(mock.hass.states['switch.tv_smoothing']?.state).toBe('off');
  });
});
