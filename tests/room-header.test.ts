import { describe, expect, it } from 'vitest';
import { PILOT, createRoomMock } from '../dev/room-header-mock';
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
  headerSource,
  listShownBadges,
  moveBadgeItem,
  moveShownBadge,
  setRoleBadge,
  setSource,
  shownBadges,
  removeBadgeItem,
  setBadgeOptions,
  setPowerButton,
  setSlot,
} from '../src/cards/room-header/editor-model';
import {
  AMBER,
  buildRoomHeaderModel,
  haloSources,
  powerTap,
  powerWatts,
} from '../src/cards/room-header/model';
import { powerPlan, runEntityAction } from '../src/cards/room-header/power-action';
import { roomSlots } from '../src/cards/room-header/room-slots';
import { roleNode, roleSpec } from '../src/cards/room-header/roles';
import type { HomeAssistant } from '../src/core/hass-types';

const raw = (extra: Record<string, unknown> = {}): RoomHeaderCardConfig => ({
  type: 'custom:vivid-room-header',
  pilot: 'salon',
  ...extra,
});
const config = (extra: Record<string, unknown> = {}) => resolveRoomHeaderConfig(raw(extra));
const model = (hass: HomeAssistant, extra: Record<string, unknown> = {}) =>
  buildRoomHeaderModel(hass, config(extra));
const badgeTypes = (hass: HomeAssistant, extra: Record<string, unknown> = {}) =>
  model(hass, extra).badges.map((badge) => badge.config.type.replace('custom:vivid-', ''));
const node = {} as HTMLElement;
const PILOT_LAMP = 'switch.0xa4c138d6cea4f686';

describe('room header config', () => {
  it('fills the defaults', () => {
    expect(config()).toMatchObject({
      pilot: 'salon',
      powerShow: 'auto',
      badges: [{ slot: '*' }],
      showSubtitle: true,
      showBadges: true,
      glow: 100,
    });
    expect(config().slots.presence.mode).toBe('auto');
  });

  it('reads the slots, the power button and the badges', () => {
    const resolved = config({
      entities: { presence: false, led: { exclude: ['light.x'] }, power: 'sensor.p' },
      power_button: { on_action: { action: 'navigate', navigation_path: '/x' }, show: 'always' },
      badges: [
        { slot: 'presence', icon: 'mdi:eye' },
        { type: 'custom:vivid-door-badge', entity: 'binary_sensor.d' },
      ],
    });
    expect(resolved.slots.presence.mode).toBe('off');
    expect(resolved.slots.led.exclude).toEqual(['light.x']);
    expect(resolved.slots.power.manual).toEqual(['sensor.p']);
    expect(resolved.onAction).toEqual({ action: 'navigate', navigation_path: '/x' });
    expect(resolved.powerShow).toBe('always');
    expect(resolved.badges[0]).toEqual({ slot: 'presence', icon: 'mdi:eye' });
  });

  it('rejects what it cannot use, naming the field', () => {
    expect(() => resolveRoomHeaderConfig({ type: 'x' })).toThrow(/pilot/);
    expect(() => config({ pilot: 'Salle de bain' })).toThrow(/pilot/);
    expect(() => config({ entities: { garage: false } })).toThrow(/unknown role "garage"/);
    expect(() => config({ entities: { presence: 3 } })).toThrow(/entities\.presence/);
    expect(() => config({ power_button: { on_action: { action: 'fly' } } })).toThrow(/on_action/);
    expect(() => config({ badges: [{ slot: 'garage' }] })).toThrow(/slot/);
    expect(() => config({ badges: [{ entity: 'light.x' }] })).toThrow(/slot/);
    expect(() => config({ glow: 500 })).toThrow(/glow/);
  });

  it('works by hand without a Vivid Pilot room', () => {
    const resolved = resolveRoomHeaderConfig({
      type: 'x',
      name: 'Coin TV',
      entities: { led: ['light.wled_tv'] },
    });
    expect(resolved.pilot).toBeUndefined();
    expect(roomSlots(createRoomMock('all'), resolved).led.entities).toEqual(['light.wled_tv']);
  });
});

