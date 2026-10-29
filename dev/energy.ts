/**
 * Energy cards and badges preview. Query parameters: `lang` (en, fr), `theme`
 * (dark, light), `hourly` (days of hourly data), `only` (index of one card),
 * `width` (stage width in px), `editor` (shows the bill card editor).
 */
import { defineHaStubs } from './ha-stubs';
import { FLO_TARIFF, withEnergy } from './energy-mock';
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
if (params.get('width'))
  document.documentElement.style.setProperty('--stage-width', `${params.get('width')}px`);
const stage = document.getElementById('stage')!;

function makeHass(options: Parameters<typeof withEnergy>[1] = {}): HomeAssistant {
  return {
    states: {
      'sensor.eclairage_puissance': {
        entity_id: 'sensor.eclairage_puissance',
        state: '21',
        attributes: { friendly_name: 'Éclairage', unit_of_measurement: 'W', device_class: 'power' },
        last_changed: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      },
    },
    entities: {},
    devices: {},
    areas: {},
    language,
    locale: { language },
    config: { currency: 'EUR' },
    callService: async () => undefined,
    callWS: withEnergy(undefined, { hourlyDays: Number(params.get('hourly') ?? 0), ...options }),
  } as unknown as HomeAssistant;
}

const T = FLO_TARIFF;
const ITEMS: {
  title: string;
  tag: string;
  config: Record<string, unknown>;
  badge?: boolean;
  mock?: Parameters<typeof withEnergy>[1];
}[] = [
  { title: 'Bill badges', tag: 'badges', config: {}, badge: true },
  { title: 'vivid-bill-card', tag: 'vivid-bill-card', config: { tariff: T } },
  {
    title: 'vivid-bill-card · layout: line',
    tag: 'vivid-bill-card',
    config: { tariff: T, layout: 'line' },
  },
  { title: 'vivid-bills-card', tag: 'vivid-bills-card', config: { tariff: T } },
  { title: 'vivid-bill-ring · money', tag: 'vivid-bill-ring', config: { tariff: T } },
  {
    title: 'vivid-bill-ring · off_peak',
    tag: 'vivid-bill-ring',
    config: { tariff: T, ring: 'off_peak' },
  },
  { title: 'vivid-energy-calendar', tag: 'vivid-energy-calendar', config: { tariff: T } },
  { title: 'vivid-energy-flow', tag: 'vivid-energy-flow', config: { tariff: T } },
  { title: 'vivid-energy-ranking', tag: 'vivid-energy-ranking', config: { tariff: T } },
  { title: 'vivid-load-curve', tag: 'vivid-load-curve', config: { tariff: T } },
  {
    title: 'No grid source',
    tag: 'vivid-bill-card',
    config: { tariff: T },
    mock: { noSource: true },
  },
];

const BADGES: Record<string, unknown>[] = [
  { type: 'custom:vivid-bill-badge', tariff: T },
  { type: 'custom:vivid-tariff-badge', tariff: T },
  { type: 'custom:vivid-energy-badge', tariff: T },
  {
    type: 'custom:vivid-power-badge',
    entity: 'sensor.eclairage_puissance',
    cost: 'month',
    tariff: T,
  },
];

function mount(): void {
  stage.replaceChildren();
  const only = params.get('only');
  ITEMS.forEach((item, index) => {
    if (only !== null && Number(only) !== index) return;
    const heading = document.createElement('h2');
    heading.textContent = item.title;
    stage.append(heading);
    const hass = makeHass(item.mock);
    if (item.badge) {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px';
      for (const config of BADGES) {
        const badge = document.createElement(
          String(config.type).replace('custom:', ''),
        ) as CardElement;
        badge.setConfig(config);
        badge.hass = hass;
        row.append(badge);
      }
      stage.append(row);
      return;
    }
    const card = document.createElement(item.tag) as CardElement;
    card.setConfig({ type: `custom:${item.tag}`, ...item.config });
    card.hass = hass;
    stage.append(card);
  });
  if (params.has('editor')) {
    const ctor = customElements.get('vivid-bill-card') as unknown as {
      getConfigElement(): CardElement;
    };
    const editor = ctor.getConfigElement();
    editor.hass = makeHass();
    editor.setConfig({ type: 'custom:vivid-bill-card', tariff: T });
    editor.addEventListener('config-changed', (event) =>
      console.info('config', JSON.stringify((event as CustomEvent).detail.config)),
    );
    const wrap = document.createElement('div');
    wrap.className = 'editor';
    wrap.append(editor);
    stage.append(wrap);
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
