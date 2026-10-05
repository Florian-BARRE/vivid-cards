import { normalizeAction, type ActionConfig } from '../../core/action-handler';
import { domainOf } from '../../core/entities';
import { GLOW_LEVELS, GLOW_MAX, glowPercent, type GlowSetting } from '../../core/glow';
import type { LovelaceCardConfig } from '../../core/hass-types';

export const BADGE_TYPE = 'vivid-light-badge';

/** How the colors show while on: a filled disc behind the icon, or the whole badge filled. */
export type BadgeLook = 'disc' | 'pill';
export const BADGE_LOOKS: BadgeLook[] = ['disc', 'pill'];

/** Lights under the badge: rows with a brightness bar, or two columns of chips. */
export type DetailsLayout = 'list' | 'compact';
export const DETAILS_LAYOUTS: DetailsLayout[] = ['list', 'compact'];

export interface LightBadgeConfig extends LovelaceCardConfig {
  entity: string;
  /** Title of the details. */
  name?: string;
  /** Icon while something is on. */
  icon?: string;
  /** Icon while everything is off. */
  icon_off?: string;
  /** "2/3" (or "78 %" for one light) next to the icon while on. */
  show_count?: boolean;
  /** Halo strength in percent (100 = default), or off / soft / normal / strong. */
  glow?: GlowSetting;
  /** How much the halo grows with the brightness, in percent (100 = default). */
  glow_boost?: number;
  look?: BadgeLook;
  layout?: DetailsLayout;
  /** Seconds of fade sent with every light command. */
  transition?: number;
  tap_action?: unknown;
  hold_action?: unknown;
}

export interface ResolvedLightBadgeConfig {
  type: string;
  entity: string;
  name?: string;
  icon?: string;
  iconOff?: string;
  showCount: boolean;
  /** Percent. */
  glow: number;
  /** Percent. */
  glowBoost: number;
  look: BadgeLook;
  layout: DetailsLayout;
  transition?: number;
  tapAction: ActionConfig;
  holdAction: ActionConfig;
}

function fail(message: string): never {
  throw new Error(`${BADGE_TYPE}: ${message}`);
}

function text(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') fail(`"${field}" must be text.`);
  return value.trim() || undefined;
}

function action(value: unknown, field: string, fallback: ActionConfig): ActionConfig {
  try {
    return normalizeAction(value, field) ?? fallback;
  } catch (error) {
    fail((error as Error).message);
  }
}

export function resolveLightBadgeConfig(raw: unknown): ResolvedLightBadgeConfig {
  if (typeof raw !== 'object' || raw === null) fail('invalid configuration.');
  const config = raw as LightBadgeConfig;
  const entity = text(config.entity, 'entity');
  if (!entity) fail('set "entity" to a light or a light group.');
  if (domainOf(entity) !== 'light') fail(`"${entity}" is not a light entity.`);
  if (config.show_count !== undefined && typeof config.show_count !== 'boolean') {
    fail('"show_count" must be true or false.');
  }
  const glow = config.glow === undefined ? 100 : glowPercent(config.glow);
  if (glow === undefined) {
    fail(`"glow" must be a percentage from 0 to ${GLOW_MAX}, or ${GLOW_LEVELS.join(', ')}.`);
  }
  const boost = config.glow_boost;
  if (
    boost !== undefined &&
    (typeof boost !== 'number' || !Number.isFinite(boost) || boost < 0 || boost > GLOW_MAX)
  ) {
    fail(`"glow_boost" must be a percentage from 0 to ${GLOW_MAX}.`);
  }
  if (config.look !== undefined && !BADGE_LOOKS.includes(config.look)) {
    fail(`"look" must be one of: ${BADGE_LOOKS.join(', ')}.`);
  }
  if (config.layout !== undefined && !DETAILS_LAYOUTS.includes(config.layout)) {
    fail(`"layout" must be one of: ${DETAILS_LAYOUTS.join(', ')}.`);
  }
  const transition = config.transition;
  if (
    transition !== undefined &&
    (typeof transition !== 'number' || !Number.isFinite(transition) || transition < 0)
  ) {
    fail('"transition" must be a positive number of seconds.');
  }
  return {
    type: config.type,
    entity,
    name: text(config.name, 'name'),
    icon: text(config.icon, 'icon'),
    iconOff: text(config.icon_off, 'icon_off'),
    showCount: config.show_count ?? true,
    glow,
    glowBoost: boost ?? 100,
    look: config.look ?? 'disc',
    layout: config.layout ?? 'list',
    transition,
    tapAction: action(config.tap_action, 'tap_action', { action: 'toggle' }),
    holdAction: action(config.hold_action, 'hold_action', { action: 'details' }),
  };
}
