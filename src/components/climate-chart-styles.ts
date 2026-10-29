import { css } from 'lit';

/** Styles shared by the climate charts (panel, range tabs, SVG marks, tooltip). */
export const climateChartStyles = css`
  :host {
    display: block;
    /* Behind the chart: dots are cut out of the curve with this color. */
    --vivid-climate-surface: var(--vivid-layer-1);
  }
  .panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    border-radius: var(--vivid-tile-radius);
    background: var(--vivid-climate-surface);
    color: var(--primary-text-color);
  }
  .ranges {
    display: inline-flex;
    flex: none;
    padding: 2px;
    border-radius: 10px;
    background: var(--vivid-layer-2);
  }
  .ranges button {
    padding: 4px 9px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }
  .ranges button[aria-pressed='true'] {
    background: rgba(var(--vivid-rgb-text), 0.14);
    color: var(--primary-text-color);
  }
  .plot {
    position: relative;
    touch-action: pan-y;
    cursor: crosshair;
    user-select: none;
    -webkit-user-select: none;
  }
  svg {
    display: block;
    overflow: visible;
  }
  svg text {
    font-family: inherit;
    font-variant-numeric: tabular-nums;
  }
  .t-primary {
    fill: var(--primary-text-color);
  }
  .t-secondary {
    fill: var(--secondary-text-color);
  }
  .t-strong {
    font-weight: 700;
  }
  .band {
    fill: rgba(var(--vivid-rgb-text), 0.05);
  }
  .grid {
    stroke: rgba(var(--vivid-rgb-text), 0.08);
    stroke-width: 1;
  }
  .baseline {
    stroke: rgba(var(--vivid-rgb-text), 0.2);
    stroke-width: 1;
  }
  .midnight {
    stroke: rgba(var(--vivid-rgb-text), 0.22);
    stroke-width: 1;
    stroke-dasharray: 3 4;
  }
  .area {
    opacity: 0.12;
  }
  .under {
    fill: none;
    stroke: rgba(var(--vivid-rgb-text), 0.16);
    stroke-width: 4.5;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .line {
    fill: none;
    stroke-width: 2.5;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .curve {
    animation: vivid-climate-in 380ms ease-out;
  }
  .dot {
    stroke: var(--vivid-climate-surface);
    stroke-width: 2;
  }
  .cursor {
    stroke: var(--primary-text-color);
    stroke-opacity: 0.45;
    stroke-width: 1;
  }
  .tooltip {
    position: absolute;
    top: 0;
    z-index: 1;
    padding: 7px 10px;
    border-radius: 10px;
    background: var(--vivid-layer-0);
    color: var(--primary-text-color);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
    font-size: 11.5px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    pointer-events: none;
  }
  .tooltip .time {
    color: var(--secondary-text-color);
  }
  .tooltip .value {
    font-size: 14px;
    font-weight: 700;
  }
  .message {
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: rgba(var(--vivid-rgb-text), 0.04);
    color: var(--secondary-text-color);
    font-size: 13px;
    text-align: center;
    padding: 0 16px;
  }
  .loading {
    border-radius: 12px;
    background: rgba(var(--vivid-rgb-text), 0.05);
    animation: vivid-climate-pulse 1.4s ease-in-out infinite;
  }
  @keyframes vivid-climate-in {
    from {
      opacity: 0;
    }
  }
  @keyframes vivid-climate-pulse {
    50% {
      opacity: 0.5;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .curve,
    .loading {
      animation: none;
    }
  }
`;
