import { html } from 'lit';
import { domainOf } from '../../core/entities';
import { lightTone, softLightTone } from '../../core/glow';
import type { HomeAssistant } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerBadge } from '../../core/register';
import { localize } from '../../i18n';
import { VividBadge, type BadgeView } from '../base/vivid-badge';
import {
  LIGHT_BADGE_TAGS,
  resolveLightBadgeConfig,
  type LightBadgeConfig,
  type LightKind,
  type ResolvedLightBadgeConfig,
} from './config';
import { buildLightBadgeModel, type LightBadgeModel } from './model';
import './vivid-light-badge-details';
import './vivid-light-badge-editor';

/**
 * Badge for a light group (or one light, or lamps on plugs), for the badge
 * bar of a dashboard.
 *
 * - Everything off: the crossed-out icon, greyed (and "0/3" with `show_zero`).
 * - Something on: the icon on a disc filled with the lights' colors (a
 *   gradient for a group), haloed with the brightness, and "on / total".
 *
 * A tap toggles the whole group (anything on turns everything off); a hold
 * opens the details under the badge: every light with its color, brightness
 * slider and switch.
 */
export class VividLightBadge extends VividBadge<ResolvedLightBadgeConfig> {
  /** Which badge this is: LED strips, lamps or any light. */
  protected kind: LightKind = 'light';
  private model?: LightBadgeModel;

  static getConfigElement(): HTMLElement {
    return document.createElement('vivid-light-badge-editor');
  }

  static getStubConfig(hass?: HomeAssistant): Partial<LightBadgeConfig> {
    const lights = Object.values(hass?.states ?? {}).filter((state) =>
      state.entity_id.startsWith('light.'),
    );
    const group = lights.find((state) => Array.isArray(state.attributes.entity_id));
    return { entity: (group ?? lights[0])?.entity_id ?? 'light.example' };
  }

  protected resolveConfig(raw: unknown): ResolvedLightBadgeConfig {
    return resolveLightBadgeConfig(raw, this.kind);
  }

  protected buildView(hass: HomeAssistant, config: ResolvedLightBadgeConfig): BadgeView {
    const model = buildLightBadgeModel(hass, config);
    this.model = model;
    const on = model.on > 0;
    const showText = config.showCount && (on || config.showZero);
    const text = model.isGroup
      ? `${model.on}/${model.total}`
      : `${model.lights[0]?.brightness ?? 0} %`;
    return {
      name: model.name,
      active: on && model.colors.length > 0,
      icon: on ? model.icon : model.iconOff,
      strike: !on && model.strike,
      text: showText ? text : undefined,
      textMuted: !on,
      // White lights take Home Assistant's amber, translucent; colored lights fill solid.
      tone: (model.white ? softLightTone : lightTone)(
        model.colors,
        true,
        model.brightness,
        config.glowBoost,
      ),
      soft: model.white,
      state: on
        ? localize(hass, 'lights_on', { on: model.on, total: model.total })
        : localize(hass, 'off'),
      watched: model.watched,
      unavailable: model.total === 0,
    };
  }

  /** Anything on: everything off. Everything off: everything on. */
  protected override toggle(): void {
    const config = this._config;
    if (!config || !this.hass || !this.model) return;
    const service = this.model.on > 0 ? 'turn_off' : 'turn_on';
    const isLight = domainOf(config.entity) === 'light';
    // Switches and old-style groups have no transition.
    const data =
      isLight && config.transition !== undefined ? { transition: config.transition } : {};
    void this.hass.callService(isLight ? 'light' : 'homeassistant', service, data, {
      entity_id: config.entity,
    });
  }

  protected renderDetails() {
    return html`<vivid-light-badge-details
      .hass=${this.hass}
      .model=${this.model}
      .transition=${this._config?.transition}
      .layout=${this._config?.layout ?? 'list'}
      .glowBoost=${this._config?.glowBoost}
    ></vivid-light-badge-details>`;
  }
}

function isGroupState(state: { attributes: { entity_id?: unknown } }): boolean {
  return Array.isArray(state.attributes.entity_id);
}

function allWled(hass: HomeAssistant, ids: unknown): boolean {
  return (
    Array.isArray(ids) &&
    ids.length > 0 &&
    ids.every((id) => hass.entities?.[String(id)]?.platform === 'wled')
  );
}

/**
 * LED strips: the crossed-out strip icon when off, the strips' colors when on.
 * Same gestures and details as the light badge.
 */
export class VividLedBadge extends VividLightBadge {
  protected override kind: LightKind = 'led';

  static override getStubConfig(hass?: HomeAssistant): Partial<LightBadgeConfig> {
    const groups = Object.values(hass?.states ?? {}).filter(
      (state) => state.entity_id.startsWith('light.') && isGroupState(state),
    );
    const strips = hass
      ? groups.find((state) => allWled(hass, state.attributes.entity_id))
      : undefined;
    return { entity: (strips ?? groups[0])?.entity_id ?? 'light.led_strips' };
  }
}

/**
 * Lamps (lights or smart plugs): the lamps icon crossed out when off, Home
 * Assistant's amber when on. Same gestures and details as the light badge.
 */
export class VividLampBadge extends VividLightBadge {
  protected override kind: LightKind = 'lamp';

  static override getStubConfig(hass?: HomeAssistant): Partial<LightBadgeConfig> {
    const groups = Object.values(hass?.states ?? {}).filter(
      (state) =>
        (state.entity_id.startsWith('light.') || state.entity_id.startsWith('switch.')) &&
        isGroupState(state),
    );
    const lamps = hass
      ? groups.find((state) => !allWled(hass, state.attributes.entity_id))
      : undefined;
    return { entity: (lamps ?? groups[0])?.entity_id ?? 'light.lamps' };
  }
}

defineElement(LIGHT_BADGE_TAGS.light, VividLightBadge);
defineElement(LIGHT_BADGE_TAGS.led, VividLedBadge);
defineElement(LIGHT_BADGE_TAGS.lamp, VividLampBadge);

registerBadge({
  type: LIGHT_BADGE_TAGS.led,
  name: 'Vivid LED badge',
  description:
    'LED strips: how many are on, in their colors with a glow that follows the brightness. Tap to switch them all, hold for each strip.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-led-badge`,
});
registerBadge({
  type: LIGHT_BADGE_TAGS.lamp,
  name: 'Vivid lamp badge',
  description:
    'Lamps, smart bulbs or lamps on plugs: how many are on, in Home Assistant amber. Tap to switch them all, hold for each lamp.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-lamp-badge`,
});
registerBadge({
  type: LIGHT_BADGE_TAGS.light,
  name: 'Vivid light badge',
  description:
    'Any other lights (ceiling lights, spots…): how many are on, in their colors. Tap to switch them all, hold for each light.',
  preview: true,
  documentationURL: `${REPOSITORY_URL}#vivid-light-badge`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-light-badge': VividLightBadge;
    'vivid-led-badge': VividLedBadge;
    'vivid-lamp-badge': VividLampBadge;
  }
}