describe('room roles', () => {
  it('reads the Vivid Pilot node of each role', () => {
    expect(roleNode('salon', roleSpec('light'))).toBe('salon__light');
    expect(roleNode('salon', roleSpec('power'))).toBe('salon');
    expect(roleSpec('temperature').kind).toBe('mean');
    expect(roleSpec('window').kind).toBe('any');
  });
});

describe('room slots from Vivid Pilot', () => {
  it('takes every role from what Vivid Pilot generated, never from names', () => {
    const slots = roomSlots(createRoomMock('all', { climate: true }), config());
    expect(slots.light.entities).toEqual([PILOT.lights]);
    expect(slots.led.entities).toEqual([PILOT.leds]);
    expect(slots.switch.entities).toEqual([]);
    expect(slots.power.entities).toEqual([PILOT.power]);
    expect(slots.co2.entities).toEqual(['sensor.vivid_pilot_salon_co2']);
    expect(slots.battery.entities).toEqual([PILOT.battery]);
    expect(slots.presence.entries[0]?.found).toEqual({
      entity: PILOT.presence,
      source: 'pilot',
      via: 'salon__presence',
    });
  });

  it('finds nothing for a room Vivid Pilot does not know', () => {
    const slots = roomSlots(createRoomMock('all'), config({ pilot: 'grenier' }));
    expect(slots.light.entities).toEqual([]);
    expect(slots.presence.entities).toEqual([]);
  });

  it('leaves out, adds, chooses and turns off', () => {
    const slots = roomSlots(
      createRoomMock('all'),
      config({
        entities: {
          led: { exclude: [PILOT.leds], add: ['light.wled_tv'] },
          presence: false,
          power: 'sensor.0x00158d0001a2b3c7_illuminance',
        },
      }),
    );
    expect(slots.led.entities).toEqual(['light.wled_tv']);
    expect(slots.led.tweaked).toBe(true);
    expect(slots.presence.entities).toEqual([]);
    expect(slots.power.entities).toEqual(['sensor.0x00158d0001a2b3c7_illuminance']);
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
      'battery-badge',
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
        { type: 'custom:vivid-power-badge', entity: PILOT.power },
      ],
    }).badges;
    expect(badges[0]?.config).toEqual({
      type: 'custom:vivid-presence-badge',
      pilot: 'salon__presence',
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
        { type: 'custom:vivid-door-badge', entity: PILOT.doors, warn_after: 5 },
      ],
    }).badges;
    const doors = badges.filter((badge) => badge.config.entity === PILOT.doors);
    expect(doors).toHaveLength(1);
    expect(doors[0]?.config.warn_after).toBe(5);
  });

  it('shows a badge only when its conditions hold', () => {
    const hass = climate();
    const visibility = [{ condition: 'state', entity: PILOT.presence, state: 'off' }];
    expect(badgeTypes(hass, { badges: [{ slot: 'temperature', visibility }] })).toEqual([]);
    expect(
      isVisible(hass, [{ condition: 'state', entity: PILOT.presence, state_not: 'off' }]),
    ).toBe(true);
    expect(model(hass, { badges: [{ slot: 'temperature', visibility }] }).watched).toContain(
      PILOT.presence,
    );
  });
});

describe('room header model', () => {
  it('counts every lamp and strip on, with the room power and the area name', () => {
    expect(model(createRoomMock('all'))).toMatchObject({
      name: 'Salon',
      on: 4,
      total: 7,
      power: 140,
    });
  });

  it('counts a member of two groups once', () => {
    const m = model(createRoomMock('all'), {
      entities: { light: { add: ['switch.0xa4c138d6cea4f686'] } },
    });
    expect(m.on).toBe(4);
  });

  it('reads kW as watts', () => {
    const hass = createRoomMock();
    hass.states[PILOT.power]!.attributes.unit_of_measurement = 'kW';
    hass.states[PILOT.power]!.state = '1.2';
    expect(powerWatts(hass, PILOT.power)).toBe(1200);
  });
});

