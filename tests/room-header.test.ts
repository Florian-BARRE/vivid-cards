import { describe, expect, it } from 'vitest';
import { createRoomMock } from '../dev/room-header-mock';
import { runAction } from '../src/core/action-handler';
import { BADGE_KINDS, badgeKindOf } from '../src/cards/room-header/badge-kinds';
import { isVisible } from '../src/cards/room-header/badges';
import {
  resolveRoomHeaderConfig,
  type RoomHeaderCardConfig,
} from '../src/cards/room-header/config';
import {
  addBadgeItem,
  badgeItems,
  migrateRoomHeaderConfig,
  moveBadgeItem,
  removeBadgeItem,
  setBadgeOptions,
  setPattern,
  setPowerButton,
  setSlot,
} from '../src/cards/room-header/editor-model';
import { lightRoleOf } from '../src/cards/room-header/light-roles';
import {
  AMBER,
  buildRoomHeaderModel,
  haloSources,
  powerTap,
  powerWatts,
  roomTitle,
} from '../src/cards/room-header/model';
import { powerPlan, runEntityAction } from '../src/cards/room-header/power-action';
import { roomSlots } from '../src/cards/room-header/room-slots';
import { nameKey, roleOf } from '../src/cards/room-header/roles';
import type { HomeAssistant } from '../src/core/hass-types';

const raw = (extra: Record<string, unknown> = {}): RoomHeaderCardConfig => ({
  type: 'custom:vivid-room-header',
  room: 'salon',
  ...extra,
});
const config = (extra: Record<string, unknown> = {}) => resolveRoomHeaderConfig(raw(extra));
const model = (hass: HomeAssistant, extra: Record<string, unknown> = {}) =>
  buildRoomHeaderModel(hass, config(extra));
const badgeTypes = (hass: HomeAssistant, extra: Record<string, unknown> = {}) =>
  model(hass, extra).badges.map((badge) => badge.config.type.replace('custom:vivid-', ''));
const node = {} as HTMLElement;

describe('room header config', () => {
  it('fills the defaults', () => {
    expect(config()).toMatchObject({
      room: 'salon',
      roomLabel: 'salon',
      discover: true,
      pattern: '{room}-{role}',
      discoverBy: 'naming_area',
      powerShow: 'auto',
      badges: [{ slot: '*' }],
      showSubtitle: true,
      showBadges: true,
      glow: 100,
    });
    expect(config().slots.presence.mode).toBe('auto');
  });

  it('accepts a room written with accents and spaces', () => {
    expect(config({ room: 'Salle de bain' })).toMatchObject({
      room: 'salle_de_bain',
      roomLabel: 'Salle de bain',
    });
  });

  it('reads the slots, the power button and the badges', () => {
    const resolved = config({
      entities: { presence: false, leds: { exclude: ['light.x'] }, puissance: 'sensor.p' },
      power_button: { on_action: { action: 'navigate', navigation_path: '/x' }, show: 'always' },
      badges: [
        { slot: 'présence', icon: 'mdi:eye' },
        { type: 'custom:vivid-door-badge', entity: 'binary_sensor.d' },
      ],
    });
    expect(resolved.slots.presence.mode).toBe('off');
    expect(resolved.slots.leds.exclude).toEqual(['light.x']);
    expect(resolved.slots.puissance.manual).toEqual(['sensor.p']);
    expect(resolved.onAction).toEqual({ action: 'navigate', navigation_path: '/x' });
    expect(resolved.powerShow).toBe('always');
    expect(resolved.badges[0]).toEqual({ slot: 'presence', icon: 'mdi:eye' });
  });

  it('reads the 0.14–0.17 options', () => {
    const resolved = config({
      exclude: ['présence', 'windows', 'sensor.salon_co2'],
      lights: ['switch.salon_lampes', 'light.salon_leds'],
      power: 'sensor.p',
      badges: [{ type: 'custom:vivid-power-badge', entity: 'sensor.p' }],
    });
    expect(resolved.slots.presence.mode).toBe('off');
    expect(resolved.slots.fenetres.mode).toBe('off');
    expect(resolved.excludeEntities).toEqual(['sensor.salon_co2']);
    expect(resolved.slots.lampes.manual).toEqual(['switch.salon_lampes']);
    expect(resolved.slots.leds.manual).toEqual(['light.salon_leds']);
    expect(resolved.slots.interrupteurs.mode).toBe('off');
    expect(resolved.slots.puissance.manual).toEqual(['sensor.p']);
    expect(resolved.badges).toEqual([
      { slot: '*' },
      { type: 'custom:vivid-power-badge', entity: 'sensor.p' },
    ]);
  });

  it('rejects what it cannot use, naming the field', () => {
    expect(() => resolveRoomHeaderConfig({ type: 'x' })).toThrow(/room/);
    expect(() => config({ room: '---' })).toThrow(/room/);
    expect(() => config({ entities: { garage: false } })).toThrow(/unknown role "garage"/);
    expect(() => config({ entities: { presence: 3 } })).toThrow(/entities\.presence/);
    expect(() => config({ naming: { pattern: '{room}' } })).toThrow(/pattern/);
    expect(() => config({ discover_by: 'magic' })).toThrow(/discover_by/);
    expect(() => config({ power_button: { on_action: { action: 'fly' } } })).toThrow(/on_action/);
    expect(() => config({ badges: [{ slot: 'garage' }] })).toThrow(/slot/);
    expect(() => config({ badges: [{ entity: 'light.x' }] })).toThrow(/slot/);
    expect(() => config({ exclude: ['garage'] })).toThrow(/unknown role "garage"/);
    expect(() => config({ glow: 500 })).toThrow(/glow/);
  });
});

