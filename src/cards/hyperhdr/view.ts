import { css, html, nothing, unsafeCSS } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { rgbCss } from '../../core/color';
import { glowShadow, glowSize, tintTone } from '../../core/glow';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import { localize } from '../../i18n';
import { fixed } from '../ambilight/view';
import {
  TEMP_ALARM,
  TEMP_WARN,
  type HubModel,
  type InstanceModel,
  GREEN,
  ORANGE,
  RED,
} from './model';

export { fixed };

export function sourceText(hass: HomeAssistant | undefined, model: InstanceModel): string {
  switch (model.source) {
    case 'capture':
      return localize(hass, 'hh_capture');
    case 'effect':
      return model.effect ?? localize(hass, 'hh_effect');
    case 'color':
      return localize(hass, 'hh_color');
    case 'none':
      return localize(hass, 'hh_none');
    default:
      return localize(hass, 'hh_other');
  }
}

/** "Capture · 78 % · 58 fps", or "Off". */
export function instanceStatus(hass: HomeAssistant | undefined, model: InstanceModel): string {
  if (!model.available) return localize(hass, 'unavailable');
  if (!model.on) return localize(hass, 'off');
  return [
    sourceText(hass, model),
    model.brightness === undefined ? undefined : `${fixed(hass, model.brightness, 0)}\u00a0%`,
    model.outputFps === undefined
      ? undefined
      : localize(hass, 'hh_fps', { n: fixed(hass, model.outputFps, 0) }),
  ]
    .filter(Boolean)
    .join(' · ');
}

export type Tone = 'plain' | 'warn' | 'alarm';

/** "22.0.0 · 2 strips on", or the problem of the hub. */
export function hubStatus(
  hass: HomeAssistant | undefined,
  hub: HubModel,
  instances: InstanceModel[],
): { text: string; tone: Tone } {
  if (hub.health === 'offline') return { text: localize(hass, 'hh_offline'), tone: 'alarm' };
  if (hub.undervoltage) return { text: localize(hass, 'hh_undervoltage_detected'), tone: 'alarm' };
  if ((hub.temperature ?? 0) >= TEMP_WARN) {
    return { text: localize(hass, 'hh_hot'), tone: hub.health === 'alarm' ? 'alarm' : 'warn' };
  }
  const on = instances.filter((item) => item.on).length;
  const strips =
    instances.length === 0
      ? undefined
      : on === 0
        ? localize(hass, 'hh_strips_none')
        : on === 1
          ? localize(hass, 'hh_strips_one')
          : localize(hass, 'hh_strips_other', { count: on });
  return { text: [hub.version, strips].filter(Boolean).join(' · '), tone: 'plain' };
}

export function temperatureRgb(value: number | undefined): Rgb {
  if (value === undefined) return GREEN;
  return value >= TEMP_ALARM ? RED : value >= TEMP_WARN ? ORANGE : GREEN;
}

/** The label of a select option in the user's language, as Home Assistant translates it. */
export function optionLabel(
  hass: HomeAssistant | undefined,
  entityId: string,
  option: string,
): string {
  const state = hass?.states[entityId];
  if (state && hass?.formatEntityState) {
    try {
      return hass.formatEntityState(state, option);
    } catch {
      // Older Home Assistant: the raw option.
    }
  }
  return option;
}

/** A disc with an icon, tinted and glowing when `rgb` is set. */
export function disc(icon: string, rgb: Rgb | undefined, level = 0.85, extra = '') {
  const tone = rgb ? tintTone(rgb, level) : undefined;
  return html`<span
    class="disc ${extra}"
    style=${styleMap({
      '--disc-bg': tone?.background,
      '--disc-shadow': tone?.shadow,
      '--disc-color': tone?.iconColor,
    })}
    ><ha-icon .icon=${icon}></ha-icon
  ></span>`;
}

/** Background and halo of a power button lit with `colors`. */
export function powerStyle(
  colors: Rgb[] | undefined,
  on: boolean,
): Record<string, string | undefined> {
  if (!on || !colors?.length) return {};
  const first = colors[0] as Rgb;
  const last = colors[colors.length - 1] ?? first;
  return {
    '--power-bg': `linear-gradient(90deg, ${rgbCss(first)}, ${rgbCss(last)})`,
    '--power-shadow': glowShadow([first, last], 0.9),
    '--power-color': '#fff',
  };
}

