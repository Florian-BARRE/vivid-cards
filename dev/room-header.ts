/**
 * Room header preview. Query parameters: `lang` (en, fr), `theme` (dark,
 * light), `only` (index of one scenario), `editor` (shows the editor).
 */
import { defineHaStubs } from './ha-stubs';
import { createRoomMock, type RoomMock, type RoomScenario } from './room-header-mock';
import type { HomeAssistant } from '../src/core/hass-types';

type CardElement = HTMLElement & {
  hass?: HomeAssistant;
  setConfig(config: Record<string, unknown>): void;
};

defineHaStubs();
await import('../src/vivid-cards');

const params = new URLSearchParams(location.search);
let language = params.get('lang') ?? 'en';
document.documentElement.dataset.theme = params.get('theme') ?? 'dark';
const stage = document.getElementById('stage')!;

const SCENARIOS: {
  title: string;
  scenario: RoomScenario;
  config: Record<string, unknown>;
  mock?: Parameters<typeof createRoomMock>[1];
}[] = [
  {
    title: 'Pilot · salon all on (2 lamps, 2 strips, climate)',
    scenario: 'all',
    config: { pilot: 'salon' },
    mock: { climate: true },
  },
  { title: 'Pilot · lamps only', scenario: 'lamps', config: { pilot: 'salon' } },
  {
    title: 'Pilot · off, a memory stored: the button restores it',
    scenario: 'off',
    config: { pilot: 'salon' },
    mock: { memory: true },
  },
  {
    title: 'Pilot adjusted · no LEDs, no windows, one lamp added by hand',
    scenario: 'all',
    config: {
      pilot: 'salon',
      entities: { led: false, window: false, light: { add: ['switch.0xa4c13865b4dce778'] } },
    },
    mock: { climate: true },
  },
  {
    title: 'Manual · no Vivid Pilot room',
    scenario: 'all',
    config: {
      name: 'Coin TV',
      entities: { led: ['light.wled_tv'], power: 'sensor.vivid_pilot_salon_power' },
    },
  },
];

function mount(): void {
  stage.replaceChildren();
  const only = params.get('only');
  SCENARIOS.forEach((item, index) => {
    if (only !== null && Number(only) !== index) return;
    const heading = document.createElement('h2');
    heading.textContent = item.title;
    const mock: RoomMock = createRoomMock(item.scenario, { language, ...item.mock });
    const card = document.createElement('vivid-room-header') as CardElement;
    card.setConfig({ type: 'custom:vivid-room-header', ...item.config });
    card.hass = mock;
    mock.subscribe((hass) => {
      card.hass = hass;
    });
    card.addEventListener('hass-more-info', (event) =>
      console.info('more-info', (event as CustomEvent).detail),
    );
    stage.append(heading, card);
  });
  if (params.has('editor')) {
    const heading = document.createElement('h2');
    heading.textContent = 'Editor';
    const wrap = document.createElement('div');
    wrap.className = 'editor';
    const editor = document.createElement('vivid-room-header-editor') as CardElement;
    editor.hass = createRoomMock('all', { language, climate: true, memory: true });
    editor.setConfig({
      type: 'custom:vivid-room-header',
      pilot: 'salon',
      entities: { presence: false },
    });
    editor.addEventListener('config-changed', (event) => {
      const config = (event as CustomEvent).detail.config as Record<string, unknown>;
      console.info('config', JSON.stringify(config));
      editor.setConfig(config);
    });
    wrap.append(editor);
    stage.append(heading, wrap);
  }
}

mount();

document.getElementById('theme')!.addEventListener('click', () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
});

document.getElementById('language')!.addEventListener('click', () => {
  language = language === 'en' ? 'fr' : 'en';
  mount();
});
