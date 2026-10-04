import { css } from 'lit';

/**
 * Design tokens shared by every Vivid element. Each one can be overridden from a
 * Home Assistant theme, e.g. `vivid-card-radius: 20px`.
 */
export const tokens = css`
  :host {
    --vivid-rgb-text: var(--rgb-primary-text-color, 255, 255, 255);
    --vivid-surface: rgba(var(--vivid-rgb-text), 0.05);
    --vivid-chip-surface: rgba(var(--vivid-rgb-text), 0.08);
    --vivid-line-color: rgba(var(--vivid-rgb-text), 0.07);
    --vivid-muted: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
    --vivid-chip-height: 36px;
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