describe('room roles', () => {
  it('normalizes names and knows French and English aliases', () => {
    expect(nameKey('Salon-Présence')).toBe('salon_presence');
    expect(roleOf('présence')).toBe('presence');
    expect(roleOf('Windows')).toBe('fenetres');
    expect(roleOf('scripts_on')).toBe('scripts_on');
    expect(roleOf('garage')).toBeUndefined();
  });

  it('puts a light in its slot', () => {
    expect(lightRoleOf('switch.salon_lampes')).toBe('lampes');
    expect(lightRoleOf('light.salon_leds')).toBe('leds');
    expect(lightRoleOf('switch.prise_lampadaire')).toBe('lampes');
    expect(lightRoleOf('light.plafonnier')).toBe('interrupteurs');
  });

  it('titles a room', () => {
    expect(roomTitle('salle_de_bain')).toBe('Salle de bain');
  });
});

describe('room discovery', () => {
  it('finds every role by its name, in the order of the table', () => {
    const slots = roomSlots(createRoomMock('all', { climate: true, scripts: true }), config());
    expect(slots.lampes.entities).toEqual(['switch.salon_lampes']);
    expect(slots.leds.entities).toEqual(['light.salon_leds']);
    expect(slots.puissance.entities).toEqual(['sensor.salon_puissance']);
    expect(slots.co2.entities).toEqual(['sensor.salon_co2']);
    expect(slots.scripts_on.entities).toEqual(['script.salon_scripts_on']);
    expect(slots.presence.entries[0]?.found).toEqual({
      entity: 'binary_sensor.salon_presence',
      source: 'naming',
      via: 'salon-presence',
    });
  });

  it('finds a helper by its friendly or registry name, accents and case ignored', () => {
    const hass = createRoomMock('all', { presenceId: 'binary_sensor.capteur_mouvement_1' });
    hass.states['binary_sensor.capteur_mouvement_1']!.attributes.friendly_name = 'Salon-PRÉSENCE';
    expect(roomSlots(hass, config()).presence.entities).toEqual([
      'binary_sensor.capteur_mouvement_1',
    ]);
  });

  it('follows another name pattern', () => {
    const hass = createRoomMock('all');
    hass.states['binary_sensor.pir'] = {
      ...hass.states['binary_sensor.salon_presence']!,
      entity_id: 'binary_sensor.pir',
      attributes: { friendly_name: 'Presence du Salon' },
    };
    delete hass.states['binary_sensor.salon_presence'];
    expect(
      roomSlots(hass, config({ naming: { pattern: '{role} du {room}' } })).presence.entities,
    ).toEqual(['binary_sensor.pir']);
  });

  it('looks in the area when the name finds nothing', () => {
    const hass = createRoomMock('all');
    hass.areas = { sdb: { area_id: 'sdb', name: 'Salle de bain' } };
    hass.states['sensor.th_humidity'] = {
      entity_id: 'sensor.th_humidity',
      state: '55',
      attributes: { device_class: 'humidity' },
      last_changed: '',
      last_updated: '',
    };
    hass.entities['sensor.th_humidity'] = {
      entity_id: 'sensor.th_humidity',
      labels: [],
      area_id: 'sdb',
    };
    const slots = roomSlots(hass, config({ room: 'Salle de bain' }));
    expect(slots.humidite.entities).toEqual(['sensor.th_humidity']);
    expect(slots.humidite.entries[0]?.found?.source).toBe('area');
    expect(
      roomSlots(hass, config({ room: 'Salle de bain', discover_by: 'naming' })).humidite.entities,
    ).toEqual([]);
  });

  it('leaves out, adds, chooses and turns off', () => {
    const hass = createRoomMock('all');
    const slots = roomSlots(
      hass,
      config({
        entities: {
          leds: { exclude: ['light.salon_leds'], add: ['light.salon_leds_tv'] },
          presence: false,
          puissance: 'sensor.salon_eclairement',
        },
      }),
    );
    expect(slots.leds.entities).toEqual(['light.salon_leds_tv']);
    expect(slots.leds.tweaked).toBe(true);
    expect(slots.presence.entities).toEqual([]);
    expect(slots.puissance.entities).toEqual(['sensor.salon_eclairement']);
  });

  it('is fully manual with discover: false', () => {
    const slots = roomSlots(
      createRoomMock('all'),
      config({ discover: false, entities: { leds: ['light.salon_leds'] } }),
    );
    expect(slots.leds.entities).toEqual(['light.salon_leds']);
    expect(slots.lampes.entities).toEqual([]);
    expect(slots.presence.entities).toEqual([]);
  });
});

