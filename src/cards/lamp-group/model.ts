import { memberIds, secondsSince } from '../../badges/base/members';
import { domainOf, friendlyName, isAvailable, parseNumericState } from '../../core/entities';
import { clamp } from '../../core/color';
import { LIGHT_AMBER, tintTone, type ChipTone, type PowerScale } from '../../core/glow';
import type { HassEntity, HomeAssistant } from '../../core/hass-types';
import { formatNumber, localize, shortDuration } from '../../i18n';
import { restingIcon } from '../../core/icons';
import { shortenSiblingNames } from '../../core/naming';
import { readWatts, resolvePowerSource, type PowerSource } from '../../integrations/power';
import type { ResolvedLampGroupConfig, ResolvedLampScene } from './config';

export const DEFAULT_LAMP_ICON = 'mdi:lamp';
export const DEFAULT_GROUP_ICON = 'mdi:lamps';
/** A lamp just switched on may not report its consumption yet: no warning before this (s). */
export const WARN_GRACE_S = 60;
/** The lamps a scene switches change a moment after the scene itself (ms). */
const SCENE_TOLERANCE_MS = 5000;
/** Halo of a lamp that is on but reports no consumption. */
const UNKNOWN_LEVEL = 0.6;

export interface LampModel {
  entityId: string;
  /** Configured name, else shortened against the other lamps. */
  name: string;
  autoName: string;
  icon: string;
  /** Resting icon (outline or crossed-out variant, else `icon`). */
  iconOff: string;
  available: boolean;
  isOn: boolean;
  /** Seconds since the lamp was switched on or off. */
  since: number;
  /** Listed in the card (hidden lamps still count in the group). */
  hidden: boolean;
  power?: PowerSource;
  watts?: number;
  /** On for a while but drawing less than `warn_below`: a bulb out, the lamp's own switch off. */
  warn: boolean;
  /** 0–1 halo level while on, from the consumption. */
  level: number;
}

export interface LampSceneModel extends ResolvedLampScene {
  /** The lamps are as the preset sets them (or the scene was the last thing applied). */
  active: boolean;
}

export interface LampGroupModel {
  name: string;
  icon: string;
  iconOff: string;
  /** The group entity, when the card is built on one. */
  groupEntity?: string;
  /** Every lamp, hidden ones included. */
  all: LampModel[];
  /** Lamps shown on the card. */
  lamps: LampModel[];
  on: number;
  /** Lamps that can be reached. */
  total: number;
  /** Sum of the lamps that report a consumption. */
  watts?: number;
  hasPower: boolean;
  /** Scale of the group's consumption chip. */
  scale: PowerScale;
  /** Halo of the group's power button. */
  level: number;
  warnings: number;
  scenes: LampSceneModel[];
  /** Price of a kWh, from the card or its price entity. */
  price?: number;
  currency: string;
  /** Every entity the card reads; a change to any of them renders it again. */
  watched: string[];
}

function ownIcon(hass: HomeAssistant, entityId: string): string | undefined {
  const icon = hass.states[entityId]?.attributes.icon;
  return typeof icon === 'string' && icon ? icon : undefined;
}

/** 0.25 for a faint lamp up to 0.9 at `maxWatts`: a lamp on always glows a little. */
export function wattsLevel(watts: number | undefined, maxWatts: number): number {
  if (watts === undefined) return UNKNOWN_LEVEL;
  return 0.25 + 0.65 * clamp(watts / Math.max(maxWatts, 1), 0, 1);
}

/** Brightness (percent) of a dimmable light, `undefined` for plugs and switches. */
function brightnessOf(state: HassEntity | undefined): number | undefined {
  const raw = state?.attributes.brightness;
  return typeof raw === 'number' ? (raw / 255) * 100 : undefined;
}

/** From the consumption, else the brightness of a dimmable light. */
function lampLevel(watts: number | undefined, brightness: number | undefined, maxWatts: number) {
  if (watts === undefined && brightness !== undefined) return 0.25 + 0.65 * (brightness / 100);
  return wattsLevel(watts, maxWatts);
}

/** The state of `price_entity` when it holds a number, else `price`. */
export function kwhPrice(hass: HomeAssistant, config: ResolvedLampGroupConfig): number | undefined {
  if (config.priceEntity) {
    const value = parseNumericState(hass.states[config.priceEntity]);
    if (value !== undefined) return value;
  }
  return config.price;
}

