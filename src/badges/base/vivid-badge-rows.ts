import { LitElement, css, html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { fireEvent } from '../../core/actions';
import { rgbCss } from '../../core/color';
import type { ChipTone } from '../../core/glow';
import type { Rgb } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { buttonReset, tokens } from '../../components/shared-styles';

/** One line of a badge's details. */
export interface BadgeRow {
  /** Tapping the row opens this entity's Home Assistant dialog. */
  entityId?: string;
  icon: string;
  name: string;
  /** Right column ("open · 12 min", "9 %"). */
  value: string;
  /** Disc colors; neutral when undefined. */
  tone?: ChipTone;
  /** 0–1: a bar between the name and the value. */
  bar?: number;
  barColor?: Rgb;
  /** Spans (fractions 0–1) of a timeline instead of a bar. */
  spans?: [number, number][];
  spanColor?: Rgb;
  /** Resting state (closed, absent): drawn lighter. */
  dim?: boolean;
}

/**
 * Details of a status badge: a title, a summary and one row per entity.
 * Rows open the entity's Home Assistant dialog (`vivid-more-info`).
 */
export class VividBadgeRows extends LitElement {
  static override properties = {
    heading: {},
    summary: {},
    rows: { attribute: false },
    timelineLabels: { attribute: false },
    valueWidth: { attribute: 'value-width' },
  };

  declare heading?: string;
  declare summary?: string;
  declare rows: BadgeRow[];
  /** Start and end labels under timelines ("-6 h", "now"). */
  declare timelineLabels?: [string, string];
  /** Fixed width of the value column (a CSS length), so bars and timelines line up. */
  declare valueWidth?: string;

  constructor() {
    super();
    this.rows = [];
  }

  static override styles = [
    tokens,
    buttonReset,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .head {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 2px 8px;
        padding: 4px 6px 2px;
      }
      .title {
        font-size: 14px;
        font-weight: 600;
      }
      .muted {
        color: var(--secondary-text-color);
        font-size: 12px;
      }
      .row {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) var(--value-width, auto);
        align-items: center;
        gap: 10px;
        width: 100%;
        box-sizing: border-box;
        padding: 4px 10px 4px 4px;
        border-radius: 16px;
        background: var(--vivid-layer-1);
        text-align: left;
        cursor: pointer;
      }
      .row.with-bar {
        grid-template-columns: auto minmax(0, 1fr) minmax(64px, 30%) var(--value-width, auto);
      }
      .row:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      .row.dim {
        opacity: 0.6;
      }
      .dot {
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--dot-bg, rgba(var(--vivid-rgb-text), 0.08));
        box-shadow: var(--dot-shadow, none);
        color: var(--dot-color, var(--secondary-text-color));
      }
      .dot ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
      }
      .name {
        font-size: 13px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .value {
        font-size: 12px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        text-align: right;
      }
      .dim .value {
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .bar {
        height: 10px;
        border-radius: 5px;
        overflow: hidden;
        background: rgba(var(--vivid-rgb-text), 0.08);
      }
      .bar span {
        display: block;
        height: 100%;
        width: var(--level);
        border-radius: 5px;
        background: linear-gradient(90deg, var(--from), var(--to));
        transition: width 0.4s ease;
      }
      .timeline {
        position: relative;
        height: 10px;
        border-radius: 5px;
        background: rgba(var(--vivid-rgb-text), 0.08);
      }
      .timeline span {
        position: absolute;
        top: 0;
        bottom: 0;
        min-width: 3px;
        border-radius: 5px;
        background: var(--span);
      }
      .labels {
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }
      @media (prefers-reduced-motion: reduce) {
        .bar span {
          transition: none;
        }
      }
    `,
  ];

  private renderMiddle(row: BadgeRow) {
    if (row.spans) {
      const color = rgbCss(row.spanColor ?? [66, 165, 245], 0.8);
      return html`<div>
        <div class="timeline" style=${styleMap({ '--span': color })}>
          ${row.spans.map(
            ([from, to]) =>
              html`<span style=${`left: ${from * 100}%; width: ${(to - from) * 100}%`}></span>`,
          )}
        </div>
        ${
          this.timelineLabels
            ? html`<div class="labels">
                <span>${this.timelineLabels[0]}</span><span>${this.timelineLabels[1]}</span>
              </div>`
            : nothing
        }
      </div>`;
    }
    if (row.bar === undefined) return nothing;
    const color = row.barColor ?? [150, 150, 150];
    return html`<div
      class="bar"
      style=${styleMap({
        '--level': `${Math.round(Math.max(0, Math.min(1, row.bar)) * 100)}%`,
        '--from': rgbCss(color, 0.35),
        '--to': rgbCss(color, 0.95),
      })}
    >
      <span></span>
    </div>`;
  }

  private renderRow(row: BadgeRow) {
    const middle = row.bar !== undefined || row.spans !== undefined;
    return html`<button
      type="button"
      class=${classMap({ reset: true, row: true, 'with-bar': middle, dim: Boolean(row.dim) })}
      ?disabled=${!row.entityId}
      aria-label=${`${row.name} · ${row.value}`}
      @click=${() => {
        if (row.entityId) fireEvent(this, 'vivid-more-info', { entityId: row.entityId });
      }}
    >
      <span
        class="dot"
        style=${styleMap({
          '--dot-bg': row.tone?.background,
          '--dot-shadow': row.tone?.shadow,
          '--dot-color': row.tone?.iconColor,
        })}
        ><ha-icon .icon=${row.icon}></ha-icon
      ></span>
      <span class="name" title=${row.name}>${row.name}</span>
      ${middle ? this.renderMiddle(row) : nothing}
      <span class="value">${row.value}</span>
    </button>`;
  }

  protected override updated(): void {
    if (this.valueWidth) this.style.setProperty('--value-width', this.valueWidth);
    else this.style.removeProperty('--value-width');
  }

  protected override render() {
    return html`<div class="head">
        <span class="title">${this.heading}</span>
        ${this.summary ? html`<span class="muted">${this.summary}</span>` : nothing}
      </div>
      ${repeat(
        this.rows,
        (row, index) => row.entityId ?? `row-${index}`,
        (row) => this.renderRow(row),
      )}`;
  }
}

defineElement('vivid-badge-rows', VividBadgeRows);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-badge-rows': VividBadgeRows;
  }
}
