import { lightColor } from '../../core/color';
import { expandGroup, friendlyName, isAvailable } from '../../core/entities';
import type { PowerScale } from '../../core/glow';
import type { HassEntity, HomeAssistant, LightAttributes, Rgb } from '../../core/hass-types';
import { shortenSiblingNames } from '../../core/naming';
import { readWatts, resolvePowerSource } from '../../integrations/power';
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
  powerEntity?: string;
  watts: number | undefined;
  liveOverride?: LiveOverrideState;
}

export interface GroupLiveOverride {
  /** Selects that can be switched right now. */
  available: string[];
  /** At least one strip ignores realtime data. */
  active: boolean;
}

export interface LedGroupModel extends LightModel {
  icon: string;
  members: StripModel[];
  /** Sum of the strips that report a consumption. */
  watts: number | undefined;
  stripScale: PowerScale;
  groupScale: PowerScale;
  liveOverride: GroupLiveOverride | undefined;
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
  const memberIds = expandGroup(hass, config.entity).filter(
    (id) => !config.members.get(id)?.hidden,
  );
  const shortNames = shortenSiblingNames(memberIds.map((id) => friendlyName(hass, id)));
  const watched = new Set<string>([config.entity, ...memberIds]);

  const members: StripModel[] = memberIds.map((entityId, index) => {
    const override = config.members.get(entityId);
    const name = override?.name ?? shortNames[index] ?? entityId;
    const strip: StripModel = { ...lightModel(hass, entityId, name), watts: undefined };

    const source = resolvePowerSource(hass, entityId, config.power, override?.power_sensor);
    if (source) {
      strip.powerEntity = source.entityId;
      strip.watts = readWatts(hass, source);
      watched.add(source.entityId);
    }

    const liveOverride = findWledEntities(hass, entityId).liveOverride;
    if (liveOverride) {
      strip.liveOverride = liveOverrideState(hass, liveOverride);
      watched.add(liveOverride);
    }
    return strip;
  });

  members.sort((a, b) => a.name.localeCompare(b.name));

  const powered = members.filter((m) => m.powerEntity !== undefined);
  const reporting = powered.filter((m) => m.watts !== undefined);
  const watts = reporting.length
    ? reporting.reduce((sum, m) => sum + (m.watts ?? 0), 0)
    : undefined;

  const overrides = new Map<string, LiveOverrideState>();
  for (const member of members) {
    if (member.liveOverride) overrides.set(member.liveOverride.entityId, member.liveOverride);
  }
  const overrideStates = [...overrides.values()];
  const liveOverride: GroupLiveOverride | undefined = overrideStates.length
    ? {
        available: overrideStates.filter((o) => o.available).map((o) => o.entityId),
        active: overrideStates.some((o) => o.active),
      }
    : undefined;

  const group = lightModel(hass, config.entity, config.name ?? friendlyName(hass, config.entity));

  return {
    ...group,
    icon: config.icon,
    members,
    watts,
    stripScale: config.scale,
    groupScale: scaleFor(config.scale, powered.length),
    liveOverride,
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
