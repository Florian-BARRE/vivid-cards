import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { fireEvent } from '../../core/actions';
import { GLOW_SLIDER, tintTone } from '../../core/glow';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import { localize } from '../../i18n';
import '../../components/vivid-source-row';
import '../../components/vivid-order-picker';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import { tokens } from '../../components/shared-styles';
import {
  AMB_INFO,
  DEFAULT_AMB_INFO,
  DEFAULT_PREFIX,
  INPUT_COUNT,
  LAYOUTS,
  SOURCE_DISPLAYS,
  entityMap,
  resolveAmbilightConfig,
  type AmbilightCardConfig,
  type AmbilightInputConfig,
} from './config';
import { HYPERHDR_INTEGRATION, hubIcon } from '../hyperhdr/model';
import { buildAmbilightModel, hyperhdrLink, type HyperHdrLink } from './model';
import { AMBER, GREEN, GREY, RED, celsius, linkView, sourceLabels } from './view';
import { MANAGER_INTEGRATION, boxDevice, coverage, lookupDevices } from './devices';
import { sourceSection, type SourceChoice } from '../../components/editor/source-section';
import '../../components/editor/vivid-editor-section';
import '../../components/editor/vivid-device-entities-editor';

/** The config with its `entities` map replaced (left out when empty). */
function withEntities(
  config: AmbilightCardConfig,
  entities?: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...config };
  if (entities) next.entities = entities;
  else delete next.entities;
  return next;
}

type FormData = Record<string, unknown>;
type Schema = Record<string, unknown>[];

/** Missing entities listed in the editor before "…". */
const MISSING_SHOWN = 4;

/**
 * Visual editor: the Ambilight Manager device (ESPHome), whose entities are
 * found from it and checked, then the names and icons of the HDMI inputs and
 * a few options.
 */