describe('room badges', () => {
  const climate = () => createRoomMock('all', { climate: true });

  it('shows the badge of every role found, in the order of the roles', () => {
    expect(badgeTypes(climate())).toEqual([
      'lamp-badge',
      'led-badge',
      'illuminance-badge',
      'presence-badge',
      'window-badge',
      'door-badge',
      'temperature-badge',
      'humidity-badge',
      'pressure-badge',
      'air-quality-badge',
    ]);
  });

  it('leaves out the badges whose element is not defined', () => {
    const shown = buildRoomHeaderModel(
      climate(),
      config(),
      (tag) => tag !== 'vivid-pressure-badge',
    );
    expect(shown.badges.some((badge) => badge.config.type.includes('pressure'))).toBe(false);
  });

  it('orders the listed badges, with their options, then the rest', () => {
    const badges = model(climate(), {
      badges: [
        { slot: 'presence', icon: 'mdi:eye', tap_action: { action: 'more-info' } },
        { slot: '*' },
        { type: 'custom:vivid-power-badge', entity: 'sensor.salon_puissance' },
      ],
    }).badges;
    expect(badges[0]?.config).toEqual({
      type: 'custom:vivid-presence-badge',
      entity: 'binary_sensor.salon_presence',
      icon: 'mdi:eye',
      tap_action: { action: 'more-info' },
    });
    expect(badges.filter((badge) => badge.role === 'presence')).toHaveLength(1);
    expect(badges.at(-1)?.config.type).toBe('custom:vivid-power-badge');
  });

  it('shows only the listed badges without the rest', () => {
    expect(badgeTypes(climate(), { badges: [{ slot: 'temperature' }] })).toEqual([
      'temperature-badge',
    ]);
  });

  it('lets a free badge take the place of the found one of its entity', () => {
    const badges = model(climate(), {
      badges: [
        { slot: '*' },
        { type: 'custom:vivid-door-badge', entity: 'binary_sensor.salon_portes', warn_after: 5 },
      ],
    }).badges;
    const doors = badges.filter((badge) => badge.config.entity === 'binary_sensor.salon_portes');
    expect(doors).toHaveLength(1);
    expect(doors[0]?.config.warn_after).toBe(5);
  });

  it('shows a badge only when its conditions hold', () => {
    const hass = climate();
    const visibility = [
      { condition: 'state', entity: 'binary_sensor.salon_presence', state: 'off' },
    ];
    expect(badgeTypes(hass, { badges: [{ slot: 'temperature', visibility }] })).toEqual([]);
    expect(
      isVisible(hass, [
        { condition: 'state', entity: 'binary_sensor.salon_presence', state_not: 'off' },
      ]),
    ).toBe(true);
    expect(model(hass, { badges: [{ slot: 'temperature', visibility }] }).watched).toContain(
      'binary_sensor.salon_presence',
    );
  });
});

