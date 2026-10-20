/**
 * Speed (%) of a fan curve at `t`, as fan controllers usually compute it:
 * points sorted by temperature, linear between them, flat outside; below the
 * first point the fan stops when `stop` is set (a hysteresis, which depends
 * on what happened before, is left to the device).
 */
export function curveAt(
  points: readonly { t: number; s: number }[],
  t: number,
  stop: boolean,
): number {
  const sorted = [...points].sort((a, b) => a.t - b.t);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return 0;
  if (t < first.t) return stop ? 0 : first.s;
  if (t >= last.t) return last.s;
  for (let index = 1; index < sorted.length; index += 1) {
    const to = sorted[index] as { t: number; s: number };
    const from = sorted[index - 1] as { t: number; s: number };
    if (t <= to.t) {
      const span = to.t - from.t;
      return span <= 0 ? to.s : from.s + ((t - from.t) / span) * (to.s - from.s);
    }
  }
  return last.s;
}
