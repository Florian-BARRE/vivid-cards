/* ====== Code Summary ======
 * Words for Vivid Pilot nodes in the editors: each category's name and a
 * node's label ("Maison", "Salon", "Salon › Lumières").
 */

import type { HomeAssistant } from '../core/hass-types';
import { PilotIndex, parseNodeKey, type PilotCategory } from '../core/pilot';
import { languageOf } from './index';

type CategoryNames = Record<PilotCategory, string> & { home: string };

const en: CategoryNames = {
  home: 'Home',
  light: 'Lights',
  led: 'LEDs',
  switch: 'Switches',
  door: 'Doors',
  window: 'Windows',
  presence: 'Presence',
  temperature: 'Temperature',
  humidity: 'Humidity',
  pressure: 'Pressure',
  co2: 'CO₂',
  illuminance: 'Illuminance',
  battery: 'Batteries',
  power: 'Power',
};

const fr: CategoryNames = {
  home: 'Maison',
  light: 'Lumières',
  led: 'LEDs',
  switch: 'Interrupteurs',
  door: 'Portes',
  window: 'Fenêtres',
  presence: 'Présence',
  temperature: 'Température',
  humidity: 'Humidité',
  pressure: 'Pression',
  co2: 'CO₂',
  illuminance: 'Éclairement',
  battery: 'Batteries',
  power: 'Puissance',
};

const LANGUAGES: Record<string, CategoryNames> = { en, fr };

function names(hass: HomeAssistant | undefined): CategoryNames {
  return LANGUAGES[languageOf(hass)] ?? en;
}

/** The name of a category ("Lumières"). */
export function pilotCategoryName(
  hass: HomeAssistant | undefined,
  category: PilotCategory,
): string {
  return names(hass)[category];
}

/** A node's label: "Maison", "Salon", "Salon › Lumières", "Maison › Batteries". */
export function pilotNodeLabel(hass: HomeAssistant | undefined, key: string): string {
  const { area, category } = parseNodeKey(key);
  const place = area ? (hass ? PilotIndex.of(hass).areaName(area) : area) : names(hass).home;
  return category ? `${place} › ${names(hass)[category]}` : place;
}
