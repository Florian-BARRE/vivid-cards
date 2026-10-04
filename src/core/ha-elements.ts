/**
 * Makes sure Home Assistant's form elements (`ha-form` and its selectors) are
 * defined. They are lazy-loaded by the frontend; opening the editor of a
 * built-in card loads them.
 */
interface CardHelpers {
  createCardElement(config: Record<string, unknown>): HTMLElement;
}

declare global {
  interface Window {
    loadCardHelpers?: () => Promise<CardHelpers>;
  }
}

let loading: Promise<void> | undefined;

export function ensureHaForm(): Promise<void> {
  if (customElements.get('ha-form')) return Promise.resolve();
  loading ??= (async () => {
    try {
      const helpers = await window.loadCardHelpers?.();
      const card = helpers?.createCardElement({ type: 'tile', entity: 'sun.sun' });
      const element = card?.constructor as
        { getConfigElement?: () => Promise<unknown> } | undefined;
      await element?.getConfigElement?.();
    } catch {
      // Outside Home Assistant (tests, preview page) there is nothing to load.
    }
  })();
  return loading;
}
