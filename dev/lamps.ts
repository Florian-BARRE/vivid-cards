/**
 * Lamp card preview. Query parameters: `lang` (en, fr), `theme` (dark, light),
 * `only` (index of one scenario), `details` (opens the details of the first card),
 * `allOff` (every lamp off).
 */
import { defineHaStubs } from './ha-stubs';
import { LAMP_PLUGS_GROUP_ID, LAMP_SCENE_ID, createMockHass } from './mock-hass';
import type { HomeAssistant } from '../src/core/hass-types';

defineHaStubs();
await import('../src/vivid-cards');

const params = new URLSearchParams(location.search);
const language = params.get('lang') ?? 'en';
document.documentElement.dataset.theme = params.get('theme') ?? 'dark';
const fr = language === 'fr';
const mock = createMockHass(language);

const scenes = [
  { name: fr ? 'Soirée' : 'Evening', icon: 'mdi:sofa', scene: LAMP_SCENE_ID },
  {
    name: fr ? 'Lecture' : 'Reading',
    icon: 'mdi:book-open-variant',
    lamps: ['switch.salon_lampadaire', 'switch.salon_liseuse'],
  },
  { name: fr ? 'Tout éteindre' : 'All off', lamps: [] },
];

/** `doc`: English names and a preset that matches the lamps, for the README screenshots. */
const doc = params.has('doc');
const docMembers = [
  { entity: 'switch.salon_lustre', name: 'Chandelier' },
  { entity: 'switch.salon_lampadaire', name: 'Floor lamp' },
  { entity: 'switch.salon_suspension', name: 'Pendant' },
  { entity: 'switch.salon_liseuse', name: 'Reading' },
];
const docScenes = [
  {
    name: 'Evening',
    icon: 'mdi:sofa',
    lamps: ['switch.salon_lustre', 'switch.salon_lampadaire', 'switch.salon_liseuse'],
  },
  { name: 'Movie', icon: 'mdi:movie-open', scene: LAMP_SCENE_ID },
  { name: 'All off', lamps: [] },
];

const SCENARIOS: { title: string; config: Record<string, unknown> }[] = [
  {
    title: 'Ambiance · presets',
    config: { entity: LAMP_PLUGS_GROUP_ID, scenes, price_entity: 'input_number.prix_kwh' },
  },
  {
    title: 'Ambiance · no preset, no duration',
    config: { entity: LAMP_PLUGS_GROUP_ID, show_duration: false },
  },
  { title: 'One line', config: { entity: LAMP_PLUGS_GROUP_ID, layout: 'line', price: 0.2516 } },
  {
    title: 'One line · no watts',
    config: {
      entities: ['switch.salon_lustre', 'switch.salon_lampadaire', 'switch.salon_suspension'],
      name: fr ? 'Salon' : 'Living room',
      layout: 'line',
      show_power: false,
    },
  },
];

type Card = HTMLElement & { hass?: HomeAssistant; setConfig(config: unknown): void };
const cards: Card[] = [];
const stage = document.getElementById('stage')!;
const only = params.get('only');
SCENARIOS.forEach((scenario, index) => {
  if (only !== null && Number(only) !== index) return;
  if (doc) {
    scenario.config = {
      ...scenario.config,
      name: scenario.config.name ?? 'Lamps',
      members: docMembers,
      ...(scenario.config.scenes ? { scenes: docScenes } : {}),
    };
  }
  const section = document.createElement('section');
  const heading = document.createElement('h2');
  heading.textContent = scenario.title;
  const card = document.createElement('vivid-lamp-group') as Card;
  card.setConfig({ type: 'custom:vivid-lamp-group', ...scenario.config });
  section.append(heading, card);
  stage.append(section);
  cards.push(card);
});

if (params.has('allOff')) {
  await mock.hass.callService('switch', 'turn_off', {}, { entity_id: LAMP_PLUGS_GROUP_ID });
}

mock.subscribe((hass) => {
  for (const card of cards) card.hass = hass;
});

if (params.has('details')) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  (cards[0] as unknown as { openDetails(): void }).openDetails();
}

Object.assign(window, { vivid: { mock, cards } });

if (params.has('editor')) {
  const editor = document.createElement('vivid-lamp-group-editor') as Card;
  const first = SCENARIOS[Number(only ?? 0)]!;
  let current: Record<string, unknown> = { type: 'custom:vivid-lamp-group', ...first.config };
  editor.setConfig(current);
  editor.hass = mock.hass;
  editor.addEventListener('config-changed', (event) => {
    current = (event as CustomEvent<{ config: Record<string, unknown> }>).detail.config;
    cards[0]?.setConfig(current);
    yaml.textContent = JSON.stringify(current, null, 2);
  });
  const yaml = document.createElement('pre');
  yaml.style.cssText = 'font-size:11px;color:var(--secondary-text-color);white-space:pre-wrap';
  yaml.textContent = JSON.stringify(current, null, 2);
  stage.append(editor, yaml);
  mock.subscribe((hass) => {
    editor.hass = hass;
  });
}
