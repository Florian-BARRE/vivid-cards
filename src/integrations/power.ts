import { domainOf, objectIdOf, parseNumericState, siblingEntities } from '../core/entities';
import type { HomeAssistant } from '../core/hass-types';
import { findWledEntities } from './wled';

/** How the consumption of one light is measured. */
export type PowerMode = 'auto' | 'sensor' | 'voltage' | 'none';

/** Card-wide defaults. */
export interface PowerDefaults {
  /** Entity id template, e.g. `sensor.{object_id}_power`. */
  sensorPattern?: string;
  /** Strip voltage, used to turn WLED's estimated current into watts. */
  voltage?: number;
}

/** Per-light choice. */
export interface PowerChoice {
  mode?: PowerMode;
  sensor?: string;
  voltage?: number;
}

/** Where a reading comes from, as shown in the editor. */
export type PowerOrigin = 'sensor' | 'pattern' | 'device' | 'estimated';

export type PowerSource =
  | { kind: 'power'; entityId: string; origin: Exclude<PowerOrigin, 'estimated'> }
  | { kind: 'current'; entityId: string; voltage: number; origin: 'estimated' };

function isPowerSensor(hass: HomeAssistant, entityId: string): boolean {
  if (domainOf(entityId) !== 'sensor') return false;
  const attributes = hass.states[entityId]?.attributes;
  if (!attributes) return false;
  return (
    attributes.device_class === 'power' ||
    attributes.unit_of_measurement === 'W' ||
    attributes.unit_of_measurement === 'kW'
  );
}

export function patternSensor(lightId: string, pattern: string | undefined): string | undefined {
  if (!pattern) return undefined;
  return pattern.replaceAll('{object_id}', objectIdOf(lightId)).replaceAll('{entity_id}', lightId);
}

function estimated(
  hass: HomeAssistant,
  lightId: string,
  voltage: number | undefined,
): PowerSource | undefined {
  if (!voltage || voltage <= 0) return undefined;
  const current = findWledEntities(hass, lightId).estimatedCurrent;
  return current ? { kind: 'current', entityId: current, voltage, origin: 'estimated' } : undefined;
}

/**
 * Picks where the consumption of `lightId` comes from.
 *
 * - `sensor`: the chosen power sensor.
 * - `voltage`: WLED estimated current × voltage (the light's, or the card default).
 * - `none`: no consumption.
 * - `auto`: chosen sensor, entity id pattern, power sensor on the same device,
 *   then estimated current when a voltage is known.
 */
export function resolvePowerSource(
  hass: HomeAssistant,
  lightId: string,
  defaults: PowerDefaults,
  choice: PowerChoice = {},
): PowerSource | undefined {
  const mode = choice.mode ?? 'auto';
  const voltage = choice.voltage ?? defaults.voltage;
  if (mode === 'none') return undefined;

  if (mode === 'sensor' || (mode === 'auto' && choice.sensor)) {
    if (choice.sensor && hass.states[choice.sensor]) {
      return { kind: 'power', entityId: choice.sensor, origin: 'sensor' };
    }
    if (mode === 'sensor') return undefined;
  }

  if (mode === 'voltage') return estimated(hass, lightId, voltage);

  const fromPattern = patternSensor(lightId, defaults.sensorPattern);
  if (fromPattern && hass.states[fromPattern]) {
    return { kind: 'power', entityId: fromPattern, origin: 'pattern' };
  }

  const onDevice = siblingEntities(hass, lightId).find((id) => isPowerSensor(hass, id));
  if (onDevice) return { kind: 'power', entityId: onDevice, origin: 'device' };

  return estimated(hass, lightId, voltage);
}

/** Watts drawn right now, or `undefined` when the source is unavailable. */
export function readWatts(hass: HomeAssistant, source: PowerSource): number | undefined {
  const state = hass.states[source.entityId];
  const value = parseNumericState(state);
  if (value === undefined) return undefined;
  if (source.kind === 'current') {
    return (value * source.voltage) / 1000;
  }
  return state?.attributes.unit_of_measurement === 'kW' ? value * 1000 : value;
}
