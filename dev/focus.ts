/**
 * Focused cards preview: the parts of the large cards offered on their own.
 * Query parameters: `lang` (en, fr), `theme` (dark, light), `only` (index of
 * one card), `width` (stage width in px).
 */
import { defineHaStubs } from './ha-stubs';
import { createAmbilightMock } from './ambilight-mock';
import { createHyperHdrMock } from './hyperhdr-mock';
import { createMockHass } from './mock-hass';
import { createClimateHass } from './climate-chart-mock';
import type { HomeAssistant } from '../src/core/hass-types';

defineHaStubs();
await import('../src/vivid-cards');

const params = new URLSearchParams(location.search);
const language = params.get('lang') ?? 'en';
const dark = (params.get('theme') ?? 'dark') === 'dark';
document.documentElement.dataset.theme = dark ? 'dark' : 'light';
const width = params.get('width');
if (width) document.documentElement.style.setProperty('--stage-width', `${width}px`);
const fr = language === 'fr';

const inputs = [
  { name: fr ? 'Box TV' : 'TV box', icon: 'mdi:television-box' },
  { name: 'Console', icon: 'mdi:gamepad-variant' },
  { name: 'PC', icon: 'mdi:laptop' },
  { name: 'Cast', icon: 'mdi:cast' },
  'HDMI 5',
];

type Source = { hass: HomeAssistant; subscribe?(listener: (hass: HomeAssistant) => void): unknown };
const ambilight = () => createAmbilightMock({ language });
const lights = () => createMockHass(language, { allOnline: true });

const CARDS: {
  title: string;
  tag: string;
  config: Record<string, unknown>;
  source: () => Source;
}[] = [
  { title: 'vivid-fan-card', tag: 'vivid-fan-card', config: {}, source: ambilight },
  { title: 'vivid-hdmi-card', tag: 'vivid-hdmi-card', config: { inputs }, source: ambilight },
  {
    title: 'vivid-pi-card',
    tag: 'vivid-pi-card',
    config: { name: 'Ambilight', inputs },
    source: ambilight,
  },
  {
    title: 'vivid-screen-card',
    tag: 'vivid-screen-card',
    config: {},
    source: () => createHyperHdrMock({ language }),
  },
  {
    title: 'vivid-light-card · WLED',
    tag: 'vivid-light-card',
    config: { entity: 'light.salon_buffet_wled', name: fr ? 'Buffet' : 'Sideboard' },
    source: lights,
  },
  {
    title: 'vivid-light-card · lamp',
    tag: 'vivid-light-card',
    config: { entity: 'light.salon_lampadaire' },
    source: lights,
  },
  {
    title: 'vivid-power-card',
    tag: 'vivid-power-card',
    config: {
      entities: [
        'light.salon_buffet_wled',
        'light.salon_canape_wled',
        'light.salon_ambilight_wled',
      ],
      voltage: 5,
      price: 0.1952,
    },
    source: lights,
  },
  {
    title: 'vivid-climate-card',
    tag: 'vivid-climate-card',
    config: { entity: 'sensor.sdb_temperature' },
    source: () => ({ hass: createClimateHass(language, dark) }),
  },
  {
    title: 'vivid-climate-card · humidity, 7 days',
    tag: 'vivid-climate-card',
    config: { entity: 'sensor.sdb_humidite', range: '7d' },
    source: () => ({ hass: createClimateHass(language, dark) }),
  },
];

type Card = HTMLElement & { hass?: HomeAssistant; setConfig(config: unknown): void };
const stage = document.getElementById('stage')!;
const only = params.get('only');
CARDS.forEach((item, index) => {
  if (only !== null && Number(only) !== index) return;
  const section = document.createElement('section');
  const heading = document.createElement('h2');
  heading.textContent = item.title;
  const card = document.createElement(item.tag) as Card;
  card.setConfig({ type: `custom:${item.tag}`, ...item.config });
  section.append(heading, card);
  stage.append(section);
  const source = item.source();
  card.hass = source.hass;
  source.subscribe?.((hass) => {
    card.hass = hass;
  });
});

document.getElementById('theme')?.addEventListener('click', () => {
  const next = new URLSearchParams(location.search);
  next.set('theme', dark ? 'light' : 'dark');
  location.search = next.toString();
});
document.getElementById('language')?.addEventListener('click', () => {
  const next = new URLSearchParams(location.search);
  next.set('lang', fr ? 'en' : 'fr');
  location.search = next.toString();
});
