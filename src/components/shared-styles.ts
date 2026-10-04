import { css } from 'lit';

/**
 * Design tokens shared by every Vivid element. Each one can be overridden from a
 * Home Assistant theme, e.g. `vivid-card-radius: 20px`.
 */
export const tokens = css`
  /*
   * Badges take their background from --vivid-chip-context, which containers set
   * for their children (a tile sets it to --vivid-layer-2). It is never declared
   * on :host, so it inherits through shadow roots.
   */
  :host {
    --vivid-rgb-text: var(--rgb-primary-text-color, 255, 255, 255);
    /* Three surface levels: the page, what sits on it (tiles, badges), what sits in a tile. */
    --vivid-layer-0: var(--primary-background-color, #111111);
    --vivid-layer-1: var(
      --vivid-surface-color,
      var(--secondary-background-color, var(--card-background-color, #282828))
    );
    --vivid-layer-2: color-mix(in srgb, var(--vivid-layer-0) 70%, var(--vivid-layer-1));
    --vivid-line-color: var(--vivid-layer-1);
    --vivid-muted: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
    /* Set --vivid-card-chip-height on a card to resize every control (compact layout). */
    --vivid-chip-height: var(--vivid-card-chip-height, 36px);
    --vivid-tile-radius: var(--vivid-card-tile-radius, 22px);
    --vivid-focus: var(--primary-color, #03a9f4);
  }
`;

/** Resets a native button so it can be fully restyled. */
export const buttonReset = css`
  .reset {
    appearance: none;
    border: none;
    margin: 0;
    padding: 0;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .reset:focus-visible {
    outline: 2px solid var(--vivid-focus);
    outline-offset: 2px;
  }
`;
