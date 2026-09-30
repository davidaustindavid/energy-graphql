import type { Commodity, DataSource, Frequency, PricePoint } from "./models.js";

/**
 * Anything that can hand us raw price points.
 *
 * Coding to an interface lets us swap the live EIA client for sample data
 * (or a fake in tests) without touching a single resolver.
 */
export interface PriceSource {
  readonly kind: DataSource;
  fetchSeries(commodity: Commodity, frequency: Frequency): Promise<PricePoint[]>;
}
