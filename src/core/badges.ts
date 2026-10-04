import { domainOf, friendlyName, isAvailable } from './entities';
import type { HomeAssistant } from './hass-types';

export interface BadgeModel {
  entityId: string;
  name: string;
  icon: string;
  /** Formatted state; none for on/off entities, which show it with their color. */
  label?: string;
  /** An on/off entity that is on. */
  active: boolean;
  available: boolean;
}

const BINARY_DOMAINS = new Set(['binary_sensor', 'switch', 'input_boolean', 'light', 'fan']);

/** Icons per device class: [off, on] for on/off entities, one icon for sensors. */
const BINARY_ICONS: Record<string, [string, string]> = {
  door: ['mdi:door-closed', 'mdi:door-open'],
  garage_door: ['mdi:garage', 'mdi:garage-open'],
  window: ['mdi:window-closed', 'mdi:window-open'],
  opening: ['mdi:square-outline', 'mdi:square'],
  motion: ['mdi:motion-sensor-off', 'mdi:motion-sensor'],
  occupancy: ['mdi:home-outline', 'mdi:home'],
  presence: ['mdi:home-outline', 'mdi:home'],
  moisture: ['mdi:water-off', 'mdi:water'],
  smoke: ['mdi:smoke-detector', 'mdi:smoke-detector-alert'],
  light: ['mdi:brightness-5', 'mdi:brightness-7'],
  battery: ['mdi:battery', 'mdi:battery-outline'],
  plug: ['mdi:power-plug-off', 'mdi:power-plug'],
};

const SENSOR_ICONS: Record<string, string> = {
  temperature: 'mdi:thermometer',
  humidity: 'mdi:water-percent',
  illuminance: 'mdi:brightness-5',
  battery: 'mdi:battery',
  power: 'mdi:flash',
  energy: 'mdi:lightning-bolt',
  carbon_dioxide: 'mdi:molecule-co2',
  pressure: 'mdi:gauge',
  voltage: 'mdi:sine-wave',
  current: 'mdi:current-ac',
};

const DOMAIN_ICONS: Record<string, string> = {
  binary_sensor: 'mdi:radiobox-blank',
  switch: 'mdi:toggle-switch-variant',
  input_boolean: 'mdi:toggle-switch-variant',
  light: 'mdi:lightbulb',
  fan: 'mdi:fan',
  person: 'mdi:account',
  sensor: 'mdi:eye',
};

function formatState(hass: HomeAssistant, entityId: string, state: string): string {
  const value = Number(state);
  const unit = hass.states[entityId]?.attributes.unit_of_measurement;
  if (state.trim() === '' || !Number.isFinite(value)) return state;
  const precision =
    hass.entities?.[entityId]?.display_precision ??
    (Number.isInteger(value) || Math.abs(value) >= 100 ? 0 : 1);
  let text: string;
  try {
    text = new Intl.NumberFormat(hass.locale?.language ?? hass.language ?? 'en', {
      maximumFractionDigits: precision,
      minimumFractionDigits: precision,
    }).format(value);
  } catch {
    text = value.toFixed(precision);
  }
  if (!unit) return text;
  return unit === '%' || unit === '°C' || unit === '°F' ? `${text}${unit}` : `${text} ${unit}`;
}

/** What a header badge shows for `entityId`. */
export function badgeModel(
  hass: HomeAssistant,
  config: { entity: string; name?: string; icon?: string },
): BadgeModel {
  const entityId = config.entity;
  const state = hass.states[entityId];
  const domain = domainOf(entityId);
  const available = isAvailable(state);
  const binary = BINARY_DOMAINS.has(domain);
  const active = binary && state?.state === 'on';
  const deviceClass = state?.attributes.device_class;
  const ownIcon = state?.attributes.icon;
  const icon =
    config.icon ??
    (typeof ownIcon === 'string' && ownIcon ? ownIcon : undefined) ??
    (binary && deviceClass ? BINARY_ICONS[deviceClass]?.[active ? 1 : 0] : undefined) ??
    (deviceClass ? SENSOR_ICONS[deviceClass] : undefined) ??
    DOMAIN_ICONS[domain] ??
    'mdi:information-outline';
  return {
    entityId,
    name: config.name ?? friendlyName(hass, entityId),
    icon,
    label:
      binary || !state ? undefined : available ? formatState(hass, entityId, state.state) : '—',
    active,
    available,
  };
}
