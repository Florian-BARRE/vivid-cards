import { html } from 'lit';
import { tintTone } from '../../core/glow';
import type { HomeAssistant } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerBadge } from '../../core/register';
import { formatNumber, localize } from '../../i18n';
import { VividBadge, type BadgeView } from '../base/vivid-badge';
import type { BadgeRow } from '../base/vivid-badge-rows';
import { badgeEditor, type BadgeEditorSpec } from '../base/vivid-badge-editor';
import '../base/vivid-badge-rows';
import {
  BATTERY_BADGE,
  DOMAINS,
  BATTERY_AGGREGATES,
  BATTERY_DISPLAYS,
  type ResolvedBatteryBadge,
  resolveBatteryBadge,
  type BatteryItem,
  type BatteryModel,
  BATTERY_COLORS,
  batteryIcon,
  buildBatteryModel,
} from './model';

/**
 * Batteries: the lowest level of a group (or of every battery when no entity
 * is set), in a battery icon that empties with it; green, amber, then red
 * and pulsing. The details sort them from the lowest.
 */
export class VividBatteryBadge extends VividBadge<ResolvedBatteryBadge> {
  private model?: BatteryModel;

  static getConfigElement(): HTMLElement {
    return badgeEditor(BATTERY_EDITOR);
  }

  static getStubConfig(): Record<string, unknown> {
    return {};
  }

  protected resolveConfig(raw: unknown): ResolvedBatteryBadge {
    return resolveBatteryBadge(raw);
  }

  protected buildView(hass: HomeAssistant, config: ResolvedBatteryBadge): BadgeView {
    const model = buildBatteryModel(hass, config);
    this.model = model;
    const { color, level } = BATTERY_COLORS[model.severity];
    const lowest = model.items.find((item) => item.low);
    const text =
      config.display === 'low_count' && model.lowCount > 0
        ? localize(hass, 'low_count', { n: model.lowCount })
        : model.value !== undefined
          ? `${formatNumber(hass, model.value)} %`
          : model.lowCount > 0
            ? localize(hass, 'battery_low')
            : undefined;
    const available = model.items.some((item) => item.available);
    return {
      name: model.name,
      active: available,
      icon: config.icon ?? batteryIcon(model.value, Boolean(lowest)),
      text,
      tone: tintTone(color, level),
      soft: true,
      pulse: model.severity === 2 ? '1.8s' : undefined,
      state: text ?? localize(hass, 'unavailable'),
      watched: model.watched,
      unavailable: !available,
    };
  }

  private rows(): BadgeRow[] {
    const model = this.model;
    if (!model) return [];
    const hass = this.hass;
    const order = (item: BatteryItem) =>
      !item.available ? 1000 : (item.level ?? (item.low ? -1 : 101));
    return [...model.items]
      .sort((a, b) => order(a) - order(b))
      .map((item) => {
        const { color, level } = BATTERY_COLORS[item.severity];
        return {
          entityId: item.entityId,
          icon: batteryIcon(item.level, item.low),
          name: item.name,
          value: !item.available
            ? localize(hass, 'unavailable')
            : item.level !== undefined
              ? `${formatNumber(hass, item.level)} %`
              : localize(hass, item.low ? 'battery_low' : 'battery_ok'),
          tone: item.available ? tintTone(color, level) : undefined,
          bar: item.level !== undefined ? item.level / 100 : undefined,
          barColor: color,
          dim: !item.available,
        };
      });
  }

  protected renderDetails() {
    const model = this.model;
    const count = model?.items.length ?? 0;
    return html`<vivid-badge-rows
      .heading=${model?.name}
      .summary=${
        model?.lowCount
          ? localize(this.hass, 'battery_summary', { count, low: model.lowCount })
          : localize(this.hass, 'battery_summary_ok', { count })
      }
      .rows=${this.rows()}
      value-width="48px"
    ></vivid-badge-rows>`;
  }
}

export const BATTERY_EDITOR: BadgeEditorSpec = {
  type: `custom:${BATTERY_BADGE}`,
  domain: DOMAINS,
  deviceClass: ['battery'],
  entityOptional: true,
  fields: [
    {
      name: 'display',
      label: 'battery_display',
      choices: { values: BATTERY_DISPLAYS, labelPrefix: 'battery_display_' },
      default: 'level',
      row: 2,
    },
    {
      name: 'aggregate',
      label: 'aggregate',
      choices: { values: BATTERY_AGGREGATES, labelPrefix: 'aggregate_' },
      default: 'min',
      row: 2,
    },
    {
      name: 'low',
      label: 'battery_low',
      selector: { number: { min: 0, max: 100, step: 1, mode: 'box' } },
      default: 15,
      row: 3,
    },
    {
      name: 'warn',
      label: 'battery_warn',
      selector: { number: { min: 0, max: 100, step: 1, mode: 'box' } },
      default: 30,
      row: 3,
    },
  ],
  validate: (config) => void resolveBatteryBadge(config),
};

defineElement(BATTERY_BADGE, VividBatteryBadge);

registerBadge({
  type: BATTERY_BADGE,
  name: 'Vivid battery badge',
  description:
    'The lowest battery of a group, or of the whole home, in an icon that empties and turns red. Tap for every battery from the lowest.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-battery-badge`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-battery-badge': VividBatteryBadge;
  }
}
