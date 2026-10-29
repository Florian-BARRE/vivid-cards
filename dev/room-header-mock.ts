/**
 * Simulated rooms for the room header preview and tests, named like the
 * owner's installation: `switch.salon_lampes` (four lamp plugs),
 * `light.salon_leds` (three RGB strips), `sensor.salon_puissance`, …
 * Service calls change the states, so the preview reacts to the power button.
 */
import type { HassEntity, HomeAssistant, Rgb } from '../src/core/hass-types';

/** all: two lamps and two strips on · lamps: only two lamps · off: everything off. */
export type RoomScenario = 'all' | 'lamps' | 'off';

export interface RoomMock extends HomeAssistant {
  calls: { domain: string; service: string; target?: unknown }[];
  subscribe(listener: (hass: HomeAssistant) => void): void;
}

const LAMPS = ['lampadaire', 'liseuse', 'lampe_canape', 'lampe_bureau'];
const STRIPS: { key: string; rgb: Rgb; brightness: number }[] = [
  { key: 'tv', rgb: [195, 60, 255], brightness: 230 },
  { key: 'bibliotheque', rgb: [0, 180, 216], brightness: 200 },
  { key: 'plafond', rgb: [255, 138, 61], brightness: 180 },
];
const WATTS: Record<RoomScenario, number> = { all: 138, lamps: 94, off: 2 };

function entity(entityId: string, state: string, attributes: Record<string, unknown>): HassEntity {
  const at = new Date(Date.now() - 40_000).toISOString();
  return { entity_id: entityId, state, attributes, last_changed: at, last_updated: at };
}

function title(id: string): string {
  const words = id.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function createRoomMock(
  scenario: RoomScenario = 'all',
  options: { language?: string; climate?: boolean } = {},
): RoomMock {
  const states: Record<string, HassEntity> = {};
  const put = (item: HassEntity): void => {
    states[item.entity_id] = item;
  };
  const lampIds = LAMPS.map((key) => `switch.salon_${key}`);
  lampIds.forEach((id, index) =>
    put(
      entity(id, scenario !== 'off' && index < 2 ? 'on' : 'off', {
        friendly_name: title(id.slice(7 + 6)),
      }),
    ),
  );
  const stripIds = STRIPS.map((strip) => `light.salon_leds_${strip.key}`);
  STRIPS.forEach((strip, index) => {
    const on = scenario === 'all' && index < 2;
    put(
      entity(stripIds[index]!, on ? 'on' : 'off', {
        friendly_name: `LEDs ${title(strip.key)}`,
        supported_color_modes: ['rgb'],
        color_mode: on ? 'rgb' : null,
        rgb_color: on ? strip.rgb : null,
        brightness: on ? strip.brightness : null,
      }),
    );
  });
  const group = (id: string, members: string[], extra: Record<string, unknown> = {}): void => {
    const on = members.some((member) => states[member]?.state === 'on');
    put(entity(id, on ? 'on' : 'off', { entity_id: members, ...extra }));
  };
  group('switch.salon_lampes', lampIds, { friendly_name: 'Lampes du salon' });
  group('light.salon_leds', stripIds, {
    friendly_name: 'LEDs du salon',
    supported_color_modes: ['rgb'],
  });
  put(
    entity('sensor.salon_puissance', String(WATTS[scenario]), {
      friendly_name: 'Puissance salon',
      unit_of_measurement: 'W',
      device_class: 'power',
    }),
  );
  put(
    entity('sensor.salon_eclairement', scenario === 'off' ? '3' : '49', {
      friendly_name: 'Éclairement salon',
      unit_of_measurement: 'lx',
      device_class: 'illuminance',
    }),
  );
  put(
    entity('binary_sensor.salon_presence', scenario === 'off' ? 'off' : 'on', {
      friendly_name: 'Présence salon',
      device_class: 'occupancy',
    }),
  );
  const windows = ['binary_sensor.salon_fenetre_gauche', 'binary_sensor.salon_fenetre_droite'];
  for (const id of windows)
    put(entity(id, 'off', { device_class: 'window', friendly_name: title(id.slice(14)) }));
  group('binary_sensor.salon_fenetres', windows, {
    friendly_name: 'Fenêtres salon',
    device_class: 'window',
  });
  put(
    entity('binary_sensor.salon_porte_entree', 'off', {
      device_class: 'door',
      friendly_name: 'Porte d’entrée',
    }),
  );
  group('binary_sensor.salon_portes', ['binary_sensor.salon_porte_entree'], {
    friendly_name: 'Portes salon',
    device_class: 'door',
  });
  if (options.climate) {
    const climate: [string, string, string, string][] = [
      ['temperature', '21.4', '°C', 'temperature'],
      ['humidite', '48', '%', 'humidity'],
      ['pression', '1013', 'hPa', 'atmospheric_pressure'],
      ['co2', '640', 'ppm', 'carbon_dioxide'],
    ];
    for (const [suffix, value, unit, deviceClass] of climate) {
      put(
        entity(`sensor.salon_${suffix}`, value, {
          unit_of_measurement: unit,
          device_class: deviceClass,
        }),
      );
    }
  }

  const listeners = new Set<(hass: HomeAssistant) => void>();
  const calls: RoomMock['calls'] = [];

  const leaves = (id: string): string[] => {
    const members = states[id]?.attributes.entity_id;
    return Array.isArray(members) ? members.flatMap(leaves) : [id];
  };

  const refresh = (): void => {
    for (const id of ['switch.salon_lampes', 'light.salon_leds']) {
      const item = states[id]!;
      const on = leaves(id).some((member) => states[member]?.state === 'on');
      states[id] = { ...item, state: on ? 'on' : 'off' };
    }
    const lit = [...lampIds, ...stripIds].filter((id) => states[id]?.state === 'on');
    const watts = lit.reduce((sum, id) => sum + (id.startsWith('switch') ? 47 : 22), 2);
    const power = states['sensor.salon_puissance']!;
    states['sensor.salon_puissance'] = { ...power, state: String(watts) };
  };

  const mock: RoomMock = {
    states: { ...states },
    entities: {},
    devices: {},
    language: options.language ?? 'en',
    locale: { language: options.language ?? 'en' },
    calls,
    subscribe(listener) {
      listeners.add(listener);
    },
    callService(domain, service, _data, target) {
      calls.push({ domain, service, target });
      const ids = target?.entity_id;
      const list = (Array.isArray(ids) ? ids : ids ? [ids] : []).flatMap(leaves);
      for (const id of list) {
        const item = states[id];
        if (!item) continue;
        const on =
          service === 'turn_on' ? true : service === 'turn_off' ? false : item.state !== 'on';
        const strip = STRIPS.find((spec) => id === `light.salon_leds_${spec.key}`);
        states[id] = {
          ...item,
          state: on ? 'on' : 'off',
          attributes: strip
            ? {
                ...item.attributes,
                rgb_color: on ? strip.rgb : null,
                brightness: on ? strip.brightness : null,
                color_mode: on ? 'rgb' : null,
              }
            : item.attributes,
        };
      }
      refresh();
      const next = { ...mock, states: { ...states } };
      for (const listener of listeners) listener(next);
      return Promise.resolve();
    },
  };
  return mock;
}
