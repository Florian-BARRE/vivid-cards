/**
 * A simulated HA-HyperHDR integration for the preview page and the tests:
 * a server device and its instance devices, with the entities and states the
 * integration really creates (taken from a run against HyperHDR 22).
 */
import type { EntityRegistryDisplayEntry, HassEntity, HomeAssistant } from '../src/core/hass-types';
import { HYPERHDR_INTEGRATION, INSTANCE_MODEL } from '../src/cards/hyperhdr/model';

export interface HyperHdrScenario {
  language?: string;
  /** The server is unreachable. */
  offline?: boolean;
  /** 74 °C and undervoltage. */
  hot?: boolean;
  /** No admin password: no picture, no settings. */
  noAdmin?: boolean;
}

export interface HyperHdrMock {
  readonly hass: HomeAssistant;
  readonly calls: { domain: string; service: string; data: unknown; target: unknown }[];
  subscribe(listener: (hass: HomeAssistant) => void): () => void;
}

export const SERVER_DEVICE = 'hyperhdr_server';
export const STRIPS = [
  { device: 'hyperhdr_tv', slug: 'tv', name: 'TV', leds: 120, host: '192.168.1.42' },
  { device: 'hyperhdr_desk', slug: 'bureau', name: 'Bureau', leds: 64, host: '192.168.1.43' },
  { device: 'hyperhdr_bedroom', slug: 'chambre', name: 'Chambre', leds: 90, host: '192.168.1.44' },
] as const;

const EFFECTS = [
  'Atomic swirl',
  'Blue mood blobs',
  'Breath',
  'Candle',
  'Cinema brighten lights',
  'Cold mood blobs',
  'Double swirl',
  'Full color mood blobs',
  'Knight rider',
  'Northern lights',
  'Rainbow swirl',
  'Sea waves',
  'Warm mood blobs',
];

