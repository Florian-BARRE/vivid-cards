/**
 * A simulated "Salon Air Station" (ESPHome, SCD4x + ST7789 + 28 WS2812) for
 * the preview page and the tests: its switches, select, numbers and buttons
 * behave like the firmware (v7).
 */
import { DEFAULT_PREFIX, ENTITY_SUFFIXES, entityMap } from '../src/cards/air-station/config';
import type { HassEntity, HomeAssistant } from '../src/core/hass-types';
import { climateHistory, climateStatistics, climateValue } from './climate-chart-mock';

export const AIR_IDS = entityMap(DEFAULT_PREFIX);
export const AIR_DEVICE = 'device_air_station';

/** The station's readings have the history of the living room sensors of the climate mock. */
const HISTORY_OF: Record<string, string> = {
  [AIR_IDS.co2]: 'sensor.salon_co2',
  [AIR_IDS.temperature]: 'sensor.salon_temperature',
  [AIR_IDS.humidity]: 'sensor.salon_humidite',
};

export const EFFECTS = [
  'Aurora',
  'CO2 Comet',
  'Thermal Plasma',
  'Ocean Wave',
  'Boot Chase',
  'Galaxy Spin',
  'Custom Color',
  'Alert Strobe',
];

export interface AirStationScenario {
  co2?: number;
  temperature?: number;
  humidity?: number;
  /** The room is dark: night mode. */
  night?: boolean;
  /** Station Power off (frame and screen dark). */
  off?: boolean;
  offline?: boolean;
  /** LED Sync off, with this effect picked. */
  effect?: string;
  autoBrightness?: boolean;
  page?: string;
  language?: string;
}

export interface AirStationMock {
  readonly hass: HomeAssistant;
  readonly calls: { domain: string; service: string; data: unknown; target: unknown }[];
  subscribe(listener: (hass: HomeAssistant) => void): () => void;
  setState(entityId: string, state: string, attributes?: HassEntity['attributes']): void;
}

const ids = AIR_IDS;
const PAGES = ['data', 'co2', 'temp', 'hum', 'config'];
const PAGE_BUTTONS: Record<string, string> = {
  [ids.pageData]: 'data',
  [ids.pageCo2]: 'co2',
  [ids.pageTemperature]: 'temp',
  [ids.pageHumidity]: 'hum',
  [ids.pageConfig]: 'config',
};

