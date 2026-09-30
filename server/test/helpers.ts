import assert from "node:assert";
import { AlertStore } from "../src/data/alert-store.js";
import { PriceService } from "../src/data/price-service.js";
import type { PriceSource } from "../src/data/price-source.js";
import type { Commodity, Frequency, PricePoint } from "../src/data/models.js";
import { createServer } from "../src/server.js";

/** A fake data source with tiny, predictable numbers. */
export const fixtures: Record<Commodity, PricePoint[]> = {
  WTI: [
    { date: "2025-01", value: 70 },
    { date: "2025-02", value: 75 },
    { date: "2025-03", value: 80 },
  ],
  BRENT: [
    { date: "2025-01", value: 74 },
    { date: "2025-02", value: 78 },
    { date: "2025-03", value: 85 },
  ],
  HENRY_HUB: [
    { date: "2025-01", value: 3 },
    { date: "2025-03", value: 4 },
  ],
};

export class FakeSource implements PriceSource {
  readonly kind = "SAMPLE" as const;
  calls = 0;
  async fetchSeries(commodity: Commodity, _frequency: Frequency) {
    this.calls++;
    return fixtures[commodity];
  }
}

/**
 * Runs a GraphQL operation against a real ApolloServer — no HTTP involved.
 * The generic <TData> lets each test say what shape it expects back.
 */
export async function makeTestServer() {
  const source = new FakeSource();
  const context = { prices: new PriceService(source), alerts: new AlertStore() };
  const server = createServer();

  async function run<TData = Record<string, unknown>>(query: string, variables?: Record<string, unknown>) {
    const res = await server.executeOperation<TData>({ query, variables }, { contextValue: context });
    assert(res.body.kind === "single");
    return res.body.singleResult;
  }

  return { run, source, context };
}
