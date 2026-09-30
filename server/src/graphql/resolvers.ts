import { GraphQLError } from "graphql";
import { ALL_COMMODITIES, COMMODITIES } from "../data/commodities.js";
import { computeSpread, computeStats, filterByRange, type DateRange } from "../data/series-math.js";
import type { Resolvers } from "./generated.js";

/**
 * Resolvers are functions that produce the value for one field.
 * Every resolver gets (parent, args, context, info):
 *   parent  – the object returned by the resolver one level up
 *   args    – the field's arguments, already validated against the schema
 *   context – per-request shared stuff (see context.ts)
 *
 * The `Resolvers` type is generated from schema.graphql, so if a resolver
 * returns the wrong shape or misspells an argument, `tsc` catches it.
 */
export const resolvers: Resolvers = {
  Query: {
    commodities: () => ALL_COMMODITIES.map((id) => COMMODITIES[id]),

    // Query.series only loads the raw points. It returns a SeriesModel
    // (see mappers in codegen.ts); the PriceSeries resolvers below take it from there.
    series: async (_parent, { commodity, frequency, range }, { prices }) => {
      validateRange(range);
      // `frequency` has a default in the schema, but codegen still types it as
      // possibly null (a client could send null explicitly), so we fall back.
      const freq = frequency ?? "MONTHLY";
      const points = await prices.getSeries(commodity, freq);
      return { commodity, frequency: freq, source: prices.sourceKind, points: filterByRange(points, range) };
    },

    spread: async (_parent, { a, b, frequency, range }, { prices }) => {
      if (a === b) {
        throw new GraphQLError("A spread needs two different commodities.", {
          extensions: { code: "BAD_USER_INPUT", argumentName: "b" },
        });
      }
      validateRange(range);
      const freq = frequency ?? "MONTHLY";
      // Promise.all runs both fetches at the same time instead of one after another.
      const [pa, pb] = await Promise.all([prices.getSeries(a, freq), prices.getSeries(b, freq)]);
      return { a, b, frequency: freq, points: filterByRange(computeSpread(pa, pb), range) };
    },

    alerts: (_parent, _args, { alerts }) => alerts.list(),
  },

  Mutation: {
    createAlert: (_parent, { input }, { alerts }) => {
      if (!(input.threshold > 0)) {
        throw new GraphQLError("Threshold must be a positive number.", {
          extensions: { code: "BAD_USER_INPUT", argumentName: "threshold" },
        });
      }
      return alerts.create({
        commodity: input.commodity,
        direction: input.direction,
        threshold: input.threshold,
        note: input.note?.trim() || null,
      });
    },
    deleteAlert: (_parent, { id }, { alerts }) => alerts.delete(id),
  },

  // ── Field resolvers ────────────────────────────────────────────────
  // `parent` here is a SeriesModel. Each field below runs ONLY if the
  // client's query asks for it.
  PriceSeries: {
    commodity: (parent) => COMMODITIES[parent.commodity],
    points: (parent, { last }) => {
      if (last == null) return parent.points;
      if (last < 1) {
        throw new GraphQLError("`last` must be at least 1.", { extensions: { code: "BAD_USER_INPUT" } });
      }
      return parent.points.slice(-last);
    },
    latest: (parent) => parent.points.at(-1) ?? null,
    stats: (parent) => computeStats(parent.points),
  },

  Spread: {
    a: (parent) => COMMODITIES[parent.a],
    b: (parent) => COMMODITIES[parent.b],
  },

  PriceAlert: {
    commodity: (parent) => COMMODITIES[parent.commodity],
    currentPrice: async (parent, _args, { prices }) => (await prices.getLatest(parent.commodity))?.value ?? null,
    triggered: async (parent, _args, { prices }) => {
      const latest = await prices.getLatest(parent.commodity);
      if (!latest) return false;
      return parent.direction === "ABOVE" ? latest.value >= parent.threshold : latest.value <= parent.threshold;
    },
  },
};

function validateRange(range: DateRange | null | undefined): void {
  if (range?.from && range.to && range.from > range.to) {
    throw new GraphQLError("`range.from` must be on or before `range.to`.", {
      extensions: { code: "BAD_USER_INPUT", argumentName: "range" },
    });
  }
}
