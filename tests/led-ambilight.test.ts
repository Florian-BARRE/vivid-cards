import { describe, expect, it } from 'vitest';
import { MANAGER_DEVICE, createAmbilightMock, HUB_DEVICE } from '../dev/ambilight-mock';
import { GROUP_ID, createMockHass } from '../dev/mock-hass';
import { DEFAULT_PREFIX } from '../src/cards/ambilight/config';
import { HYPERHDR_INTEGRATION } from '../src/cards/hyperhdr/model';
import {
  ambilightDrive,
  buildAmbilightSide,
  findBoxes,
  hostOf,
  prefixFromEntity,
  railAlert,
  railColors,
  railConfig,
  resolveBoxTarget,
  screenMode,
  piRunning,
  autoFold,
} from '../src/cards/led-group/ambilight-link';
import { resolveConfig } from '../src/cards/led-group/config';
import { forgetExpanded, readExpanded, writeExpanded } from '../src/cards/led-group/fold';
import { buildLedGroupModel } from '../src/cards/led-group/model';
import { captureGradient } from '../src/components/vivid-light-tile';
import type { HassEntity, HomeAssistant, Rgb } from '../src/core/hass-types';
import type { AmbilightScenario } from '../dev/ambilight-mock';

const config = (extra: Record<string, unknown> = {}) =>
  resolveConfig({ type: 'custom:vivid-led-group', entity: GROUP_ID, ...extra });

const STRIPS = ['salon_ambilight_wled', 'salon_buffet_wled', 'salon_canape_wled'];
const HOSTS = ['192.168.1.40', '192.168.1.41', '192.168.1.42'];
const AVERAGES: Rgb[] = [
  [255, 120, 40],
  [180, 50, 240],
  [0, 170, 220],
];

/** The salon LEDs, the Ambilight box and HyperHDR instances sending to the strips. */
function home(
  options: {
    box?: AmbilightScenario | false;
    overrides?: string[];
    instances?: boolean;
    boxArea?: string;
  } = {},
): HomeAssistant {
  const leds = createMockHass('en', { allOnline: true });
  options.overrides?.forEach((option, index) =>
    leds.setState(`select.${STRIPS[index]}_live_override`, option),
  );
  if (options.box === false) return leds.hass;
  const box = createAmbilightMock(options.box ?? {}).hass;
  const now = new Date().toISOString();
  const states: Record<string, HassEntity> = { ...leds.hass.states, ...box.states };
  const entities = { ...leds.hass.entities, ...box.entities };
  const devices = { ...leds.hass.devices, ...box.devices };
  if (options.boxArea !== undefined) {
    devices[MANAGER_DEVICE] = { ...devices[MANAGER_DEVICE]!, area_id: options.boxArea };
  }
  if (options.instances !== false) {
    HOSTS.forEach((host, index) => {
      const device = `instance_${index}`;
      devices[device] = {
        id: device,
        name: `Strip ${index}`,
        name_by_user: null,
        manufacturer: 'HyperHDR',
        model: 'LED instance',
        area_id: null,
        via_device_id: HUB_DEVICE,
      };
      const add = (id: string, key: string | undefined, state: string, attributes = {}) => {
        entities[id] = {
          entity_id: id,
          device_id: device,
          platform: HYPERHDR_INTEGRATION,
          translation_key: key,
          labels: [],
        };
        states[id] = { entity_id: id, state, attributes, last_changed: now, last_updated: now };
      };
      add(`light.instance_${index}`, undefined, 'on', { effect: 'Capture' });
      add(`sensor.instance_${index}_visible_source`, 'visible_source', 'videograbber');
      add(`sensor.instance_${index}_led_device`, 'led_device', 'wled', { address: host });
      add(`sensor.instance_${index}_average_color`, 'average_color', 'on', {
        rgb_color: AVERAGES[index],
      });
    });
  }
  return { ...leds.hass, states, entities, devices };
}

const side = (hass: HomeAssistant, extra: Record<string, unknown> = {}) => {
  const resolved = config(extra);
  return buildAmbilightSide(hass, resolved, buildLedGroupModel(hass, resolved));
};

describe('led group config', () => {
  it('keeps the default layout and leaves the box to auto-detection', () => {
    const resolved = config();
    expect(resolved.layout).toBe('default');
    expect(resolved.expanded).toBe(false);
    expect(resolved.ambilight).toEqual({
      enabled: true,
      box: undefined,
      hyperhdr: undefined,
      inputs: undefined,
      confirmOff: true,
    });
  });

  it('reads the collapsible layout and the box options', () => {
    const resolved = config({
      layout: 'collapsible',
      expanded: true,
      ambilight: { box: 'device_x', inputs: ['TV', { name: 'Console' }], confirm_off: false },
    });
    expect(resolved.layout).toBe('collapsible');
    expect(resolved.expanded).toBe(true);
    expect(resolved.ambilight.box).toBe('device_x');
    expect(resolved.ambilight.inputs).toEqual(['TV', { name: 'Console' }]);
    expect(resolved.ambilight.confirmOff).toBe(false);
    expect(config({ ambilight: { box: false } }).ambilight.box).toBe(false);
  });

  it('rejects an unknown layout and invalid inputs', () => {
    expect(() => config({ layout: 'grid' })).toThrow(/layout/);
    expect(() => config({ ambilight: { inputs: 'TV' } })).toThrow(/inputs/);
  });
});

