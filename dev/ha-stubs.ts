/**
 * Stand-ins for the Home Assistant elements the cards rely on (`ha-card`,
 * `ha-icon`, `ha-form`), for the preview page only. The form stub covers the
 * selectors the editors use and looks close enough to the real fields; it is
 * not a reimplementation of `ha-form`.
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

interface FieldSchema {
  name: string;
  type?: string;
  required?: boolean;
  schema?: FieldSchema[];
  selector?: Record<string, Record<string, unknown> | undefined>;
}

interface StubHass {
  states: Record<string, { attributes: Record<string, unknown> }>;
}

const FORM_STYLE = `
  :host { display: block; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px 12px; }
  .stack { display: flex; flex-direction: column; gap: 8px; }
  .field { position: relative; display: flex; flex-direction: column; border-radius: 6px 6px 0 0;
    background: rgba(var(--rgb-primary-text-color), 0.05);
    border-bottom: 1px solid rgba(var(--rgb-primary-text-color), 0.35); }
  .field:focus-within { border-bottom: 2px solid var(--primary-color); }
  .field label { font-size: 11px; color: var(--secondary-text-color); padding: 7px 12px 0; }
  .field:focus-within label { color: var(--primary-color); }
  .row { display: flex; align-items: center; gap: 6px; padding: 0 12px 6px; }
  input, select { all: unset; flex: 1; min-width: 0; font: inherit; font-size: 14px;
    color: var(--primary-text-color); padding: 3px 0; }
  select { cursor: pointer; }
  select option { background: var(--card-background-color); color: var(--primary-text-color); }
  input::placeholder { color: var(--secondary-text-color); opacity: .7; }
  .unit { color: var(--secondary-text-color); font-size: 13px; }
  .helper { font-size: 11px; color: var(--secondary-text-color); padding: 3px 12px 0; }
  .wrap { display: flex; flex-direction: column; }
  ha-icon { --mdc-icon-size: 20px; color: var(--secondary-text-color); }
  .bool { display: flex; align-items: center; justify-content: space-between; gap: 12px;
    min-height: 40px; cursor: pointer; font-size: 14px; }
  .bool input { all: revert; appearance: none; position: relative; width: 36px; height: 20px;
    margin: 0; border-radius: 10px; background: rgba(var(--rgb-primary-text-color), .25);
    cursor: pointer; flex: none; }
  .bool input::after { content: ''; position: absolute; top: 3px; left: 3px; width: 14px;
    height: 14px; border-radius: 50%; background: var(--primary-text-color); transition: transform .2s; }
  .bool input:checked { background: rgba(3, 169, 244, .55); }
  .bool input:checked::after { transform: translateX(16px); background: var(--primary-color); }
`;

class StubForm extends HTMLElement {
  hass?: StubHass;
  computeLabel?: (schema: FieldSchema) => string | undefined;
  computeHelper?: (schema: FieldSchema) => string | undefined;
  private _schema: FieldSchema[] = [];
  private _data: Record<string, unknown> = {};
  private _built = '';
  private readonly inputs = new Map<string, HTMLInputElement | HTMLSelectElement>();

  set schema(value: FieldSchema[]) {
    this._schema = value;
    queueMicrotask(() => this.update());
  }

  get schema(): FieldSchema[] {
    return this._schema;
  }

  set data(value: Record<string, unknown>) {
    this._data = value ?? {};
    queueMicrotask(() => this.update());
  }

  get data(): Record<string, unknown> {
    return this._data;
  }

  connectedCallback(): void {
    this.update();
  }

  private label(field: FieldSchema): string {
    return this.computeLabel?.(field) ?? field.name;
  }

  private update(): void {
    if (!this.isConnected) return;
    const key = JSON.stringify(this._schema.map((field) => this.signature(field)));
    if (key !== this._built) {
      this._built = key;
      this.build();
    }
    // Keep the field being edited untouched so typing is not interrupted.
    const active = this.shadowRoot?.activeElement;
    for (const [name, input] of this.inputs) {
      if (input === active) continue;
      const value = this._data[name];
      if (input instanceof HTMLInputElement && input.type === 'checkbox') {
        input.checked = Boolean(value);
      } else {
        input.value = value === undefined || value === null ? '' : String(value);
      }
      const icon = input.parentElement?.querySelector('ha-icon[data-preview]');
      if (icon) (icon as HTMLElement & { icon: string }).icon = String(value ?? 'mdi:lightbulb');
    }
  }

  private signature(field: FieldSchema): unknown {
    return {
      ...field,
      label: this.label(field),
      helper: this.computeHelper?.(field),
      schema: field.schema?.map((child) => this.signature(child)),
    };
  }

  private emit(name: string, value: unknown): void {
    const next = { ...this._data };
    if (value === undefined || value === '') delete next[name];
    else next[name] = value;
    this._data = next;
    this.dispatchEvent(
      new CustomEvent('value-changed', { detail: { value: next }, bubbles: true, composed: true }),
    );
  }

  private build(): void {
    const root = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${FORM_STYLE}</style>`;
    this.inputs.clear();
    const stack = document.createElement('div');
    stack.className = 'stack';
    for (const field of this._schema) stack.append(this.renderField(field));
    root.append(stack);
  }

  private renderField(field: FieldSchema): HTMLElement {
    if (field.type === 'grid') {
      const grid = document.createElement('div');
      grid.className = 'grid';
      for (const child of field.schema ?? []) grid.append(this.renderField(child));
      return grid;
    }
    const selector = field.selector ?? {};
    const [kind = 'text', options = {}] = Object.entries(selector)[0] ?? [];
    const opts = options ?? {};

    if (kind === 'boolean') {
      const row = document.createElement('label');
      row.className = 'bool';
      row.textContent = this.label(field);
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.addEventListener('change', () => this.emit(field.name, input.checked));
      row.append(input);
      this.inputs.set(field.name, input);
      return row;
    }

    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    const box = document.createElement('div');
    box.className = 'field';
    const label = document.createElement('label');
    label.textContent = this.label(field) + (field.required ? ' *' : '');
    const row = document.createElement('div');
    row.className = 'row';
    box.append(label, row);
    wrap.append(box);

    let input: HTMLInputElement | HTMLSelectElement;
    if (kind === 'select' || kind === 'entity') {
      const select = document.createElement('select');
      const choices =
        kind === 'select'
          ? ((opts.options as { value: string; label: string }[]) ?? [])
          : this.entityChoices(opts);
      if (kind === 'entity') select.append(new Option('—', ''));
      for (const choice of choices) select.append(new Option(choice.label, choice.value));
      select.addEventListener('change', () => this.emit(field.name, select.value || undefined));
      input = select;
    } else {
      const text = document.createElement('input');
      text.type = kind === 'number' ? 'number' : 'text';
      if (kind === 'number') {
        if (opts.min !== undefined) text.min = String(opts.min);
        if (opts.max !== undefined) text.max = String(opts.max);
        if (opts.step !== undefined) text.step = String(opts.step);
      }
      text.addEventListener('input', () => {
        if (kind !== 'number') return this.emit(field.name, text.value);
        const number = text.value === '' ? undefined : Number(text.value);
        this.emit(field.name, Number.isFinite(number) ? number : undefined);
      });
      input = text;
    }
    if (kind === 'icon') {
      const preview = document.createElement('ha-icon');
      preview.dataset.preview = '';
      row.append(preview);
      (input as HTMLInputElement).placeholder = 'mdi:…';
    }
    row.append(input);
    if (kind === 'number' && opts.unit_of_measurement) {
      const unit = document.createElement('span');
      unit.className = 'unit';
      unit.textContent = String(opts.unit_of_measurement);
      row.append(unit);
    }
    const helper = this.computeHelper?.(field);
    if (helper) {
      const hint = document.createElement('div');
      hint.className = 'helper';
      hint.textContent = helper;
      wrap.append(hint);
    }
    this.inputs.set(field.name, input);
    return wrap;
  }

  private entityChoices(options: Record<string, unknown>): { value: string; label: string }[] {
    const states = this.hass?.states ?? {};
    return Object.entries(states)
      .filter(([id, state]) => {
        const domains = [options.domain].flat().filter(Boolean).map(String);
        if (domains.length && !domains.some((domain) => id.startsWith(`${domain}.`))) return false;
        if (options.device_class && state.attributes.device_class !== options.device_class) {
          return false;
        }
        return true;
      })
      .map(([id, state]) => ({
        value: id,
        label: `${String(state.attributes.friendly_name ?? id)} (${id})`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }
}

export function defineHaStubs(): void {
  if (!customElements.get('ha-icon')) customElements.define('ha-icon', StubIcon);
  if (!customElements.get('ha-card')) customElements.define('ha-card', StubCard);
  if (!customElements.get('ha-form')) customElements.define('ha-form', StubForm);
}
