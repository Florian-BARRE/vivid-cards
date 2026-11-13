import { describe, expect, it } from 'vitest';
import { GROUP_ID, LAMP_PLUGS_GROUP_ID, createMockHass } from '../dev/mock-hass';
import { applyMembers, membersSlot, membersValue } from '../src/components/editor/members';
import { setDeviceEntity } from '../src/components/editor/vivid-device-entities-editor';
import { nextInvoice } from '../src/components/editor/vivid-invoices-editor';
import { resolveAirStationConfig } from '../src/cards/air-station/config';
import { resolveLampConfig } from '../src/cards/lamp-group/config';
import { buildLampGroupModel } from '../src/cards/lamp-group/model';
import { resolveConfig } from '../src/cards/led-group/config';
import { buildLedGroupModel } from '../src/cards/led-group/model';
import { expandGroup } from '../src/core/entities';

describe('group members as a slot', () => {
  it('reads and writes exclude / add, or a manual list', () => {
    expect(membersValue({ entity: 'light.g' })).toBeUndefined();
    expect(membersValue({ entity: 'light.g', exclude: ['light.a'], add: ['light.z'] })).toEqual({
      exclude: ['light.a'],
      add: ['light.z'],
    });
    expect(membersValue({ entities: ['light.a'] })).toEqual(['light.a']);
    expect(applyMembers({ entity: 'light.g' }, { exclude: ['light.a'] })).toEqual({
      entity: 'light.g',
      exclude: ['light.a'],
    });
    expect(applyMembers({ entity: 'light.g', exclude: ['light.a'] }, undefined)).toEqual({
      entity: 'light.g',
    });
    expect(applyMembers({ entity: 'light.g' }, ['light.a', 'light.b'])).toEqual({
      entity: 'light.g',
      entities: ['light.a', 'light.b'],
    });
  });

  it('shows the group members with their origin', () => {
    const { hass } = createMockHass();
    const members = expandGroup(hass, GROUP_ID);
    const slot = membersSlot(
      hass,
      { entity: GROUP_ID, exclude: [members[0]!], add: ['light.extra'] },
      ['light'],
    );
    expect(slot.entries[0]).toMatchObject({ entity: members[0], origin: 'found', excluded: true });
    expect(slot.entities.at(-1)).toBe('light.extra');
  });

  it('leaves out and adds strips on the LED card', () => {
    const { hass } = createMockHass();
    const members = expandGroup(hass, GROUP_ID);
    const plain = buildLedGroupModel(
      hass,
      resolveConfig({ type: 'custom:vivid-led-group', entity: GROUP_ID }),
    );
    const tweaked = buildLedGroupModel(
      hass,
      resolveConfig({ type: 'custom:vivid-led-group', entity: GROUP_ID, exclude: [members[0]] }),
    );
    expect(tweaked.detected.length).toBe(plain.detected.length - 1);
    expect(tweaked.detected.some((strip) => strip.entityId === members[0])).toBe(false);
  });

  it('leaves out and adds lamps on the lamp card', () => {
    const { hass } = createMockHass();
    const members = expandGroup(hass, LAMP_PLUGS_GROUP_ID);
    const config = resolveLampConfig({
      type: 'custom:vivid-lamp-group',
      entity: LAMP_PLUGS_GROUP_ID,
      exclude: [members[0]],
    });
    const lamps = buildLampGroupModel(hass, config).all.map((lamp) => lamp.entityId);
    expect(lamps).not.toContain(members[0]);
    expect(() =>
      resolveLampConfig({ type: 'custom:vivid-lamp-group', entity: LAMP_PLUGS_GROUP_ID, add: 'x' }),
    ).toThrow(/add/);
  });
});

describe('device entities', () => {
  it('writes one key, and false turns it off', () => {
    expect(setDeviceEntity(undefined, 'co2', 'sensor.other')).toEqual({ co2: 'sensor.other' });
    expect(setDeviceEntity({ co2: 'sensor.other' }, 'co2', undefined)).toBeUndefined();
    expect(setDeviceEntity({}, 'rssi', false)).toEqual({ rssi: false });
    const resolved = resolveAirStationConfig({
      type: 'custom:vivid-air-station-card',
      prefix: 'p_',
      entities: { rssi: false, co2: 'sensor.other' },
    });
    expect(resolved.entities.rssi).toBe('');
    expect(resolved.entities.co2).toBe('sensor.other');
  });
});

describe('invoices', () => {
  it('starts the next invoice the day after the last one', () => {
    expect(nextInvoice([])).toEqual({});
    expect(
      nextInvoice([
        { from: '2026-09-12', to: '2026-10-11' },
        { from: '2026-09-02', to: '2026-09-11' },
      ]),
    ).toEqual({ from: '2026-10-12' });
    expect(nextInvoice([{ from: '2026-12-01', to: '2026-12-31' }])).toEqual({ from: '2027-01-01' });
  });
});

describe('energy devices', () => {
  const sources = [
    { stat: 'sensor.tv_energy', name: 'TV' },
    { stat: 'sensor.fridge_energy', name: 'Frigo' },
  ];

  it('takes the consumers, left out, added or listed', async () => {
    const { pickDevices } = await import('../src/energy/data');
    const { parseSlot } = await import('../src/core/slots');
    expect(pickDevices(sources, undefined)).toEqual(sources);
    expect(
      pickDevices(
        sources,
        parseSlot({ exclude: ['sensor.tv_energy'], add: ['sensor.oven'] }, 'devices'),
      ),
    ).toEqual([{ stat: 'sensor.fridge_energy', name: 'Frigo' }, { stat: 'sensor.oven' }]);
    expect(pickDevices(sources, parseSlot(['sensor.oven'], 'devices'))).toEqual([
      { stat: 'sensor.oven' },
    ]);
  });

  it('lists each Vivid Pilot room, its categories inside it', async () => {
    const { pilotDevices } = await import('../src/energy/data');
    const state = (entity_id: string, node: string) => ({
      entity_id,
      state: '1',
      attributes: { vivid_pilot_node: node, vivid_pilot_kind: 'energy' },
      last_changed: '',
      last_updated: '',
    });
    const hass = {
      states: {
        'sensor.vivid_pilot_salon_energy': state('sensor.vivid_pilot_salon_energy', 'salon'),
        'sensor.vivid_pilot_salon_led_energy': state(
          'sensor.vivid_pilot_salon_led_energy',
          'salon__led',
        ),
        'sensor.vivid_pilot_all_energy': state('sensor.vivid_pilot_all_energy', 'all'),
      },
      entities: {},
      devices: {},
      areas: { salon: { area_id: 'salon', name: 'Salon' } },
      language: 'fr',
      callService: () => Promise.resolve(),
    };
    expect(pilotDevices(hass)).toEqual([
      { stat: 'sensor.vivid_pilot_salon_energy', name: 'Salon' },
      {
        stat: 'sensor.vivid_pilot_salon_led_energy',
        includedIn: 'sensor.vivid_pilot_salon_energy',
      },
    ]);
  });
});
