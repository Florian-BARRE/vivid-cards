import { defineHaStubs } from './ha-stubs';
import {
  DOORS_GROUP_ID,
  GROUP_ID,
  ILLUMINANCE_GROUP_ID,
  LAMPS_GROUP_ID,
  PLUGS_GROUP_ID,
  POWER_GROUP_ID,
  PRESENCE_GROUP_ID,
  WINDOWS_GROUP_ID,
  createMockHass,
} from './mock-hass';
import type { HomeAssistant } from '../src/core/hass-types';
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
      badge({ entity: LAMPS_GROUP_ID, look, layout, ...halo }),
      badge({ entity: GROUP_ID, look, layout, ...halo }),
      native('mdi:window-closed-variant', '0'),
      native('mdi:weather-night', '0'),
      native('mdi:flash', '5 W', '#ffb74d'),
      native('mdi:motion-sensor', '2 min', '#64b5f6'),
      native('mdi:battery', '100 %', '#81c784'),
    ]),
    row('Chambre', [
      badge({ entity: PLUGS_GROUP_ID, look, layout, ...halo }),
      native('mdi:window-closed-variant', '0'),
      native('mdi:thermometer', '19,5 °C', '#ff8a65'),
    ]),
    row('Maison', [
      badge({ entity: WINDOWS_GROUP_ID, look, ...halo }, 'vivid-opening-badge'),
      badge({ entity: DOORS_GROUP_ID, look, ...halo }, 'vivid-opening-badge'),
      badge({ entity: ILLUMINANCE_GROUP_ID, look, ...halo }, 'vivid-illuminance-badge'),
      badge({ entity: POWER_GROUP_ID, look, ...halo }, 'vivid-power-badge'),
      badge({ entity: 'binary_sensor.salon_presence', look, ...halo }, 'vivid-presence-badge'),
      badge({ entity: PRESENCE_GROUP_ID, look, ...halo }, 'vivid-presence-badge'),
      badge({ look, ...halo }, 'vivid-battery-badge'),
    ]),
  );
  stage.append(block);
}

let unsubscribe = mock.subscribe((hass: HomeAssistant) => {
  for (const element of badges) element.hass = hass;
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
    for (const element of badges) element.hass = hass;
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
