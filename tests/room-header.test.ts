import { describe, expect, it } from 'vitest';
import { createRoomMock } from '../dev/room-header-mock';
import { resolveRoomHeaderConfig } from '../src/cards/room-header/config';
import {
  applyRoomHeaderForm,
  isRoleExcluded,
  roomHeaderFormData,
  setRoleIncluded,
} from '../src/cards/room-header/editor-model';
import {
  AMBER,
  buildRoomHeaderModel,
  discoverRoom,
  haloSources,
  lightBadgeType,
  mergeBadges,
  powerAction,
  powerWatts,
  roomEntities,
  roomTitle,
} from '../src/cards/room-header/model';
import { nameKey, roleOf } from '../src/cards/room-header/roles';

const config = (extra: Record<string, unknown> = {}) =>
  resolveRoomHeaderConfig({ type: 'custom:vivid-room-header', room: 'salon', ...extra });

const types = (badges: { type: string }[]) => badges.map((badge) => badge.type);

describe('room header config', () => {
  it('fills the defaults', () => {
    expect(config()).toMatchObject({
      room: 'salon',
      roomLabel: 'salon',
      discover: true,
      excludeRoles: [],
      excludeEntities: [],
      showSubtitle: true,
      showBadges: true,
      glow: 100,
    });
  });

  it('accepts a room written with accents and spaces', () => {
    expect(config({ room: 'Salle de bain' })).toMatchObject({
      room: 'salle_de_bain',
      roomLabel: 'Salle de bain',
    });
    expect(config({ room: 'Séjour' }).room).toBe('sejour');
  });

  it('is manual without a room', () => {
    expect(
      resolveRoomHeaderConfig({ type: 'x', name: 'Garage', lights: ['light.garage'] }),
    ).toMatchObject({ discover: false, lights: ['light.garage'] });
  });

  it('reads exclusions by role (French or English) and by entity', () => {
    expect(
      config({ exclude: ['présence', 'windows', 'Portes', 'sensor.salon_co2'] }),
    ).toMatchObject({
      excludeRoles: ['presence', 'fenetres', 'portes'],
      excludeEntities: ['sensor.salon_co2'],
    });
  });

  it('rejects what it cannot use', () => {
    expect(() => resolveRoomHeaderConfig({ type: 'x' })).toThrow(/room/);
    expect(() => config({ room: '---' })).toThrow(/room/);
    expect(() => resolveRoomHeaderConfig({ type: 'x', name: 'A', discover: true })).toThrow(
      /discover/,
    );
    expect(() => config({ exclude: ['garage'] })).toThrow(/unknown role "garage"/);
    expect(() => config({ exclude: 'presence' })).toThrow(/exclude/);
    expect(() => config({ lights: ['sensor.x'] })).toThrow(/light/);
    expect(() => config({ power: 'switch.x' })).toThrow(/sensor/);
    expect(() => config({ badges: [{ entity: 'light.x' }] })).toThrow(/type/);
    expect(() => config({ badges: [{ type: 'custom:mushroom-badge' }] })).toThrow(/type/);
    expect(() => config({ glow: 500 })).toThrow(/glow/);
  });
});

describe('room roles', () => {
  it('normalizes names', () => {
    expect(nameKey('Salon-Présence')).toBe('salon_presence');
    expect(nameKey('  Salle de bain - Humidité ')).toBe('salle_de_bain_humidite');
  });

  it('knows French and English aliases', () => {
    expect(roleOf('lamps')).toBe('lampes');
    expect(roleOf('Éclairement')).toBe('eclairement');
    expect(roleOf('occupancy')).toBe('presence');
    expect(roleOf('air')).toBe('co2');
    expect(roleOf('batterie')).toBeUndefined();
  });
});

