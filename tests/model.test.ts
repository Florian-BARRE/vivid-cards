import { describe, expect, it } from 'vitest';
import { GROUP_ID, SPOTS_GROUP_ID, createMockHass } from '../dev/mock-hass';
import { resolveConfig } from '../src/cards/led-group/config';
import { buildLedGroupModel, watchedChanged } from '../src/cards/led-group/model';
import { expandGroup, siblingEntities } from '../src/core/entities';
import { readWatts, resolvePowerSource } from '../src/integrations/power';
import { findWledEntities } from '../src/integrations/wled';

const config = (extra: Record<string, unknown> = {}) =>
  resolveConfig({ type: 'custom:vivid-led-group', entity: GROUP_ID, ...extra });

describe('registry helpers', () => {
  it('expands a group into its members', () => {
    const { hass } = createMockHass();
    expect(expandGroup(hass, GROUP_ID)).toEqual([
      'light.salon_ambilight_wled',
      'light.salon_buffet_wled',
      'light.salon_canape_wled',
    ]);
    expect(expandGroup(hass, 'light.salon_buffet_wled')).toEqual(['light.salon_buffet_wled']);
  });

  it('finds siblings through the device registry', () => {
    const { hass } = createMockHass();
    expect(siblingEntities(hass, 'light.salon_buffet_wled')).toContain(
      'select.salon_buffet_wled_live_override',
    );
    expect(siblingEntities(hass, GROUP_ID)).toEqual([]);
  });

  it('finds WLED companions by translation key', () => {
    const { hass } = createMockHass();
    const id = (domain: string, suffix: string) => `${domain}.salon_buffet_wled_${suffix}`;
    expect(findWledEntities(hass, 'light.salon_buffet_wled')).toEqual({
      liveOverride: id('select', 'live_override'),
      estimatedCurrent: id('sensor', 'estimated_current'),
      maxCurrent: id('sensor', 'max_current'),
      ledCount: id('sensor', 'led_count'),
      preset: id('select', 'preset'),
      playlist: id('select', 'playlist'),
      palette: id('select', 'color_palette'),
      speed: id('number', 'speed'),
      intensity: id('number', 'intensity'),
      nightlight: id('switch', 'nightlight'),
      syncSend: id('switch', 'sync_send'),
      syncReceive: id('switch', 'sync_receive'),
      wifiSignal: id('sensor', 'wi_fi_signal'),
      wifiRssi: id('sensor', 'wi_fi_rssi'),
      freeHeap: id('sensor', 'free_memory'),
      ip: id('sensor', 'ip'),
      uptime: id('sensor', 'uptime'),
      restart: id('button', 'restart'),
      update: id('update', 'firmware'),
    });
    expect(findWledEntities(hass, 'light.cuisine_spot_2')).toEqual({});
  });
});

