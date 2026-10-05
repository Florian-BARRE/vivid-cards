import { html } from 'lit';
import { tintTone } from '../../core/glow';
import type { HomeAssistant } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerBadge } from '../../core/register';
import { localize, shortDuration } from '../../i18n';
import { SEVERITY } from '../base/palette';
import { VividBadge, type BadgeView } from '../base/vivid-badge';
import type { BadgeRow } from '../base/vivid-badge-rows';
import { badgeEditor, type BadgeEditorSpec } from '../base/vivid-badge-editor';
import '../base/vivid-badge-rows';
import {
  OPENING_BADGE,
  DOMAINS,
  DEVICE_CLASSES,
  CLOSED_ROWS,
  type ResolvedOpeningBadge,
  resolveOpeningBadge,
  ICONS,
  type OpeningModel,
  buildOpeningModel,
} from './model';

/**
 * Doors and windows: how many are open out of the total. The color follows
 * how long the oldest has been open (blue, amber after `warn_after`, red and
 * pulsing after `alert_after`); the details list them, open ones first.
 */
export class VividOpeningBadge extends VividBadge<ResolvedOpeningBadge> {
  private model?: OpeningModel;

  static getConfigElement(): HTMLElement {
    return badgeEditor(OPENING_EDITOR);
  }

  static getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    const states = Object.values(hass?.states ?? {});
    const group = states.find(
      (state) =>
        state.entity_id.startsWith('binary_sensor.') &&
        Array.isArray(state.attributes.entity_id) &&
        DEVICE_CLASSES.includes(String(state.attributes.device_class)),
    );
    const single = states.find(
      (state) =>
        state.entity_id.startsWith('binary_sensor.') &&
        DEVICE_CLASSES.includes(String(state.attributes.device_class)),
    );
    return { entity: (group ?? single)?.entity_id ?? 'binary_sensor.windows' };
  }

  protected resolveConfig(raw: unknown): ResolvedOpeningBadge {
    return resolveOpeningBadge(raw);
  }

  protected buildView(hass: HomeAssistant, config: ResolvedOpeningBadge): BadgeView {
    const model = buildOpeningModel(hass, config);
    this.model = model;
    const [openIcon, closedIcon] = ICONS[model.kind];
    const isOpen = model.open > 0;
    const severity = SEVERITY[model.severity];
    let text: string | undefined;
    if (model.isGroup) {
      if (config.showCount && (isOpen || config.showZero)) text = `${model.open}/${model.total}`;
    } else if (isOpen && config.showCount) {
      text = shortDuration(hass, model.longest);
    }
    return {
      name: model.name,
      active: isOpen,
      icon: isOpen ? (config.icon ?? openIcon) : (config.iconOff ?? closedIcon),
      text,
      textMuted: !isOpen,
      tone: tintTone(severity.color, severity.level),
      soft: true,
      pulse: severity.pulse,
      state: isOpen
        ? localize(hass, 'open_count', { open: model.open, total: model.total })
        : localize(hass, 'all_closed'),
      watched: model.watched,
      ticking: isOpen,
      unavailable: model.total === 0,
    };
  }

  private rows(): BadgeRow[] {
    const model = this.model;
    if (!model) return [];
    const hass = this.hass;
    const open = model.items.filter((item) => item.open).sort((a, b) => b.since - a.since);
    const rest = model.items.filter((item) => !item.open).sort((a, b) => a.since - b.since);
    const rows: BadgeRow[] = open.map((item) => {
      const severity = SEVERITY[item.severity];
      return {
        entityId: item.entityId,
        icon: ICONS[item.kind][0],
        name: item.name,
        value: localize(hass, 'open_for', { d: shortDuration(hass, item.since) }),
        tone: tintTone(severity.color, severity.level),
      };
    });
    const shown = rest.length > CLOSED_ROWS ? rest.slice(0, CLOSED_ROWS - 1) : rest;
    for (const item of shown) {
      rows.push({
        entityId: item.entityId,
        icon: ICONS[item.kind][1],
        name: item.name,
        value: item.available
          ? localize(hass, 'closed_for', { d: shortDuration(hass, item.since) })
          : localize(hass, 'unavailable'),
        dim: true,
      });
    }
    if (shown.length < rest.length) {
      rows.push({
        icon: ICONS[model.kind][1],
        name: localize(hass, 'others', { n: rest.length - shown.length }),
        value: localize(hass, 'closed_plural'),
        dim: true,
      });
    }
    return rows;
  }

  protected renderDetails() {
    const model = this.model;
    return html`<vivid-badge-rows
      .heading=${model?.name}
      .summary=${
        model && model.open > 0
          ? localize(this.hass, 'open_count', { open: model.open, total: model.total })
          : localize(this.hass, 'all_closed')
      }
      .rows=${this.rows()}
    ></vivid-badge-rows>`;
  }
}

export const OPENING_EDITOR: BadgeEditorSpec = {
  type: `custom:${OPENING_BADGE}`,
  domain: DOMAINS,
  deviceClass: DEVICE_CLASSES,
  iconOff: true,
  fields: [
    {
      name: 'warn_after',
      label: 'warn_after',
      selector: { number: { min: 0, max: 600, step: 5, mode: 'box' } },
      default: 15,
      helper: 'open_helper',
      row: 2,
    },
    {
      name: 'alert_after',
      label: 'alert_after',
      selector: { number: { min: 0, max: 600, step: 5, mode: 'box' } },
      default: 45,
      row: 2,
    },
    { name: 'show_count', label: 'show_open_count', selector: { boolean: {} }, default: true },
    { name: 'show_zero', label: 'show_zero_closed', selector: { boolean: {} }, default: false },
  ],
  validate: (config) => void resolveOpeningBadge(config),
};

defineElement(OPENING_BADGE, VividOpeningBadge);

registerBadge({
  type: OPENING_BADGE,
  name: 'Vivid opening badge',
  description:
    'Doors and windows: how many are open, in a color that warms up the longer they stay open. Tap for the list.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-opening-badge`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-opening-badge': VividOpeningBadge;
  }
}
