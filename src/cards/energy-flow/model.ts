import { friendlyName } from '../../core/entities';
import type { HomeAssistant } from '../../core/hass-types';
import type { StringKey } from '../../i18n';
import {
  choice,
  failer,
  integer,
  resolveEnergyBase,
  type EnergyBaseConfig,
  type ResolvedEnergyBase,
} from '../../energy/config';
import { ENERGY_PERIODS, type DeviceRow, type EnergyPeriod } from '../../energy/views';

export const ENERGY_FLOW = 'vivid-energy-flow';

export interface EnergyPeriodConfig extends EnergyBaseConfig {
  type: string;
  period?: EnergyPeriod;
  /** Devices drawn one by one; the others are grouped. */
  max_devices?: number;
}

export interface ResolvedPeriodCard extends ResolvedEnergyBase {
  period: EnergyPeriod;
  maxDevices: number;
}

export function resolvePeriodCard(tag: string, raw: unknown): ResolvedPeriodCard {
  const base = resolveEnergyBase(tag, raw);
  const config = raw as Record<string, unknown>;
  const fail = failer(tag);
  return {
    ...base,
    period: choice(config, 'period', ENERGY_PERIODS, 'month', fail),
    maxDevices: integer(config, 'max_devices', 6, 1, 20, fail),
  };
}

export const PERIOD_NAMES: Record<EnergyPeriod, StringKey> = {
  day: 'energy_period_day',
  week: 'energy_period_week',
  month: 'energy_period_month',
  year: 'energy_period_year',
};

/** Name of a statistic without a name in the Energy dashboard. */
export function statName(hass: HomeAssistant | undefined, stat: string): string {
  return hass && hass.states[stat] ? friendlyName(hass, stat) : stat;
}

/** The devices shown, the smallest ones grouped. */
export function shownDevices(rows: readonly DeviceRow[], max: number, others: string): DeviceRow[] {
  if (rows.length <= max) return [...rows];
  const kept = rows.slice(0, max - 1);
  const rest = rows.slice(max - 1);
  const kwh = rest.reduce((sum, row) => sum + row.kwh, 0);
  const cost = rest.reduce((sum, row) => sum + row.cost, 0);
  return [...kept, { stat: '', name: others, kwh, cost, children: [] }];
}

/** Label positions at least `gap` apart, kept between `top` and `bottom`, as close as possible to `wanted`. */
export function spreadLabels(
  wanted: readonly number[],
  gap: number,
  top: number,
  bottom: number,
): number[] {
  const placed = wanted.map((value) => value);
  for (let i = 0; i < placed.length; i++) {
    placed[i] = Math.max(placed[i]!, top, i > 0 ? placed[i - 1]! + gap : top);
  }
  // Push back up from the bottom when the last labels overflow.
  for (let i = placed.length - 1; i >= 0; i--) {
    const limit = i === placed.length - 1 ? bottom : placed[i + 1]! - gap;
    placed[i] = Math.min(placed[i]!, limit);
  }
  return placed;
}
