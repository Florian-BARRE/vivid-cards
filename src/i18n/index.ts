import type { HomeAssistant } from '../core/hass-types';

const en = {
  off: 'Off',
  on: 'On',
  unavailable: 'Unavailable',
  power_on: 'Turn on',
  power_off: 'Turn off',
  lights_on: '{on}/{total} on',
  consumption: 'Consumption',
  ambilight_on: 'Ambilight on — realtime data shown',
  ambilight_off: 'Ambilight off — WLED ignores realtime data',
  live_override_unavailable: 'Live override unavailable',
  effect: 'Effect',
  hue: 'Color',
  temperature: 'Color temperature',
  brightness: 'Brightness',
  details: 'Show details',
  close: 'Close',
  favorites: 'Favorite colors',
  preset: 'Preset',
  playlist: 'Playlist',
  palette: 'Palette',
  speed: 'Speed',
  intensity: 'Intensity',
  nightlight: 'Nightlight',
  sync_send: 'Send sync',
  sync_receive: 'Receive sync',
  device: 'Device',
  wifi: 'Wi-Fi',
  uptime: 'Uptime',
  leds: 'LEDs',
  current_limit: 'Current limit',
  memory: 'Free memory',
  ip: 'IP',
  firmware: 'Firmware',
  update_available: 'Update {version}',
  up_to_date: 'Up to date',
  restart: 'Restart',
  restart_confirm: 'Tap again to restart',
  limiter_off: 'off',
  days: '{d} d {h} h',
  hours: '{h} h {m} min',
  minutes: '{m} min',
  settings: 'Settings',
  settings_hint: 'Presets, palette, speed',
  reverse: 'Reverse',
  freeze: 'Freeze',
  static_effect_hint: 'Speed and intensity drive the animated effects.',
  switches_one: '1 switch on',
  switches_other: '{count} switches on',
  update: 'Update',
  update_short: 'update {version}',
  range_6h: '6 h',
  range_24h: '24 h',
  range_7d: '7 d',
  over_range: 'Last {range}',
  average: 'avg',
  peak: 'Peak',
  total: 'Total',
  period: 'Period',
  no_data: 'no data',
  today: 'Today',
  now: 'now',
};

type Strings = typeof en;

const fr: Strings = {
  off: 'Éteint',
  on: 'Allumé',
  unavailable: 'Indisponible',
  power_on: 'Allumer',
  power_off: 'Éteindre',
  lights_on: '{on}/{total} allumées',
  consumption: 'Consommation',
  ambilight_on: 'Ambilight activé — flux temps réel affiché',
  ambilight_off: 'Ambilight désactivé — WLED ignore le flux temps réel',
  live_override_unavailable: 'Remplacement en direct indisponible',
  effect: 'Effet',
  hue: 'Couleur',
  temperature: 'Température de couleur',
  brightness: 'Luminosité',
  details: 'Afficher le détail',
  close: 'Fermer',
  favorites: 'Couleurs favorites',
  preset: 'Preset',
  playlist: 'Playlist',
  palette: 'Palette',
  speed: 'Vitesse',
  intensity: 'Intensité',
  nightlight: 'Veilleuse',
  sync_send: 'Envoi synchro',
  sync_receive: 'Réception synchro',
  device: 'Appareil',
  wifi: 'Wi-Fi',
  uptime: 'Allumé depuis',
  leds: 'LEDs',
  current_limit: 'Limite de courant',
  memory: 'Mémoire libre',
  ip: 'IP',
  firmware: 'Firmware',
  update_available: 'Mise à jour {version}',
  up_to_date: 'À jour',
  restart: 'Redémarrer',
  restart_confirm: 'Appuie encore pour redémarrer',
  limiter_off: 'désactivée',
  days: '{d} j {h} h',
  hours: '{h} h {m} min',
  minutes: '{m} min',
  settings: 'Réglages',
  settings_hint: 'Presets, palette, vitesse',
  reverse: 'Inversé',
  freeze: 'Figé',
  static_effect_hint: 'Vitesse et intensité agissent sur les effets animés.',
  switches_one: '1 option active',
  switches_other: '{count} options actives',
  update: 'Mettre à jour',
  update_short: 'MAJ {version}',
  range_6h: '6 h',
  range_24h: '24 h',
  range_7d: '7 j',
  over_range: 'Sur {range}',
  average: 'moy.',
  peak: 'Pic',
  total: 'Total',
  period: 'Période',
  no_data: 'pas de données',
  today: 'Aujourd’hui',
  now: 'maintenant',
};

const LANGUAGES: Record<string, Strings> = { en, fr };

export type StringKey = keyof Strings;

export function languageOf(hass: HomeAssistant | undefined): string {
  return (hass?.locale?.language ?? hass?.language ?? 'en').split('-')[0] ?? 'en';
}

export function localize(
  hass: HomeAssistant | undefined,
  key: StringKey,
  values: Record<string, string | number> = {},
): string {
  const strings = LANGUAGES[languageOf(hass)] ?? en;
  return strings[key].replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

/** "3 d 4 h", "5 h 12 min", "8 min". */
export function formatDuration(hass: HomeAssistant | undefined, seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return localize(hass, 'days', { d: days, h: hours % 24 });
  if (hours > 0) return localize(hass, 'hours', { h: hours, m: minutes % 60 });
  return localize(hass, 'minutes', { m: minutes });
}

export function formatNumber(hass: HomeAssistant | undefined, value: number, digits = 0): string {
  try {
    return new Intl.NumberFormat(hass?.locale?.language ?? hass?.language ?? 'en', {
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return value.toFixed(digits);
  }
}
