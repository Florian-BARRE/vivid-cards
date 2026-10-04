const TOKEN_SEPARATOR = /[\s\-_]+/;

export function capitalize(text: string): string {
  if (text === '') return text;
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

function tokenize(name: string): string[] {
  return name.trim().split(TOKEN_SEPARATOR).filter(Boolean);
}

function sameToken(a: string | undefined, b: string | undefined): boolean {
  return a !== undefined && b !== undefined && a.toLocaleLowerCase() === b.toLocaleLowerCase();
}

/**
 * Shortens sibling names by removing the words they all share at the start and
 * at the end, then capitalizes the result.
 *
 *   ["salon-ambilight-wled", "salon-buffet-wled"] -> ["Ambilight", "Buffet"]
 *
 *   ["Cuisine Spot 1", "Cuisine Spot 2"] -> ["Spot 1", "Spot 2"]
 *
 * At least one word is always kept, a bare number keeps the word before it,
 * and a single name is only capitalized.
 */
export function shortenSiblingNames(names: readonly string[]): string[] {
  const tokens = names.map(tokenize);
  if (tokens.length < 2 || tokens.some((t) => t.length === 0)) {
    return names.map((name) => capitalize(name.trim()));
  }

  const shortest = Math.min(...tokens.map((t) => t.length));
  const first = tokens[0] ?? [];

  let prefix = 0;
  while (prefix < shortest - 1 && tokens.every((t) => sameToken(t[prefix], first[prefix]))) {
    prefix += 1;
  }

  let suffix = 0;
  while (
    prefix + suffix < shortest - 1 &&
    tokens.every((t) => sameToken(t[t.length - 1 - suffix], first[first.length - 1 - suffix]))
  ) {
    suffix += 1;
  }

  // "Spot 1" says more than "1": give a bare number its last shared word back.
  const isNumber = (t: string[]) => /^\d+$/.test(t.slice(prefix, t.length - suffix).join(''));
  if (prefix > 0 && tokens.some(isNumber)) prefix -= 1;

  return tokens.map((t) => capitalize(t.slice(prefix, t.length - suffix).join(' ')));
}
