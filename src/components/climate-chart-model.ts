import {
  climateLineColor,
  climateStops,
  comfortDistance,
  toCelsius,
  type ClimateKind,
  type ComfortRange,
} from '../core/climate';
import type { ClimateRange } from './vivid-climate-chart';

/**
 * Pure math of the climate charts: windows, statistics of a series, scales,
 * paths, gradients, ticks and room sorting. No Lit, no Home Assistant.
 */

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;

export interface RangeSpec {
  hours: number;
  /** Long ranges come from the long-term statistics (hourly mean, min, max). */
  statistics: boolean;
}

export const RANGE_SPECS: Record<ClimateRange, RangeSpec> = {
  '6h': { hours: 6, statistics: false },
  '24h': { hours: 24, statistics: false },
  '7d': { hours: 168, statistics: true },
  '30d': { hours: 720, statistics: true },
};

/**
 * A reading of a climate sensor: time (ms) and value in the sensor unit,
 * `undefined` while unavailable. Hourly statistics also carry their min and max.
 */
export interface ClimateSample {
  t: number;
  v: number | undefined;
  min?: number;
  max?: number;
}

export interface Point {
  t: number;
  v: number;
}

/* --------------------------------- units ---------------------------------- */

/** Unit a kind is shown in when the sensor does not tell. */
export const DEFAULT_UNIT: Record<ClimateKind, string> = {
  temperature: '°C',
  humidity: '%',
  pressure: 'hPa',
  co2: 'ppm',
};

/** Converts a temperature from °C to the unit of a sensor. */
export function fromCelsius(value: number, unit: string | undefined): number {
  return unit === '°F' ? (value * 9) / 5 + 32 : value;
}

/** A value in the sensor unit, converted to the scale unit (°C) for its color. */
export function toScale(kind: ClimateKind, value: number, unit: string | undefined): number {
  return kind === 'temperature' ? toCelsius(value, unit) : value;
}

/** A value in the scale unit (°C) converted to the sensor unit. */
export function fromScale(kind: ClimateKind, value: number, unit: string | undefined): number {
  return kind === 'temperature' ? fromCelsius(value, unit) : value;
}

/** Converts a reading between two sensor units of the same kind (°C ↔ °F). */
export function convertUnit(
  kind: ClimateKind,
  value: number,
  from: string | undefined,
  to: string | undefined,
): number {
  return from === to ? value : fromScale(kind, toScale(kind, value, from), to);
}

/** The comfort range (scale units) in the sensor unit. */
export function comfortInUnit(
  kind: ClimateKind,
  comfort: ComfortRange,
  unit: string | undefined,
): ComfortRange {
  return { low: fromScale(kind, comfort.low, unit), high: fromScale(kind, comfort.high, unit) };
}

/** CSS color of a value given in the sensor unit, for lines and dots. */
export function valueColor(kind: ClimateKind, value: number, unit: string | undefined): string {
  const [r, g, b] = climateLineColor(kind, toScale(kind, value, unit));
  return `rgb(${r}, ${g}, ${b})`;
}

/* --------------------------------- series --------------------------------- */

/**
 * The samples of [start, end]: the last sample before `start` is moved to
 * `start` (a sensor reports on change only), newer ones are dropped, and
 * `close` (the live state) ends the series.
 */
export function windowSamples(
  samples: readonly ClimateSample[],
  start: number,
  end: number,
  close?: ClimateSample,
): ClimateSample[] {
  const result: ClimateSample[] = [];
  let before: ClimateSample | undefined;
  for (const sample of samples) {
    if (sample.t <= start) before = sample;
    else if (sample.t <= end) result.push(sample);
  }
  if (before) result.unshift({ ...before, t: start });
  if (close && close.t >= start) {
    while (result.length && (result[result.length - 1]?.t ?? 0) >= close.t) result.pop();
    result.push(close);
  }
  return result;
}

/** Runs of consecutive known samples: the curve breaks where the sensor was unavailable. */
export function knownRuns(samples: readonly ClimateSample[]): Point[][] {
  const runs: Point[][] = [];
  let run: Point[] = [];
  for (const sample of samples) {
    if (sample.v === undefined) {
      if (run.length) runs.push(run);
      run = [];
    } else run.push({ t: sample.t, v: sample.v });
  }
  if (run.length) runs.push(run);
  return runs;
}

