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
  brightness: 'Brightness',
  details: 'Show details',
  close: 'Close',
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
  brightness: 'Luminosité',
  details: 'Afficher le détail',
  close: 'Fermer',
};

const LANGUAGES: Record<string, Strings> = { en, fr };

export type StringKey = keyof Strings;

export function languageOf(hass: HomeAssistant | undefined): string {
  return (hass?.locale?.language ?? hass?.language ?? 'en').split('-')[0] ?? 'en';
}

export function localize(hass: HomeAssistant | undefined, key: StringKey): string {
  const strings = LANGUAGES[languageOf(hass)] ?? en;
  return strings[key];
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
