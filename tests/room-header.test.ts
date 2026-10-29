import { describe, expect, it } from 'vitest';
import { createRoomMock } from '../dev/room-header-mock';
import { resolveRoomHeaderConfig } from '../src/cards/room-header/config';
import { applyRoomHeaderForm, roomHeaderFormData } from '../src/cards/room-header/editor-model';
import {
  AMBER,
  autoBadges,
  buildRoomHeaderModel,
  discoverRoom,
  haloSources,
  lightBadgeType,
  powerAction,
  powerWatts,
  roomTitle,
} from '../src/cards/room-header/model';

const config = (extra: Record<string, unknown> = {}) =>
  resolveRoomHeaderConfig({ type: 'custom:vivid-room-header', room: 'salon', ...extra });

describe('room header config', () => {
  it('fills the defaults', () => {
    expect(config()).toMatchObject({
      room: 'salon',
      showSubtitle: true,
      showBadges: true,
      glow: 100,
    });
  });

  it('accepts lights without a room', () => {
    expect(
      resolveRoomHeaderConfig({ type: 'x', name: 'Garage', lights: ['light.garage'] }).lights,
    ).toEqual(['light.garage']);
  });

  it('rejects what it cannot use', () => {
    expect(() => resolveRoomHeaderConfig({ type: 'x' })).toThrow(/room/);
    expect(() => config({ room: 'Salle de bain' })).toThrow(/room id/);
    expect(() => config({ lights: ['sensor.x'] })).toThrow(/light/);
    expect(() => config({ power: 'switch.x' })).toThrow(/sensor/);
    expect(() => config({ badges: [{ entity: 'light.x' }] })).toThrow(/type/);
    expect(() => config({ badges: [{ type: 'custom:mushroom-badge' }] })).toThrow(/type/);
    expect(() => config({ glow: 500 })).toThrow(/glow/);
  });
});

describe('room discovery', () => {
  it('follows the naming convention', () => {
    const found = discoverRoom(createRoomMock('all', { climate: true }), 'salon');
    expect(found.lights).toEqual(['switch.salon_lampes', 'light.salon_leds']);
    expect(found).toMatchObject({
      power: 'sensor.salon_puissance',
      illuminance: 'sensor.salon_eclairement',
      presence: 'binary_sensor.salon_presence',
      windows: 'binary_sensor.salon_fenetres',
      doors: 'binary_sensor.salon_portes',
    });
    expect(found.climate).toEqual({
      temperature: 'sensor.salon_temperature',
      humidity: 'sensor.salon_humidite',
      pressure: 'sensor.salon_pression',
      co2: 'sensor.salon_co2',
    });
  });

  it('finds nothing in an unknown room', () => {
    const found = discoverRoom(createRoomMock(), 'grenier');
    expect(found.lights).toEqual([]);
    expect(found.power).toBeUndefined();
    expect(found.climate).toEqual({});
  });

  it('titles a room id', () => {
    expect(roomTitle('salon')).toBe('Salon');
    expect(roomTitle('salle_de_bain')).toBe('Salle de bain');
  });
});

describe('room badges', () => {
  it('picks the badge of each light group', () => {
    expect(lightBadgeType('switch.salon_lampes')).toBe('custom:vivid-lamp-badge');
    expect(lightBadgeType('switch.salon_interrupteurs')).toBe('custom:vivid-light-badge');
    expect(lightBadgeType('light.salon_leds')).toBe('custom:vivid-led-badge');
    expect(lightBadgeType('light.plafonnier')).toBe('custom:vivid-light-badge');
  });

  it('builds the badges of what was found', () => {
    const found = discoverRoom(createRoomMock('all', { climate: true }), 'salon');
    expect(autoBadges(found).map((badge) => badge.type)).toEqual([
      'custom:vivid-lamp-badge',
      'custom:vivid-led-badge',
      'custom:vivid-illuminance-badge',
      'custom:vivid-presence-badge',
      'custom:vivid-window-badge',
      'custom:vivid-door-badge',
    ]);
  });

  it('adds the climate badges only when they are defined', () => {
    const found = discoverRoom(createRoomMock('all', { climate: true }), 'salon');
    const badges = autoBadges(found, (tag) => tag !== 'vivid-humidity-badge');
    expect(badges.slice(-2)).toEqual([
      { type: 'custom:vivid-temperature-badge', entity: 'sensor.salon_temperature' },
      { type: 'custom:vivid-air-quality-badge', entity: 'sensor.salon_co2' },
    ]);
  });

  it('keeps the listed badges', () => {
    const badges = [{ type: 'custom:vivid-door-badge', entity: 'binary_sensor.salon_portes' }];
    const model = buildRoomHeaderModel(createRoomMock(), config({ badges }));
    expect(model.badges).toEqual(badges);
  });
});

