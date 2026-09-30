import type { Commodity, CommodityInfo } from "../graphql/generated.js";

/**
 * Where each commodity lives in the EIA v2 API.
 * `satisfies` checks the object against the type WITHOUT widening it,
 * so TypeScript still knows the exact keys — and complains if we forget one.
 */
export const EIA_ROUTES = {
  WTI: "petroleum/pri/spt",
  BRENT: "petroleum/pri/spt",
  HENRY_HUB: "natural-gas/pri/fut",
} satisfies Record<Commodity, string>;

export const COMMODITIES: Record<Commodity, CommodityInfo> = {
  WTI: {
    id: "WTI",
    name: "WTI Crude Oil (Cushing, OK)",
    unit: "USD per barrel",
    eiaSeriesId: "RWTC",
  },
  BRENT: {
    id: "BRENT",
    name: "Brent Crude Oil (Europe)",
    unit: "USD per barrel",
    eiaSeriesId: "RBRTE",
  },
  HENRY_HUB: {
    id: "HENRY_HUB",
    name: "Henry Hub Natural Gas",
    unit: "USD per MMBtu",
    eiaSeriesId: "RNGWHHD",
  },
};

/** Object.keys() returns string[]; this helper keeps the precise union type. */
export const ALL_COMMODITIES = Object.keys(COMMODITIES) as Commodity[];
