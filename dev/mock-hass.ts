/**
 * In-memory Home Assistant used by the preview page and the unit tests.
 * Models a living room with three WLED strips grouped in `light.salon_leds`
 * (device registry, live override, presets, palettes, effect speed and
 * intensity, sync switches, diagnostics, firmware update, estimated current and
 * template power sensors), a temperature sensor and a kitchen with two tunable white spots grouped in
 * `light.cuisine_spots` (no WLED; only the second one has a power sensor, on its
 * device), and three plain living room lamps grouped in `light.salon_lampes`.
 * Service calls mutate the state and publish a new `hass` snapshot.
 */
import { hsToRgb } from '../src/core/color';
import type {
  DeviceRegistryEntry,
  EntityRegistryDisplayEntry,
  HassEntity,
  HomeAssistant,
  Rgb,
  ServiceTarget,
} from '../src/core/hass-types';

export const GROUP_ID = 'light.salon_leds';
export const SPOTS_GROUP_ID = 'light.cuisine_spots';
/** Three plain lamps (no WLED) with an icon that has no crossed-out variant. */
export const LAMPS_GROUP_ID = 'light.salon_lampes';
export const WINDOWS_GROUP_ID = 'binary_sensor.fenetres';
export const DOORS_GROUP_ID = 'binary_sensor.portes';
export const PRESENCE_GROUP_ID = 'binary_sensor.presence_maison';
export const ILLUMINANCE_GROUP_ID = 'sensor.eclairement';
export const POWER_GROUP_ID = 'sensor.puissance_maison';
/** Two lamps on smart plugs, grouped as a switch group. */
export const PLUGS_GROUP_ID = 'switch.chambre_lampes';
const PLUGS = [
  { key: 'chambre_lampe_chevet', name: 'Chambre Lampe Chevet', on: false },
  { key: 'chambre_guirlande', name: 'Chambre Guirlande', on: false },
];

/** Four lamps on smart plugs with power metering (the lamp card). */
export const LAMP_PLUGS_GROUP_ID = 'switch.salon_prises';
export const LAMP_SCENE_ID = 'scene.salon_soiree';
interface LampPlugSpec {
  key: string;
  name: string;
  icon: string;
  on: boolean;
  /** Watts drawn while on. */
  watts: number;
  /** Minutes since the last switch, when the mock is created. */
  minutes: number;
}
const LAMP_PLUGS: LampPlugSpec[] = [
  {
    key: 'salon_lustre',
    name: 'Salon Lustre',
    icon: 'mdi:chandelier',
    on: true,
    watts: 18,
    minutes: 35,
  },
  {
    key: 'salon_lampadaire',
    name: 'Salon Lampadaire',
    icon: 'mdi:floor-lamp',
    on: true,
    watts: 9,
    minutes: 128,
  },
  {
    key: 'salon_suspension',
    name: 'Salon Suspension',
    icon: 'mdi:ceiling-light',
    on: false,
    watts: 12,
    minutes: 190,
  },
  // On but drawing nothing: the bulb is out.
  {
    key: 'salon_liseuse',
    name: 'Salon Liseuse',
    icon: 'mdi:desk-lamp',
    on: true,
    watts: 0.3,
    minutes: 5,
  },
];

const EFFECTS = ['Solid', 'Rainbow', 'Colorloop', 'Breathe', 'Candle', 'Fire 2012', 'Aurora'];

interface StripSpec {
  key: string;
  online: boolean;
  on: boolean;
  brightness: number;
  hue: number;
  saturation: number;
  effect: string;
  override: '0' | '1' | '2';
  preset: string;
  playlist: string;
  palette: string;
  speed: number;
  intensity: number;
  nightlight: boolean;
  reverse: boolean;
  freeze: boolean;
  syncSend: boolean;
  syncReceive: boolean;
  /** Wi-Fi signal in percent. */
  signal: number;
  ledCount: number;
  /** Brightness limiter in mA. */
  maxCurrent: number;
  bootHoursAgo: number;
  firmware: string;
}

const STRIP_DEFAULTS = {
  preset: 'unknown',
  playlist: 'unknown',
  palette: 'Default',
  speed: 128,
  intensity: 128,
  nightlight: false,
  reverse: false,
  freeze: false,
  syncSend: false,
  syncReceive: true,
  firmware: '0.15.0',
};

const PRESETS = ['Film', 'Soirée', 'Lecture'];
const PLAYLISTS = ['Cycle doux'];
const PALETTES = ['Default', 'Rainbow', 'Party', 'Ocean', 'Lava', 'Sunset', 'Aurora'];
const LATEST_FIRMWARE = '0.15.1';

const STRIPS: StripSpec[] = [
  {
    ...STRIP_DEFAULTS,
    key: 'salon_ambilight_wled',
    online: false,
    on: false,
    brightness: 0,
    hue: 0,
    saturation: 0,
    effect: 'Solid',
    override: '0',
    signal: 0,
    ledCount: 120,
    maxCurrent: 5000,
    bootHoursAgo: 0,
  },
  {
    ...STRIP_DEFAULTS,
    key: 'salon_buffet_wled',
    online: true,
    on: true,
    brightness: 200,
    hue: 28,
    saturation: 78,
    effect: 'Solid',
    override: '1',
    preset: 'Soirée',
    signal: 84,
    ledCount: 150,
    maxCurrent: 7000,
    bootHoursAgo: 76,
    firmware: '0.14.4',
  },
  {
    ...STRIP_DEFAULTS,
    key: 'salon_canape_wled',
    online: true,
    on: true,
    brightness: 90,
    hue: 268,
    saturation: 85,
    effect: 'Breathe',
    override: '0',
    palette: 'Ocean',
    speed: 90,
    intensity: 200,
    syncSend: true,
    signal: 38,
    ledCount: 90,
    maxCurrent: 7000,
    bootHoursAgo: 5,
    firmware: LATEST_FIRMWARE,
  },
];