export function createHyperHdrMock(scenario: HyperHdrScenario = {}): HyperHdrMock {
  const language = scenario.language ?? 'en';
  const listeners = new Set<(hass: HomeAssistant) => void>();
  const calls: HyperHdrMock['calls'] = [];
  let states: Record<string, HassEntity> = {};
  const registry: Record<string, EntityRegistryDisplayEntry> = {};
  const now = new Date().toISOString();

  const put = (entityId: string, state: string, attributes: HassEntity['attributes'] = {}) => {
    const previous = states[entityId];
    states = {
      ...states,
      [entityId]: {
        entity_id: entityId,
        state,
        attributes: { ...(previous?.attributes ?? {}), ...attributes },
        last_changed: now,
        last_updated: new Date().toISOString(),
      },
    };
  };
  const add = (
    device: string,
    entityId: string,
    key: string | undefined,
    state: string,
    attributes: HassEntity['attributes'] = {},
  ) => {
    registry[entityId] = {
      entity_id: entityId,
      device_id: device,
      platform: HYPERHDR_INTEGRATION,
      translation_key: key,
      labels: [],
    };
    put(entityId, state, attributes);
  };

  const off = scenario.offline;
  const value = (text: string) => (off ? 'unavailable' : text);
  const server = 'hyperhdr_salon';
  add(SERVER_DEVICE, `binary_sensor.${server}_connected`, 'connected', off ? 'off' : 'on');
  add(
    SERVER_DEVICE,
    `binary_sensor.${server}_undervoltage`,
    'undervoltage',
    value(scenario.hot ? 'on' : 'off'),
  );
  add(SERVER_DEVICE, `sensor.${server}_cpu`, 'cpu', value(scenario.hot ? '64' : '23.4'), {
    unit_of_measurement: '%',
  });
  add(
    SERVER_DEVICE,
    `sensor.${server}_cpu_temperature`,
    'cpu_temperature',
    value(scenario.hot ? '74.2' : '52.3'),
    {
      unit_of_measurement: '°C',
    },
  );
  add(SERVER_DEVICE, `sensor.${server}_memory`, 'memory', value('18.2'), {
    unit_of_measurement: '%',
    used_mb: 1460,
    total_mb: 8003,
  });
  add(
    SERVER_DEVICE,
    `sensor.${server}_capture_rate`,
    'capture_fps',
    value(scenario.hot ? '31' : '60'),
    {
      unit_of_measurement: 'fps',
    },
  );
  add(SERVER_DEVICE, `sensor.${server}_grabber`, 'grabber', value('USB Video'), {
    video_mode: '1920x1080',
    active: 'V4L2:USB Video',
  });
  add(SERVER_DEVICE, `sensor.${server}_video_mode`, 'video_mode', value('1920×1080 · 60 Hz'));
  add(SERVER_DEVICE, `sensor.${server}_version`, 'version', value('22.0.0'), {
    architecture: 'aarch64',
    cpu: 'Raspberry Pi 5',
    hostname: 'salon',
  });
  if (!scenario.noAdmin) {
    add(SERVER_DEVICE, `camera.${server}_captured_picture`, 'capture', value('idle'), {
      access_token: 'dev',
      entity_picture: '/api/camera_proxy/camera.hyperhdr_salon_captured_picture?token=dev',
    });
  }

  const sources = [
    { light: 'on', effect: 'Capture', visible: 'videograbber', rgb: undefined, gain: 78 },
    { light: 'on', effect: 'Northern lights', visible: 'effect', rgb: undefined, gain: 60 },
    { light: 'off', effect: 'Capture', visible: 'none', rgb: undefined, gain: 100 },
  ] as const;
  STRIPS.forEach((strip, index) => {
    const s = sources[index] ?? sources[0];
    const id = (domain: string, object: string) => `${domain}.${strip.slug}_${object}`;
    add(strip.device, `light.${strip.slug}`, undefined, value(s.light), {
      effect_list: ['Capture', 'Solid', ...EFFECTS],
      effect: s.effect,
      brightness: Math.round((Math.min(s.gain, 100) / 100) * 255),
      supported_color_modes: ['hs'],
      color_mode: 'hs',
      hs_color: [0, 0],
    });
    add(strip.device, id('sensor', 'visible_source'), 'visible_source', value(s.visible), {
      origin: s.visible === 'effect' ? `${s.effect}@hyperhdr` : 'System',
      priority: s.visible === 'effect' ? 128 : 240,
    });
    add(
      strip.device,
      id('sensor', 'output_rate'),
      'output_fps',
      value(s.light === 'on' ? '58' : '0'),
      {
        unit_of_measurement: 'fps',
      },
    );
    add(strip.device, id('sensor', 'leds'), 'led_count', value(String(strip.leds)));
    // The LED device needs the admin password, as in the integration.
    if (!scenario.noAdmin) {
      add(strip.device, id('sensor', 'led_device'), 'led_device', value('wled'), {
        address: strip.host,
        refresh_time_ms: 20,
      });
    }
    add(strip.device, id('select', 'source'), 'source', value('auto'), { options: ['auto'] });
    add(strip.device, id('button', 'give_back_to_capture'), 'clear', value('unknown'));
    const switches: [string, string, string][] = [
      ['led_output', 'led_output', 'on'],
      ['video_capture', 'video_capture', 'on'],
      ['smoothing', 'smoothing', 'on'],
      ['black_border_detection', 'black_border', 'off'],
      ['hdr_tone_mapping', 'hdr', index === 0 ? 'on' : 'off'],
    ];
    if (!scenario.noAdmin) {
      switches.push(
        ['continuous_output', 'continuous_output', 'off'],
        ['anti_flickering_filter', 'anti_flickering', 'on'],
        ['background_effect', 'background_effect', 'off'],
        ['boot_effect', 'boot_effect', 'on'],
        ['automatic_tone_mapping', 'auto_tone_mapping', 'off'],
      );
    }
    for (const [object, key, state] of switches)
      add(strip.device, id('switch', object), key, value(state));
    const numbers: [string, string, string, Record<string, unknown>][] = [
      [
        'brightness',
        'brightness_gain',
        String(s.gain),
        { min: 0, max: 200, step: 1, unit_of_measurement: '%' },
      ],
      [
        'saturation',
        'saturation_gain',
        '110',
        { min: 0, max: 200, step: 1, unit_of_measurement: '%' },
      ],
      ['gamma', 'gamma', '1.5', { min: 0.5, max: 4, step: 0.05 }],
      [
        'backlight_threshold',
        'backlight',
        '2',
        { min: 0, max: 20, step: 0.1, unit_of_measurement: '%' },
      ],
    ];
    if (!scenario.noAdmin) {
      numbers.push([
        'smoothing_time',
        'smoothing_time',
        '150',
        { min: 25, max: 5000, step: 5, unit_of_measurement: 'ms' },
      ]);
    }
    for (const [object, key, state, attributes] of numbers) {
      add(strip.device, id('number', object), key, value(state), { mode: 'slider', ...attributes });
    }
    add(strip.device, id('select', 'processing'), 'processing', value('advanced'), {
      options: ['advanced', 'multicolor_mean', 'unicolor_mean', 'weighted'],
    });
    add(strip.device, id('select', 'color_temperature'), 'color_temperature', value('neutral'), {
      options: ['disabled', 'cold', 'neutral', 'warm', 'custom'],
    });
    if (!scenario.noAdmin) {
      add(
        strip.device,
        id('select', 'smoothing_type'),
        'smoothing_type',
        value('hybridrgbinterpolator'),
        {
          options: [
            'stepper',
            'yuvinterpolator',
            'rgbinterpolator',
            'hybridinterpolator',
            'hybridrgbinterpolator',
            'exponentialinterpolator',
          ],
        },
      );
    }
  });

  const labels: Record<string, Record<string, string>> = {
    fr: {
      advanced: 'Avancé',
      multicolor_mean: 'Moyenne multicolore',
      unicolor_mean: 'Moyenne unicolore',
      weighted: 'Pondéré',
      disabled: 'Désactivée',
      cold: 'Froide',
      neutral: 'Neutre',
      warm: 'Chaude',
      custom: 'Personnalisée',
      stepper: 'Par paliers',
      yuvinterpolator: 'YUV',
      rgbinterpolator: 'RVB',
      hybridinterpolator: 'Hybride',
      hybridrgbinterpolator: 'Hybride RVB',
      exponentialinterpolator: 'Exponentiel',
      auto: 'Automatique',
    },
    en: {
      advanced: 'Advanced',
      multicolor_mean: 'Multicolor mean',
      unicolor_mean: 'Unicolor mean',
      weighted: 'Weighted',
      disabled: 'Disabled',
      cold: 'Cold',
      neutral: 'Neutral',
      warm: 'Warm',
      custom: 'Custom',
      stepper: 'Stepper',
      yuvinterpolator: 'YUV',
      rgbinterpolator: 'RGB',
      hybridinterpolator: 'Hybrid',
      hybridrgbinterpolator: 'Hybrid RGB',
      exponentialinterpolator: 'Exponential',
      auto: 'Automatic',
    },
  };

  let hass: HomeAssistant;
  const publish = () => {
    hass = { ...hass, states };
    for (const listener of listeners) listener(hass);
  };

  const callService: HomeAssistant['callService'] = async (
    domain,
    service,
    data = {},
    target = {},
  ) => {
    calls.push({ domain, service, data, target });
    const ids =
      target.entity_id === undefined
        ? []
        : Array.isArray(target.entity_id)
          ? target.entity_id
          : [target.entity_id];
    for (const entityId of ids) {
      const current = states[entityId];
      if (!current) continue;
      if (domain === 'light') {
        const on = service === 'toggle' ? current.state !== 'on' : service === 'turn_on';
        const attributes: Record<string, unknown> = {};
        const effect = (data as { effect?: string }).effect;
        const rgb = (data as { rgb_color?: number[] }).rgb_color;
        const slug = entityId.split('.')[1];
        if (effect || rgb) {
          attributes.effect = rgb ? 'Solid' : effect;
          attributes.rgb_color = rgb ?? null;
          const visible = rgb ? 'color' : effect === 'Capture' ? 'videograbber' : 'effect';
          put(`sensor.${slug}_visible_source`, visible, {
            origin: effect ? `${effect}@hyperhdr` : 'Home Assistant',
          });
        }
        put(entityId, on ? 'on' : 'off', attributes);
      } else if (domain === 'switch') {
        const on = service === 'toggle' ? current.state !== 'on' : service === 'turn_on';
        put(entityId, on ? 'on' : 'off');
      } else if (domain === 'number' && service === 'set_value') {
        put(entityId, String((data as { value?: number }).value));
      } else if (domain === 'select' && service === 'select_option') {
        put(entityId, String((data as { option?: string }).option));
      }
    }
    publish();
  };

  hass = {
    states,
    entities: registry,
    devices: {
      [SERVER_DEVICE]: {
        id: SERVER_DEVICE,
        name: 'HyperHDR salon',
        name_by_user: null,
        manufacturer: 'HyperHDR',
        model: 'Raspberry Pi 5',
        area_id: 'salon',
      },
      ...Object.fromEntries(
        STRIPS.map((strip) => [
          strip.device,
          {
            id: strip.device,
            name: strip.name,
            name_by_user: null,
            manufacturer: 'HyperHDR',
            model: INSTANCE_MODEL,
            area_id: 'salon',
            via_device_id: SERVER_DEVICE,
          },
        ]),
      ),
    },
    language,
    locale: { language },
    themes: { darkMode: true },
    config: { currency: 'EUR', time_zone: 'Europe/Paris' },
    callService,
    formatEntityState: (stateObj, state) => {
      const raw = state ?? stateObj.state;
      return (labels[language] ?? labels.en)?.[raw] ?? raw;
    },
  };

  return {
    get hass() {
      return hass;
    },
    calls,
    subscribe(listener) {
      listeners.add(listener);
      listener(hass);
      return () => listeners.delete(listener);
    },
  };
}
