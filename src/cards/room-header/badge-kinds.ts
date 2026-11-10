/* ====== Code Summary ======
 * Badges the room header editor can add with just an entity: their element
 * tag and the domains their entity may have. The bill and tariff badges need
 * a tariff block, so they stay in YAML. Domains come from each badge's model.
 */

import { DOMAINS as BATTERY_DOMAINS } from '../../badges/battery/model';
import { DOMAINS as CLIMATE_DOMAINS } from '../../badges/climate/model';
import { DOMAINS as ILLUMINANCE_DOMAINS } from '../../badges/illuminance/model';
import { ENTITY_DOMAINS as LIGHT_DOMAINS } from '../../badges/light/config';
import { DOMAINS as OPENING_DOMAINS } from '../../badges/opening/model';
import { DOMAINS as POWER_DOMAINS } from '../../badges/power/model';
import { DOMAINS as PRESENCE_DOMAINS } from '../../badges/presence/model';

/** One kind of badge the editor offers. */
export interface BadgeKind {
  /** Kind key, also the end of its label key (`rh_kind_<key>`). */
  key: BadgeKindKey;
  /** Element tag, without `custom:`. */
  tag: string;
  /** Domains of its entity, for the entity picker. */
  domains: readonly string[];
}

export type BadgeKindKey =
  | 'lamp'
  | 'led'
  | 'light'
  | 'presence'
  | 'window'
  | 'door'
  | 'illuminance'
  | 'temperature'
  | 'humidity'
  | 'pressure'
  | 'air_quality'
  | 'power'
  | 'energy'
  | 'battery';

export const BADGE_KINDS: readonly BadgeKind[] = [
  { key: 'lamp', tag: 'vivid-lamp-badge', domains: LIGHT_DOMAINS },
  { key: 'led', tag: 'vivid-led-badge', domains: LIGHT_DOMAINS },
  { key: 'light', tag: 'vivid-light-badge', domains: LIGHT_DOMAINS },
  { key: 'presence', tag: 'vivid-presence-badge', domains: PRESENCE_DOMAINS },
  { key: 'window', tag: 'vivid-window-badge', domains: OPENING_DOMAINS },
  { key: 'door', tag: 'vivid-door-badge', domains: OPENING_DOMAINS },
  { key: 'illuminance', tag: 'vivid-illuminance-badge', domains: ILLUMINANCE_DOMAINS },
  { key: 'temperature', tag: 'vivid-temperature-badge', domains: CLIMATE_DOMAINS },
  { key: 'humidity', tag: 'vivid-humidity-badge', domains: CLIMATE_DOMAINS },
  { key: 'pressure', tag: 'vivid-pressure-badge', domains: CLIMATE_DOMAINS },
  { key: 'air_quality', tag: 'vivid-air-quality-badge', domains: CLIMATE_DOMAINS },
  { key: 'power', tag: 'vivid-power-badge', domains: POWER_DOMAINS },
  { key: 'energy', tag: 'vivid-energy-badge', domains: ['sensor'] },
  { key: 'battery', tag: 'vivid-battery-badge', domains: BATTERY_DOMAINS },
];

/** The kind of a badge type (`custom:vivid-door-badge`), or `undefined` for other badges. */
export function badgeKindOf(type: string): BadgeKind | undefined {
  const tag = type.replace(/^custom:/, '');
  return BADGE_KINDS.find((kind) => kind.tag === tag);
}
