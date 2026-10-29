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
    title: 'Auto · salon all on (2 lamps, 2 strips, climate)',
    scenario: 'all',
    config: { room: 'salon' },
    mock: { climate: true },
  },
  { title: 'Auto · lamps only', scenario: 'lamps', config: { room: 'salon' } },
  { title: 'Auto · off', scenario: 'off', config: { room: 'salon' } },
  {
    title: 'Auto · presence found by its name "salon-présence"',
    scenario: 'all',
    config: { room: 'Salon' },
    mock: { presenceId: 'binary_sensor.capteur_mouvement_1' },
  },
  {
    title: 'Exclude · leds, windows, co2 (by role) and the doors (by id)',
    scenario: 'all',
    config: {
      room: 'salon',
      exclude: ['leds', 'fenêtres', 'air', 'binary_sensor.salon_portes'],
    },
    mock: { climate: true },
  },
  {
    title: 'Manual added + override (door badge with icon_off, power badge)',
    scenario: 'all',
    config: {
      room: 'salon',
      badges: [
        {
          type: 'custom:vivid-door-badge',
          entity: 'binary_sensor.salon_portes',
          icon_off: 'mdi:door-sliding',
        },
        { type: 'custom:vivid-power-badge', entity: 'sensor.salon_puissance' },
      ],
    },
  },
  {
    title: 'discover: false · fully manual',
    scenario: 'all',
    config: {
      room: 'salon',
      discover: false,
      name: 'Coin TV',
      lights: ['light.salon_leds'],
      power: 'sensor.salon_puissance',
      badges: [{ type: 'custom:vivid-led-badge', entity: 'light.salon_leds' }],
    },
  },
  { title: 'Grenier · nothing discovered', scenario: 'off', config: { room: 'grenier' } },
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
    editor.hass = createRoomMock('all', { language, climate: true });
    editor.setConfig({ type: 'custom:vivid-room-header', room: 'salon', exclude: ['presence'] });
    editor.addEventListener('config-changed', (event) =>
      console.info('config', JSON.stringify((event as CustomEvent).detail.config)),
    );
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
