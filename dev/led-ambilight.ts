/**
 * LED group preview: the collapsible layout and the Ambilight rail. The salon
 * LEDs (`mock-hass`), the Ambilight box (`ambilight-mock`) and three HyperHDR
 * instances sending to the salon strips are merged into one Home Assistant.
 * Query parameters: `lang` (en, fr), `theme` (dark, light), `only` (index of
 * one scenario), `details` (opens the details of that scenario's card).
 */
import { defineHaStubs } from './ha-stubs';
import { createAmbilightMock, HUB_DEVICE, type AmbilightScenario } from './ambilight-mock';
import { GROUP_ID, createMockHass } from './mock-hass';
import { HYPERHDR_INTEGRATION } from '../src/cards/hyperhdr/model';
import { forgetExpanded } from '../src/cards/led-group/fold';
import type {
  EntityRegistryDisplayEntry,
  HassEntity,
  HomeAssistant,
  Rgb,
} from '../src/core/hass-types';

defineHaStubs();
await import('../src/vivid-cards');

const params = new URLSearchParams(location.search);
const language = params.get('lang') ?? 'en';
document.documentElement.dataset.theme = params.get('theme') ?? 'dark';
const fr = language === 'fr';
// Screenshots start from the configured state, not from a previous visit.
try {
  window.localStorage.clear();
} catch {
  // Storage blocked: nothing to clear.
}
forgetExpanded();

const inputs = [
  { name: fr ? 'Box TV' : 'TV box', icon: 'mdi:television-box' },
  { name: 'Console', icon: 'mdi:gamepad-variant' },
  { name: 'PC', icon: 'mdi:laptop' },
  'HDMI 4',
  'HDMI 5',
];

/** HyperHDR instances sending to the salon strips (WLED at 192.168.1.40–42). */
const INSTANCES: { slug: string; name: string; host: string; average: Rgb }[] = [
  { slug: 'tv', name: 'TV', host: '192.168.1.40', average: [255, 120, 40] },
  { slug: 'buffet', name: 'Buffet', host: '192.168.1.41', average: [180, 50, 240] },
  { slug: 'canape', name: 'Canapé', host: '192.168.1.42', average: [0, 170, 220] },
];

function instanceStates(connected: boolean): {
  states: Record<string, HassEntity>;
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: HomeAssistant['devices'];
} {
  const now = new Date().toISOString();
  const states: Record<string, HassEntity> = {};
  const entities: Record<string, EntityRegistryDisplayEntry> = {};
  const devices: HomeAssistant['devices'] = {};
  for (const item of INSTANCES) {
    const device = `hyperhdr_instance_${item.slug}`;
    devices[device] = {
      id: device,
      name: item.name,
      name_by_user: null,
      manufacturer: 'HyperHDR',
      model: 'LED instance',
      area_id: 'salon',
      via_device_id: HUB_DEVICE,
    };
    const add = (id: string, key: string | undefined, state: string, attributes = {}) => {
      entities[id] = {
        entity_id: id,
        device_id: device,
        platform: HYPERHDR_INTEGRATION,
        translation_key: key,
        labels: [],
      };
      states[id] = { entity_id: id, state, attributes, last_changed: now, last_updated: now };
    };
    const value = (text: string) => (connected ? text : 'unavailable');
    add(`light.hyperhdr_${item.slug}`, undefined, value('on'), {
      effect: 'Capture',
      effect_list: ['Capture', 'Solid'],
      brightness: 230,
    });
    add(`sensor.hyperhdr_${item.slug}_visible_source`, 'visible_source', value('videograbber'));
    add(`sensor.hyperhdr_${item.slug}_led_device`, 'led_device', value('wled'), {
      address: item.host,
    });
    add(`sensor.hyperhdr_${item.slug}_average_color`, 'average_color', value('on'), {
      rgb_color: item.average,
    });
    add(`switch.hyperhdr_${item.slug}_led_output`, 'led_output', value('on'));
  }
  return { states, entities, devices };
}

interface Scenario {
  title: string;
  ambilight?: AmbilightScenario;
  /** No box in this home at all. */
  noBox?: boolean;
  /** Live override of each salon strip ("0": follows the screen). */
  overrides?: [string, string, string];
  config: Record<string, unknown>;
}

const base = {
  entity: GROUP_ID,
  name: 'LEDs',
  power: { sensor_pattern: 'sensor.{object_id}_puissance', voltage: 5 },
  tile: { favorites: ['#ff8a3d', '#8a2be2', '#00b4d8', { kelvin: 2700, brightness: 40 }] },
};

