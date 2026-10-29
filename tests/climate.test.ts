import { describe, expect, it } from 'vitest';
import {
  DEFAULT_COMFORT,
  airIcon,
  airLevel,
  climateColor,
  climateHalo,
  climateLineColor,
  comfortDistance,
  comfortSide,
  pressureIcon,
  toCelsius,
} from '../src/core/climate';

describe('climate scales', () => {
  it('runs from blue to red through yellow for temperature', () => {
    expect(climateColor('temperature', 10)).toEqual([30, 95, 208]);
    expect(climateColor('temperature', 21.5)).toEqual([255, 213, 79]);
    expect(climateColor('temperature', 30)).toEqual([211, 47, 47]);
    const cold = climateColor('temperature', 16);
    expect(cold[2]).toBeGreaterThan(cold[0]);
  });

  it('runs from light cyan to deep blue for humidity', () => {
    expect(climateColor('humidity', 20)).toEqual([178, 235, 242]);
    expect(climateColor('humidity', 95)).toEqual([31, 47, 150]);
  });

  it('lightens the deepest humidity blues for lines only', () => {
    expect(climateLineColor('humidity', 95)).toEqual([106, 92, 245]);
    expect(climateLineColor('temperature', 21.5)).toEqual(climateColor('temperature', 21.5));
  });

  it('blends between stops', () => {
    expect(climateColor('temperature', 21)).toEqual([255, 222, 109]);
  });
});

describe('comfort', () => {
  const comfort = DEFAULT_COMFORT.temperature;

  it('measures the distance to the comfort range', () => {
    expect(comfortDistance(21, comfort)).toBe(0);
    expect(comfortDistance(17.5, comfort)).toBe(1.5);
    expect(comfortDistance(25, comfort)).toBe(2);
    expect(comfortSide(17.5, comfort)).toBe(-1);
    expect(comfortSide(21, comfort)).toBe(0);
    expect(comfortSide(25, comfort)).toBe(1);
  });

  it('grows the halo outside the comfort range only', () => {
    expect(climateHalo('temperature', 21, comfort)).toBe(0);
    expect(climateHalo('temperature', 25, comfort)).toBe(0.5);
    expect(climateHalo('temperature', 40, comfort)).toBe(1);
  });

  it('converts Fahrenheit', () => {
    expect(toCelsius(68, '°F')).toBe(20);
    expect(toCelsius(20, '°C')).toBe(20);
  });
});

describe('air quality', () => {
  it('maps CO₂ to five levels', () => {
    expect(airLevel(520)).toBe('excellent');
    expect(airLevel(880)).toBe('good');
    expect(airLevel(1250)).toBe('moderate');
    expect(airLevel(1700)).toBe('poor');
    expect(airLevel(2400)).toBe('toxic');
  });

  it('asks to air the room from the moderate level', () => {
    expect(airIcon('excellent')).toBe('mdi:leaf');
    expect(airIcon('moderate')).toBe('mdi:window-open-variant');
    expect(airIcon('toxic')).toBe('mdi:biohazard');
  });

  it('suggests the weather from the pressure', () => {
    expect(pressureIcon(988)).toBe('mdi:weather-lightning-rainy');
    expect(pressureIcon(1008)).toBe('mdi:weather-partly-cloudy');
    expect(pressureIcon(1034)).toBe('mdi:weather-sunny');
  });
});
