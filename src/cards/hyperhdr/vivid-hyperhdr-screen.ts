import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { fireEvent } from '../../core/actions';
import { rgbCss } from '../../core/color';
import { meanColor } from '../../core/glow';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import { defineElement } from '../../core/register';
import { tokens } from '../../components/shared-styles';

/** Colors read around the picture, clockwise from the top left corner. */
export const FRAME_SEGMENTS = 24;
/** Size the picture is shrunk to before its edges are read. */
const SAMPLE_W = 32;
const SAMPLE_H = 18;
/** How often the edges are read while the picture plays. */
const SAMPLE_MS = 400;
/** The stream stops this long after the screen leaves the viewport. */
const HIDE_DELAY_MS = 1500;

/**
 * Colors along the edges of an RGBA image of `width` × `height`, clockwise
 * from the top left corner, averaged into `segments` colors.
 */
export function edgeColors(
  data: ArrayLike<number>,
  width: number,
  height: number,
  segments = FRAME_SEGMENTS,
): Rgb[] {
  const ring: Rgb[] = [];
  const at = (x: number, y: number): Rgb => {
    const index = (y * width + x) * 4;
    return [data[index] ?? 0, data[index + 1] ?? 0, data[index + 2] ?? 0];
  };
  for (let x = 0; x < width; x += 1) ring.push(at(x, 0));
  for (let y = 1; y < height; y += 1) ring.push(at(width - 1, y));
  for (let x = width - 2; x >= 0; x -= 1) ring.push(at(x, height - 1));
  for (let y = height - 2; y > 0; y -= 1) ring.push(at(0, y));
  const out: Rgb[] = [];
  for (let segment = 0; segment < segments; segment += 1) {
    const from = Math.floor((segment / segments) * ring.length);
    const to = Math.max(from + 1, Math.floor(((segment + 1) / segments) * ring.length));
    out.push(meanColor(ring.slice(from, to)));
  }
  return out;
}

/**
 * A conic gradient that puts `colors` (clockwise from the top left corner)
 * around a box: the first color starts at the top left.
 */
export function frameGradient(colors: readonly Rgb[]): string {
  if (!colors.length) return 'none';
  // The top left corner of a 16:9 box is about 300° from the top.
  const stops = [...colors, colors[0] as Rgb].map(
    (rgb, index) => `${rgbCss(rgb)} ${((index / colors.length) * 360).toFixed(1)}deg`,
  );
  return `conic-gradient(from -60deg, ${stops.join(', ')})`;
}

/**
 * The picture HyperHDR captures, framed by the colors of its edges, as the
 * LEDs behind the screen show them. The camera streams only while the screen
 * is on screen; without a camera the frame shows `fallback`.
 */
export class VividHyperHdrScreen extends LitElement {
  static override properties = {
    hass: { attribute: false },
    camera: {},
    fallback: { attribute: false },
    tags: { attribute: false },
    placeholder: {},
    colors: { state: true },
    live: { state: true },
  };

  declare hass?: HomeAssistant;
  declare camera?: string;
  /** Colors of the frame without a picture. */
  declare fallback: Rgb[];
  /** Small labels over the picture: [left, right]. */
  declare tags: [string?, string?];
  declare placeholder?: string;
  declare colors: Rgb[];
  /** The stream is running. */
  declare live: boolean;

  private url?: string;
  private observer?: IntersectionObserver;
  private visible = false;
  private hideTimer?: number;
  private sampleTimer?: number;
  private canvas?: HTMLCanvasElement;
  private tainted = false;

  constructor() {
    super();
    this.fallback = [];
    this.tags = [];
    this.colors = [];
    this.live = false;
  }

