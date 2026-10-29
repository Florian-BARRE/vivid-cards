import { defineHaStubs } from './ha-stubs';
import { createClimateHass } from './climate-chart-mock';
import type { HomeAssistant } from '../src/core/hass-types';
import type { ClimateKind } from '../src/core/climate';

defineHaStubs();
await import('../src/vivid-cards');
await import('../src/components/vivid-climate-chart');
await import('../src/components/vivid-climate-rooms');

const params = new URLSearchParams(location.search);
let language = params.get('lang') ?? 'en';
if (params.get('theme') === 'light') document.documentElement.dataset.theme = 'light';
const only = params.get('only')?.split(',');
const columns = Number(params.get('columns') ?? 2);
const width = params.get('width') ?? '390px';

let hass = createClimateHass(language);
const elements: (HTMLElement & { hass?: HomeAssistant })[] = [];
const stage = document.getElementById('stage')!;
const column = Array.from({ length: columns }, () => {
  const element = document.createElement('div');
  element.className = 'column';
  element.style.setProperty('--column', width);
  stage.append(element);
  return element;
});
let count = 0;

function section(id: string, title: string, element: HTMLElement & { hass?: HomeAssistant }) {
  if (only && !only.includes(id)) return;
  const block = document.createElement('section');
  block.id = id;
  const heading = document.createElement('h2');
  heading.textContent = title;
  const frame = document.createElement('div');
  frame.className = 'popover';
  frame.append(element);
  block.append(heading, frame);
  column[count++ % columns]!.append(block);
  if (!element.hass) element.hass = hass;
  elements.push(element);
}

function chart(entityId: string, kind: ClimateKind, range = '24h') {
  const element = document.createElement('vivid-climate-chart');
  element.entityId = entityId;
  element.kind = kind;
  element.range = range as never;
  return element;
}

function rooms(ids: string[], kind: ClimateKind, range = '24h') {
  const element = document.createElement('vivid-climate-rooms');
  element.sources = ids.map((entityId) => ({ entityId }));
  element.kind = kind;
  element.range = range as never;
  return element;
}

const range = params.get('range') ?? '24h';
section(
  'bath-t',
  'E9a · bathroom temperature',
  chart('sensor.sdb_temperature', 'temperature', range),
);
section('bath-h', 'E9a · bathroom humidity', chart('sensor.sdb_humidite', 'humidity', range));
section(
  'rooms-t',
  'E6 · one curve per room (temperature)',
  rooms(
    [
      'sensor.salon_temperature',
      'sensor.chambre_temperature',
      'sensor.sdb_temperature',
      'sensor.bureau_temperature',
      'sensor.cuisine_temperature',
    ],
    'temperature',
    range,
  ),
);
section(
  'rooms-h',
  'E6 · one curve per room (humidity, with an unavailable room)',
  rooms(
    [
      'sensor.salon_humidite',
      'sensor.chambre_humidite',
      'sensor.sdb_humidite',
      'sensor.bureau_humidite',
      'sensor.cuisine_humidite',
      'sensor.cave_humidite',
    ],
    'humidity',
    range,
  ),
);
section(
  'veranda',
  'Veranda in °F · 7 days',
  chart('sensor.veranda_temperature', 'temperature', '7d'),
);
section('co2', 'Living room CO₂ · 30 days', chart('sensor.salon_co2', 'co2', '30d'));
section('cellar', 'Cellar · unavailable for 5 h', chart('sensor.cave_temperature', 'temperature'));
section('attic', 'Attic · no history', chart('sensor.grenier_temperature', 'temperature'));
const loading = chart('sensor.sdb_temperature', 'temperature');
loading.hass = { ...hass, callWS: () => new Promise(() => undefined) } as HomeAssistant;
section('loading', 'Loading', loading);

window.addEventListener('vivid-climate-room-select', (event) => {
  const detail = (event as CustomEvent<{ entityId: string }>).detail;
  document.getElementById('log')!.textContent = `room-select: ${detail.entityId}`;
});

document.getElementById('theme')!.addEventListener('click', () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
});

document.getElementById('language')!.addEventListener('click', () => {
  language = language === 'en' ? 'fr' : 'en';
  hass = createClimateHass(language);
  for (const element of elements) {
    if (element !== loading) element.hass = hass;
  }
});