interface SpotSpec {
  key: string;
  name: string;
  on: boolean;
  brightness: number;
  kelvin: number;
  /** Entity id of a power sensor on the spot's device. */
  powerSensor?: string;
}

const SPOTS: SpotSpec[] = [
  { key: 'cuisine_spot_1', name: 'Cuisine Spot 1', on: true, brightness: 230, kelvin: 3000 },
  {
    key: 'cuisine_spot_2',
    name: 'Cuisine Spot 2',
    on: false,
    brightness: 0,
    kelvin: 4000,
    powerSensor: 'sensor.prise_spot_2_power',
  },
];

const LAMPS: SpotSpec[] = [
  {
    key: 'salon_lampe_canape',
    name: 'Salon Lampe Canapé',
    on: true,
    brightness: 200,
    kelvin: 2700,
  },
  {
    key: 'salon_lampe_lecture',
    name: 'Salon Lampe Lecture',
    on: false,
    brightness: 0,
    kelvin: 3000,
  },
  { key: 'salon_lampadaire', name: 'Salon Lampadaire', on: false, brightness: 0, kelvin: 2400 },
];

const NOW = new Date('2026-10-04T18:00:00Z').toISOString();
/** Watts drawn by the ESP and the strip at 0 % / 100 % brightness. */
const IDLE_WATTS = 1.8;
const FULL_WATTS = 34;
const VOLTAGE = 5;

function entity(entityId: string, state: string, attributes: HassEntity['attributes']): HassEntity {
  return { entity_id: entityId, state, attributes, last_changed: NOW, last_updated: NOW };
}

/** Hue (degrees) and saturation (percent) of an RGB color. */
function rgbToHs([r, g, b]: Rgb): [number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const saturation = max === 0 ? 0 : (delta / max) * 100;
  let hue = 0;
  if (delta > 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
  }
  return [Math.round((hue * 60 + 360) % 360), Math.round(saturation)];
}

function friendly(key: string): string {
  return key.replaceAll('_', '-');
}

export interface MockHass {
  readonly hass: HomeAssistant;
  readonly calls: { domain: string; service: string; data: unknown; target: unknown }[];
  subscribe(listener: (hass: HomeAssistant) => void): () => void;
  /** Replaces a state; `minutesAgo` sets its last change relative to now. */
  setState(
    entityId: string,
    state: string,
    attributes?: HassEntity['attributes'],
    minutesAgo?: number,
  ): void;
}

