import { clamp } from '../../core/color';
import { friendlyName } from '../../core/entities';
import { blendStops } from '../../core/glow';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import { localize } from '../../i18n';
import {
  AGGREGATES,
  ConfigReader,
  resolveBase,
  type Aggregate,
  type ResolvedBaseBadge,
} from '../base/config';
import { aggregate, memberIds, members, numericValue, watchedIds } from '../base/members';

export const ILLUMINANCE_BADGE = 'vivid-illuminance-badge';
export const DOMAINS = ['sensor', 'group'];

export interface ResolvedIlluminanceBadge extends ResolvedBaseBadge {
  aggregate: Aggregate;
  /** Lux at which the gauge is full. */
  max: number;
  gauge: boolean;
}

export function resolveIlluminanceBadge(raw: unknown): ResolvedIlluminanceBadge {
  const reader = new ConfigReader(ILLUMINANCE_BADGE, raw);
  return {
    ...resolveBase(reader, { domains: DOMAINS }),
    aggregate: reader.choice('aggregate', AGGREGATES, 'mean'),
    max: reader.number('max', 2000, 2),
    gauge: reader.bool('gauge', true),
  };
}

/** Night indigo, dusk grey, indoor yellow, sunlight amber; positions on the log gauge. */
export const LUX_STOPS: (readonly [number, Rgb])[] = [
  [0, [92, 107, 192]],
  [0.45, [171, 145, 140]],
  [0.75, [255, 213, 79]],
  [1, [255, 193, 7]],
];

/** Position (0–1) of `lux` on a log scale from 1 lx to `max`. */
export function luxRatio(lux: number, max: number): number {
  return clamp(Math.log10(Math.max(lux, 1)) / Math.log10(max), 0, 1);
}

export function luxColor(ratio: number): Rgb {
  return blendStops(LUX_STOPS, ratio);
}

export function luxIcon(lux: number): string {
  if (lux < 10) return 'mdi:weather-night';
  if (lux < 100) return 'mdi:brightness-5';
  if (lux < 800) return 'mdi:brightness-6';
  return 'mdi:brightness-7';
}

export interface IlluminanceItem {
  entityId: string;
  name: string;
  value?: number;
}

export interface IlluminanceModel {
  name: string;
  items: IlluminanceItem[];
  value?: number;
  min?: number;
  max?: number;
  unit: string;
  watched: string[];
}

export function buildIlluminanceModel(
  hass: HomeAssistant,
  config: ResolvedIlluminanceBadge,
): IlluminanceModel {
  const ids = memberIds(hass, config);
  const list = members(hass, ids);
  const items = list.map((member) => ({
    entityId: member.entityId,
    name: member.name,
    value: numericValue(member.state),
  }));
  const values = items.flatMap((item) => (item.value === undefined ? [] : [item.value]));
  const unit = list.find((member) => member.state)?.state?.attributes.unit_of_measurement;
  return {
    name:
      config.name ??
      (config.entity ? friendlyName(hass, config.entity) : localize(hass, 'illuminance_title')),
    items,
    value: aggregate(values, config.aggregate),
    min: aggregate(values, 'min'),
    max: aggregate(values, 'max'),
    unit: typeof unit === 'string' && unit ? unit : 'lx',
    watched: watchedIds(config, ids),
  };
}
