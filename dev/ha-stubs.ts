/**
 * Stand-ins for the Home Assistant elements the cards rely on (`ha-card`,
 * `ha-icon`), for the preview page only.
 */
import * as mdi from '@mdi/js';

const ICONS = mdi as unknown as Record<string, string>;

function iconPath(name: string | null | undefined): string {
  if (!name) return '';
  const key = `mdi${name
    .replace(/^mdi:/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')}`;
  return ICONS[key] ?? ICONS.mdiHelpCircleOutline ?? '';
}

class StubIcon extends HTMLElement {
  private _icon = '';

  static get observedAttributes(): string[] {
    return ['icon'];
  }

  get icon(): string {
    return this._icon;
  }

  set icon(value: string) {
    this._icon = value;
    this.draw();
  }

  attributeChangedCallback(_name: string, _old: string | null, value: string | null): void {
    this.icon = value ?? '';
  }

  connectedCallback(): void {
    this.draw();
  }

  private draw(): void {
    const root = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>
      :host { display: inline-flex; width: var(--mdc-icon-size, 24px); height: var(--mdc-icon-size, 24px); }
      svg { width: 100%; height: 100%; fill: currentColor; }
    </style><svg viewBox="0 0 24 24"><path d="${iconPath(this._icon)}"></path></svg>`;
  }
}

class StubCard extends HTMLElement {
  connectedCallback(): void {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>
      :host {
        display: block;
        background: var(--ha-card-background, var(--card-background-color));
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, none);
        border: 1px solid var(--ha-card-border-color, var(--divider-color));
        color: var(--primary-text-color);
      }
    </style><slot></slot>`;
  }
}

export function defineHaStubs(): void {
  if (!customElements.get('ha-icon')) customElements.define('ha-icon', StubIcon);
  if (!customElements.get('ha-card')) customElements.define('ha-card', StubCard);
}
