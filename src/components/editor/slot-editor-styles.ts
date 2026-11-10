/* ====== Code Summary ======
 * Styles of a slot row (vivid-slot-editor): header with the mode tag, the
 * mode switch, the entities with their origin tags, the picker.
 */

import { css } from 'lit';

export const slotEditorStyles = css`
  :host {
    display: block;
  }
  button {
    font: inherit;
    color: inherit;
  }
  .slot {
    border-radius: 10px;
    background: rgba(var(--vivid-rgb-text), 0.04);
  }
  .head {
    appearance: none;
    border: none;
    background: none;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    cursor: pointer;
    text-align: left;
  }
  .head:focus-visible,
  .mode:focus-visible,
  .check:focus-visible,
  .icon:focus-visible {
    outline: 2px solid var(--vivid-focus);
    outline-offset: 2px;
  }
  .lead {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
    flex: none;
  }
  .label {
    font-size: 13.5px;
    font-weight: 500;
    flex: none;
  }
  .mode-tag {
    flex: none;
    padding: 0 7px;
    border-radius: 6px;
    font-size: 10.5px;
    font-weight: 600;
    line-height: 18px;
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.14);
    color: var(--primary-color, #03a9f4);
  }
  .mode-tag.manual {
    background: rgba(156, 39, 176, 0.14);
    color: #ab47bc;
  }
  .mode-tag.off {
    background: rgba(var(--vivid-rgb-text), 0.08);
    color: var(--secondary-text-color);
  }
  .mode-tag.tweaked {
    background: rgba(255, 160, 0, 0.16);
    color: var(--warning-color, #ffa000);
  }
  .summary {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    color: var(--secondary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .chevron {
    --mdc-icon-size: 20px;
    flex: none;
    transition: transform 0.2s ease;
    color: var(--secondary-text-color);
  }
  :host([open]) .chevron {
    transform: rotate(180deg);
  }
  .body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 2px 10px 10px;
  }
  .modes {
    display: inline-flex;
    align-self: flex-start;
    padding: 2px;
    border-radius: 9px;
    background: rgba(var(--vivid-rgb-text), 0.06);
  }
  .mode {
    appearance: none;
    border: none;
    background: none;
    padding: 5px 12px;
    border-radius: 7px;
    font-size: 12.5px;
    cursor: pointer;
    color: var(--secondary-text-color);
  }
  .mode.on {
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }
  .help,
  .note {
    font-size: 12px;
    color: var(--secondary-text-color);
  }
  .note {
    padding: 6px 8px;
    border-radius: 8px;
    background: rgba(255, 160, 0, 0.1);
  }
  .entries {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .entry {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 4px 5px 2px;
    border-radius: 8px;
  }
  .entry.out .name,
  .entry.out .id {
    text-decoration: line-through;
    opacity: 0.6;
  }
  .check,
  .icon {
    appearance: none;
    border: none;
    background: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex: none;
    color: var(--secondary-text-color);
  }
  .check ha-icon {
    color: var(--primary-color, #03a9f4);
  }
  .entry.out .check ha-icon {
    color: var(--secondary-text-color);
  }
  .icon[disabled] {
    opacity: 0.3;
    cursor: default;
  }
  .icon.danger:hover {
    color: var(--error-color, #db4437);
  }
  .dot {
    width: 32px;
    display: inline-flex;
    justify-content: center;
    color: #ab47bc;
    flex: none;
  }
  .text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .name {
    font-size: 13px;
    font-weight: 500;
  }
  .id {
    font-size: 11px;
    color: var(--secondary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
  }
  .tag {
    font-size: 10.5px;
    line-height: 16px;
    padding: 0 6px;
    border-radius: 6px;
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    color: var(--primary-color, #03a9f4);
  }
  .tag.added,
  .tag.manual {
    background: rgba(156, 39, 176, 0.14);
    color: #ab47bc;
  }
  .entry.out .tag {
    background: rgba(var(--vivid-rgb-text), 0.08);
    color: var(--secondary-text-color);
  }
  .tag.warn {
    background: rgba(255, 160, 0, 0.16);
    color: var(--warning-color, #ffa000);
  }
  .link {
    appearance: none;
    border: none;
    background: none;
    align-self: flex-start;
    padding: 2px 0;
    font-size: 12.5px;
    color: var(--primary-color, #03a9f4);
    cursor: pointer;
  }
`;
