/**
 * Minimal subset of the Home Assistant frontend types used by Vivid Cards.
 * Mirrors home-assistant/frontend `src/types.ts` and the registry display entries,
 * kept local so the bundle has no dependency on frontend internals.
 */

export type Rgb = [number, number, number];

export interface HassEntityAttributes {
  friendly_name?: string;
  icon?: string;
  unit_of_measurement?: string;
  device_class?: string;
  state_class?: string;
  /** Members of a group entity. */
  entity_id?: string[];
  /** Options of a select entity. */
  options?: string[];
  [key: string]: unknown;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: HassEntityAttributes;
  last_changed: string;
  last_updated: string;
}

export interface LightAttributes extends HassEntityAttributes {
  brightness?: number | null;
  rgb_color?: Rgb | null;
  hs_color?: [number, number] | null;
  color_temp_kelvin?: number | null;
  color_mode?: string | null;
  supported_color_modes?: string[];
  effect_list?: string[] | null;
  effect?: string | null;
}

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  icon?: string;
  device_id?: string;
  area_id?: string;
  labels: string[];
  hidden?: boolean;
  entity_category?: 'config' | 'diagnostic';
  translation_key?: string;
  platform?: string;
  display_precision?: number;
}

export interface DeviceRegistryEntry {
  id: string;
  name: string | null;
  name_by_user: string | null;
  manufacturer: string | null;
  model: string | null;
  area_id: string | null;
}

export interface ServiceTarget {
  entity_id?: string | string[];
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  language: string;
  locale?: { language: string };
  themes?: { darkMode?: boolean };
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: ServiceTarget,
  ): Promise<unknown>;
  /** Websocket command; resolves with its result. */
  callWS?<T>(message: Record<string, unknown>): Promise<T>;
  config?: { currency?: string; time_zone?: string };
}

export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

/** Card sizing hints for the sections view (12-column grid, 56 px rows). */
export interface LovelaceGridOptions {
  columns?: number | 'full';
  rows?: number | 'auto';
  min_columns?: number;
  max_columns?: number;
  min_rows?: number;
  max_rows?: number;
}