/** Every known value, hourly min and max included. */
export function knownValues(samples: readonly ClimateSample[]): number[] {
  const values: number[] = [];
  for (const sample of samples) {
    if (sample.v === undefined) continue;
    values.push(sample.min ?? sample.v, sample.max ?? sample.v);
  }
  return values;
}

/** Dated lowest and highest values (the hourly min and max for statistics). */
export function extremes(samples: readonly ClimateSample[]): { min?: Point; max?: Point } {
  let min: Point | undefined;
  let max: Point | undefined;
  for (const sample of samples) {
    if (sample.v === undefined) continue;
    const low = sample.min ?? sample.v;
    const high = sample.max ?? sample.v;
    if (!min || low < min.v) min = { t: sample.t, v: low };
    if (!max || high > max.v) max = { t: sample.t, v: high };
  }
  return { min, max };
}

/** Each sample holds until the next one; the last one until `end`. */
function holdSpans(
  samples: readonly ClimateSample[],
  end: number,
  visit: (value: number, duration: number) => void,
): void {
  samples.forEach((sample, index) => {
    const next = samples[index + 1]?.t ?? end;
    if (sample.v !== undefined && next > sample.t) visit(sample.v, next - sample.t);
  });
}

/** Mean over the known time (each sample holding until the next one). */
export function timeWeightedMean(
  samples: readonly ClimateSample[],
  end: number,
): number | undefined {
  let sum = 0;
  let known = 0;
  holdSpans(samples, end, (value, duration) => {
    sum += value * duration;
    known += duration;
  });
  return known > 0 ? sum / known : undefined;
}

/** Time (ms) spent below and above the comfort range. */
export function timeOutsideComfort(
  samples: readonly ClimateSample[],
  comfort: ComfortRange,
  end: number,
): { below: number; above: number } {
  let below = 0;
  let above = 0;
  holdSpans(samples, end, (value, duration) => {
    if (value < comfort.low) below += duration;
    else if (value > comfort.high) above += duration;
  });
  return { below, above };
}

/** Value at `time`, linear between two known samples; `undefined` in gaps and outside. */
export function sampleAt(samples: readonly ClimateSample[], time: number): number | undefined {
  for (let index = 0; index < samples.length; index++) {
    const a = samples[index];
    if (!a || a.t > time) return undefined;
    const b = samples[index + 1];
    if (a.t === time) return a.v;
    if (!b) return undefined;
    if (b.t < time) continue;
    if (a.v === undefined || b.v === undefined) return b.t === time ? b.v : undefined;
    return a.v + ((b.v - a.v) * (time - a.t)) / (b.t - a.t);
  }
  return undefined;
}

/** Change per hour between `window` ago and `now`. */
export function trendPerHour(
  samples: readonly ClimateSample[],
  now: number,
  window = HOUR,
): number | undefined {
  const before = sampleAt(samples, now - window);
  const current = sampleAt(samples, now);
  if (before === undefined || current === undefined) return undefined;
  return (current - before) / (window / HOUR);
}

/** The value a day before `now`, and how much it changed since. */
export function dayBefore(
  samples: readonly ClimateSample[],
  now: number,
): { value: number; diff: number } | undefined {
  const value = sampleAt(samples, now - DAY);
  const current = sampleAt(samples, now);
  if (value === undefined || current === undefined) return undefined;
  return { value, diff: current - value };
}

/**
 * Keeps at most about `buckets` × 2 samples: the lowest and highest of each
 * time slice, in time order, plus every unavailable mark. Peaks survive.
 */
export function decimate(samples: readonly ClimateSample[], buckets: number): ClimateSample[] {
  if (samples.length <= buckets * 2 || samples.length < 3) return [...samples];
  const first = samples[0]?.t ?? 0;
  const last = samples[samples.length - 1]?.t ?? 0;
  const width = Math.max((last - first) / buckets, 1);
  const kept = new Set<ClimateSample>();
  let bucket = -1;
  let low: ClimateSample | undefined;
  let high: ClimateSample | undefined;
  const flush = () => {
    if (low) kept.add(low);
    if (high) kept.add(high);
    low = high = undefined;
  };
  for (const sample of samples) {
    const index = Math.min(Math.floor((sample.t - first) / width), buckets - 1);
    if (index !== bucket) {
      flush();
      bucket = index;
    }
    if (sample.v === undefined) {
      flush();
      kept.add(sample);
      continue;
    }
    if (!low || sample.v < (low.v ?? Infinity)) low = sample;
    if (!high || sample.v > (high.v ?? -Infinity)) high = sample;
  }
  flush();
  kept.add(samples[0] as ClimateSample);
  kept.add(samples[samples.length - 1] as ClimateSample);
  return samples.filter((sample) => kept.has(sample));
}

