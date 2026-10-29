import { css } from 'lit';

/** Styles shared by the energy cards and their panels. */
export const energyStyles = css`
  :host {
    --energy-peak: rgb(255, 193, 7);
    --energy-off-peak: rgb(121, 134, 203);
    --energy-subscription: rgba(var(--vivid-rgb-text), 0.35);
    --energy-hatch: repeating-linear-gradient(
      135deg,
      rgba(var(--vivid-rgb-text), 0.28) 0 5px,
      rgba(var(--vivid-rgb-text), 0.1) 5px 10px
    );
  }
  .head {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .disc {
    flex: none;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--disc, rgb(255, 112, 67));
    color: #ffffff;
    box-shadow: 0 0 calc(14px * var(--vivid-glow, 1))
      rgba(var(--disc-rgb, 255, 112, 67), calc(0.5 * var(--vivid-glow-alpha, 1)));
  }
  .disc ha-icon {
    --mdc-icon-size: 22px;
    display: inline-flex;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
  }
  .grow {
    flex: 1;
    min-width: 0;
  }
  .head .grow {
    min-width: 140px;
  }
  .title {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sub {
    font-size: 12.5px;
    color: var(--vivid-muted);
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .num {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .chips {
    display: inline-flex;
    gap: 4px;
    flex: none;
  }
  .chip {
    height: 28px;
    padding: 0 10px;
    border-radius: 14px;
    background: rgba(var(--vivid-rgb-text), 0.06);
    color: var(--vivid-muted);
    font-size: 12.5px;
    font-weight: 600;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
  }
  .chip[aria-pressed='true'] {
    background: rgba(255, 193, 7, 0.2);
    color: rgb(255, 193, 7);
  }
  .badge-chip {
    height: 28px;
    padding: 0 12px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    flex: none;
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    gap: 8px;
  }
  .tile {
    padding: 10px 12px;
    border-radius: 14px;
    background: var(--vivid-layer-2);
    min-width: 0;
  }
  .tile .value {
    font-size: 17px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    font-size: 12px;
    color: var(--secondary-text-color);
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .dot {
    flex: none;
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13.5px;
    min-height: 28px;
  }
  .split {
    display: flex;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    background: rgba(var(--vivid-rgb-text), 0.08);
  }
  .split i {
    display: block;
    height: 100%;
  }
  .peak {
    background: var(--energy-peak);
  }
  .off-peak {
    background: var(--energy-off-peak);
  }
  .subscription {
    background: var(--energy-subscription);
  }
  .message {
    padding: 8px 2px;
    font-size: 13px;
    color: var(--vivid-muted);
    line-height: 1.45;
  }
  .icon-button {
    flex: none;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--secondary-text-color);
  }
  .icon-button:hover {
    background: rgba(var(--vivid-rgb-text), 0.06);
  }
  .icon-button[disabled] {
    opacity: 0.3;
    cursor: default;
  }
  .icon-button ha-icon {
    --mdc-icon-size: 20px;
    display: inline-flex;
  }
`;
