/**
 * Air station card preview. Query parameters: `lang` (en, fr), `theme` (dark,
 * light), `only` (index of one scenario), `details` (opens the details of the
 * first card), `tab` (air, frame, screen, settings), `editor`.
 */
import { defineHaStubs } from './ha-stubs';
import { AIR_DEVICE, createAirStationMock, type AirStationScenario } from './air-station-mock';
import type { HomeAssistant } from '../src/core/hass-types';

defineHaStubs();
await import('../src/vivid-cards');

const params = new URLSearchParams(location.search);
const language = params.get('lang') ?? 'en';
document.documentElement.dataset.theme = params.get('theme') ?? 'dark';
const fr = language === 'fr';

const SCENARIOS: {
  title: string;
  scenario: AirStationScenario;
  config?: Record<string, unknown>;
}[] = [
  {
    title: fr ? 'Air sain · jour' : 'Healthy air · day',
    scenario: { co2: 612, temperature: 21.4, humidity: 48 },
  },
  {
    title: fr ? 'Moyen · trop chaud' : 'Fair · too warm',
    scenario: { co2: 910, temperature: 24.6, humidity: 57, page: 'temp' },
  },
  {
    title: fr ? 'Alerte CO₂' : 'CO₂ alarm',
    scenario: { co2: 1240, temperature: 22.1, humidity: 58 },
  },
  {
    title: fr ? 'Nuit · veilleuse' : 'Night · night light',
    scenario: { co2: 540, temperature: 19.6, humidity: 51, night: true, page: 'data' },
  },
  {
    title: fr ? 'Station éteinte' : 'Station off',
    scenario: { co2: 612, temperature: 21.4, humidity: 48, off: true },
  },
  {
    title: fr ? 'Hors ligne' : 'Offline',
    scenario: { offline: true },
  },
  {
    title: fr
      ? 'Effet choisi · couleur perso, luminosité manuelle'
      : 'Picked effect · custom color, manual brightness',
    scenario: {
      co2: 700,
      temperature: 21,
      humidity: 45,
      effect: 'Custom Color',
      autoBrightness: false,
    },
    config: { info: ['co2', 'dew_point'] },
  },
];

type Card = HTMLElement & {
  hass?: HomeAssistant;
  setConfig(config: unknown): void;
  openDetails(): void;
};
const cards: Card[] = [];
const mocks: ReturnType<typeof createAirStationMock>[] = [];
const stage = document.getElementById('stage')!;
const only = params.get('only');
SCENARIOS.forEach((item, index) => {
  if (only !== null && Number(only) !== index) return;
  const mock = createAirStationMock({ ...item.scenario, language });
  const section = document.createElement('section');
  const heading = document.createElement('h2');
  heading.textContent = item.title;
  const card = document.createElement('vivid-air-station-card') as Card;
  card.setConfig({
    type: 'custom:vivid-air-station-card',
    name: fr ? 'Air du salon' : 'Living room air',
    device: AIR_DEVICE,
    ...item.config,
  });
  section.append(heading, card);
  stage.append(section);
  cards.push(card);
  mocks.push(mock);
  mock.subscribe((hass) => {
    card.hass = hass;
  });
});

if (params.has('details')) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  cards[0]?.openDetails();
  const tab = params.get('tab');
  if (tab) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const details = document
      .querySelector('vivid-dialog')
      ?.shadowRoot?.querySelector('vivid-air-station-details') as
      (HTMLElement & { tab: string }) | null;
    if (details) details.tab = tab;
  }
}

Object.assign(window, { vivid: { mocks, cards } });

if (params.has('editor')) {
  type Editor = HTMLElement & { hass?: HomeAssistant; setConfig(config: unknown): void };
  const Card = customElements.get('vivid-air-station-card') as unknown as {
    getConfigElement(): Editor;
  };
  const editor = Card.getConfigElement();
  let current: Record<string, unknown> = {
    type: 'custom:vivid-air-station-card',
    device: AIR_DEVICE,
  };
  editor.setConfig(current);
  editor.hass = mocks[0]?.hass;
  cards[0]?.setConfig(current);
  const yaml = document.createElement('pre');
  yaml.style.cssText = 'font-size:11px;color:var(--secondary-text-color);white-space:pre-wrap';
  yaml.textContent = JSON.stringify(current, null, 2);
  editor.addEventListener('config-changed', (event) => {
    current = (event as CustomEvent<{ config: Record<string, unknown> }>).detail.config;
    editor.setConfig(current);
    cards[0]?.setConfig(current);
    yaml.textContent = JSON.stringify(current, null, 2);
  });
  stage.prepend(editor, yaml);
}
