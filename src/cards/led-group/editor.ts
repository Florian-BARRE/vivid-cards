import type { LedGroupCardConfig } from './config';

/** Schema for Home Assistant's built-in form editor (`getConfigForm`). */
export const LED_GROUP_FORM_SCHEMA = [
  { name: 'entity', required: true, selector: { entity: { domain: 'light' } } },
  {
    type: 'grid',
    name: '',
    schema: [
      { name: 'name', selector: { text: {} } },
      { name: 'icon', selector: { icon: {} }, context: { icon_entity: 'entity' } },
    ],
  },
  { name: 'details_hash', selector: { text: {} } },
  {
    type: 'grid',
    name: '',
    schema: [
      { name: 'show_power', default: true, selector: { boolean: {} } },
      { name: 'show_live_override', default: true, selector: { boolean: {} } },
      { name: 'show_effects', default: true, selector: { boolean: {} } },
      { name: 'show_hue', default: true, selector: { boolean: {} } },
    ],
  },
  {
    type: 'expandable',
    name: 'power',
    title: 'Power',
    icon: 'mdi:flash',
    schema: [
      { name: 'sensor_pattern', selector: { text: {} } },
      {
        type: 'grid',
        name: '',
        schema: [
          {
            name: 'voltage',
            selector: {
              number: { min: 1, max: 48, step: 0.1, mode: 'box', unit_of_measurement: 'V' },
            },
          },
          {
            name: 'idle',
            selector: { number: { min: 0, step: 0.5, mode: 'box', unit_of_measurement: 'W' } },
          },
          {
            name: 'max',
            selector: { number: { min: 1, step: 1, mode: 'box', unit_of_measurement: 'W' } },
          },
        ],
      },
    ],
  },
] as const;

const LABELS: Record<string, string> = {
  entity: 'Light or light group',
  name: 'Name',
  icon: 'Icon',
  details_hash: 'Details link (URL hash)',
  show_power: 'Consumption badge',
  show_live_override: 'Live override badge',
  show_effects: 'Effect picker',
  show_hue: 'Color bar',
  sensor_pattern: 'Power sensor pattern',
  voltage: 'Strip voltage',
  idle: 'Idle below',
  max: 'Full glow at',
};

const HELPERS: Record<string, string> = {
  details_hash:
    'Optional. Opens the details when the URL ends with this hash, e.g. salon-leds lets other cards navigate to #salon-leds.',
  sensor_pattern:
    'Optional. Power sensor of each strip; {object_id} is replaced by the light object id, e.g. sensor.{object_id}_power.',
  voltage: 'Converts the WLED estimated current to watts when a strip has no power sensor.',
  idle: 'Watts per strip under which the badge stays neutral.',
  max: 'Watts per strip at which the glow is the brightest.',
};

export const ledGroupConfigForm = {
  schema: LED_GROUP_FORM_SCHEMA,
  computeLabel: (schema: { name: string }) => LABELS[schema.name],
  computeHelper: (schema: { name: string }) => HELPERS[schema.name],
  assertConfig: (config: LedGroupCardConfig) => {
    if (config.members !== undefined) {
      throw new Error('"members" overrides can only be edited in YAML.');
    }
  },
};
