import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { fireEvent, haptic, pressButton, toggleEntity } from '../core/actions';
import { isAvailable } from '../core/entities';
import { activeTone } from '../core/glow';
import type { HomeAssistant } from '../core/hass-types';
import { defineElement } from '../core/register';
import { formatDuration, formatNumber, localize, type StringKey } from '../i18n';
import { wifiIcon, wledHealth, type WledEntities } from '../integrations/wled';
import { buttonReset, tokens } from './shared-styles';
import './vivid-chip';

const SWITCHES: {
  role: 'nightlight' | 'syncSend' | 'syncReceive';
  icon: string;
  label: StringKey;
}[] = [
  { role: 'nightlight', icon: 'mdi:weather-night', label: 'nightlight' },
  { role: 'syncSend', icon: 'mdi:upload-network-outline', label: 'sync_send' },
  { role: 'syncReceive', icon: 'mdi:download-network-outline', label: 'sync_receive' },
];

const CONFIRM_MS = 3000;

/**
 * Collapsible device facts of a WLED strip: Wi-Fi, uptime, LEDs, current
 * limit, memory, IP and firmware, the nightlight and sync switches, and the
 * update and restart actions. The
 * restart needs a second tap; the update opens Home Assistant's dialog.
 */
export class VividWledHealth extends LitElement {
  static override properties = {
    hass: { attribute: false },
    entities: { attribute: false },
    _confirm: { state: true },
    _open: { state: true },
  };

  declare hass?: HomeAssistant;
  declare entities?: WledEntities;
  declare _confirm: boolean;
  declare _open: boolean;

  private confirmTimer?: number;

