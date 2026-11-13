/* ====== Code Summary ======
 * Keys of Vivid Pilot nodes, as the integration writes them in the
 * `vivid_pilot_node` attribute: `all`, `<area>` (a room), `all__<category>`
 * and `<area>__<category>`. Parsing and building them.
 */

/** Categories a Vivid Pilot node can have (mirror of the integration's). */
export const PILOT_CATEGORIES = [
  'light',
  'led',
  'switch',
  'door',
  'window',
  'presence',
  'temperature',
  'humidity',
  'pressure',
  'co2',
  'illuminance',
  'battery',
  'power',
] as const;

export type PilotCategory = (typeof PILOT_CATEGORIES)[number];

/** The home node. */
export const HOME_NODE = 'all';

const SEPARATOR = '__';

/** A node key read: its area (none for the home) and its category (none for a room). */
export interface PilotNodeKey {
  area?: string;
  category?: PilotCategory;
}

export function isPilotCategory(value: string): value is PilotCategory {
  return (PILOT_CATEGORIES as readonly string[]).includes(value);
}

/** `salon__light` → { area: salon, category: light }; `all` → {}. */
export function parseNodeKey(key: string): PilotNodeKey {
  const [head = '', tail] = key.split(SEPARATOR, 2);
  const area = head === HOME_NODE || head === '' ? undefined : head;
  const category = tail !== undefined && isPilotCategory(tail) ? tail : undefined;
  return { area, category };
}

/** { area: salon, category: light } → `salon__light`; {} → `all`. */
export function nodeKey(area: string | undefined, category?: PilotCategory): string {
  const head = area ?? HOME_NODE;
  return category ? `${head}${SEPARATOR}${category}` : head;
}