export function createAirStationMock(scenario: AirStationScenario = {}): AirStationMock {
  const language = scenario.language ?? 'en';
  const listeners = new Set<(hass: HomeAssistant) => void>();
  const calls: AirStationMock['calls'] = [];
  let states: Record<string, HassEntity> = {};
  const now = new Date().toISOString();
  const offline = scenario.offline === true;

  const put = (entityId: string, state: string, attributes: HassEntity['attributes'] = {}) => {
    const previous = states[entityId];
    states = {
      ...states,
      [entityId]: {
        entity_id: entityId,
        state,
        attributes: { ...(previous?.attributes ?? {}), ...attributes },
        last_changed: now,
        last_updated: new Date().toISOString(),
      },
    };
  };
  const value = (state: string) => (offline ? 'unavailable' : state);
  const reading = (id: string, fallback: number) =>
    climateValue(HISTORY_OF[id] ?? '', Date.now()) ?? fallback;

  const co2 = scenario.co2 ?? Math.round(reading(ids.co2, 612));
  const temperature = scenario.temperature ?? Math.round(reading(ids.temperature, 21.4) * 10) / 10;
  const humidity = scenario.humidity ?? Math.round(reading(ids.humidity, 48));
  const thresholds = { excellent: 600, good: 800, watch: 1000, alert: 1200 };
  const comfort = () => {
    const ok =
      (co2 < thresholds.good ? 1 : 0) +
      (temperature >= 18 && temperature <= 24 ? 1 : 0) +
      (humidity >= 40 && humidity <= 60 ? 1 : 0);
    return ['INCONFORT', 'MOYEN', 'BON', 'EXCELLENT'][ok] ?? 'INCONFORT';
  };
  const advice = () => {
    if (co2 > thresholds.alert) return 'AEREZ MAINTENANT';
    if (co2 > thresholds.watch) return 'Aeration necessaire';
    if (co2 > thresholds.good) return 'Air en degradation';
    if (co2 < thresholds.excellent) return 'Air excellent';
    return 'Qualite acceptable';
  };
  const dewPoint = Math.round((temperature - (100 - humidity) / 5) * 10) / 10;

  for (const id of Object.values(ids)) put(id, value('unknown'));
  put(ids.online, offline ? 'off' : 'on', { device_class: 'connectivity' });
  put(ids.co2, value(String(co2)), { unit_of_measurement: 'ppm', device_class: 'carbon_dioxide' });
  put(ids.temperature, value(String(temperature)), {
    unit_of_measurement: '°C',
    device_class: 'temperature',
  });
  put(ids.humidity, value(String(humidity)), {
    unit_of_measurement: '%',
    device_class: 'humidity',
  });
  put(ids.dewPoint, value(String(dewPoint)), { unit_of_measurement: '°C' });
  put(ids.comfort, value(comfort()));
  put(ids.advice, value(advice()));
  put(ids.alert, value(co2 > thresholds.alert ? 'on' : 'off'), { device_class: 'problem' });
  put(ids.night, value(scenario.night ? 'on' : 'off'));
  put(ids.ldr, value(scenario.night ? '120' : '1840'), { unit_of_measurement: 'raw' });
  put(ids.uptime, value(String(3 * 86400 + 4 * 3600 + 12 * 60)), { unit_of_measurement: 's' });
  put(ids.rssi, value('-59'), { unit_of_measurement: 'dBm' });
  put(ids.ip, value('10.0.0.155'));
  put(ids.ssid, value('Maison_IoT'));
  put(ids.page, value(scenario.page ?? 'co2'));

  const switches: Record<string, boolean> = {
    [ids.power]: !scenario.off,
    [ids.backlight]: !scenario.off,
    [ids.autoCycle]: true,
    [ids.ledSync]: scenario.effect === undefined,
    [ids.autoBrightness]: scenario.autoBrightness ?? true,
  };
  for (const [id, on] of Object.entries(switches)) put(id, value(on ? 'on' : 'off'));
  put(ids.effect, value(scenario.effect ?? 'Aurora'), { options: EFFECTS });

  const numbers: [string, number, number, number, number, string?][] = [
    [ids.pageDuration, 8, 5, 60, 1, 's'],
    [ids.co2Excellent, thresholds.excellent, 300, 800, 10, 'ppm'],
    [ids.co2Good, thresholds.good, 400, 1100, 10, 'ppm'],
    [ids.co2Watch, thresholds.watch, 500, 1400, 10, 'ppm'],
    [ids.co2Alert, thresholds.alert, 600, 2000, 10, 'ppm'],
    [ids.tempMin, 18, 10, 25, 0.5, '°C'],
    [ids.tempMax, 24, 15, 35, 0.5, '°C'],
    [ids.humMin, 40, 10, 55, 1, '%'],
    [ids.humMax, 60, 30, 90, 1, '%'],
    [ids.nightThreshold, 350, 50, 1500, 10, 'raw'],
    [ids.brightnessNight, 3, 0, 30, 1],
    [ids.brightnessMin, 8, 0, 80, 1],
    [ids.brightnessMax, 200, 50, 255, 1],
    [ids.brightnessManual, 80, 0, 255, 1],
    [ids.red, 0, 0, 255, 1],
    [ids.green, 180, 0, 255, 1],
    [ids.blue, 0, 0, 255, 1],
  ];
  for (const [id, current, min, max, step, unit] of numbers) {
    put(id, value(String(current)), { min, max, step, mode: 'slider', unit_of_measurement: unit });
  }

  /** The firmware's brightness chain (1 s interval). */
  const brightness = () => {
    if (states[ids.power]?.state !== 'on') return 0;
    const number = (id: string) => Number(states[id]?.state ?? 0);
    if (states[ids.autoBrightness]?.state !== 'on') return number(ids.brightnessManual);
    if (scenario.night) return number(ids.brightnessNight);
    return 142;
  };
  const publishBrightness = () => put(ids.ledBrightness, value(String(brightness())));
  publishBrightness();

  let hass: HomeAssistant;
  const publish = () => {
    hass = { ...hass, states };
    for (const listener of listeners) listener(hass);
  };

  const registry: HomeAssistant['entities'] = {};
  for (const id of Object.values(ids)) {
    registry[id] = { entity_id: id, device_id: AIR_DEVICE, platform: 'esphome', labels: [] };
  }

  const callService: HomeAssistant['callService'] = async (domain, service, data, target) => {
    calls.push({ domain, service, data, target });
    const entityId = String(
      Array.isArray(target?.entity_id) ? target.entity_id[0] : target?.entity_id,
    );
    if (offline) return;
    if (domain === 'switch') {
      put(entityId, service === 'turn_on' ? 'on' : 'off');
      if (entityId === ids.power) put(ids.backlight, service === 'turn_on' ? 'on' : 'off');
      publishBrightness();
    } else if (domain === 'select') {
      put(entityId, String((data as { option: string }).option));
    } else if (domain === 'number') {
      put(entityId, String((data as { value: number }).value));
      publishBrightness();
    } else if (domain === 'button') {
      const page = states[ids.page]?.state ?? 'data';
      const index = PAGES.indexOf(page);
      if (PAGE_BUTTONS[entityId]) put(ids.page, PAGE_BUTTONS[entityId]);
      else if (entityId === ids.pageNext) put(ids.page, PAGES[(index + 1) % 5] ?? 'data');
      else if (entityId === ids.pagePrevious) put(ids.page, PAGES[(index + 4) % 5] ?? 'data');
    }
    publish();
  };

  const callWS = async <T>(message: Record<string, unknown>): Promise<T> => {
    const start = Date.parse(String(message.start_time));
    const end = Date.parse(String(message.end_time));
    const asked = ((message.entity_ids ?? message.statistic_ids) as string[] | undefined) ?? [];
    await new Promise((resolve) => setTimeout(resolve, 150));
    const result: Record<string, unknown> = {};
    for (const id of asked) {
      const source = HISTORY_OF[id];
      if (!source) continue;
      const rows =
        message.type === 'recorder/statistics_during_period'
          ? climateStatistics([source], start, end)[source]
          : climateHistory([source], start, end)[source];
      if (rows) result[id] = rows;
    }
    return result as T;
  };

  hass = {
    states,
    entities: registry,
    devices: {
      [AIR_DEVICE]: {
        id: AIR_DEVICE,
        name: 'Salon Air Station',
        name_by_user: null,
        manufacturer: 'Espressif',
        model: 'esp32dev',
        area_id: 'salon',
      },
    },
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
    setState(entityId, state, attributes) {
      put(entityId, state, attributes);
      publish();
    },
  };
}

/** Every suffix, to check that the map covers the firmware. */
export const SUFFIX_COUNT = Object.keys(ENTITY_SUFFIXES).length;
