/* ====== Code Summary ======
 * A folding section of a visual editor: icon, title, a one-line hint of what
 * it holds, and its content (slotted, built only while open). Shared by every
 * card editor so they all look and fold the same way.
 */

import { LitElement, css, html, nothing } from 'lit';
import { defineElement } from '../../core/register';
import { tokens } from '../shared-styles';

export class VividEditorSection extends LitElement {
  static override properties = {
    icon: {},
    heading: {},
    hint: {},
    open: { type: Boolean, reflect: true },
  };

  declare icon?: string;
  declare heading: string;
  declare hint?: string;
  declare open: boolean;

  constructor() {
    super();
    this.heading = '';
    this.open = false;
  }

  private toggle(): void {
    this.open = !this.open;
    this.dispatchEvent(new CustomEvent('section-toggle', { detail: { open: this.open } }));
  }

  protected override render() {
    return html`<div class="section">
      <button class="head" aria-expanded=${this.open ? 'true' : 'false'} @click=${this.toggle}>
        ${this.icon ? html`<ha-icon .icon=${this.icon}></ha-icon>` : nothing}
        <span class="title">${this.heading}</span>
        <span class="hint">${this.hint ?? ''}</span>
        <ha-icon class="chevron" .icon=${'mdi:chevron-down'}></ha-icon>
      </button>
      ${this.open ? html`<div class="body"><slot></slot></div>` : nothing}
    </div>`;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .section {
        border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
        border-radius: 12px;
      }
      .head {
        appearance: none;
        border: none;
        background: none;
        font: inherit;
        color: inherit;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        cursor: pointer;
        text-align: left;
      }
      .head:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: -2px;
        border-radius: 12px;
      }
      .title {
        font-weight: 500;
        flex: none;
      }
      .hint {
        flex: 1;
        min-width: 0;
        color: var(--secondary-text-color);
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .chevron {
        flex: none;
        transition: transform 0.2s ease;
      }
      :host([open]) .chevron {
        transform: rotate(180deg);
      }
      .body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 2px 14px 14px;
      }
    `,
  ];
}

defineElement('vivid-editor-section', VividEditorSection);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-editor-section': VividEditorSection;
  }
}