export function chip(
  icon: string,
  label: string,
  options: {
    rgb?: Rgb;
    on?: boolean;
    disabled?: boolean;
    title?: string;
    onClick?: () => void;
    caret?: boolean;
  } = {},
) {
  const { rgb, on = false, disabled = false, onClick, caret = false } = options;
  const tone = on && rgb ? rgb : undefined;
  return html`<button
    type="button"
    class=${classMap({ reset: true, chip: true, on: !!tone })}
    style=${styleMap({ '--chip-rgb': tone ? tone.join(', ') : undefined })}
    title=${options.title ?? label}
    aria-pressed=${onClick && !caret ? (on ? 'true' : 'false') : nothing}
    ?disabled=${disabled}
    @click=${onClick}
  >
    <ha-icon .icon=${icon}></ha-icon><span>${label}</span>${
      caret ? html`<ha-icon class="caret" icon="mdi:chevron-down"></ha-icon>` : nothing
    }
  </button>`;
}

/** Styles shared by the card and its details. */
export const hyperhdrStyles = css`
  .disc {
    position: relative;
    display: grid;
    place-items: center;
    flex: none;
    --vivid-glow-size: ${unsafeCSS(glowSize(40))};
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--disc-bg, var(--vivid-layer-2));
    box-shadow: var(--disc-shadow, none);
    color: var(--disc-color, var(--secondary-text-color));
    transition:
      background 0.4s ease,
      box-shadow 0.4s ease,
      color 0.4s ease;
  }
  .disc ha-icon {
    --mdc-icon-size: 22px;
    display: inline-flex;
  }
  .disc.small {
    --vivid-glow-size: ${unsafeCSS(glowSize(34))};
    width: 34px;
    height: 34px;
  }
  .disc.small ha-icon {
    --mdc-icon-size: 19px;
  }
  .names {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-width: 0;
    text-align: left;
  }
  .name {
    font-size: 15px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .status {
    font-size: 12px;
    color: var(--secondary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .status.alarm {
    color: var(--error-color, #ef5350);
    font-weight: 600;
  }
  .status.warn {
    color: var(--warning-color, #f9a825);
    font-weight: 600;
  }
  .power {
    display: grid;
    place-items: center;
    flex: none;
    width: 52px;
    height: 36px;
    border-radius: 18px;
    background: var(--power-bg, var(--vivid-layer-2));
    box-shadow: var(--power-shadow, none);
    color: var(--power-color, var(--secondary-text-color));
    transition:
      background 0.4s ease,
      box-shadow 0.4s ease;
  }
  .power ha-icon {
    --mdc-icon-size: 20px;
    display: inline-flex;
  }
  .power:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 32px;
    padding: 0 10px 0 7px;
    box-sizing: border-box;
    border-radius: 16px;
    background: var(--vivid-layer-2);
    font-size: 12.5px;
    font-weight: 500;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    transition:
      background 0.2s ease,
      box-shadow 0.2s ease;
  }
  .chip ha-icon {
    --mdc-icon-size: 17px;
    display: inline-flex;
    color: var(--secondary-text-color);
  }
  .chip .caret {
    --mdc-icon-size: 15px;
    margin: 0 -3px 0 -2px;
  }
  .chip.on {
    background: color-mix(in srgb, rgb(var(--chip-rgb)) 16%, var(--vivid-layer-2));
    box-shadow: inset 0 0 0 1px rgba(var(--chip-rgb), 0.45);
  }
  .chip.on ha-icon {
    color: rgb(var(--chip-rgb));
  }
  .chip:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .chip.static {
    cursor: default;
  }
  .chip small {
    color: var(--secondary-text-color);
    font-weight: 400;
  }
  /* A wide slider: the fill is the value, the native range input on top. */
  .bar {
    position: relative;
    display: block;
    height: 36px;
    border-radius: 18px;
    background: var(--vivid-layer-2);
    overflow: hidden;
  }
  .bar .fill {
    position: absolute;
    inset: 0 auto 0 0;
    width: var(--value, 50%);
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--bar-color, var(--primary-color)) 45%, transparent),
      var(--bar-color, var(--primary-color))
    );
    transition: width 0.15s ease;
  }
  .bar .knob {
    position: absolute;
    top: 7px;
    bottom: 7px;
    width: 4px;
    border-radius: 2px;
    background: #fff;
    left: max(10px, calc(var(--value, 50%) - 12px));
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.35);
  }
  .bar .text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 600;
    pointer-events: none;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }
  .bar .text ha-icon {
    --mdc-icon-size: 18px;
  }
  .bar input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
    touch-action: pan-y;
  }
  .bar.disabled {
    opacity: 0.5;
  }
  .bar.disabled input {
    cursor: default;
  }
`;
