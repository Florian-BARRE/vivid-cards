/**
 * Climate sensors layered over the simulated Home Assistant for the badge
 * preview and the tests: a bathroom (BME280-like temperature, humidity and
 * pressure, and a CO₂ sensor), a five-room temperature group, sensors across
 * every scale and a text illuminance sensor. Their history is synthetic and
 * shaped so trends, a shower and a pressure drop show.
 */
import type { HassEntity, HomeAssistant } from '../src/core/hass-types';

export const SDB_TEMPERATURE = 'sensor.sdb_temperature';
export const SDB_HUMIDITY = 'sensor.sdb_humidite';
export const SDB_PRESSURE = 'sensor.sdb_pression';
export const SDB_CO2 = 'sensor.sdb_co2';
export const SDB_ILLUMINANCE = 'sensor.sdb_eclairement';
export const TEMPERATURES_GROUP = 'sensor.all_temperatures';
export const HUMIDITY_GROUP = 'sensor.all_humidites';
export const CO2_GROUP = 'sensor.all_co2';
export const FAHRENHEIT = 'sensor.garage_temperature';

interface Spec {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
  deviceClass: string;
  /** Value at `minutes` ago (the history); a gentle wave around the current value otherwise. */
  past?: (minutesAgo: number) => number;
}

const ramp =
  (from: number, to: number, span: number) =>
  (minutesAgo: number): number =>
    minutesAgo >= span ? from : to + ((from - to) * minutesAgo) / span;

const SPECS: Spec[] = [
  {
    id: SDB_TEMPERATURE,
    name: 'Salle de bain Température',
    value: 21.8,
    unit: '°C',
    deviceClass: 'temperature',
    past: ramp(20.9, 21.8, 60),
  },
  {
    id: SDB_HUMIDITY,
    name: 'Salle de bain Humidité',
    value: 88,
    unit: '%',
    deviceClass: 'humidity',
    // A shower started twelve minutes ago.
    past: ramp(55, 88, 12),
  },
  {
    id: SDB_PRESSURE,
    name: 'Salle de bain Pression',
    value: 1002,
    unit: 'hPa',
    deviceClass: 'atmospheric_pressure',
    past: ramp(1006.5, 1002, 180),
  },
  {
    id: SDB_CO2,
    name: 'Salle de bain CO2',
    value: 1250,
    unit: 'ppm',
    deviceClass: 'carbon_dioxide',
  },
  {
    id: 'sensor.chambre_temperature',
    name: 'Chambre Température',
    value: 17.9,
    unit: '°C',
    deviceClass: 'temperature',
    past: ramp(18.6, 17.9, 60),
  },
  {
    id: 'sensor.bureau_temperature',
    name: 'Bureau Température',
    value: 22.7,
    unit: '°C',
    deviceClass: 'temperature',
  },
  {
    id: 'sensor.cuisine_temperature',
    name: 'Cuisine Température',
    value: 20.6,
    unit: '°C',
    deviceClass: 'temperature',
  },
  {
    id: 'sensor.salon_humidite',
    name: 'Salon Humidité',
    value: 47,
    unit: '%',
    deviceClass: 'humidity',
  },
  {
    id: 'sensor.chambre_humidite',
    name: 'Chambre Humidité',
    value: 58,
    unit: '%',
    deviceClass: 'humidity',
  },
  {
    id: 'sensor.salon_co2',
    name: 'Salon CO2',
    value: 620,
    unit: 'ppm',
    deviceClass: 'carbon_dioxide',
  },
  {
    id: 'sensor.bureau_co2',
    name: 'Bureau CO2',
    value: 1150,
    unit: 'ppm',
    deviceClass: 'carbon_dioxide',
  },
  {
    id: FAHRENHEIT,
    name: 'Garage Temperature',
    value: 59.4,
    unit: '°F',
    deviceClass: 'temperature',
    past: ramp(61, 59.4, 60),
  },
  {
    id: SDB_ILLUMINANCE,
    name: 'Salle de bain Éclairement',
    value: 'bright',
    deviceClass: 'illuminance',
  },
  // Values across each scale.
  ...[15.2, 18.4, 21.0, 24.1, 27.3].map((value, index) => ({
    id: `sensor.demo_temperature_${index}`,
    name: `Démo ${value} °C`,
    value,
    unit: '°C',
    deviceClass: 'temperature',
    past: index === 0 ? ramp(16, value, 60) : index === 3 ? ramp(23.3, value, 60) : undefined,
  })),
  ...[28, 47, 58, 72].map((value, index) => ({
    id: `sensor.demo_humidity_${index}`,
    name: `Démo ${value} %`,
    value,
    unit: '%',
    deviceClass: 'humidity',
  })),
  ...[988, 1008, 1022, 1034].map((value, index) => ({
    id: `sensor.demo_pressure_${index}`,
    name: `Démo ${value} hPa`,
    value,
    unit: 'hPa',
    deviceClass: 'atmospheric_pressure',
    past: index === 0 ? ramp(990.5, value, 180) : index === 2 ? ramp(1020, value, 180) : undefined,
  })),
  ...[520, 880, 1700, 2400].map((value, index) => ({
    id: `sensor.demo_co2_${index}`,
    name: `Démo ${value} ppm`,
    value,
    unit: 'ppm',
    deviceClass: 'carbon_dioxide',
  })),
  ...['dim', 'dark'].map((value) => ({
    id: `sensor.demo_light_${value}`,
    name: `Démo ${value}`,
    value,
    deviceClass: 'illuminance',
  })),
];

