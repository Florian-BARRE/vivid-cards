import { css } from 'lit';

/** Styles of the energy calendar: the month grid, its cells, the chosen day and the total. */
export const calendarStyles = css`
  .grid {
    container-type: inline-size;
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: clamp(3px, 1.2cqw, 8px);
  }
  .weekday {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: var(--vivid-muted);
  }
  .cell {
    box-sizing: border-box;
    min-height: clamp(52px, 13cqw, 96px);
    border-radius: clamp(10px, 2.4cqw, 16px);
    padding: clamp(4px, 1.2cqw, 8px) clamp(5px, 1.4cqw, 10px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 4px;
    text-align: left;
    min-width: 0;
  }
  .cell.data {
    color: #ffffff;
    cursor: pointer;
  }
  .cell.data:focus-visible {
    outline: 2px solid var(--vivid-focus);
    outline-offset: 2px;
  }
  .cell.selected {
    box-shadow:
      0 0 0 2px var(--primary-text-color),
      0 0 16px var(--cell-glow) !important;
  }
  .cell.empty {
    border: 1px dashed rgba(var(--vivid-rgb-text), 0.15);
    color: var(--vivid-muted);
  }
  .cell.today {
    border: 2px solid var(--primary-text-color);
  }
  .cell.past {
    background: rgba(var(--vivid-rgb-text), 0.04);
    color: var(--vivid-muted);
  }
  .day {
    display: flex;
    justify-content: space-between;
    gap: 4px;
    font-size: clamp(10px, 2.2cqw, 12px);
    opacity: 0.85;
    white-space: nowrap;
    overflow: hidden;
  }
  .price {
    font-size: clamp(10px, 3.1cqw, 22px);
    font-weight: 800;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: clip;
  }
  .hphc {
    display: flex;
    height: clamp(4px, 1cqw, 7px);
    border-radius: 4px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.3);
  }
  .hphc i {
    display: block;
  }
  .detail {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 16px;
    background: var(--vivid-layer-2);
  }
  .detail .top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
  }
  .detail b {
    font-size: 15px;
  }
  .hourly-waiting {
    font-size: 12px;
    line-height: 1.4;
    white-space: normal;
    overflow: visible;
  }
  .detail .amount {
    font-size: 22px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .detail .split {
    height: 12px;
    border-radius: 6px;
  }
  .detail .figures {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
  }
  .total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
    padding-top: 8px;
    border-top: 1px solid rgba(var(--vivid-rgb-text), 0.1);
  }
  .total .num {
    font-size: 20px;
    font-weight: 800;
  }
  .scale {
    width: 44px;
    height: 10px;
    border-radius: 3px;
  }
`;
