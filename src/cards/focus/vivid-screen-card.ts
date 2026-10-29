import { html, type TemplateResult } from 'lit';
import type { HomeAssistant } from '../../core/hass-types';
import { REPOSITORY_URL, defineElement, registerCard } from '../../core/register';
import { formEditor } from '../../core/vivid-form-editor';
import { localize } from '../../i18n';
import '../hyperhdr/vivid-hyperhdr-screen';
import { CAPTURE_RGB, deviceName } from '../hyperhdr/model';
import { VividFocusCard, type FocusHead } from './base';
import { hyperhdrCamera, resolveScreenCard, type ResolvedScreenCard } from './config';

export const SCREEN_CARD = 'vivid-screen-card';

/**
 * What the TV shows, as HyperHDR captures it: the live picture with the halo
 * of its edges around it. It plays while it is on screen (or once asked).
 */
export class VividScreenCard extends VividFocusCard<ResolvedScreenCard> {
  static getConfigElement(): HTMLElement {
    return formEditor({
      fields: [
        { name: 'camera', label: 'focus_camera', selector: { entity: { domain: 'camera' } } },
        { name: 'name', label: 'name', selector: { text: {} } },
        { name: 'on_demand', label: 'focus_on_demand', selector: { boolean: {} }, default: false },
        {
          name: 'timeout',
          label: 'focus_timeout',
          selector: {
            number: { min: 10, max: 3600, step: 10, mode: 'box', unit_of_measurement: 's' },
          },
          default: 120,
        },
      ],
      validate: resolveScreenCard,
    });
  }

  static getStubConfig(): Record<string, unknown> {
    return {};
  }

  protected resolveConfig(raw: unknown): ResolvedScreenCard {
    return resolveScreenCard(raw);
  }

  private camera(config: ResolvedScreenCard, hass: HomeAssistant) {
    return config.camera ? { camera: config.camera } : hyperhdrCamera(hass);
  }

  protected watched(config: ResolvedScreenCard): string[] {
    return config.camera ? [config.camera] : [];
  }

  protected head(config: ResolvedScreenCard, hass: HomeAssistant): FocusHead {
    const { camera, server } = this.camera(config, hass);
    const state = camera ? hass.states[camera] : undefined;
    return {
      icon: 'mdi:television-ambient-light',
      color: CAPTURE_RGB,
      title: config.name ?? localize(hass, 'focus_screen'),
      sub: server
        ? deviceName(hass, server)
        : (state?.attributes.friendly_name as string | undefined),
    };
  }

  protected renderBody(config: ResolvedScreenCard, hass: HomeAssistant): TemplateResult {
    const { camera } = this.camera(config, hass);
    if (!camera) return html`<div class="message">${localize(hass, 'focus_screen_missing')}</div>`;
    return html`<vivid-hyperhdr-screen
      .hass=${hass}
      .camera=${camera}
      .fallback=${[[70, 70, 70]]}
      .tags=${[localize(hass, 'hh_live')]}
      .onDemand=${config.onDemand}
      .timeout=${config.timeout}
      .labels=${{
        show: localize(hass, 'hh_show_screen'),
        extend: localize(hass, 'hh_extend'),
        stop: localize(hass, 'hh_stop'),
        live: localize(hass, 'hh_live'),
        ended: localize(hass, 'hh_screen_ended'),
      }}
    ></vivid-hyperhdr-screen>`;
  }
}

defineElement(SCREEN_CARD, VividScreenCard);

registerCard({
  type: SCREEN_CARD,
  name: 'Vivid TV screen',
  description: 'The live picture HyperHDR captures from the TV, with the halo of its edges.',
  preview: false,
  documentationURL: `${REPOSITORY_URL}/blob/main/docs/cards/screen.md`,
});

declare global {
  interface HTMLElementTagNameMap {
    'vivid-screen-card': VividScreenCard;
  }
}
