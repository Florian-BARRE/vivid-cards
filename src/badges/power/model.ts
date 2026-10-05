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

export const POWER_BADGE = 'vivid-power-badge';
export const DOMAINS = ['sensor', 'group'];
/** From this share of `max`, the halo pulses. */
export const PULSE_FROM = 0.5;

export interface ResolvedPowerBadge extends ResolvedBaseBadge {
  aggregate: Aggregate;
  /** Watts: neutral below `idle`, brightest at `max`. */
  idle: number;
  max: number;
}

export function resolvePowerBadge(raw: unknown): ResolvedPowerBadge {
  const reader = new ConfigReader(POWER_BADGE, raw);
  const base = resolveBase(reader, { domains: DOMAINS });
  const idle = reader.number('idle', 5, 0);
  const max = reader.number('max', 3000, 1);
  if (max <= idle) reader.fail('"max" must be above "idle".');
  return { ...base, aggregate: reader.choice('aggregate', AGGREGATES, 'sum'), idle, max };
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