describe('room header power button', () => {
  it('turns off what the memory covers, or the lamps and LEDs without a memory', () => {
    const hass = createRoomMock('all');
    const members = hass.states[PILOT.scene]!.attributes.entity_id;
    expect(model(hass).plan.off.action).toEqual({
      action: 'perform-action',
      perform_action: 'homeassistant.turn_off',
      target: { entity_id: members },
    });
    expect(model(hass, { power_button: { on: 'lights' } }).plan.off.entities).toEqual([
      PILOT.lights,
      PILOT.leds,
    ]);
  });

  it('uses a memory scene never activated yet (state unknown), and ignores switches', () => {
    const hass = createRoomMock('off', { memory: true });
    hass.states[PILOT.scene] = {
      ...hass.states[PILOT.scene]!,
      state: 'unknown',
      attributes: { ...hass.states[PILOT.scene]!.attributes, entity_id: [PILOT_LAMP] },
    };
    hass.states['switch.prise_seche_serviette'] = {
      entity_id: 'switch.prise_seche_serviette',
      state: 'on',
      attributes: {},
      last_changed: '',
      last_updated: '',
    };
    const m = model(hass, { entities: { switch: ['switch.prise_seche_serviette'] } });
    expect(m.plan.on.source).toBe('scene');
    expect(m.scope).toEqual([PILOT_LAMP]);
    // A switch on does not make the button "on": a tap restores the memory.
    expect(m.buttonOn).toBe(false);
    expect(m.on).toBe(1);
  });

  it("turns on with the room's memory scene, which brings back the last lighting", async () => {
    const hass = createRoomMock('lamps');
    let current = model(hass);
    hass.subscribe((next) => {
      current = model(next);
    });
    expect(current.plan.on).toMatchObject({ source: 'scene', entities: [PILOT.scene] });
    const tap = () => runAction(powerTap(current), { node, hass, entityId: '' });
    expect(current.on).toBe(2);
    tap();
    await Promise.resolve();
    expect(current.on).toBe(0);
    tap();
    await Promise.resolve();
    expect(current.on).toBe(2);
    expect(hass.calls.map((call) => `${call.domain}.${call.service}`)).toEqual([
      'homeassistant.turn_off',
      'scene.turn_on',
    ]);
  });

  it('turns the lights on when nothing is stored yet', () => {
    expect(model(createRoomMock('off')).plan.on.source).toBe('lights');
    expect(model(createRoomMock('off', { memory: true })).plan.on.source).toBe('scene');
  });

  it('takes the action set in the editor', () => {
    const custom = model(createRoomMock('off', { memory: true }), {
      power_button: { on_action: { action: 'navigate', navigation_path: '/x' } },
    });
    expect(custom.plan.on).toMatchObject({ source: 'config', action: { action: 'navigate' } });
    expect(custom.plan.off.source).toBe('lights');
    expect(powerPlan({}, undefined, []).on.source).toBe('none');
    expect(runEntityAction('scene.soir').perform_action).toBe('scene.turn_on');
  });

  it('shows the button as set', () => {
    const noLights = { entities: { light: false, led: false } };
    expect(model(createRoomMock('off'), noLights).hasPower).toBe(false);
    expect(
      model(createRoomMock('off'), { ...noLights, power_button: { show: 'always' } }).hasPower,
    ).toBe(true);
    expect(model(createRoomMock('all'), { power_button: { show: 'never' } }).hasPower).toBe(false);
  });
});

