import { defineHaStubs } from './ha-stubs';
import {
  DOORS_GROUP_ID,
  GROUP_ID,
  ILLUMINANCE_GROUP_ID,
  LAMPS_GROUP_ID,
  PLUGS_GROUP_ID,
  POWER_GROUP_ID,
  PRESENCE_GROUP_ID,
  SPOTS_GROUP_ID,
  WINDOWS_GROUP_ID,
  createMockHass,
} from './mock-hass';
import type { HomeAssistant } from '../src/core/hass-types';
import {
  CO2_GROUP,
  FAHRENHEIT,
  HUMIDITY_GROUP,
  SDB_CO2,
  SDB_HUMIDITY,
  SDB_ILLUMINANCE,
  SDB_PRESSURE,
  SDB_TEMPERATURE,
  TEMPERATURES_GROUP,
  withClimate,
} from './climate-mock';
type BadgeElement = HTMLElement & {
  hass?: HomeAssistant;
  setConfig(config: Record<string, unknown>): void;
};

defineHaStubs();
await import('../src/vivid-cards');

const params = new URLSearchParams(location.search);
let language = params.get('lang') ?? 'en';
const mockOptions = { allOnline: params.get('online') === 'all' };
let mock = createMockHass(language, mockOptions);
const badges: BadgeElement[] = [];
const stage = document.getElementById('stage')!;

/** Stand-in for Home Assistant's entity badge, to compare against. */
function native(icon: string, text: string, color = 'var(--secondary-text-color)'): HTMLElement {
  const element = document.createElement('div');
  element.className = 'native';
  const glyph = document.createElement('ha-icon');
  glyph.setAttribute('icon', icon);
  glyph.style.color = color;
  element.append(glyph);
  if (text) element.append(text);
  return element;
}

function badge(config: Record<string, unknown>, tag = 'vivid-light-badge'): BadgeElement {
  const element = document.createElement(tag) as BadgeElement;
  element.setConfig({ type: `custom:${tag}`, ...config });
  badges.push(element);
  return element;
}

function row(title: string, items: HTMLElement[]): HTMLElement {
  const section = document.createElement('section');
  const heading = document.createElement('h3');
  heading.textContent = title;
  const bar = document.createElement('div');
  bar.className = 'bar';
  bar.append(...items);
  section.append(heading, bar);
  return section;
}

