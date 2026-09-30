import { describe, expect, it } from "vitest";
import { makeTestServer } from "./helpers.js";

describe("Query.series", () => {
  it("returns points, latest and stats", async () => {
    const { run } = await makeTestServer();
    const res = await run(`
      query {
        series(commodity: WTI) {
          commodity { id unit }
          frequency
          source
          latest { date value }
          stats { min max mean change changePercent }
        }
      }`);

    expect(res.errors).toBeUndefined();
    expect(res.data).toEqual({
      series: {
        commodity: { id: "WTI", unit: "USD per barrel" },
        frequency: "MONTHLY",
        source: "SAMPLE",
        latest: { date: "2025-03", value: 80 },
        stats: { min: 70, max: 80, mean: 75, change: 10, changePercent: 14.29 },
      },
    });
  });

  it("filters by date range and `last`", async () => {
    const { run } = await makeTestServer();
    const res = await run<{ series: { points: { date: string }[] } }>(`
      query($range: DateRange) {
        series(commodity: WTI, range: $range) { points(last: 1) { date } }
      }`, { range: { from: "2025-01", to: "2025-02" } });

    expect(res.data?.series.points).toEqual([{ date: "2025-02" }]);
  });

  it("rejects a backwards date range", async () => {
    const { run } = await makeTestServer();
    const res = await run(`{ series(commodity: WTI, range: { from: "2025-03", to: "2025-01" }) { source } }`);
    expect(res.errors?.[0]?.extensions?.code).toBe("BAD_USER_INPUT");
  });

  it("rejects values that aren't in the enum — before any resolver runs", async () => {
    const { run, source } = await makeTestServer();
    const res = await run(`{ series(commodity: GASOLINE) { source } }`);
    expect(res.errors?.[0]?.extensions?.code).toBe("GRAPHQL_VALIDATION_FAILED");
    expect(source.calls).toBe(0);
  });

  it("does not fetch data the query didn't need twice (cache)", async () => {
    const { run, source } = await makeTestServer();
    await run(`{ a: series(commodity: WTI) { source } b: series(commodity: WTI) { source } }`);
    expect(source.calls).toBe(1);
  });
});

describe("Query.spread", () => {
  it("subtracts b from a on matching dates only", async () => {
    const { run } = await makeTestServer();
    const res = await run(`{ spread(a: BRENT, b: WTI) { a { id } b { id } points { date value } } }`);
    expect(res.data).toEqual({
      spread: {
        a: { id: "BRENT" },
        b: { id: "WTI" },
        points: [
          { date: "2025-01", value: 4 },
          { date: "2025-02", value: 3 },
          { date: "2025-03", value: 5 },
        ],
      },
    });
  });

  it("rejects the same commodity twice", async () => {
    const { run } = await makeTestServer();
    const res = await run(`{ spread(a: WTI, b: WTI) { frequency } }`);
    expect(res.errors?.[0]?.message).toMatch(/two different/);
  });
});

describe("alerts", () => {
  const CREATE = `
    mutation($input: CreateAlertInput!) {
      createAlert(input: $input) { id direction threshold note triggered currentPrice commodity { id } }
    }`;

  it("creates, lists, evaluates and deletes an alert", async () => {
    const { run } = await makeTestServer();

    const created = await run<{ createAlert: { id: string; triggered: boolean; currentPrice: number } }>(CREATE, {
      input: { commodity: "WTI", direction: "ABOVE", threshold: 78, note: "  breakout  " },
    });
    expect(created.errors).toBeUndefined();
    const alert = created.data!.createAlert;
    expect(alert).toMatchObject({ triggered: true, currentPrice: 80, note: "breakout" });

    const listed = await run<{ alerts: { id: string }[] }>(`{ alerts { id } }`);
    expect(listed.data?.alerts).toEqual([{ id: alert.id }]);

    const deleted = await run(`mutation($id: ID!) { deleteAlert(id: $id) }`, { id: alert.id });
    expect(deleted.data).toEqual({ deleteAlert: true });

    const after = await run(`{ alerts { id } }`);
    expect(after.data).toEqual({ alerts: [] });
  });

  it("is not triggered when the price hasn't crossed", async () => {
    const { run } = await makeTestServer();
    const res = await run<{ createAlert: { triggered: boolean } }>(CREATE, {
      input: { commodity: "HENRY_HUB", direction: "BELOW", threshold: 2.5 },
    });
    expect(res.data?.createAlert.triggered).toBe(false);
  });

  it("rejects a non-positive threshold", async () => {
    const { run } = await makeTestServer();
    const res = await run(CREATE, { input: { commodity: "WTI", direction: "ABOVE", threshold: -1 } });
    expect(res.errors?.[0]?.extensions).toMatchObject({ code: "BAD_USER_INPUT", argumentName: "threshold" });
  });
});
