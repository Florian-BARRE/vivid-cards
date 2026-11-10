/* ====== Code Summary ======
 * Hosts the visual editor of another Vivid element (a badge inside a room
 * header) so its options are set in the interface too: builds the element's
 * own editor (`getConfigElement`), keeps it in sync with the config, and
 * fires `native-config-changed` with what it writes.
 */

import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { fireEvent } from '../../core/actions';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';

type EditorElement = HTMLElement & {
  hass?: HomeAssistant;
  setConfig?(config: Record<string, unknown>): void;
};

type EditableClass = CustomElementConstructor & { getConfigElement?: () => HTMLElement };

export class VividNativeEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    config: { attribute: false },
  };

  declare hass?: HomeAssistant;
  /** Config of the element, with its `type` (`custom:vivid-door-badge`). */
  declare config?: Record<string, unknown>;
  private editor?: EditorElement;
  private editorTag?: string;
  /** Last config written by the editor, not to push it back to itself. */
  private echoed?: string;

  protected override willUpdate(changed: PropertyValues<this>): void {
    const tag = String(this.config?.type ?? '').replace(/^custom:/, '');
    if (tag !== this.editorTag) {
      this.editorTag = tag;
      const element = customElements.get(tag) as EditableClass | undefined;
      this.editor = element?.getConfigElement?.() as EditorElement | undefined;
      this.editor?.addEventListener('config-changed', (event: Event) => {
        event.stopPropagation();
        const config = (event as CustomEvent<{ config: Record<string, unknown> }>).detail.config;
        this.echoed = JSON.stringify(config);
        fireEvent(this, 'native-config-changed', { config });
      });
      this.echoed = undefined;
    }
    if (!this.editor) return;
    if (changed.has('hass')) this.editor.hass = this.hass;
    if (changed.has('config') && this.config && JSON.stringify(this.config) !== this.echoed) {
      this.editor.setConfig?.({ ...this.config });
    }
  }

  protected override render() {
    return this.editor ? html`${this.editor}` : nothing;
  }
}

defineElement('vivid-native-editor', VividNativeEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-native-editor': VividNativeEditor;
  }
}
