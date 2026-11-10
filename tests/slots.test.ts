import { describe, expect, it } from 'vitest';
import {
  AreaSource,
  GroupSource,
  NamingSource,
  addEntity,
  areaForRoom,
  discover,
  moveEntity,
  parseSlot,
  readSlot,
  removeEntity,
  resolveSlot,
  setExcluded,
  setMode,
  writeSlot,
} from '../src/core/slots';
import type { HassEntity, HomeAssistant } from '../src/core/hass-types';

function entity(id: string, attributes: Record<string, unknown> = {}, state = 'on'): HassEntity {
  return { entity_id: id, state, attributes, last_changed: '', last_updated: '' };
}

function hassWith(states: HassEntity[], extra: Partial<HomeAssistant> = {}): HomeAssistant {
  return {
    states: Object.fromEntries(states.map((item) => [item.entity_id, item])),
    entities: {},
    devices: {},
    language: 'fr',
    callService: () => Promise.resolve(),
    ...extra,
  };
}

const presence = { aliases: ['presence', 'occupancy'], domains: ['binary_sensor'] };

describe('slot values', () => {
  it('reads the four forms', () => {
    expect(parseSlot(undefined, 'x').mode).toBe('auto');
    expect(parseSlot(false, 'x').mode).toBe('off');
    expect(parseSlot('light.a', 'x')).toMatchObject({ mode: 'manual', manual: ['light.a'] });
    expect(parseSlot({ exclude: ['light.a'], add: ['light.b'] }, 'x')).toMatchObject({
      mode: 'auto',
      exclude: ['light.a'],
      add: ['light.b'],
    });
  });

  it('names the field in its errors', () => {
    expect(() => parseSlot(3, 'entities.presence')).toThrow(/entities\.presence/);
    expect(() => parseSlot(['nope'], 'lights')).toThrow(/lights\[0\]/);
    expect(() => parseSlot({ remove: [] }, 'lights')).toThrow(/exclude/);
    expect(readSlot(3).mode).toBe('auto');
  });

  it('writes the shortest value', () => {
    const auto = parseSlot(undefined, 'x');
    expect(writeSlot(auto, true)).toBeUndefined();
    expect(writeSlot(setExcluded(auto, 'light.a', true), true)).toEqual({ exclude: ['light.a'] });
    expect(
      writeSlot(setExcluded(setExcluded(auto, 'light.a', true), 'light.a', false), true),
    ).toBeUndefined();
    expect(writeSlot(setMode(auto, 'off', []), true)).toBe(false);
    expect(writeSlot(setMode(auto, 'manual', ['light.a', 'light.b']), true)).toEqual([
      'light.a',
      'light.b',
    ]);
    expect(writeSlot(setMode(auto, 'manual', ['sensor.a']), false)).toBe('sensor.a');
  });

  it('adds, moves and removes', () => {
    let slot = addEntity(parseSlot(undefined, 'x'), 'light.c', true);
    slot = addEntity(slot, 'light.d', true);
    expect(slot.add).toEqual(['light.c', 'light.d']);
    expect(moveEntity(slot, 'light.d', -1).add).toEqual(['light.d', 'light.c']);
    expect(removeEntity(slot, 'light.c').add).toEqual(['light.d']);
    expect(addEntity(parseSlot(undefined, 'x'), 'sensor.p', false)).toMatchObject({
      mode: 'manual',
      manual: ['sensor.p'],
    });
  });
});

describe('slot resolution', () => {
  const found = [
    { entity: 'light.a', source: 'naming' as const, via: 'x' },
    { entity: 'light.b', source: 'naming' as const, via: 'x' },
  ];

  it('keeps the found minus the left out, plus the added', () => {
    const slot = parseSlot({ exclude: ['light.a'], add: ['light.c'] }, 'x');
    const resolved = resolveSlot(slot, found, true);
    expect(resolved.entities).toEqual(['light.b', 'light.c']);
    expect(resolved.tweaked).toBe(true);
    expect(resolved.entries.map((entry) => [entry.entity, entry.origin, entry.excluded])).toEqual([
      ['light.a', 'found', true],
      ['light.b', 'found', false],
      ['light.c', 'added', false],
    ]);
  });

  it('leaves everything out with "*", and keeps one entity for a single slot', () => {
    expect(resolveSlot(parseSlot({ exclude: ['*'] }, 'x'), found, true).entities).toEqual([]);
    expect(resolveSlot(parseSlot(undefined, 'x'), found, false).entities).toEqual(['light.a']);
  });

  it('ignores the discovery when manual or off', () => {
    expect(resolveSlot(parseSlot(['light.z'], 'x'), found, true).entities).toEqual(['light.z']);
    expect(resolveSlot(parseSlot(false, 'x'), found, true).entities).toEqual([]);
  });
});

describe('discovery sources', () => {
  const hass = hassWith(
    [
      entity('binary_sensor.sdb_presence', { friendly_name: 'sdb-présence' }),
      entity('binary_sensor.capteur_1', { friendly_name: 'Bureau Présence' }),
      entity('binary_sensor.motion_kitchen', { device_class: 'motion' }),
      entity('light.group', { entity_id: ['light.a', 'light.b'] }),
      entity('light.a'),
      entity('light.b'),
    ],
    {
      entities: {
        'binary_sensor.motion_kitchen': {
          entity_id: 'binary_sensor.motion_kitchen',
          labels: [],
          device_id: 'd1',
        },
      },
      devices: {
        d1: {
          id: 'd1',
          name: 'PIR',
          name_by_user: null,
          manufacturer: null,
          model: null,
          area_id: 'kitchen',
        },
      },
      areas: { kitchen: { area_id: 'kitchen', name: 'Cuisine' } },
    },
  );

  it('finds by the default pattern, by id or by name', () => {
    expect(new NamingSource('sdb').find(hass, presence)).toEqual([
      { entity: 'binary_sensor.sdb_presence', source: 'naming', via: 'sdb-presence' },
    ]);
  });

  it('follows another pattern', () => {
    const found = new NamingSource('Bureau', '{room} {role}').find(hass, presence);
    expect(found.map((item) => item.entity)).toEqual(['binary_sensor.capteur_1']);
  });

  it('finds by area, through the device, with the device class', () => {
    const query = { ...presence, deviceClasses: ['motion', 'occupancy'] };
    expect(new AreaSource('kitchen').find(hass, query)).toEqual([
      { entity: 'binary_sensor.motion_kitchen', source: 'area', via: 'Cuisine' },
    ]);
    expect(areaForRoom(hass, 'Cuisine')).toBe('kitchen');
  });

  it('expands groups and tries the sources in order', () => {
    expect(
      new GroupSource('light.group').find(hass, { aliases: [], domains: ['light'] }),
    ).toHaveLength(2);
    const order = [new NamingSource('cuisine'), new AreaSource('kitchen')];
    expect(discover(hass, order, { ...presence, deviceClasses: ['motion'] })[0]?.source).toBe(
      'area',
    );
  });
});
