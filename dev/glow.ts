/**
 * Halo bench: every glowing element side by side at its strongest (lights at
 * 100 %, lamps at their brightest watts, alerts, a low battery…), all at the
 * default halo, to compare like with like. `?theme=light`, `?glow=` sets
 * every component's halo.
 */
import { defineHaStubs } from './ha-stubs';
import {
  DOORS_GROUP_ID,
  GROUP_ID,
  ILLUMINANCE_GROUP_ID,
  LAMP_PLUGS_GROUP_ID,
  LAMPS_GROUP_ID,
  POWER_GROUP_ID,
  SPOTS_GROUP_ID,
  WINDOWS_GROUP_ID,
  createMockHass,
} from './mock-hass';
import type { HomeAssistant } from '../src/core/hass-types';

defineHaStubs();
await import('../src/vivid-cards');

type Element = HTMLElement & { hass?: HomeAssistant; setConfig(config: unknown): void };
const params = new URLSearchParams(location.search);
document.documentElement.dataset.theme = params.get('theme') ?? 'dark';
const glow = params.has('glow') ? { glow: Number(params.get('glow')) } : {};
const mock = createMockHass('fr', { allOnline: true });
const bench = document.getElementById('bench')!;
const elements: Element[] = [];

function make(tag: string, config: Record<string, unknown>): Element {
  const element = document.createElement(tag) as Element;
  element.setConfig({ type: `custom:${tag}`, ...config });
  elements.push(element);
  return element;
}

function section(title: string, ...items: HTMLElement[]): void {
  const heading = document.createElement('h2');
  heading.textContent = title;
  const bar = document.createElement('div');
  bar.className = 'bar';
  bar.append(...items);
  bench.append(heading, bar);
}

// Everything at its strongest.
const svc = (domain: string, service: string, entity: string, data = {}) =>
  mock.hass.callService(domain, service, data, { entity_id: entity });
await svc('light', 'turn_on', GROUP_ID, { brightness_pct: 100 });
await svc('light', 'turn_on', LAMPS_GROUP_ID, { brightness_pct: 100 });
await svc('light', 'turn_on', SPOTS_GROUP_ID, { brightness_pct: 100 });
await svc('switch', 'turn_on', LAMP_PLUGS_GROUP_ID);
for (const key of ['salon_lustre', 'salon_lampadaire', 'salon_suspension', 'salon_liseuse']) {
  mock.setState(`sensor.${key}_power`, '60', undefined, 30);
  mock.setState(`switch.${key}`, 'on', undefined, 30);
}
mock.setState('binary_sensor.porte_entree', 'on', undefined, 90);
for (const key of ['salon', 'bureau', 'chambre']) {
  mock.setState(`sensor.${key}_eclairement`, '2000');
}
for (const key of ['tv_salon', 'frigo', 'lave_linge'])
  mock.setState(`sensor.${key}_puissance`, '1000');

section('Carte LED', make('vivid-led-group', { entity: GROUP_ID, name: 'LEDs' }));
section(
  'Carte lampes',
  make('vivid-lamp-group', {
    entity: LAMP_PLUGS_GROUP_ID,
    scenes: [
      { name: 'Soirée', icon: 'mdi:sofa', lamps: [] },
      { name: 'Tout', lamps: [] },
    ],
    warn_below: 0,
    ...glow,
  }),
);
section(
  'Carte lampes · une ligne',
  make('vivid-lamp-group', { entity: LAMP_PLUGS_GROUP_ID, layout: 'line', warn_below: 0, ...glow }),
);
for (const look of ['disc', 'pill']) {
  const all = { look, ...glow };
  section(
    `Badges · ${look === 'disc' ? 'pastille' : 'badge entier'}`,
    make('vivid-led-badge', { entity: GROUP_ID, ...all }),
    make('vivid-lamp-badge', { entity: LAMPS_GROUP_ID, ...all }),
    make('vivid-lamp-badge', { entity: LAMP_PLUGS_GROUP_ID, ...all }),
    make('vivid-light-badge', { entity: SPOTS_GROUP_ID, ...all }),
    make('vivid-window-badge', { entity: WINDOWS_GROUP_ID, ...all }),
    make('vivid-door-badge', { entity: DOORS_GROUP_ID, ...all }),
    make('vivid-presence-badge', { entity: 'binary_sensor.salon_presence', ...all }),
    make('vivid-illuminance-badge', { entity: ILLUMINANCE_GROUP_ID, ...all }),
    make('vivid-power-badge', { entity: POWER_GROUP_ID, ...all }),
    make('vivid-battery-badge', all),
  );
}

mock.subscribe((hass) => {
  for (const element of elements) element.hass = hass;
});
Object.assign(window, { vivid: { mock, elements } });