describe('room header model', () => {
  it('counts every lamp and strip on, with the room power', () => {
    expect(model(createRoomMock('all'))).toMatchObject({
      name: 'Salon',
      on: 4,
      total: 7,
      power: 138,
    });
  });

  it('counts a member of two groups once', () => {
    const m = model(createRoomMock('all'), {
      entities: { lampes: ['switch.salon_lampes', 'switch.salon_lampadaire'] },
    });
    expect(m.on).toBe(4);
  });

  it('reads kW as watts', () => {
    const hass = createRoomMock();
    hass.states['sensor.salon_puissance']!.attributes.unit_of_measurement = 'kW';
    hass.states['sensor.salon_puissance']!.state = '1.2';
    expect(powerWatts(hass, 'sensor.salon_puissance')).toBe(1200);
  });
});

describe('room header power button', () => {
  it('switches the lights when the room has no script', () => {
    const plan = model(createRoomMock('all')).plan;
    expect(plan.off).toMatchObject({ source: 'lights' });
    expect(plan.off.action).toEqual({
      action: 'perform-action',
      perform_action: 'homeassistant.turn_off',
      target: { entity_id: ['switch.salon_lampes', 'light.salon_leds'] },
    });
  });

  it('runs the room scripts, and brings back the lights that were on', async () => {
    const hass = createRoomMock('lamps', { scripts: true });
    let current = model(hass);
    hass.subscribe((next) => {
      current = model(next);
    });
    expect(current.plan.on).toMatchObject({
      source: 'script',
      entities: ['script.salon_scripts_on'],
    });
    const tap = () => runAction(powerTap(current), { node, hass, entityId: '' });
    expect(current.on).toBe(2);
    tap();
    await Promise.resolve();
    expect(current.on).toBe(0);
    tap();
    await Promise.resolve();
    expect(current.on).toBe(2);
    expect(hass.calls.map((call) => `${call.domain}.${call.service}`)).toEqual([
      'script.turn_on',
      'script.turn_on',
    ]);
  });

  it('takes the action set in the editor, and a toggle script both ways', () => {
    const hass = createRoomMock('off', { scripts: true });
    const custom = model(hass, {
      power_button: { on_action: { action: 'navigate', navigation_path: '/x' } },
    });
    expect(custom.plan.on).toMatchObject({ source: 'config', action: { action: 'navigate' } });
    expect(custom.plan.off.source).toBe('script');
    const empty = { entities: [] as string[] };
    const toggle = powerPlan(
      {},
      {
        scripts_on: empty,
        scripts_off: empty,
        scripts_toggle: { entities: ['script.t'] },
      } as never,
      [],
    );
    expect(toggle.on.entities).toEqual(['script.t']);
    expect(toggle.off.entities).toEqual(['script.t']);
    expect(runEntityAction('scene.soir').perform_action).toBe('scene.turn_on');
  });

  it('shows the button as set', () => {
    const noLights = { entities: { lampes: false, leds: false } };
    expect(model(createRoomMock('off'), noLights).hasPower).toBe(false);
    expect(model(createRoomMock('off', { scripts: true }), noLights).hasPower).toBe(true);
    expect(
      model(createRoomMock('off'), { ...noLights, power_button: { show: 'always' } }).hasPower,
    ).toBe(true);
    expect(model(createRoomMock('all'), { power_button: { show: 'never' } }).hasPower).toBe(false);
  });
});

