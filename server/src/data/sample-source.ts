import type { Commodity, Frequency, PricePoint } from "./models.js";
import type { PriceSource } from "./price-source.js";
import { round } from "./series-math.js";

/**
 * SYNTHETIC data so the project runs with zero setup.
 * These are NOT real prices — they're a seeded random walk that looks
 * roughly like energy markets. Set EIA_API_KEY to use real data.
 */
export class SampleSource implements PriceSource {
  readonly kind = "SAMPLE" as const;
  private daily: Record<Commodity, PricePoint[]> | undefined;

  async fetchSeries(commodity: Commodity, frequency: Frequency): Promise<PricePoint[]> {
    this.daily ??= generateDaily(); // `??=` assigns only if the left side is null/undefined
    const days = this.daily[commodity];
    switch (frequency) {
      case "DAILY":
        return days;
      case "WEEKLY":
        return average(days, weekEnding);
      case "MONTHLY":
        return average(days, (d) => d.slice(0, 7));
      default: {
        // If someone adds a Frequency to the schema and forgets this switch,
        // `frequency` is no longer `never` here and TypeScript fails the build.
        const unreachable: never = frequency;
        throw new Error(`Unknown frequency ${String(unreachable)}`);
      }
    }
  }
}

/** Deterministic PRNG so every run produces the same "random" data. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateDaily(): Record<Commodity, PricePoint[]> {
  const rand = mulberry32(2026);
  const noise = () => rand() - 0.5;

  const out: Record<Commodity, PricePoint[]> = { WTI: [], BRENT: [], HENRY_HUB: [] };
  let wti = 60;
  let gas = 3;
  let brentPremium = 3.5;

  const end = new Date(Date.UTC(2026, 8, 25));
  for (let d = new Date(Date.UTC(2021, 0, 4)); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const dow = d.getUTCDay();
    if (dow === 0 || dow === 6) continue; // markets closed on weekends

    // Random walk pulled gently back toward a long-run level (mean reversion).
    wti += noise() * 2.2 + (72 - wti) * 0.004;
    gas += noise() * 0.18 + (3.4 - gas) * 0.01;
    brentPremium += noise() * 0.3 + (4 - brentPremium) * 0.05;
    wti = Math.max(wti, 20);
    gas = Math.max(gas, 1.2);

    const date = d.toISOString().slice(0, 10);
    out.WTI.push({ date, value: round(wti) });
    out.BRENT.push({ date, value: round(wti + brentPremium) });
    out.HENRY_HUB.push({ date, value: round(gas) });
  }
  return out;
}

/** The Friday that ends the week containing `date` (EIA's weekly convention). */
function weekEnding(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + ((5 - d.getUTCDay() + 7) % 7));
  return d.toISOString().slice(0, 10);
}

/** Group points by a key (week or month) and average each group. */
function average(points: readonly PricePoint[], keyOf: (date: string) => string): PricePoint[] {
  const groups = new Map<string, number[]>();
  for (const p of points) {
    const key = keyOf(p.date);
    const bucket = groups.get(key) ?? [];
    bucket.push(p.value);
    groups.set(key, bucket);
  }
  return [...groups].map(([date, values]) => ({
    date,
    value: round(values.reduce((a, b) => a + b, 0) / values.length),
  }));
}
