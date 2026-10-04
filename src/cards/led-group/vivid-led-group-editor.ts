import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { SIMPLE_ACTIONS, type ActionName } from '../../core/action-handler';
import { fireEvent } from '../../core/actions';
import { kelvinToRgb, parseColor, rgbCss, rgbHex } from '../../core/color';
import { badgeModel } from '../../core/badges';
import { parseNumericState } from '../../core/entities';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { supportsHue, supportsTemperature } from '../../core/light';
import { defineElement } from '../../core/register';
import { formatNumber } from '../../i18n';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import type { PowerMode } from '../../integrations/power';
import { tokens } from '../../components/shared-styles';
import { formatWatts } from '../../components/vivid-light-header';
import {
  COLOR_BAR_MODES,
  GLOW_LEVELS,
  MAX_FAVORITES,
  MEMBER_ORDERS,
  POWER_MODES,
  STATE_TEXTS,
  migrateConfig,
  resolveConfig,
  type LedGroupCardConfig,
  type ResolvedLedGroupConfig,
} from './config';
import {
  addBadge,
  addFavorite,
  memberOverride,
  removeBadge,
  removeFavorite,
  setOption,
  setRoot,
  toggleDefaultOn,
  updateMember,
} from './editor-model';
import { buildLedGroupModel, type LedGroupModel, type StripModel } from './model';

type FormSchema = Record<string, unknown>;
type FormData = Record<string, unknown>;

interface Resolution {
  resolved: ResolvedLedGroupConfig;
  model: LedGroupModel;
}

const LABELS: Record<string, EditorStringKey> = {
  entity: 'entity',
  name: 'name',
  icon: 'icon',
  sensor_pattern: 'sensor_pattern',
  voltage: 'voltage',
  power_sensor: 'power_sensor',
  member_name: 'member_name',
  color_bar: 'color_bar',
  state: 'state_text',
  effects: 'effects',
  tap_action: 'tap_action',
  hold_action: 'hold_action',
  double_tap_action: 'double_tap_action',
  hash: 'details_hash',
  sort: 'details_sort',
  details_color_bar: 'color_bar',
  summary: 'details_summary',
  details_effects: 'details_effects',
  idle: 'idle',
  max: 'max',
  price: 'price',
  details_history: 'details_history',
  glow: 'glow',
  header: 'show_header',
  compact: 'compact',
  gradient: 'gradient',
  animate_effects: 'animate_effects',
  brightness_min: 'brightness_min',
  brightness_step: 'brightness_step',
  transition: 'transition',
  badge_add: 'badge_add',
  details_favorites: 'details_favorites',
  wled_controls: 'details_wled_controls',
  health: 'details_health',
  member_icon: 'member_icon',
};

const MODE_LABELS: Record<PowerMode, EditorStringKey> = {
  auto: 'mode_auto',
  sensor: 'mode_sensor',
  voltage: 'mode_voltage',
  none: 'mode_none',
};

const ACTION_LABELS: Partial<Record<ActionName, EditorStringKey>> = {
  toggle: 'action_toggle',
  details: 'action_details',
  'more-info': 'action_more_info',
  none: 'action_none',
};

const CUSTOM = 'custom';
const DEFAULT = 'default';

/** Simple action name of a config value, `custom` for anything richer. */
function actionValue(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value);
    const action = (value as { action?: string }).action;
    if (keys.length === 1 && action && SIMPLE_ACTIONS.includes(action as ActionName)) return action;
  }
  return CUSTOM;
}

/**
 * Visual editor of `vivid-led-group`: pick the entity first, then everything
 * adapts to what was detected (group or single light, WLED, power sources).
 */
