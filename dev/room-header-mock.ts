/**
 * Simulated rooms for the room header preview and tests, as Vivid Pilot sees
 * them: devices with raw ids (`switch.0xa4c1…`, `light.wled_…`) and what
 * Vivid Pilot generates for the living room, each carrying its node and kind
 * (`light.vivid_pilot_salon_light`, `sensor.vivid_pilot_salon_power`,
 * `scene.vivid_pilot_salon_state`…). Service calls change the states; the
 * memory scene stores the lights on at each change and restores them, like
 * Vivid Pilot does.
 */
import type { HassEntity, HomeAssistant, Rgb } from '../src/core/hass-types';

/** all: two lamps and two strips on · lamps: only two lamps · off: everything off. */
export type RoomScenario = 'all' | 'lamps' | 'off';

export interface RoomMock extends HomeAssistant {
  calls: { domain: string; service: string; target?: unknown }[];
  subscribe(listener: (hass: HomeAssistant) => void): void;
}

const LAMPS: { id: string; name: string }[] = [
  { id: 'switch.0xa4c138d6cea4f686', name: 'Lampadaire' },
  { id: 'switch.0xa4c13854a04e9154', name: 'Liseuse' },
  { id: 'switch.0xa4c138067d59b317', name: 'Lampe canapé' },
  { id: 'switch.0xa4c13865b4dce778', name: 'Lampe bureau' },
];
const STRIPS: { id: string; name: string; rgb: Rgb; brightness: number }[] = [
  { id: 'light.wled_tv', name: 'LEDs TV', rgb: [195, 60, 255], brightness: 230 },
  { id: 'light.wled_bibliotheque', name: 'LEDs Bibliothèque', rgb: [0, 180, 216], brightness: 200 },
  { id: 'light.wled_plafond', name: 'LEDs Plafond', rgb: [255, 138, 61], brightness: 180 },
];
const WATTS_PER_LAMP = 47;
const WATTS_PER_STRIP = 22;
const STANDBY_WATTS = 2;

/** The generated entities of the living room. */
export const PILOT = {
  lights: 'light.vivid_pilot_salon_light',
  leds: 'light.vivid_pilot_salon_led',
  power: 'sensor.vivid_pilot_salon_power',
  illuminance: 'sensor.vivid_pilot_salon_illuminance',
  presence: 'binary_sensor.vivid_pilot_salon_presence',
  windows: 'binary_sensor.vivid_pilot_salon_window',
  doors: 'binary_sensor.vivid_pilot_salon_door',
  battery: 'sensor.vivid_pilot_salon_battery',
  scene: 'scene.vivid_pilot_salon_state',
  temperature: 'sensor.vivid_pilot_salon_temperature',
} as const;

function entity(entityId: string, state: string, attributes: Record<string, unknown>): HassEntity {
  const at = new Date(Date.now() - 40_000).toISOString();
  return { entity_id: entityId, state, attributes, last_changed: at, last_updated: at };
}

/** Attributes Vivid Pilot puts on each generated entity. */
function pilot(node: string, kind: string, extra: Record<string, unknown> = {}) {
  return { vivid_pilot_node: node, vivid_pilot_kind: kind, ...extra };
}

