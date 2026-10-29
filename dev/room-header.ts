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

const SCENARIOS: { title: string; scenario: RoomScenario; config: Record<string, unknown> }[] = [
  { title: 'Salon · all on (2 lamps, 2 strips)', scenario: 'all', config: { room: 'salon' } },
  { title: 'Salon · lamps only', scenario: 'lamps', config: { room: 'salon' } },
  { title: 'Salon · off', scenario: 'off', config: { room: 'salon' } },
  { title: 'Grenier · nothing discovered', scenario: 'off', config: { room: 'grenier' } },
  {
    title: 'Overrides · name, lights, listed badges',
    scenario: 'all',
    config: {
      room: 'salon',
      name: 'Coin TV',
      lights: ['light.salon_leds'],
      badges: [
        { type: 'custom:vivid-led-badge', entity: 'light.salon_leds' },
        { type: 'custom:vivid-door-badge', entity: 'binary_sensor.salon_portes' },
        { type: 'custom:vivid-unknown-badge', entity: 'light.salon_leds' },
      ],
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
    const mock: RoomMock = createRoomMock(item.scenario, { language });
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
    editor.hass = createRoomMock('all', { language });
    editor.setConfig({ type: 'custom:vivid-room-header', room: 'salon' });
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