export class VividAmbilightCardEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _open: { state: true },
    _input: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: AmbilightCardConfig;
  declare _open: Set<string>;
  /** Input edited in the inputs section. */
  declare _input: number;

  constructor() {
    super();
    this._open = new Set(['header']);
    this._input = 0;
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
      .status {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin: -4px 0 4px;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.05);
        font-size: 12.5px;
        line-height: 1.4;
        color: var(--secondary-text-color);
      }
      .status ha-icon {
        --mdc-icon-size: 16px;
        margin-top: 1px;
      }
      .status.ok ha-icon {
        color: var(--success-color, #43a047);
      }
      .status.warn ha-icon {
        color: var(--warning-color, #ffa000);
      }
      .status b {
        color: var(--primary-text-color);
        font-weight: 500;
      }
      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
      }
      .hint-line {
        font-size: 12.5px;
        color: var(--secondary-text-color);
      }
      /* The two devices, joined by their link. */
      .chain {
        display: flex;
        flex-direction: column;
      }
      .chain > .status {
        margin: 8px 0 0;
      }
      .tile {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border-radius: 16px;
        background: rgba(var(--vivid-rgb-text), 0.04);
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
      }
      .tile-head {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }
      .disc {
        display: grid;
        place-items: center;
        flex: none;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: var(--disc-bg, rgba(var(--vivid-rgb-text), 0.07));
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color, var(--secondary-text-color));
      }
      .disc ha-icon {
        --mdc-icon-size: 22px;
      }
      .tile-names {
        display: flex;
        flex-direction: column;
        min-width: 0;
        line-height: 1.3;
      }
      .tile-names small {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--secondary-text-color);
      }
      .tile-names b {
        font-size: 15px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .facts {
        display: flex;
        flex-wrap: wrap;
        gap: 0 6px;
        font-size: 12.5px;
        color: var(--secondary-text-color);
      }
      .facts i {
        font-style: normal;
        opacity: 0.6;
      }
      .warn {
        color: var(--warning-color, #ffa000);
      }
      .link {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 10px 12px 10px 15px;
        font-size: 12.5px;
        line-height: 1.4;
        color: var(--secondary-text-color);
      }
      /* The wire from one tile to the other, through the state dot. */
      .link::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 32px;
        width: 2px;
        border-radius: 1px;
        background: var(--link-color, var(--divider-color, rgba(255, 255, 255, 0.12)));
        opacity: 0.6;
      }
      .link.ok {
        --link-color: var(--success-color, #66bb6a);
      }
      .link.warn {
        --link-color: var(--warning-color, #ffa000);
        color: var(--secondary-text-color);
      }
      .link-dot {
        position: relative;
        display: grid;
        place-items: center;
        flex: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--disc-bg);
        box-shadow: var(--disc-shadow, none);
        color: var(--disc-color);
      }
      .link-dot ha-icon {
        --mdc-icon-size: 18px;
      }
      .link-text {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
        padding-top: 8px;
      }
      .link-text b {
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .link-text pre {
        margin: 0;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(var(--vivid-rgb-text), 0.06);
        color: var(--primary-text-color);
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        user-select: all;
      }
    `,
  ];

  setConfig(config: AmbilightCardConfig): void {
    this._config = config;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void ensureHaForm().then(() => this.requestUpdate());
  }

  private t(key: EditorStringKey, values?: Record<string, string | number>): string {
    return editorText(this.hass, key, values);
  }

  private commit(next: Record<string, unknown>): void {
    const config = next as AmbilightCardConfig;
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

  /** A folding section, the same component as every other card editor. */
  private section(id: string, icon: string, title: string, hint: string, body: () => unknown) {
    const open = this._open.has(id);
    return html`<vivid-editor-section
      .icon=${icon}
      .heading=${title}
      .hint=${hint}
      .open=${open}
      @section-toggle=${(event: CustomEvent<{ open: boolean }>) => {
        const next = new Set(this._open);
        if (event.detail.open) next.add(id);
        else next.delete(id);
        this._open = next;
      }}
      >${open ? body() : nothing}</vivid-editor-section
    >`;
  }

  private status(kind: 'ok' | 'warn' | 'info', content: unknown) {
    const icon =
      kind === 'ok'
        ? 'mdi:check-circle-outline'
        : kind === 'warn'
          ? 'mdi:alert-outline'
          : 'mdi:information-outline';
    return html`<div class="status ${kind}">
      <ha-icon .icon=${icon}></ha-icon><span>${content}</span>
    </div>`;
  }

  /* --------------------------------- devices -------------------------------- */

  private picker(config: AmbilightCardConfig, key: 'device' | 'hyperhdr') {
    const selector =
      key === 'device'
        ? { device: { integration: MANAGER_INTEGRATION } }
        : {
            device: {
              filter: { integration: HYPERHDR_INTEGRATION },
              entity: { domain: 'binary_sensor' },
            },
          };
    return this.form(
      [{ name: key, selector }],
      { [key]: config[key] ?? '' },
      (value) => {
        const next: Record<string, unknown> = { ...config };
        const text = typeof value[key] === 'string' ? (value[key] as string).trim() : '';
        if (text) next[key] = text;
        else delete next[key];
        // A device picked here replaces the prefix the YAML pointed at.
        if (key === 'device' && next.device !== config.device) delete next.prefix;
        this.commit(next);
      },
      { device: this.t('amb_device'), hyperhdr: this.t('amb_hyperhdr') },
      { hyperhdr: this.t('amb_hyperhdr_helper') },
    );
  }

  /** A device as a tile: its icon lit by its state, its name, what the card sees of it. */
  private tile(
    icon: string,
    rgb: Rgb | undefined,
    title: string,
    name: string | undefined,
    facts: unknown[],
    picker: TemplateResult,
  ) {
    const tone = rgb ? tintTone(rgb, 0.7) : undefined;
    return html`<div class="tile">
      <div class="tile-head">
        <span
          class="disc"
          style=${styleMap({
            '--disc-bg': tone?.background,
            '--disc-shadow': tone?.shadow,
            '--disc-color': tone?.iconColor,
          })}
          ><ha-icon .icon=${icon}></ha-icon
        ></span>
        <span class="tile-names"
          ><small>${title}</small><b>${name ?? '—'}</b
          ><span class="facts"
            >${facts
              .filter((fact) => fact !== undefined && fact !== '')
              .map(
                (fact, index) => html`${index ? html`<i>·</i>` : nothing}<span>${fact}</span>`,
              )}</span
          ></span
        >
      </div>
      ${picker}
    </div>`;
  }

  /** Automatic unless a device, a prefix or entities are written by hand. */
  private source(config: AmbilightCardConfig): SourceChoice {
    return config.device || config.prefix || config.entities ? 'manual' : 'device';
  }

  /** Source: the box found automatically, or picked by hand with each of its entities. */
  private renderSource(config: AmbilightCardConfig) {
    const hass = this.hass;
    if (!hass) return nothing;
    const source = this.source(config);
    const resolved = resolveAmbilightConfig(config, lookupDevices(hass, config));
    const model = buildAmbilightModel(hass, resolved);
    const { found, total, missing } = coverage(hass, resolved.entities);
    const deviceId = boxDevice(hass, config);
    const device = deviceId ? hass.devices?.[deviceId] : undefined;
    const boxName = (device ? device.name_by_user || device.name : config.prefix) ?? undefined;
    const known = Boolean(deviceId || config.prefix);
    const boxRgb = !known ? undefined : !model.online ? RED : missing.length ? AMBER : GREEN;
    const boxFacts: unknown[] = known
      ? [
          localize(hass, model.online ? 'amb_online_short' : 'amb_offline'),
          html`<span class=${missing.length ? 'warn' : ''}
            >${localize(hass, 'amb_entities', { found, total })}</span
          >`,
        ]
      : [this.t('amb_no_box')];
    const missingLine = missing.length
      ? this.status(
          'warn',
          html`${this.t('amb_missing', { list: '' })}<span class="mono"
              >${missing.slice(0, MISSING_SHOWN).join(', ')}${
                missing.length > MISSING_SHOWN ? ` … (+${missing.length - MISSING_SHOWN})` : ''
              }</span
            >`,
        )
      : config.prefix
        ? this.status(
            'info',
            html`${this.t('amb_yaml_prefix', { prefix: '' })}<span class="mono"
                >${config.prefix}</span
              >`,
          )
        : nothing;
    const content = html`<div class="chain">
      ${this.tile(
        'mdi:fan',
        boxRgb,
        localize(hass, 'amb_box'),
        boxName,
        boxFacts,
        source === 'manual' ? this.picker(config, 'device') : html``,
      )}
      ${missingLine}
      ${
        source === 'manual'
          ? html`<vivid-device-entities-editor
              .hass=${hass}
              .keys=${Object.entries(
                entityMap(config.prefix || lookupDevices(hass, config).prefix || DEFAULT_PREFIX),
              ).map(([key, entity]) => ({ key, entity }))}
              .entities=${config.entities as Record<string, unknown> | undefined}
              .device=${boxName ?? ''}
              @entities-changed=${(event: CustomEvent<{ value?: Record<string, unknown> }>) =>
                this.commit(withEntities(config, event.detail.value))}
            ></vivid-device-entities-editor>`
          : nothing
      }
    </div>`;
    return sourceSection({
      hass,
      choices: ['device', 'manual'],
      source,
      hint: boxName,
      onSource: (next) => {
        const config2: Record<string, unknown> = { ...config };
        delete config2.device;
        delete config2.prefix;
        delete config2.entities;
        // Manual starts from the box found, so its entities show at once.
        if (next === 'manual' && deviceId) config2.device = deviceId;
        this.commit(config2);
      },
      content,
    });
  }

  /** The HyperHDR server the Pi runs, and the link with the box. */
  private renderPi(config: AmbilightCardConfig) {
    const hass = this.hass;
    if (!hass) return nothing;
    const resolved = resolveAmbilightConfig(config, lookupDevices(hass, config));
    const model = buildAmbilightModel(hass, resolved);
    const hub = model.hub;
    const link = hyperhdrLink(hass, model);
    const hubRgb = !hub ? undefined : hub.connected ? GREEN : GREY;
    const hubFacts: unknown[] = hub
      ? [
          localize(hass, hub.connected ? 'amb_hh_connected' : 'amb_hh_away'),
          hub.temperature === undefined || !hub.connected
            ? undefined
            : `${localize(hass, 'amb_cpu')} ${celsius(hass, hub.temperature, 0)}`,
        ]
      : [localize(hass, 'amb_link_none')];
    return html`${this.form(
        [
          {
            type: 'grid',
            name: '',
            schema: [
              { name: 'show_pi', selector: { boolean: {} } },
              { name: 'confirm_pi_off', selector: { boolean: {} } },
            ],
          },
        ],
        { show_pi: resolved.showPi, confirm_pi_off: config.confirm_pi_off !== false },
        (value) => {
          const next: Record<string, unknown> = { ...config };
          for (const key of ['show_pi', 'confirm_pi_off'] as const) {
            if (value[key] === false) next[key] = false;
            else delete next[key];
          }
          this.commit(next);
        },
        { show_pi: this.t('amb_show_pi'), confirm_pi_off: this.t('amb_confirm_pi') },
      )}
      <div class="chain">
        ${this.renderLink(link)}
        ${this.tile(
          hub ? hubIcon(hub) : 'mdi:raspberry-pi',
          hubRgb,
          localize(hass, 'amb_hyperhdr_server'),
          hub?.name,
          hubFacts,
          this.picker(config, 'hyperhdr'),
        )}
      </div>`;
  }

  /** The link between the two tiles, and what to fix when it does not work. */
  private renderLink(link: HyperHdrLink) {
    const hass = this.hass;
    const view = linkView(link.state);
    const tone = tintTone(view.rgb, 0.6);
    const yaml = [
      ['hyperhdr_connected', link.ids.connected],
      ['hyperhdr_cpu_temperature', link.ids.cpuTemperature],
      ['hyperhdr_power_off', link.ids.powerOff],
    ].filter((line): line is [string, string] => line[1] !== undefined);
    return html`<div class=${`link ${view.kind}`}>
      <span
        class="link-dot"
        style=${styleMap({
          '--disc-bg': tone.background,
          '--disc-shadow': tone.shadow,
          '--disc-color': tone.iconColor,
        })}
        ><ha-icon .icon=${view.icon}></ha-icon
      ></span>
      <div class="link-text">
        <b>${localize(hass, view.label)}</b>
        ${
          link.state === 'unseen'
            ? html`<span>${localize(hass, 'amb_link_unseen_hint')}</span>
                <pre class="mono">
substitutions:
${yaml.map(([key, id]) => `  ${key}: ${id}`).join('\n')}</pre>
                <span>${localize(hass, 'amb_link_unseen_after')}</span>`
            : nothing
        }
        ${
          link.noPowerOff
            ? html`<span class="warn">${localize(hass, 'amb_link_nopoweroff')}</span>`
            : nothing
        }
      </div>
    </div>`;
  }

  /* ---------------------------------- inputs -------------------------------- */

  private renderInputs(config: AmbilightCardConfig) {
    const hass = this.hass;
    const inputs = resolveAmbilightConfig(config).inputs;
    const index = Math.min(this._input, INPUT_COUNT - 1);
    const n = index + 1;
    const raw = config.inputs?.[index];
    const value: AmbilightInputConfig = typeof raw === 'string' ? { name: raw } : (raw ?? {});
    const preview = html`<vivid-source-row
      .items=${inputs.map((input) => ({ name: input.name, icon: input.icon, available: true }))}
      .active=${index}
      .labels=${sourceLabels(hass)}
      @vivid-source-select=${(event: CustomEvent<{ index: number }>) => {
        event.stopPropagation();
        this._input = event.detail.index;
      }}
    ></vivid-source-row>`;
    const form = this.form(
      [
        {
          type: 'grid',
          name: '',
          schema: [
            { name: 'name', selector: { text: {} } },
            { name: 'icon', selector: { icon: { placeholder: 'mdi:video-input-hdmi' } } },
          ],
        },
        { name: 'hidden', selector: { boolean: {} } },
      ],
      { name: value.name ?? '', icon: value.icon ?? '', hidden: value.hidden === true },
      (changed) => {
        const text = (key: string) =>
          typeof changed[key] === 'string' ? (changed[key] as string).trim() : '';
        const list: AmbilightInputConfig[] = Array.from({ length: INPUT_COUNT }, (_, i) => {
          const item = config.inputs?.[i];
          return typeof item === 'string' ? { name: item } : { ...(item ?? {}) };
        });
        const name = text('name');
        const icon = text('icon');
        list[index] = {
          ...(name ? { name } : {}),
          ...(icon ? { icon } : {}),
          ...(changed.hidden === true ? { hidden: true } : {}),
        };
        while (list.length && Object.keys(list[list.length - 1] ?? {}).length === 0) list.pop();
        const next: Record<string, unknown> = { ...config };
        if (list.length) next.inputs = list;
        else delete next.inputs;
        this.commit(next);
      },
      {
        name: this.t('amb_input_name', { n }),
        icon: this.t('amb_input_icon', { n }),
        hidden: this.t('amb_input_hidden'),
      },
    );
    return html`<div class="hint-line">${this.t('amb_inputs_pick')}</div>
      ${preview}${form}`;
  }

  /* --------------------------------- options -------------------------------- */

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

  /** The top of the card: name, layout, its state line and the values beside it. */
  private renderHeader(config: AmbilightCardConfig) {
    const resolved = resolveAmbilightConfig(config);
    const look = this.form(
      [
        { name: 'name', selector: { text: {} } },
        { name: 'layout', selector: this.choice(LAYOUTS, 'amb_layout_') },
        { name: 'show_status', selector: { boolean: {} } },
      ],
      { name: config.name ?? '', layout: resolved.layout, show_status: resolved.showStatus },
      (value) => {
        const next: Record<string, unknown> = { ...config };
        const name = typeof value.name === 'string' ? value.name.trim() : '';
        if (name) next.name = name;
        else delete next.name;
        if (value.layout === 'tiles') next.layout = 'tiles';
        else delete next.layout;
        if (value.show_status === false) next.show_status = false;
        else delete next.show_status;
        this.commit(next);
      },
      {
        name: editorText(this.hass, 'name'),
        layout: this.t('amb_layout'),
        show_status: this.t('amb_show_status'),
      },
    );
    const info = html`<vivid-order-picker
      .items=${AMB_INFO.map((value) => ({
        value,
        label: this.t(`amb_info_${value}` as EditorStringKey),
        icon: INFO_ICONS[value],
      }))}
      .value=${resolved.info}
      .label=${this.t('amb_info')}
      .helper=${this.t('amb_info_helper')}
      @value-changed=${(event: CustomEvent<{ value: string[] }>) => {
        event.stopPropagation();
        const next: Record<string, unknown> = { ...config };
        const value = event.detail.value;
        const same =
          value.length === DEFAULT_AMB_INFO.length &&
          value.every((item, index) => item === DEFAULT_AMB_INFO[index]);
        if (same) delete next.info;
        else next.info = value;
        this.commit(next);
      }}
    ></vivid-order-picker>`;
    return html`${look}${info}`;
  }

  /** How the input menu shows the active input (one-line layout). */
  private renderInputDisplay(config: AmbilightCardConfig) {
    const resolved = resolveAmbilightConfig(config);
    if (resolved.layout !== 'line') return nothing;
    return this.form(
      [{ name: 'source_display', selector: this.choice(SOURCE_DISPLAYS, 'amb_display_') }],
      { source_display: resolved.sourceDisplay },
      (value) => {
        const next: Record<string, unknown> = { ...config };
        if (value.source_display === 'icon' || value.source_display === 'name')
          next.source_display = value.source_display;
        else delete next.source_display;
        this.commit(next);
      },
      { source_display: this.t('amb_source_display') },
    );
  }

  /** What the details window counts. */
  private renderDetails(config: AmbilightCardConfig) {
    return this.form(
      [{ name: 'send_counter_entity', selector: { entity: { domain: 'sensor' } } }],
      { send_counter_entity: config.send_counter_entity ?? '' },
      (value) => {
        const next: Record<string, unknown> = { ...config };
        const counter =
          typeof value.send_counter_entity === 'string' ? value.send_counter_entity.trim() : '';
        if (counter) next.send_counter_entity = counter;
        else delete next.send_counter_entity;
        this.commit(next);
      },
      { send_counter_entity: this.t('amb_counter') },
      { send_counter_entity: this.t('amb_counter_helper') },
    );
  }

  private renderLook(config: AmbilightCardConfig) {
    return this.form(
      [{ name: 'glow', selector: GLOW_SLIDER }],
      { glow: config.glow ?? 100 },
      (value) => {
        const next: Record<string, unknown> = { ...config };
        if (typeof value.glow === 'number' && value.glow !== 100) next.glow = value.glow;
        else delete next.glow;
        this.commit(next);
      },
      { glow: this.t('amb_halo') },
    );
  }

  /**
   * The sections follow the card from top to bottom: source, header, HDMI
   * inputs, Raspberry Pi, details window, look.
   */
  protected override render() {
    const config = this._config;
    if (!config) return nothing;
    const resolved = resolveAmbilightConfig(config);
    return html`<div class="editor">
      ${this.renderSource(config)}
      ${this.section(
        'header',
        'mdi:page-layout-header',
        this.t('amb_section_header'),
        config.name ?? this.t(`amb_layout_${resolved.layout}` as EditorStringKey),
        () => this.renderHeader(config),
      )}
      ${this.section(
        'inputs',
        'mdi:video-input-hdmi',
        this.t('amb_inputs'),
        this.t('amb_inputs_hint'),
        () => html`${this.renderInputDisplay(config)}${this.renderInputs(config)}`,
      )}
      ${this.section(
        'pi',
        'mdi:raspberry-pi',
        this.t('amb_section_pi'),
        this.t('amb_section_pi_hint'),
        () => this.renderPi(config),
      )}
      ${this.section(
        'details',
        'mdi:dock-window',
        this.t('section_details'),
        this.t('amb_section_details_hint'),
        () => this.renderDetails(config),
      )}
      ${this.section(
        'look',
        'mdi:palette-swatch-outline',
        this.t('section_appearance'),
        `${this.t('amb_halo')} : ${config.glow ?? 100} %`,
        () => this.renderLook(config),
      )}
    </div>`;
  }
}

const INFO_ICONS: Record<string, string> = {
  temperature: 'mdi:thermometer-auto',
  box: 'mdi:thermometer',
  cpu: 'mdi:cpu-64-bit',
  fan: 'mdi:fan',
  humidity: 'mdi:water-percent',
  pressure: 'mdi:gauge',
  rpm: 'mdi:rotate-right',
};

defineElement('vivid-ambilight-card-editor', VividAmbilightCardEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-ambilight-card-editor': VividAmbilightCardEditor;
  }
}