describe('finding the box', () => {
  it('recognizes the box device and the prefix of its entities', () => {
    const hass = home();
    expect(findBoxes(hass)).toEqual([MANAGER_DEVICE]);
    expect(prefixFromEntity(`switch.${DEFAULT_PREFIX}relay`)).toBe(DEFAULT_PREFIX);
    expect(prefixFromEntity(`number.${DEFAULT_PREFIX}fan_auto_t1`)).toBe(DEFAULT_PREFIX);
    expect(prefixFromEntity('light.salon_leds')).toBeUndefined();
  });

  it('auto-detects the only box when it shares the area of the strips', () => {
    const resolved = config();
    const hass = home({ instances: false });
    const target = resolveBoxTarget(hass, resolved.ambilight, {
      areas: new Set(['salon']),
      hyperhdrStrips: 0,
    });
    expect(target).toEqual({ device: MANAGER_DEVICE });
    // A box in another room stays off this card, unless HyperHDR drives its strips.
    const away = home({ instances: false, boxArea: 'chambre' });
    const context = { areas: new Set(['salon']), hyperhdrStrips: 0 };
    expect(resolveBoxTarget(away, resolved.ambilight, context)).toBeUndefined();
    expect(resolveBoxTarget(away, resolved.ambilight, { ...context, hyperhdrStrips: 2 })).toEqual({
      device: MANAGER_DEVICE,
    });
  });

  it('follows an explicit box, an entity of it, or `false`', () => {
    const hass = home();
    const context = { areas: new Set<string>(), hyperhdrStrips: 0 };
    const target = (box: unknown) =>
      resolveBoxTarget(hass, config({ ambilight: { box } }).ambilight, context);
    expect(target(MANAGER_DEVICE)).toEqual({ device: MANAGER_DEVICE });
    expect(target(`switch.${DEFAULT_PREFIX}relay`)).toEqual({ device: MANAGER_DEVICE });
    expect(target('switch.other_box_relay')).toEqual({ prefix: 'other_box_' });
    expect(target(false)).toBeUndefined();
    // Ambilight turned off: no auto-detected rail.
    const off = config({ ambilight: { enabled: false } }).ambilight;
    expect(resolveBoxTarget(hass, off, { areas: new Set(['salon']), hyperhdrStrips: 0 })).toBe(
      undefined,
    );
  });

  it('builds the rail configuration of the Ambilight card', () => {
    const ambilight = config({ ambilight: { inputs: ['TV'], hyperhdr: 'hub' } }).ambilight;
    expect(railConfig({ device: 'd' }, ambilight)).toEqual({
      type: 'custom:vivid-ambilight-card',
      device: 'd',
      hyperhdr: 'hub',
      inputs: ['TV'],
      confirm_pi_off: true,
      layout: 'line',
    });
  });

  it('has no box without one in the home', () => {
    expect(side(home({ box: false }))).toBeUndefined();
  });
});

describe('what the screen drives', () => {
  it('matches HyperHDR instances by address', () => {
    expect(hostOf('http://192.168.1.42:80/json')).toBe('192.168.1.42');
    expect(hostOf(' 192.168.1.42 ')).toBe('192.168.1.42');
    expect(hostOf(undefined)).toBeUndefined();
    const result = side(home())!;
    expect(result.hyperhdr.byStrip.size).toBe(3);
    expect(result.hyperhdr.byStrip.get('light.salon_canape_wled')?.device?.address).toBe(
      '192.168.1.42',
    );
  });

  it('lists the strips that follow the screen, with their captured colors', () => {
    const result = side(home({ overrides: ['0', '1', '0'] }))!;
    expect(result.box?.relay.on).toBe(true);
    expect(result.drive.active).toBe(true);
    expect(result.drive.driven).toEqual(['light.salon_ambilight_wled', 'light.salon_canape_wled']);
    expect(result.drive.overrides).toEqual([
      'select.salon_ambilight_wled_live_override',
      'select.salon_canape_wled_live_override',
    ]);
    // The instance's average color, at full strength.
    expect(result.drive.colors[0]).toEqual([255, 120, 40]);
    expect(result.drive.colors[1]).toEqual([0, 197, 255]);
    expect(result.watched).toContain(`switch.${DEFAULT_PREFIX}relay`);
  });

  it('drives nothing while the Pi is off', () => {
    const result = side(home({ box: { piOff: true }, overrides: ['0', '0', '0'] }))!;
    expect(result.drive.active).toBe(false);
    expect(result.drive.driven).toEqual([]);
  });

  it('skips strips whose instance is off, and strips left out of the ambilight', () => {
    const resolved = config({ members: [{ entity: 'light.salon_canape_wled', ambilight: false }] });
    const hass = home({ overrides: ['0', '0', '0'] });
    const model = buildLedGroupModel(hass, resolved);
    const link = side(hass)!.hyperhdr;
    const instance = link.byStrip.get('light.salon_buffet_wled')!;
    const byStrip = new Map(link.byStrip);
    byStrip.set('light.salon_buffet_wled', { ...instance, on: false });
    const drive = ambilightDrive(model.detected, { hub: link.hub, byStrip }, true);
    expect(drive.driven).toEqual(['light.salon_ambilight_wled']);
  });

  it('without HyperHDR, the strips listening to realtime data follow the Pi', () => {
    const resolved = config();
    const hass = home({ overrides: ['0', '1', '1'], instances: false });
    const model = buildLedGroupModel(hass, resolved);
    const drive = ambilightDrive(model.detected, { byStrip: new Map() }, true);
    expect(drive.driven).toEqual(['light.salon_ambilight_wled']);
    expect(railColors(drive)).toHaveLength(2);
  });
});

