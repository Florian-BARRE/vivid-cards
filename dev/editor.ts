/**
 * Editor preview: each scenario shows the visual editor as in the card dialog
 * of Home Assistant, the live card it configures and the resulting YAML.
 */
import { defineHaStubs } from './ha-stubs';
import { GROUP_ID, SPOTS_GROUP_ID, createMockHass } from './mock-hass';
import type { HomeAssistant } from '../src/core/hass-types';
import type { LedGroupCardConfig } from '../src/cards/led-group/config';

defineHaStubs();
await import('../src/vivid-cards');

interface Scenario {
  title: string;
  subtitle: string;
  config: Record<string, unknown>;
}

const SCENARIOS: Scenario[] = [
  {
    title: 'WLED group',
    subtitle: '3 strips, one offline, sensor pattern',
    config: {
      entity: GROUP_ID,
      name: 'LEDs',
      power: { sensor_pattern: 'sensor.{object_id}_puissance', voltage: 5 },
      details: { hash: 'salon-leds-details' },
      badges: ['sensor.salon_temperature'],
      tile: { favorites: ['#ff8a3d', '#8a2be2', { kelvin: 2700, brightness: 40 }] },
    },
  },
  {
    title: 'Single WLED light',
    subtitle: 'estimated current × 5 V',
    config: { entity: 'light.salon_canape_wled', power: { voltage: 5 } },
  },
  {
    title: 'Non-WLED group',
    subtitle: '2 tunable white spots, one power sensor',
    config: { entity: SPOTS_GROUP_ID, name: 'Spots' },
  },
  {
    title: 'New card',
    subtitle: 'nothing picked yet',
    config: {},
  },
];

type Editor = HTMLElement & { hass?: HomeAssistant; setConfig(config: unknown): void };
type Card = HTMLElement & { hass?: HomeAssistant; setConfig(config: unknown): void };

let language = new URLSearchParams(location.search).get('lang') ?? 'en';
let mock = createMockHass(language);
const editors: Editor[] = [];
const cards: Card[] = [];

const stage = document.getElementById('stage')!;
SCENARIOS.forEach((scenario, index) => {
  const column = document.createElement('section');
  column.className = 'scenario';
  column.dataset.scenario = String(index);
  column.innerHTML = `<h2>${scenario.title} <small>· ${scenario.subtitle}</small></h2>
    <div class="dialog"></div><div class="preview"></div><pre></pre>`;
  stage.append(column);

  const editor = document.createElement('vivid-led-group-editor') as Editor;
  const card = document.createElement('vivid-led-group') as Card;
  const yaml = column.querySelector('pre')!;
  const preview = column.querySelector<HTMLElement>('.preview')!;
  const show = (config: Record<string, unknown>) => {
    yaml.textContent = JSON.stringify(config, null, 2);
    try {
      card.setConfig({ type: 'custom:vivid-led-group', ...config });
      preview.hidden = false;
    } catch {
      preview.hidden = true;
    }
  };
  editor.setConfig({ type: 'custom:vivid-led-group', ...scenario.config });
  editor.addEventListener('config-changed', (event) => {
    show((event as CustomEvent<{ config: LedGroupCardConfig }>).detail.config);
  });
  show({ type: 'custom:vivid-led-group', ...scenario.config });
  column.querySelector('.dialog')!.append(editor);
  preview.append(card);
  editors.push(editor);
  cards.push(card);
});

const publish = (hass: HomeAssistant) => {
  for (const element of [...editors, ...cards]) element.hass = hass;
};
let unsubscribe = mock.subscribe(publish);

document.getElementById('theme')!.addEventListener('click', () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
});

document.getElementById('language')!.addEventListener('click', () => {
  language = language === 'en' ? 'fr' : 'en';
  unsubscribe();
  mock = createMockHass(language);
  unsubscribe = mock.subscribe(publish);
});

Object.assign(window, {
  vivid: {
    get mock() {
      return mock;
    },
    editors,
    cards,
  },
});
