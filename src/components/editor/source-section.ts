/* ====== Code Summary ======
 * The "Source" section every card editor opens with, the same everywhere:
 * where the card takes its entities from — Vivid Pilot (a room or a group),
 * the device it finds on its own, or picked by hand — then, under the
 * choice, the card's own picker (a room, a group, a device, entities).
 */

import { html, type TemplateResult } from 'lit';
import type { HomeAssistant } from '../../core/hass-types';
import { editorText, type EditorStringKey } from '../../i18n/editor';
import './vivid-editor-section';

/** Where a card takes its entities from. */
export type SourceChoice = 'pilot' | 'device' | 'manual';

const ICONS: Record<SourceChoice, string> = {
  pilot: 'mdi:steering',
  device: 'mdi:auto-fix',
  manual: 'mdi:hand-back-right-outline',
};

export interface SourceSectionParams {
  hass?: HomeAssistant;
  /** The choices this card offers, in order (`pilot` or `device` first, then `manual`). */
  choices: readonly SourceChoice[];
  source: SourceChoice;
  /** One-line summary shown on the folded section (the room, the device…). */
  hint?: string;
  onSource(source: SourceChoice): void;
  /** The card's picker under the choice. */
  content?: unknown;
}

function text(hass: HomeAssistant | undefined, key: string): string {
  return editorText(hass, key as EditorStringKey);
}

/** The Source section: the choice, its explanation, then the card's picker. */
export function sourceSection(params: SourceSectionParams): TemplateResult {
  const { hass, choices, source } = params;
  return html`<vivid-editor-section
    open
    icon=${ICONS[source]}
    .heading=${text(hass, 'src_section')}
    .hint=${params.hint || text(hass, `src_${source}`)}
  >
    <ha-form
      .hass=${hass}
      .data=${{ source }}
      .schema=${[
        {
          name: 'source',
          selector: {
            select: {
              mode: 'box',
              options: choices.map((value) => ({ value, label: text(hass, `src_${value}`) })),
            },
          },
        },
      ]}
      .computeLabel=${() => text(hass, 'src_section')}
      .computeHelper=${() => text(hass, `src_${source}_helper`)}
      @value-changed=${(event: CustomEvent<{ value: { source?: SourceChoice } }>) => {
        event.stopPropagation();
        const next = event.detail.value.source;
        if (next && next !== source) params.onSource(next);
      }}
    ></ha-form>
    ${params.content}
  </vivid-editor-section>`;
}
