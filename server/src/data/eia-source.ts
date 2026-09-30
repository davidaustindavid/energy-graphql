import { GraphQLError } from "graphql";
import { COMMODITIES, EIA_ROUTES } from "./commodities.js";
import type { Commodity, Frequency, PricePoint } from "./models.js";
import type { PriceSource } from "./price-source.js";

const EIA_BASE = "https://api.eia.gov/v2";

/**
 * The part of the EIA response we care about. The real payload has many more
 * fields; describing only what we read keeps the type honest and small.
 * Note `value` can arrive as a string, so we don't trust it to be a number.
 */
interface EiaResponse {
  response?: {
    data?: Array<{ period: string; value: string | number | null }>;
  };
  error?: string;
}

const FREQUENCY_PARAM: Record<Frequency, string> = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
};

/** How far back to request, so responses stay a manageable size. */
const LOOKBACK_YEARS: Record<Frequency, number> = { DAILY: 3, WEEKLY: 8, MONTHLY: 20 };

export class EiaSource implements PriceSource {
  readonly kind = "EIA" as const;

  constructor(
    private readonly apiKey: string,
    // Injecting fetch makes this class testable without the network.
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async fetchSeries(commodity: Commodity, frequency: Frequency): Promise<PricePoint[]> {
    const start = new Date();
    start.setFullYear(start.getFullYear() - LOOKBACK_YEARS[frequency]);

    const params = new URLSearchParams({
      api_key: this.apiKey,
      frequency: FREQUENCY_PARAM[frequency],
      "data[0]": "value",
      "facets[series][]": COMMODITIES[commodity].eiaSeriesId,
      start: frequency === "MONTHLY" ? start.toISOString().slice(0, 7) : start.toISOString().slice(0, 10),
      "sort[0][column]": "period",
      "sort[0][direction]": "asc",
      length: "5000",
    });
    const url = `${EIA_BASE}/${EIA_ROUTES[commodity]}/data/?${params}`;

    let body: EiaResponse;
    try {
      const res = await this.fetchImpl(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      body = (await res.json()) as EiaResponse;
    } catch (err) {
      // GraphQLError + an `extensions.code` gives clients a machine-readable reason.
      throw new GraphQLError(`Could not reach the EIA API: ${(err as Error).message}`, {
        extensions: { code: "UPSTREAM_ERROR" },
      });
    }

    if (body.error) {
      throw new GraphQLError(`EIA API error: ${body.error}`, { extensions: { code: "UPSTREAM_ERROR" } });
    }

    return (body.response?.data ?? [])
      // Careful: Number(null) is 0, so drop missing values BEFORE converting.
      .filter((row) => row.value !== null && row.value !== "")
      .map((row) => ({ date: row.period, value: Number(row.value) }))
      .filter((p) => Number.isFinite(p.value));
  }
}
