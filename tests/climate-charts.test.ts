import { describe, expect, it } from 'vitest';
import {
  DAY,
  HOUR,
  areaPath,
  comfortInUnit,
  convertUnit,
  dayBefore,
  decimate,
  extremes,
  fitLabels,
  freeBaseline,
  fromCelsius,
  knownRuns,
  knownValues,
  linePath,
  linearScale,
  localMidnight,
  midnights,
  niceStep,
  sampleAt,
  showsMidnights,
  sortByComfort,
  timeAtX,
  timeOutsideComfort,
  timeTicks,
  timeWeightedMean,
  trendPerHour,
  valueColor,
  valueGradient,
  windowSamples,
  yDomain,
  type ClimateSample,
} from '../src/components/climate-chart-model';
import { DEFAULT_COMFORT } from '../src/core/climate';

const T0 = new Date(2026, 9, 28, 12, 0, 0).getTime();
const at = (hours: number) => T0 + hours * HOUR;
const comfort = { low: 19, high: 23 };

describe('units', () => {
  it('converts between °C and °F', () => {
    expect(fromCelsius(20, '°F')).toBe(68);
    expect(fromCelsius(20, '°C')).toBe(20);
    expect(convertUnit('temperature', 68, '°F', '°C')).toBeCloseTo(20);
    expect(convertUnit('humidity', 50, '%', '%')).toBe(50);
    expect(comfortInUnit('temperature', comfort, '°F')).toEqual({ low: 66.2, high: 73.4 });
    expect(comfortInUnit('humidity', DEFAULT_COMFORT.humidity, '%')).toEqual({ low: 40, high: 60 });
  });

  it('colors a °F value like the same °C value', () => {
    expect(valueColor('temperature', 68, '°F')).toBe(valueColor('temperature', 20, '°C'));
  });
});

describe('series', () => {
  const samples: ClimateSample[] = [
    { t: at(-2), v: 20 },
    { t: at(0), v: 18 },
    { t: at(1), v: undefined },
    { t: at(2), v: 24 },
    { t: at(3), v: 22 },
  ];

  it('windows the samples, carrying the last one before the start', () => {
    const window = windowSamples(samples, at(-1), at(2.5), { t: at(2.5), v: 23 });
    expect(window).toEqual([
      { t: at(-1), v: 20 },
      { t: at(0), v: 18 },
      { t: at(1), v: undefined },
      { t: at(2), v: 24 },
      { t: at(2.5), v: 23 },
    ]);
  });

  it('breaks the curve at unavailable samples', () => {
    expect(knownRuns(samples).map((run) => run.length)).toEqual([2, 2]);
  });

  it('finds dated extremes, using hourly min and max when present', () => {
    expect(extremes(samples)).toEqual({ min: { t: at(0), v: 18 }, max: { t: at(2), v: 24 } });
    const hourly: ClimateSample[] = [
      { t: at(0), v: 20, min: 17, max: 21 },
      { t: at(1), v: 21, min: 20, max: 25 },
    ];
    expect(extremes(hourly)).toEqual({ min: { t: at(0), v: 17 }, max: { t: at(1), v: 25 } });
    expect(knownValues(hourly)).toEqual([17, 21, 20, 25]);
    expect(extremes([])).toEqual({ min: undefined, max: undefined });
  });

  it('weights the mean by time and skips unknown spans', () => {
    // 20 for 2 h, 18 for 1 h, unknown 1 h, 24 for 1 h, 22 for 1 h.
    expect(timeWeightedMean(samples, at(4))).toBeCloseTo((40 + 18 + 24 + 22) / 5);
    expect(timeWeightedMean([], at(4))).toBeUndefined();
  });

  it('measures time below and above comfort', () => {
    expect(timeOutsideComfort(samples, comfort, at(4))).toEqual({ below: HOUR, above: HOUR });
  });

  it('interpolates between known samples only', () => {
    expect(sampleAt(samples, at(-1))).toBe(19);
    expect(sampleAt(samples, at(0))).toBe(18);
    expect(sampleAt(samples, at(1.5))).toBeUndefined();
    expect(sampleAt(samples, at(2.5))).toBe(23);
    expect(sampleAt(samples, at(-3))).toBeUndefined();
    expect(sampleAt(samples, at(5))).toBeUndefined();
  });

  it('gives the trend per hour and the value a day before', () => {
    const day: ClimateSample[] = [
      { t: at(-25), v: 20 },
      { t: at(-23), v: 22 },
      { t: at(-1), v: 21 },
      { t: at(0), v: 20.5 },
    ];
    expect(trendPerHour(day, at(0))).toBeCloseTo(-0.5);
    expect(dayBefore(day, at(0))).toEqual({ value: 21, diff: -0.5 });
    expect(dayBefore(day.slice(2), at(0))).toBeUndefined();
  });

  it('decimates while keeping the peaks and the ends', () => {
    const many: ClimateSample[] = Array.from({ length: 1000 }, (_, index) => ({
      t: at(index / 100),
      v: index === 503 ? 40 : 20 + Math.sin(index / 10),
    }));
    const few = decimate(many, 50);
    expect(few.length).toBeLessThanOrEqual(102);
    expect(few).toContain(many[503]);
    expect(few[0]).toBe(many[0]);
    expect(few[few.length - 1]).toBe(many[999]);
    expect(decimate(many.slice(0, 10), 50)).toHaveLength(10);
  });
});