const looks = (params.get('looks') ?? 'disc').split(',');
const layout = params.get('layout') ?? 'list';
const halo = {
  ...(params.has('glow') ? { glow: Number(params.get('glow')) } : {}),
  ...(params.has('boost') ? { glow_boost: Number(params.get('boost')) } : {}),
  ...(params.has('zero') ? { show_zero: true } : {}),
};
for (const look of looks) {
  const block = document.createElement('div');
  if (looks.length > 1) {
    const label = document.createElement('h2');
    label.textContent = `look: ${look}`;
    block.append(label);
  }
  block.append(
    row('Salon', [
      badge({ entity: LAMPS_GROUP_ID, look, layout, ...halo }, 'vivid-lamp-badge'),
      badge({ entity: GROUP_ID, look, layout, ...halo }, 'vivid-led-badge'),
      native('mdi:window-closed-variant', '0'),
      native('mdi:weather-night', '0'),
      native('mdi:flash', '5 W', '#ffb74d'),
      native('mdi:motion-sensor', '2 min', '#64b5f6'),
      native('mdi:battery', '100 %', '#81c784'),
    ]),
    row('Chambre', [
      badge({ entity: PLUGS_GROUP_ID, look, layout, ...halo }, 'vivid-lamp-badge'),
      badge({ entity: SPOTS_GROUP_ID, look, layout, ...halo }, 'vivid-light-badge'),
      native('mdi:window-closed-variant', '0'),
      native('mdi:thermometer', '19,5 °C', '#ff8a65'),
    ]),
    row('Maison', [
      badge({ entity: WINDOWS_GROUP_ID, look, ...halo }, 'vivid-window-badge'),
      badge({ entity: DOORS_GROUP_ID, look, ...halo }, 'vivid-door-badge'),
      badge({ entity: ILLUMINANCE_GROUP_ID, look, ...halo }, 'vivid-illuminance-badge'),
      badge({ entity: POWER_GROUP_ID, look, ...halo }, 'vivid-power-badge'),
      badge({ entity: 'binary_sensor.salon_presence', look, ...halo }, 'vivid-presence-badge'),
      badge({ entity: PRESENCE_GROUP_ID, look, ...halo }, 'vivid-presence-badge'),
      badge({ look, ...halo }, 'vivid-battery-badge'),
    ]),
    // Climate badges: a bathroom (BME280 and CO₂), the whole home, and every scale.
    row('Salle de bain', [
      badge({ entity: SDB_TEMPERATURE, look, ...halo }, 'vivid-temperature-badge'),
      badge({ entity: SDB_HUMIDITY, look, ...halo }, 'vivid-humidity-badge'),
      badge({ entity: SDB_PRESSURE, look, ...halo }, 'vivid-pressure-badge'),
      badge({ entity: SDB_CO2, look, ...halo }, 'vivid-air-quality-badge'),
      badge({ entity: SDB_ILLUMINANCE, look, ...halo }, 'vivid-illuminance-badge'),
      badge(
        { entity: SDB_ILLUMINANCE, look, show_label: true, ...halo },
        'vivid-illuminance-badge',
      ),
    ]),
    row('Général', [
      badge({ entity: TEMPERATURES_GROUP, look, ...halo }, 'vivid-temperature-badge'),
      badge({ entity: HUMIDITY_GROUP, look, ...halo }, 'vivid-humidity-badge'),
      badge({ entity: CO2_GROUP, look, ...halo }, 'vivid-air-quality-badge'),
      badge({ entity: SDB_PRESSURE, look, ...halo }, 'vivid-pressure-badge'),
      badge({ entity: FAHRENHEIT, look, ...halo }, 'vivid-temperature-badge'),
    ]),
    row(
      'Échelles',
      [
        ...[0, 1, 2, 3, 4].map((i) => `sensor.demo_temperature_${i}`),
        ...[0, 1, 2, 3].map((i) => `sensor.demo_humidity_${i}`),
        ...[0, 1, 2, 3].map((i) => `sensor.demo_pressure_${i}`),
        ...[0, 1, 2, 3].map((i) => `sensor.demo_co2_${i}`),
        'sensor.demo_light_dim',
        'sensor.demo_light_dark',
      ].map((entity) =>
        badge(
          { entity, look, ...halo },
          entity.includes('temperature')
            ? 'vivid-temperature-badge'
            : entity.includes('humidity')
              ? 'vivid-humidity-badge'
              : entity.includes('pressure')
                ? 'vivid-pressure-badge'
                : entity.includes('co2')
                  ? 'vivid-air-quality-badge'
                  : 'vivid-illuminance-badge',
        ),
      ),
    ),
  );
  stage.append(block);
}

let unsubscribe = mock.subscribe((hass: HomeAssistant) => {
  for (const element of badges) element.hass = withClimate(hass);
});

document.getElementById('theme')!.addEventListener('click', () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
});

document.getElementById('language')!.addEventListener('click', () => {
  language = language === 'en' ? 'fr' : 'en';
  unsubscribe();
  mock = createMockHass(language, mockOptions);
  unsubscribe = mock.subscribe((hass) => {
    for (const element of badges) element.hass = withClimate(hass);
  });
});

window.addEventListener('hass-more-info', (event) => {
  console.info('more-info', JSON.stringify((event as CustomEvent).detail));
});

Object.assign(window, {
  vivid: {
    get mock() {
      return mock;
    },
    badges,
  },
});
