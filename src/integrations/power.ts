import { domainOf, objectIdOf, parseNumericState, siblingEntities } from '../core/entities';
import type { HomeAssistant } from '../core/hass-types';
import { findWledEntities } from './wled';

export interface PowerOptions {
  /** Entity id template, e.g. `sensor.{object_id}_power`. */
  sensor_pattern?: string;
  /** Strip voltage, used to turn WLED's estimated current into watts. */
  voltage?: number;
}

export type PowerSource =
  { kind: 'power'; entityId: string } | { kind: 'current'; entityId: string; voltage: number };

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

/**
 * Picks where the consumption of `lightId` comes from, in order:
 * explicit sensor, entity id pattern, power sensor on the same device,
 * WLED estimated current × voltage.
 */
export function resolvePowerSource(
  hass: HomeAssistant,
  lightId: string,
  options: PowerOptions,
  explicitSensor?: string,
): PowerSource | undefined {
  if (explicitSensor && hass.states[explicitSensor]) {
    return { kind: 'power', entityId: explicitSensor };
  }

  if (options.sensor_pattern) {
    const candidate = options.sensor_pattern
      .replaceAll('{object_id}', objectIdOf(lightId))
      .replaceAll('{entity_id}', lightId);
    if (hass.states[candidate]) return { kind: 'power', entityId: candidate };
  }

  const onDevice = siblingEntities(hass, lightId).find((id) => isPowerSensor(hass, id));
  if (onDevice) return { kind: 'power', entityId: onDevice };

  if (options.voltage && options.voltage > 0) {
    const current = findWledEntities(hass, lightId).estimatedCurrent;
    if (current) return { kind: 'current', entityId: current, voltage: options.voltage };
  }

  return undefined;
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
