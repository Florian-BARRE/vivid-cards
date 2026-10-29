import type { RoomHeaderCardConfig } from './config';

type FormData = Record<string, unknown>;

const TEXT_KEYS = ['room', 'name', 'power', 'entity'] as const;
const BOOL_KEYS = ['show_subtitle', 'show_badges'] as const;

/** The form's values as the editor shows them (defaults filled in). */
export function roomHeaderFormData(config: RoomHeaderCardConfig): FormData {
  return {
    room: config.room ?? '',
    name: config.name ?? '',
    lights: Array.isArray(config.lights) ? config.lights : [],
    power: config.power ?? '',
    entity: config.entity ?? '',
    show_subtitle: config.show_subtitle !== false,
    show_badges: config.show_badges !== false,
    glow: typeof config.glow === 'number' ? config.glow : 100,
  };
}

/**
 * Applies the form's values to the config, leaving defaults out so the YAML
 * stays short. `badges` (YAML only) is kept as it is.
 */
export function applyRoomHeaderForm(
  config: RoomHeaderCardConfig,
  value: FormData,
): RoomHeaderCardConfig {
  const next: Record<string, unknown> = { ...config };
  for (const key of TEXT_KEYS) {
    const text = typeof value[key] === 'string' ? (value[key] as string).trim() : '';
    if (text) next[key] = key === 'room' ? text.toLowerCase() : text;
    else delete next[key];
  }
  const lights = Array.isArray(value.lights)
    ? (value.lights as unknown[]).filter((id): id is string => typeof id === 'string' && !!id)
    : [];
  if (lights.length) next.lights = lights;
  else delete next.lights;
  for (const key of BOOL_KEYS) {
    if (value[key] === false) next[key] = false;
    else delete next[key];
  }
  if (typeof value.glow === 'number' && value.glow !== 100) next.glow = value.glow;
  else if (typeof value.glow === 'number') delete next.glow;
  return next as RoomHeaderCardConfig;
}
