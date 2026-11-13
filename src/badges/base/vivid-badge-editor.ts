import { LitElement, css, html, nothing } from 'lit';
import '../../components/editor/vivid-slot-editor';
import { applyMembers, membersSlot, membersValue } from '../../components/editor/members';
import type { SlotValue } from '../../core/slots';
import { slotText } from '../../i18n/slots';
import { SIMPLE_ACTIONS, type ActionName } from '../../core/action-handler';
import { fireEvent } from '../../core/actions';
import { GLOW_SLIDER, glowPercent } from '../../core/glow';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { withPilotEntity, type PilotCategory, type PilotKind } from '../../core/pilot';
import { pilotNodeOptions } from '../../i18n/pilot';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { tokens } from '../../components/shared-styles';
import { BADGE_LOOKS, ICON_COLORS } from './config';

type FormData = Record<string, unknown>;
type Selector = Record<string, unknown>;

/** A badge-specific field of the editor. */
export interface EditorField {
  name: string;
  label: EditorStringKey;
  /** `ha-form` selector, or choices whose labels are `${labelPrefix}${value}`. */
  selector?: Selector;
  choices?: { values: readonly string[]; labelPrefix: string };
  /** Value written when the field is left at it: the option is then removed. */
  default?: unknown;
  helper?: EditorStringKey;
  /** Fields sharing a row number sit side by side. */
  row?: number;
}

export interface BadgeEditorSpec {
  /** `custom:<tag>`. */
  type: string;
  /** Entity selector filter. */
  domain: readonly string[];
  deviceClass?: readonly string[];
  /** What the badge reads from a Vivid Pilot node. */
  pilotKind: PilotKind;
  /** Node categories offered (none: the room or home node itself). */
  pilotCategories?: readonly (PilotCategory | undefined)[];
  /** Offer an icon for the resting state. */
  iconOff?: boolean;
  fields: EditorField[];
  /** Throws when the config is invalid (the message is shown under the form). */
  validate(config: Record<string, unknown>): void;
}

const DEFAULT = 'default';
const CUSTOM = 'custom';
const SOURCES = ['pilot', 'manual'] as const;
type Source = (typeof SOURCES)[number];

/** Pilot mode unless an entity or a list is written by hand. */
function sourceOf(config: Record<string, unknown>): Source {
  return config.entity || (Array.isArray(config.entities) && config.entities.length)
    ? 'manual'
    : 'pilot';
}

const ACTION_LABELS: Record<string, EditorStringKey> = {
  toggle: 'action_toggle',
  details: 'action_details',
  'more-info': 'action_more_info',
  none: 'action_none',
};

/** Simple action name of a config value, `custom` for anything richer. */
function actionValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return DEFAULT;
  if (typeof value === 'string') return value === 'details' ? DEFAULT : value;
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    const action = (value as { action?: string }).action;
    if (keys.length === 1 && action && SIMPLE_ACTIONS.includes(action as ActionName)) {
      return action === 'details' ? DEFAULT : action;
    }
  }
  return CUSTOM;
}

/**
 * Visual editor shared by the status badges: the common fields (entity,
 * name, icons, style, halo, gestures) around the badge's own fields.
 */
