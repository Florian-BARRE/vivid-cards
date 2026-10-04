import { describe, expect, it } from 'vitest';
import { hsToRgb, kelvinToRgb, lightColor } from '../src/core/color';
import { lightTone, powerColor, powerRatio, powerTone, toggleTone } from '../src/core/glow';
import type { HassEntity } from '../src/core/hass-types';

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
    expect(low.shadow).toBe('0 0 7px rgba(255, 213, 79, 0.26)');
    expect(high.shadow).toBe('0 0 28px rgba(255, 112, 67, 0.75)');
    expect(Number.parseFloat(high.pulse ?? '0')).toBeLessThan(Number.parseFloat(low.pulse ?? '0'));
    expect(high.iconColor).toBe('var(--primary-text-color)');
  });

  it('handles a degenerate scale', () => {
    expect(powerRatio(5, { idle: 3, max: 3, steps: [10, 25] })).toBe(1);
  });
});

describe('light and toggle tones', () => {
  it('fills the power button with the light color only while on', () => {
    expect(lightTone([255, 0, 0], true)).toEqual({
      background: 'rgb(255, 0, 0)',
      iconColor: '#ffffff',
      shadow: '0 0 14px rgba(255, 0, 0, 0.45)',
    });
    expect(lightTone([255, 0, 0], false)).toEqual({});
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
