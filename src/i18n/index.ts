import type { HomeAssistant } from '../core/hass-types';

const en = {
  off: 'Off',
  unavailable: 'Unavailable',
  power_on: 'Turn on',
  power_off: 'Turn off',
  consumption: 'Consumption',
  live_override_on: 'Live override on — realtime data ignored',
  live_override_off: 'Live override off — realtime data shown',
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
};

type Strings = typeof en;

const fr: Strings = {
  off: 'Éteint',
  unavailable: 'Indisponible',
  power_on: 'Allumer',
  power_off: 'Éteindre',
  consumption: 'Consommation',
  live_override_on: 'Remplacement en direct activé — flux temps réel ignoré',
  live_override_off: 'Remplacement en direct désactivé — flux temps réel affiché',
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
  sync_send: 'Envoyer la synchro',
  sync_receive: 'Recevoir la synchro',
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