export class VividBadgeEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    spec: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare spec?: BadgeEditorSpec;
  declare _config?: Record<string, unknown>;

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .members {
        margin-top: 12px;
      }
      .error {
        margin-top: 8px;
        color: var(--error-color, #db4437);
        font-size: 13px;
      }
    `,
  ];

  setConfig(config: Record<string, unknown>): void {
    this._config = config;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void ensureHaForm().then(() => this.requestUpdate());
  }

  private t(key: EditorStringKey): string {
    return editorText(this.hass, key);
  }

  private choice(values: readonly string[], prefix: string): Selector {
    return {
      select: {
        mode: 'dropdown',
        options: values.map((value) => ({
          value,
          label: this.t(`${prefix}${value}` as EditorStringKey),
        })),
      },
    };
  }

  private actions(current: string): Selector {
    const options = [
      { value: DEFAULT, label: this.t('badge_action_details_default') },
      ...SIMPLE_ACTIONS.filter((action) => action !== 'details' && action !== 'toggle').map(
        (action) => ({ value: action, label: this.t(ACTION_LABELS[action] as EditorStringKey) }),
      ),
    ];
    if (current === CUSTOM) options.push({ value: CUSTOM, label: this.t('action_custom') });
    return { select: { mode: 'dropdown', options } };
  }

  /** The source (Vivid Pilot or manual) and its target. */
  private targetFields(spec: BadgeEditorSpec, source: Source): EditorField[] {
    const target: EditorField =
      source === 'pilot'
        ? {
            name: 'pilot',
            label: 'badge_pilot',
            helper: 'badge_pilot_helper',
            selector: {
              select: {
                mode: 'dropdown',
                options: pilotNodeOptions(this.hass, spec.pilotKind, spec.pilotCategories),
              },
            },
          }
        : {
            name: 'entity',
            label: 'badge_group',
            selector: {
              entity: {
                domain: [...spec.domain],
                ...(spec.deviceClass ? { device_class: [...spec.deviceClass] } : {}),
              },
            },
          };
    return [
      {
        name: 'source',
        label: 'badge_source',
        choices: { values: SOURCES, labelPrefix: 'badge_source_' },
      },
      target,
    ];
  }

  /** Common fields first, the badge's own after, gestures last. */
  private fields(spec: BadgeEditorSpec, source: Source, tap: string, hold: string): EditorField[] {
    return [
      ...this.targetFields(spec, source),
      { name: 'name', label: 'badge_details_title', selector: { text: {} } },
      {
        name: 'icon',
        label: spec.iconOff ? 'icon_active' : 'icon',
        selector: { icon: {} },
        row: 1,
      },
      ...(spec.iconOff
        ? [{ name: 'icon_off', label: 'icon_rest', selector: { icon: {} }, row: 1 } as EditorField]
        : []),
      ...spec.fields,
      {
        name: 'look',
        label: 'badge_look',
        choices: { values: BADGE_LOOKS, labelPrefix: 'look_' },
        default: 'disc',
        row: 90,
      },
      {
        name: 'icon_color',
        label: 'icon_color',
        choices: { values: ICON_COLORS, labelPrefix: 'icon_color_' },
        default: 'white',
        row: 90,
      },
      { name: 'glow', label: 'glow', selector: GLOW_SLIDER, default: 100, helper: 'glow_helper' },
      { name: 'tap_action', label: 'tap_action', selector: this.actions(tap), row: 99 },
      { name: 'hold_action', label: 'hold_action', selector: this.actions(hold), row: 99 },
    ];
  }

  private schema(fields: EditorField[]) {
    const schema: Record<string, unknown>[] = [];
    const rows = new Map<number, Record<string, unknown>[]>();
    for (const field of fields) {
      const item = {
        name: field.name,
        required: field.name === 'source',
        selector: field.choices
          ? this.choice(field.choices.values, field.choices.labelPrefix)
          : field.selector,
      };
      if (field.row === undefined) {
        schema.push(item);
        continue;
      }
      let row = rows.get(field.row);
      if (!row) {
        row = [];
        rows.set(field.row, row);
        schema.push({ type: 'grid', name: '', schema: row });
      }
      row.push(item);
    }
    return schema;
  }

  private onChange(fields: EditorField[], value: FormData): void {
    const previous = this._config ?? { type: this.spec?.type };
    const next: Record<string, unknown> = { ...previous };
    const source = value.source as Source | undefined;
    if (source && source !== sourceOf(previous)) {
      // Switching source drops the other one's target and the member tweaks.
      for (const key of ['pilot', 'entity', 'entities', 'exclude', 'add']) delete next[key];
      this._config = next;
      fireEvent(this, 'config-changed', { config: next });
      return;
    }
    for (const field of fields) {
      const raw = value[field.name];
      if (field.name === 'source') continue;
      if (field.name === 'tap_action' || field.name === 'hold_action') {
        // A YAML-only action stays as written until another choice is picked.
        if (raw === CUSTOM) continue;
        if (raw === DEFAULT || raw === undefined) delete next[field.name];
        else next[field.name] = { action: raw };
        continue;
      }
      // A named halo level written in YAML stays until the slider moves.
      if (field.name === 'glow' && raw === glowPercent(previous.glow ?? 100)) continue;
      if (raw === undefined || raw === '' || raw === null || raw === field.default) {
        delete next[field.name];
      } else next[field.name] = raw;
    }
    this._config = next;
    fireEvent(this, 'config-changed', { config: next });
  }

  protected override render() {
    const spec = this.spec;
    const config = this._config;
    if (!this.hass || !spec || !config) return nothing;
    const tap = actionValue(config.tap_action);
    const hold = actionValue(config.hold_action);
    const source = sourceOf(config);
    const fields = this.fields(spec, source, tap, hold);
    const data: FormData = {};
    for (const field of fields) data[field.name] = config[field.name] ?? field.default;
    data.source = source;
    data.glow = glowPercent(config.glow ?? 100) ?? 100;
    data.tap_action = tap;
    data.hold_action = hold;
    let error: string | undefined;
    try {
      spec.validate({ type: spec.type, ...config });
    } catch (caught) {
      error = (caught as Error).message;
    }
    const helpers = new Map(fields.map((field) => [field.name, field.helper]));
    const labels = new Map(fields.map((field) => [field.name, field.label]));
    return html`<ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${this.schema(fields)}
        .computeLabel=${(field: { name: string }) => {
          const key = labels.get(field.name);
          return key ? this.t(key) : undefined;
        }}
        .computeHelper=${(field: { name: string }) => {
          const key = helpers.get(field.name);
          return key ? this.t(key) : undefined;
        }}
        @value-changed=${(event: CustomEvent<{ value: FormData }>) => {
          event.stopPropagation();
          this.onChange(fields, event.detail.value);
        }}
      ></ha-form>
      ${this.renderMembers(config, spec)}
      ${error ? html`<div class="error">${error}</div>` : nothing}`;
  }

  /** On a group (or a Vivid Pilot node): its members, any of them left out, others added. */
  private renderMembers(config: Record<string, unknown>, spec: BadgeEditorSpec) {
    const hass = this.hass;
    const target = hass ? withPilotEntity(hass, config, spec.pilotKind) : config;
    const entity = typeof target.entity === 'string' ? target.entity : undefined;
    const members = entity ? hass?.states[entity]?.attributes.entity_id : undefined;
    if (!hass || !Array.isArray(members)) return nothing;
    return html`<vivid-slot-editor
      class="members"
      .hass=${hass}
      .label=${slotText(hass, 'group_members')}
      icon="mdi:format-list-group"
      .multiple=${true}
      .modes=${['auto'] as const}
      .pilot=${sourceOf(config) === 'pilot'}
      .value=${membersValue(config)}
      .resolved=${membersSlot(hass, { ...config, entity })}
      @slot-changed=${(event: CustomEvent<{ value: SlotValue }>) => {
        const next = applyMembers({ ...config }, event.detail.value);
        this._config = next;
        fireEvent(this, 'config-changed', { config: next });
      }}
    ></vivid-slot-editor>`;
  }
}

defineElement('vivid-badge-editor', VividBadgeEditor);

/** Editor element for a badge class's `getConfigElement`. */
export function badgeEditor(spec: BadgeEditorSpec): HTMLElement {
  const editor = document.createElement('vivid-badge-editor');
  editor.spec = spec;
  return editor;
}

declare global {
  interface HTMLElementTagNameMap {
    'vivid-badge-editor': VividBadgeEditor;
  }
}
