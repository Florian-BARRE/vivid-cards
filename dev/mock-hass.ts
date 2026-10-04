/**
 * In-memory Home Assistant used by the preview page and the unit tests.
 * Models a living room with three WLED strips grouped in `light.salon_leds`
 * (device registry, live override selects, estimated current and template power
 * sensors) and a kitchen with two tunable white spots grouped in
 * `light.cuisine_spots` (no WLED; only the second one has a power sensor, on its
 * device). Service calls mutate the state and publish a new `hass` snapshot.
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
}

const STRIPS: StripSpec[] = [
  {
    key: 'salon_ambilight_wled',
    online: false,
    on: false,
    brightness: 0,
    hue: 0,
    saturation: 0,
    effect: 'Solid',
    override: '0',
  },
  {
    key: 'salon_buffet_wled',
    online: true,
    on: true,
    brightness: 200,
    hue: 28,
    saturation: 78,
    effect: 'Solid',
    override: '1',
  },
  {
    key: 'salon_canape_wled',
    online: true,
    on: true,
    brightness: 90,
    hue: 268,
    saturation: 85,
    effect: 'Breathe',
    override: '0',
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

const NOW = new Date('2026-10-04T18:00:00Z').toISOString();
/** Watts drawn by the ESP and the strip at 0 % / 100 % brightness. */
const IDLE_WATTS = 1.8;
const FULL_WATTS = 34;
const VOLTAGE = 5;

function entity(entityId: string, state: string, attributes: HassEntity['attributes']): HassEntity {
  return { entity_id: entityId, state, attributes, last_changed: NOW, last_updated: NOW };
}

function friendly(key: string): string {
  return key.replaceAll('_', '-');
}

export interface MockHass {
  readonly hass: HomeAssistant;
  readonly calls: { domain: string; service: string; data: unknown; target: unknown }[];
  subscribe(listener: (hass: HomeAssistant) => void): () => void;
  setState(entityId: string, state: string, attributes?: HassEntity['attributes']): void;
}

export function createMockHass(language = 'en'): MockHass {
  const strips = STRIPS.map((spec) => ({ ...spec }));
  const spots = SPOTS.map((spec) => ({ ...spec }));
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
    // Template sensor created by the user: not attached to the WLED device.
    entities[`sensor.${strip.key}_puissance`] = {
      entity_id: `sensor.${strip.key}_puissance`,
      platform: 'template',
      labels: [],
    };
  }
  entities[GROUP_ID] = { entity_id: GROUP_ID, platform: 'group', labels: [] };
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

  let states: Record<string, HassEntity> = {};

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
      put(
        entity(`select.${strip.key}_preset`, strip.online ? 'unknown' : 'unavailable', {
          friendly_name: `${friendly(strip.key)} Preset`,
          options: ['Movie', 'Evening'],
        }),
      );
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
          : [id],
    );
  };

  /** A strip or a spot: both share `on` and `brightness`. */
  type Light = Pick<StripSpec, 'on' | 'brightness'> & Partial<StripSpec> & Partial<SpotSpec>;
  const stripFor = (entityId: string): Light | undefined =>
    strips.find((s) => entityId === `light.${s.key}` || entityId.startsWith(`select.${s.key}_`)) ??
    spots.find((s) => entityId === `light.${s.key}`);

  const callService: HomeAssistant['callService'] = async (domain, service, data = {}, target) => {
    calls.push({ domain, service, data, target });
    const ids = targets(target);
    const groupToggle = target?.entity_id === GROUP_ID || target?.entity_id === SPOTS_GROUP_ID;
    const anyOn = ids.some((id) => stripFor(id)?.on);
    for (const id of ids) {
      const strip = stripFor(id);
      if (!strip || strip.online === false) continue;
      if (domain === 'select' && service === 'select_option') {
        strip.override = String(data.option) as StripSpec['override'];
        continue;
      }
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

  rebuild();
  hass = {
    states,
    entities,
    devices,
    language,
    locale: { language },
    themes: { darkMode: true },
    callService,
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
    setState(entityId, state, attributes) {
      const current = states[entityId];
      states = {
        ...states,
        [entityId]: entity(entityId, state, attributes ?? current?.attributes ?? {}),
      };
      hass = { ...hass, states };
      for (const listener of listeners) listener(hass);
    },
  };
}