const SCENARIOS: Scenario[] = [
  {
    title: fr ? 'Repliée · sans boîtier' : 'Collapsed · no box',
    noBox: true,
    config: { ...base, layout: 'collapsible' },
  },
  {
    title: fr ? 'Dépliée · sans boîtier' : 'Expanded · no box',
    noBox: true,
    config: { ...base, layout: 'collapsible', expanded: true },
  },
  {
    title: fr ? 'Ambilight actif · dépliée' : 'Ambilight on · expanded',
    overrides: ['0', '0', '0'],
    config: { ...base, layout: 'collapsible', expanded: true, ambilight: { inputs } },
  },
  {
    title: fr ? 'Ambilight actif · repliée' : 'Ambilight on · collapsed',
    overrides: ['0', '0', '0'],
    config: { ...base, layout: 'collapsible', ambilight: { inputs } },
  },
  {
    title: fr ? 'Ambilight coupé · couleur à la main' : 'Ambilight off · color by hand',
    ambilight: { piOff: true },
    overrides: ['1', '1', '0'],
    config: { ...base, layout: 'collapsible', expanded: true, ambilight: { inputs } },
  },
  {
    title: fr ? 'Alerte : CPU du Pi en surchauffe' : 'Alert: Pi CPU overheating',
    ambilight: { cpuTemperature: 84 },
    overrides: ['0', '1', '1'],
    config: { ...base, layout: 'collapsible', ambilight: { inputs } },
  },
  {
    title: fr ? 'Alerte : ventilateur bloqué' : 'Alert: fan stalled',
    ambilight: { stalled: true },
    config: { ...base, layout: 'collapsible', ambilight: { inputs } },
  },
  {
    title: fr ? 'Disposition par défaut + rail' : 'Default layout + rail',
    overrides: ['0', '0', '1'],
    config: { ...base, ambilight: { inputs } },
  },
  {
    title: fr
      ? 'Disposition par défaut · sans boîtier (inchangée)'
      : 'Default layout · no box (as before)',
    noBox: true,
    config: { ...base },
  },
];

const STRIPS = ['salon_ambilight_wled', 'salon_buffet_wled', 'salon_canape_wled'];

type Card = HTMLElement & { hass?: HomeAssistant; setConfig(config: unknown): void };
const cards: Card[] = [];
const stage = document.getElementById('stage')!;
const only = params.get('only');

SCENARIOS.forEach((item, index) => {
  if (only !== null && Number(only) !== index) return;
  const leds = createMockHass(language, { allOnline: true });
  item.overrides?.forEach((option, at) =>
    leds.setState(`select.${STRIPS[at]}_live_override`, option),
  );
  const box = item.noBox ? undefined : createAmbilightMock({ ...item.ambilight, language });
  let ledHass = leds.hass;
  let boxHass = box?.hass;

  const section = document.createElement('section');
  const heading = document.createElement('h2');
  heading.textContent = item.title;
  const card = document.createElement('vivid-led-group') as Card;
  card.setConfig({ type: 'custom:vivid-led-group', ...item.config });
  section.append(heading, card);
  stage.append(section);
  cards.push(card);

  const publish = () => {
    if (!boxHass) {
      card.hass = ledHass;
      return;
    }
    const connected =
      boxHass.states['binary_sensor.salon_ambilight_hyperhdr_hub_connected']?.state === 'on';
    const instances = instanceStates(connected);
    const merged: HomeAssistant = {
      ...ledHass,
      states: { ...ledHass.states, ...boxHass.states, ...instances.states },
      entities: { ...ledHass.entities, ...boxHass.entities, ...instances.entities },
      devices: { ...ledHass.devices, ...boxHass.devices, ...instances.devices },
      callService: async (domain, service, data, target) => {
        const ids = [target?.entity_id ?? (data as { entity_id?: string })?.entity_id]
          .flat()
          .filter(Boolean) as string[];
        const owner = ids.some((id) => boxHass?.states[id]) ? box?.hass : leds.hass;
        await owner?.callService(domain, service, data, target);
      },
    };
    card.hass = merged;
  };
  leds.subscribe((hass) => {
    ledHass = hass;
    publish();
  });
  box?.subscribe((hass) => {
    boxHass = hass;
    publish();
  });
});

if (params.has('details')) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  window.location.hash = '';
  const card = cards[0] as Card & { openDetails?: () => void };
  (card as unknown as { openDetails: () => void }).openDetails?.();
}

Object.assign(window, { vivid: { cards } });

if (params.has('editor')) {
  type Editor = HTMLElement & {
    hass?: HomeAssistant;
    setConfig(config: unknown): void;
    _open: Set<string>;
  };
  const card = cards[0];
  const editor = document.createElement('vivid-led-group-editor') as Editor;
  let current: Record<string, unknown> = {
    type: 'custom:vivid-led-group',
    ...SCENARIOS[Number(only ?? 0)]?.config,
  };
  editor.setConfig(current);
  editor._open = new Set(['box', 'appearance']);
  editor.addEventListener('config-changed', (event) => {
    current = (event as CustomEvent<{ config: Record<string, unknown> }>).detail.config;
    editor.setConfig(current);
    card?.setConfig(current);
  });
  const feed = () => {
    editor.hass = card?.hass;
    window.setTimeout(feed, 500);
  };
  feed();
  stage.prepend(editor);
}