  constructor() {
    super();
    this._confirm = false;
    this._open = false;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.confirmTimer);
  }

  static override styles = [
    tokens,
    buttonReset,
    css`
      :host {
        display: block;
      }
      summary {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: calc(var(--vivid-chip-height) - 4px);
        padding: 0 4px;
        border-radius: 10px;
        list-style: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 13px;
        -webkit-tap-highlight-color: transparent;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      summary:focus-visible {
        outline: 2px solid var(--vivid-focus);
        outline-offset: 2px;
      }
      ha-icon {
        --mdc-icon-size: 16px;
        display: inline-flex;
        flex: none;
      }
      .title {
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .facts {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-variant-numeric: tabular-nums;
      }
      .weak {
        color: var(--warning-color, #ffa600);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 10px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.18);
        color: var(--primary-color);
        font-size: 11px;
        font-weight: 600;
      }
      .chevron {
        margin-left: auto;
        transition: transform 0.2s ease;
      }
      details[open] .chevron {
        transform: rotate(180deg);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 6px 12px;
        padding: 8px 4px 4px;
      }
      .fact {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .fact .label {
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      .fact .value {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 8px 4px 2px;
      }
      .action {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: calc(var(--vivid-chip-height) - 4px);
        padding: 0 12px;
        border-radius: calc(var(--vivid-chip-height) / 2);
        background: var(--vivid-chip-context, var(--vivid-layer-1));
        font-size: 13px;
        font-weight: 500;
      }
      .action.primary {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
        color: var(--primary-color);
      }
      .action.danger {
        background: rgba(219, 68, 55, 0.18);
        color: var(--error-color, #db4437);
      }
      @media (prefers-reduced-motion: reduce) {
        .chevron {
          transition: none;
        }
      }
    `,
  ];

  private readonly onRestart = (restart: string): void => {
    if (!this.hass) return;
    if (!this._confirm) {
      this._confirm = true;
      window.clearTimeout(this.confirmTimer);
      this.confirmTimer = window.setTimeout(() => (this._confirm = false), CONFIRM_MS);
      return;
    }
    window.clearTimeout(this.confirmTimer);
    this._confirm = false;
    haptic(this, 'warning');
    void pressButton(this.hass, restart);
  };

  private renderSwitches() {
    const chips = SWITCHES.flatMap((spec) => {
      const entityId = this.entities?.[spec.role];
      const state = entityId ? this.hass?.states[entityId] : undefined;
      if (!entityId || !state) return [];
      const on = state.state === 'on';
      return [
        html`<vivid-chip
          .icon=${spec.icon}
          .label=${localize(this.hass, spec.label)}
          .tone=${activeTone(on)}
          .pressed=${on}
          ?disabled=${!isAvailable(state)}
          @click=${() => {
            if (!this.hass) return;
            haptic(this, 'light');
            void toggleEntity(this.hass, entityId);
          }}
        ></vivid-chip>`,
      ];
    });
    return chips.length ? html`<div class="actions">${chips}</div>` : nothing;
  }

  private fact(label: string, value: TemplateResult | string | undefined) {
    if (value === undefined) return nothing;
    return html`<div class="fact">
      <span class="label">${label}</span><span class="value">${value}</span>
    </div>`;
  }

  protected override render() {
    if (!this.hass || !this.entities) return nothing;
    const hass = this.hass;
    const health = wledHealth(hass, this.entities);
    const known =
      health.signal !== undefined ||
      health.uptime !== undefined ||
      health.firmware !== undefined ||
      health.restartEntity !== undefined;
    if (!known) return nothing;
    const weak = health.signal !== undefined && health.signal < 40;
    const signal =
      health.signal === undefined
        ? undefined
        : `${formatNumber(hass, health.signal)} %${
            health.rssi !== undefined ? ` · ${formatNumber(hass, health.rssi)} dBm` : ''
          }`;
    const limit =
      health.maxCurrent === undefined
        ? undefined
        : health.maxCurrent > 0
          ? `${formatNumber(hass, health.maxCurrent / 1000, 1)} A`
          : localize(hass, 'limiter_off');
    const firmware = health.firmware
      ? health.updateAvailable && health.latestFirmware
        ? `${health.firmware} → ${health.latestFirmware}`
        : health.firmware
      : undefined;

    return html`<details
      ?open=${this._open}
      @toggle=${(event: Event) => (this._open = (event.target as HTMLDetailsElement).open)}
    >
      <summary>
        <ha-icon .icon=${'mdi:chip'}></ha-icon>
        <span class="title">${localize(hass, 'device')}</span>
        ${
          health.signal !== undefined
            ? html`<span class="facts ${weak ? 'weak' : ''}"
                ><ha-icon .icon=${wifiIcon(health.signal)}></ha-icon>${formatNumber(
                  hass,
                  health.signal,
                )}
                %</span
              >`
            : nothing
        }
        ${
          health.uptime !== undefined
            ? html`<span class="facts"
                ><ha-icon .icon=${'mdi:timer-outline'}></ha-icon>${formatDuration(
                  hass,
                  health.uptime,
                )}</span
              >`
            : nothing
        }
        ${
          health.updateAvailable
            ? html`<span class="badge"
                ><ha-icon .icon=${'mdi:arrow-up-circle'}></ha-icon>${
                  health.latestFirmware ?? ''
                }</span
              >`
            : nothing
        }
        <ha-icon class="chevron" .icon=${'mdi:chevron-down'}></ha-icon>
      </summary>
      ${
        this._open
          ? html`<div class="grid">
                ${this.fact(
                  localize(hass, 'wifi'),
                  signal
                    ? html`<ha-icon
                          class=${weak ? 'weak' : ''}
                          .icon=${wifiIcon(health.signal)}
                        ></ha-icon
                        >${signal}`
                    : undefined,
                )}
                ${this.fact(
                  localize(hass, 'uptime'),
                  health.uptime !== undefined ? formatDuration(hass, health.uptime) : undefined,
                )}
                ${this.fact(
                  localize(hass, 'leds'),
                  health.ledCount !== undefined ? formatNumber(hass, health.ledCount) : undefined,
                )}
                ${this.fact(localize(hass, 'current_limit'), limit)}
                ${this.fact(
                  localize(hass, 'memory'),
                  health.freeHeap !== undefined
                    ? `${formatNumber(hass, health.freeHeap / 1024)} kB`
                    : undefined,
                )}
                ${this.fact(localize(hass, 'ip'), health.ip)}
                ${this.fact(localize(hass, 'firmware'), firmware)}
              </div>
              ${this.renderSwitches()}
              <div class="actions">
                ${
                  health.updateEntity
                    ? html`<button
                        type="button"
                        class="reset action ${health.updateAvailable ? 'primary' : ''}"
                        @click=${() =>
                          fireEvent(this, 'vivid-more-info', { entityId: health.updateEntity })}
                      >
                        <ha-icon
                          .icon=${health.updateAvailable ? 'mdi:arrow-up-circle' : 'mdi:check-circle-outline'}
                        ></ha-icon>
                        ${
                          health.updateAvailable
                            ? localize(hass, 'update_available', {
                                version: health.latestFirmware ?? '',
                              })
                            : localize(hass, 'up_to_date')
                        }
                      </button>`
                    : nothing
                }
                ${
                  health.restartEntity
                    ? html`<button
                        type="button"
                        class="reset action ${this._confirm ? 'danger' : ''}"
                        @click=${() => this.onRestart(health.restartEntity as string)}
                      >
                        <ha-icon .icon=${'mdi:restart'}></ha-icon>
                        ${localize(hass, this._confirm ? 'restart_confirm' : 'restart')}
                      </button>`
                    : nothing
                }
              </div>`
          : nothing
      }
    </details>`;
  }
}

defineElement('vivid-wled-health', VividWledHealth);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-wled-health': VividWledHealth;
  }
}