describe('room halo', () => {
  const lights = ['switch.salon_lampes', 'light.salon_leds'];

  it('glows amber for the lamps and in the color of each strip on', () => {
    const lit = haloSources(createRoomMock('all'), lights).filter((source) => source.on);
    expect(lit.map((source) => source.rgb)).toEqual([AMBER, [195, 60, 255], [0, 180, 216]]);
    expect(lit.map((source) => source.x)).toEqual([26, 50, 74]);
  });

  it('follows the brightness, and has no glow when off', () => {
    const hass = createRoomMock('all');
    hass.states['light.salon_leds_tv']!.attributes.brightness = 64;
    expect(
      haloSources(hass, lights).find((source) => source.id === 'light.salon_leds_tv')?.strength,
    ).toBe(0.25);
    expect(haloSources(createRoomMock('off'), lights).some((source) => source.on)).toBe(false);
  });
});

describe('room header editor model', () => {
  it('moves the 0.14–0.17 options to the slots', () => {
    const hass = createRoomMock('all', { climate: true });
    const next = migrateRoomHeaderConfig(
      raw({
        exclude: ['presence', 'sensor.salon_co2'],
        lights: ['switch.salon_lampes'],
        power: 'sensor.salon_puissance',
        badges: [
          {
            type: 'custom:vivid-illuminance-badge',
            entity: 'sensor.0x403802fffe69d11e_illumination',
          },
        ],
      }),
      hass,
    );
    expect(next).toEqual({
      type: 'custom:vivid-room-header',
      room: 'salon',
      entities: {
        presence: false,
        co2: { exclude: ['sensor.salon_co2'] },
        lampes: ['switch.salon_lampes'],
        leds: false,
        interrupteurs: false,
        puissance: 'sensor.salon_puissance',
      },
      badges: [
        { slot: '*' },
        {
          type: 'custom:vivid-illuminance-badge',
          entity: 'sensor.0x403802fffe69d11e_illumination',
        },
      ],
    });
    // Same entities shown before and after.
    const before = model(hass, { exclude: ['presence', 'sensor.salon_co2'] }).badges.map(
      (badge) => badge.config.entity,
    );
    const after = buildRoomHeaderModel(
      hass,
      resolveRoomHeaderConfig(
        migrateRoomHeaderConfig(raw({ exclude: ['presence', 'sensor.salon_co2'] }), hass),
      ),
    ).badges.map((badge) => badge.config.entity);
    expect(after).toEqual(before);
  });

  it('writes only what changed', () => {
    let next = setSlot(raw(), 'presence', false);
    expect(next.entities).toEqual({ presence: false });
    next = setSlot(next, 'presence', undefined);
    expect(next.entities).toBeUndefined();
    expect(setPattern(raw(), '{room}-{role}').naming).toBeUndefined();
    expect(setPattern(raw(), '{role} {room}').naming).toEqual({ pattern: '{role} {room}' });
    const button = setPowerButton(raw(), 'on_action', { action: 'toggle' });
    expect(button.power_button).toEqual({ on_action: { action: 'toggle' } });
    expect(setPowerButton(button, 'on_action', undefined).power_button).toBeUndefined();
    expect(setPowerButton(raw(), 'show', 'auto').power_button).toBeUndefined();
  });

  it('adds, moves, sets and removes badges', () => {
    let next = addBadgeItem(raw(), { slot: 'presence' });
    expect(badgeItems(next)).toEqual([{ slot: '*' }, { slot: 'presence' }]);
    next = moveBadgeItem(next, 1, -1);
    expect(badgeItems(next)[0]).toEqual({ slot: 'presence' });
    next = setBadgeOptions(next, 0, { icon: 'mdi:eye', name: '' });
    expect(badgeItems(next)[0]).toEqual({ slot: 'presence', icon: 'mdi:eye' });
    next = removeBadgeItem(next, 0);
    expect(next.badges).toBeUndefined();
  });

  it('knows the badge kinds it can add', () => {
    expect(badgeKindOf('custom:vivid-illuminance-badge')?.key).toBe('illuminance');
    expect(badgeKindOf('custom:vivid-bill-badge')).toBeUndefined();
    expect(new Set(BADGE_KINDS.map((kind) => kind.tag)).size).toBe(BADGE_KINDS.length);
  });
});