function sceneActive(
  hass: HomeAssistant,
  scene: ResolvedLampScene,
  lamps: readonly LampModel[],
  switchedAt: number | undefined,
): boolean {
  const reachable = lamps.filter((lamp) => lamp.available);
  if (reachable.length === 0) return false;
  if (scene.lamps) {
    const wanted = new Set(scene.lamps);
    return reachable.every((lamp) => lamp.isOn === wanted.has(lamp.entityId));
  }
  // A Home Assistant scene stores when it was last activated: it is current
  // when no lamp changed since. The lamps it lists change right after it;
  // the others must not have changed at all.
  const state = scene.scene ? hass.states[scene.scene] : undefined;
  const activated = state ? Date.parse(state.state) : Number.NaN;
  if (!Number.isFinite(activated)) return false;
  // The card switched lamps itself after the scene.
  if (switchedAt !== undefined && switchedAt > activated) return false;
  const listed = state?.attributes.entity_id;
  const inScene = new Set(Array.isArray(listed) ? listed.map(String) : []);
  return reachable.every((lamp) => {
    const changed = Date.parse(hass.states[lamp.entityId]?.last_changed ?? '');
    if (!Number.isFinite(changed)) return true;
    const tolerance = inScene.size === 0 || inScene.has(lamp.entityId) ? SCENE_TOLERANCE_MS : 0;
    return changed <= activated + tolerance;
  });
}

export function buildLampGroupModel(
  hass: HomeAssistant,
  config: ResolvedLampGroupConfig,
  now = Date.now(),
  /** When the card last switched lamps itself (not through a scene). */
  switchedAt?: number,
): LampGroupModel {
  const ids = memberIds(hass, config);
  const autoNames = shortenSiblingNames(ids.map((id) => friendlyName(hass, id)));
  const watched = new Set<string>([
    ...(config.entity ? [config.entity] : []),
    ...(config.entities ?? []),
    ...ids,
  ]);

  const all: LampModel[] = ids.map((entityId, index) => {
    const override = config.members.get(entityId);
    const state = hass.states[entityId];
    const available = isAvailable(state);
    const isOn = available && state.state === 'on';
    const icon = override?.icon ?? ownIcon(hass, entityId) ?? DEFAULT_LAMP_ICON;
    const autoName = autoNames[index] ?? entityId;
    const lamp: LampModel = {
      entityId,
      name: override?.name ?? autoName,
      autoName,
      icon,
      iconOff: override?.iconOff ?? restingIcon(icon),
      available,
      isOn,
      since: secondsSince(state, now),
      hidden: override?.hidden ?? false,
      warn: false,
      level: 0,
    };
    if (config.showPower || config.warnBelow > 0) {
      lamp.power = resolvePowerSource(hass, entityId, {}, { sensor: override?.powerSensor });
      if (lamp.power) {
        lamp.watts = readWatts(hass, lamp.power);
        watched.add(lamp.power.entityId);
      }
    }
    lamp.level = isOn ? lampLevel(lamp.watts, brightnessOf(state), config.maxWatts) : 0;
    lamp.warn =
      isOn &&
      config.warnBelow > 0 &&
      lamp.watts !== undefined &&
      lamp.watts < config.warnBelow &&
      lamp.since >= WARN_GRACE_S;
    return lamp;
  });

  const reachable = all.filter((lamp) => lamp.available);
  const lit = reachable.filter((lamp) => lamp.isOn);
  const reporting = all.filter((lamp) => lamp.watts !== undefined);
  const watts = reporting.length
    ? reporting.reduce((sum, lamp) => sum + (lamp.watts ?? 0), 0)
    : undefined;
  const powered = all.filter((lamp) => lamp.power !== undefined).length;
  const groupMax = config.maxWatts * Math.max(powered, 1);

  for (const scene of config.scenes) if (scene.scene) watched.add(scene.scene);
  if (config.priceEntity) watched.add(config.priceEntity);

  const groupEntity =
    config.entity && Array.isArray(hass.states[config.entity]?.attributes.entity_id)
      ? config.entity
      : undefined;
  const icon =
    config.icon ?? (groupEntity ? ownIcon(hass, groupEntity) : undefined) ?? DEFAULT_GROUP_ICON;
  const nameSource = config.entity ?? config.entities?.[0];
  return {
    name:
      config.name ??
      (groupEntity ? friendlyName(hass, groupEntity) : undefined) ??
      (ids.length === 1 && nameSource
        ? friendlyName(hass, nameSource)
        : localize(hass, 'lamps_title')),
    icon,
    iconOff: restingIcon(icon),
    groupEntity,
    all,
    lamps: all.filter((lamp) => !lamp.hidden),
    on: lit.length,
    total: reachable.length,
    watts,
    hasPower: powered > 0,
    scale: {
      idle: 0.5,
      max: groupMax,
      steps: [groupMax * 0.35, groupMax * 0.7],
    },
    level: lit.length ? Math.max(...lit.map((lamp) => lamp.level)) : 0,
    warnings: all.filter((lamp) => lamp.warn).length,
    scenes: config.scenes.map((scene) => ({
      ...scene,
      active: sceneActive(hass, scene, all, switchedAt),
    })),
    price: kwhPrice(hass, config),
    currency: hass.config?.currency ?? 'EUR',
    watched: [...watched],
  };
}