  static override styles = [
    tokens,
    css`
      :host {
        display: block;
      }
      .screen {
        position: relative;
        padding: 6px;
        border-radius: 16px;
        background: var(--vivid-layer-2);
      }
      .glow,
      .frame {
        position: absolute;
        border-radius: 16px;
        transition: background 0.6s ease;
      }
      .glow {
        inset: -4px;
        filter: blur(calc(14px * var(--vivid-glow, 1)));
        opacity: calc(0.7 * var(--vivid-glow-alpha, 1));
      }
      .frame {
        inset: 0;
      }
      .pic {
        position: relative;
        display: grid;
        place-items: center;
        aspect-ratio: 16 / 9;
        border-radius: 11px;
        overflow: hidden;
        background: #000;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 12px;
        text-align: center;
        font-size: 12.5px;
        color: rgba(255, 255, 255, 0.7);
      }
      .empty ha-icon {
        --mdc-icon-size: 28px;
        opacity: 0.7;
      }
      .tag {
        position: absolute;
        top: 8px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 8px;
        border-radius: 9px;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        font-size: 11px;
        font-weight: 600;
      }
      .tag.left {
        left: 8px;
      }
      .tag.right {
        right: 8px;
      }
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--error-color, #ef5350);
        box-shadow: 0 0 6px var(--error-color, #ef5350);
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('visibilitychange', this.onVisibility);
    this.observer = new IntersectionObserver((entries) => {
      this.visible = entries.some((entry) => entry.isIntersecting);
      this.syncStream();
    });
    this.observer.observe(this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.observer?.disconnect();
    this.observer = undefined;
    this.visible = false;
    this.stop();
  }

  private readonly onVisibility = (): void => this.syncStream();

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('camera')) {
      this.url = undefined;
      this.tainted = false;
      if (this.live) this.stop();
      this.syncStream();
    }
  }

  private wanted(): boolean {
    return !!this.camera && this.visible && document.visibilityState === 'visible';
  }

  private syncStream(): void {
    window.clearTimeout(this.hideTimer);
    if (this.wanted()) {
      if (!this.live) this.start();
      return;
    }
    if (this.live) this.hideTimer = window.setTimeout(() => this.stop(), HIDE_DELAY_MS);
  }

  private start(): void {
    const camera = this.camera;
    const token = camera ? this.hass?.states[camera]?.attributes.access_token : undefined;
    if (!camera || typeof token !== 'string') return;
    // The URL stays fixed while the stream runs: a new token would restart it.
    this.url = `/api/camera_proxy_stream/${camera}?token=${encodeURIComponent(token)}`;
    this.live = true;
    window.clearInterval(this.sampleTimer);
    this.sampleTimer = window.setInterval(() => this.sample(), SAMPLE_MS);
  }

  private stop(): void {
    window.clearInterval(this.sampleTimer);
    this.sampleTimer = undefined;
    // Dropping the source closes the stream: the integration stops it soon after.
    this.url = undefined;
    this.live = false;
  }

  private sample(): void {
    const img = this.renderRoot.querySelector('img');
    if (!img || !img.naturalWidth || this.tainted) return;
    this.canvas ??= document.createElement('canvas');
    const canvas = this.canvas;
    canvas.width = SAMPLE_W;
    canvas.height = SAMPLE_H;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    try {
      context.drawImage(img, 0, 0, SAMPLE_W, SAMPLE_H);
      const { data } = context.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
      const colors = edgeColors(data, SAMPLE_W, SAMPLE_H);
      this.colors = colors;
      fireEvent(this, 'vivid-screen-colors', { colors, mean: meanColor(colors) });
    } catch {
      // A picture from another origin cannot be read: keep the fallback frame.
      this.tainted = true;
    }
  }

  private readonly onError = (): void => {
    // The token expired or the camera went away: try again with a new one.
    this.stop();
    window.setTimeout(() => this.syncStream(), 2000);
  };

  protected override render() {
    const colors = this.live && this.colors.length ? this.colors : this.fallback;
    const gradient = frameGradient(colors);
    const [left, right] = this.tags;
    return html`<div class="screen">
      <div class="glow" style=${styleMap({ background: gradient })}></div>
      <div class="frame" style=${styleMap({ background: gradient })}></div>
      <div class="pic">
        ${
          this.url
            ? html`<img src=${this.url} alt="" @error=${this.onError} />`
            : html`<div class="empty">
                <ha-icon icon="mdi:monitor-screenshot"></ha-icon>${this.placeholder ?? nothing}
              </div>`
        }
        ${
          left
            ? html`<span class="tag left"
                >${this.live ? html`<span class="dot"></span>` : nothing}${left}</span
              >`
            : nothing
        }
        ${right ? html`<span class="tag right">${right}</span>` : nothing}
      </div>
    </div>`;
  }
}

defineElement('vivid-hyperhdr-screen', VividHyperHdrScreen);

declare global {
  interface HTMLElementTagNameMap {
    'vivid-hyperhdr-screen': VividHyperHdrScreen;
  }
}

/** Fallback frame colors of one tint: a slow gradient around it. */
export function tintFrame(rgb: Rgb): Rgb[] {
  return Array.from({ length: 12 }, (_, index) => {
    const k = 0.75 + 0.25 * Math.cos((index / 12) * Math.PI * 2);
    return rgb.map((value) => Math.round(value * k)) as Rgb;
  });
}
