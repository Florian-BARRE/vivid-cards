import { friendlyName } from '../../core/entities';
import { type PowerScale } from '../../core/glow';
import type { HomeAssistant } from '../../core/hass-types';
import { formatNumber, localize } from '../../i18n';
import {
  AGGREGATES,
  ConfigReader,
  resolveBase,
  type Aggregate,
  type ResolvedBaseBadge,
} from '../base/config';
import { aggregate, memberIds, members, numericValue, watchedIds } from '../base/members';
import { offPeakShareOfDay, periodAt, resolveTariff, type Tariff } from '../../energy/tariff';

/** What the power costs at this pace: over a month, or per hour. */
export type PowerCost = 'month' | 'hour';
export const POWER_COSTS: PowerCost[] = ['month', 'hour'];

export const POWER_BADGE = 'vivid-power-badge';
export const DOMAINS = ['sensor', 'group'];
/** From this share of `max`, the halo pulses. */
export const PULSE_FROM = 0.5;

export interface ResolvedPowerBadge extends ResolvedBaseBadge {
  aggregate: Aggregate;
  /** Watts: neutral below `idle`, brightest at `max`. */
  idle: number;
  max: number;
  /** Adds the cost of the power at this pace; needs `tariff`. */
  cost?: PowerCost;
  tariff?: Tariff;
}

export function resolvePowerBadge(raw: unknown): ResolvedPowerBadge {
  const reader = new ConfigReader(POWER_BADGE, raw);
  const base = resolveBase(reader, { domains: DOMAINS });
  const idle = reader.number('idle', 5, 0);
  const max = reader.number('max', 3000, 1);
  if (max <= idle) reader.fail('"max" must be above "idle".');
  const rawCost = reader.config.cost;
  const cost =
    rawCost === undefined || rawCost === null || rawCost === ''
      ? undefined
      : reader.choice('cost', POWER_COSTS, 'month');
  const tariff =
    reader.config.tariff !== undefined
      ? resolveTariff(reader.config.tariff, (message) => reader.fail(message))
      : undefined;
  if (cost && !tariff) reader.fail('"cost" needs a "tariff" with at least the "peak" price.');
  return {
    ...base,
    aggregate: reader.choice('aggregate', AGGREGATES, 'sum'),
    idle,
    max,
    cost,
    tariff,
  };
}

/**
 * Price of a kWh for the cost of a power: per hour, the price of the moment;
 * over a month, the mean price of a day (off-peak hours weighted by their length).
 */
export function powerPrice(tariff: Tariff, cost: PowerCost, now: number): number {
  const offPeak = tariff.offPeak ?? tariff.peak;
  if (cost === 'hour') return periodAt(tariff.offPeakRanges, now)?.offPeak ? offPeak : tariff.peak;
  const share = tariff.offPeakRanges.length ? offPeakShareOfDay(tariff.offPeakRanges) : 0;
  return tariff.peak * (1 - share) + offPeak * share;
}

/** Cost of `watts` over an hour, or over 30 days. */
export function powerCost(watts: number, tariff: Tariff, cost: PowerCost, now: number): number {
  const hours = cost === 'hour' ? 1 : 24 * 30;
  return (Math.max(0, watts) / 1000) * hours * powerPrice(tariff, cost, now);
}

/** Watts per unit of a power sensor. */
export function wattsPerUnit(unit: string | undefined): number {
  if (unit === 'kW') return 1000;
  if (unit === 'MW') return 1_000_000;
  if (unit === 'mW') return 0.001;
  return 1;
}

export function formatPower(hass: HomeAssistant | undefined, watts: number): string {
  if (Math.abs(watts) >= 1000) return `${formatNumber(hass, watts / 1000, 1)} kW`;
  return `${formatNumber(hass, watts, Math.abs(watts) < 10 ? 1 : 0)} W`;
}

/** The card's consumption scale for a whole group: yellow, amber, then orange. */
export function powerScale(config: Pick<ResolvedPowerBadge, 'idle' | 'max'>): PowerScale {
  return { idle: config.idle, max: config.max, steps: [config.max * 0.25, config.max * 0.6] };
}

export interface PowerItem {
  entityId: string;
  name: string;
  watts?: number;
}

export interface PowerModel {
  name: string;
  items: PowerItem[];
  watts?: number;
  watched: string[];
}

export function buildPowerModel(hass: HomeAssistant, config: ResolvedPowerBadge): PowerModel {
  const ids = memberIds(hass, config);
  const items = members(hass, ids).map((member) => ({
    entityId: member.entityId,
    name: member.name,
    watts: numericValue(member.state, wattsPerUnit),
  }));
  const values = items.flatMap((item) => (item.watts === undefined ? [] : [item.watts]));
  return {
    name:
      config.name ??
      (config.entity ? friendlyName(hass, config.entity) : localize(hass, 'power_title')),
    items,
    watts: aggregate(values, config.aggregate),
    watched: watchedIds(config, ids),
  };
}