/** Service calls that switch `ids` on or off, one per domain. */
export function switchCalls(
  ids: readonly string[],
  on: boolean,
): { domain: string; service: string; entityIds: string[] }[] {
  const byDomain = new Map<string, string[]>();
  for (const id of ids) {
    const domain = domainOf(id);
    const service = ['light', 'switch', 'input_boolean'].includes(domain)
      ? domain
      : 'homeassistant';
    byDomain.set(service, [...(byDomain.get(service) ?? []), id]);
  }
  return [...byDomain.entries()].map(([domain, entityIds]) => ({
    domain,
    service: on ? 'turn_on' : 'turn_off',
    entityIds,
  }));
}

/** Calls applying a preset: its lamps on, every other lamp of the card off. */
export function presetCalls(
  scene: ResolvedLampScene,
  lamps: readonly LampModel[],
): { domain: string; service: string; entityIds: string[] }[] {
  if (scene.scene) return [{ domain: 'scene', service: 'turn_on', entityIds: [scene.scene] }];
  const wanted = new Set(scene.lamps ?? []);
  const reachable = lamps.filter((lamp) => lamp.available);
  const on = reachable.filter((lamp) => wanted.has(lamp.entityId) && !lamp.isOn);
  const off = reachable.filter((lamp) => !wanted.has(lamp.entityId) && lamp.isOn);
  return [
    ...switchCalls(
      on.map((lamp) => lamp.entityId),
      true,
    ),
    ...switchCalls(
      off.map((lamp) => lamp.entityId),
      false,
    ),
  ];
}

/**
 * Amber tone of a lamp at a halo `level` (0–1). `surface` lays the translucent
 * fill over that background, for controls that sit on the page.
 */
export function lampTone(level: number, surface?: string): ChipTone {
  const tone = tintTone(LIGHT_AMBER, level);
  if (!surface || !tone.background) return tone;
  return {
    ...tone,
    background: `linear-gradient(${tone.background}, ${tone.background}), ${surface}`,
  };
}

/**
 * Parts of a status joined so that a narrow card breaks the line only after
 * a separator ("18 W ·" / "35 min"), never inside a value.
 */
function joinStatus(parts: readonly (string | undefined)[]): string {
  return parts
    .filter((part): part is string => Boolean(part))
    .map((part) => part.replaceAll(' ', '\u00a0'))
    .join('\u00a0· ');
}

/** "18 W", "0.3 W". */
export function lampWatts(hass: HomeAssistant | undefined, watts: number): string {
  return `${formatNumber(hass, watts, watts < 10 ? 1 : 0)} W`;
}

export interface StatusOptions {
  showPower: boolean;
  showDuration: boolean;
  /** Says when a lamp is on but draws nothing (the details). */
  explainWarning?: boolean;
}

/** "18 W · 35 min", "off · 3 h", "0.3 W · on but drawing nothing". */
export function lampStatus(
  hass: HomeAssistant | undefined,
  lamp: LampModel,
  options: StatusOptions,
): string {
  if (!lamp.available) return localize(hass, 'unavailable');
  // "< 1 min" right after a switch says nothing the lamp itself does not show.
  const duration =
    options.showDuration && lamp.since >= 60 ? shortDuration(hass, lamp.since) : undefined;
  if (!lamp.isOn) {
    return joinStatus([localize(hass, 'lamp_off'), duration]);
  }
  const watts =
    options.showPower && lamp.watts !== undefined ? lampWatts(hass, lamp.watts) : undefined;
  const parts =
    lamp.warn && options.explainWarning
      ? [watts, localize(hass, 'lamp_no_draw')]
      : [watts, duration];
  return joinStatus(parts) || localize(hass, 'lamp_on');
}
