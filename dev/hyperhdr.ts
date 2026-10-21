/**
 * HyperHDR card preview. Query parameters: `lang` (en, fr), `theme` (dark,
 * light), `only` (index of one scenario), `details` (opens the details of
 * the card at that index), `tab` (overview, colors, processing, system),
 * `editor` (the visual editor above the first card).
 */
import { defineHaStubs } from './ha-stubs';
import { SERVER_DEVICE, STRIPS, createHyperHdrMock, type HyperHdrScenario } from './hyperhdr-mock';
import type { HomeAssistant } from '../src/core/hass-types';

defineHaStubs();
await import('../src/vivid-cards');

const params = new URLSearchParams(location.search);
const language = params.get('lang') ?? 'en';
document.documentElement.dataset.theme = params.get('theme') ?? 'dark';
const fr = language === 'fr';

const SCENARIOS: { title: string; scenario: HyperHdrScenario; config: Record<string, unknown> }[] =
  [
    {
      title: fr ? 'Bandeau' : 'Strip',
      scenario: {},
      config: { mode: 'strip', instance: STRIPS[0].device },
    },
    { title: fr ? 'Hub' : 'Hub', scenario: {}, config: { mode: 'hub' } },
    {
      title: fr ? 'Hub · toutes les infos' : 'Hub · every item',
      scenario: {},
      config: {
        mode: 'hub',
        hub_info: ['input', 'video_mode', 'capture_fps', 'version', 'strips', 'memory'],
        hub_values: ['temperature', 'cpu', 'memory'],
      },
    },
    { title: fr ? 'Hub + bandeaux' : 'Hub and strips', scenario: {}, config: { mode: 'all' } },
    {
      title: fr ? 'Chaud · sous-tension' : 'Hot · undervoltage',
      scenario: { hot: true },
      config: { mode: 'hub' },
    },
    { title: fr ? 'Hors ligne' : 'Offline', scenario: { offline: true }, config: { mode: 'all' } },
    {
      title: fr ? 'Bandeau sans mot de passe admin' : 'Strip without the admin password',
      scenario: { noAdmin: true },
      config: { mode: 'strip', instance: STRIPS[1].device },
    },
  ];

type Card = HTMLElement & {
  hass?: HomeAssistant;
  setConfig(config: unknown): void;
  openDetails(instance?: string, tab?: string): void;
};
const cards: Card[] = [];
const mocks: ReturnType<typeof createHyperHdrMock>[] = [];
const stage = document.getElementById('stage')!;
const only = params.get('only');
SCENARIOS.forEach((item, index) => {
  if (only !== null && Number(only) !== index) return;
  const mock = createHyperHdrMock({ ...item.scenario, language });
  const section = document.createElement('section');
  const heading = document.createElement('h2');
  heading.textContent = item.title;
  const card = document.createElement('vivid-hyperhdr-card') as Card;
  card.setConfig({ type: 'custom:vivid-hyperhdr-card', server: SERVER_DEVICE, ...item.config });
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
  const index = Number(params.get('details') || 0);
  const tab = params.get('tab') ?? 'overview';
  const card = cards[index];
  const strip = params.get('strip');
  // `hub`: the details of the hub alone.
  card?.openDetails(params.has('hub') ? undefined : (strip ?? STRIPS[0].device), tab);
}

Object.assign(window, { vivid: { mocks, cards } });

if (params.has('editor')) {
  type Editor = HTMLElement & { hass?: HomeAssistant; setConfig(config: unknown): void };
  const editor = document.createElement('vivid-hyperhdr-card-editor') as Editor;
  let current: Record<string, unknown> = { type: 'custom:vivid-hyperhdr-card', mode: 'strip' };
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