describe('power sources', () => {
  const light = 'light.salon_buffet_wled';
  const pattern = { sensorPattern: 'sensor.{object_id}_puissance' };

  it('follows the auto priority: chosen sensor, pattern, device, estimate', () => {
    const { hass } = createMockHass();
    expect(
      resolvePowerSource(hass, light, pattern, { sensor: 'sensor.salon_canape_wled_puissance' }),
    ).toEqual({ kind: 'power', entityId: 'sensor.salon_canape_wled_puissance', origin: 'sensor' });
    expect(resolvePowerSource(hass, light, pattern)).toEqual({
      kind: 'power',
      entityId: 'sensor.salon_buffet_wled_puissance',
      origin: 'pattern',
    });
    expect(resolvePowerSource(hass, light, { voltage: 5 })).toEqual({
      kind: 'current',
      entityId: 'sensor.salon_buffet_wled_estimated_current',
      voltage: 5,
      origin: 'estimated',
    });
    expect(resolvePowerSource(hass, light, {})).toBeUndefined();
  });

  it('honors explicit modes', () => {
    const { hass } = createMockHass();
    expect(resolvePowerSource(hass, light, pattern, { mode: 'none' })).toBeUndefined();
    expect(
      resolvePowerSource(hass, light, pattern, { mode: 'voltage', voltage: 12 }),
    ).toMatchObject({
      kind: 'current',
      voltage: 12,
    });
    expect(resolvePowerSource(hass, light, { voltage: 5 }, { mode: 'voltage' })).toMatchObject({
      voltage: 5,
    });
    expect(resolvePowerSource(hass, light, pattern, { mode: 'sensor' })).toBeUndefined();
  });

  it('converts current and kilowatts to watts', () => {
    const mock = createMockHass();
    mock.setState('sensor.salon_buffet_wled_estimated_current', '2000', {
      unit_of_measurement: 'mA',
    });
    expect(
      readWatts(mock.hass, {
        kind: 'current',
        entityId: 'sensor.salon_buffet_wled_estimated_current',
        voltage: 5,
        origin: 'estimated',
      }),
    ).toBe(10);
    mock.setState('sensor.salon_buffet_wled_puissance', '0.25', { unit_of_measurement: 'kW' });
    expect(
      readWatts(mock.hass, {
        kind: 'power',
        entityId: 'sensor.salon_buffet_wled_puissance',
        origin: 'pattern',
      }),
    ).toBe(250);
  });
});