export function createMockHass(language = 'en', options: { allOnline?: boolean } = {}): MockHass {
  const strips = STRIPS.map((spec) => ({
    ...spec,
    online: options.allOnline ? true : spec.online,
  }));
  const spots = SPOTS.map((spec) => ({ ...spec }));
  const lamps = LAMPS.map((spec) => ({ ...spec }));
  const plugs = PLUGS.map((spec) => ({ ...spec }));
  const lampPlugs = LAMP_PLUGS.map((spec) => ({
    ...spec,
    changed: Date.now() - spec.minutes * 60_000,
  }));
  /** When the scene was last activated (the state of a scene). */
  let sceneActivated = Date.now() - 6 * 3_600_000;
  const listeners = new Set<(hass: HomeAssistant) => void>();
  const calls: MockHass['calls'] = [];

  const entities: Record<string, EntityRegistryDisplayEntry> = {};
  const devices: Record<string, DeviceRegistryEntry> = {};
  for (const strip of strips) {
    const deviceId = `device_${strip.key}`;
    devices[deviceId] = {
      id: deviceId,
      name: friendly(strip.key),
      name_by_user: null,
      manufacturer: 'WLED',
      model: 'FOSS',
      area_id: 'salon',
    };
    const add = (entityId: string, translationKey: string, category?: 'config' | 'diagnostic') => {
      entities[entityId] = {
        entity_id: entityId,
        device_id: deviceId,
        platform: 'wled',
        translation_key: translationKey,
        entity_category: category,
        labels: [],
      };
    };
    add(`light.${strip.key}`, 'segment');
    add(`select.${strip.key}_live_override`, 'live_override', 'config');
    add(`sensor.${strip.key}_estimated_current`, 'estimated_current', 'diagnostic');
    add(`select.${strip.key}_preset`, 'preset');
    add(`select.${strip.key}_playlist`, 'playlist');
    add(`select.${strip.key}_color_palette`, 'color_palette', 'config');
    add(`number.${strip.key}_speed`, 'speed', 'config');
    add(`number.${strip.key}_intensity`, 'intensity', 'config');
    add(`switch.${strip.key}_nightlight`, 'nightlight', 'config');
    add(`switch.${strip.key}_reverse`, 'reverse', 'config');
    add(`switch.${strip.key}_freeze`, 'freeze', 'config');
    add(`switch.${strip.key}_sync_send`, 'sync_send', 'config');
    add(`switch.${strip.key}_sync_receive`, 'sync_receive', 'config');
    add(`sensor.${strip.key}_led_count`, 'info_leds_count', 'diagnostic');
    add(`sensor.${strip.key}_max_current`, 'info_leds_max_power', 'diagnostic');
    add(`sensor.${strip.key}_wi_fi_signal`, 'wifi_signal', 'diagnostic');
    add(`sensor.${strip.key}_wi_fi_rssi`, 'wifi_rssi', 'diagnostic');
    add(`sensor.${strip.key}_free_memory`, 'free_heap', 'diagnostic');
    add(`sensor.${strip.key}_ip`, 'ip', 'diagnostic');
    // No translation key: recognized by their domain and device class.
    add(`sensor.${strip.key}_uptime`, 'uptime', 'diagnostic');
    entities[`button.${strip.key}_restart`] = {
      entity_id: `button.${strip.key}_restart`,
      device_id: deviceId,
      platform: 'wled',
      entity_category: 'config',
      labels: [],
    };
    entities[`update.${strip.key}_firmware`] = {
      entity_id: `update.${strip.key}_firmware`,
      device_id: deviceId,
      platform: 'wled',
      entity_category: 'config',
      labels: [],
    };
    // Template sensor created by the user: not attached to the WLED device.
    entities[`sensor.${strip.key}_puissance`] = {
      entity_id: `sensor.${strip.key}_puissance`,
      platform: 'template',
      labels: [],
    };
  }
  entities[GROUP_ID] = { entity_id: GROUP_ID, platform: 'group', labels: [] };
  entities['sensor.salon_temperature'] = {
    entity_id: 'sensor.salon_temperature',
    platform: 'zha',
    labels: [],
  };
  entities['binary_sensor.salon_presence'] = {
    entity_id: 'binary_sensor.salon_presence',
    platform: 'zha',
    labels: [],
  };
  for (const spot of spots) {
    const deviceId = `device_${spot.key}`;
    devices[deviceId] = {
      id: deviceId,
      name: spot.name,
      name_by_user: null,
      manufacturer: 'Signify',
      model: 'GU10 White Ambiance',
      area_id: 'cuisine',
    };
    entities[`light.${spot.key}`] = {
      entity_id: `light.${spot.key}`,
      device_id: deviceId,
      platform: 'hue',
      labels: [],
    };
    if (spot.powerSensor) {
      entities[spot.powerSensor] = {
        entity_id: spot.powerSensor,
        device_id: deviceId,
        platform: 'hue',
        labels: [],
      };
    }
  }
  entities[SPOTS_GROUP_ID] = { entity_id: SPOTS_GROUP_ID, platform: 'group', labels: [] };
  for (const lamp of lamps) {
    entities[`light.${lamp.key}`] = {
      entity_id: `light.${lamp.key}`,
      platform: 'hue',
      labels: [],
    };
  }
  entities[LAMPS_GROUP_ID] = { entity_id: LAMPS_GROUP_ID, platform: 'group', labels: [] };
  for (const plug of lampPlugs) {
    const deviceId = `device_${plug.key}`;
    devices[deviceId] = {
      id: deviceId,
      name: plug.name,
      name_by_user: null,
      manufacturer: 'Nous',
      model: 'A1Z smart plug',
      area_id: 'salon',
    };
    for (const id of [`switch.${plug.key}`, `sensor.${plug.key}_power`]) {
      entities[id] = { entity_id: id, device_id: deviceId, platform: 'zha', labels: [] };
    }
  }
  entities[LAMP_PLUGS_GROUP_ID] = {
    entity_id: LAMP_PLUGS_GROUP_ID,
    platform: 'group',
    labels: [],
  };

  let states: Record<string, HassEntity> = {};

  /** Windows, doors, presence, illuminance, power and batteries, changed minutes ago. */
  const createdAt = Date.now();
  const status = (
    entityId: string,
    state: string,
    minutesAgo: number,
    attributes: HassEntity['attributes'],
  ): HassEntity => {
    const changed = new Date(createdAt - minutesAgo * 60_000).toISOString();
    return { entity_id: entityId, state, attributes, last_changed: changed, last_updated: changed };
  };
  const group = (entityId: string, name: string, ids: string[], extra = {}): HassEntity =>
    status(entityId, 'on', 0, { friendly_name: name, entity_id: ids, ...extra });
  const windowSensor = (key: string, name: string, open: boolean, minutes: number) =>
    status(`binary_sensor.${key}`, open ? 'on' : 'off', minutes, {
      friendly_name: name,
      device_class: 'window',
    });
  const windows = [
    windowSensor('salon_fenetre', 'Fenêtre Salon', true, 52),
    windowSensor('chambre_fenetre', 'Fenêtre Chambre', true, 18),
    windowSensor('bureau_velux', 'Fenêtre Velux bureau', true, 4),
    windowSensor('cuisine_fenetre', 'Fenêtre Cuisine', false, 125),
    windowSensor('sdb_fenetre', 'Fenêtre Salle de bain', false, 300),
    windowSensor('entree_fenetre', 'Fenêtre Entrée', false, 600),
    windowSensor('buanderie_fenetre', 'Fenêtre Buanderie', false, 1500),
  ];
  const doors = [
    status('binary_sensor.porte_entree', 'off', 190, {
      friendly_name: 'Porte Entrée',
      device_class: 'door',
    }),
    status('binary_sensor.porte_jardin', 'off', 45, {
      friendly_name: 'Porte Jardin',
      device_class: 'door',
    }),
    status('binary_sensor.porte_garage', 'off', 900, {
      friendly_name: 'Porte Garage',
      device_class: 'garage_door',
    }),
  ];
  const presence = [
    status('binary_sensor.salon_presence', 'on', 12, {
      friendly_name: 'Salon Présence',
      device_class: 'occupancy',
    }),
    status('binary_sensor.bureau_presence', 'on', 64, {
      friendly_name: 'Bureau Présence',
      device_class: 'occupancy',
    }),
    status('binary_sensor.chambre_presence', 'off', 185, {
      friendly_name: 'Chambre Présence',
      device_class: 'occupancy',
    }),
    status('binary_sensor.cuisine_presence', 'off', 25, {
      friendly_name: 'Cuisine Présence',
      device_class: 'occupancy',
    }),
  ];
  const lux = (key: string, name: string, value: number) =>
    status(`sensor.${key}`, String(value), 2, {
      friendly_name: name,
      device_class: 'illuminance',
      unit_of_measurement: 'lx',
      state_class: 'measurement',
    });
  const illuminance = [
    lux('salon_eclairement', 'Salon Éclairement', 610),
    lux('bureau_eclairement', 'Bureau Éclairement', 230),
    lux('chambre_eclairement', 'Chambre Éclairement', 120),
  ];
  const watt = (key: string, name: string, value: number, unit = 'W') =>
    status(`sensor.${key}`, String(value), 1, {
      friendly_name: name,
      device_class: 'power',
      unit_of_measurement: unit,
      state_class: 'measurement',
    });
  const power = [
    watt('tv_salon_puissance', 'TV salon', 312),
    watt('pc_bureau_puissance', 'PC bureau', 0.186, 'kW'),
    watt('frigo_puissance', 'Frigo', 40),
    watt('lave_linge_puissance', 'Lave-linge', 0.8),
  ];
  const battery = (key: string, name: string, level: number) =>
    status(`sensor.${key}_batterie`, String(level), 60, {
      friendly_name: `${name} Batterie`,
      device_class: 'battery',
      unit_of_measurement: '%',
    });
  const batteries = [
    battery('porte_entree', 'Capteur porte entrée', 9),
    battery('telecommande_salon', 'Télécommande salon', 14),
    battery('fenetre_chambre', 'Fenêtre chambre', 27),
    battery('mmwave_salon', 'mmWave salon', 82),
    battery('fenetre_salon', 'Fenêtre salon', 64),
    battery('thermometre_chambre', 'Thermomètre chambre', 71),
    battery('bouton_entree', 'Bouton entrée', 88),
    battery('detecteur_fumee', 'Détecteur fumée', 96),
  ];
  const statusSensors: HassEntity[] = [
    ...windows,
    group(
      WINDOWS_GROUP_ID,
      'Fenêtres',
      windows.map((w) => w.entity_id),
      {
        device_class: 'window',
      },
    ),
    ...doors,
    group(
      DOORS_GROUP_ID,
      'Portes',
      doors.map((d) => d.entity_id),
      { device_class: 'door' },
    ),
    ...presence,
    group(
      PRESENCE_GROUP_ID,
      'Présence maison',
      presence.map((p) => p.entity_id),
      {
        device_class: 'occupancy',
      },
    ),
    ...illuminance,
    group(
      ILLUMINANCE_GROUP_ID,
      'Éclairement',
      illuminance.map((l) => l.entity_id),
      {
        device_class: 'illuminance',
        unit_of_measurement: 'lx',
      },
    ),
    ...power,
    group(
      POWER_GROUP_ID,
      'Puissance maison',
      power.map((p) => p.entity_id),
      {
        device_class: 'power',
        unit_of_measurement: 'W',
      },
    ),
    ...batteries,
  ];

  const stripWatts = (strip: StripSpec): number =>
    strip.on ? IDLE_WATTS + (FULL_WATTS - IDLE_WATTS) * (strip.brightness / 255) : IDLE_WATTS;

  const rebuild = (): void => {
    const next: Record<string, HassEntity> = { ...states };
    const put = (value: HassEntity): void => {
      const previous = states[value.entity_id];
      next[value.entity_id] =
        previous && JSON.stringify(previous) === JSON.stringify(value) ? previous : value;
    };

    for (const strip of strips) {
      const id = `light.${strip.key}`;
      const rgb: Rgb = hsToRgb(strip.hue, strip.saturation);
      put(
        entity(id, strip.online ? (strip.on ? 'on' : 'off') : 'unavailable', {
          friendly_name: friendly(strip.key),
          supported_color_modes: ['rgb'],
          color_mode: strip.on ? 'rgb' : null,
          brightness: strip.on ? strip.brightness : null,
          hs_color: strip.on ? [strip.hue, strip.saturation] : null,
          rgb_color: strip.on ? rgb : null,
          effect_list: EFFECTS,
          effect: strip.on ? strip.effect : null,
          icon: 'mdi:led-strip-variant',
        }),
      );
      put(
        entity(`select.${strip.key}_live_override`, strip.online ? strip.override : 'unavailable', {
          friendly_name: `${friendly(strip.key)} Live override`,
          options: ['0', '1', '2'],
        }),
      );
      const watts = stripWatts(strip);
      put(
        entity(
          `sensor.${strip.key}_estimated_current`,
          strip.online ? String(Math.round((watts / VOLTAGE) * 1000)) : 'unavailable',
          {
            friendly_name: `${friendly(strip.key)} Estimated current`,
            unit_of_measurement: 'mA',
            device_class: 'current',
            state_class: 'measurement',
          },
        ),
      );
      put(
        entity(`sensor.${strip.key}_puissance`, strip.online ? watts.toFixed(1) : 'unavailable', {
          friendly_name: `${friendly(strip.key)}-puissance`,
          unit_of_measurement: 'W',
          device_class: 'power',
          state_class: 'measurement',
        }),
      );
      const value = (state: string) => (strip.online ? state : 'unavailable');
      const name = (suffix: string) => `${friendly(strip.key)} ${suffix}`;
      put(
        entity(`select.${strip.key}_preset`, value(strip.preset), {
          friendly_name: name('Preset'),
          options: PRESETS,
        }),
      );
      put(
        entity(`select.${strip.key}_playlist`, value(strip.playlist), {
          friendly_name: name('Playlist'),
          options: PLAYLISTS,
        }),
      );
      put(
        entity(`select.${strip.key}_color_palette`, value(strip.palette), {
          friendly_name: name('Color palette'),
          options: PALETTES,
        }),
      );
      for (const [key, label] of [
        ['speed', 'Speed'],
        ['intensity', 'Intensity'],
      ] as const) {
        put(
          entity(`number.${strip.key}_${key}`, value(String(strip[key])), {
            friendly_name: name(label),
            min: 0,
            max: 255,
            step: 1,
            mode: 'slider',
          }),
        );
      }
      for (const [key, label, field] of [
        ['nightlight', 'Nightlight', 'nightlight'],
        ['reverse', 'Reverse', 'reverse'],
        ['freeze', 'Freeze', 'freeze'],
        ['sync_send', 'Sync send', 'syncSend'],
        ['sync_receive', 'Sync receive', 'syncReceive'],
      ] as const) {
        const on = strip[field];
        put(
          entity(`switch.${strip.key}_${key}`, value(on ? 'on' : 'off'), {
            friendly_name: name(label),
          }),
        );
      }
      put(
        entity(`sensor.${strip.key}_led_count`, value(String(strip.ledCount)), {
          friendly_name: name('LED count'),
          unit_of_measurement: 'LEDs',
        }),
      );
      put(
        entity(`sensor.${strip.key}_max_current`, value(String(strip.maxCurrent)), {
          friendly_name: name('Max current'),
          unit_of_measurement: 'mA',
          device_class: 'current',
        }),
      );
      put(
        entity(`sensor.${strip.key}_wi_fi_signal`, value(String(strip.signal)), {
          friendly_name: name('Wi-Fi signal'),
          unit_of_measurement: '%',
        }),
      );
      put(
        entity(
          `sensor.${strip.key}_wi_fi_rssi`,
          value(String(Math.round(-100 + strip.signal / 2))),
          {
            friendly_name: name('Wi-Fi RSSI'),
            unit_of_measurement: 'dBm',
            device_class: 'signal_strength',
          },
        ),
      );
      put(
        entity(`sensor.${strip.key}_free_memory`, value('142336'), {
          friendly_name: name('Free memory'),
          unit_of_measurement: 'B',
          device_class: 'data_size',
        }),
      );
      put(
        entity(`sensor.${strip.key}_ip`, value(`192.168.1.${40 + strips.indexOf(strip)}`), {
          friendly_name: name('IP'),
        }),
      );
      put(
        entity(
          `sensor.${strip.key}_uptime`,
          value(new Date(Date.parse(NOW) - strip.bootHoursAgo * 3600_000).toISOString()),
          { friendly_name: name('Uptime'), device_class: 'timestamp' },
        ),
      );
      put(
        entity(`button.${strip.key}_restart`, value('unknown'), {
          friendly_name: name('Restart'),
          device_class: 'restart',
        }),
      );
      put(
        entity(
          `update.${strip.key}_firmware`,
          value(strip.firmware === LATEST_FIRMWARE ? 'off' : 'on'),
          {
            friendly_name: name('Firmware'),
            installed_version: strip.firmware,
            latest_version: LATEST_FIRMWARE,
          },
        ),
      );
    }
    put(
      entity('sensor.salon_temperature', '21.4', {
        friendly_name: 'Salon Température',
        unit_of_measurement: '°C',
        device_class: 'temperature',
      }),
    );
    // Status sensors keep their own change time; services and setState replace them.
    for (const sensor of statusSensors) {
      if (!next[sensor.entity_id]) put(sensor);
    }

    const online = strips.filter((s) => s.online);
    const lit = online.filter((s) => s.on);
    const first = lit[0];
    const brightness = lit.length
      ? Math.round(lit.reduce((sum, s) => sum + s.brightness, 0) / lit.length)
      : null;
    put(
      entity(GROUP_ID, online.length === 0 ? 'unavailable' : lit.length ? 'on' : 'off', {
        friendly_name: 'Salon LEDs',
        entity_id: strips.map((s) => `light.${s.key}`),
        supported_color_modes: ['rgb'],
        color_mode: first ? 'rgb' : null,
        brightness,
        hs_color: first ? [first.hue, first.saturation] : null,
        rgb_color: first ? hsToRgb(first.hue, first.saturation) : null,
        effect_list: EFFECTS,
        effect: first ? first.effect : null,
        icon: 'mdi:led-strip-variant',
      }),
    );
    for (const spot of spots) {
      put(
        entity(`light.${spot.key}`, spot.on ? 'on' : 'off', {
          friendly_name: spot.name,
          supported_color_modes: ['color_temp'],
          color_mode: spot.on ? 'color_temp' : null,
          brightness: spot.on ? spot.brightness : null,
          color_temp_kelvin: spot.on ? spot.kelvin : null,
          min_color_temp_kelvin: 2200,
          max_color_temp_kelvin: 6500,
          icon: 'mdi:ceiling-light',
        }),
      );
      if (spot.powerSensor) {
        put(
          entity(
            spot.powerSensor,
            (spot.on ? 0.4 + 5.6 * (spot.brightness / 255) : 0.4).toFixed(1),
            {
              friendly_name: `${spot.name} Power`,
              unit_of_measurement: 'W',
              device_class: 'power',
              state_class: 'measurement',
            },
          ),
        );
      }
    }
    const litSpots = spots.filter((s) => s.on);
    put(
      entity(SPOTS_GROUP_ID, litSpots.length ? 'on' : 'off', {
        friendly_name: 'Cuisine Spots',
        entity_id: spots.map((s) => `light.${s.key}`),
        supported_color_modes: ['color_temp'],
        color_mode: litSpots.length ? 'color_temp' : null,
        brightness: litSpots.length
          ? Math.round(litSpots.reduce((sum, s) => sum + s.brightness, 0) / litSpots.length)
          : null,
        color_temp_kelvin: litSpots[0]?.kelvin ?? null,
        min_color_temp_kelvin: 2200,
        max_color_temp_kelvin: 6500,
        icon: 'mdi:ceiling-light-multiple',
      }),
    );
    for (const lamp of lamps) {
      put(
        entity(`light.${lamp.key}`, lamp.on ? 'on' : 'off', {
          friendly_name: lamp.name,
          supported_color_modes: ['color_temp'],
          color_mode: lamp.on ? 'color_temp' : null,
          brightness: lamp.on ? lamp.brightness : null,
          color_temp_kelvin: lamp.on ? lamp.kelvin : null,
          min_color_temp_kelvin: 2200,
          max_color_temp_kelvin: 6500,
        }),
      );
    }
    const litLamps = lamps.filter((l) => l.on);
    put(
      entity(LAMPS_GROUP_ID, litLamps.length ? 'on' : 'off', {
        friendly_name: 'Salon Lampes',
        entity_id: lamps.map((l) => `light.${l.key}`),
        supported_color_modes: ['color_temp'],
        color_mode: litLamps.length ? 'color_temp' : null,
        brightness: litLamps.length
          ? Math.round(litLamps.reduce((sum, l) => sum + l.brightness, 0) / litLamps.length)
          : null,
        color_temp_kelvin: litLamps[0]?.kelvin ?? null,
        icon: 'mdi:lamps',
      }),
    );
    for (const plug of plugs) {
      put(
        entity(`switch.${plug.key}`, plug.on ? 'on' : 'off', {
          friendly_name: plug.name,
          device_class: 'outlet',
        }),
      );
    }
    for (const plug of lampPlugs) {
      const changed = new Date(plug.changed).toISOString();
      put({
        entity_id: `switch.${plug.key}`,
        state: plug.on ? 'on' : 'off',
        attributes: { friendly_name: plug.name, device_class: 'outlet', icon: plug.icon },
        last_changed: changed,
        last_updated: changed,
      });
      put({
        entity_id: `sensor.${plug.key}_power`,
        state: String(plug.on ? plug.watts : 0),
        attributes: {
          friendly_name: `${plug.name} Puissance`,
          device_class: 'power',
          unit_of_measurement: 'W',
          state_class: 'measurement',
        },
        last_changed: changed,
        last_updated: changed,
      });
    }
    put(
      entity(LAMP_PLUGS_GROUP_ID, lampPlugs.some((p) => p.on) ? 'on' : 'off', {
        friendly_name: 'Lampes',
        entity_id: lampPlugs.map((p) => `switch.${p.key}`),
        icon: 'mdi:lamps',
      }),
    );
    put(
      entity(LAMP_SCENE_ID, new Date(sceneActivated).toISOString(), {
        friendly_name: 'Salon Soirée',
        entity_id: ['switch.salon_lustre', 'switch.salon_lampadaire'],
        icon: 'mdi:sofa',
      }),
    );
    put(
      entity('input_number.prix_kwh', '0.2516', {
        friendly_name: 'Prix du kWh',
        unit_of_measurement: 'EUR/kWh',
        min: 0,
        max: 1,
        step: 0.0001,
      }),
    );
    put(
      entity(PLUGS_GROUP_ID, plugs.some((p) => p.on) ? 'on' : 'off', {
        friendly_name: 'Chambre Lampes',
        entity_id: plugs.map((p) => `switch.${p.key}`),
        icon: 'mdi:lamps',
      }),
    );
    states = next;
  };

  let hass: HomeAssistant;
  const publish = (): void => {
    rebuild();
    hass = { ...hass, states };
    for (const listener of listeners) listener(hass);
  };

  const targets = (target: ServiceTarget | undefined): string[] => {
    const ids = target?.entity_id;
    const list = Array.isArray(ids) ? ids : ids ? [ids] : [];
    return list.flatMap((id) =>
      id === GROUP_ID
        ? strips.map((s) => `light.${s.key}`)
        : id === SPOTS_GROUP_ID
          ? spots.map((s) => `light.${s.key}`)
          : id === LAMPS_GROUP_ID
            ? lamps.map((l) => `light.${l.key}`)
            : [id],
    );
  };

  /** A strip or a spot: both share `on` and `brightness`. */
  type Light = Pick<StripSpec, 'on' | 'brightness'> & Partial<StripSpec> & Partial<SpotSpec>;
  const stripFor = (entityId: string): Light | undefined =>
    strips.find((s) => entityId === `light.${s.key}` || entityId.includes(`.${s.key}_`)) ??
    spots.find((s) => entityId === `light.${s.key}`) ??
    lamps.find((l) => entityId === `light.${l.key}`);

  const callService: HomeAssistant['callService'] = async (domain, service, data = {}, target) => {
    calls.push({ domain, service, data, target });
    if (domain === 'scene' && service === 'turn_on') {
      if ([target?.entity_id].flat().includes(LAMP_SCENE_ID)) {
        const wanted = ['salon_lustre', 'salon_lampadaire'];
        for (const plug of lampPlugs) {
          const on = wanted.includes(plug.key);
          if (plug.on !== on) {
            plug.on = on;
            plug.changed = Date.now();
          }
        }
        sceneActivated = Date.now();
      }
      publish();
      return;
    }
    const lampIds = [target?.entity_id]
      .flat()
      .flatMap((id) =>
        id === LAMP_PLUGS_GROUP_ID ? lampPlugs.map((p) => `switch.${p.key}`) : [id],
      );
    const lampsHit = lampPlugs.filter((p) => lampIds.includes(`switch.${p.key}`));
    if (lampsHit.length) {
      const anyOn = lampsHit.some((p) => p.on);
      for (const plug of lampsHit) {
        const on =
          service === 'toggle' ? (lampsHit.length > 1 ? !anyOn : !plug.on) : service === 'turn_on';
        if (plug.on !== on) {
          plug.on = on;
          plug.changed = Date.now();
        }
      }
      publish();
      return;
    }
    const plugIds = [target?.entity_id]
      .flat()
      .flatMap((id) => (id === PLUGS_GROUP_ID ? plugs.map((p) => `switch.${p.key}`) : [id]));
    const plugsHit = plugs.filter((p) => plugIds.includes(`switch.${p.key}`));
    if (plugsHit.length) {
      const anyPlugOn = plugsHit.some((p) => p.on);
      for (const plug of plugsHit) {
        plug.on =
          service === 'toggle'
            ? plugsHit.length > 1
              ? !anyPlugOn
              : !plug.on
            : service === 'turn_on';
      }
      publish();
      return;
    }
    const ids = targets(target);
    const groupToggle = [GROUP_ID, SPOTS_GROUP_ID, LAMPS_GROUP_ID].includes(
      String(target?.entity_id),
    );
    const anyOn = ids.some((id) => stripFor(id)?.on);
    for (const id of ids) {
      const strip = stripFor(id);
      if (!strip || strip.online === false) continue;
      const option = String(data.option);
      if (domain === 'select' && service === 'select_option') {
        if (id.endsWith('_live_override')) strip.override = option as StripSpec['override'];
        else if (id.endsWith('_preset')) strip.preset = option;
        else if (id.endsWith('_playlist')) strip.playlist = option;
        else if (id.endsWith('_color_palette')) strip.palette = option;
        continue;
      }
      if (domain === 'number' && service === 'set_value') {
        if (id.endsWith('_speed')) strip.speed = Number(data.value);
        else if (id.endsWith('_intensity')) strip.intensity = Number(data.value);
        continue;
      }
      if (domain === 'switch') {
        const flip = (on: boolean | undefined) =>
          service === 'toggle' ? !on : service === 'turn_on';
        if (id.endsWith('_nightlight')) strip.nightlight = flip(strip.nightlight);
        else if (id.endsWith('_reverse')) strip.reverse = flip(strip.reverse);
        else if (id.endsWith('_freeze')) strip.freeze = flip(strip.freeze);
        else if (id.endsWith('_sync_send')) strip.syncSend = flip(strip.syncSend);
        else if (id.endsWith('_sync_receive')) strip.syncReceive = flip(strip.syncReceive);
        continue;
      }
      if (domain === 'button') continue;
      if (service === 'toggle') {
        strip.on = groupToggle ? !anyOn : !strip.on;
        if (strip.on && strip.brightness === 0) strip.brightness = 180;
      } else if (service === 'turn_off') {
        strip.on = false;
      } else if (service === 'turn_on') {
        strip.on = true;
        if (typeof data.brightness_pct === 'number') {
          strip.brightness = Math.round((data.brightness_pct / 100) * 255);
        } else if (strip.brightness === 0) {
          strip.brightness = 180;
        }
        if (Array.isArray(data.rgb_color)) {
          [strip.hue, strip.saturation] = rgbToHs(data.rgb_color as Rgb);
        }
        if (Array.isArray(data.hs_color)) {
          strip.hue = Number(data.hs_color[0]);
          strip.saturation = Number(data.hs_color[1]);
        }
        if (typeof data.effect === 'string') strip.effect = data.effect;
        if (typeof data.color_temp_kelvin === 'number') strip.kelvin = data.color_temp_kelvin;
      }
    }
    publish();
  };

  /**
   * Synthetic history: lights on in the evening, at their current level, idle
   * the rest of the day; one reading every ten minutes.
   */
  const history = (entityIds: string[], start: number, end: number) => {
    const result: Record<string, { s: string; lu: number }[]> = {};
    for (const entityId of entityIds) {
      const state = states[entityId];
      if (!state) continue;
      const plug = lampPlugs.find(
        (p) => entityId === `switch.${p.key}` || entityId === `sensor.${p.key}_power`,
      );
      if (plug) {
        // Evenings and a morning hour, then the current state since its last change.
        const seed = plug.key.length % 5;
        const spans: [number, number][] = [
          [6.5 + seed * 0.2, 8 + seed * 0.3],
          [11.5 + seed * 0.4, 13.5 + seed * 0.3],
        ];
        const day = new Date(start);
        day.setHours(0, 0, 0, 0);
        const changes: { on: boolean; t: number }[] = [{ on: false, t: start }];
        for (const [from, to] of spans) {
          const a = day.getTime() + from * 3_600_000;
          const b = day.getTime() + to * 3_600_000;
          if (b < plug.changed && a > start) {
            changes.push({ on: true, t: a }, { on: false, t: b });
          }
        }
        changes.push({ on: plug.on, t: Math.max(plug.changed, start) });
        const isPower = entityId.startsWith('sensor.');
        result[entityId] = changes
          .filter((change) => change.t <= end)
          .map((change) => ({
            s: isPower ? String(change.on ? plug.watts : 0) : change.on ? 'on' : 'off',
            lu: change.t / 1000,
          }));
        continue;
      }
      if (entityId.startsWith('binary_sensor.')) {
        // Presence-like pattern: on for a while every couple of hours, ending in the current state.
        const points: { s: string; lu: number }[] = [{ s: 'off', lu: start / 1000 }];
        const seed = entityId.length % 7;
        for (let time = start + seed * 600_000; time < end - 30 * 60_000; time += 110 * 60_000) {
          points.push({ s: 'on', lu: time / 1000 });
          points.push({ s: 'off', lu: (time + (25 + seed * 2) * 60_000) / 1000 });
        }
        const changed = Date.parse(state.last_changed);
        if (changed > start) points.push({ s: state.state, lu: changed / 1000 });
        result[entityId] = points;
        continue;
      }
      const current = Number.parseFloat(state.state);
      const idle = entityId.endsWith('_estimated_current')
        ? 360
        : entityId.includes('spot')
          ? 0.4
          : IDLE_WATTS;
      const points: { s: string; lu: number }[] = [];
      for (let time = start; time <= end; time += 10 * 60_000) {
        const hour = new Date(time).getHours() + new Date(time).getMinutes() / 60;
        const evening = hour >= 18 || hour < 0.5 || (hour >= 7 && hour < 8);
        const wave = 0.75 + 0.25 * Math.sin(time / 1_700_000 + entityId.length);
        const value = !Number.isFinite(current)
          ? 'unavailable'
          : String(Math.round((evening ? Math.max(current, idle * 4) * wave : idle) * 10) / 10);
        points.push({ s: value, lu: time / 1000 });
      }
      result[entityId] = points;
    }
    return result;
  };

  /** Hourly means of the synthetic history, like the recorder's statistics. */
  const statistics = (entityIds: string[], start: number, end: number) => {
    const raw = history(entityIds, start, end);
    const result: Record<string, { start: number; end: number; mean: number }[]> = {};
    for (const [entityId, points] of Object.entries(raw)) {
      const hours = new Map<number, number[]>();
      for (const point of points) {
        const value = Number.parseFloat(point.s);
        if (!Number.isFinite(value)) continue;
        const hour = Math.floor((point.lu * 1000) / 3_600_000) * 3_600_000;
        hours.set(hour, [...(hours.get(hour) ?? []), value]);
      }
      result[entityId] = [...hours.entries()]
        .filter(([hour]) => hour + 3_600_000 <= end)
        .map(([hour, values]) => ({
          start: hour,
          end: hour + 3_600_000,
          mean: values.reduce((sum, value) => sum + value, 0) / values.length,
        }));
    }
    return result;
  };

  const callWS = async <T>(message: Record<string, unknown>): Promise<T> => {
    if (message.type === 'recorder/statistics_during_period') {
      return statistics(
        (message.statistic_ids as string[]) ?? [],
        Date.parse(String(message.start_time)),
        Date.parse(String(message.end_time)),
      ) as T;
    }
    if (message.type !== 'history/history_during_period') throw new Error('unsupported');
    return history(
      (message.entity_ids as string[]) ?? [],
      Date.parse(String(message.start_time)),
      Date.parse(String(message.end_time)),
    ) as T;
  };

  rebuild();
  hass = {
    states,
    entities,
    devices,
    language,
    locale: { language },
    themes: { darkMode: true },
    config: { currency: 'EUR', time_zone: 'Europe/Paris' },
    callService,
    callWS,
  };

  return {
    get hass() {
      return hass;
    },
    calls,
    subscribe(listener) {
      listeners.add(listener);
      listener(hass);
      return () => listeners.delete(listener);
    },
    setState(entityId, state, attributes, minutesAgo) {
      const current = states[entityId];
      const next = entity(entityId, state, attributes ?? current?.attributes ?? {});
      if (minutesAgo !== undefined) {
        next.last_changed = new Date(Date.now() - minutesAgo * 60_000).toISOString();
        next.last_updated = next.last_changed;
      }
      states = { ...states, [entityId]: next };
      hass = { ...hass, states };
      for (const listener of listeners) listener(hass);
    },
  };
}
