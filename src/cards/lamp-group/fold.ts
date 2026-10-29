import type { ResolvedLampGroupConfig } from './config';

/**
 * Unfolded or folded state of an expandable line card.
 *
 * The choice made on the card is kept in memory for the page, and in
 * `localStorage` (best effort) keyed by the card's entities, so a dashboard
 * reload or another device tab keeps it. A choice is stored together with the
 * configured `expanded` it was made against: changing `expanded` in the
 * config starts over from the new value.
 */

export const FOLD_STORAGE_PREFIX = 'vivid-lamp-group:expanded:';

/** The part of `Storage` the fold needs. */
export interface FoldStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

type FoldConfig = Pick<
  ResolvedLampGroupConfig,
  'layout' | 'expandable' | 'expanded' | 'entity' | 'entities'
>;

interface Remembered {
  expanded: boolean;
  /** `expanded` of the config when the choice was made. */
  base: boolean;
}

const memory = new Map<string, Remembered>();

/** The line layout with `expandable` on. */
export function canFold(config: FoldConfig): boolean {
  return config.layout === 'line' && config.expandable;
}

/** Storage key of a card: its entity, else its listed entities. */
export function foldKey(config: Pick<FoldConfig, 'entity' | 'entities'>): string | undefined {
  const id = config.entity ?? config.entities?.join(',');
  return id ? `${FOLD_STORAGE_PREFIX}${id}` : undefined;
}

/** `localStorage`, when the browser lets the page use it. */
export function browserStorage(): FoldStorage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}

/** "1:0": unfolded, chosen against `expanded: false`. */
export function encodeFold(value: Remembered): string {
  return `${value.expanded ? 1 : 0}:${value.base ? 1 : 0}`;
}

export function decodeFold(raw: string | null | undefined): Remembered | undefined {
  const match = /^([01]):([01])$/.exec(raw ?? '');
  if (!match) return undefined;
  return { expanded: match[1] === '1', base: match[2] === '1' };
}

function readStored(storage: FoldStorage | undefined, key: string): Remembered | undefined {
  try {
    return decodeFold(storage?.getItem(key));
  } catch {
    return undefined;
  }
}

/** The state a card starts in: the remembered choice, else `expanded`. */
export function initialFold(
  config: FoldConfig,
  storage: FoldStorage | undefined = browserStorage(),
): boolean {
  if (!canFold(config)) return false;
  const key = foldKey(config);
  if (!key) return config.expanded;
  const remembered = memory.get(key) ?? readStored(storage, key);
  return remembered && remembered.base === config.expanded ? remembered.expanded : config.expanded;
}

/** Keeps a choice made on the card. */
export function rememberFold(
  config: FoldConfig,
  expanded: boolean,
  storage: FoldStorage | undefined = browserStorage(),
): void {
  const key = foldKey(config);
  if (!key) return;
  const value = { expanded, base: config.expanded };
  memory.set(key, value);
  try {
    storage?.setItem(key, encodeFold(value));
  } catch {
    // Private browsing or a full storage: the page memory is enough.
  }
}

/** Forgets every choice kept in memory (tests). */
export function clearFoldMemory(): void {
  memory.clear();
}
