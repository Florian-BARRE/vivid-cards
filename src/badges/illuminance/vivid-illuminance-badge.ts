import { html } from 'lit';
import { rgbCss } from '../../core/color';
import { tintTone } from '../../core/glow';
import type { HomeAssistant } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerBadge } from '../../core/register';
import { formatNumber, localize, type StringKey } from '../../i18n';
import { AGGREGATES } from '../base/config';
import { VividBadge, type BadgeView } from '../base/vivid-badge';
import type { BadgeRow } from '../base/vivid-badge-rows';
import { badgeEditor, type BadgeEditorSpec } from '../base/vivid-badge-editor';
import '../base/vivid-badge-rows';
import {
  ILLUMINANCE_BADGE,
  DOMAINS,
  type ResolvedIlluminanceBadge,
  resolveIlluminanceBadge,
  luxRatio,
  luxColor,
  luxIcon,
  type IlluminanceModel,
  buildIlluminanceModel,
} from './model';

/**
 * Illuminance: the mean (or min, max…) of a group, with an icon going from
 * the moon to the sun, a color from night indigo to sunlight, and a gauge
 * ring on a log scale.
 */
export class VividIlluminanceBadge extends VividBadge<ResolvedIlluminanceBadge> {
  private model?: IlluminanceModel;

  static getConfigElement(): HTMLElement {
    return badgeEditor(ILLUMINANCE_EDITOR);
  }

  static getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    const sensor = Object.values(hass?.states ?? {}).find(
      (state) =>
        state.entity_id.startsWith('sensor.') && state.attributes.device_class === 'illuminance',
    );
    return { entity: sensor?.entity_id ?? 'sensor.illuminance' };
  }

  protected resolveConfig(raw: unknown): ResolvedIlluminanceBadge {
    return resolveIlluminanceBadge(raw);
  }

  private format(value: number): string {
    return `${formatNumber(this.hass, value)} ${this.model?.unit ?? 'lx'}`;
  }

  protected buildView(hass: HomeAssistant, config: ResolvedIlluminanceBadge): BadgeView {
    const model = buildIlluminanceModel(hass, config);
    this.model = model;
    const value = model.value;
    if (value === undefined) {
      return {
        name: model.name,
        active: false,
        icon: config.icon ?? 'mdi:brightness-5',
        state: localize(hass, 'unavailable'),
        watched: model.watched,
        unavailable: true,
      };
    }
    const ratio = luxRatio(value, config.max);
    const color = luxColor(ratio);
    return {
      name: model.name,
      active: true,
      icon: config.icon ?? luxIcon(value),
      text: this.format(value),
      tone: tintTone(color, 0.2 + 0.65 * ratio),
      soft: true,
      ring: config.gauge ? ratio : undefined,
      ringColor: rgbCss(color),
      state: this.format(value),
      watched: model.watched,
    };
  }

  private rows(): BadgeRow[] {
    const model = this.model;
    const config = this._config;
    if (!model || !config) return [];
    return [...model.items]
      .sort((a, b) => (b.value ?? -1) - (a.value ?? -1))
      .map((item) => {
        if (item.value === undefined) {
          return {
            entityId: item.entityId,
            icon: 'mdi:brightness-5',
            name: item.name,
            value: localize(this.hass, 'unavailable'),
            dim: true,
          };
        }
        const ratio = luxRatio(item.value, config.max);
        const color = luxColor(ratio);
        return {
          entityId: item.entityId,
          icon: luxIcon(item.value),
          name: item.name,
          value: this.format(item.value),
          tone: tintTone(color, 0.2 + 0.65 * ratio),
          bar: ratio,
          barColor: color,
        };
      });
  }

  protected renderDetails() {
    const model = this.model;
    const config = this._config;
    let summary: string | undefined;
    if (model?.value !== undefined && config && model.items.length > 1) {
      const label = localize(this.hass, `agg_${config.aggregate}` as StringKey);
      summary = [
        `${label} ${this.format(model.value)}`,
        config.aggregate !== 'min' && model.min !== undefined
          ? `${localize(this.hass, 'agg_min')} ${formatNumber(this.hass, model.min)}`
          : '',
        config.aggregate !== 'max' && model.max !== undefined
          ? `${localize(this.hass, 'agg_max')} ${formatNumber(this.hass, model.max)}`
          : '',
      ]
        .filter(Boolean)
        .join(' · ');
    }
    return html`<vivid-badge-rows
      .heading=${model?.name}
      .summary=${summary}
      .rows=${this.rows()}
      value-width="64px"
    ></vivid-badge-rows>`;
  }
}

export const ILLUMINANCE_EDITOR: BadgeEditorSpec = {
  type: `custom:${ILLUMINANCE_BADGE}`,
  domain: DOMAINS,
  deviceClass: ['illuminance'],
  fields: [
    {
      name: 'aggregate',
      label: 'aggregate',
      choices: { values: AGGREGATES, labelPrefix: 'aggregate_' },
      default: 'mean',
      row: 2,
    },
    {
      name: 'max',
      label: 'lux_max',
      selector: { number: { min: 10, max: 100000, step: 10, mode: 'box' } },
      default: 2000,
      row: 2,
    },
    { name: 'gauge', label: 'gauge', selector: { boolean: {} }, default: true },
  ],
  validate: (config) => void resolveIlluminanceBadge(config),
};

defineElement(ILLUMINANCE_BADGE, VividIlluminanceBadge);

registerBadge({
  type: ILLUMINANCE_BADGE,
  name: 'Vivid illuminance badge',
  description:
    'Illuminance of a room or a group: an icon from the moon to the sun, a color and a gauge that follow the light. Tap for each sensor.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-illuminance-badge`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-illuminance-badge': VividIlluminanceBadge;
  }
}
