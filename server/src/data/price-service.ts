import type { Commodity, DataSource, Frequency, PricePoint } from "./models.js";
import type { PriceSource } from "./price-source.js";

interface CacheEntry {
  expires: number;
  // We cache the *promise*, not the result. If two resolvers ask for the same
  // series at the same moment, they share one in-flight request.
  points: Promise<PricePoint[]>;
}

/**
 * Sits between resolvers and a PriceSource, adding a small time-based cache.
 * Resolvers never talk to EIA directly — they go through this service.
 */
export class PriceService {
  private cache = new Map<string, CacheEntry>();

  constructor(
    private readonly source: PriceSource,
    private readonly ttlMs = 15 * 60 * 1000,
  ) {}

  get sourceKind(): DataSource {
    return this.source.kind;
  }

  getSeries(commodity: Commodity, frequency: Frequency): Promise<PricePoint[]> {
    // A template literal TYPE: only strings like "WTI:DAILY" are allowed here.
    // Hover `key` in your editor to see every combination TypeScript computed.
    const key: `${Commodity}:${Frequency}` = `${commodity}:${frequency}`;
    const hit = this.cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.points;

    const points = this.source.fetchSeries(commodity, frequency);
    this.cache.set(key, { expires: Date.now() + this.ttlMs, points });
    // Don't keep a failed request cached — let the next call retry.
    points.catch(() => this.cache.delete(key));
    return points;
  }

  async getLatest(commodity: Commodity): Promise<PricePoint | undefined> {
    const points = await this.getSeries(commodity, "DAILY");
    return points.at(-1);
  }
}