describe('room discovery', () => {
  it('finds every role by entity id, in the order of the table', () => {
    const found = discoverRoom(createRoomMock('all', { climate: true }), 'salon');
    expect(found.map((item) => [item.role, item.entity])).toEqual([
      ['lampes', 'switch.salon_lampes'],
      ['leds', 'light.salon_leds'],
      ['puissance', 'sensor.salon_puissance'],
      ['eclairement', 'sensor.salon_eclairement'],
      ['presence', 'binary_sensor.salon_presence'],
      ['fenetres', 'binary_sensor.salon_fenetres'],
      ['portes', 'binary_sensor.salon_portes'],
      ['temperature', 'sensor.salon_temperature'],
      ['humidite', 'sensor.salon_humidite'],
      ['pression', 'sensor.salon_pression'],
      ['co2', 'sensor.salon_co2'],
    ]);
    expect(found.every((item) => item.via === 'id')).toBe(true);
  });

  it('finds a helper by its name, accents and case ignored', () => {
    const hass = createRoomMock('all', { presenceId: 'binary_sensor.capteur_mouvement_1' });
    hass.states['binary_sensor.capteur_mouvement_1']!.attributes.friendly_name = 'Salon-PRÉSENCE';
    const presence = discoverRoom(hass, 'salon').find((item) => item.role === 'presence');
    expect(presence).toEqual({
      role: 'presence',
      entity: 'binary_sensor.capteur_mouvement_1',
      via: 'name',
    });
  });

  it('finds a helper by its registry name', () => {
    const hass = createRoomMock('all', { presenceId: 'binary_sensor.capteur_mouvement_1' });
    delete hass.states['binary_sensor.capteur_mouvement_1']!.attributes.friendly_name;
    hass.entities['binary_sensor.capteur_mouvement_1'] = {
      entity_id: 'binary_sensor.capteur_mouvement_1',
      name: 'salon-présence',
      labels: [],
    };
    expect(discoverRoom(hass, 'salon').some((item) => item.role === 'presence')).toBe(true);
  });

  it('prefers a match by id, and only takes the domains of the role', () => {
    const hass = createRoomMock('all');
    hass.states['sensor.autre'] = {
      ...hass.states['sensor.salon_eclairement']!,
      entity_id: 'sensor.autre',
    };
    hass.states['sensor.salon_presence'] = {
      ...hass.states['sensor.salon_eclairement']!,
      entity_id: 'sensor.salon_presence',
    };
    const found = discoverRoom(hass, 'salon');
    expect(found.find((item) => item.role === 'eclairement')?.entity).toBe(
      'sensor.salon_eclairement',
    );
    expect(found.find((item) => item.role === 'presence')?.entity).toBe(
      'binary_sensor.salon_presence',
    );
  });

  it('finds a room written with accents', () => {
    const hass = createRoomMock('all');
    hass.states['sensor.sejour_puissance'] = {
      ...hass.states['sensor.salon_puissance']!,
      entity_id: 'sensor.sejour_puissance',
      attributes: { friendly_name: 'séjour-puissance' },
    };
    expect(discoverRoom(hass, 'Séjour')).toEqual([
      { role: 'puissance', entity: 'sensor.sejour_puissance', via: 'id' },
    ]);
  });

  it('finds nothing in an unknown room', () => {
    expect(discoverRoom(createRoomMock(), 'grenier')).toEqual([]);
  });

  it('titles a room', () => {
    expect(roomTitle('salon')).toBe('Salon');
    expect(roomTitle('salle_de_bain')).toBe('Salle de bain');
    expect(roomTitle('séjour')).toBe('Séjour');
  });
});

