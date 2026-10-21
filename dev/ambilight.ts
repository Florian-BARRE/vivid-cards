/**
 * Ambilight card preview. Query parameters: `lang` (en, fr), `theme` (dark,
 * light), `only` (index of one scenario), `details` (opens the details of the
 * first card), `tab` (overview, fan, ir, maint).
 */
import { defineHaStubs } from './ha-stubs';
import { MANAGER_DEVICE, createAmbilightMock, type AmbilightScenario } from './ambilight-mock';
import type { HomeAssistant } from '../src/core/hass-types';

defineHaStubs();
await import('../src/vivid-cards');

const params = new URLSearchParams(location.search);
const language = params.get('lang') ?? 'en';
document.documentElement.dataset.theme = params.get('theme') ?? 'dark';
const fr = language === 'fr';

const inputs = [
  { name: fr ? 'Box TV' : 'TV box', icon: 'mdi:television-box' },
  { name: 'Console', icon: 'mdi:gamepad-variant' },
  { name: 'PC', icon: 'mdi:laptop' },
  { name: 'Cast', icon: 'mdi:cast' },
  'HDMI 5',
];

const SCENARIOS: {
  title: string;
  scenario: AmbilightScenario;
  config?: Record<string, unknown>;
}[] = [
  {
    title: fr ? 'Normal · CPU du Pi aux commandes' : 'Normal · Pi CPU drives the fan',
    scenario: {},
  },
  {
    title: fr ? 'HyperHDR non connecté · courbe boîtier' : 'HyperHDR away · box curve',
    scenario: { hyperhdr: 'away' },
  },
  {
    title: fr ? 'Le boîtier ne voit pas HyperHDR' : 'The box does not see HyperHDR',
    scenario: { espBlind: true, noSsh: true },
  },
  { title: fr ? 'Pi éteint' : 'Pi off', scenario: { piOff: true } },
  {
    title: fr ? 'CPU du Pi en surchauffe' : 'Pi CPU overheating',
    scenario: { cpuTemperature: 84 },
  },
  { title: fr ? 'Capteur absent (aujourd’hui)' : 'Sensor missing', scenario: { noSensor: true } },
  { title: fr ? 'Surchauffe' : 'Overheat', scenario: { overheat: true } },
  { title: fr ? 'Ventilateur bloqué' : 'Fan stalled', scenario: { stalled: true } },
  { title: fr ? 'Hors ligne' : 'Offline', scenario: { offline: true } },
  {
    title: fr ? 'Manuel · HDMI 3 sans écho' : 'Manual · HDMI 3 no echo',
    scenario: { manual: true, failInputs: [2] },
  },
  {
    title: fr ? 'Ancien firmware (sans HyperHDR)' : 'Firmware before HyperHDR',
    scenario: { legacy: true },
  },
];

type Card = HTMLElement & {
  hass?: HomeAssistant;
  setConfig(config: unknown): void;
  openDetails(): void;
};
const cards: Card[] = [];
const mocks: ReturnType<typeof createAmbilightMock>[] = [];
const stage = document.getElementById('stage')!;
const only = params.get('only');
SCENARIOS.forEach((item, index) => {
  if (only !== null && Number(only) !== index) return;
  const mock = createAmbilightMock({ ...item.scenario, language });
  const section = document.createElement('section');
  const heading = document.createElement('h2');
  heading.textContent = item.title;
  const card = document.createElement('vivid-ambilight-card') as Card;
  card.setConfig({
    type: 'custom:vivid-ambilight-card',
    name: 'Ambilight',
    inputs,
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
      ?.shadowRoot?.querySelector('vivid-ambilight-details') as
      (HTMLElement & { tab: string }) | null;
    if (details) details.tab = tab;
  }
}

Object.assign(window, { vivid: { mocks, cards } });

if (params.has('editor')) {
  type Editor = HTMLElement & { hass?: HomeAssistant; setConfig(config: unknown): void };
  const editor = document.createElement('vivid-ambilight-card-editor') as Editor;
  // `fresh`: a card just added, before any device is picked.
  let current: Record<string, unknown> = params.has('fresh')
    ? { type: 'custom:vivid-ambilight-card' }
    : {
        type: 'custom:vivid-ambilight-card',
        name: 'Ambilight',
        device: MANAGER_DEVICE,
        inputs,
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