describe('Ambilight mode', () => {
  const mode = (hass: HomeAssistant) => {
    const result = side(hass);
    return screenMode(result, buildLedGroupModel(hass, config()).liveOverride);
  };

  it('follows the Ambilight button while the Pi runs', () => {
    expect(mode(home({ overrides: ['0', '0', '0'] }))).toBe(true);
    // One ambilight strip ignores the stream: the button is up, the colors come back.
    expect(mode(home({ overrides: ['0', '1', '0'] }))).toBe(false);
    expect(mode(home({ overrides: ['1', '1', '1'] }))).toBe(false);
    // The Pi is off: no Ambilight mode, even when WLED listens.
    expect(mode(home({ box: { piOff: true }, overrides: ['0', '0', '0'] }))).toBe(false);
    expect(screenMode(undefined, { active: false })).toBe(false);
    expect(piRunning(side(home()))).toBe(true);
  });

  it('folds when the Pi starts and unfolds when the strips are taken back', () => {
    expect(autoFold(undefined, { piOn: true, screen: false })).toBeUndefined();
    expect(autoFold({ piOn: false, screen: false }, { piOn: true, screen: false })).toBe(false);
    expect(autoFold({ piOn: true, screen: false }, { piOn: true, screen: true })).toBeUndefined();
    expect(autoFold({ piOn: true, screen: true }, { piOn: true, screen: false })).toBe(true);
    // The Pi stops: the card stays as the user left it.
    expect(autoFold({ piOn: true, screen: true }, { piOn: false, screen: false })).toBeUndefined();
    expect(autoFold({ piOn: true, screen: false }, { piOn: true, screen: false })).toBeUndefined();
  });
});

describe('rail alert', () => {
  it('turns red on overheat and stalled fan, not when offline', () => {
    expect(railAlert(side(home({ box: { cpuTemperature: 84 } }))!.box!)).toEqual({
      alarm: 'cpuoverheat',
      temperature: 84,
    });
    expect(railAlert(side(home({ box: { stalled: true } }))!.box!)?.alarm).toBe('stalled');
    expect(railAlert(side(home({ box: { offline: true } }))!.box!)).toBeUndefined();
    expect(railAlert(side(home())!.box!)).toBeUndefined();
  });
});

describe('fold state', () => {
  it('remembers the choice in memory and in storage', () => {
    forgetExpanded();
    const data = new Map<string, string>();
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => void data.set(key, value),
    };
    expect(readExpanded('light.a', true, storage)).toBe(true);
    writeExpanded('light.a', false, storage);
    expect(readExpanded('light.a', true, storage)).toBe(false);
    forgetExpanded();
    // A new session finds it in storage.
    expect(readExpanded('light.a', true, storage)).toBe(false);
  });

  it('survives a storage that throws', () => {
    forgetExpanded();
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(readExpanded('light.b', false, broken)).toBe(false);
    writeExpanded('light.b', true, broken);
    expect(readExpanded('light.b', false, broken)).toBe(true);
  });
});

describe('capture fill', () => {
  it('spreads the strips colors across the tile', () => {
    expect(captureGradient([[255, 0, 0]])).toBe('rgba(255, 0, 0, 0.42)');
    expect(
      captureGradient([
        [255, 0, 0],
        [0, 0, 255],
      ]),
    ).toBe('linear-gradient(90deg, rgba(255, 0, 0, 0.42) 0%, rgba(0, 0, 255, 0.42) 100%)');
  });
});

describe('card language', () => {
  it('follows the profile, else the home, else the device', async () => {
    const { languageOf, localeOf } = await import('../src/i18n');
    const phone = {
      locale: { language: 'en' },
      language: 'en',
      config: { language: 'fr' },
    } as HomeAssistant;
    expect(languageOf(phone)).toBe('fr');
    expect(localeOf({ ...phone, selectedLanguage: 'en-GB' })).toBe('en-GB');
    expect(languageOf({ locale: { language: 'de' } } as HomeAssistant)).toBe('de');
    expect(languageOf(undefined)).toBe('en');
  });
});