describe('room halo', () => {
  const lights = [PILOT.lights, PILOT.leds];

  it('glows amber for the lamps and in the color of each strip on', () => {
    const lit = haloSources(createRoomMock('all'), lights).filter((source) => source.on);
    expect(lit.map((source) => source.rgb)).toEqual([AMBER, [195, 60, 255], [0, 180, 216]]);
    expect(lit.map((source) => source.x)).toEqual([26, 50, 74]);
  });

  it('follows the brightness, and has no glow when off', () => {
    const hass = createRoomMock('all');
    hass.states['light.wled_tv']!.attributes.brightness = 64;
    expect(
      haloSources(hass, lights).find((source) => source.id === 'light.wled_tv')?.strength,
    ).toBe(0.25);
    expect(haloSources(createRoomMock('off'), lights).some((source) => source.on)).toBe(false);
  });
});

describe('room header editor model', () => {
  it('writes only what changed', () => {
    let next = setSlot(raw(), 'presence', false);
    expect(next.entities).toEqual({ presence: false });
    next = setSlot(next, 'presence', undefined);
    expect(next.entities).toBeUndefined();
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

describe('room header, whole home and power modes', () => {
  it('reads the whole home with pilot: all', () => {
    const hass = createRoomMock('all');
    hass.states['light.vivid_pilot_all_light'] = {
      ...hass.states[PILOT.lights]!,
      entity_id: 'light.vivid_pilot_all_light',
      attributes: { ...hass.states[PILOT.lights]!.attributes, vivid_pilot_node: 'all__light' },
    };
    const m = model(hass, { pilot: 'all' });
    expect(m.slots.light.entities).toEqual(['light.vivid_pilot_all_light']);
    expect(m.name).toBe('Home');
  });

  it('turns the lights on instead of restoring the memory when asked', () => {
    const hass = createRoomMock('off', { memory: true });
    expect(model(hass).plan.on.source).toBe('scene');
    expect(model(hass, { power_button: { on: 'lights' } }).plan.on.source).toBe('lights');
  });

  it('shows switches as a toggle', () => {
    const hass = createRoomMock('all');
    hass.states['light.vivid_pilot_salon_switch'] = {
      ...hass.states[PILOT.lights]!,
      entity_id: 'light.vivid_pilot_salon_switch',
      attributes: { ...hass.states[PILOT.lights]!.attributes, vivid_pilot_node: 'salon__switch' },
    };
    const badge = model(hass).badges.find((item) => item.role === 'switch');
    expect(badge?.config).toMatchObject({
      icon: 'mdi:toggle-switch',
      icon_off: 'mdi:toggle-switch-off-outline',
      pilot: 'salon__switch',
    });
  });
});

describe('room header editor, source and badges', () => {
  it("tells the source and switches it, dropping the other one's entities", () => {
    expect(headerSource(raw())).toBe('pilot');
    expect(headerSource({ type: 'x', entities: { led: ['light.a'] } })).toBe('manual');
    const manual = setSource(raw({ entities: { presence: false } }), 'manual');
    expect(manual).toEqual({ type: 'custom:vivid-room-header' });
    expect(setSource(manual, 'pilot', 'salon').pilot).toBe('salon');
  });

  it('lists the shown badges, shows, hides and moves them', () => {
    const hass = createRoomMock('all', { climate: true });
    const slots = roomSlots(hass, config());
    const roles = (c: RoomHeaderCardConfig) => shownBadges(c, slots).map((item) => item.slot);
    expect(roles(raw())).toEqual([
      'light',
      'led',
      'illuminance',
      'presence',
      'window',
      'door',
      'temperature',
      'humidity',
      'pressure',
      'co2',
      'battery',
    ]);
    let next = setRoleBadge(raw(), slots, 'presence', false);
    expect(roles(next)).not.toContain('presence');
    next = setRoleBadge(next, slots, 'presence', true);
    expect(roles(next).at(-1)).toBe('presence');
    next = moveShownBadge(next, slots, roles(next).length - 1, -1);
    expect(roles(next).at(-2)).toBe('presence');
    expect(setRoleBadge(raw({ badges: [{ slot: 'led' }] }), slots, 'led', false).badges).toEqual(
      [],
    );
    expect(listShownBadges(raw(), slots).badges).toHaveLength(11);
  });
});