describe('buildLedGroupModel', () => {
  it('describes the group and its strips', () => {
    const { hass } = createMockHass();
    const model = buildLedGroupModel(
      hass,
      config({ power: { sensor_pattern: 'sensor.{object_id}_puissance' } }),
    );

    expect(model.name).toBe('Salon LEDs');
    expect(model.isOn).toBe(true);
    expect(model.members.map((m) => m.name)).toEqual(['Ambilight', 'Buffet', 'Canape']);

    const [ambilight, buffet] = model.members;
    expect(ambilight?.available).toBe(false);
    expect(ambilight?.watts).toBeUndefined();
    expect(buffet?.brightness).toBe(78);
    expect(buffet?.watts).toBeCloseTo(27.1, 1);

    // The offline strip adds no watts; the scale grows with every strip that has a sensor.
    expect(model.watts).toBeCloseTo((buffet?.watts ?? 0) + (model.members[2]?.watts ?? 0), 5);
    expect(model.groupScale).toMatchObject({ idle: 9, max: 120, steps: [30, 75] });
  });

  it('aggregates the live override of available strips only', () => {
    const { hass } = createMockHass();
    const model = buildLedGroupModel(hass, config());
    expect(model.isGroup).toBe(true);
    expect(model.hasLiveOverride).toBe(true);
    expect(model.liveOverride).toEqual({
      available: [
        'select.salon_buffet_wled_live_override',
        'select.salon_canape_wled_live_override',
      ],
      active: true,
    });
  });

  it('leaves strips out of the ambilight on request', () => {
    const { hass } = createMockHass();
    const model = buildLedGroupModel(
      hass,
      config({ members: [{ entity: 'light.salon_buffet_wled', ambilight: false }] }),
    );
    expect(model.detected.find((m) => m.autoName === 'Buffet')?.ambilight).toBe(false);
    expect(model.liveOverride).toEqual({
      available: ['select.salon_canape_wled_live_override'],
      active: false,
    });
    expect(buildLedGroupModel(hass, config({ ambilight: { enabled: false } })).liveOverride).toBe(
      undefined,
    );
  });

  it('picks details and hold defaults from the entity kind', () => {
    const { hass } = createMockHass();
    const group = buildLedGroupModel(hass, config());
    expect(group.detailsEnabled).toBe(true);
    expect(group.holdAction).toEqual({ action: 'details' });
    expect(group.tileColorBar).toBe('hue');

    const single = buildLedGroupModel(
      hass,
      resolveConfig({ type: 'custom:vivid-led-group', entity: 'light.salon_buffet_wled' }),
    );
    expect(single.isGroup).toBe(false);
    expect(single.detailsEnabled).toBe(false);
    expect(single.holdAction).toEqual({ action: 'more-info' });
  });

  it('keeps the group order on request', () => {
    const { hass } = createMockHass();
    const model = buildLedGroupModel(
      hass,
      config({
        members: [{ entity: 'light.salon_canape_wled', name: 'A sofa' }],
        details: { sort: 'group' },
      }),
    );
    expect(model.members.map((m) => m.name)).toEqual(['Ambilight', 'Buffet', 'A sofa']);
  });

  it('applies member overrides', () => {
    const { hass } = createMockHass();
    const model = buildLedGroupModel(
      hass,
      config({
        members: [
          { entity: 'light.salon_ambilight_wled', hidden: true },
          { entity: 'light.salon_buffet_wled', name: 'Sideboard' },
        ],
      }),
    );
    expect(model.members.map((m) => m.name)).toEqual(['Canape', 'Sideboard']);
    expect(model.detected).toHaveLength(3);
    expect(model.detected.find((m) => m.hidden)?.autoName).toBe('Ambilight');
  });

  it('handles a group of tunable white lights without WLED', () => {
    const { hass } = createMockHass();
    const model = buildLedGroupModel(
      hass,
      resolveConfig({ type: 'custom:vivid-led-group', entity: SPOTS_GROUP_ID }),
    );
    expect(model.isGroup).toBe(true);
    expect(model.icon).toBe('mdi:ceiling-light-multiple');
    expect(model.tileColorBar).toBe('temperature');
    expect(model.hasLiveOverride).toBe(false);
    expect(model.liveOverride).toBeUndefined();
    expect(model.detected.map((m) => [m.name, m.icon, m.wled])).toEqual([
      ['Spot 1', 'mdi:ceiling-light', false],
      ['Spot 2', 'mdi:ceiling-light', false],
    ]);
    // Only the second spot has a power sensor, found on its device.
    expect(model.detected.map((m) => m.power?.origin)).toEqual([undefined, 'device']);
    expect(model.hasPower).toBe(true);
  });

  it('uses the card icon for every tile when one is set', () => {
    const { hass } = createMockHass();
    const model = buildLedGroupModel(
      hass,
      resolveConfig({ type: 'custom:vivid-led-group', entity: SPOTS_GROUP_ID, icon: 'mdi:lamp' }),
    );
    expect([model.icon, ...model.detected.map((m) => m.icon)]).toEqual([
      'mdi:lamp',
      'mdi:lamp',
      'mdi:lamp',
    ]);
  });

  it('watches every entity it reads', async () => {
    const mock = createMockHass();
    const model = buildLedGroupModel(
      mock.hass,
      config({ power: { sensor_pattern: 'sensor.{object_id}_puissance' } }),
    );
    expect(model.watched).toEqual(
      expect.arrayContaining([
        GROUP_ID,
        'light.salon_buffet_wled',
        'sensor.salon_buffet_wled_puissance',
        'select.salon_buffet_wled_live_override',
      ]),
    );

    const before = mock.hass;
    await mock.hass.callService(
      'select',
      'select_option',
      { option: '0' },
      {
        entity_id: 'select.salon_buffet_wled_live_override',
      },
    );
    expect(watchedChanged(before, mock.hass, model.watched)).toBe(true);

    const unrelated = mock.hass;
    mock.setState('sun.sun', 'above_horizon');
    expect(watchedChanged(unrelated, mock.hass, model.watched)).toBe(false);
  });
});

describe('mock service calls', () => {
  it('turns a strip off at 0 % and updates the group', async () => {
    const mock = createMockHass();
    await mock.hass.callService('light', 'turn_off', {}, { entity_id: 'light.salon_buffet_wled' });
    await mock.hass.callService('light', 'turn_off', {}, { entity_id: 'light.salon_canape_wled' });
    expect(mock.hass.states[GROUP_ID]?.state).toBe('off');
  });
});