describe('room badges', () => {
  const climate = () => createRoomMock('all', { climate: true });

  it('picks the badge of a light no role names', () => {
    expect(lightBadgeType('switch.salon_lampes')).toBe('custom:vivid-lamp-badge');
    expect(lightBadgeType('switch.salon_interrupteurs')).toBe('custom:vivid-light-badge');
    expect(lightBadgeType('light.salon_leds')).toBe('custom:vivid-led-badge');
    expect(lightBadgeType('switch.prise_lampadaire')).toBe('custom:vivid-lamp-badge');
    expect(lightBadgeType('light.plafonnier')).toBe('custom:vivid-light-badge');
  });

  it('builds the badges of every role found, pressure included', () => {
    expect(types(buildRoomHeaderModel(climate(), config()).badges)).toEqual([
      'custom:vivid-lamp-badge',
      'custom:vivid-led-badge',
      'custom:vivid-illuminance-badge',
      'custom:vivid-presence-badge',
      'custom:vivid-window-badge',
      'custom:vivid-door-badge',
      'custom:vivid-temperature-badge',
      'custom:vivid-humidity-badge',
      'custom:vivid-pressure-badge',
      'custom:vivid-air-quality-badge',
    ]);
  });

  it('leaves out the badges whose element is not defined', () => {
    const model = buildRoomHeaderModel(climate(), config(), (tag) => !tag.includes('humidity'));
    expect(types(model.badges)).not.toContain('custom:vivid-humidity-badge');
  });

  it('excludes by role and by entity', () => {
    const entities = roomEntities(
      climate(),
      config({ exclude: ['windows', 'présence', 'leds', 'sensor.salon_co2', 'puissance'] }),
    );
    expect(types(entities.roleBadges)).toEqual([
      'custom:vivid-lamp-badge',
      'custom:vivid-illuminance-badge',
      'custom:vivid-door-badge',
      'custom:vivid-temperature-badge',
      'custom:vivid-humidity-badge',
      'custom:vivid-pressure-badge',
    ]);
    expect(entities.lights).toEqual(['switch.salon_lampes']);
    expect(entities.power).toBeUndefined();
    expect(entities.found.filter((item) => item.excluded).map((item) => item.role)).toEqual([
      'leds',
      'puissance',
      'presence',
      'fenetres',
      'co2',
    ]);
  });

  it('adds manual badges after the discovered ones', () => {
    const extra = { type: 'custom:vivid-battery-badge', entity: 'sensor.salon_batterie' };
    const model = buildRoomHeaderModel(createRoomMock(), config({ badges: [extra] }));
    expect(model.badges).toHaveLength(7);
    expect(model.badges[6]).toEqual(extra);
  });

  it('lets a manual badge replace the discovered one of its entity, in place', () => {
    const door = {
      type: 'custom:vivid-door-badge',
      entity: 'binary_sensor.salon_portes',
      warn_after: 5,
    };
    const model = buildRoomHeaderModel(createRoomMock(), config({ badges: [door] }));
    expect(model.badges).toHaveLength(6);
    expect(model.badges[5]).toEqual(door);
    expect(mergeBadges([{ type: 'a', entity: 'x' }], [{ type: 'b' }])).toEqual([
      { type: 'a', entity: 'x' },
      { type: 'b' },
    ]);
  });

  it('gives the badges of the lights set instead of the light roles', () => {
    const model = buildRoomHeaderModel(
      createRoomMock(),
      config({ lights: ['light.salon_leds', 'switch.salon_lampadaire'] }),
    );
    expect(types(model.badges).slice(0, 3)).toEqual([
      'custom:vivid-led-badge',
      'custom:vivid-lamp-badge',
      'custom:vivid-illuminance-badge',
    ]);
  });

  it('is fully manual with discover: false', () => {
    const badges = [{ type: 'custom:vivid-door-badge', entity: 'binary_sensor.salon_portes' }];
    const model = buildRoomHeaderModel(
      createRoomMock('all'),
      config({ discover: false, lights: ['light.salon_leds'], badges }),
    );
    expect(model).toMatchObject({ lights: ['light.salon_leds'], on: 2, found: [] });
    expect(model.power).toBeUndefined();
    expect(model.badges).toEqual(badges);
    const bare = buildRoomHeaderModel(createRoomMock('all'), config({ discover: false }));
    expect(bare).toMatchObject({ lights: [], badges: [], name: 'Salon' });
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
    expect(data).toMatchObject({
      room: 'salon',
      discover: true,
      show_badges: true,
      glow: 100,
      lights: [],
    });
    expect(applyRoomHeaderForm(base, data)).toEqual(base);
    expect(
      applyRoomHeaderForm(
        { ...base, badges: [{ type: 'custom:vivid-door-badge' }], exclude: ['presence'] },
        {
          ...data,
          room: ' Salle de bain ',
          discover: false,
          show_badges: false,
          glow: 150,
          power: 'sensor.p',
        },
      ),
    ).toEqual({
      type: 'custom:vivid-room-header',
      room: 'Salle de bain',
      discover: false,
      show_badges: false,
      glow: 150,
      power: 'sensor.p',
      exclude: ['presence'],
      badges: [{ type: 'custom:vivid-door-badge' }],
    });
  });

  it('turns a found role off and on', () => {
    const base = { type: 'custom:vivid-room-header', room: 'salon' };
    const presence = {
      role: 'presence' as const,
      entity: 'binary_sensor.salon_presence',
      via: 'id' as const,
    };
    const off = setRoleIncluded(base, presence, false);
    expect(off.exclude).toEqual(['presence']);
    expect(isRoleExcluded(off, presence)).toBe(true);
    expect(setRoleIncluded(off, presence, true)).toEqual(base);
    // Excluded by an English alias or by its id: turning it on removes either.
    const byAlias = { ...base, exclude: ['occupancy', 'binary_sensor.salon_presence', 'doors'] };
    expect(isRoleExcluded(byAlias, presence)).toBe(true);
    expect(setRoleIncluded(byAlias, presence, true).exclude).toEqual(['doors']);
  });
});
