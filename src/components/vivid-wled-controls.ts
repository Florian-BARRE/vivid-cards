import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { selectOption, setNumber } from '../core/actions';
import { isAvailable } from '../core/entities';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import { localize, type StringKey } from '../i18n';
import type { WledEntities } from '../integrations/wled';
import { tokens } from './shared-styles';
import './vivid-select-chip';

interface SelectSpec {
  role: 'preset' | 'playlist' | 'palette';
  icon: string;
  label: StringKey;
}

const SELECTS: SelectSpec[] = [
  { role: 'preset', icon: 'mdi:star-outline', label: 'preset' },
  { role: 'playlist', icon: 'mdi:playlist-play', label: 'playlist' },
  { role: 'palette', icon: 'mdi:palette-outline', label: 'palette' },
];

const SLIDERS: { role: 'speed' | 'intensity'; icon: string; label: StringKey }[] = [
  { role: 'speed', icon: 'mdi:speedometer', label: 'speed' },
  { role: 'intensity', icon: 'mdi:tune-vertical-variant', label: 'intensity' },
];

/**
 * WLED controls of one strip: presets, playlists and palette pickers, effect
 * speed and intensity (while an effect runs).
 * Only what the device exposes is shown.
 */
export class VividWledControls extends LitElement {
  static override properties = {
    hass: { attribute: false },
    entities: { attribute: false },
    effectActive: { type: Boolean, attribute: 'effect-active' },
    _live: { state: true },
  };

  declare hass?: HomeAssistant;
  declare entities?: WledEntities;
  declare effectActive: boolean;
  /** Slider values while dragging, until Home Assistant reports the new state. */
  declare _live: Partial<Record<string, number>>;

  constructor() {
    super();
    this.effectActive = false;
    this._live = {};
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .controls {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }
      vivid-select-chip {
        max-width: 100%;
      }
      .range {
        display: flex;
        align-items: center;
        gap: 10px;
        height: var(--vivid-chip-height);
        padding: 0 12px;
        border-radius: calc(var(--vivid-chip-height) / 2);
        background: var(--vivid-chip-context, var(--vivid-layer-1));
        font-size: 13px;
        font-weight: 500;
      }
      .range ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
        flex: none;
        color: var(--secondary-text-color);
      }
      .range .value {
        flex: none;
        min-width: 3.2em;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      input[type='range'] {
        flex: 1;
        min-width: 0;
        margin: 0;
        height: 24px;
        background: none;
        appearance: none;
        cursor: pointer;
        --track: rgba(var(--vivid-rgb-text), 0.16);
        --fill: var(--primary-text-color);
      }
      input[type='range']:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
        border-radius: 4px;
      }
      input[type='range']::-webkit-slider-runnable-track {
        height: 6px;
        border-radius: 3px;
        background: linear-gradient(90deg, var(--fill) var(--ratio), var(--track) var(--ratio));
      }
      input[type='range']::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        margin-top: -5px;
        border-radius: 50%;
        background: var(--fill);
        box-shadow: 0 0 0 3px var(--vivid-chip-context, var(--vivid-layer-1));
      }
      input[type='range']::-moz-range-track {
        height: 6px;
        border-radius: 3px;
        background: var(--track);
      }
      input[type='range']::-moz-range-progress {
        height: 6px;
        border-radius: 3px;
        background: var(--fill);
      }
      input[type='range']::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border: none;
        border-radius: 50%;
        background: var(--fill);
      }
      input[type='range']:disabled {
        cursor: default;
        opacity: 0.45;
      }
    `,
  ];

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!changed.has('hass')) return;
    const previous = changed.get('hass');
    const live = { ...this._live };
    let dirty = false;
    for (const entityId of Object.keys(live)) {
      if (previous?.states[entityId] !== this.hass?.states[entityId]) {
        delete live[entityId];
        dirty = true;
      }
    }
    if (dirty) this._live = live;
  }

  private usable(entityId: string | undefined): entityId is string {
    return entityId !== undefined && isAvailable(this.hass?.states[entityId]);
  }

  private renderSelect(spec: SelectSpec) {
    const entityId = this.entities?.[spec.role];
    if (spec.role === 'palette' && !this.effectActive) return nothing;
    if (!this.hass || entityId === undefined) return nothing;
    const state = this.hass.states[entityId];
    const options = state?.attributes.options;
    if (!Array.isArray(options) || options.length === 0) return nothing;
    // "unknown" is a normal state here: no preset or playlist is running.
    const value = isAvailable(state) && options.includes(state.state) ? state.state : undefined;
    const label = localize(this.hass, spec.label);
    return html`<vivid-select-chip
      .icon=${spec.icon}
      .value=${value}
      .options=${options}
      .tooltip=${label}
      .placeholder=${label}
      ?disabled=${state?.state === 'unavailable'}
      @value-changed=${(event: CustomEvent<{ value: string }>) => {
        if (this.hass) void selectOption(this.hass, [entityId], event.detail.value);
      }}
    ></vivid-select-chip>`;
  }

  private renderSlider(spec: (typeof SLIDERS)[number]) {
    const entityId = this.entities?.[spec.role];
    if (!this.effectActive || !this.hass || !this.usable(entityId)) return nothing;
    const state = this.hass.states[entityId];
    const attributes = state?.attributes ?? {};
    const min = typeof attributes.min === 'number' ? attributes.min : 0;
    const max = typeof attributes.max === 'number' ? attributes.max : 255;
    const step = typeof attributes.step === 'number' ? attributes.step : 1;
    const value = this._live[entityId] ?? Number(state?.state);
    if (!Number.isFinite(value) || max <= min) return nothing;
    const ratio = (value - min) / (max - min);
    const label = localize(this.hass, spec.label);
    const percent = (raw: number) => `${Math.round(((raw - min) / (max - min)) * 100)} %`;
    return html`<label class="range" title=${label}>
      <ha-icon .icon=${spec.icon}></ha-icon>
      <input
        type="range"
        aria-label=${label}
        min=${min}
        max=${max}
        step=${step}
        .value=${String(value)}
        style=${`--ratio: ${(ratio * 100).toFixed(1)}%`}
        @input=${(event: Event) => {
          const current = Number((event.target as HTMLInputElement).value);
          this._live = { ...this._live, [entityId]: current };
        }}
        @change=${(event: Event) => {
          if (this.hass)
            void setNumber(this.hass, entityId, Number((event.target as HTMLInputElement).value));
        }}
      />
      <span class="value">${percent(value)}</span>
    </label>`;
  }

  protected override render() {
    if (!this.entities) return nothing;
    const selects = SELECTS.map((spec) => this.renderSelect(spec)).filter(
      (part) => part !== nothing,
    );
    const sliders = SLIDERS.map((spec) => this.renderSlider(spec)).filter(
      (part) => part !== nothing,
    );
    if (selects.length === 0 && sliders.length === 0) return nothing;
    return html`<div class="controls">
      ${selects.length ? html`<div class="row">${selects}</div>` : nothing} ${sliders}
    </div>`;
  }
}

defineElement('vivid-wled-controls', VividWledControls);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-wled-controls': VividWledControls;
  }
}
