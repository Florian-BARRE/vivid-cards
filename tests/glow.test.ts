import { describe, expect, it } from 'vitest';
import {
  colorDistance,
  hsToRgb,
  kelvinToRgb,
  lightColor,
  parseColor,
  rgbHex,
} from '../src/core/color';
import {
  glowLevel,
  glowPercent,
  glowVars,
  lightTone,
  meanColor,
  softLightTone,
  whiteTone,
  powerColor,
  powerRatio,
  powerTone,
  toggleTone,
} from '../src/core/glow';
import type { HassEntity, Rgb } from '../src/core/hass-types';

const scale = { idle: 3, max: 40, steps: [10, 25] as const };

describe('power glow', () => {
  it('is neutral while idle', () => {
    expect(powerRatio(2, scale)).toBe(0);
    const tone = powerTone(2, scale);
    expect(tone.background).toBeUndefined();
    expect(tone.pulse).toBeUndefined();
    expect(powerTone(undefined, scale).shadow).toBeUndefined();
  });

  it('grows with the consumption and saturates at max', () => {
    expect(powerRatio(3, scale)).toBe(0);
    expect(powerRatio(21.5, scale)).toBeCloseTo(0.5);
    expect(powerRatio(80, scale)).toBe(1);
  });

  it('switches hue at each step', () => {
    expect(powerColor(5, scale)).toEqual([255, 213, 79]);
    expect(powerColor(10, scale)).toEqual([255, 179, 0]);
    expect(powerColor(25, scale)).toEqual([255, 112, 67]);
  });

  it('glows brighter, wider and pulses faster when drawing more', () => {
    const low = powerTone(4, scale);
    const high = powerTone(40, scale);
    expect(low.shadow).toBe(
      '0 0 calc(7px * var(--vivid-glow, 1)) rgba(255, 213, 79, calc(0.26 * var(--vivid-glow-alpha, 1)))',
    );
    expect(high.shadow).toBe(
      '0 0 calc(28px * var(--vivid-glow, 1)) rgba(255, 112, 67, calc(0.75 * var(--vivid-glow-alpha, 1)))',
    );
    expect(Number.parseFloat(high.pulse ?? '0')).toBeLessThan(Number.parseFloat(low.pulse ?? '0'));
    expect(high.iconColor).toBe('var(--primary-text-color)');
  });

  it('handles a degenerate scale', () => {
    expect(powerRatio(5, { idle: 3, max: 3, steps: [10, 25] })).toBe(1);
  });
});

