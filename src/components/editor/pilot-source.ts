/* ====== Code Summary ======
 * The "Source" of a card in its editor: Vivid Pilot (a node picked in a
 * list) or manual (entities written by hand). Pure helpers the card editors
 * share: which source a config uses, the form fields, and how a change of
 * source or node is written back (switching source drops the other one's
 * target and the member tweaks).
 */

import type { HomeAssistant } from '../../core/hass-types';
import type { PilotCategory, PilotKind } from '../../core/pilot';
import { pilotNodeOptions } from '../../i18n/pilot';

export type TargetSource = 'pilot' | 'manual';

/** What a card says about its target. */
export interface SourceConfig {
  pilot?: string;
  entity?: string;
  entities?: string[];
  [key: string]: unknown;
}

const TARGET_KEYS = ['pilot', 'entity', 'entities', 'exclude', 'add'];

/** Pilot unless an entity or a list is written by hand. */
export function targetSource(config: SourceConfig): TargetSource {
  return config.entity || config.entities?.length ? 'manual' : 'pilot';
}

/** The source choice and, in Pilot mode, the node picker (`ha-form` schema). */
export function sourceFields(
  hass: HomeAssistant | undefined,
  labels: Record<TargetSource, string>,
  kind: PilotKind,
  categories: readonly (PilotCategory | undefined)[],
  source: TargetSource,
): Record<string, unknown>[] {
  const fields: Record<string, unknown>[] = [
    {
      name: 'source',
      required: true,
      selector: {
        select: {
          mode: 'dropdown',
          options: (['pilot', 'manual'] as const).map((value) => ({ value, label: labels[value] })),
        },
      },
    },
  ];
  if (source === 'pilot') {
    fields.push({
      name: 'pilot',
      required: true,
      selector: {
        select: { mode: 'dropdown', options: pilotNodeOptions(hass, kind, categories) },
      },
    });
  }
  return fields;
}

/**
 * Writes the source part of a form change: a new source clears the target
 * (and says so by returning `true`); in Pilot mode the node is written.
 */
export function applySource<T extends SourceConfig>(
  config: T,
  value: Record<string, unknown>,
): { config: T; switched: boolean } {
  const next: Record<string, unknown> = { ...config };
  const source = value.source as TargetSource | undefined;
  if (source && source !== targetSource(config)) {
    for (const key of TARGET_KEYS) delete next[key];
    return { config: next as T, switched: true };
  }
  if (targetSource(config) === 'pilot') {
    if (typeof value.pilot === 'string' && value.pilot) next.pilot = value.pilot;
    else delete next.pilot;
  }
  return { config: next as T, switched: false };
}