/* --------------------------------- scales --------------------------------- */

/** A tidy step: 1, 2, 2.5 or 5 × 10ⁿ, at least `span / count`. */
export function niceStep(span: number, count: number): number {
  const raw = span / Math.max(count, 1);
  if (!(raw > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (step * magnitude >= raw - 1e-9) return step * magnitude;
  }
  return 10 * magnitude;
}

/** Smallest span of the y axis, in the scale unit, so a flat curve stays flat. */
export const MIN_SPAN: Record<ClimateKind, number> = {
  temperature: 3,
  humidity: 15,
  pressure: 10,
  co2: 400,
};

export interface YDomain {
  lo: number;
  hi: number;
  ticks: number[];
}

/**
 * Y axis: the data range padded, always including the comfort band, rounded
 * to tidy ticks (about four).
 */
export function yDomain(
  values: readonly number[],
  comfort: ComfortRange,
  minSpan: number,
  count = 4,
): YDomain {
  let lo = Math.min(comfort.low, ...values);
  let hi = Math.max(comfort.high, ...values);
  const span = Math.max(hi - lo, minSpan);
  const middle = (lo + hi) / 2;
  lo = Math.min(lo, middle - span / 2);
  hi = Math.max(hi, middle + span / 2);
  const pad = (hi - lo) * 0.12;
  lo -= pad;
  hi += pad;
  const step = niceStep(hi - lo, count);
  const round = (value: number) => Math.round(value * 1e6) / 1e6;
  lo = round(Math.floor(lo / step) * step);
  hi = round(Math.ceil(hi / step) * step);
  const ticks: number[] = [];
  for (let tick = lo; tick <= hi + step / 1e6; tick += step) ticks.push(round(tick));
  return { lo, hi, ticks };
}

/** Maps [d0, d1] onto [r0, r1]. */
export function linearScale(
  d0: number,
  d1: number,
  r0: number,
  r1: number,
): (value: number) => number {
  const span = d1 - d0 || 1;
  return (value) => r0 + ((value - d0) / span) * (r1 - r0);
}

const fixed = (value: number) => Math.round(value * 10) / 10;

/** SVG path of a run of points. */
export function linePath(
  points: readonly Point[],
  x: (time: number) => number,
  y: (value: number) => number,
): string {
  return points
    .map((point, index) => `${index ? 'L' : 'M'}${fixed(x(point.t))},${fixed(y(point.v))}`)
    .join(' ');
}

/** SVG path of the area under a run of points, down to `baseline` (px). */
export function areaPath(
  points: readonly Point[],
  x: (time: number) => number,
  y: (value: number) => number,
  baseline: number,
): string {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return '';
  return `${linePath(points, x, y)} L${fixed(x(last.t))},${fixed(baseline)} L${fixed(x(first.t))},${fixed(baseline)} Z`;
}

export interface GradientGeometry {
  /** Vertical ends of the gradient (px, `userSpaceOnUse`), first stop at y1. */
  y1: number;
  y2: number;
  stops: { offset: number; color: string }[];
}

/**
 * A vertical gradient that gives every point of a curve the color of its
 * value: the stops of the scale (converted to the sensor unit) placed on the
 * y axis. Beyond its ends the gradient pads with the end colors, like the scale.
 */
export function valueGradient(
  kind: ClimateKind,
  unit: string | undefined,
  y: (value: number) => number,
): GradientGeometry {
  const stops = climateStops(kind, true);
  const first = fromScale(kind, stops[0]?.[0] ?? 0, unit);
  const last = fromScale(kind, stops[stops.length - 1]?.[0] ?? 1, unit);
  const span = last - first || 1;
  return {
    y1: fixed(y(first)),
    y2: fixed(y(last)),
    stops: stops.map(([value, [r, g, b]]) => ({
      offset: Math.round(((fromScale(kind, value, unit) - first) / span) * 1000) / 1000,
      color: `rgb(${r}, ${g}, ${b})`,
    })),
  };
}

/* ---------------------------------- time ---------------------------------- */

/** Local midnight at or before `time` (browser time zone). */
export function localMidnight(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Local midnights strictly inside (start, end). */
export function midnights(start: number, end: number): number[] {
  const result: number[] = [];
  const date = new Date(localMidnight(start));
  for (;;) {
    date.setDate(date.getDate() + 1);
    const time = date.getTime();
    if (time >= end) break;
    if (time > start) result.push(time);
  }
  return result;
}

export type TickFormat = 'hour' | 'weekday' | 'date';

export interface TimeTick {
  t: number;
  format: TickFormat;
}

/**
 * Time axis labels: every hour over 6 h, every four hours over 24 h (local
 * hours), each day at noon over 7 days, every five days over 30 days. Labels
 * too close to the ends are dropped (the end shows "now").
 */
export function timeTicks(start: number, end: number, range: ClimateRange): TimeTick[] {
  const span = end - start;
  const inside = (time: number, margin: number) =>
    time > start + span * margin && time < end - span * margin;
  const ticks: TimeTick[] = [];
  if (range === '6h' || range === '24h') {
    const every = range === '6h' ? 1 : 4;
    const date = new Date(start);
    date.setMinutes(0, 0, 0);
    while (date.getTime() < end) {
      date.setHours(date.getHours() + 1);
      if (date.getHours() % every === 0 && inside(date.getTime(), 0.06)) {
        ticks.push({ t: date.getTime(), format: 'hour' });
      }
    }
    return ticks;
  }
  if (range === '7d') {
    for (const midnight of [localMidnight(start), ...midnights(start, end)]) {
      const noon = new Date(midnight);
      noon.setHours(12);
      if (inside(noon.getTime(), 0.03)) ticks.push({ t: noon.getTime(), format: 'weekday' });
    }
    return ticks;
  }
  const days = midnights(start, end);
  const last = days.length - 1;
  // Every fifth day, counted back from the last midnight so the newest days are labeled.
  return days
    .filter((_, index) => (last - index) % 5 === 0 && inside(days[index] ?? 0, 0.04))
    .map((t) => ({ t, format: 'date' }));
}

/** Which day labels and separators a range draws. */
export function showsMidnights(range: ClimateRange): 'labeled' | 'plain' | 'none' {
  if (range === '6h' || range === '24h') return 'labeled';
  return range === '7d' ? 'plain' : 'none';
}

/* ---------------------------------- rooms --------------------------------- */

/**
 * Rooms from the furthest to the closest to comfort (by their current value,
 * in the scale unit); rooms without a value go last. Stable.
 */
export function sortByComfort<T>(
  rows: readonly T[],
  current: (row: T) => number | undefined,
  comfort: ComfortRange,
): T[] {
  return rows
    .map((row, index) => {
      const value = current(row);
      return { row, index, distance: value === undefined ? -1 : comfortDistance(value, comfort) };
    })
    .sort((a, b) => b.distance - a.distance || a.index - b.index)
    .map((entry) => entry.row);
}

/** Index of the time under the pointer, clamped to the plot. */
export function timeAtX(
  x: number,
  left: number,
  right: number,
  start: number,
  end: number,
): number {
  const ratio = Math.min(Math.max((x - left) / Math.max(right - left, 1), 0), 1);
  return start + ratio * (end - start);
}

/**
 * Keeps the centered labels that fit between `left` and `right` without
 * overlapping the ones kept before them (`gap` px apart). Returns their indexes.
 */
export function fitLabels(
  labels: readonly { x: number; width: number }[],
  left: number,
  right: number,
  gap = 6,
): number[] {
  const kept: number[] = [];
  let edge = -Infinity;
  labels.forEach((label, index) => {
    const from = label.x - label.width / 2;
    const to = label.x + label.width / 2;
    if (from < left || to > right || from < edge + gap) return;
    kept.push(index);
    edge = to;
  });
  return kept;
}

/** An axis-aligned box (px). */
export interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

function overlaps(a: Box, b: Box): boolean {
  return a.x0 <= b.x1 && b.x0 <= a.x1 && a.y0 <= b.y1 && b.y0 <= a.y1;
}

/**
 * Index of the spot that overlaps the least obstacle weight (the first one
 * on a tie): a free spot when there is one.
 */
export function freeSpot(
  spots: readonly Box[],
  obstacles: readonly (Box & { weight?: number })[],
): number {
  let best = 0;
  let bestScore = Infinity;
  spots.forEach((spot, index) => {
    const score = obstacles.reduce(
      (sum, obstacle) => sum + (overlaps(spot, obstacle) ? (obstacle.weight ?? 1) : 0),
      0,
    );
    if (score < bestScore) {
      best = index;
      bestScore = score;
    }
  });
  return best;
}
