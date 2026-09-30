/**
 * Pure functions: no I/O, no GraphQL. Easy to read, easy to unit test.
 */
import type { PricePoint, SeriesStats } from "../graphql/generated.js";

export interface DateRange {
  from?: string | null;
  to?: string | null;
}

/**
 * Keep points inside an inclusive [from, to] range.
 * ISO dates compare correctly as plain strings ("2024-01" < "2024-02-15").
 */
export function filterByRange(points: readonly PricePoint[], range?: DateRange | null): PricePoint[] {
  const from = range?.from ?? null;
  const to = range?.to ?? null;
  return points.filter(
    (p) =>
      (from === null || p.date >= from) &&
      // Pad `to` so "2024-01" includes every day in January ("2024-01-31" <= "2024-01~~~",
      // because "~" sorts after every digit).
      (to === null || p.date <= to.padEnd(p.date.length, "~")),
  );
}

export function computeStats(points: readonly PricePoint[]): SeriesStats | null {
  const first = points[0];
  const last = points.at(-1);
  // With `noUncheckedIndexedAccess`, points[0] is `PricePoint | undefined`,
  // so TypeScript forces us to handle the empty case right here.
  if (!first || !last) return null;

  const values = points.map((p) => p.value);
  const sum = values.reduce((a, b) => a + b, 0);
  const change = last.value - first.value;

  return {
    count: points.length,
    min: round(Math.min(...values)),
    max: round(Math.max(...values)),
    mean: round(sum / values.length),
    change: round(change),
    changePercent: first.value === 0 ? 0 : round((change / first.value) * 100),
  };
}

/** a − b on every date both series have in common. */
export function computeSpread(a: readonly PricePoint[], b: readonly PricePoint[]): PricePoint[] {
  const bByDate = new Map(b.map((p) => [p.date, p.value]));
  const out: PricePoint[] = [];
  for (const p of a) {
    const other = bByDate.get(p.date);
    if (other !== undefined) out.push({ date: p.date, value: round(p.value - other) });
  }
  return out;
}

export function round(n: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}
