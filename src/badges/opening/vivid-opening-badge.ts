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
  OPENING_TAGS,
  KIND_DEVICE_CLASSES,
  DOMAINS,
  CLOSED_ROWS,
  type OpeningKind,
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
  /** Windows, doors, or both (the former opening badge). */
  protected kind: OpeningKind = 'any';
  private model?: OpeningModel;

  static getConfigElement(): HTMLElement {
    return badgeEditor(openingEditor('any'));
  }

  static getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    return openingStub(hass, 'any');
  }

  protected resolveConfig(raw: unknown): ResolvedOpeningBadge {
    return resolveOpeningBadge(raw, this.kind);
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

/** First group (else first sensor) of the badge's device classes. */
function openingStub(hass: HomeAssistant | undefined, kind: OpeningKind): Record<string, unknown> {
  const classes = KIND_DEVICE_CLASSES[kind];
  const states = Object.values(hass?.states ?? {}).filter(
    (state) =>
      state.entity_id.startsWith('binary_sensor.') &&
      classes.includes(String(state.attributes.device_class)),
  );
  const group = states.find((state) => Array.isArray(state.attributes.entity_id));
  const fallback = kind === 'door' ? 'binary_sensor.doors' : 'binary_sensor.windows';
  return { entity: (group ?? states[0])?.entity_id ?? fallback };
}

/** Windows only: window icons, the windows' device class in the editor. */
export class VividWindowBadge extends VividOpeningBadge {
  protected override kind: OpeningKind = 'window';

  static override getConfigElement(): HTMLElement {
    return badgeEditor(openingEditor('window'));
  }

  static override getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    return openingStub(hass, 'window');
  }
}

/** Doors only (garage doors included): door icons, opening and closing. */
export class VividDoorBadge extends VividOpeningBadge {
  protected override kind: OpeningKind = 'door';

  static override getConfigElement(): HTMLElement {
    return badgeEditor(openingEditor('door'));
  }

  static override getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    return openingStub(hass, 'door');
  }
}

export const openingEditor = (kind: OpeningKind): BadgeEditorSpec => ({
  type: `custom:${OPENING_TAGS[kind]}`,
  domain: DOMAINS,
  deviceClass: KIND_DEVICE_CLASSES[kind],
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
  validate: (config) => void resolveOpeningBadge(config, kind),
});

// The opening badge (doors and windows mixed) still works but is no longer offered.
defineElement(OPENING_BADGE, VividOpeningBadge);
defineElement(OPENING_TAGS.window, VividWindowBadge);
defineElement(OPENING_TAGS.door, VividDoorBadge);

registerBadge({
  type: OPENING_TAGS.window,
  name: 'Vivid window badge',
  description:
    'Windows: how many are open, in a color that warms up the longer they stay open. Tap for each window.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-window-badge`,
});
registerBadge({
  type: OPENING_TAGS.door,
  name: 'Vivid door badge',
  description:
    'Doors and garage doors: how many are open, in a color that warms up the longer they stay open. Tap for each door.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-door-badge`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-opening-badge': VividOpeningBadge;
    'vivid-window-badge': VividWindowBadge;
    'vivid-door-badge': VividDoorBadge;
  }
}
