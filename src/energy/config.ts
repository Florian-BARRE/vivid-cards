/**
 * Options shared by every energy card and badge: where the energy comes from
 * and the tariff.
 */
import { GLOW_LEVELS, GLOW_MAX, glowPercent, type GlowSetting } from '../core/glow';
import { resolveTariff, type Tariff, type TariffConfig } from './tariff';

export interface EnergyBaseConfig {
  /** Statistic of the energy drawn (`linky:…`, a sensor in kWh); the Energy dashboard's grid source when unset. */
  energy?: string;
  /** Statistic of its cost; the Energy dashboard's when `energy` is unset. */
  cost?: string;
  tariff?: TariffConfig;
  name?: string;
  /** Halo strength in percent (100 = default). */
  glow?: GlowSetting;
}

export interface ResolvedEnergyBase {
  type: string;
  energy?: string;
  cost?: string;
  tariff: Tariff;
  name?: string;
  glow: number;
}

/** Throws errors prefixed by the card or badge type. */
export function failer(tag: string): (message: string) => never {
  return (message: string): never => {
    throw new Error(`${tag}: ${message}`);
  };
}

function statistic(
  value: unknown,
  field: string,
  fail: (message: string) => never,
): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !/^[\w.]+[:.][\w.]+$/.test(value.trim())) {
    fail(`"${field}" must be a statistic id, like "linky:12345678901234" or "sensor.energy".`);
  }
  return value.trim();
}

export function resolveEnergyBase(tag: string, raw: unknown): ResolvedEnergyBase {
  const fail = failer(tag);
  if (typeof raw !== 'object' || raw === null) fail('invalid configuration.');
  const config = raw as Record<string, unknown>;
  const name = config.name;
  if (name !== undefined && name !== null && typeof name !== 'string') fail('"name" must be text.');
  let glow = 100;
  if (config.glow !== undefined && config.glow !== null && config.glow !== '') {
    const percent = glowPercent(config.glow);
    if (percent === undefined) {
      fail(`"glow" must be a percentage from 0 to ${GLOW_MAX}, or ${GLOW_LEVELS.join(', ')}.`);
    }
    glow = percent ?? 100;
  }
  return {
    type: String(config.type ?? ''),
    glow,
    energy: statistic(config.energy, 'energy', fail),
    cost: statistic(config.cost, 'cost', fail),
    tariff: resolveTariff(config.tariff, fail),
    name: typeof name === 'string' && name.trim() ? name.trim() : undefined,
  };
}

/** Reads a choice among `values`. */
export function choice<T extends string>(
  config: Record<string, unknown>,
  field: string,
  values: readonly T[],
  fallback: T,
  fail: (message: string) => never,
): T {
  const value = config[field];
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string' || !values.includes(value as T)) {
    fail(`"${field}" must be one of: ${values.join(', ')}.`);
  }
  return value as T;
}

/** Reads a whole number in [min, max]. */
export function integer(
  config: Record<string, unknown>,
  field: string,
  fallback: number,
  min: number,
  max: number,
  fail: (message: string) => never,
): number {
  const value = config[field];
  if (value === undefined || value === null || value === '') return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    fail(`"${field}" must be a whole number from ${min} to ${max}.`);
  }
  return number;
}

/** Reads true or false. */
export function flag(
  config: Record<string, unknown>,
  field: string,
  fallback: boolean,
  fail: (message: string) => never,
): boolean {
  const value = config[field];
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'boolean') fail(`"${field}" must be true or false.`);
  return value;
}

/** An example tariff for stub configs and previews: to replace by the prices of the contract. */
export const SAMPLE_TARIFF: TariffConfig = {
  peak: 0.2146,
  off_peak: 0.1696,
  off_peak_hours: ['22:00-06:00'],
  subscription: 15.65,
  billing_day: 1,
};
