import { LitElement, css, html, nothing } from 'lit';
import { SIMPLE_ACTIONS, type ActionName } from '../../core/action-handler';
import { fireEvent } from '../../core/actions';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { tokens } from '../../components/shared-styles';
import {
  BADGE_LOOKS,
  DETAILS_LAYOUTS,
  GLOW_LEVELS,
  resolveLightBadgeConfig,
  type LightBadgeConfig,
} from './config';
import { buildLightBadgeModel, type LightBadgeModel } from './model';

type FormData = Record<string, unknown>;

const DEFAULT = 'default';
const CUSTOM = 'custom';

const LABELS: Record<string, EditorStringKey> = {
  entity: 'entity',
  name: 'badge_details_title',
  icon: 'icon_on',
  icon_off: 'icon_off',
  show_count: 'show_count',
  look: 'badge_look',
  layout: 'badge_layout',
  glow: 'badge_glow',
  transition: 'transition',
  tap_action: 'tap_action',
  hold_action: 'hold_action',
};

const ACTION_LABELS: Record<string, EditorStringKey> = {
  toggle: 'action_toggle',
  details: 'action_details',
  'more-info': 'action_more_info',
  none: 'action_none',
};

/** Simple action name of a config value, `custom` for anything richer. */
function actionValue(value: unknown, defaultAction: ActionName): string {
  if (value === undefined || value === null || value === '') return DEFAULT;
  if (typeof value === 'string') return value === defaultAction ? DEFAULT : value;
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    const action = (value as { action?: string }).action;
    if (keys.length === 1 && action && SIMPLE_ACTIONS.includes(action as ActionName)) {
      return action === defaultAction ? DEFAULT : action;
    }
  }
  return CUSTOM;
}

/** Visual editor of `vivid-light-badge`: one short form. */
export class VividLightBadgeEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: LightBadgeConfig;

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

  setConfig(config: LightBadgeConfig): void {
    this._config = config;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void ensureHaForm().then(() => this.requestUpdate());
  }

  private t(key: EditorStringKey, values?: Record<string, string | number>): string {
    return editorText(this.hass, key, values);
  }

  private readonly computeLabel = (schema: { name: string }): string | undefined => {
    const key = LABELS[schema.name];
    return key ? this.t(key) : undefined;
  };

  /**
   * What an empty icon field falls back to: the automatic icon, and the off
   * variant of the icon in use (or that icon crossed out).
   */
  private autoIcons(): { icon?: string; off?: LightBadgeModel; error?: string } {
    const config = this._config;
    const hass = this.hass;
    if (!hass || !config?.entity || !hass.states[config.entity]) return {};
    try {
      resolveLightBadgeConfig(config);
      const build = (extra: Partial<LightBadgeConfig>) =>
        buildLightBadgeModel(hass, resolveLightBadgeConfig({ ...config, ...extra }));
      return {
        icon: build({ icon: undefined, icon_off: undefined }).icon,
        off: build({ icon_off: undefined }),
      };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  private choice(values: readonly string[], prefix: string) {
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

  /** The default action is only offered once, as "Default (…)". */
  private actions(current: string, fallback: EditorStringKey, defaultAction: ActionName) {
    const options = [
      { value: DEFAULT, label: this.t(fallback) },
      ...SIMPLE_ACTIONS.filter((action) => action !== defaultAction).map((action) => ({
        value: action,
        label: this.t(ACTION_LABELS[action] as EditorStringKey),
      })),
    ];
    if (current === CUSTOM) options.push({ value: CUSTOM, label: this.t('action_custom') });
    return { select: { mode: 'dropdown', options } };
  }

  private onChange(value: FormData): void {
    const previous = this._config ?? ({ type: 'custom:vivid-light-badge' } as LightBadgeConfig);
    const next: Record<string, unknown> = { ...previous };
    const set = (key: string, raw: unknown, fallback?: unknown) => {
      if (raw === undefined || raw === '' || raw === null || raw === fallback) delete next[key];
      else next[key] = raw;
    };
    set('entity', value.entity);
    set('name', value.name);
    set('icon', value.icon);
    set('icon_off', value.icon_off);
    set('show_count', value.show_count, true);
    set('glow', value.glow, 'normal');
    set('look', value.look, 'disc');
    set('layout', value.layout, 'list');
    set('transition', value.transition);
    for (const key of ['tap_action', 'hold_action']) {
      const choice = value[key];
      // A YAML-only action stays as written until another choice is picked.
      if (choice === CUSTOM) continue;
      set(key, choice === DEFAULT ? undefined : { action: choice });
    }
    this._config = next as LightBadgeConfig;
    fireEvent(this, 'config-changed', { config: this._config });
  }

  protected override render() {
    if (!this.hass || !this._config) return nothing;
    const config = this._config;
    const auto = this.autoIcons();
    const error = auto.error;
    const tap = actionValue(config.tap_action, 'toggle');
    const hold = actionValue(config.hold_action, 'details');
    const autoIcon = auto.icon ?? 'mdi:lightbulb-group';
    const autoOff = auto.off?.iconOff ?? autoIcon;
    const offHelper = auto.off?.strike
      ? this.t('icon_auto_struck', { icon: autoOff })
      : this.t('icon_auto', { icon: autoOff });
    const schema = [
      { name: 'entity', required: true, selector: { entity: { domain: 'light' } } },
      { name: 'name', selector: { text: {} } },
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'icon', selector: { icon: { placeholder: autoIcon } } },
          { name: 'icon_off', selector: { icon: { placeholder: autoOff } } },
        ],
      },
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'tap_action', selector: this.actions(tap, 'badge_tap_default', 'toggle') },
          { name: 'hold_action', selector: this.actions(hold, 'badge_hold_default', 'details') },
        ],
      },
      {
        type: 'grid',
        name: '',
        schema: [
          {
            name: 'glow',
            selector: {
              select: {
                mode: 'dropdown',
                options: GLOW_LEVELS.map((level) => ({
                  value: level,
                  label: this.t(`glow_${level}` as EditorStringKey),
                })),
              },
            },
          },
          {
            name: 'transition',
            selector: {
              number: { min: 0, max: 30, step: 0.1, mode: 'box', unit_of_measurement: 's' },
            },
          },
        ],
      },
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'look', selector: this.choice(BADGE_LOOKS, 'look_') },
          { name: 'layout', selector: this.choice(DETAILS_LAYOUTS, 'layout_') },
        ],
      },
      { name: 'show_count', selector: { boolean: {} } },
    ];
    const data: FormData = {
      entity: config.entity,
      name: config.name,
      icon: config.icon,
      icon_off: config.icon_off,
      show_count: config.show_count ?? true,
      glow: config.glow ?? 'normal',
      look: config.look ?? 'disc',
      layout: config.layout ?? 'list',
      transition: config.transition,
      tap_action: tap,
      hold_action: hold,
    };
    return html`<ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${schema}
        .computeLabel=${this.computeLabel}
        .computeHelper=${(field: { name: string }) =>
          field.name === 'icon'
            ? this.t('icon_auto', { icon: autoIcon })
            : field.name === 'icon_off'
              ? offHelper
              : field.name === 'transition'
                ? this.t('transition_helper')
                : undefined}
        @value-changed=${(event: CustomEvent<{ value: FormData }>) => {
          event.stopPropagation();
          this.onChange(event.detail.value);
        }}
      ></ha-form>
      ${error ? html`<div class="error">${error}</div>` : nothing}`;
  }
}

defineElement('vivid-light-badge-editor', VividLightBadgeEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-light-badge-editor': VividLightBadgeEditor;
  }
}