export function createRoomMock(
  scenario: RoomScenario = 'all',
  options: {
    language?: string;
    climate?: boolean;
    /** A memory is stored for the room (its scene restores it). */
    memory?: boolean;
  } = {},
): RoomMock {
  const states: Record<string, HassEntity> = {};
  const put = (item: HassEntity): void => {
    states[item.entity_id] = item;
  };
  const lampIds = LAMPS.map((lamp) => lamp.id);
  const stripIds = STRIPS.map((strip) => strip.id);
  LAMPS.forEach((lamp, index) =>
    put(
      entity(lamp.id, scenario !== 'off' && index < 2 ? 'on' : 'off', { friendly_name: lamp.name }),
    ),
  );
  STRIPS.forEach((strip, index) => {
    const on = scenario === 'all' && index < 2;
    put(
      entity(strip.id, on ? 'on' : 'off', {
        friendly_name: strip.name,
        supported_color_modes: ['rgb'],
        color_mode: on ? 'rgb' : null,
        rgb_color: on ? strip.rgb : null,
        brightness: on ? strip.brightness : null,
      }),
    );
  });
  const windows = [
    'binary_sensor.0x00158d0001a2b3c4_contact',
    'binary_sensor.0x00158d0001a2b3c5_contact',
  ];
  for (const id of windows)
    put(entity(id, 'off', { device_class: 'window', friendly_name: 'Fenêtre' }));
  const door = 'binary_sensor.0x00158d0001a2b3c6_contact';
  put(entity(door, 'off', { device_class: 'door', friendly_name: 'Porte d’entrée' }));
  const motion = 'binary_sensor.0x00158d0001a2b3c7_occupancy';
  put(entity(motion, scenario === 'off' ? 'off' : 'on', { device_class: 'occupancy' }));
  const lux = 'sensor.0x00158d0001a2b3c7_illuminance';
  put(
    entity(lux, scenario === 'off' ? '3' : '49', {
      device_class: 'illuminance',
      unit_of_measurement: 'lx',
    }),
  );
  const battery = 'sensor.0x00158d0001a2b3c7_battery';
  put(entity(battery, '64', { device_class: 'battery', unit_of_measurement: '%' }));

  // What Vivid Pilot generates for the living room.
  const group = (id: string, node: string, members: string[], extra: Record<string, unknown>) => {
    const on = members.some((member) => states[member]?.state === 'on');
    put(entity(id, on ? 'on' : 'off', pilot(node, 'group', { entity_id: members, ...extra })));
  };
  group(PILOT.lights, 'salon__light', lampIds, { friendly_name: 'Salon Lumières' });
  group(PILOT.leds, 'salon__led', stripIds, {
    friendly_name: 'Salon LEDs',
    supported_color_modes: ['rgb'],
  });
  const any = (id: string, node: string, members: string[], deviceClass: string, name: string) => {
    const on = members.some((member) => states[member]?.state === 'on');
    put(
      entity(
        id,
        on ? 'on' : 'off',
        pilot(node, 'any', { entity_id: members, device_class: deviceClass, friendly_name: name }),
      ),
    );
  };
  any(PILOT.presence, 'salon__presence', [motion], 'occupancy', 'Salon Présence');
  any(PILOT.windows, 'salon__window', windows, 'window', 'Salon Fenêtres');
  any(PILOT.doors, 'salon__door', [door], 'door', 'Salon Portes');
  put(
    entity(
      PILOT.illuminance,
      states[lux]!.state,
      pilot('salon__illuminance', 'mean', {
        entity_id: [lux],
        device_class: 'illuminance',
        unit_of_measurement: 'lx',
        friendly_name: 'Salon Éclairement',
      }),
    ),
  );
  put(
    entity(
      PILOT.battery,
      '64',
      pilot('salon__battery', 'battery', {
        entity_id: [battery],
        device_class: 'battery',
        unit_of_measurement: '%',
        low: [],
        low_count: 0,
        friendly_name: 'Salon Batterie la plus faible',
      }),
    ),
  );
  put(
    entity(
      PILOT.power,
      '0',
      pilot('salon', 'power', {
        device_class: 'power',
        unit_of_measurement: 'W',
        friendly_name: 'Salon Puissance',
      }),
    ),
  );
  if (options.climate) {
    const climate: [string, string, string, string][] = [
      ['temperature', '21.4', '°C', 'temperature'],
      ['humidity', '48', '%', 'humidity'],
      ['pressure', '1013', 'hPa', 'atmospheric_pressure'],
      ['co2', '640', 'ppm', 'carbon_dioxide'],
    ];
    for (const [category, value, unit, deviceClass] of climate) {
      put(
        entity(
          `sensor.vivid_pilot_salon_${category}`,
          value,
          pilot(`salon__${category}`, 'mean', {
            unit_of_measurement: unit,
            device_class: deviceClass,
          }),
        ),
      );
    }
  }

  /** Lights stored by the memory: those on at the last change while some were on. */
  let memory: string[] | undefined = options.memory ? [lampIds[0]!, stripIds[0]!] : undefined;
  const scene = (): void => {
    put(
      entity(
        PILOT.scene,
        '2026-11-13T10:00:00+00:00',
        pilot('salon', 'state', {
          entity_id: [...lampIds, ...stripIds],
          saved_at: memory ? '2026-11-13T10:00:00+00:00' : null,
          friendly_name: 'Salon État',
        }),
      ),
    );
  };
  scene();

  const listeners = new Set<(hass: HomeAssistant) => void>();
  const calls: RoomMock['calls'] = [];

  const leaves = (id: string): string[] => {
    const members = states[id]?.attributes.entity_id;
    return Array.isArray(members) && !id.startsWith('scene.') ? members.flatMap(leaves) : [id];
  };

  const refresh = (): void => {
    for (const id of [PILOT.lights, PILOT.leds]) {
      const item = states[id]!;
      const on = leaves(id).some((member) => states[member]?.state === 'on');
      states[id] = { ...item, state: on ? 'on' : 'off' };
    }
    const lit = [...lampIds, ...stripIds].filter((id) => states[id]?.state === 'on');
    const watts = lit.reduce(
      (sum, id) => sum + (id.startsWith('switch') ? WATTS_PER_LAMP : WATTS_PER_STRIP),
      STANDBY_WATTS,
    );
    states[PILOT.power] = { ...states[PILOT.power]!, state: String(watts) };
    if (lit.length) memory = lit;
    scene();
  };

  const setLights = (ids: string[], on: boolean): void => {
    for (const id of ids) {
      const item = states[id]!;
      const strip = STRIPS.find((spec) => spec.id === id);
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
  };
  refresh();

  const mock: RoomMock = {
    states: { ...states },
    entities: {},
    devices: {},
    areas: { salon: { area_id: 'salon', name: 'Salon' } },
    language: options.language ?? 'en',
    locale: { language: options.language ?? 'en' },
    calls,
    subscribe(listener) {
      listeners.add(listener);
    },
    callService(domain, service, _data, target) {
      calls.push({ domain, service, target });
      const ids = target?.entity_id;
      const list = Array.isArray(ids) ? ids : ids ? [ids] : [];
      if (domain === 'scene') {
        if (memory) setLights(memory, true);
      } else {
        for (const id of list.flatMap(leaves)) {
          const item = states[id];
          if (!item) continue;
          const on =
            service === 'turn_on' ? true : service === 'turn_off' ? false : item.state !== 'on';
          setLights([id], on);
        }
      }
      refresh();
      const next = { ...mock, states: { ...states } };
      for (const listener of listeners) listener(next);
      return Promise.resolve();
    },
  };
  return mock;
}
