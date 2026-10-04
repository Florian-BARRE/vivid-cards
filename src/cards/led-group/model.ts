import type { ActionConfig } from '../../core/action-handler';
import { badgeModel, type BadgeModel } from '../../core/badges';
import { lightColor } from '../../core/color';
import { expandGroup, friendlyName, isAvailable } from '../../core/entities';
import type { PowerScale } from '../../core/glow';
import type { HassEntity, HomeAssistant, LightAttributes, Rgb } from '../../core/hass-types';
import { resolveColorBar, type ColorBar } from '../../core/light';
import { shortenSiblingNames } from '../../core/naming';
import { readWatts, resolvePowerSource, type PowerSource } from '../../integrations/power';
import {
  findWledEntities,
  liveOverrideState,
  maxWatts,
  type LiveOverrideState,
  type WledEntities,
} from '../../integrations/wled';
import { DEFAULT_ICON, type ResolvedLedGroupConfig } from './config';

export interface LightModel {
  entityId: string;
  name: string;
  /** Card icon, else the light's own icon, else the LED strip icon. */
  icon: string;
  available: boolean;
  isOn: boolean;
  /** 0–100, 0 when off. */
  brightness: number;
  rgb: Rgb | undefined;
  /** An animated effect is running (anything but Solid). */
  effectActive: boolean;
}

export interface StripModel extends LightModel {
  /** Name computed from the sibling names, before any override. */
  autoName: string;
  /** Hidden from the details dialog (still part of totals and ambilight). */
  hidden: boolean;
  /** Provided by the WLED integration. */
  wled: boolean;
  power?: PowerSource;
  watts: number | undefined;
  /** WLED live override select of this strip, when it has one. */
  liveOverride?: LiveOverrideState;
  /** Shows an ambilight badge and answers the group ambilight badge. */
  ambilight: boolean;
  /** WLED companions (empty for other lights). */
  wledEntities: WledEntities;
  /** Glow scale of this light's consumption badge. */
  scale: PowerScale;
}

export interface GroupLiveOverride {
  /** Selects that can be switched right now. */
  available: string[];
  /** At least one strip ignores realtime data. */
  active: boolean;
}

export interface LedGroupModel extends LightModel {
  /** The entity is a group with members. */
  isGroup: boolean;
  /** Every detected strip, including hidden ones. */
  detected: StripModel[];
  /** Strips listed in the details dialog. */
  members: StripModel[];
  /** Sum of the strips that report a consumption. */
  watts: number | undefined;
  /** At least one strip has a consumption source. */
  hasPower: boolean;
  /** At least one strip has a WLED live override. */
  hasLiveOverride: boolean;
  groupScale: PowerScale;
  /** Colors of the lit lights, for the power button gradient. */
  colors: Rgb[];
  badges: BadgeModel[];
  liveOverride: GroupLiveOverride | undefined;
  detailsEnabled: boolean;
  tileColorBar: ColorBar;
  holdAction: ActionConfig;
  /** Every entity the card reads; a change to any of them triggers a render. */
  watched: string[];
}

function lightModel(
  hass: HomeAssistant,
  entityId: string,
  name: string,
  icon: string | undefined,
): LightModel {
  const state: HassEntity | undefined = hass.states[entityId];
  const own = state?.attributes.icon;
  const available = isAvailable(state);
  const isOn = available && state.state === 'on';
  const raw = (state?.attributes as LightAttributes | undefined)?.brightness;
  const brightness = isOn ? (typeof raw === 'number' ? Math.round((raw / 255) * 100) : 100) : 0;
  const effect = (state?.attributes as LightAttributes | undefined)?.effect;
  return {
    entityId,
    name,
    icon: icon ?? (typeof own === 'string' && own ? own : DEFAULT_ICON),
    available,
    isOn,
    brightness,
    rgb: isOn ? lightColor(state) : undefined,
    effectActive: isOn && typeof effect === 'string' && !STATIC_EFFECTS.has(effect.toLowerCase()),
  };
}

const STATIC_EFFECTS = new Set(['solid', 'none', 'off', '']);

/**
 * Scale of one light. Without an explicit `power.max`, WLED's current limit ×
 * voltage gives the real maximum; the color steps then follow it.
 */
function stripScale(
  hass: HomeAssistant,
  config: ResolvedLedGroupConfig,
  wled: WledEntities,
  voltage: number | undefined,
): PowerScale {
  const base = config.power.scale;
  const auto = config.power.autoMax ? maxWatts(hass, wled, voltage) : undefined;
  if (auto === undefined) return base;
  const ratio = auto / base.max;
  return {
    ...base,
    max: auto,
    steps: config.power.autoSteps ? [base.steps[0] * ratio, base.steps[1] * ratio] : base.steps,
  };
}

