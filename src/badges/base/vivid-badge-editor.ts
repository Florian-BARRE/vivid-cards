import { LitElement, css, html, nothing } from 'lit';
import { SIMPLE_ACTIONS, type ActionName } from '../../core/action-handler';
import { fireEvent } from '../../core/actions';
import { GLOW_SLIDER, glowPercent } from '../../core/glow';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { tokens } from '../../components/shared-styles';
import { BADGE_LOOKS } from './config';

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
  /** The badge finds its entities alone without one (batteries). */
  entityOptional?: boolean;
  /** Offer an icon for the resting state. */
  iconOff?: boolean;
  fields: EditorField[];
  /** Throws when the config is invalid (the message is shown under the form). */
  validate(config: Record<string, unknown>): void;
}

const DEFAULT = 'default';
const CUSTOM = 'custom';

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

  /** Common fields first, the badge's own after, gestures last. */
  private fields(spec: BadgeEditorSpec, tap: string, hold: string): EditorField[] {
    const entity: Selector = {
      entity: {
        domain: [...spec.domain],
        ...(spec.deviceClass ? { device_class: [...spec.deviceClass] } : {}),
      },
    };
    return [
      {
        name: 'entity',
        label: spec.entityOptional ? 'badge_group_auto' : 'badge_group',
        selector: entity,
      },
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
        required: field.name === 'entity' && !this.spec?.entityOptional,
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
    for (const field of fields) {
      const raw = value[field.name];
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
    const fields = this.fields(spec, tap, hold);
    const data: FormData = {};
    for (const field of fields) data[field.name] = config[field.name] ?? field.default;
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
      ${error ? html`<div class="error">${error}</div>` : nothing}`;
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