describe('room header model', () => {
  it('counts every lamp and strip on, with the room power', () => {
    const model = buildRoomHeaderModel(createRoomMock('all'), config());
    expect(model).toMatchObject({ name: 'Salon', on: 4, total: 7, power: 138 });
    expect(model.mainEntity).toBe('switch.salon_lampes');
    expect(model.watched).toEqual(
      expect.arrayContaining(['sensor.salon_puissance', 'light.salon_leds_tv']),
    );
  });

  it('counts lamps alone, and nothing when off', () => {
    expect(buildRoomHeaderModel(createRoomMock('lamps'), config())).toMatchObject({
      on: 2,
      power: 94,
    });
    expect(buildRoomHeaderModel(createRoomMock('off'), config()).on).toBe(0);
  });

  it('counts a member of two groups once', () => {
    const model = buildRoomHeaderModel(
      createRoomMock('all'),
      config({ lights: ['switch.salon_lampes', 'switch.salon_lampadaire'] }),
    );
    expect(model.total).toBe(4);
    expect(model.on).toBe(2);
  });

  it('takes the overrides', () => {
    const model = buildRoomHeaderModel(
      createRoomMock('all'),
      config({ name: 'Living', lights: ['light.salon_leds'], power: 'sensor.salon_eclairement' }),
    );
    expect(model).toMatchObject({ name: 'Living', on: 2, total: 3, power: 49 });
  });

  it('shows a room with nothing found', () => {
    const model = buildRoomHeaderModel(createRoomMock(), config({ room: 'grenier' }));
    expect(model).toMatchObject({ name: 'Grenier', on: 0, total: 0, unavailable: false });
    expect(model.power).toBeUndefined();
    expect(model.badges).toEqual([]);
    expect(model.sources).toEqual([]);
  });

  it('turns everything off, or the lights on', () => {
    const on = buildRoomHeaderModel(createRoomMock('all'), config());
    expect(powerAction(on)).toEqual({
      service: 'turn_off',
      entities: ['switch.salon_lampes', 'light.salon_leds'],
    });
    expect(powerAction(buildRoomHeaderModel(createRoomMock('off'), config())).service).toBe(
      'turn_on',
    );
  });

  it('reads kW as watts', () => {
    const hass = createRoomMock();
    hass.states['sensor.salon_puissance']!.attributes.unit_of_measurement = 'kW';
    hass.states['sensor.salon_puissance']!.state = '1.2';
    expect(powerWatts(hass, 'sensor.salon_puissance')).toBe(1200);
    expect(powerWatts(hass, 'sensor.nothing')).toBeUndefined();
  });
});

describe('room halo', () => {
  const lights = ['switch.salon_lampes', 'light.salon_leds'];

  it('glows amber for the lamps and in the color of each strip on', () => {
    const sources = haloSources(createRoomMock('all'), lights);
    const lit = sources.filter((source) => source.on);
    expect(lit.map((source) => source.id)).toEqual([
      'switch.salon_lampes',
      'light.salon_leds_tv',
      'light.salon_leds_bibliotheque',
    ]);
    expect(lit.map((source) => source.rgb)).toEqual([AMBER, [195, 60, 255], [0, 180, 216]]);
    // Lamps on the left, strips on the right.
    expect(lit.map((source) => source.x)).toEqual([26, 50, 74]);
    expect(lit[1]!.strength).toBe(0.9);
    // The strip off stays, invisible, so it can fade in later.
    expect(sources.find((source) => source.id === 'light.salon_leds_plafond')).toMatchObject({
      on: false,
      strength: 0,
    });
  });

  it('centers a single source', () => {
    const lit = haloSources(createRoomMock('lamps'), lights).filter((source) => source.on);
    expect(lit).toHaveLength(1);
    expect(lit[0]).toMatchObject({ x: 50, y: 25, rx: 45, ry: 70, strength: 1 });
  });

  it('has no glow when everything is off', () => {
    expect(haloSources(createRoomMock('off'), lights).some((source) => source.on)).toBe(false);
  });

  it('follows the brightness', () => {
    const hass = createRoomMock('all');
    hass.states['light.salon_leds_tv']!.attributes.brightness = 64;
    const tv = haloSources(hass, lights).find((source) => source.id === 'light.salon_leds_tv');
    expect(tv?.strength).toBe(0.25);
  });
});

describe('room header editor', () => {
  it('fills the defaults and writes only what changed', () => {
    const base = { type: 'custom:vivid-room-header', room: 'salon' };
    const data = roomHeaderFormData(base);
    expect(data).toMatchObject({ room: 'salon', show_badges: true, glow: 100, lights: [] });
    expect(applyRoomHeaderForm(base, data)).toEqual(base);
    expect(
      applyRoomHeaderForm(
        { ...base, badges: [{ type: 'custom:vivid-door-badge' }] },
        { ...data, room: ' Bureau ', show_badges: false, glow: 150, power: 'sensor.p' },
      ),
    ).toEqual({
      type: 'custom:vivid-room-header',
      room: 'bureau',
      show_badges: false,
      glow: 150,
      power: 'sensor.p',
      badges: [{ type: 'custom:vivid-door-badge' }],
    });
  });
});
