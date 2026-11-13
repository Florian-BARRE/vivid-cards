import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { fireEvent } from '../../core/actions';
import { ensureHaForm } from '../../core/ha-elements';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import type { AmbilightInputConfig } from '../ambilight/config';
import '../ambilight/vivid-hdmi-inputs-editor';
import { deviceName, findDevices } from '../hyperhdr/model';
import { buildAmbilightSide, findBoxes } from './ambilight-link';
import type { LedGroupCardConfig, ResolvedLedGroupConfig } from './config';
import { memberOverride, setOption, updateMember } from './editor-model';
import type { LedGroupModel } from './model';

type FormData = Record<string, unknown>;
type FormSchema = Record<string, unknown>;

/** Select value of "no box": HyperHDR drives the strips alone. */
const NO_BOX = 'none';
/** Select value of "find it": the only box there is, or the only server. */
const AUTO = 'auto';

/**
 * The Ambilight part of the LED group editor. Off by default: most strips
 * have no TV behind them. Switched on, it asks for the Ambilight box and the
 * HyperHDR server, then shows everything that goes with them: the Ambilight
 * button, the strips that follow the screen and the HDMI inputs of the box.
 *
 * Emits `config-changed` with `{ config }`, the whole card config.
 */
export class VividLedAmbilightEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    config: { attribute: false },
    resolved: { attribute: false },
    model: { attribute: false },
  };

  declare hass?: HomeAssistant;
  declare config: LedGroupCardConfig;
  declare resolved: ResolvedLedGroupConfig;
  declare model: LedGroupModel;

  override connectedCallback(): void {
    super.connectedCallback();
    void ensureHaForm();
  }

  private t(key: EditorStringKey, values?: Record<string, string | number>): string {
    return editorText(this.hass, key, values);
  }

  private commit(config: LedGroupCardConfig): void {
    fireEvent(this, 'config-changed', { config });
  }

  private form(
    schema: FormSchema[],
    data: FormData,
    onChange: (value: FormData) => void,
    labels: Record<string, string>,
    helpers: Record<string, string> = {},
  ): TemplateResult {
    return html`<ha-form
      .hass=${this.hass}
      .data=${data}
      .schema=${schema}
      .computeLabel=${(field: { name: string }) => labels[field.name] ?? field.name}
      .computeHelper=${(field: { name: string }) => helpers[field.name]}
      @value-changed=${(event: CustomEvent<{ value: FormData }>) => {
        event.stopPropagation();
        onChange(event.detail.value);
      }}
    ></ha-form>`;
  }

  private boxName(id: string): string {
    const device = this.hass?.devices?.[id];
    return device?.name_by_user || device?.name || id;
  }

  /**
   * On: Ambilight on, with the box written down when there is only one, so the
   * card shows what it uses. Off: every Ambilight option goes away.
   */
  private setEnabled(enabled: boolean): void {
    const next = { ...this.config };
    delete next.ambilight;
    if (!enabled) {
      this.commit(next);
      return;
    }
    const boxes = this.hass ? findBoxes(this.hass) : [];
    next.ambilight = { enabled: true, ...(boxes.length === 1 ? { box: boxes[0] } : {}) };
    this.commit(next);
  }

  /** The box, the HyperHDR server and the two behaviours of the button. */
  private renderLink(hass: HomeAssistant): TemplateResult {
    const ambilight = this.resolved.ambilight;
    const boxes = findBoxes(hass);
    const servers = findDevices(hass).servers;
    const option = ambilight.box;
    const box = option === false ? NO_BOX : (option ?? AUTO);
    const boxChoices = [
      { value: AUTO, label: this.t('box_auto') },
      ...boxes.map((id) => ({ value: id, label: this.boxName(id) })),
      ...(typeof option === 'string' && !boxes.includes(option)
        ? [{ value: option, label: option }]
        : []),
      { value: NO_BOX, label: this.t('amb_led_no_box') },
    ];
    const serverChoices = [
      { value: AUTO, label: this.t('box_auto') },
      ...servers.map((id) => ({ value: id, label: deviceName(hass, id) })),
    ];
    const select = (options: { value: string; label: string }[]) => ({
      select: { mode: 'dropdown', options },
    });
    return this.form(
      [
        { name: 'box', selector: select(boxChoices) },
        { name: 'hyperhdr', selector: select(serverChoices) },
        { name: 'button', selector: { boolean: {} } },
        ...(box === NO_BOX ? [] : [{ name: 'confirm_off', selector: { boolean: {} } }]),
      ],
      {
        box,
        hyperhdr: ambilight.hyperhdr ?? AUTO,
        button: ambilight.button,
        confirm_off: ambilight.confirmOff,
      },
      (value) => {
        const chosen = value.box === AUTO ? undefined : value.box === NO_BOX ? false : value.box;
        let next = setOption(this.config, 'ambilight', 'box', chosen);
        next = setOption(
          next,
          'ambilight',
          'hyperhdr',
          value.hyperhdr === AUTO ? undefined : value.hyperhdr,
        );
        next = setOption(next, 'ambilight', 'button', value.button, true);
        next = setOption(next, 'ambilight', 'confirm_off', value.confirm_off, true);
        // `enabled` stays written: with no box chosen it is what keeps Ambilight on.
        next = setOption(next, 'ambilight', 'enabled', true);
        this.commit(next);
      },
      {
        box: this.t('box'),
        hyperhdr: this.t('box_hyperhdr'),
        button: this.t('ambilight_button'),
        confirm_off: this.t('box_confirm_off'),
      },
      {
        box: this.t('amb_led_box_helper'),
        hyperhdr: this.t('amb_led_hyperhdr_helper'),
        button: this.t('amb_led_button_helper'),
      },
    );
  }

  /** The strips that follow the screen (they have a WLED live override). */
  private renderStrips(): TemplateResult | typeof nothing {
    const strips = this.model.detected.filter((strip) => strip.liveOverride);
    if (!this.model.isGroup || strips.length === 0) return nothing;
    const labels = Object.fromEntries(strips.map((strip, i) => [`s${i}`, strip.name]));
    return html`<div class="label">${this.t('amb_led_strips')}</div>
      ${this.form(
        strips.map((_, i) => ({ name: `s${i}`, selector: { boolean: {} } })),
        Object.fromEntries(
          strips.map((strip, i) => [
            `s${i}`,
            memberOverride(this.config, strip.entityId)?.ambilight !== false,
          ]),
        ),
        (value) => {
          let next = this.config;
          strips.forEach((strip, i) => {
            next = updateMember(next, strip.entityId, { ambilight: value[`s${i}`] === true });
          });
          this.commit(next);
        },
        labels,
      )}`;
  }

  /** The HDMI inputs of the box, named as on the Ambilight card. */
  private renderInputs(): TemplateResult | typeof nothing {
    if (this.resolved.ambilight.box === false) return nothing;
    return html`<div class="label">${this.t('amb_inputs')}</div>
      <vivid-hdmi-inputs-editor
        .hass=${this.hass}
        .inputs=${this.config.ambilight?.inputs}
        @inputs-changed=${(event: CustomEvent<{ inputs?: AmbilightInputConfig[] }>) => {
          event.stopPropagation();
          this.commit(setOption(this.config, 'ambilight', 'inputs', event.detail.inputs));
        }}
      ></vivid-hdmi-inputs-editor>`;
  }

  /** What the card found: the box and how many strips follow the screen now. */
  private renderFound(hass: HomeAssistant): TemplateResult {
    const side = buildAmbilightSide(hass, this.resolved, this.model);
    const found = side
      ? 'device' in side.target
        ? this.boxName(side.target.device)
        : side.target.prefix
      : undefined;
    const driven = side?.drive.driven.length ?? 0;
    const parts = [
      this.resolved.ambilight.box === false
        ? this.t('amb_led_no_box')
        : found
          ? this.t('box_found', { name: found })
          : this.t('box_none'),
      ...(driven > 0 ? [this.t('box_driven', { count: driven })] : []),
    ];
    return html`<div class="hint">${parts.join(' · ')}</div>`;
  }

  protected override render() {
    const hass = this.hass;
    if (!hass || !this.config || !this.resolved || !this.model) return nothing;
    const enabled = this.resolved.ambilight.enabled;
    const toggle = this.form(
      [{ name: 'enabled', selector: { boolean: {} } }],
      { enabled },
      (value) => this.setEnabled(value.enabled === true),
      { enabled: this.t('amb_led_enabled') },
      { enabled: this.t('amb_led_enabled_helper') },
    );
    if (!enabled) return toggle;
    return html`${toggle}${this.renderFound(hass)}${this.renderLink(hass)}${this.renderStrips()}${this.renderInputs()}`;
  }

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .label {
      font-weight: 500;
      font-size: 14px;
      margin-top: 4px;
    }
    .hint {
      color: var(--secondary-text-color);
      font-size: 12px;
      line-height: 1.4;
    }
  `;
}

defineElement('vivid-led-ambilight-editor', VividLedAmbilightEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-led-ambilight-editor': VividLedAmbilightEditor;
  }
}