export class VividLedGroupEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _advanced: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: LedGroupCardConfig;
  declare _advanced: boolean;

  constructor() {
    super();
    this._advanced = false;
  }

  setConfig(config: LedGroupCardConfig): void {
    this._config = migrateConfig(config);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void ensureHaForm().then(() => this.requestUpdate());
  }

  private t(key: EditorStringKey, values?: Record<string, string | number>): string {
    return editorText(this.hass, key, values);
  }

  private commit(config: LedGroupCardConfig): void {
    this._config = config;
    fireEvent(this, 'config-changed', { config });
  }

  /** Last valid state, kept while a field holds a value the card rejects. */
  private _lastGood?: Resolution;

  private resolve(): (Resolution & { error?: string }) | undefined {
    if (!this.hass || !this._config?.entity || !this.hass.states[this._config.entity]) {
      this._lastGood = undefined;
      return undefined;
    }
    try {
      const resolved = resolveConfig(this._config);
      this._lastGood = { resolved, model: buildLedGroupModel(this.hass, resolved) };
      return this._lastGood;
    } catch (error) {
      const message = (error as Error).message;
      return this._lastGood ? { ...this._lastGood, error: message } : undefined;
    }
  }

  /* --------------------------------- forms --------------------------------- */

  private readonly computeLabel = (schema: { name: string }): string | undefined => {
    const key = LABELS[schema.name];
    return key ? this.t(key) : undefined;
  };

  private form(
    schema: FormSchema[],
    data: FormData,
    onChange: (value: FormData) => void,
    computeHelper?: (schema: { name: string }) => string | undefined,
  ): TemplateResult {
    return html`<ha-form
      .hass=${this.hass}
      .data=${data}
      .schema=${schema}
      .computeLabel=${this.computeLabel}
      .computeHelper=${computeHelper}
      @value-changed=${(event: CustomEvent<{ value: FormData }>) => {
        event.stopPropagation();
        onChange(event.detail.value);
      }}
    ></ha-form>`;
  }

  private select(options: { value: string; label: string }[]): FormSchema {
    return { select: { mode: 'dropdown', options } };
  }

  /* -------------------------------- sections -------------------------------- */

  private renderBanner(entity: string | undefined, resolution?: Resolution) {
    if (!entity) {
      return html`<div class="banner neutral">${this.t('entity_missing')}</div>`;
    }
    if (!resolution) {
      return html`<div class="banner warn">
        <ha-icon .icon=${'mdi:alert-outline'}></ha-icon>${this.t('entity_not_found', { entity })}
      </div>`;
    }
    const { resolved, model } = resolution;
    const state = this.hass?.states[entity];
    const capability = supportsHue(state)
      ? this.t('capability_hue')
      : supportsTemperature(state)
        ? this.t('capability_temperature')
        : this.t('capability_dimmable');
    const wled = model.detected.filter((m) => m.wled).length;
    const facts = model.isGroup ? [this.t('lights_count', { count: model.detected.length })] : [];
    if (wled > 0)
      facts.push(model.isGroup ? this.t('wled_count', { count: wled }) : this.t('wled'));
    facts.push(capability);

    const powered = model.detected.filter((m) => m.power).length;
    const powerLine =
      resolved.power.enabled && powered > 0
        ? model.isGroup
          ? this.t('power_found', { found: powered, total: model.detected.length })
          : this.t('power_found_single', { origin: this.describePower(model.detected[0]) })
        : undefined;

    return html`<div class="banner ${model.isGroup ? '' : 'neutral'}">
      <ha-icon .icon=${model.isGroup ? 'mdi:check-circle' : 'mdi:lightbulb-outline'}></ha-icon>
      <span>
        <b>${this.t(model.isGroup ? 'group_detected' : 'single_light')}</b> · ${facts.join(' · ')}
        ${powerLine ? html`<br />${powerLine}` : nothing}
      </span>
    </div>`;
  }

  private renderPills(resolved: ResolvedLedGroupConfig, model: LedGroupModel) {
    const config = this._config ?? ({} as LedGroupCardConfig);
    const colorLabel =
      resolved.tile.colorBar === 'auto'
        ? this.t(
            model.tileColorBar === 'hue'
              ? 'color_auto_hue'
              : model.tileColorBar === 'temperature'
                ? 'color_auto_temperature'
                : 'color_auto_none',
          )
        : this.t(
            resolved.tile.colorBar === 'hue'
              ? 'color_hue'
              : resolved.tile.colorBar === 'temperature'
                ? 'color_temperature'
                : 'color_none',
          );
    const pill = (
      on: boolean,
      icon: string,
      label: string,
      onClick: () => void,
      disabled = false,
    ) =>
      html`<button
        type="button"
        class=${classMap({ pill: true, on: on && !disabled, disabled })}
        aria-pressed=${String(on && !disabled)}
        ?disabled=${disabled}
        @click=${onClick}
      >
        <ha-icon .icon=${icon}></ha-icon>${label}
      </button>`;

    return html`<div class="pills">
      ${
        model.hasLiveOverride
          ? pill(
              resolved.ambilight.enabled,
              'mdi:television-ambient-light',
              this.t('toggle_ambilight'),
              () =>
                this.commit(
                  setOption(
                    config,
                    'ambilight',
                    'enabled',
                    toggleDefaultOn(config.ambilight?.enabled),
                  ),
                ),
            )
          : pill(
              false,
              'mdi:television-ambient-light',
              this.t('toggle_ambilight_none'),
              () => {},
              true,
            )
      }
      ${pill(resolved.power.enabled, 'mdi:flash', this.t('toggle_power'), () =>
        this.commit(setOption(config, 'power', 'enabled', toggleDefaultOn(config.power?.enabled))),
      )}
      ${
        model.isGroup
          ? pill(model.detailsEnabled, 'mdi:dock-window', this.t('toggle_details'), () =>
              this.commit(
                setOption(config, 'details', 'enabled', model.detailsEnabled ? false : undefined),
              ),
            )
          : nothing
      }
      ${pill(
        resolved.tile.colorBar !== 'none',
        model.tileColorBar === 'temperature' ? 'mdi:thermometer' : 'mdi:palette',
        `${this.t('toggle_color')} · ${colorLabel}`,
        () =>
          this.commit(
            setOption(
              config,
              'tile',
              'color_bar',
              resolved.tile.colorBar === 'none' ? undefined : 'none',
            ),
          ),
      )}
    </div>`;
  }

  private renderDefaultPower(model: LedGroupModel) {
    const config = this._config ?? ({} as LedGroupCardConfig);
    // The voltage turns WLED's estimated current into watts: useless without WLED.
    const withVoltage =
      model.detected.some((strip) => strip.wled) || config.power?.voltage !== undefined;
    return html`${
        !model.hasPower
          ? html`<div class="banner warn">
              <ha-icon .icon=${'mdi:alert-outline'}></ha-icon>
              <span
                ><b>${this.t('power_none_title')}</b>
                ${this.t(withVoltage ? 'power_none_hint' : 'power_none_hint_plain')}</span
              >
            </div>`
          : nothing
      }
      <div class="label">${this.t('default_power')}</div>
      ${this.form(
        [
          {
            type: 'grid',
            name: '',
            schema: [
              { name: 'sensor_pattern', selector: { text: {} } },
              ...(withVoltage
                ? [
                    {
                      name: 'voltage',
                      selector: {
                        number: {
                          min: 1,
                          max: 48,
                          step: 0.1,
                          mode: 'box',
                          unit_of_measurement: 'V',
                        },
                      },
                    },
                  ]
                : []),
            ],
          },
        ],
        { sensor_pattern: config.power?.sensor_pattern, voltage: config.power?.voltage },
        (value) => {
          let next = setOption(config, 'power', 'sensor_pattern', value.sensor_pattern);
          next = setOption(next, 'power', 'voltage', value.voltage);
          this.commit(next);
        },
        (schema) =>
          schema.name === 'sensor_pattern' ? this.t('sensor_pattern_helper') : undefined,
      )}
      <div class="hint">${this.t(withVoltage ? 'power_order_hint' : 'power_order_hint_plain')}</div>
      ${
        model.detailsEnabled
          ? this.form(
              [
                {
                  type: 'grid',
                  name: '',
                  schema: [
                    {
                      name: 'price',
                      selector: {
                        number: {
                          min: 0,
                          step: 0.0001,
                          mode: 'box',
                          unit_of_measurement: `${this.currency()}/kWh`,
                        },
                      },
                    },
                  ],
                },
              ],
              { price: config.power?.price },
              (value) => this.commit(setOption(config, 'power', 'price', value.price)),
              (schema) => (schema.name === 'price' ? this.t('price_helper') : undefined),
            )
          : nothing
      }`;
  }

  private currency(): string {
    const code = this._config?.power?.currency ?? this.hass?.config?.currency ?? 'EUR';
    try {
      return (
        new Intl.NumberFormat(this.hass?.language ?? 'en', { style: 'currency', currency: code })
          .formatToParts(0)
          .find((part) => part.type === 'currency')?.value ?? code
      );
    } catch {
      return code;
    }
  }

  /* --------------------------------- members -------------------------------- */

  private describePower(strip: StripModel | undefined): string {
    const source = strip?.power;
    if (!source) return this.t('origin_none');
    if (source.kind === 'current') {
      const current = parseNumericState(this.hass?.states[source.entityId]);
      return this.t('origin_estimated', {
        current: current === undefined ? '—' : formatNumber(this.hass, current),
        voltage: formatNumber(this.hass, source.voltage, 1),
      });
    }
    if (strip.watts === undefined) return this.t('origin_unavailable', { entity: source.entityId });
    const key: EditorStringKey =
      source.origin === 'sensor'
        ? 'origin_sensor'
        : source.origin === 'pattern'
          ? 'origin_pattern'
          : 'origin_device';
    return this.t(key, { entity: source.entityId });
  }

  private renderTags(strip: StripModel, resolved: ResolvedLedGroupConfig) {
    const tags: TemplateResult[] = [];
    if (!strip.available) tags.push(html`<span class="tag">${this.t('offline')}</span>`);
    if (resolved.power.enabled) {
      if (strip.watts !== undefined) {
        tags.push(
          html`<span class="tag ok"
            ><ha-icon .icon=${'mdi:flash'}></ha-icon>${formatWatts(this.hass, strip.watts)}</span
          >`,
        );
      } else if (!strip.power) {
        tags.push(html`<span class="tag warn">${this.t('no_power')}</span>`);
      }
    }
    if (strip.wled) tags.push(html`<span class="tag">${this.t('wled')}</span>`);
    // Amber like the card's button: the strip shows the realtime stream.
    if (
      resolved.ambilight.enabled &&
      strip.ambilight &&
      strip.liveOverride?.available &&
      !strip.liveOverride.active
    ) {
      tags.push(html`<span class="tag amber">${this.t('ambilight_tag')}</span>`);
    }
    return tags;
  }

  private renderPowerChoice(strip: StripModel, resolved: ResolvedLedGroupConfig) {
    const config = this._config ?? ({} as LedGroupCardConfig);
    const override = memberOverride(config, strip.entityId);
    const mode = override?.power_mode ?? 'auto';
    const voltageMissing = mode === 'voltage' && !(override?.voltage ?? resolved.power.voltage);
    return html`<div class="segmented" role="radiogroup" aria-label=${this.t('power_mode')}>
        ${POWER_MODES.filter(
          (option) => option !== 'voltage' || strip.wled || mode === 'voltage',
        ).map(
          (option) =>
            html`<button
              type="button"
              role="radio"
              aria-checked=${String(option === mode)}
              class=${classMap({ on: option === mode })}
              @click=${() => this.commit(updateMember(config, strip.entityId, { power_mode: option }))}
            >
              ${this.t(MODE_LABELS[option])}
            </button>`,
        )}
      </div>
      ${
        mode === 'sensor'
          ? this.form(
              [
                {
                  name: 'power_sensor',
                  selector: { entity: { domain: 'sensor', device_class: 'power' } },
                },
              ],
              { power_sensor: override?.power_sensor },
              (value) =>
                this.commit(
                  updateMember(config, strip.entityId, {
                    power_sensor: (value.power_sensor as string | undefined) || undefined,
                  }),
                ),
            )
          : nothing
      }
      ${
        mode === 'voltage'
          ? this.form(
              [
                {
                  name: 'voltage',
                  selector: {
                    number: { min: 1, max: 48, step: 0.1, mode: 'box', unit_of_measurement: 'V' },
                  },
                },
              ],
              { voltage: override?.voltage ?? resolved.power.voltage },
              (value) =>
                this.commit(
                  updateMember(config, strip.entityId, {
                    voltage: (value.voltage as number | undefined) || undefined,
                  }),
                ),
            )
          : nothing
      }
      <div class="hint">
        ${
          mode === 'none'
            ? this.t('origin_disabled')
            : voltageMissing
              ? this.t('voltage_missing')
              : this.describePower(strip)
        }
      </div>`;
  }

  private renderMember(strip: StripModel, resolved: ResolvedLedGroupConfig, isGroup: boolean) {
    const config = this._config ?? ({} as LedGroupCardConfig);
    const override = memberOverride(config, strip.entityId);
    const light =
      strip.isOn && strip.rgb
        ? {
            background: rgbCss(strip.rgb),
            boxShadow: `0 0 10px ${rgbCss(strip.rgb, 0.5)}`,
            color: '#fff',
          }
        : {};
    const ambilightRow =
      isGroup && resolved.ambilight.enabled && strip.liveOverride
        ? html`<label class="switch-row">
            <span>${this.t('ambilight_member')}</span>
            <input
              type="checkbox"
              role="switch"
              class="switch"
              .checked=${override?.ambilight !== false}
              @change=${(event: Event) =>
                this.commit(
                  updateMember(config, strip.entityId, {
                    ambilight: (event.target as HTMLInputElement).checked,
                  }),
                )}
            />
          </label>`
        : nothing;

    return html`<div
      class=${classMap({ member: true, offline: !strip.available, hidden: strip.hidden })}
    >
      <div class="member-head">
        <span class="light" style=${styleMap(light)}><ha-icon .icon=${strip.icon}></ha-icon></span>
        <span class="member-name">${strip.name}</span>
        <span class="tags">${this.renderTags(strip, resolved)}</span>
        ${isGroup && resolved.details.sort === 'custom' ? this.renderMove(strip) : nothing}
      </div>
      <div class="member-body">
        ${ambilightRow}
        ${resolved.power.enabled ? this.renderPowerChoice(strip, resolved) : nothing}
        ${
          isGroup
            ? html`${this.form(
                  [
                    {
                      type: 'grid',
                      name: '',
                      schema: [
                        { name: 'member_name', selector: { text: {} } },
                        { name: 'member_icon', selector: { icon: {} } },
                      ],
                    },
                  ],
                  { member_name: override?.name, member_icon: override?.icon },
                  (value) =>
                    this.commit(
                      updateMember(config, strip.entityId, {
                        name: (value.member_name as string | undefined) || undefined,
                        icon: (value.member_icon as string | undefined) || undefined,
                      }),
                    ),
                  (schema) =>
                    schema.name === 'member_name'
                      ? this.t('member_name_helper', { name: strip.autoName })
                      : undefined,
                )}
                <label class="switch-row">
                  <span>${this.t('member_visible')}</span>
                  <input
                    type="checkbox"
                    role="switch"
                    class="switch"
                    .checked=${!strip.hidden}
                    @change=${(event: Event) =>
                      this.commit(
                        updateMember(config, strip.entityId, {
                          hidden: !(event.target as HTMLInputElement).checked,
                        }),
                      )}
                  />
                </label>`
            : nothing
        }
      </div>
    </div>`;
  }

  /* -------------------------------- favorites ------------------------------- */

  private renderFavorites(resolved: ResolvedLedGroupConfig) {
    const config = this._config ?? ({} as LedGroupCardConfig);
    const favorites = resolved.tile.favorites;
    return html`<div class="label">
        ${this.t('favorites_title')} <span class="muted">· ${this.t('favorites_hint')}</span>
      </div>
      <div class="favorites">
        ${favorites.map((preset, index) => {
          const rgb = preset.rgb ?? kelvinToRgb(preset.kelvin ?? 2700);
          const name = preset.rgb ? rgbHex(preset.rgb) : `${Math.round(preset.kelvin ?? 0)} K`;
          return html`<button
            type="button"
            class="favorite"
            style=${styleMap({ '--swatch': rgbCss(rgb) })}
            title=${this.t('favorite_remove', { color: name })}
            aria-label=${this.t('favorite_remove', { color: name })}
            @click=${() => this.commit(removeFavorite(config, index))}
          >
            <ha-icon .icon=${'mdi:close'}></ha-icon>
          </button>`;
        })}
        ${
          favorites.length < MAX_FAVORITES
            ? html`<label class="favorite add" title=${this.t('favorite_add')}>
                <ha-icon .icon=${'mdi:plus'}></ha-icon>
                <input
                  type="color"
                  aria-label=${this.t('favorite_add')}
                  value="#ff8a3d"
                  @change=${(event: Event) => {
                    const value = (event.target as HTMLInputElement).value;
                    if (parseColor(value)) this.commit(addFavorite(config, value));
                  }}
                />
              </label>`
            : nothing
        }
      </div>`;
  }

  private renderBadges() {
    const config = this._config ?? ({} as LedGroupCardConfig);
    const hass = this.hass;
    if (!hass) return nothing;
    const badges = config.badges ?? [];
    return html`<div class="label">
        ${this.t('section_badges')} <span class="muted">· ${this.t('badges_hint')}</span>
      </div>
      ${
        badges.length
          ? html`<div class="badge-list">
              ${badges.map((badge, index) => {
                const model = badgeModel(
                  hass,
                  typeof badge === 'string' ? { entity: badge } : badge,
                );
                return html`<span class="badge-item">
                  <ha-icon .icon=${model.icon}></ha-icon>
                  <span class="badge-name">${model.name}</span>
                  ${model.label ? html`<span class="muted">${model.label}</span>` : nothing}
                  <button
                    type="button"
                    class="badge-remove"
                    aria-label=${this.t('badge_remove', { name: model.name })}
                    title=${this.t('badge_remove', { name: model.name })}
                    @click=${() => this.commit(removeBadge(config, index))}
                  >
                    <ha-icon .icon=${'mdi:close'}></ha-icon>
                  </button>
                </span>`;
              })}
            </div>`
          : nothing
      }
      ${this.form([{ name: 'badge_add', selector: { entity: {} } }], {}, (value) => {
        const entity = value.badge_add as string | undefined;
        if (entity) this.commit(addBadge(config, entity));
      })}`;
  }

  private renderAppearance(resolved: ResolvedLedGroupConfig, model: LedGroupModel) {
    const config = this._config ?? ({} as LedGroupCardConfig);
    return html`<div class="label">${this.t('section_appearance')}</div>
      ${this.form(
        [
          {
            name: 'glow',
            selector: this.select(
              GLOW_LEVELS.map((level) => ({
                value: level,
                label: this.t(`glow_${level}` as EditorStringKey),
              })),
            ),
          },
          { name: 'header', selector: { boolean: {} } },
          { name: 'compact', selector: { boolean: {} } },
          ...(model.isGroup ? [{ name: 'gradient', selector: { boolean: {} } }] : []),
          { name: 'animate_effects', selector: { boolean: {} } },
        ],
        {
          glow: resolved.appearance.glow,
          header: resolved.appearance.header,
          compact: resolved.appearance.compact,
          gradient: resolved.appearance.gradient,
          animate_effects: resolved.appearance.animateEffects,
        },
        (value) => {
          let next = setOption(config, 'appearance', 'glow', value.glow, 'normal');
          next = setOption(next, 'appearance', 'header', value.header, true);
          next = setOption(next, 'appearance', 'compact', value.compact, false);
          if (model.isGroup) next = setOption(next, 'appearance', 'gradient', value.gradient, true);
          next = setOption(next, 'appearance', 'animate_effects', value.animate_effects, true);
          this.commit(next);
        },
      )}`;
  }

  private renderMove(strip: StripModel) {
    const config = this._config ?? ({} as LedGroupCardConfig);
    const order = this.resolve()?.model.detected.map((item) => item.entityId) ?? [];
    const index = order.indexOf(strip.entityId);
    const move = (delta: number) => {
      const next = [...order];
      const [item] = next.splice(index, 1);
      if (item === undefined) return;
      next.splice(index + delta, 0, item);
      this.commit(setOption(config, 'details', 'order', next));
    };
    return html`<span class="move">
      <button
        type="button"
        aria-label=${this.t('move_up', { name: strip.name })}
        title=${this.t('move_up', { name: strip.name })}
        ?disabled=${index <= 0}
        @click=${() => move(-1)}
      >
        <ha-icon .icon=${'mdi:chevron-up'}></ha-icon>
      </button>
      <button
        type="button"
        aria-label=${this.t('move_down', { name: strip.name })}
        title=${this.t('move_down', { name: strip.name })}
        ?disabled=${index === -1 || index >= order.length - 1}
        @click=${() => move(1)}
      >
        <ha-icon .icon=${'mdi:chevron-down'}></ha-icon>
      </button>
    </span>`;
  }

  /* -------------------------------- advanced -------------------------------- */

  private renderAdvanced(resolved: ResolvedLedGroupConfig, model: LedGroupModel) {
    const config = this._config ?? ({} as LedGroupCardConfig);
    const colorOptions = COLOR_BAR_MODES.map((mode) => ({
      value: mode,
      label: this.t(`color_bar_${mode}` as EditorStringKey),
    }));
    const actions = SIMPLE_ACTIONS.filter((action) => action !== 'details' || model.isGroup).map(
      (action) => ({ value: action, label: this.t(ACTION_LABELS[action] as EditorStringKey) }),
    );
    const withCustom = (value: string | undefined) =>
      value === CUSTOM ? [...actions, { value: CUSTOM, label: this.t('action_custom') }] : actions;
    const holdDefault = this.t('action_default', {
      action: this.t(model.detailsEnabled ? 'action_details' : 'action_more_info'),
    });
    const tap = actionValue(config.tile?.tap_action) ?? 'toggle';
    const hold = actionValue(config.tile?.hold_action) ?? DEFAULT;
    const doubleTap = actionValue(config.tile?.double_tap_action) ?? 'none';
    const tile = (key: string, value: unknown, fallback?: unknown) =>
      this.commit(setOption(config, 'tile', key, value, fallback));

    const content = html`
      ${this.renderAppearance(resolved, model)}
      <div class="label">${this.t('section_tile')}</div>
      ${this.form(
        [
          {
            type: 'grid',
            name: '',
            schema: [
              { name: 'color_bar', selector: this.select(colorOptions) },
              {
                name: 'state',
                selector: this.select(
                  STATE_TEXTS.map((value) => ({
                    value,
                    label: this.t(value === 'brightness' ? 'state_brightness' : 'state_none'),
                  })),
                ),
              },
            ],
          },
          { name: 'effects', selector: { boolean: {} } },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'brightness_min',
                selector: {
                  number: { min: 1, max: 100, step: 1, mode: 'box', unit_of_measurement: '%' },
                },
              },
              {
                name: 'brightness_step',
                selector: {
                  number: { min: 1, max: 50, step: 1, mode: 'box', unit_of_measurement: '%' },
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
        ],
        {
          color_bar: resolved.tile.colorBar,
          state: resolved.tile.state,
          effects: resolved.tile.effects,
          brightness_min: resolved.tile.brightnessMin,
          brightness_step: resolved.tile.brightnessStep,
          transition: resolved.tile.transition,
        },
        (value) => {
          let next = setOption(config, 'tile', 'color_bar', value.color_bar, 'auto');
          next = setOption(next, 'tile', 'state', value.state, 'brightness');
          next = setOption(next, 'tile', 'effects', value.effects, true);
          next = setOption(next, 'tile', 'brightness_min', value.brightness_min, 1);
          next = setOption(next, 'tile', 'brightness_step', value.brightness_step, 1);
          next = setOption(next, 'tile', 'transition', value.transition);
          this.commit(next);
        },
      )}
      <div class="label">${this.t('section_gestures')}</div>
      ${this.form(
        [
          {
            type: 'grid',
            name: '',
            schema: [
              { name: 'tap_action', selector: this.select(withCustom(tap)) },
              {
                name: 'hold_action',
                selector: this.select([
                  { value: DEFAULT, label: holdDefault },
                  ...withCustom(hold),
                ]),
              },
            ],
          },
          { name: 'double_tap_action', selector: this.select(withCustom(doubleTap)) },
        ],
        { tap_action: tap, hold_action: hold, double_tap_action: doubleTap },
        (value) => {
          if (value.tap_action !== CUSTOM && value.tap_action !== tap) {
            tile('tap_action', value.tap_action, 'toggle');
          } else if (value.hold_action !== CUSTOM && value.hold_action !== hold) {
            tile('hold_action', value.hold_action === DEFAULT ? undefined : value.hold_action);
          } else if (value.double_tap_action !== CUSTOM && value.double_tap_action !== doubleTap) {
            tile('double_tap_action', value.double_tap_action, 'none');
          }
        },
      )}
      ${this.renderBadges()}
      ${model.isGroup && model.detailsEnabled ? this.renderDetailsOptions(resolved, model) : nothing}
      ${
        resolved.power.enabled
          ? html`<div class="label">${this.t('section_glow')}</div>
              ${this.form(
                [
                  {
                    type: 'grid',
                    name: '',
                    schema: [
                      {
                        name: 'idle',
                        selector: {
                          number: { min: 0, step: 0.5, mode: 'box', unit_of_measurement: 'W' },
                        },
                      },
                      {
                        name: 'max',
                        selector: {
                          number: { min: 1, step: 1, mode: 'box', unit_of_measurement: 'W' },
                        },
                      },
                    ],
                  },
                ],
                { idle: resolved.power.scale.idle, max: config.power?.max },
                (value) => {
                  let next = setOption(config, 'power', 'idle', value.idle, 3);
                  next = setOption(next, 'power', 'max', value.max);
                  this.commit(next);
                },
                (schema) => (schema.name === 'max' ? this.t('max_auto_helper') : undefined),
              )}`
          : nothing
      }
    `;

    return html`<details
      class="advanced"
      ?open=${this._advanced}
      @toggle=${(event: Event) => (this._advanced = (event.target as HTMLDetailsElement).open)}
    >
      <summary>
        <ha-icon .icon=${'mdi:tune-variant'}></ha-icon>
        <span>${this.t('advanced')}</span>
        <span class="summary-hint"
          >${this.t(model.isGroup ? 'advanced_summary' : 'advanced_summary_single')}</span
        >
        <ha-icon class="chevron" .icon=${'mdi:chevron-down'}></ha-icon>
      </summary>
      <div class="advanced-body">${this._advanced ? content : nothing}</div>
    </details>`;
  }

  private renderDetailsOptions(resolved: ResolvedLedGroupConfig, model: LedGroupModel) {
    const wled = model.detected.some((strip) => strip.wled);
    const config = this._config ?? ({} as LedGroupCardConfig);
    const hash = config.details?.hash?.replace(/^#\/?/, '');
    return html`<div class="label">${this.t('section_details')}</div>
      ${this.form(
        [
          { name: 'hash', selector: { text: {} } },
          {
            type: 'grid',
            name: '',
            schema: [
              {
                name: 'sort',
                selector: this.select(
                  MEMBER_ORDERS.map((value) => ({
                    value,
                    label: this.t(
                      value === 'name'
                        ? 'sort_name'
                        : value === 'group'
                          ? 'sort_group'
                          : 'sort_custom',
                    ),
                  })),
                ),
              },
              {
                name: 'details_color_bar',
                selector: this.select([
                  { value: DEFAULT, label: this.t('color_bar_same') },
                  ...COLOR_BAR_MODES.map((mode) => ({
                    value: mode,
                    label: this.t(`color_bar_${mode}` as EditorStringKey),
                  })),
                ]),
              },
            ],
          },
          { name: 'summary', selector: { boolean: {} } },
          { name: 'details_effects', selector: { boolean: {} } },
          ...(resolved.tile.favorites.length
            ? [{ name: 'details_favorites', selector: { boolean: {} } }]
            : []),
          ...(wled
            ? [
                { name: 'wled_controls', selector: { boolean: {} } },
                { name: 'health', selector: { boolean: {} } },
              ]
            : []),
          ...(model.hasPower ? [{ name: 'details_history', selector: { boolean: {} } }] : []),
        ],
        {
          hash,
          sort: resolved.details.sort,
          details_color_bar: config.details?.color_bar ?? DEFAULT,
          summary: resolved.details.summary,
          details_effects: resolved.details.effects,
          details_favorites: resolved.details.favorites,
          wled_controls: resolved.details.wledControls,
          health: resolved.details.health,
          details_history: resolved.details.history,
        },
        (value) => {
          // The hash becomes part of a URL: keep it to the characters the card accepts.
          const rawHash = (value.hash as string | undefined) ?? '';
          const cleanHash = rawHash.replace(/^#\/?/, '').replace(/[^\w-]/g, '-');
          let next = setOption(config, 'details', 'hash', cleanHash);
          next = setOption(next, 'details', 'sort', value.sort, 'name');
          next = setOption(
            next,
            'details',
            'color_bar',
            value.details_color_bar === DEFAULT ? undefined : value.details_color_bar,
          );
          next = setOption(next, 'details', 'summary', value.summary, true);
          next = setOption(
            next,
            'details',
            'effects',
            value.details_effects,
            resolved.tile.effects,
          );
          if (resolved.tile.favorites.length) {
            next = setOption(next, 'details', 'favorites', value.details_favorites, true);
          }
          if (wled) {
            next = setOption(next, 'details', 'wled_controls', value.wled_controls, true);
            next = setOption(next, 'details', 'health', value.health, true);
          }
          if (model.hasPower) {
            next = setOption(next, 'details', 'history', value.details_history, true);
          }
          // A custom order starts from the order shown right now.
          if (value.sort === 'custom' && resolved.details.sort !== 'custom') {
            next = setOption(
              next,
              'details',
              'order',
              model.detected.map((strip) => strip.entityId),
            );
          } else if (value.sort !== 'custom') {
            next = setOption(next, 'details', 'order', undefined);
          }
          this.commit(next);
        },
        (schema) =>
          schema.name === 'hash' && hash ? this.t('details_hash_helper', { hash }) : undefined,
      )}`;
  }

  /* --------------------------------- render --------------------------------- */

  protected override render() {
    if (!this.hass || !this._config) return nothing;
    const config = this._config;
    const resolution = this.resolve();

    const entityForm = this.form(
      [{ name: 'entity', required: true, selector: { entity: { domain: 'light' } } }],
      { entity: config.entity },
      (value) => this.commit(setRoot(config, 'entity', value.entity)),
    );

    if (!resolution) {
      return html`<div class="editor">${entityForm}${this.renderBanner(config.entity)}</div>`;
    }
    const { resolved, model, error } = resolution;
    const members = model.isGroup ? model.detected : model.detected.slice(0, 1);

    return html`<div class="editor">
      ${entityForm} ${this.renderBanner(config.entity, resolution)}
      ${
        error
          ? html`<div class="banner error">
              <ha-icon .icon=${'mdi:alert-circle-outline'}></ha-icon><span>${error}</span>
            </div>`
          : nothing
      }
      ${this.form(
        [
          {
            type: 'grid',
            name: '',
            schema: [
              { name: 'name', selector: { text: {} } },
              { name: 'icon', selector: { icon: {} }, context: { icon_entity: 'entity' } },
            ],
          },
        ],
        { name: config.name, icon: config.icon, entity: config.entity },
        (value) => {
          let next = setRoot(config, 'name', value.name);
          next = setRoot(next, 'icon', value.icon);
          this.commit(next);
        },
      )}
      ${this.renderPills(resolved, model)} ${this.renderFavorites(resolved)}
      ${resolved.power.enabled && model.isGroup ? this.renderDefaultPower(model) : nothing}
      ${
        model.isGroup
          ? html`<div class="divider"></div>
              <div class="label">
                ${this.t('members_title')} <span class="muted">· ${this.t('members_hint')}</span>
              </div>`
          : nothing
      }
      ${members.map((strip) => this.renderMember(strip, resolved, model.isGroup))}
      ${this.renderAdvanced(resolved, model)}
    </div>`;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .editor {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        flex: none;
      }
      .banner {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 10px 12px;
        border-radius: 10px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
        line-height: 1.45;
        font-size: 13px;
      }
      .banner.neutral {
        background: rgba(var(--vivid-rgb-text), 0.05);
      }
      .banner.warn {
        background: rgba(255, 179, 0, 0.14);
      }
      .banner.error {
        background: rgba(219, 68, 55, 0.14);
      }
      .banner ha-icon {
        color: var(--primary-color);
      }
      .banner.error ha-icon {
        color: var(--error-color, #db4437);
      }
      .banner.warn ha-icon {
        color: var(--warning-color, #ffa600);
      }
      .label {
        font-weight: 500;
        font-size: 14px;
        margin-top: 2px;
      }
      .muted,
      .summary-hint {
        color: var(--secondary-text-color);
        font-weight: 400;
        font-size: 12px;
      }
      .hint {
        color: var(--secondary-text-color);
        font-size: 12px;
        line-height: 1.4;
        overflow-wrap: anywhere;
      }
      .divider {
        height: 1px;
        background: var(--divider-color, rgba(255, 255, 255, 0.12));
      }
      .pills {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .pill {
        appearance: none;
        border: none;
        font: inherit;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 12px;
        border-radius: 18px;
        background: rgba(var(--vivid-rgb-text), 0.06);
        color: var(--secondary-text-color);
        font-size: 13px;
        cursor: pointer;
      }
      .pill.on {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.18);
        color: var(--primary-text-color);
      }
      .pill.on ha-icon {
        color: var(--primary-color);
      }
      .pill.disabled {
        cursor: default;
        background: none;
        border: 1px dashed var(--divider-color, rgba(255, 255, 255, 0.15));
        color: var(--disabled-text-color);
      }
      .pill:focus-visible,
      .segmented button:focus-visible,
      .switch:focus-visible,
      summary:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .favorites {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .favorite {
        appearance: none;
        border: none;
        margin: 0;
        padding: 0;
        position: relative;
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--swatch);
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        color: transparent;
      }
      .favorite:hover,
      .favorite:focus-visible {
        color: #fff;
        filter: brightness(0.85);
      }
      .favorite:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .favorite.add {
        background: none;
        box-shadow: inset 0 0 0 1px var(--divider-color, rgba(255, 255, 255, 0.2));
        color: var(--secondary-text-color);
        overflow: hidden;
      }
      .favorite.add:focus-within {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .favorite.add input {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
      }
      .move {
        display: inline-flex;
        gap: 2px;
        flex: none;
      }
      .move button {
        appearance: none;
        border: none;
        margin: 0;
        padding: 0;
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: rgba(var(--vivid-rgb-text), 0.06);
        color: var(--primary-text-color);
        cursor: pointer;
      }
      .move button:disabled {
        opacity: 0.35;
        cursor: default;
      }
      .move button:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .badge-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .badge-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 4px 4px 10px;
        border-radius: 16px;
        background: rgba(var(--vivid-rgb-text), 0.06);
        font-size: 13px;
      }
      .badge-remove {
        appearance: none;
        border: none;
        margin: 0;
        padding: 0;
        display: grid;
        place-items: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .badge-remove:hover,
      .badge-remove:focus-visible {
        background: rgba(var(--vivid-rgb-text), 0.1);
        color: var(--primary-text-color);
      }
      .member {
        border-radius: 12px;
        background: rgba(var(--vivid-rgb-text), 0.04);
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.08));
      }
      .member-head {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px 6px;
      }
      .light {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        flex: none;
        background: rgba(var(--vivid-rgb-text), 0.08);
        color: var(--secondary-text-color);
      }
      .member-name {
        font-weight: 500;
      }
      .member.offline .member-name {
        color: var(--secondary-text-color);
      }
      .member.hidden .member-head {
        opacity: 0.5;
      }
      .tags {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 4px;
        margin-left: auto;
      }
      .tag {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px 8px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.07);
        color: var(--secondary-text-color);
        font-size: 11px;
        white-space: nowrap;
      }
      .tag ha-icon {
        --mdc-icon-size: 12px;
      }
      .tag.ok {
        color: var(--success-color, #43a047);
      }
      .tag.warn {
        color: var(--warning-color, #ffa600);
        background: rgba(255, 166, 0, 0.12);
      }
      .tag.amber {
        color: var(--amber-color, #ffc107);
        background: rgba(255, 193, 7, 0.12);
      }
      .member-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 4px 12px 12px;
      }
      .switch-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 32px;
        cursor: pointer;
      }
      .switch {
        appearance: none;
        position: relative;
        flex: none;
        width: 36px;
        height: 20px;
        margin: 0;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.25);
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      .switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--primary-text-color);
        transition: transform 0.2s ease;
      }
      .switch:checked {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.55);
      }
      .switch:checked::after {
        transform: translateX(16px);
        background: var(--primary-color);
      }
      .segmented {
        display: flex;
        gap: 3px;
        padding: 3px;
        border-radius: 8px;
        background: rgba(var(--vivid-rgb-text), 0.06);
      }
      .segmented button {
        appearance: none;
        border: none;
        font: inherit;
        flex: 1;
        padding: 6px 4px;
        border-radius: 6px;
        background: none;
        color: var(--secondary-text-color);
        font-size: 12px;
        cursor: pointer;
      }
      .segmented button.on {
        background: rgba(var(--vivid-rgb-text), 0.14);
        color: var(--primary-text-color);
        font-weight: 500;
      }
      .advanced {
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.08));
        border-radius: 12px;
      }
      summary {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        cursor: pointer;
        list-style: none;
        font-weight: 500;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      summary .summary-hint {
        margin-left: auto;
      }
      .advanced[open] .chevron {
        transform: rotate(180deg);
      }
      .advanced-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 0 14px 14px;
      }
      @media (prefers-reduced-motion: reduce) {
        .switch,
        .switch::after {
          transition: none;
        }
      }
    `,
  ];
}

defineElement('vivid-led-group-editor', VividLedGroupEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-led-group-editor': VividLedGroupEditor;
  }
}
