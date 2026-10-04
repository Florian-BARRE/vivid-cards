import { lightColor } from '../../core/color';
import { expandGroup, friendlyName, isAvailable } from '../../core/entities';
import type { HomeAssistant, LightAttributes, Rgb } from '../../core/hass-types';
import { shortenSiblingNames } from '../../core/naming';
import type { ResolvedLightBadgeConfig } from './config';

export interface BadgeLight {
  entityId: string;
  name: string;
  available: boolean;
  isOn: boolean;
  /** 0–100, 0 when off. */
  brightness: number;
  rgb?: Rgb;
  dimmable: boolean;
}

export interface LightBadgeModel {
  name: string;
  isGroup: boolean;
  lights: BadgeLight[];
  /** Lights that are on, and lights that can be reached. */
  on: number;
  total: number;
  /** Colors of the lights that are on, for the gradient. */
  colors: Rgb[];
  /** Mean brightness of the lights that are on. */
  brightness: number;
  icon: string;
  iconOff: string;
  /** No off variant of the icon is known: strike the on icon instead. */
  strike: boolean;
  watched: string[];
}

/** Crossed-out variants of the usual light icons; other icons get a drawn stroke. */
const OFF_ICONS: Record<string, string> = {
  'mdi:led-strip-variant': 'mdi:led-strip-variant-off',
  'mdi:led-strip': 'mdi:led-strip-variant-off',
  'mdi:lightbulb': 'mdi:lightbulb-off',
  'mdi:lightbulb-outline': 'mdi:lightbulb-off-outline',
  'mdi:lightbulb-group': 'mdi:lightbulb-group-off',
  'mdi:lightbulb-group-outline': 'mdi:lightbulb-group-off-outline',
  'mdi:lightbulb-multiple': 'mdi:lightbulb-multiple-off',
  'mdi:lightbulb-multiple-outline': 'mdi:lightbulb-multiple-off-outline',
  'mdi:desk-lamp': 'mdi:desk-lamp-off',
  'mdi:string-lights': 'mdi:string-lights-off',
};

/** Icon used when neither the config nor the entity sets one. */
export function defaultBadgeIcon(isGroup: boolean, allWled: boolean): string {
  if (allWled) return 'mdi:led-strip-variant';
  return isGroup ? 'mdi:lightbulb-group' : 'mdi:lightbulb';
}

/** Off icon of `icon`, when Material Design Icons has one. */
export function offIconOf(icon: string): string | undefined {
  return OFF_ICONS[icon];
}

const DIMMABLE_MODES = new Set([
  'brightness',
  'color_temp',
  'hs',
  'rgb',
  'rgbw',
  'rgbww',
  'xy',
  'white',
]);

function isDimmable(attributes: LightAttributes | undefined): boolean {
  const modes = attributes?.supported_color_modes;
  return Array.isArray(modes) && modes.some((mode) => DIMMABLE_MODES.has(mode));
}

export function buildLightBadgeModel(
  hass: HomeAssistant,
  config: ResolvedLightBadgeConfig,
): LightBadgeModel {
  const state = hass.states[config.entity];
  const ids = expandGroup(hass, config.entity);
  const isGroup = Array.isArray(state?.attributes.entity_id) && ids.length > 0;
  const names = shortenSiblingNames(ids.map((id) => friendlyName(hass, id)));
  const lights: BadgeLight[] = ids.map((entityId, index) => {
    const light = hass.states[entityId];
    const attributes = light?.attributes as LightAttributes | undefined;
    const available = isAvailable(light);
    const isOn = available && light.state === 'on';
    const raw = attributes?.brightness;
    return {
      entityId,
      name: names[index] ?? entityId,
      available,
      isOn,
      brightness: isOn ? (typeof raw === 'number' ? Math.round((raw / 255) * 100) : 100) : 0,
      rgb: isOn ? lightColor(light) : undefined,
      dimmable: isDimmable(attributes),
    };
  });
  const lit = lights.filter((light) => light.isOn);
  const allWled = ids.length > 0 && ids.every((id) => hass.entities?.[id]?.platform === 'wled');
  const own = state?.attributes.icon;
  const icon =
    config.icon ?? (typeof own === 'string' && own ? own : defaultBadgeIcon(isGroup, allWled));
  const knownOff = OFF_ICONS[icon];
  return {
    name: config.name ?? friendlyName(hass, config.entity),
    isGroup,
    lights,
    on: lit.length,
    total: lights.filter((light) => light.available).length,
    colors: lit.map((light) => light.rgb).filter((rgb): rgb is Rgb => rgb !== undefined),
    brightness: lit.length
      ? Math.round(lit.reduce((sum, light) => sum + light.brightness, 0) / lit.length)
      : 0,
    icon,
    iconOff: config.iconOff ?? knownOff ?? icon,
    strike: config.iconOff === undefined && knownOff === undefined,
    watched: [config.entity, ...ids],
  };
}
