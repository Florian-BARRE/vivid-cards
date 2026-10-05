import { normalizeAction, type ActionConfig } from '../../core/action-handler';
import { domainOf } from '../../core/entities';
import { GLOW_LEVELS, GLOW_MAX, glowPercent, type GlowSetting } from '../../core/glow';
import type { LovelaceCardConfig } from '../../core/hass-types';

/** How the colors show while active: a disc behind the icon, or the whole badge filled. */
export type BadgeLook = 'disc' | 'pill';
export const BADGE_LOOKS: BadgeLook[] = ['disc', 'pill'];

/** How the values of a group combine into the one the badge shows. */
export type Aggregate = 'mean' | 'median' | 'min' | 'max' | 'sum';
export const AGGREGATES: Aggregate[] = ['mean', 'median', 'min', 'max', 'sum'];

/** Options every Vivid badge accepts. */
export interface BaseBadgeConfig extends LovelaceCardConfig {
  /** A group (light, switch, binary sensor or sensor group) or one entity. */
  entity?: string;
  /** Several entities, instead of a group. */
  entities?: string[];
  /** Title of the details. */
  name?: string;
  icon?: string;
  icon_off?: string;
  look?: BadgeLook;
  /** Halo strength in percent (100 = default), or off / soft / normal / strong. */
  glow?: GlowSetting;
  tap_action?: unknown;
  hold_action?: unknown;
}

export interface ResolvedBaseBadge {
  type: string;
  entity?: string;
  entities?: string[];
  name?: string;
  icon?: string;
  iconOff?: string;
  look: BadgeLook;
  /** Percent. */
  glow: number;
  tapAction: ActionConfig;
  holdAction: ActionConfig;
}

/** Reads and validates badge options, failing with messages prefixed by the badge type. */
export class ConfigReader {
  readonly config: Record<string, unknown>;

  constructor(
    readonly tag: string,
    raw: unknown,
  ) {
    if (typeof raw !== 'object' || raw === null) this.fail('invalid configuration.');
    this.config = raw as Record<string, unknown>;
  }

  fail(message: string): never {
    throw new Error(`${this.tag}: ${message}`);
  }

  text(field: string): string | undefined {
    const value = this.config[field];
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value !== 'string') this.fail(`"${field}" must be text.`);
    return value.trim() || undefined;
  }

  bool(field: string, fallback: boolean): boolean {
    const value = this.config[field];
    if (value === undefined || value === null) return fallback;
    if (typeof value !== 'boolean') this.fail(`"${field}" must be true or false.`);
    return value;
  }

  number(field: string, fallback: number, min = 0, max = Number.POSITIVE_INFINITY): number {
    const value = this.config[field];
    if (value === undefined || value === null || value === '') return fallback;
    const number = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(number) || number < min || number > max) {
      this.fail(
        Number.isFinite(max)
          ? `"${field}" must be a number from ${min} to ${max}.`
          : `"${field}" must be a number of at least ${min}.`,
      );
    }
    return number;
  }

  choice<T extends string>(field: string, choices: readonly T[], fallback: T): T {
    const value = this.config[field];
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value !== 'string' || !choices.includes(value as T)) {
      this.fail(`"${field}" must be one of: ${choices.join(', ')}.`);
    }
    return value as T;
  }

  action(field: string, fallback: ActionConfig): ActionConfig {
    try {
      return normalizeAction(this.config[field], field) ?? fallback;
    } catch (error) {
      this.fail((error as Error).message);
    }
  }

  glow(): number {
    const value = this.config.glow;
    if (value === undefined || value === null || value === '') return 100;
    const percent = glowPercent(value);
    if (percent === undefined) {
      this.fail(`"glow" must be a percentage from 0 to ${GLOW_MAX}, or ${GLOW_LEVELS.join(', ')}.`);
    }
    return percent;
  }
}

export interface BaseOptions {
  /** Domains `entity` and `entities` may use. */
  domains: readonly string[];
  /** The badge finds its entities alone when none is set (batteries). */
  entityOptional?: boolean;
  tapAction?: ActionConfig;
  holdAction?: ActionConfig;
}

/** Common options, validated. */
export function resolveBase(reader: ConfigReader, options: BaseOptions): ResolvedBaseBadge {
  const entity = reader.text('entity');
  const rawList = reader.config.entities;
  let entities: string[] | undefined;
  if (rawList !== undefined && rawList !== null) {
    if (!Array.isArray(rawList) || rawList.some((item) => typeof item !== 'string')) {
      reader.fail('"entities" must be a list of entity ids.');
    }
    entities = (rawList as string[]).map((item) => item.trim()).filter(Boolean);
  }
  if (!entity && !entities?.length && !options.entityOptional) {
    reader.fail('set "entity" to a group or an entity, or list "entities".');
  }
  for (const id of [entity, ...(entities ?? [])]) {
    if (id && !options.domains.includes(domainOf(id))) {
      reader.fail(`"${id}" must be one of: ${options.domains.join(', ')} entities.`);
    }
  }
  const details: ActionConfig = { action: 'details' };
  return {
    type: String(reader.config.type ?? ''),
    entity,
    entities: entities?.length ? entities : undefined,
    name: reader.text('name'),
    icon: reader.text('icon'),
    iconOff: reader.text('icon_off'),
    look: reader.choice('look', BADGE_LOOKS, 'disc'),
    glow: reader.glow(),
    tapAction: reader.action('tap_action', options.tapAction ?? details),
    holdAction: reader.action('hold_action', options.holdAction ?? details),
  };
}