const GROUPS: [string, string, string, string[], string][] = [
  [
    TEMPERATURES_GROUP,
    'Températures du logement',
    'temperature',
    [
      'sensor.salon_temperature',
      'sensor.chambre_temperature',
      'sensor.bureau_temperature',
      'sensor.cuisine_temperature',
      SDB_TEMPERATURE,
    ],
    '°C',
  ],
  [
    HUMIDITY_GROUP,
    'Humidité du logement',
    'humidity',
    ['sensor.salon_humidite', 'sensor.chambre_humidite', 'sensor.demo_humidity_0'],
    '%',
  ],
  [
    CO2_GROUP,
    'Air du logement',
    'carbon_dioxide',
    ['sensor.salon_co2', 'sensor.bureau_co2'],
    'ppm',
  ],
];

function climateStates(now: number): Record<string, HassEntity> {
  const changed = new Date(now - 2 * 60_000).toISOString();
  const states: Record<string, HassEntity> = {};
  for (const spec of SPECS) {
    states[spec.id] = {
      entity_id: spec.id,
      state: String(spec.value),
      attributes: {
        friendly_name: spec.name,
        device_class: spec.deviceClass,
        ...(spec.unit ? { unit_of_measurement: spec.unit, state_class: 'measurement' } : {}),
      },
      last_changed: changed,
      last_updated: changed,
    };
  }
  for (const [id, name, deviceClass, ids, unit] of GROUPS) {
    states[id] = {
      entity_id: id,
      state: '0',
      attributes: {
        friendly_name: name,
        device_class: deviceClass,
        unit_of_measurement: unit,
        entity_id: ids,
      },
      last_changed: changed,
      last_updated: changed,
    };
  }
  return states;
}

/** A reading every ten minutes (every minute over the last half hour). */
function series(
  current: number,
  past: ((minutesAgo: number) => number) | undefined,
  seed: number,
  start: number,
  end: number,
  now: number,
) {
  const points: { s: string; lu: number }[] = [];
  let time = start;
  while (time <= end) {
    const minutesAgo = (now - time) / 60_000;
    const amplitude = current > 500 ? 0.3 : Math.max(0.3, Math.abs(current) * 0.004);
    const wave = Math.sin(time / 5_400_000 + seed) * amplitude;
    const value = past ? past(minutesAgo) : current + wave * Math.min(1, minutesAgo / 90);
    points.push({ s: String(Math.round(value * 100) / 100), lu: time / 1000 });
    time += minutesAgo > 30 ? 10 * 60_000 : 60_000;
  }
  points.push({ s: String(current), lu: end / 1000 });
  return points;
}

const CLIMATE_CLASSES = ['temperature', 'humidity', 'atmospheric_pressure', 'carbon_dioxide'];

const layered = new WeakMap<HomeAssistant, HomeAssistant>();
let shared: Record<string, HassEntity> | undefined;

/** The simulated Home Assistant with the climate sensors and their history. */
export function withClimate(hass: HomeAssistant): HomeAssistant {
  const cached = layered.get(hass);
  if (cached) return cached;
  const now = Date.now();
  shared ??= climateStates(now);
  const extra = shared;
  const states = { ...hass.states, ...extra };
  // Every climate sensor, the ones of the base mock included (salon).
  const isClimate = (id: string) =>
    CLIMATE_CLASSES.includes(String(states[id]?.attributes.device_class)) &&
    Number.isFinite(Number.parseFloat(states[id]?.state ?? ''));
  const callWS = async <T>(message: Record<string, unknown>): Promise<T> => {
    const ids = (message.entity_ids as string[] | undefined) ?? [];
    const ours = ids.filter(isClimate);
    if (message.type !== 'history/history_during_period' || ours.length === 0) {
      if (!hass.callWS) throw new Error('unsupported');
      return hass.callWS<T>(message);
    }
    const others = ids.filter((id) => !isClimate(id));
    const base =
      others.length && hass.callWS
        ? await hass.callWS<Record<string, unknown>>({ ...message, entity_ids: others })
        : {};
    const start = Date.parse(String(message.start_time));
    const end = Date.parse(String(message.end_time));
    const result: Record<string, unknown> = { ...base };
    for (const id of ours) {
      const spec = SPECS.find((item) => item.id === id);
      const current = Number.parseFloat(states[id]?.state ?? '');
      result[id] = series(current, spec?.past, id.length, start, end, Date.now());
    }
    return result as T;
  };
  const next: HomeAssistant = { ...hass, states, callWS };
  layered.set(hass, next);
  return next;
}
