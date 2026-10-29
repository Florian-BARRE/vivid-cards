/**
 * A light reading of what the TV shows, for the LED group in Ambilight mode:
 * every few seconds, a still of HyperHDR's captured picture shrunk to a few
 * pixels, whose edges give two or three colors. One small JPEG per read, only
 * while the card is on screen and the page visible.
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { colorDistance } from '../../core/color';
import type { HomeAssistant, Rgb } from '../../core/hass-types';
import { vivid } from '../hyperhdr/model';
import { edgeColors } from '../hyperhdr/vivid-hyperhdr-screen';

/** How often the picture is read. */
export const SCREEN_SAMPLE_MS = 4000;
const SAMPLE_W = 32;
const SAMPLE_H = 18;
/** Colors read around the picture before keeping the distinct ones. */
const EDGE_SEGMENTS = 6;
/** Colors closer than this count as one. */
const DISTINCT = 70;
/** At most this many colors in the palette. */
const MAX_COLORS = 3;
/** Below this brightness (0–255) the picture counts as black. */
const DARK = 14;

const DIM: Rgb = [60, 60, 72];

/**
 * The palette of a picture's edges (clockwise from the top left): its colors
 * at full strength, the close ones merged, at most three. A black picture
 * gives a dim grey.
 */
export function screenPalette(edges: readonly Rgb[]): Rgb[] {
  if (!edges.length) return [];
  const brightest = Math.max(...edges.map((rgb) => Math.max(...rgb)));
  if (brightest < DARK) return [DIM];
  const palette: Rgb[] = [];
  // Brightest edges first: they are what the strips show the most.
  const sorted = [...edges].sort((a, b) => Math.max(...b) - Math.max(...a));
  for (const edge of sorted) {
    if (Math.max(...edge) < DARK) continue;
    const color = vivid(edge);
    if (palette.every((kept) => colorDistance(kept, color) > DISTINCT)) palette.push(color);
    if (palette.length === MAX_COLORS) break;
  }
  return palette;
}

export class ScreenSampler implements ReactiveController {
  /** The last palette read; `undefined` until a picture was read. */
  colors?: Rgb[];
  private camera?: string;
  private active = false;
  private visible = false;
  private timer?: number;
  private busy = false;
  private observer?: IntersectionObserver;
  private canvas?: HTMLCanvasElement;
  /** Reads in a row that failed; three stop the reading. */
  private failures = 0;

  constructor(
    private readonly host: ReactiveControllerHost & HTMLElement,
    private readonly hass: () => HomeAssistant | undefined,
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver((entries) => {
        this.visible = entries.some((entry) => entry.isIntersecting);
        this.update();
      });
      this.observer.observe(this.host);
    } else {
      this.visible = true;
    }
    document.addEventListener('visibilitychange', this.update);
  }

  hostDisconnected(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    document.removeEventListener('visibilitychange', this.update);
    this.stop();
  }

  /** Reads the picture of `camera` while `active` (Ambilight mode). */
  sync(camera: string | undefined, active: boolean): void {
    if (camera !== this.camera) {
      this.camera = camera;
      this.failures = 0;
      this.colors = undefined;
    }
    this.active = active;
    if (!active) this.colors = undefined;
    this.update();
  }

  private readonly update = (): void => {
    const wanted =
      this.active &&
      !!this.camera &&
      this.failures < 3 &&
      this.visible &&
      document.visibilityState === 'visible';
    if (wanted && this.timer === undefined) {
      void this.sample();
      this.timer = window.setInterval(() => void this.sample(), SCREEN_SAMPLE_MS);
    } else if (!wanted) {
      this.stop();
    }
  };

  private stop(): void {
    if (this.timer !== undefined) window.clearInterval(this.timer);
    this.timer = undefined;
  }

  private async sample(): Promise<void> {
    const camera = this.camera;
    const token = camera ? this.hass()?.states[camera]?.attributes.access_token : undefined;
    if (!camera || typeof token !== 'string' || this.busy) return;
    this.busy = true;
    try {
      const image = new Image();
      image.decoding = 'async';
      image.src = `/api/camera_proxy/${camera}?token=${encodeURIComponent(token)}&t=${Date.now()}`;
      await image.decode();
      this.canvas ??= document.createElement('canvas');
      const canvas = this.canvas;
      canvas.width = SAMPLE_W;
      canvas.height = SAMPLE_H;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      context.drawImage(image, 0, 0, SAMPLE_W, SAMPLE_H);
      const { data } = context.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
      const palette = screenPalette(edgeColors(data, SAMPLE_W, SAMPLE_H, EDGE_SEGMENTS));
      this.failures = 0;
      if (!this.active || !palette.length) return;
      if (JSON.stringify(palette) !== JSON.stringify(this.colors)) {
        this.colors = palette;
        this.host.requestUpdate();
      }
    } catch {
      // No picture (camera off, no admin rights): after three misses, keep the drifting palette.
      this.failures += 1;
      if (this.failures >= 3) this.stop();
    } finally {
      this.busy = false;
    }
  }
}
