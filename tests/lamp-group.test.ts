import { describe, expect, it, vi } from 'vitest';
import { LAMP_PLUGS_GROUP_ID, LAMP_SCENE_ID, createMockHass } from '../dev/mock-hass';
import { resolveLampConfig } from '../src/cards/lamp-group/config';
import {
  buildLampGroupModel,
  lampStatus,
  presetCalls,
  switchCalls,
  wattsLevel,
} from '../src/cards/lamp-group/model';
import { hasRestingIcon, restingIcon } from '../src/core/icons';

/** The status with plain spaces (it breaks only after its separators). */
const status = (...args: Parameters<typeof lampStatus>) =>
  lampStatus(...args).replace(/\u00a0/g, ' ');

const config = (extra: Record<string, unknown> = {}) =>
  resolveLampConfig({ type: 'custom:vivid-lamp-group', entity: LAMP_PLUGS_GROUP_ID, ...extra });

describe('lamp card config', () => {
  it('fills the defaults', () => {
    expect(config()).toMatchObject({
      layout: 'ambiance',
      showPower: true,
      showDuration: true,
      showEnergy: true,
      maxWatts: 60,
      warnBelow: 1,
      glow: 100,
      scenes: [],
    });
  });

  it('reads presets', () => {
    const { scenes } = config({
      scenes: [
        { name: 'Soirée', scene: LAMP_SCENE_ID },
        { name: 'Lecture', lamps: ['switch.salon_liseuse'] },
        { name: 'Off', lamps: [] },
      ],
    });
    expect(scenes.map((scene) => scene.icon)).toEqual([
      'mdi:palette',
      'mdi:lamps',
      'mdi:power-off',
    ]);
    expect(scenes[0]?.lamps).toBeUndefined();
  });

  it('rejects what it cannot use', () => {
    expect(() => config({ entity: undefined })).toThrow(/set "entity"/);
    expect(() => config({ entity: 'sensor.x' })).toThrow(/light, a switch/);
    expect(() => config({ layout: 'grid' })).toThrow(/layout/);
    expect(() => config({ price_entity: 'light.x' })).toThrow(/price_entity/);
    expect(() => config({ scenes: [{ name: 'x' }] })).toThrow(/lamps/);
    expect(() => config({ scenes: [{ name: 'x', scene: 'light.x' }] })).toThrow(/not a scene/);
    expect(() => config({ show_power: 'yes' })).toThrow(/show_power/);
    expect(() => config({ glow: 400 })).toThrow(/glow/);
  });
});

describe('resting icons', () => {
  it('prefers the outline, else the crossed-out variant', () => {
    expect(restingIcon('mdi:lamp')).toBe('mdi:lamp-outline');
    expect(restingIcon('mdi:floor-lamp')).toBe('mdi:floor-lamp-outline');
    expect(restingIcon('mdi:desk-lamp')).toBe('mdi:desk-lamp-off');
    expect(restingIcon('mdi:chandelier')).toBe('mdi:chandelier');
    expect(hasRestingIcon('mdi:chandelier')).toBe(false);
  });
});

