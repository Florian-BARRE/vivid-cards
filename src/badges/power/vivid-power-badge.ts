import { html } from 'lit';
import { powerColor, powerRatio, powerTone, tintTone } from '../../core/glow';
import type { HomeAssistant } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerBadge } from '../../core/register';
import { localize, type StringKey } from '../../i18n';
import { AGGREGATES } from '../base/config';
import { VividBadge, type BadgeView } from '../base/vivid-badge';
import type { BadgeRow } from '../base/vivid-badge-rows';
import { badgeEditor, type BadgeEditorSpec } from '../base/vivid-badge-editor';
import '../base/vivid-badge-rows';
import {
  POWER_BADGE,
  DOMAINS,
  PULSE_FROM,
  type ResolvedPowerBadge,
  resolvePowerBadge,
  formatPower,
  powerScale,
  type PowerModel,
  buildPowerModel,
} from './model';

/**
 * Power: the sum (or mean, max…) of a group, glowing like the consumption
 * badge of the LED card: neutral when idle, then yellow, amber and orange,
 * pulsing faster as it draws more. The details sort devices by power.
 */
export class VividPowerBadge extends VividBadge<ResolvedPowerBadge> {
  private model?: PowerModel;

  static getConfigElement(): HTMLElement {
    return badgeEditor(POWER_EDITOR);
  }

  static getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    const states = Object.values(hass?.states ?? {}).filter(
      (state) => state.entity_id.startsWith('sensor.') && state.attributes.device_class === 'power',
    );
    const group = states.find((state) => Array.isArray(state.attributes.entity_id));
    return { entity: (group ?? states[0])?.entity_id ?? 'sensor.power' };
  }

  protected resolveConfig(raw: unknown): ResolvedPowerBadge {
    return resolvePowerBadge(raw);
  }

  protected buildView(hass: HomeAssistant, config: ResolvedPowerBadge): BadgeView {
    const model = buildPowerModel(hass, config);
    this.model = model;
    const watts = model.watts;
    if (watts === undefined) {
      return {
        name: model.name,
        active: false,
        icon: config.iconOff ?? 'mdi:flash-outline',
        state: localize(hass, 'unavailable'),
        watched: model.watched,
        unavailable: true,
      };
    }
    const scale = powerScale(config);
    const active = watts >= config.idle;
    const ratio = powerRatio(watts, scale);
    return {
      name: model.name,
      active,
      icon: active ? (config.icon ?? 'mdi:flash') : (config.iconOff ?? 'mdi:flash-outline'),
      text: formatPower(hass, watts),
      textMuted: !active,
      tone: tintTone(powerColor(watts, scale), 0.2 + 0.75 * ratio),
      soft: true,
      pulse: ratio >= PULSE_FROM ? powerTone(watts, scale).pulse : undefined,
      state: formatPower(hass, watts),
      watched: model.watched,
    };
  }

  private rows(): BadgeRow[] {
    const model = this.model;
    const config = this._config;
    if (!model || !config) return [];
    const scale = powerScale(config);
    const top = Math.max(...model.items.map((item) => item.watts ?? 0), 1);
    return [...model.items]
      .sort((a, b) => (b.watts ?? -1) - (a.watts ?? -1))
      .map((item) => {
        if (item.watts === undefined) {
          return {
            entityId: item.entityId,
            icon: 'mdi:flash-outline',
            name: item.name,
            value: localize(this.hass, 'unavailable'),
            dim: true,
          };
        }
        const color = powerColor(item.watts, scale);
        const idle = item.watts < config.idle;
        return {
          entityId: item.entityId,
          icon: idle ? 'mdi:flash-outline' : 'mdi:flash',
          name: item.name,
          value: formatPower(this.hass, item.watts),
          tone: idle ? undefined : tintTone(color, 0.2 + 0.75 * powerRatio(item.watts, scale)),
          // Bars compare devices with the biggest one.
          bar: Math.max(0, item.watts) / top,
          barColor: color,
          dim: idle,
        };
      });
  }

  protected renderDetails() {
    const model = this.model;
    const config = this._config;
    const summary =
      model?.watts !== undefined && config
        ? `${localize(this.hass, `agg_${config.aggregate}` as StringKey)} ${formatPower(this.hass, model.watts)}`
        : undefined;
    return html`<vivid-badge-rows
      .heading=${model?.name}
      .summary=${summary}
      .rows=${this.rows()}
      value-width="60px"
    ></vivid-badge-rows>`;
  }
}

export const POWER_EDITOR: BadgeEditorSpec = {
  type: `custom:${POWER_BADGE}`,
  domain: DOMAINS,
  deviceClass: ['power'],
  iconOff: true,
  fields: [
    {
      name: 'aggregate',
      label: 'aggregate',
      choices: { values: AGGREGATES, labelPrefix: 'aggregate_' },
      default: 'sum',
    },
    {
      name: 'idle',
      label: 'power_idle',
      selector: { number: { min: 0, max: 100000, step: 1, mode: 'box' } },
      default: 5,
      row: 2,
    },
    {
      name: 'max',
      label: 'power_max',
      selector: { number: { min: 1, max: 100000, step: 50, mode: 'box' } },
      default: 3000,
      row: 2,
    },
  ],
  validate: (config) => void resolvePowerBadge(config),
};

defineElement(POWER_BADGE, VividPowerBadge);

registerBadge({
  type: POWER_BADGE,
  name: 'Vivid power badge',
  description:
    'Power drawn by a group of devices, glowing brighter and pulsing faster as it rises, like the LED card. Tap for each device.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-power-badge`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-power-badge': VividPowerBadge;
  }
}
