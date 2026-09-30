import { describe, expect, it } from "vitest";
import { EiaSource } from "../src/data/eia-source.js";
import { SampleSource } from "../src/data/sample-source.js";

describe("EiaSource", () => {
  it("builds the right request and parses string values", async () => {
    let requested = "";
    // A hand-rolled fake `fetch`: the class never knows it isn't the network.
    const fakeFetch = (async (url: string) => {
      requested = url;
      return new Response(
        JSON.stringify({ response: { data: [{ period: "2025-01", value: "71.5" }, { period: "2025-02", value: null }] } }),
      );
    }) as typeof fetch;

    const points = await new EiaSource("KEY", fakeFetch).fetchSeries("WTI", "MONTHLY");

    const url = new URL(requested);
    expect(url.pathname).toBe("/v2/petroleum/pri/spt/data/");
    expect(url.searchParams.get("facets[series][]")).toBe("RWTC");
    expect(url.searchParams.get("frequency")).toBe("monthly");
    expect(points).toEqual([{ date: "2025-01", value: 71.5 }]); // the null row is dropped
  });

  it("turns network failures into an UPSTREAM_ERROR", async () => {
    const failing = (async () => new Response("nope", { status: 503 })) as typeof fetch;
    await expect(new EiaSource("KEY", failing).fetchSeries("BRENT", "DAILY")).rejects.toMatchObject({
      extensions: { code: "UPSTREAM_ERROR" },
    });
  });
});

describe("SampleSource", () => {
  it("is deterministic and consistent across frequencies", async () => {
    const s = new SampleSource();
    const daily = await s.fetchSeries("WTI", "DAILY");
    const monthly = await s.fetchSeries("WTI", "MONTHLY");
    expect(daily.length).toBeGreaterThan(1000);
    expect(monthly[0]?.date).toBe("2021-01");
    expect((await new SampleSource().fetchSeries("WTI", "DAILY"))[500]).toEqual(daily[500]);
  });

  it("uses Fridays as week endings", async () => {
    const weekly = await new SampleSource().fetchSeries("BRENT", "WEEKLY");
    for (const p of weekly.slice(0, 10)) expect(new Date(`${p.date}T00:00:00Z`).getUTCDay()).toBe(5);
  });
});
