import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { fireEvent } from '../../core/actions';
import { GLOW_SLIDER, glowPercent } from '../../core/glow';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { tokens } from '../../components/shared-styles';
import {
  LAMP_DOMAINS,
  LAMP_ACTIONS,
  LAMP_LAYOUTS,
  LAMP_SIZES,
  resolveLampConfig,
  type LampGroupCardConfig,
  type LampMemberConfig,
  type LampSceneConfig,
  type ResolvedLampGroupConfig,
} from './config';
import { buildLampGroupModel, type LampGroupModel, type LampModel } from './model';

type FormData = Record<string, unknown>;
type Schema = Record<string, unknown>[];

const DEFAULTS: Record<string, unknown> = {
  layout: 'ambiance',
  show_header: true,
  show_count: true,
  show_toggle_all: true,
  show_names: true,
  show_status: true,
  size: 'medium',
  tap_action: 'toggle',
  hold_action: 'details',
  show_power: true,
  show_duration: true,
  show_energy: true,
  max_watts: 60,
  warn_below: 1,
  glow: 100,
};

/** Drops options left at their default, and empty lists. */
function clean(config: LampGroupCardConfig): LampGroupCardConfig {
  const next: Record<string, unknown> = { ...config };
  for (const [key, value] of Object.entries(next)) {
    if (value === undefined || value === null || value === '' || DEFAULTS[key] === value) {
      delete next[key];
    } else if (Array.isArray(value) && value.length === 0) {
      delete next[key];
    }
  }
  return next as LampGroupCardConfig;
}

function updateMember(
  config: LampGroupCardConfig,
  entityId: string,
  patch: Partial<LampMemberConfig>,
): LampGroupCardConfig {
  const members = [...(config.members ?? [])];
  const index = members.findIndex((member) => member.entity === entityId);
  const merged: Record<string, unknown> = {
    ...(index === -1 ? { entity: entityId } : members[index]),
    ...patch,
  };
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === '' || (key === 'hidden' && value === false)) {
      delete merged[key];
    }
  }
  const member = merged as unknown as LampMemberConfig;
  const empty = Object.keys(member).length === 1;
  if (index === -1) {
    if (!empty) members.push(member);
  } else if (empty) members.splice(index, 1);
  else members[index] = member;
  return { ...config, members };
}

function updateScene(
  config: LampGroupCardConfig,
  index: number,
  scene: LampSceneConfig | undefined,
): LampGroupCardConfig {
  const scenes = [...(config.scenes ?? [])];
  if (scene) scenes[index] = scene;
  else scenes.splice(index, 1);
  return { ...config, scenes };
}