describe('lamp card model', () => {
  it('reads the lamps, their power and the plug devices', () => {
    const { hass } = createMockHass('fr');
    const model = buildLampGroupModel(hass, config());
    expect(model.name).toBe('Lampes');
    expect(model.lamps.map((lamp) => lamp.name)).toEqual([
      'Lustre',
      'Lampadaire',
      'Suspension',
      'Liseuse',
    ]);
    expect([model.on, model.total]).toEqual([3, 4]);
    expect(model.watts).toBeCloseTo(27.3);
    expect(model.lamps.map((lamp) => lamp.power?.entityId)).toEqual([
      'sensor.salon_lustre_power',
      'sensor.salon_lampadaire_power',
      'sensor.salon_suspension_power',
      'sensor.salon_liseuse_power',
    ]);
    // The bulb of the reading lamp is out: on, but 0.3 W.
    expect(model.lamps.map((lamp) => lamp.warn)).toEqual([false, false, false, true]);
    expect(model.warnings).toBe(1);
  });

  it('switches to the resting icon when off', () => {
    const { hass } = createMockHass();
    const model = buildLampGroupModel(
      hass,
      config({ members: [{ entity: 'switch.salon_lustre', icon_off: 'mdi:sleep' }] }),
    );
    const [lustre, , suspension] = model.lamps;
    expect([lustre?.icon, lustre?.iconOff]).toEqual(['mdi:chandelier', 'mdi:sleep']);
    expect([suspension?.icon, suspension?.iconOff]).toEqual([
      'mdi:ceiling-light',
      'mdi:ceiling-light-outline',
    ]);
    expect(model.iconOff).toBe('mdi:lamps-outline');
  });

  it('glows with the consumption', () => {
    expect(wattsLevel(0, 60)).toBe(0.25);
    expect(wattsLevel(60, 60)).toBeCloseTo(0.9);
    expect(wattsLevel(120, 60)).toBeCloseTo(0.9);
    expect(wattsLevel(undefined, 60)).toBe(0.6);
  });

  it('waits a minute before flagging a lamp that draws nothing', () => {
    const mock = createMockHass();
    mock.setState('switch.salon_liseuse', 'on', undefined, 0.5);
    const model = buildLampGroupModel(mock.hass, config());
    expect(model.lamps[3]?.warn).toBe(false);
    expect(buildLampGroupModel(mock.hass, config({ warn_below: 0 })).warnings).toBe(0);
  });

  it('hides lamps from the card but keeps them in the group', () => {
    const { hass } = createMockHass();
    const model = buildLampGroupModel(
      hass,
      config({ members: [{ entity: 'switch.salon_liseuse', hidden: true }] }),
    );
    expect(model.lamps).toHaveLength(3);
    expect(model.all).toHaveLength(4);
    expect(model.on).toBe(3);
  });

  it('takes the price from its entity, else the number', () => {
    const { hass } = createMockHass();
    expect(buildLampGroupModel(hass, config({ price: 0.2 })).price).toBe(0.2);
    expect(
      buildLampGroupModel(hass, config({ price: 0.2, price_entity: 'input_number.prix_kwh' }))
        .price,
    ).toBeCloseTo(0.2516);
    expect(
      buildLampGroupModel(hass, config({ price: 0.2, price_entity: 'sensor.missing' })).price,
    ).toBe(0.2);
  });

  it('writes the status of a lamp', () => {
    const { hass } = createMockHass('fr');
    const model = buildLampGroupModel(hass, config());
    const all = { showPower: true, showDuration: true };
    expect(status(hass, model.lamps[0]!, all)).toBe('18 W · 35 min');
    expect(status(hass, model.lamps[2]!, all)).toBe('éteinte · 3 h');
    expect(status(hass, model.lamps[3]!, { ...all, explainWarning: true })).toBe(
      '0,3 W · ne consomme rien',
    );
    expect(status(hass, model.lamps[0]!, { showPower: false, showDuration: false })).toBe(
      'allumée',
    );
  });
});

describe('lamp card presets', () => {
  const scenes = [
    { name: 'Soirée', scene: LAMP_SCENE_ID },
    {
      name: 'Trio',
      lamps: ['switch.salon_lustre', 'switch.salon_lampadaire', 'switch.salon_liseuse'],
    },
    { name: 'Off', lamps: [] },
  ];

  it('lights up the preset that matches the lamps', () => {
    const { hass } = createMockHass();
    const model = buildLampGroupModel(hass, config({ scenes }));
    expect(model.scenes.map((scene) => scene.active)).toEqual([false, true, false]);
  });

  it('switches only what has to change', () => {
    const { hass } = createMockHass();
    const model = buildLampGroupModel(hass, config({ scenes }));
    expect(presetCalls(model.scenes[2]!, model.all)).toEqual([
      {
        domain: 'switch',
        service: 'turn_off',
        entityIds: ['switch.salon_lustre', 'switch.salon_lampadaire', 'switch.salon_liseuse'],
      },
    ]);
    expect(presetCalls(model.scenes[0]!, model.all)).toEqual([
      { domain: 'scene', service: 'turn_on', entityIds: [LAMP_SCENE_ID] },
    ]);
  });

  it('marks a Home Assistant scene active until a lamp changes', async () => {
    const mock = createMockHass();
    await mock.hass.callService('scene', 'turn_on', {}, { entity_id: LAMP_SCENE_ID });
    const after = buildLampGroupModel(mock.hass, config({ scenes }));
    expect(after.on).toBe(2);
    expect(after.scenes[0]?.active).toBe(true);
    // Changed a while after the scene: no longer what the scene set.
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 30_000);
    await mock.hass.callService('switch', 'toggle', {}, { entity_id: 'switch.salon_liseuse' });
    expect(buildLampGroupModel(mock.hass, config({ scenes })).scenes[0]?.active).toBe(false);
    vi.useRealTimers();
  });

  it('groups the calls by domain', () => {
    expect(switchCalls(['switch.a', 'light.b', 'group.c', 'switch.d'], true)).toEqual([
      { domain: 'switch', service: 'turn_on', entityIds: ['switch.a', 'switch.d'] },
      { domain: 'light', service: 'turn_on', entityIds: ['light.b'] },
      { domain: 'homeassistant', service: 'turn_on', entityIds: ['group.c'] },
    ]);
  });
});