describe('light and toggle tones', () => {
  it('fills the power button with the light color only while on', () => {
    const tone = lightTone([255, 0, 0], true);
    expect(tone.background).toBe('rgb(255, 0, 0)');
    expect(tone.iconColor).toBe('#ffffff');
    expect(tone.shadow).toBe(
      '0 0 calc(18px * var(--vivid-glow, 1)) rgba(255, 0, 0, calc(0.8 * var(--vivid-glow-alpha, 1))), ' +
        '0 0 calc(60px * var(--vivid-glow, 1)) calc(4px * var(--vivid-glow, 1)) rgba(255, 0, 0, calc(0.8 * var(--vivid-glow-alpha, 1)))',
    );
    expect(lightTone([255, 0, 0], false)).toEqual({});
    expect(lightTone([[255, 0, 0]], true)).toEqual(lightTone([255, 0, 0], true));
  });

  it('glows wider and brighter with the brightness', () => {
    const blurs = (shadow = '') =>
      [...shadow.matchAll(/calc\((\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1]));
    const dim = blurs(lightTone([255, 0, 0], true, 5).shadow);
    const full = blurs(lightTone([255, 0, 0], true, 100).shadow);
    expect(dim[0]).toBeLessThan(5);
    expect(dim[1]).toBeLessThan(10);
    expect(full.slice(0, 2)).toEqual([18, 60]);
    const half = blurs(lightTone([255, 0, 0], true, 50).shadow);
    expect(half[1]).toBeGreaterThan(dim[1] ?? 0);
    expect(half[1]).toBeLessThan(full[1] ?? 0);
    expect(lightTone([255, 0, 0], true, 250)).toEqual(lightTone([255, 0, 0], true, 100));
  });

  it('turns several colors into a gradient bleeding both colors out', () => {
    const tone = lightTone(
      [
        [255, 0, 0],
        [0, 0, 255],
      ],
      true,
    );
    expect(tone.background).toBe('linear-gradient(120deg, rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%)');
    expect(tone.shadow).toContain('rgba(128, 0, 128, calc(0.8 * var(--vivid-glow-alpha, 1)))');
    expect(tone.shadow).toContain('calc(-12px * var(--vivid-glow, 1)) 0 calc(60px');
    expect(tone.shadow).toContain('rgba(0, 0, 255, calc(0.8 * var(--vivid-glow-alpha, 1)))');
    expect(meanColor([])).toEqual([0, 0, 0]);
  });

  it('uses custom power colors', () => {
    const colors: [Rgb, Rgb, Rgb] = [
      [0, 255, 0],
      [0, 0, 255],
      [255, 0, 0],
    ];
    expect(powerColor(30, { ...scale, colors })).toEqual([255, 0, 0]);
    expect(powerColor(5, { ...scale, colors })).toEqual([0, 255, 0]);
  });

  it('is amber when active and muted otherwise', () => {
    expect(toggleTone(true).background).toBe('rgba(255, 193, 7, 0.2)');
    expect(toggleTone(false).background).toBeUndefined();
  });
});

describe('colors', () => {
  it('converts hue/saturation to rgb', () => {
    expect(hsToRgb(0, 100)).toEqual([255, 0, 0]);
    expect(hsToRgb(120, 100)).toEqual([0, 255, 0]);
    expect(hsToRgb(240, 100)).toEqual([0, 0, 255]);
    expect(hsToRgb(0, 0)).toEqual([255, 255, 255]);
    expect(hsToRgb(-120, 100)).toEqual([0, 0, 255]);
  });

  it('parses hex and rgb colors', () => {
    expect(parseColor('#ff8800')).toEqual([255, 136, 0]);
    expect(parseColor('f80')).toEqual([255, 136, 0]);
    expect(parseColor([1.4, 2, 3])).toEqual([1, 2, 3]);
    expect(parseColor('#ff88')).toBeUndefined();
    expect(parseColor([300, 0, 0])).toBeUndefined();
    expect(parseColor(42)).toBeUndefined();
    expect(rgbHex([255, 136, 0])).toBe('#ff8800');
    expect(colorDistance([0, 0, 0], [3, 4, 0])).toBe(5);
  });

  it('approximates color temperatures', () => {
    const [r, g, b] = kelvinToRgb(2700);
    expect(r).toBe(255);
    expect(g).toBeGreaterThan(b);
  });

  it('reads the emitted color of a light', () => {
    const light = (attributes: HassEntity['attributes']): HassEntity => ({
      entity_id: 'light.a',
      state: 'on',
      attributes,
      last_changed: '',
      last_updated: '',
    });
    expect(lightColor(light({ rgb_color: [1, 2, 3] }))).toEqual([1, 2, 3]);
    expect(lightColor(light({ hs_color: [120, 100] }))).toEqual([0, 255, 0]);
    expect(lightColor(light({ color_temp_kelvin: 6500 }))?.[0]).toBe(255);
    expect(lightColor(light({}))).toBeUndefined();
  });
});

describe('halo strength and boost', () => {
  it('reads percentages and the named levels', () => {
    expect(glowPercent('soft')).toBe(50);
    expect(glowPercent('strong')).toBe(170);
    expect(glowPercent(30)).toBe(30);
    expect(glowPercent(250)).toBeUndefined();
    expect(glowPercent('huge')).toBeUndefined();
  });

  it('scales the size, and the opacity up to its full value', () => {
    expect(glowVars(50)).toEqual({
      '--vivid-glow': '0.5',
      '--vivid-glow-alpha': '0.5',
      '--vivid-glow-play': 'running',
    });
    expect(glowVars(170, 0.6)).toMatchObject({ '--vivid-glow': '1.02', '--vivid-glow-alpha': '1' });
    expect(glowVars(0)['--vivid-glow-play']).toBe('paused');
  });

  it('follows the brightness as much as the boost says', () => {
    expect(glowLevel(100)).toBe(1);
    expect(glowLevel(100, 0)).toBe(0.5);
    expect(glowLevel(10, 0)).toBe(0.5);
    expect(glowLevel(10, 200)).toBe(0);
    expect(glowLevel(60, 100)).toBeCloseTo(0.6 ** 1.2);
  });
});

describe('white lights', () => {
  it('turns warm white into amber, cool white into pale blue', () => {
    expect(whiteTone()).toEqual([255, 193, 7]);
    expect(whiteTone(2200)).toEqual([255, 193, 7]);
    expect(whiteTone(4000)).toEqual([255, 222, 150]);
    expect(whiteTone(9000)).toEqual([228, 238, 255]);
    const between = whiteTone(3350);
    expect(between[2]).toBeGreaterThan(7);
    expect(between[2]).toBeLessThan(150);
  });

  it('fills translucent with an amber icon', () => {
    const tone = softLightTone([255, 193, 7], true, 100);
    expect(tone.background).toBe('rgba(255, 193, 7, 0.4)');
    expect(tone.iconColor).toContain('color-mix(in srgb, rgb(255, 193, 7) 78%');
    expect(tone.shadow).toBe(lightTone([255, 193, 7], true, 100).shadow);
    expect(softLightTone([255, 193, 7], false)).toEqual({});
  });
});
