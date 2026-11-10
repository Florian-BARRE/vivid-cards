/* ====== Code Summary ======
 * The halo behind a room's title: one amber glow per group of lamps or
 * switches, one glow per color light in its current color, each as bright as
 * its light, spread from left to right.
 */

import { WARM_WHITE, clamp, lightColor } from '../../core/color';
import { domainOf, expandGroup } from '../../core/entities';
import type { HomeAssistant, LightAttributes, Rgb } from '../../core/hass-types';

/** Halo of lamps, plugs and white lights. */
export const AMBER: Rgb = [255, 193, 7];

/** Color modes of a light that can show a color of its own (LED strips). */
const COLOR_MODES = new Set(['hs', 'rgb', 'rgbw', 'rgbww', 'xy']);

export function isOn(hass: HomeAssistant, entityId: string): boolean {
  return hass.states[entityId]?.state === 'on';
}

/** One glow behind the title. Positions and sizes are percentages of the card. */
export interface HaloSource {
  /** The group (lamps) or the strip it stands for; stable across updates. */
  id: string;
  rgb: Rgb;
  /** 0–1, from the brightness; 0 when off. */
  strength: number;
  on: boolean;
  x: number;
  y: number;
  /** Radii of the glow. */
  rx: number;
  ry: number;
}

function brightnessShare(hass: HomeAssistant, entityId: string): number {
  const state = hass.states[entityId];
  if (domainOf(entityId) !== 'light') return 1;
  const brightness = (state?.attributes as LightAttributes | undefined)?.brightness;
  return typeof brightness === 'number' ? clamp(brightness / 255, 0, 1) : 1;
}

/** A light able to show a color of its own: it gets a glow of its own color. */
function isColorLight(hass: HomeAssistant, entityId: string): boolean {
  if (domainOf(entityId) !== 'light') return false;
  const modes = (hass.states[entityId]?.attributes as LightAttributes | undefined)
    ?.supported_color_modes;
  return Array.isArray(modes) && modes.some((mode) => COLOR_MODES.has(mode));
}

/**
 * Glows behind the title: one amber glow per group of lamps or switches (its
 * strength is the mean brightness of the lamps on), one per color light in
 * its current color. Glows that are on are spread from left to right (lamps
 * first); the others stay in the middle, invisible, so they fade in place.
 */
export function haloSources(hass: HomeAssistant, lights: readonly string[]): HaloSource[] {
  const lamps: HaloSource[] = [];
  const colored: HaloSource[] = [];
  const seen = new Set<string>();
  for (const group of lights) {
    const plain: string[] = [];
    for (const member of expandGroup(hass, group)) {
      if (seen.has(member)) continue;
      seen.add(member);
      if (!isColorLight(hass, member)) {
        plain.push(member);
        continue;
      }
      const on = isOn(hass, member);
      colored.push(
        source(
          member,
          on ? (lightColor(hass.states[member]) ?? WARM_WHITE) : WARM_WHITE,
          on ? brightnessShare(hass, member) : 0,
        ),
      );
    }
    if (plain.length === 0) continue;
    const lit = plain.filter((member) => isOn(hass, member));
    const strength = lit.length
      ? lit.reduce((sum, member) => sum + brightnessShare(hass, member), 0) / lit.length
      : 0;
    lamps.push(source(group, AMBER, strength, lit.length > 0));
  }
  const sources = [...lamps, ...colored];
  const lit = sources.filter((item) => item.on);
  const count = lit.length;
  lit.forEach((item, index) => {
    if (count === 1) {
      Object.assign(item, { x: 50, y: 25, rx: 45, ry: 70 });
      return;
    }
    const span = Math.min(48, 24 * (count - 1));
    item.x = round1(50 - span / 2 + (span * index) / (count - 1));
    item.y = index % 2 === 0 ? 22 : 30;
    item.rx = clamp(46 - 4 * count, 24, 45);
    item.ry = 60;
  });
  return sources;
}

function source(id: string, rgb: Rgb, strength: number, on = strength > 0): HaloSource {
  return { id, rgb, strength: round2(strength), on, x: 50, y: 25, rx: 45, ry: 70 };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