describe('LED card price entity', () => {
  it('reads the price of a kWh from an entity', async () => {
    const { resolveConfig } = await import('../src/cards/led-group/config');
    const { buildLedGroupModel } = await import('../src/cards/led-group/model');
    const { GROUP_ID } = await import('../dev/mock-hass');
    const { hass } = createMockHass();
    const led = (power: Record<string, unknown>) =>
      buildLedGroupModel(
        hass,
        resolveConfig({ type: 'custom:vivid-led-group', entity: GROUP_ID, power }),
      );
    expect(led({ price: 0.2 }).price).toBe(0.2);
    expect(led({ price: 0.2, price_entity: 'input_number.prix_kwh' }).price).toBeCloseTo(0.2516);
    expect(led({ price_entity: 'input_number.prix_kwh' }).watched).toContain(
      'input_number.prix_kwh',
    );
    expect(() => led({ price_entity: 'light.x' })).toThrow(/price_entity/);
  });
});

describe('lamp card scenes switched over', () => {
  it('drops the scene once the card switched lamps after it', async () => {
    const mock = createMockHass();
    await mock.hass.callService('scene', 'turn_on', {}, { entity_id: LAMP_SCENE_ID });
    const scenes = [{ name: 'Soirée', scene: LAMP_SCENE_ID }];
    const now = Date.now();
    expect(buildLampGroupModel(mock.hass, config({ scenes }), now).scenes[0]?.active).toBe(true);
    expect(
      buildLampGroupModel(mock.hass, config({ scenes }), now, now + 1000).scenes[0]?.active,
    ).toBe(false);
  });

  it('allows no delay for lamps the scene does not list', async () => {
    const mock = createMockHass();
    await mock.hass.callService('scene', 'turn_on', {}, { entity_id: LAMP_SCENE_ID });
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 1500);
    await mock.hass.callService('switch', 'turn_on', {}, { entity_id: 'switch.salon_liseuse' });
    vi.useRealTimers();
    const scenes = [{ name: 'Soirée', scene: LAMP_SCENE_ID }];
    expect(buildLampGroupModel(mock.hass, config({ scenes })).scenes[0]?.active).toBe(false);
  });
});

describe('lamp card display options', () => {
  it('fills the display defaults', () => {
    expect(config()).toMatchObject({
      showHeader: true,
      showCount: true,
      showToggleAll: true,
      showNames: true,
      showStatus: true,
      size: 'medium',
      columns: undefined,
      tapAction: 'toggle',
      holdAction: 'details',
    });
  });

  it('reads icons only, a size, columns and gestures', () => {
    expect(
      config({
        show_names: false,
        show_status: false,
        size: 'large',
        columns: 3,
        tap_action: 'more-info',
        hold_action: { action: 'none' },
      }),
    ).toMatchObject({
      showNames: false,
      showStatus: false,
      size: 'large',
      columns: 3,
      tapAction: 'more-info',
      holdAction: 'none',
    });
  });

  it('rejects what it cannot use', () => {
    expect(() => config({ size: 'huge' })).toThrow(/size/);
    expect(() => config({ columns: 2.5 })).toThrow(/columns/);
    expect(() => config({ columns: 0 })).toThrow(/columns/);
    expect(() => config({ tap_action: 'explode' })).toThrow(/tap_action/);
    expect(() => config({ show_names: 'no' })).toThrow(/show_names/);
  });
});

describe('LED card saturation bar', () => {
  it('is off on the card and on in the details by default', async () => {
    const { resolveConfig } = await import('../src/cards/led-group/config');
    const { GROUP_ID } = await import('../dev/mock-hass');
    const base = { type: 'custom:vivid-led-group', entity: GROUP_ID };
    const defaults = resolveConfig(base);
    expect([defaults.tile.saturationBar, defaults.details.saturationBar]).toEqual([false, true]);
    const set = resolveConfig({
      ...base,
      tile: { saturation_bar: true },
      details: { saturation_bar: false },
    });
    expect([set.tile.saturationBar, set.details.saturationBar]).toEqual([true, false]);
    expect(() => resolveConfig({ ...base, tile: { saturation_bar: 'yes' } })).toThrow(
      /saturation_bar/,
    );
  });
});
