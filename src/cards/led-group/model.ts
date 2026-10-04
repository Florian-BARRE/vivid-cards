import type { ActionConfig } from '../../core/action-handler';
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
  type LiveOverrideState,
} from '../../integrations/wled';
import type { ResolvedLedGroupConfig } from './config';

export interface LightModel {
  entityId: string;
  name: string;
  available: boolean;
  isOn: boolean;
  /** 0–100, 0 when off. */
  brightness: number;
  rgb: Rgb | undefined;
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
}

export interface GroupLiveOverride {
  /** Selects that can be switched right now. */
  available: string[];
  /** At least one strip ignores realtime data. */
  active: boolean;
}

export interface LedGroupModel extends LightModel {
  icon: string;
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
  stripScale: PowerScale;
  groupScale: PowerScale;
  liveOverride: GroupLiveOverride | undefined;
  detailsEnabled: boolean;
  tileColorBar: ColorBar;
  holdAction: ActionConfig;
  /** Every entity the card reads; a change to any of them triggers a render. */
  watched: string[];
}

function lightModel(hass: HomeAssistant, entityId: string, name: string): LightModel {
  const state: HassEntity | undefined = hass.states[entityId];
  const available = isAvailable(state);
  const isOn = available && state.state === 'on';
  const raw = (state?.attributes as LightAttributes | undefined)?.brightness;
  const brightness = isOn ? (typeof raw === 'number' ? Math.round((raw / 255) * 100) : 100) : 0;
  return {
    entityId,
    name,
    available,
    isOn,
    brightness,
    rgb: isOn ? lightColor(state) : undefined,
  };
}

function scaleFor(scale: PowerScale, count: number): PowerScale {
  const factor = Math.max(count, 1);
  return {
    idle: scale.idle * factor,
    max: scale.max * factor,
    steps: [scale.steps[0] * factor, scale.steps[1] * factor],
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
    const strip: StripModel = {
      ...lightModel(hass, entityId, override?.name ?? autoName),
      autoName,
      hidden: override?.hidden ?? false,
      wled: hass.entities?.[entityId]?.platform === 'wled',
      watts: undefined,
      ambilight: false,
    };

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

    const liveOverride = findWledEntities(hass, entityId).liveOverride;
    if (liveOverride) {
      strip.liveOverride = liveOverrideState(hass, liveOverride);
      strip.ambilight = config.ambilight.enabled && override?.ambilight !== false;
      watched.add(liveOverride);
    }
    return strip;
  });

  if (config.details.sort === 'name') {
    detected.sort((a, b) => a.name.localeCompare(b.name));
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
  const group = lightModel(hass, config.entity, config.name ?? friendlyName(hass, config.entity));

  return {
    ...group,
    icon: config.icon,
    isGroup,
    detected,
    members,
    watts,
    hasPower: powered.length > 0,
    hasLiveOverride: detected.some((m) => m.liveOverride !== undefined),
    stripScale: config.power.scale,
    groupScale: scaleFor(config.power.scale, powered.length),
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
