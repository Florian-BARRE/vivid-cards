import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import type { ClimateKind, ComfortRange } from '../../core/climate';
import type { HomeAssistant } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { localize } from '../../i18n';
import { buttonReset, tokens } from '../../components/shared-styles';
import type { ClimateRange } from '../../components/vivid-climate-chart';
import type { ClimateRoomSource } from '../../components/vivid-climate-rooms';
import '../../components/vivid-climate-chart';
import '../../components/vivid-climate-rooms';

/**
 * Details of a climate badge: the history of its sensor, or one small curve
 * per room for several sensors. Tapping a room shows its own chart, with a
 * way back to every room.
 */
export class VividClimateDetails extends LitElement {
  static override properties = {
    hass: { attribute: false },
    kind: { attribute: false },
    sources: { attribute: false },
    comfort: { attribute: false },
    range: { attribute: false },
    heading: { attribute: false },
    summary: { attribute: false },
    session: { attribute: false },
    _selected: { state: true },
  };

  declare hass?: HomeAssistant;
  declare kind: ClimateKind;
  declare sources: ClimateRoomSource[];
  /** Scale units. */
  declare comfort?: ComfortRange;
  declare range: ClimateRange;
  declare heading?: string;
  declare summary?: string;
  /** Changes each time the details open: they open on every room again. */
  declare session: number;
  declare _selected?: string;

  constructor() {
    super();
    this.kind = 'temperature';
    this.sources = [];
    this.range = '24h';
    this.session = 0;
  }

  static override styles = [
    tokens,
    buttonReset,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 6px 2px;
        min-width: 0;
      }
      .titles {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 2px 8px;
        min-width: 0;
      }
      .title {
        font-size: 14px;
        font-weight: 600;
      }
      .muted {
        color: var(--secondary-text-color);
        font-size: 12px;
      }
      .back {
        display: inline-grid;
        place-items: center;
        flex: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--vivid-layer-1);
        color: var(--primary-text-color);
        cursor: pointer;
      }
      .back:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .back ha-icon {
        --mdc-icon-size: 18px;
        display: inline-flex;
      }
    `,
  ];

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('session') || changed.has('sources')) {
      if (!this.sources.some((source) => source.entityId === this._selected)) {
        this._selected = undefined;
      }
      if (changed.has('session')) this._selected = undefined;
    }
  }

  private readonly onRoomSelect = (event: Event): void => {
    const entityId = (event as CustomEvent<{ entityId?: string }>).detail?.entityId;
    if (entityId) this._selected = entityId;
  };

  private chart(entityId: string | undefined) {
    return html`<vivid-climate-chart
      .hass=${this.hass}
      .entityId=${entityId}
      .kind=${this.kind}
      .comfort=${this.comfort}
      .range=${this.range}
    ></vivid-climate-chart>`;
  }

  protected override render() {
    const selected = this.sources.find((source) => source.entityId === this._selected);
    if (selected) {
      return html`<div class="head">
          <button
            type="button"
            class="reset back"
            aria-label=${localize(this.hass, 'climate_all_rooms')}
            title=${localize(this.hass, 'climate_all_rooms')}
            @click=${() => {
              this._selected = undefined;
            }}
          >
            <ha-icon icon="mdi:chevron-left"></ha-icon>
          </button>
          <div class="titles">
            <span class="title">${selected.name ?? selected.entityId}</span>
            <span class="muted">${this.heading}</span>
          </div>
        </div>
        ${this.chart(selected.entityId)}`;
    }
    return html`<div class="head">
        <div class="titles">
          <span class="title">${this.heading}</span>
          ${this.summary ? html`<span class="muted">${this.summary}</span>` : nothing}
        </div>
      </div>
      ${
        this.sources.length > 1
          ? html`<vivid-climate-rooms
              .hass=${this.hass}
              .sources=${this.sources}
              .kind=${this.kind}
              .comfort=${this.comfort}
              .range=${this.range}
              @vivid-climate-room-select=${this.onRoomSelect}
            ></vivid-climate-rooms>`
          : this.chart(this.sources[0]?.entityId)
      }`;
  }
}

defineElement('vivid-climate-details', VividClimateDetails);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-climate-details': VividClimateDetails;
  }
}
