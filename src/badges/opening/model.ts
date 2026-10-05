import type { HomeAssistant } from '../../core/hass-types';
import { friendlyName } from '../../core/entities';
import { localize } from '../../i18n';
import { ConfigReader, resolveBase, type ResolvedBaseBadge } from '../base/config';
import { isGroupBadge, memberIds, members, secondsSince, watchedIds } from '../base/members';

export const OPENING_BADGE = 'vivid-opening-badge';
export const WINDOW_BADGE = 'vivid-window-badge';
export const DOOR_BADGE = 'vivid-door-badge';

/** Windows only, doors only (garage doors included), or a mix (the former opening badge). */
export type OpeningKind = 'window' | 'door' | 'any';
export const OPENING_TAGS: Record<OpeningKind, string> = {
  window: WINDOW_BADGE,
  door: DOOR_BADGE,
  any: OPENING_BADGE,
};
export const KIND_DEVICE_CLASSES: Record<OpeningKind, string[]> = {
  window: ['window'],
  door: ['door', 'garage_door', 'opening'],
  any: ['window', 'door', 'garage_door', 'opening'],
};

export function openingKindOf(type: unknown): OpeningKind {
  const tag = typeof type === 'string' ? type.replace(/^custom:/, '') : '';
  const entry = Object.entries(OPENING_TAGS).find(([, value]) => value === tag);
  return (entry?.[0] as OpeningKind | undefined) ?? 'any';
}
export const DOMAINS = ['binary_sensor', 'group'];
export const DEVICE_CLASSES = ['window', 'door', 'garage_door', 'opening'];
/** Closed rows listed one by one up to this many; beyond, they fold into one row. */
export const CLOSED_ROWS = 4;

export interface ResolvedOpeningBadge extends ResolvedBaseBadge {
  kind: OpeningKind;
  showCount: boolean;
  showZero: boolean;
  /** Minutes open before amber, then red. */
  warnAfter: number;
  alertAfter: number;
}

export function resolveOpeningBadge(
  raw: unknown,
  kind: OpeningKind = openingKindOf((raw as { type?: unknown } | null)?.type),
): ResolvedOpeningBadge {
  const reader = new ConfigReader(OPENING_TAGS[kind], raw);
  const base = resolveBase(reader, { domains: DOMAINS });
  const warnAfter = reader.number('warn_after', 15, 0);
  const alertAfter = reader.number('alert_after', 45, 0);
  if (alertAfter < warnAfter) reader.fail('"alert_after" must be at least "warn_after".');
  return {
    ...base,
    kind,
    showCount: reader.bool('show_count', true),
    showZero: reader.bool('show_zero', false),
    warnAfter,
    alertAfter,
  };
}

export type Kind = 'window' | 'door' | 'garage' | 'mixed';

/** [open, closed] icons. */
export const ICONS: Record<Kind, [string, string]> = {
  window: ['mdi:window-open-variant', 'mdi:window-closed-variant'],
  door: ['mdi:door-open', 'mdi:door-closed'],
  garage: ['mdi:garage-open-variant', 'mdi:garage-variant'],
  mixed: ['mdi:home-lock-open', 'mdi:home-lock'],
};

export function kindOf(deviceClass: unknown, badge: OpeningKind = 'any'): Kind {
  if (deviceClass === 'garage_door') return 'garage';
  if (badge === 'door') return 'door';
  if (deviceClass === 'window') return 'window';
  if (deviceClass === 'door' || deviceClass === 'opening') return 'door';
  return 'mixed';
}

export interface OpeningItem {
  entityId: string;
  name: string;
  kind: Kind;
  available: boolean;
  open: boolean;
  /** Seconds in the current state. */
  since: number;
  /** 0 calm, 1 to watch, 2 alert (open items only). */
  severity: 0 | 1 | 2;
}

export interface OpeningModel {
  name: string;
  isGroup: boolean;
  kind: Kind;
  items: OpeningItem[];
  open: number;
  total: number;
  /** Worst severity of the open items. */
  severity: 0 | 1 | 2;
  /** Seconds the longest open item has been open. */
  longest: number;
  watched: string[];
}

export function severityOf(seconds: number, config: ResolvedOpeningBadge): 0 | 1 | 2 {
  const minutes = seconds / 60;
  if (minutes >= config.alertAfter) return 2;
  if (minutes >= config.warnAfter) return 1;
  return 0;
}

export function buildOpeningModel(
  hass: HomeAssistant,
  config: ResolvedOpeningBadge,
  now: number = Date.now(),
): OpeningModel {
  const ids = memberIds(hass, config);
  const items: OpeningItem[] = members(hass, ids).map((member) => {
    const open = member.available && member.state?.state === 'on';
    const since = secondsSince(member.state, now);
    return {
      entityId: member.entityId,
      name: member.name,
      // A window badge draws windows, a door badge doors (and garage doors as such).
      kind:
        config.kind === 'window'
          ? 'window'
          : kindOf(member.state?.attributes.device_class, config.kind),
      available: member.available,
      open,
      since,
      severity: open ? severityOf(since, config) : 0,
    };
  });
  const kinds = new Set(items.map((item) => item.kind));
  // A garage door among doors is still a door badge.
  if (kinds.has('door')) kinds.delete('garage');
  const kind: Kind =
    config.kind === 'window'
      ? 'window'
      : config.kind === 'door'
        ? kinds.size === 1 && kinds.has('garage')
          ? 'garage'
          : 'door'
        : kinds.size === 1
          ? ([...kinds][0] as Kind)
          : 'mixed';
  const openItems = items.filter((item) => item.open);
  return {
    name:
      config.name ??
      (config.entity
        ? friendlyName(hass, config.entity)
        : localize(
            hass,
            config.kind === 'window'
              ? 'windows_title'
              : config.kind === 'door'
                ? 'doors_title'
                : 'openings_title',
          )),
    isGroup: isGroupBadge(config, ids.length),
    kind,
    items,
    open: openItems.length,
    total: items.filter((item) => item.available).length,
    severity: openItems.reduce<0 | 1 | 2>(
      (worst, item) => (item.severity > worst ? item.severity : worst),
      0,
    ),
    longest: openItems.reduce((longest, item) => Math.max(longest, item.since), 0),
    watched: watchedIds(config, ids),
  };
}
