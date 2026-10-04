export const REPOSITORY_URL = 'https://github.com/Florian-BARRE/vivid-cards';

/** Defines a custom element once; a second bundle on the page must not throw. */
export function defineElement(tag: string, element: CustomElementConstructor): void {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

/** Lists a card in Home Assistant's card picker. */
export function registerCard(entry: CustomCardEntry): void {
  window.customCards = window.customCards ?? [];
  if (!window.customCards.some((card) => card.type === entry.type)) {
    window.customCards.push(entry);
  }
}

/** Lists a badge in Home Assistant's badge picker (dashboards with badges, 2024.8+). */
export function registerBadge(entry: CustomCardEntry): void {
  window.customBadges = window.customBadges ?? [];
  if (!window.customBadges.some((badge) => badge.type === entry.type)) {
    window.customBadges.push(entry);
  }
}
