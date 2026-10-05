/**
 * Resting variants (outline, else crossed out) of the Material Design Icons a
 * lamp or an appliance on a plug usually has, so a card can switch between
 * two icons. Generated from @mdi/js; icons without a variant keep their own.
 */
const RESTING: Record<string, string> = {
  'alarm-light': 'alarm-light-outline',
  'ceiling-light': 'ceiling-light-outline',
  'ceiling-light-multiple': 'ceiling-light-multiple-outline',
  'coffee-maker': 'coffee-maker-outline',
  'coffee-maker-check': 'coffee-maker-check-outline',
  'desk-lamp': 'desk-lamp-off',
  fan: 'fan-off',
  flashlight: 'flashlight-off',
  'floor-lamp': 'floor-lamp-outline',
  'floor-lamp-dual': 'floor-lamp-dual-outline',
  'floor-lamp-torchiere': 'floor-lamp-torchiere-outline',
  'floor-lamp-torchiere-variant': 'floor-lamp-torchiere-variant-outline',
  'globe-light': 'globe-light-outline',
  'head-lightbulb': 'head-lightbulb-outline',
  'home-lightbulb': 'home-lightbulb-outline',
  'home-lightning-bolt': 'home-lightning-bolt-outline',
  kettle: 'kettle-outline',
  'kettle-alert': 'kettle-alert-outline',
  'kettle-steam': 'kettle-steam-outline',
  lamp: 'lamp-outline',
  lamps: 'lamps-outline',
  'light-switch': 'light-switch-off',
  lightbulb: 'lightbulb-outline',
  'lightbulb-alert': 'lightbulb-alert-outline',
  'lightbulb-auto': 'lightbulb-auto-outline',
  'lightbulb-cfl': 'lightbulb-cfl-off',
  'lightbulb-cfl-spiral': 'lightbulb-cfl-spiral-off',
  'lightbulb-fluorescent-tube': 'lightbulb-fluorescent-tube-outline',
  'lightbulb-group': 'lightbulb-group-outline',
  'lightbulb-multiple': 'lightbulb-multiple-outline',
  'lightbulb-night': 'lightbulb-night-outline',
  'lightbulb-on': 'lightbulb-on-outline',
  'lightbulb-question': 'lightbulb-question-outline',
  'lightbulb-spot': 'lightbulb-spot-off',
  'lightbulb-variant': 'lightbulb-variant-outline',
  'lightning-bolt': 'lightning-bolt-outline',
  'monitor-speaker': 'monitor-speaker-off',
  'power-plug': 'power-plug-outline',
  'power-plug-battery': 'power-plug-battery-outline',
  radio: 'radio-off',
  radioactive: 'radioactive-off',
  'radioactive-circle': 'radioactive-circle-outline',
  'radiology-box': 'radiology-box-outline',
  speaker: 'speaker-off',
  'string-lights': 'string-lights-off',
  television: 'television-off',
  'television-classic': 'television-classic-off',
  'television-speaker': 'television-speaker-off',
  'track-light': 'track-light-off',
  'traffic-light': 'traffic-light-outline',
  'wall-sconce': 'wall-sconce-outline',
  'wall-sconce-flat': 'wall-sconce-flat-outline',
  'wall-sconce-flat-variant': 'wall-sconce-flat-variant-outline',
  'wall-sconce-round': 'wall-sconce-round-outline',
  'wall-sconce-round-variant': 'wall-sconce-round-variant-outline',
};

/** The resting icon of `icon` (`mdi:lamp` → `mdi:lamp-outline`), or `icon` itself. */
export function restingIcon(icon: string): string {
  const name = icon.replace(/^mdi:/, '');
  const variant = RESTING[name];
  return variant ? `mdi:${variant}` : icon;
}

/** True when `icon` has a resting variant. */
export function hasRestingIcon(icon: string): boolean {
  return icon.replace(/^mdi:/, '') in RESTING;
}
