/**
 * Folded or unfolded, per light entity: kept in memory for the session (every
 * card of the same entity agrees, a dashboard change keeps it) and, best
 * effort, in `localStorage` so the next visit on this device finds it again.
 */

const STORAGE_PREFIX = 'vivid-led-group:expanded:';

const remembered = new Map<string, boolean>();

/** The parts of `Storage` used here, so tests can pass their own. */
export type FoldStorage = Pick<Storage, 'getItem' | 'setItem'>;

function defaultStorage(): FoldStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    // Storage blocked (private mode, sandboxed frame): memory only.
    return undefined;
  }
}

/** The state last chosen for `entity`, else `fallback` (the `expanded` option). */
export function readExpanded(
  entity: string,
  fallback: boolean,
  storage: FoldStorage | undefined = defaultStorage(),
): boolean {
  const known = remembered.get(entity);
  if (known !== undefined) return known;
  try {
    const stored = storage?.getItem(STORAGE_PREFIX + entity);
    if (stored === '1' || stored === '0') {
      const value = stored === '1';
      remembered.set(entity, value);
      return value;
    }
  } catch {
    // Unreadable storage: the option decides.
  }
  return fallback;
}

export function writeExpanded(
  entity: string,
  expanded: boolean,
  storage: FoldStorage | undefined = defaultStorage(),
): void {
  remembered.set(entity, expanded);
  try {
    storage?.setItem(STORAGE_PREFIX + entity, expanded ? '1' : '0');
  } catch {
    // Full or blocked storage: the state lives in memory for this session.
  }
}

/** Forgets what was chosen (the `expanded` option changed, or a test starts over). */
export function forgetExpanded(entity?: string): void {
  if (entity === undefined) remembered.clear();
  else remembered.delete(entity);
}
