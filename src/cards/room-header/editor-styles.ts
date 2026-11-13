/* ====== Code Summary ======
 * Styles of the room header editor and of its badges list: notes, role
 * chips, the lines telling what the power button runs, the badge rows.
 */

import { css } from 'lit';

export const roomEditorStyles = css`
  :host {
    display: block;
  }
  .editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 10px;
    background: rgba(var(--vivid-rgb-text), 0.05);
    font-size: 12.5px;
    line-height: 1.4;
    color: var(--secondary-text-color);
    overflow-wrap: anywhere;
  }
  .note ha-icon {
    --mdc-icon-size: 16px;
    margin-top: 1px;
    flex: none;
  }
  .note.warn ha-icon {
    color: var(--warning-color, #ffa000);
  }
  .group-title {
    font-size: 12.5px;
    color: var(--secondary-text-color);
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .role {
    appearance: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    padding: 5px 10px 5px 6px;
    border-radius: 12px;
    border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
    background: none;
    color: var(--secondary-text-color);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .role.on {
    border-color: transparent;
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.14);
    color: var(--primary-text-color);
  }
  .role ha-icon {
    --mdc-icon-size: 18px;
    flex: none;
  }
  .role.on ha-icon {
    color: var(--primary-color, #03a9f4);
  }
  .role:not(.on) .role-name {
    text-decoration: line-through;
  }
  .role:focus-visible,
  .icon-button:focus-visible {
    outline: 2px solid var(--vivid-focus);
    outline-offset: 2px;
  }
  .role-text,
  .row-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .role-name,
  .row-name {
    font-size: 13px;
    font-weight: 500;
  }
  .role-id,
  .row-id {
    font-size: 11px;
    color: var(--secondary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .taps {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .tap {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 10px;
    background: rgba(var(--vivid-rgb-text), 0.04);
  }
  .tap > ha-icon {
    --mdc-icon-size: 20px;
    flex: none;
    color: var(--secondary-text-color);
  }
  .tap .when {
    font-size: 11.5px;
    color: var(--secondary-text-color);
  }
  .tap .what {
    font-size: 13px;
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  .tag {
    display: inline-block;
    margin-left: 6px;
    padding: 0 6px;
    border-radius: 6px;
    font-size: 10.5px;
    font-weight: 500;
    line-height: 16px;
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.14);
    color: var(--primary-color, #03a9f4);
    vertical-align: middle;
  }
  .tag.warn {
    background: rgba(255, 160, 0, 0.16);
    color: var(--warning-color, #ffa000);
  }
  .rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 6px 6px 10px;
    border-radius: 10px;
    background: rgba(var(--vivid-rgb-text), 0.04);
  }
  .row > ha-icon {
    --mdc-icon-size: 18px;
    flex: none;
    color: var(--secondary-text-color);
  }
  .row-text {
    flex: 1;
  }
  .icon-button {
    appearance: none;
    border: none;
    background: none;
    color: var(--secondary-text-color);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex: none;
  }
  .icon-button:hover:not([disabled]) {
    background: rgba(var(--vivid-rgb-text), 0.08);
    color: var(--primary-text-color);
  }
  .icon-button[disabled] {
    opacity: 0.3;
    cursor: default;
  }
  .icon-button ha-icon {
    --mdc-icon-size: 18px;
  }
  .icon-button.danger:hover {
    color: var(--error-color, #db4437);
  }
  .badge-item {
    border-radius: 10px;
    background: rgba(var(--vivid-rgb-text), 0.04);
  }
  .badge-item > .row {
    background: none;
  }
  .plain {
    appearance: none;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
    text-align: left;
    padding: 0;
    cursor: pointer;
    align-items: flex-start;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }
  .options {
    padding: 0 10px 10px;
  }
  .slots {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .add {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border-radius: 10px;
    border: 1px dashed var(--divider-color, rgba(255, 255, 255, 0.2));
  }
  .add-button {
    align-self: flex-end;
    appearance: none;
    border: none;
    border-radius: 10px;
    padding: 8px 14px;
    font: inherit;
    font-weight: 500;
    cursor: pointer;
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
  }
  .add-button[disabled] {
    opacity: 0.4;
    cursor: default;
  }

  .badge-item.hidden .row {
    opacity: 0.6;
  }
  .badge-item ha-checkbox {
    flex: none;
    margin: -8px 0 -8px -8px;
  }
  .badge-slot {
    display: block;
    margin: 8px 0 0 32px;
  }
`;