/** The group scale adds up the scales of the lights that report a consumption. */
function sumScales(base: PowerScale, scales: readonly PowerScale[]): PowerScale {
  if (scales.length === 0) return base;
  const total = (pick: (scale: PowerScale) => number) =>
    scales.reduce((sum, scale) => sum + pick(scale), 0);
  return {
    idle: total((scale) => scale.idle),
    max: total((scale) => scale.max),
    steps: [total((scale) => scale.steps[0]), total((scale) => scale.steps[1])],
    colors: base.colors,
  };
}

export function buildLedGroupModel(
  hass: HomeAssistant,
  config: ResolvedLedGroupConfig,
): LedGroupModel {
  const groupState = hass.states[config.entity];
  const memberIds = expandGroup(hass, config.entity);
  const isGroup = Array.isArray(groupState?.attributes.entity_id) && memberIds.length > 0;
  const autoNames = shortenSiblingNames(memberIds.map((id) => friendlyName(hass, id)));
  const watched = new Set<string>([config.entity, ...memberIds]);

  const detected: StripModel[] = memberIds.map((entityId, index) => {
    const override = config.members.get(entityId);
    const autoName = autoNames[index] ?? entityId;
    const wledEntities = findWledEntities(hass, entityId);
    const strip: StripModel = {
      ...lightModel(hass, entityId, override?.name ?? autoName, override?.icon ?? config.icon),
      autoName,
      hidden: override?.hidden ?? false,
      wled: hass.entities?.[entityId]?.platform === 'wled',
      watts: undefined,
      ambilight: false,
      wledEntities,
      scale: stripScale(hass, config, wledEntities, override?.voltage ?? config.power.voltage),
    };
    for (const companion of Object.values(wledEntities)) {
      if (companion) watched.add(companion);
    }

    if (config.power.enabled) {
      strip.power = resolvePowerSource(hass, entityId, config.power, {
        mode: override?.power_mode,
        sensor: override?.power_sensor,
        voltage: override?.voltage,
      });
      if (strip.power) {
        strip.watts = readWatts(hass, strip.power);
        watched.add(strip.power.entityId);
      }
    }

    const liveOverride = wledEntities.liveOverride;
    if (liveOverride) {
      strip.liveOverride = liveOverrideState(hass, liveOverride);
      strip.ambilight = config.ambilight.enabled && override?.ambilight !== false;
      watched.add(liveOverride);
    }
    return strip;
  });

  if (config.details.sort === 'name') {
    detected.sort((a, b) => a.name.localeCompare(b.name));
  } else if (config.details.sort === 'custom') {
    // Listed lights first, in the given order; the others keep the group order.
    const rank = (id: string) => {
      const index = config.details.order.indexOf(id);
      return index === -1 ? config.details.order.length : index;
    };
    detected.sort((a, b) => rank(a.entityId) - rank(b.entityId));
  }

  const powered = detected.filter((m) => m.power !== undefined);
  const reporting = powered.filter((m) => m.watts !== undefined);
  const watts = reporting.length
    ? reporting.reduce((sum, m) => sum + (m.watts ?? 0), 0)
    : undefined;

  const overrides = new Map<string, LiveOverrideState>();
  for (const strip of detected) {
    if (strip.ambilight && strip.liveOverride) {
      overrides.set(strip.liveOverride.entityId, strip.liveOverride);
    }
  }
  const overrideStates = [...overrides.values()];
  const liveOverride: GroupLiveOverride | undefined = overrideStates.length
    ? {
        available: overrideStates.filter((o) => o.available).map((o) => o.entityId),
        active: overrideStates.some((o) => o.active),
      }
    : undefined;

  const members = detected.filter((m) => !m.hidden);
  const detailsEnabled = (config.details.enabled ?? isGroup) && members.length > 0;
  const group = lightModel(
    hass,
    config.entity,
    config.name ?? friendlyName(hass, config.entity),
    config.icon,
  );
  const lit = detected.filter((strip) => strip.rgb !== undefined);
  const colors =
    isGroup && config.appearance.gradient && lit.length > 1
      ? lit.map((strip) => strip.rgb as Rgb)
      : group.rgb
        ? [group.rgb]
        : [];
  for (const badge of config.badges) watched.add(badge.entity);

  return {
    ...group,
    isGroup,
    detected,
    members,
    watts,
    hasPower: powered.length > 0,
    hasLiveOverride: detected.some((m) => m.liveOverride !== undefined),
    groupScale: sumScales(
      config.power.scale,
      powered.map((strip) => strip.scale),
    ),
    colors,
    badges: config.badges.map((badge) => badgeModel(hass, badge)),
    liveOverride,
    detailsEnabled,
    tileColorBar: resolveColorBar(config.tile.colorBar, groupState),
    holdAction: config.tile.holdAction ?? { action: detailsEnabled ? 'details' : 'more-info' },
    watched: [...watched],
  };
}

/** True when any watched entity changed between two `hass` snapshots. */
export function watchedChanged(
  previous: HomeAssistant | undefined,
  next: HomeAssistant,
  watched: readonly string[],
): boolean {
  if (!previous) return true;
  if (previous.entities !== next.entities || previous.language !== next.language) return true;
  return watched.some((id) => previous.states[id] !== next.states[id]);
}
