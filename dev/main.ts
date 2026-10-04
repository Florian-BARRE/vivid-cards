import { defineHaStubs } from './ha-stubs';
import { GROUP_ID, createMockHass } from './mock-hass';
import type { HomeAssistant } from '../src/core/hass-types';
import type { VividLedGroup } from '../src/cards/led-group/vivid-led-group';

defineHaStubs();
await import('../src/vivid-cards');

let language = 'en';
let mock = createMockHass(language);
const cards: VividLedGroup[] = [];

function mount(container: HTMLElement, config: Record<string, unknown>): void {
  const card = document.createElement('vivid-led-group');
  card.setConfig({ type: 'custom:vivid-led-group', ...config } as never);
  container.appendChild(card);
  cards.push(card);
}

const baseConfig = {
  entity: GROUP_ID,
  name: 'LEDs',
  details_hash: 'salon-leds-details',
  power: { sensor_pattern: 'sensor.{object_id}_puissance', max: 34 },
};

mount(document.getElementById('phone')!, baseConfig);
mount(document.getElementById('wide')!, {
  entity: 'light.salon_canape_wled',
  power: { voltage: 5, max: 34 },
});

let unsubscribe = mock.subscribe((hass: HomeAssistant) => {
  for (const card of cards) card.hass = hass;
});

document.getElementById('theme')!.addEventListener('click', () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
});

document.getElementById('language')!.addEventListener('click', () => {
  language = language === 'en' ? 'fr' : 'en';
  unsubscribe();
  mock = createMockHass(language);
  unsubscribe = mock.subscribe((hass) => {
    for (const card of cards) card.hass = hass;
  });
});

document.getElementById('details')!.addEventListener('click', () => {
  window.location.hash = 'salon-leds-details';
});

window.addEventListener('hass-more-info', (event) => {
  console.info('more-info', (event as CustomEvent).detail);
});

Object.assign(window, {
  vivid: {
    get mock() {
      return mock;
    },
    cards,
  },
});
