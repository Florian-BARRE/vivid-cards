import { domainOf, friendlyName } from '../../core/entities';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import { localize } from '../../i18n';
import { ConfigReader, resolveBase, type Aggregate, type ResolvedBaseBadge } from '../base/config';
import { aggregate, memberIds, members, numericValue, watchedIds } from '../base/members';
import { AMBER, GREEN, RED } from '../base/palette';

export const BATTERY_BADGE = 'vivid-battery-badge';
export const DOMAINS = ['sensor', 'binary_sensor', 'group'];
export const BATTERY_AGGREGATES: Aggregate[] = ['min', 'mean', 'median'];
export type BatteryDisplay = 'level' | 'low_count';
export const BATTERY_DISPLAYS: BatteryDisplay[] = ['level', 'low_count'];

export interface ResolvedBatteryBadge extends ResolvedBaseBadge {
  aggregate: Aggregate;
  display: BatteryDisplay;
  /** Percent: red below, amber below `warn`. */
  low: number;
  warn: number;
}

export function resolveBatteryBadge(raw: unknown): ResolvedBatteryBadge {
  const reader = new ConfigReader(BATTERY_BADGE, raw);
  const base = resolveBase(reader, { domains: DOMAINS, entityOptional: true });
  const low = reader.number('low', 15, 0, 100);
  const warn = reader.number('warn', 30, 0, 100);
  if (warn < low) reader.fail('"warn" must be at least "low".');
  return {
    ...base,
    aggregate: reader.choice('aggregate', BATTERY_AGGREGATES, 'min'),
    display: reader.choice('display', BATTERY_DISPLAYS, 'level'),
    low,
    warn,
  };
}

/** Every battery of the installation: level sensors and low-battery binary sensors. */
export function allBatteries(hass: HomeAssistant): string[] {
  return Object.values(hass.states)
    .filter((state) => {
      if (state.attributes.device_class !== 'battery') return false;
      const domain = domainOf(state.entity_id);
      return (
        domain === 'binary_sensor' ||
        (domain === 'sensor' && state.attributes.unit_of_measurement === '%')
      );
    })
    .map((state) => state.entity_id)
    .sort();
}

export interface BatteryItem {
  entityId: string;
  name: string;
  available: boolean;
  /** Percent; undefined for a low-battery binary sensor. */
  level?: number;
  low: boolean;
  severity: 0 | 1 | 2;
}

export interface BatteryModel {
  name: string;
  items: BatteryItem[];
  /** The value shown (the lowest by default). */
  value?: number;
  lowCount: number;
  severity: 0 | 1 | 2;
  watched: string[];
}

export function severityOf(level: number | undefined, low: boolean, config: ResolvedBatteryBadge) {
  if (low || (level !== undefined && level < config.low)) return 2;
  if (level !== undefined && level < config.warn) return 1;
  return 0;
}

export const BATTERY_COLORS: Record<0 | 1 | 2, { color: Rgb; level: number }> = {
  0: { color: GREEN, level: 0.25 },
  1: { color: AMBER, level: 0.5 },
  2: { color: RED, level: 0.9 },
};

/** Battery icon filled to `level` (percent). */
export function batteryIcon(level: number | undefined, low = false): string {
  if (level === undefined) return low ? 'mdi:battery-alert-variant-outline' : 'mdi:battery';
  if (level >= 95) return 'mdi:battery';
  if (level < 5) return 'mdi:battery-outline';
  return `mdi:battery-${Math.max(10, Math.min(90, Math.round(level / 10) * 10))}`;
}

export function buildBatteryModel(hass: HomeAssistant, config: ResolvedBatteryBadge): BatteryModel {
  const ids = memberIds(hass, config, () => allBatteries(hass));
  const items: BatteryItem[] = members(hass, ids).map((member) => {
    const binary = domainOf(member.entityId) === 'binary_sensor';
    const level = binary ? undefined : numericValue(member.state);
    const low = binary && member.available && member.state?.state === 'on';
    return {
      entityId: member.entityId,
      name: member.name,
      available: member.available && (binary || level !== undefined),
      level,
      low,
      severity: severityOf(level, low, config),
    };
  });
  const levels = items.flatMap((item) => (item.level === undefined ? [] : [item.level]));
  const value = aggregate(levels, config.aggregate);
  const lowCount = items.filter((item) => item.severity === 2).length;
  return {
    name:
      config.name ??
      (config.entity ? friendlyName(hass, config.entity) : localize(hass, 'batteries_title')),
    items,
    value,
    lowCount,
    severity: items.reduce<0 | 1 | 2>(
      (worst, item) => (item.severity > worst ? item.severity : worst),
      severityOf(value, false, config),
    ),
    watched: watchedIds(config, ids),
  };
}