/** Visual editor of the lamp card. */
export class VividLampGroupEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _open: { state: true },
    _openLamp: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: LampGroupCardConfig;
  declare _open: Set<string>;
  declare _openLamp?: string;

  constructor() {
    super();
    this._open = new Set();
  }

  setConfig(config: LampGroupCardConfig): void {
    this._config = config;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void ensureHaForm().then(() => this.requestUpdate());
  }

  private t(key: EditorStringKey, values?: Record<string, string | number>): string {
    return editorText(this.hass, key, values);
  }

  private commit(next: LampGroupCardConfig): void {
    const config = clean(next);
    this._config = config;
    fireEvent(this, 'config-changed', { config });
  }

  private form(
    schema: Schema,
    data: FormData,
    onChange: (value: FormData) => void,
    labels: Record<string, string>,
    helpers: Record<string, string> = {},
  ): TemplateResult {
    return html`<ha-form
      .hass=${this.hass}
      .data=${data}
      .schema=${schema}
      .computeLabel=${(field: { name: string }) => labels[field.name]}
      .computeHelper=${(field: { name: string }) => helpers[field.name]}
      @value-changed=${(event: CustomEvent<{ value: FormData }>) => {
        event.stopPropagation();
        onChange(event.detail.value);
      }}
    ></ha-form>`;
  }

  private section(id: string, icon: string, title: string, hint: string, body: () => unknown) {
    const open = this._open.has(id);
    return html`<details
      class="section"
      ?open=${open}
      @toggle=${(event: Event) => {
        const isOpen = (event.target as HTMLDetailsElement).open;
        if (isOpen === this._open.has(id)) return;
        const next = new Set(this._open);
        if (isOpen) next.add(id);
        else next.delete(id);
        this._open = next;
      }}
    >
      <summary>
        <ha-icon .icon=${icon}></ha-icon>
        <span class="section-title">${title}</span>
        <span class="hint">${hint}</span>
        <ha-icon class="chevron" .icon=${'mdi:chevron-down'}></ha-icon>
      </summary>
      <div class="section-body">${open ? body() : nothing}</div>
    </details>`;
  }

  /* ---------------------------------- main ---------------------------------- */

  private renderMain(config: LampGroupCardConfig) {
    const layouts = LAMP_LAYOUTS.map((value) => ({
      value,
      label: this.t(`lamp_layout_${value}` as EditorStringKey),
    }));
    return this.form(
      [
        { name: 'entity', selector: { entity: { domain: LAMP_DOMAINS } } },
        { name: 'entities', selector: { entity: { domain: LAMP_DOMAINS, multiple: true } } },
        {
          type: 'grid',
          name: '',
          schema: [
            { name: 'name', selector: { text: {} } },
            { name: 'icon', selector: { icon: {} } },
          ],
        },
        { name: 'layout', selector: { select: { mode: 'dropdown', options: layouts } } },
      ],
      {
        entity: config.entity,
        entities: config.entities,
        name: config.name,
        icon: config.icon,
        layout: config.layout ?? 'ambiance',
      },
      (value) =>
        this.commit({
          ...config,
          entity: value.entity as string | undefined,
          entities: value.entities as string[] | undefined,
          name: value.name as string | undefined,
          icon: value.icon as string | undefined,
          layout: value.layout as LampGroupCardConfig['layout'],
        }),
      {
        entity: this.t('lamp_entity'),
        entities: this.t('lamp_entities'),
        name: this.t('name'),
        icon: this.t('icon'),
        layout: this.t('lamp_layout'),
      },
    );
  }

  /* ---------------------------------- lamps --------------------------------- */

  private renderLamp(lamp: LampModel, config: LampGroupCardConfig) {
    const open = this._openLamp === lamp.entityId;
    const member = config.members?.find((item) => item.entity === lamp.entityId);
    const toggle = () => {
      this._openLamp = open ? undefined : lamp.entityId;
    };
    const detected =
      lamp.power && lamp.power.entityId !== member?.power_sensor ? lamp.power.entityId : undefined;
    const body = () =>
      html`<div class="lamp-body">
        ${this.form(
          [
            {
              type: 'grid',
              name: '',
              schema: [
                { name: 'name', selector: { text: {} } },
                { name: 'power_sensor', selector: { entity: { domain: ['sensor'] } } },
              ],
            },
            {
              type: 'grid',
              name: '',
              schema: [
                { name: 'icon', selector: { icon: {} } },
                { name: 'icon_off', selector: { icon: {} } },
              ],
            },
          ],
          {
            name: member?.name,
            power_sensor: member?.power_sensor,
            icon: member?.icon,
            icon_off: member?.icon_off,
          },
          (value) =>
            this.commit(
              updateMember(config, lamp.entityId, {
                name: (value.name as string | undefined) || undefined,
                power_sensor: (value.power_sensor as string | undefined) || undefined,
                icon: (value.icon as string | undefined) || undefined,
                icon_off: (value.icon_off as string | undefined) || undefined,
              }),
            ),
          {
            name: this.t('member_name'),
            power_sensor: this.t('power_sensor'),
            icon: this.t('icon_on'),
            icon_off: this.t('icon_off'),
          },
          {
            name: this.t('member_name_helper', { name: lamp.autoName }),
            power_sensor: detected
              ? this.t('lamp_sensor_auto', { sensor: detected })
              : this.t('lamp_sensor_none'),
            icon: this.t('icon_auto', { icon: lamp.icon }),
            icon_off: this.t('icon_auto', { icon: lamp.iconOff }),
          },
        )}
        <label class="switch-row">
          <span>${this.t('lamp_visible')}</span>
          <input
            type="checkbox"
            role="switch"
            class="switch"
            .checked=${!lamp.hidden}
            @change=${(event: Event) =>
              this.commit(
                updateMember(config, lamp.entityId, {
                  hidden: !(event.target as HTMLInputElement).checked,
                }),
              )}
          />
        </label>
      </div>`;
    return html`<div class=${classMap({ lamp: true, open, hidden: lamp.hidden })}>
      <button type="button" class="lamp-head" aria-expanded=${String(open)} @click=${toggle}>
        <span class=${classMap({ dot: true, on: lamp.isOn })}
          ><ha-icon .icon=${lamp.isOn ? lamp.icon : lamp.iconOff}></ha-icon
        ></span>
        <span class="lamp-name">${lamp.name}</span>
        <span class="hint">${lamp.power ? lamp.power.entityId : this.t('no_power')}</span>
        <ha-icon class="chevron" .icon=${'mdi:chevron-down'}></ha-icon>
      </button>
      ${open ? body() : nothing}
    </div>`;
  }

  /* --------------------------------- scenes --------------------------------- */

  private renderScene(
    scene: LampSceneConfig,
    index: number,
    config: LampGroupCardConfig,
    model: LampGroupModel,
  ) {
    const kind = scene.scene !== undefined ? 'scene' : 'lamps';
    const lamps = new Set(scene.lamps ?? []);
    const write = (next: LampSceneConfig) => this.commit(updateScene(config, index, next));
    return html`<div class="scene">
      ${this.form(
        [
          {
            type: 'grid',
            name: '',
            schema: [
              { name: 'name', selector: { text: {} } },
              { name: 'icon', selector: { icon: {} } },
            ],
          },
          {
            name: 'kind',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'lamps', label: this.t('scene_kind_lamps') },
                  { value: 'scene', label: this.t('scene_kind_scene') },
                ],
              },
            },
          },
          ...(kind === 'scene'
            ? [{ name: 'scene', selector: { entity: { domain: ['scene'] } } }]
            : []),
        ],
        { name: scene.name, icon: scene.icon, kind, scene: scene.scene },
        (value) => {
          const next: LampSceneConfig = {
            name: (value.name as string | undefined) ?? '',
            ...(value.icon ? { icon: value.icon as string } : {}),
          };
          if (value.kind === 'scene') next.scene = (value.scene as string | undefined) ?? '';
          else next.lamps = scene.lamps ?? [];
          write(next);
        },
        {
          name: this.t('scene_name'),
          icon: this.t('icon'),
          kind: this.t('scene_kind'),
          scene: this.t('scene_entity'),
        },
      )}
      ${
        kind === 'lamps'
          ? html`<div class="label">${this.t('scene_lamps')}</div>
              <div class="picks">
                ${model.all.map(
                  (lamp) =>
                    html`<button
                      type="button"
                      class=${classMap({ pick: true, on: lamps.has(lamp.entityId) })}
                      aria-pressed=${String(lamps.has(lamp.entityId))}
                      @click=${() => {
                        const next = new Set(lamps);
                        if (next.has(lamp.entityId)) next.delete(lamp.entityId);
                        else next.add(lamp.entityId);
                        write({
                          ...scene,
                          lamps: model.all.map((l) => l.entityId).filter((id) => next.has(id)),
                        });
                      }}
                    >
                      <ha-icon .icon=${lamp.icon}></ha-icon>${lamp.name}
                    </button>`,
                )}
              </div>`
          : nothing
      }
      <div class="scene-actions">
        <button
          type="button"
          class="text-button danger"
          @click=${() => this.commit(updateScene(config, index, undefined))}
        >
          <ha-icon .icon=${'mdi:delete-outline'}></ha-icon>${this.t('scene_remove')}
        </button>
      </div>
    </div>`;
  }

  private renderScenes(config: LampGroupCardConfig, model: LampGroupModel) {
    const scenes = config.scenes ?? [];
    return html`${scenes.length ? nothing : html`<div class="hint">${this.t('scenes_none')}</div>`}
      ${scenes.map((scene, index) => this.renderScene(scene, index, config, model))}
      <button
        type="button"
        class="text-button"
        @click=${() =>
          this.commit({
            ...config,
            scenes: [
              ...scenes,
              { name: this.t('scene_default_name', { n: scenes.length + 1 }), lamps: [] },
            ],
          })}
      >
        <ha-icon .icon=${'mdi:plus'}></ha-icon>${this.t('scene_add')}
      </button>`;
  }

  /* ---------------------------------- power --------------------------------- */

  private renderPower(config: LampGroupCardConfig) {
    const currency = this.hass?.config?.currency ?? 'EUR';
    return this.form(
      [
        {
          type: 'grid',
          name: '',
          schema: [
            { name: 'show_power', selector: { boolean: {} } },
            { name: 'show_duration', selector: { boolean: {} } },
          ],
        },
        { name: 'show_energy', selector: { boolean: {} } },
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
                  unit_of_measurement: `${currency}/kWh`,
                },
              },
            },
            {
              name: 'price_entity',
              selector: { entity: { domain: ['sensor', 'input_number'] } },
            },
          ],
        },
        {
          type: 'grid',
          name: '',
          schema: [
            {
              name: 'max_watts',
              selector: {
                number: { min: 1, max: 500, step: 1, mode: 'box', unit_of_measurement: 'W' },
              },
            },
            {
              name: 'warn_below',
              selector: {
                number: { min: 0, max: 20, step: 0.1, mode: 'box', unit_of_measurement: 'W' },
              },
            },
          ],
        },
      ],
      {
        show_power: config.show_power ?? true,
        show_duration: config.show_duration ?? true,
        show_energy: config.show_energy ?? true,
        price: config.price,
        price_entity: config.price_entity,
        max_watts: config.max_watts ?? 60,
        warn_below: config.warn_below ?? 1,
      },
      (value) => this.commit({ ...config, ...value } as LampGroupCardConfig),
      {
        show_power: this.t('show_power'),
        show_duration: this.t('show_duration'),
        show_energy: this.t('show_energy'),
        price: this.t('price'),
        price_entity: this.t('price_entity'),
        max_watts: this.t('max_watts'),
        warn_below: this.t('warn_below'),
      },
      {
        price: this.t('price_helper'),
        price_entity: this.t('price_entity_helper'),
        max_watts: this.t('max_watts_helper'),
        warn_below: this.t('warn_below_helper'),
      },
    );
  }

  private renderAppearance(config: LampGroupCardConfig) {
    const glow = glowPercent(config.glow ?? 100) ?? 100;
    const line = (config.layout ?? 'ambiance') === 'line';
    const sizes = LAMP_SIZES.map((value) => ({
      value,
      label: this.t(`lamp_size_${value}` as EditorStringKey),
    }));
    const pair = (a: Schema[number], b?: Schema[number]) => ({
      type: 'grid',
      name: '',
      schema: b ? [a, b] : [a],
    });
    const toggle = (name: string) => ({ name, selector: { boolean: {} } });
    const schema: Schema = [
      ...(line ? [] : [pair(toggle('show_header'), toggle('show_count'))]),
      line
        ? pair(toggle('show_count'), toggle('show_toggle_all'))
        : pair(toggle('show_toggle_all')),
      ...(line ? [] : [pair(toggle('show_names'), toggle('show_status'))]),
      pair(
        { name: 'size', selector: { select: { mode: 'dropdown', options: sizes } } },
        ...(line
          ? []
          : [{ name: 'columns', selector: { number: { min: 1, max: 12, step: 1, mode: 'box' } } }]),
      ),
      { name: 'glow', selector: GLOW_SLIDER },
    ];
    return this.form(
      schema,
      {
        show_header: config.show_header ?? true,
        show_count: config.show_count ?? true,
        show_toggle_all: config.show_toggle_all ?? true,
        show_names: config.show_names ?? true,
        show_status: config.show_status ?? true,
        size: config.size ?? 'medium',
        columns: config.columns,
        glow,
      },
      (value) => {
        const next = { ...config, ...value } as LampGroupCardConfig;
        // A named level written in YAML stays until the slider moves.
        if (value.glow === glow) next.glow = config.glow;
        this.commit(next);
      },
      {
        show_header: this.t('lamp_show_header'),
        show_count: this.t('lamp_show_count'),
        show_toggle_all: this.t('lamp_show_toggle_all'),
        show_names: this.t('lamp_show_names'),
        show_status: this.t('lamp_show_status'),
        size: this.t('lamp_size'),
        columns: this.t('lamp_columns'),
        glow: this.t('glow'),
      },
      { columns: this.t('lamp_columns_helper'), glow: this.t('glow_helper') },
    );
  }

  private renderGestures(config: LampGroupCardConfig) {
    const actionOf = (value: unknown) =>
      typeof value === 'object' && value !== null ? (value as { action?: string }).action : value;
    const options = LAMP_ACTIONS.map((value) => ({
      value,
      label: this.t(
        (value === 'more-info' ? 'action_more_info' : `action_${value}`) as EditorStringKey,
      ),
    }));
    const select = { select: { mode: 'dropdown', options } };
    return this.form(
      [
        {
          type: 'grid',
          name: '',
          schema: [
            { name: 'tap_action', selector: select },
            { name: 'hold_action', selector: select },
          ],
        },
      ],
      {
        tap_action: actionOf(config.tap_action) ?? 'toggle',
        hold_action: actionOf(config.hold_action) ?? 'details',
      },
      (value) => this.commit({ ...config, ...value } as LampGroupCardConfig),
      { tap_action: this.t('tap_action'), hold_action: this.t('hold_action') },
    );
  }

  protected override render() {
    const config = this._config;
    const hass = this.hass;
    if (!config || !hass) return nothing;
    let resolved: ResolvedLampGroupConfig | undefined;
    let error: string | undefined;
    try {
      resolved = resolveLampConfig({ ...config, type: config.type ?? 'custom:vivid-lamp-group' });
    } catch (caught) {
      error = (caught as Error).message;
    }
    const model = resolved ? buildLampGroupModel(hass, resolved) : undefined;
    const lamps = model?.all ?? [];
    const scenes = config.scenes?.length ?? 0;
    return html`<div class="editor">
      ${this.renderMain(config)} ${error ? html`<div class="error">${error}</div>` : nothing}
      ${
        model && resolved
          ? html`<div class="sections">
              ${this.section(
                'lamps',
                'mdi:lamps',
                this.t('lamps_section'),
                `${lamps.length} · ${this.t('lamps_hint')}`,
                () => lamps.map((lamp) => this.renderLamp(lamp, config)),
              )}
              ${this.section(
                'scenes',
                'mdi:palette-outline',
                this.t('scenes_section'),
                scenes ? String(scenes) : this.t('scenes_hint'),
                () => this.renderScenes(config, model),
              )}
              ${this.section(
                'power',
                'mdi:flash',
                this.t('section_power'),
                model.hasPower
                  ? `${model.all.filter((lamp) => lamp.power).length}/${lamps.length}`
                  : this.t('no_power'),
                () => this.renderPower(config),
              )}
              ${this.section(
                'appearance',
                'mdi:creation',
                this.t('section_appearance'),
                [
                  config.show_names === false && config.show_status === false
                    ? this.t('lamp_icons_only')
                    : undefined,
                  this.t(`lamp_size_${config.size ?? 'medium'}` as EditorStringKey),
                  `${glowPercent(config.glow ?? 100) ?? 100} %`,
                ]
                  .filter(Boolean)
                  .join(' · '),
                () => this.renderAppearance(config),
              )}
              ${this.section(
                'gestures',
                'mdi:gesture-tap',
                this.t('section_gestures'),
                this.t('lamp_gestures_hint'),
                () => this.renderGestures(config),
              )}
            </div>`
          : nothing
      }
    </div>`;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .editor,
      .sections {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        flex: none;
      }
      .error {
        color: var(--error-color, #db4437);
        font-size: 13px;
      }
      .hint {
        color: var(--secondary-text-color);
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      }
      .label {
        font-size: 13px;
        font-weight: 500;
        margin: 10px 0 6px;
      }
      .section {
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
        border-radius: 12px;
        overflow: hidden;
      }
      summary {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        cursor: pointer;
        list-style: none;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      .section-title {
        font-weight: 500;
        flex: none;
      }
      summary .hint {
        flex: 1;
      }
      .chevron {
        margin-left: auto;
        transition: transform 0.2s ease;
      }
      .section[open] > summary .chevron,
      .lamp.open .chevron {
        transform: rotate(180deg);
      }
      .section-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 4px 14px 14px;
      }
      .lamp {
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.04);
      }
      .lamp.hidden .lamp-name {
        opacity: 0.55;
      }
      .lamp-head {
        appearance: none;
        border: none;
        background: none;
        color: inherit;
        font: inherit;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        cursor: pointer;
        text-align: left;
      }
      .lamp-name {
        font-weight: 500;
        flex: none;
      }
      .lamp-head .hint {
        flex: 1;
      }
      .dot {
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(var(--vivid-rgb-text), 0.08);
        color: var(--secondary-text-color);
      }
      .dot.on {
        background: rgba(255, 193, 7, 0.3);
        color: var(--amber-color, #ffc107);
      }
      .lamp-body {
        padding: 2px 10px 10px;
      }
      .switch-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 8px;
        font-size: 14px;
      }
      .scene {
        padding: 10px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.04);
      }
      .picks {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .pick {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 32px;
        padding: 0 12px;
        border-radius: 16px;
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
        background: none;
        color: var(--secondary-text-color);
        font: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .pick.on {
        border-color: transparent;
        background: rgba(255, 193, 7, 0.3);
        color: var(--primary-text-color);
      }
      .pick.on ha-icon {
        color: var(--amber-color, #ffc107);
      }
      .scene-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
      }
      .text-button {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        align-self: flex-start;
        padding: 6px 10px;
        border: none;
        border-radius: 8px;
        background: none;
        color: var(--primary-color, #03a9f4);
        font: inherit;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
      }
      .text-button.danger {
        color: var(--error-color, #db4437);
      }
    `,
  ];
}

defineElement('vivid-lamp-group-editor', VividLampGroupEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-lamp-group-editor': VividLampGroupEditor;
  }
}