describe('scales', () => {
  it('picks tidy steps', () => {
    expect(niceStep(8, 4)).toBe(2);
    expect(niceStep(9, 4)).toBe(2.5);
    expect(niceStep(1100, 4)).toBe(500);
    expect(niceStep(0, 4)).toBe(1);
  });

  it('pads the data and always includes the comfort band', () => {
    const domain = yDomain([18.1, 22.6], comfort, 3);
    expect(domain.lo).toBeLessThan(18.1);
    expect(domain.hi).toBeGreaterThan(23);
    expect(domain.ticks[0]).toBe(domain.lo);
    expect(domain.ticks[domain.ticks.length - 1]).toBe(domain.hi);
    // Data far above the comfort band still keeps the band.
    const hot = yDomain([30, 31], comfort, 3);
    expect(hot.lo).toBeLessThanOrEqual(19);
    expect(hot.hi).toBeGreaterThanOrEqual(31);
  });

  it('builds paths', () => {
    const x = linearScale(0, 10, 0, 100);
    const y = linearScale(0, 10, 100, 0);
    const points = [
      { t: 0, v: 0 },
      { t: 5, v: 10 },
    ];
    expect(linePath(points, x, y)).toBe('M0,100 L50,0');
    expect(areaPath(points, x, y, 100)).toBe('M0,100 L50,0 L50,100 L0,100 Z');
    expect(areaPath([], x, y, 100)).toBe('');
  });

  it('places the scale stops on the y axis', () => {
    const y = linearScale(14, 28, 200, 0);
    const gradient = valueGradient('temperature', '°C', y);
    expect(gradient.y1).toBe(200);
    expect(gradient.y2).toBe(0);
    expect(gradient.stops[0]).toEqual({ offset: 0, color: 'rgb(30, 95, 208)' });
    expect(gradient.stops[gradient.stops.length - 1]?.offset).toBe(1);
    // In °F the same colors sit at the same temperatures.
    const yF = linearScale(fromCelsius(14, '°F'), fromCelsius(28, '°F'), 200, 0);
    expect(valueGradient('temperature', '°F', yF).y1).toBe(200);
    // Humidity uses the lightened line stops.
    expect(valueGradient('humidity', '%', y).stops[0]?.color).toBe('rgb(63, 196, 224)');
  });

  it('maps the pointer to a time, clamped', () => {
    expect(timeAtX(50, 0, 100, 0, 1000)).toBe(500);
    expect(timeAtX(-20, 0, 100, 0, 1000)).toBe(0);
    expect(timeAtX(200, 0, 100, 0, 1000)).toBe(1000);
  });
});

describe('time axis', () => {
  it('finds local midnights inside a span', () => {
    const start = at(-24);
    const result = midnights(start, at(0));
    expect(result).toEqual([localMidnight(at(0))]);
    expect(new Date(result[0] ?? 0).getHours()).toBe(0);
    expect(midnights(at(-40), at(40))).toHaveLength(4);
  });

  it('labels hours over a day and days beyond', () => {
    const day = timeTicks(at(-24), at(0), '24h');
    expect(day.length).toBeGreaterThanOrEqual(4);
    expect(day.every((tick) => new Date(tick.t).getHours() % 4 === 0)).toBe(true);
    expect(day.every((tick) => tick.format === 'hour')).toBe(true);
    const six = timeTicks(at(-6), at(0), '6h');
    expect(six.length).toBeGreaterThanOrEqual(4);
    const week = timeTicks(at(-168), at(0), '7d');
    expect(week.every((tick) => tick.format === 'weekday')).toBe(true);
    expect(week.every((tick) => new Date(tick.t).getHours() === 12)).toBe(true);
    const month = timeTicks(at(-720), at(0), '30d');
    expect(month.length).toBeGreaterThanOrEqual(5);
    expect(month.every((tick) => tick.format === 'date')).toBe(true);
    expect(showsMidnights('24h')).toBe('labeled');
    expect(showsMidnights('30d')).toBe('none');
  });

  it('keeps the labels that fit without overlapping', () => {
    const labels = [
      { x: 5, width: 20 },
      { x: 40, width: 30 },
      { x: 50, width: 30 },
      { x: 90, width: 30 },
      { x: 130, width: 30 },
    ];
    expect(fitLabels(labels, 0, 120)).toEqual([1, 3]);
  });

  it('places a label where the curve leaves room', () => {
    expect(freeBaseline([20, 80], [15, 18, 21], 11)).toBe(80);
    expect(freeBaseline([20, 80], [50], 11)).toBe(20);
    expect(freeBaseline([20, 80], [19, 79], 11)).toBe(20);
  });

  it('defines one day', () => {
    expect(DAY).toBe(24 * HOUR);
  });
});

describe('rooms', () => {
  it('sorts from the furthest to the closest to comfort, unknown last', () => {
    const rows = [
      { name: 'salon', value: 22 },
      { name: 'chambre', value: 17.5 },
      { name: 'cave', value: undefined },
      { name: 'cuisine', value: 24 },
      { name: 'bureau', value: 21 },
    ];
    expect(sortByComfort(rows, (row) => row.value, comfort).map((row) => row.name)).toEqual([
      'chambre',
      'cuisine',
      'salon',
      'bureau',
      'cave',
    ]);
  });
});
