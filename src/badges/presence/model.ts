import { friendlyName } from '../../core/entities';
import type { HomeAssistant } from '../../core/hass-types';
import { localize } from '../../i18n';
import { ConfigReader, resolveBase, type ResolvedBaseBadge } from '../base/config';
import { isGroupBadge, memberIds, members, secondsSince, watchedIds } from '../base/members';

export const PRESENCE_BADGE = 'vivid-presence-badge';
export const DOMAINS = ['binary_sensor', 'group'];
export const DEVICE_CLASSES = ['occupancy', 'presence', 'motion'];
/** Hours of history drawn in the details. */
export const TIMELINE_HOURS = 6;
export const PRESENT_LEVEL = 0.55;
export const PRESENT_PULSE = '2.4s';

export interface ResolvedPresenceBadge extends ResolvedBaseBadge {
  showCount: boolean;
  showZero: boolean;
  /** One sensor: how long it has been occupied, or clear. */
  showDuration: boolean;
}

export function resolvePresenceBadge(raw: unknown): ResolvedPresenceBadge {
  const reader = new ConfigReader(PRESENCE_BADGE, raw);
  return {
    ...resolveBase(reader, { domains: DOMAINS }),
    showCount: reader.bool('show_count', true),
    showZero: reader.bool('show_zero', false),
    showDuration: reader.bool('show_duration', true),
  };
}

export interface PresenceItem {
  entityId: string;
  name: string;
  available: boolean;
  present: boolean;
  since: number;
}

export interface PresenceModel {
  name: string;
  isGroup: boolean;
  items: PresenceItem[];
  present: number;
  total: number;
  /** Seconds since the last change of the first item (one sensor). */
  since: number;
  watched: string[];
}

export function buildPresenceModel(
  hass: HomeAssistant,
  config: ResolvedPresenceBadge,
  now: number = Date.now(),
): PresenceModel {
  const ids = memberIds(hass, config);
  const items = members(hass, ids).map((member) => ({
    entityId: member.entityId,
    name: member.name,
    available: member.available,
    present: member.available && member.state?.state === 'on',
    since: secondsSince(member.state, now),
  }));
  return {
    name:
      config.name ??
      (config.entity ? friendlyName(hass, config.entity) : localize(hass, 'presence_title')),
    isGroup: isGroupBadge(config, ids.length),
    items,
    present: items.filter((item) => item.present).length,
    total: items.filter((item) => item.available).length,
    since: items[0]?.since ?? 0,
    watched: watchedIds(config, ids),
  };
}
