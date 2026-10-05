import { html } from 'lit';
import { tintTone } from '../../core/glow';
import type { HomeAssistant } from '../../core/hass-types';
import { fetchStates, onSpans } from '../../core/history';
import { REPOSITORY_URL, defineElement, registerBadge } from '../../core/register';
import { localize, shortDuration } from '../../i18n';
import { BLUE } from '../base/palette';
import { VividBadge, type BadgeView } from '../base/vivid-badge';
import type { BadgeRow } from '../base/vivid-badge-rows';
import { badgeEditor, type BadgeEditorSpec } from '../base/vivid-badge-editor';
import '../base/vivid-badge-rows';
import {
  PRESENCE_BADGE,
  DOMAINS,
  DEVICE_CLASSES,
  TIMELINE_HOURS,
  PRESENT_LEVEL,
  PRESENT_PULSE,
  type ResolvedPresenceBadge,
  resolvePresenceBadge,
  type PresenceModel,
  buildPresenceModel,
} from './model';

/**
 * Presence: one room (present for 12 min, or seen 2 min ago) or a group of
 * rooms (rooms occupied out of the total). A ring pulses while someone is
 * there; the details draw each room's last hours.
 */
export class VividPresenceBadge extends VividBadge<ResolvedPresenceBadge> {
  private model?: PresenceModel;
  private spans: Record<string, [number, number][]> = {};

  static getConfigElement(): HTMLElement {
    return badgeEditor(PRESENCE_EDITOR);
  }

  static getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    const sensor = Object.values(hass?.states ?? {}).find(
      (state) =>
        state.entity_id.startsWith('binary_sensor.') &&
        DEVICE_CLASSES.includes(String(state.attributes.device_class)),
    );
    return { entity: sensor?.entity_id ?? 'binary_sensor.presence' };
  }

  protected resolveConfig(raw: unknown): ResolvedPresenceBadge {
    return resolvePresenceBadge(raw);
  }

  protected buildView(hass: HomeAssistant, config: ResolvedPresenceBadge): BadgeView {
    const model = buildPresenceModel(hass, config);
    this.model = model;
    const present = model.present > 0;
    let text: string | undefined;
    if (model.isGroup) {
      if (config.showCount && (present || config.showZero)) {
        text = `${model.present}/${model.total}`;
      }
    } else if (config.showDuration && model.total > 0) {
      text = shortDuration(hass, model.since);
    }
    const [onIcon, offIcon] = model.isGroup
      ? ['mdi:home-account', 'mdi:home-outline']
      : ['mdi:motion-sensor', 'mdi:motion-sensor-off'];
    return {
      name: model.name,
      active: present,
      icon: present ? (config.icon ?? onIcon) : (config.iconOff ?? offIcon),
      text,
      textMuted: !present,
      tone: tintTone(BLUE, PRESENT_LEVEL),
      soft: true,
      pulse: PRESENT_PULSE,
      state: model.isGroup
        ? localize(hass, 'occupied_count', { on: model.present, total: model.total })
        : present
          ? localize(hass, 'present')
          : localize(hass, 'seen_ago', { d: shortDuration(hass, model.since) }),
      watched: model.watched,
      ticking: !model.isGroup && config.showDuration,
      unavailable: model.total === 0,
    };
  }

  protected override detailsOpened(): void {
    const hass = this.hass;
    const model = this.model;
    if (!hass || !model) return;
    const end = Date.now();
    const start = end - TIMELINE_HOURS * 3_600_000;
    const ids = model.items.map((item) => item.entityId);
    fetchStates(hass, ids, start, end)
      .then((changes) => {
        const spans: Record<string, [number, number][]> = {};
        for (const id of ids) spans[id] = onSpans(changes[id] ?? [], start, end);
        this.spans = spans;
        this.refreshDetails();
      })
      .catch(() => {
        // Without history the rows keep their durations only.
      });
  }

  private rows(): BadgeRow[] {
    const model = this.model;
    if (!model) return [];
    const hass = this.hass;
    return [...model.items]
      .sort((a, b) => Number(b.present) - Number(a.present) || a.since - b.since)
      .map((item) => ({
        entityId: item.entityId,
        icon: item.present ? 'mdi:motion-sensor' : 'mdi:motion-sensor-off',
        name: item.name,
        value: !item.available
          ? localize(hass, 'unavailable')
          : item.present
            ? localize(hass, 'present_for', { d: shortDuration(hass, item.since) })
            : localize(hass, 'clear_for', { d: shortDuration(hass, item.since) }),
        tone: item.present ? tintTone(BLUE, PRESENT_LEVEL) : undefined,
        dim: !item.present,
        spans: this.spans[item.entityId] ?? [],
        spanColor: BLUE,
      }));
  }

  protected renderDetails() {
    const model = this.model;
    return html`<vivid-badge-rows
      .heading=${model?.name}
      .summary=${
        model?.isGroup
          ? localize(this.hass, 'occupied_count', { on: model.present, total: model.total })
          : undefined
      }
      .rows=${this.rows()}
      value-width="96px"
      .timelineLabels=${[
        localize(this.hass, 'hours_ago', { h: TIMELINE_HOURS }),
        localize(this.hass, 'now'),
      ]}
    ></vivid-badge-rows>`;
  }
}

export const PRESENCE_EDITOR: BadgeEditorSpec = {
  type: `custom:${PRESENCE_BADGE}`,
  domain: DOMAINS,
  deviceClass: DEVICE_CLASSES,
  iconOff: true,
  fields: [
    { name: 'show_duration', label: 'show_duration', selector: { boolean: {} }, default: true },
    { name: 'show_count', label: 'show_open_count', selector: { boolean: {} }, default: true },
    { name: 'show_zero', label: 'show_zero_clear', selector: { boolean: {} }, default: false },
  ],
  validate: (config) => void resolvePresenceBadge(config),
};

defineElement(PRESENCE_BADGE, VividPresenceBadge);

registerBadge({
  type: PRESENCE_BADGE,
  name: 'Vivid presence badge',
  description:
    'Presence in a room (for how long, or seen how long ago) or rooms occupied out of the total, with the last hours of each room. Tap for the details.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-presence-badge`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-presence-badge': VividPresenceBadge;
  }
}
