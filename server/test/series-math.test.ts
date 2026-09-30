import { describe, expect, it } from "vitest";
import { computeSpread, computeStats, filterByRange } from "../src/data/series-math.js";

describe("series math", () => {
  it("returns null stats for an empty series", () => {
    expect(computeStats([])).toBeNull();
  });

  it("treats a month in `to` as the whole month for daily data", () => {
    const days = [
      { date: "2025-01-31", value: 1 },
      { date: "2025-02-01", value: 2 },
    ];
    expect(filterByRange(days, { to: "2025-01" })).toEqual([{ date: "2025-01-31", value: 1 }]);
  });

  it("skips dates missing from either side of a spread", () => {
    expect(computeSpread([{ date: "d1", value: 5 }, { date: "d2", value: 6 }], [{ date: "d2", value: 1 }])).toEqual([
      { date: "d2", value: 5 },
    ]);
  });
});
