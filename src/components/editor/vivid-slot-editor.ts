/* ====== Code Summary ======
 * One slot in a visual editor (a card's lights, its presence sensor, the fan
 * of a device…): folded, its name, its mode and what it uses; unfolded, the
 * mode (auto / manual / off), every entity with where it comes from (found
 * by its name, in an area, as a group member; added; chosen), a box to keep
 * or leave out each found one, a picker to add one, and a way back to what is
 * found. Fires `slot-changed` with the new config value; the card editor
 * writes it under the slot's key.
 */

import { LitElement, html, nothing } from 'lit';
import { fireEvent } from '../../core/actions';
import { friendlyName } from '../../core/entities';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import {
  addEntity,
  moveEntity,
  readSlot,
  removeEntity,
  setExcluded,
  setMode,
  writeSlot,
  type ResolvedSlot,
  type SlotEntry,
  type SlotMode,
  type SlotValue,
} from '../../core/slots';
import { pilotNodeLabel } from '../../i18n/pilot';
import { slotText, type SlotStringKey } from '../../i18n/slots';
import { tokens } from '../shared-styles';
import { slotEditorStyles } from './slot-editor-styles';

/* ============================== Element ============================== */

export class VividSlotEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    label: {},
    icon: {},
    multiple: { type: Boolean },
    domains: { attribute: false },
    value: { attribute: false },
    resolved: { attribute: false },
    searched: {},
    pilot: { type: Boolean },
    modes: { attribute: false },
    open: { type: Boolean, reflect: true },
  };

  declare hass?: HomeAssistant;
  /** Name of the slot ("Presence"). */
  declare label: string;
  declare icon?: string;
  /** A list of entities, or one. */
  declare multiple: boolean;
  /** Domains offered by the picker. */
  declare domains?: readonly string[];
  /** The slot's value in the config. */
  declare value: SlotValue | unknown;
  /** What the card resolves for it now. */
  declare resolved?: ResolvedSlot;
  /** What the discovery looked for, shown when nothing is found. */
  declare searched?: string;
  /** The automatic mode follows Vivid Pilot (named "Pilot" rather than "Auto"). */
  declare pilot?: boolean;
  /** Modes offered (all by default; a group's members have no "off"). */
  declare modes?: readonly SlotMode[];
  declare open: boolean;

  constructor() {
    super();
    this.label = '';
    this.multiple = false;
    this.open = false;
  }

  private t(key: SlotStringKey, values?: Record<string, string | number>): string {
    return slotText(this.hass, key, values);
  }

  private emit(value: SlotValue): void {
    fireEvent(this, 'slot-changed', { value });
  }

  private parsed() {
    return readSlot(this.value);
  }

  private name(entity: string): string {
    return this.hass?.states[entity] ? friendlyName(this.hass, entity) : entity;
  }

  /* ------------------------------ header ------------------------------ */

  /** The key of a mode's word: the automatic mode is "Pilot" on a Vivid Pilot slot. */
  private modeKey(mode: SlotMode | 'tweaked', suffix = ''): SlotStringKey {
    if (this.pilot && mode === 'auto') return `mode_pilot${suffix}` as SlotStringKey;
    if (this.pilot && mode === 'tweaked') return 'mode_pilot_tweaked';
    return `mode_${mode}${suffix}` as SlotStringKey;
  }

  private modeLabel(): string {
    const resolved = this.resolved;
    if (!resolved) return this.t(this.modeKey('auto'));
    if (resolved.mode === 'off') return this.t('mode_off');
    if (resolved.mode === 'manual') return this.t('mode_manual');
    return this.t(this.modeKey(resolved.tweaked ? 'tweaked' : 'auto'));
  }

  private summary(): string {
    const entities = this.resolved?.entities ?? [];
    if (!entities.length) return this.t('summary_none');
    const first = this.name(entities[0]!);
    return entities.length === 1
      ? first
      : this.t('summary_more', { name: first, count: entities.length - 1 });
  }

  /* ------------------------------ body ------------------------------ */

  private setMode(mode: SlotMode): void {
    const current = this.resolved?.entities ?? [];
    this.emit(writeSlot(setMode(this.parsed(), mode, current), this.multiple));
  }

  private renderModes(mode: SlotMode) {
    const modes: readonly SlotMode[] = this.modes ?? ['auto', 'manual', 'off'];
    if (modes.length < 2)
      return html`<div class="help">${this.t(this.modeKey(mode, '_help'))}</div>`;
    return html`<div class="modes" role="radiogroup">
        ${modes.map(
          (item) =>
            html`<button
              class="mode ${item === mode ? 'on' : ''}"
              role="radio"
              aria-checked=${item === mode ? 'true' : 'false'}
              @click=${() => item !== mode && this.setMode(item)}
            >
              ${this.t(this.modeKey(item))}
            </button>`,
        )}
      </div>
      <div class="help">${this.t(this.modeKey(mode, '_help'))}</div>`;
  }

  private origin(entry: SlotEntry): string {
    if (entry.origin === 'added') return this.t('added');
    if (entry.origin === 'manual') return this.t('manual');
    const found = entry.found;
    if (!found) return '';
    const via = found.source === 'pilot' ? pilotNodeLabel(this.hass, found.via) : found.via;
    return this.t(`found_${found.source}` as SlotStringKey, { via });
  }

  private renderEntry(entry: SlotEntry, index: number, movable: string[]) {
    const known = !!this.hass?.states[entry.entity];
    const slot = this.parsed();
    const position = movable.indexOf(entry.entity);
    const update = (next: ReturnType<typeof readSlot>) => this.emit(writeSlot(next, this.multiple));
    return html`<div class="entry ${entry.excluded ? 'out' : ''}" data-index=${index}>
      ${
        entry.origin === 'found'
          ? html`<button
              class="check"
              role="checkbox"
              aria-checked=${entry.excluded ? 'false' : 'true'}
              title=${this.t(entry.excluded ? 'keep' : 'leave_out')}
              @click=${() => update(setExcluded(slot, entry.entity, !entry.excluded))}
            >
              <ha-icon
                .icon=${entry.excluded ? 'mdi:checkbox-blank-outline' : 'mdi:checkbox-marked'}
              ></ha-icon>
            </button>`
          : html`<span class="dot"><ha-icon .icon=${'mdi:plus-circle-outline'}></ha-icon></span>`
      }
      <span class="text">
        <span class="name">${this.name(entry.entity)}</span>
        <span class="id">${entry.entity}</span>
        <span class="tags">
          <span class="tag ${entry.origin}"
            >${entry.excluded ? this.t('left_out') : this.origin(entry)}</span
          >
          ${known ? nothing : html`<span class="tag warn">${this.t('missing')}</span>`}
        </span>
      </span>
      ${
        position >= 0 && this.multiple
          ? html`<button
                class="icon"
                title=${this.t('up')}
                ?disabled=${position === 0}
                @click=${() => update(moveEntity(slot, entry.entity, -1))}
              >
                <ha-icon .icon=${'mdi:arrow-up'}></ha-icon></button
              ><button
                class="icon"
                title=${this.t('down')}
                ?disabled=${position === movable.length - 1}
                @click=${() => update(moveEntity(slot, entry.entity, 1))}
              >
                <ha-icon .icon=${'mdi:arrow-down'}></ha-icon>
              </button>`
          : nothing
      }
      ${
        entry.origin !== 'found'
          ? html`<button
              class="icon danger"
              title=${this.t('remove')}
              @click=${() => update(removeEntity(slot, entry.entity))}
            >
              <ha-icon .icon=${'mdi:close'}></ha-icon>
            </button>`
          : nothing
      }
    </div>`;
  }

  private renderPicker() {
    const domains = this.domains?.length ? [...this.domains] : undefined;
    return html`<ha-form
      .hass=${this.hass}
      .data=${{ entity: '' }}
      .schema=${[{ name: 'entity', selector: { entity: domains ? { domain: domains } : {} } }]}
      .computeLabel=${() => this.t(this.multiple ? 'add' : 'pick')}
      @value-changed=${(event: CustomEvent<{ value: { entity?: string } }>) => {
        event.stopPropagation();
        const entity = event.detail.value.entity;
        if (entity)
          this.emit(writeSlot(addEntity(this.parsed(), entity, this.multiple), this.multiple));
      }}
    ></ha-form>`;
  }

  private renderBody() {
    const resolved = this.resolved;
    const mode = resolved?.mode ?? this.parsed().mode;
    if (mode === 'off') return this.renderModes(mode);
    const entries = resolved?.entries ?? [];
    const slot = this.parsed();
    const movable = mode === 'manual' ? slot.manual : slot.add;
    const empty =
      mode === 'auto' && !entries.some((entry) => entry.origin === 'found')
        ? html`<div class="note">
            ${this.searched ? this.t('nothing_found', { searched: this.searched }) : this.t('nothing_found_plain')}
          </div>`
        : nothing;
    return html`${this.renderModes(mode)} ${empty}
      <div class="entries">
        ${entries.map((entry, index) => this.renderEntry(entry, index, movable))}
      </div>
      ${this.renderPicker()}
      ${
        resolved?.tweaked
          ? html`<button class="link" @click=${() => this.setMode('auto')}>
              ${this.t('reset')}
            </button>`
          : nothing
      }`;
  }

  protected override render() {
    return html`<div class="slot">
      <button
        class="head"
        aria-expanded=${this.open ? 'true' : 'false'}
        @click=${() => (this.open = !this.open)}
      >
        ${this.icon ? html`<ha-icon class="lead" .icon=${this.icon}></ha-icon>` : nothing}
        <span class="label">${this.label}</span>
        <span
          class="mode-tag ${this.resolved?.mode ?? 'auto'} ${this.resolved?.tweaked ? 'tweaked' : ''}"
          >${this.modeLabel()}</span
        >
        <span class="summary">${this.summary()}</span>
        <ha-icon class="chevron" .icon=${'mdi:chevron-down'}></ha-icon>
      </button>
      ${this.open ? html`<div class="body">${this.renderBody()}</div>` : nothing}
    </div>`;
  }

  static override styles = [tokens, slotEditorStyles];
}

defineElement('vivid-slot-editor', VividSlotEditor);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-slot-editor': VividSlotEditor;
  }
}
