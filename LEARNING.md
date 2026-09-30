# Learning guide

This project is meant to be read as well as run. The guide follows one request from the browser to the data and back, pointing at the file where each idea lives. Keep the code open next to it.

**Suggested order:** Part 1 → run the app and try queries in Sandbox → Part 2 → Part 3 → the exercises.

---

## Part 1: GraphQL in five ideas

### 1. The schema is the contract
📄 `server/src/graphql/schema.graphql`

A REST API has many URLs, each returning a fixed shape. A GraphQL API has **one URL** and a **schema** that describes every type and every field a client may ask for. The client sends a query shaped like the answer it wants and gets exactly that shape back.

```graphql
type PriceSeries {
  frequency: Frequency!      # ! means "never null"
  latest: PricePoint         # no ! means "might be null"
  points(last: Int): [PricePoint!]!   # fields can take arguments
}
```

`[PricePoint!]!` reads from the outside in: the list itself is never null, and no item inside it is null either.

### 2. Queries read, mutations write
The two entry points are `type Query` and `type Mutation`. Nothing technically stops a query from changing data. The split is a convention that tells clients and caches which operations are safe to repeat.

### 3. Enums and input types are validated for free
`Commodity` is an enum, so `series(commodity: GASOLINE)` is rejected **before any of your code runs**. The test `rejects values that aren't in the enum` in `server/test/api.test.ts` proves it: the data source is never called.

`input CreateAlertInput` is the shape a client *sends*. Input types can't have resolvers, which is why GraphQL keeps them separate from output types.

### 4. Every field has a resolver
📄 `server/src/graphql/resolvers.ts`

A resolver is a function `(parent, args, context, info) => value`. GraphQL walks the query tree and calls one resolver per field:

```
series(...)         → Query.series      loads the points, returns a SeriesModel
  ├─ commodity      → PriceSeries.commodity  turns "WTI" into a CommodityInfo
  ├─ stats          → PriceSeries.stats      computes min/max/mean
  └─ points(last:3) → PriceSeries.points     slices the array
```

Each resolver receives what its parent returned as `parent`. If a query doesn't ask for `stats`, that function never runs, so clients pay only for what they ask for. Fields you don't write a resolver for (like `PriceSeries.frequency`) use a default that reads the property of the same name.

### 5. Context is per-request shared state
📄 `server/src/context.ts`, `server/src/index.ts`

The `context` function in `index.ts` runs once per request. Whatever it returns becomes every resolver's third argument. Here that's the price service and the alert store. In a real app it would also hold the logged-in user.

---

## Part 2: TypeScript concepts, and where to find them

| Concept | Where | What to notice |
|---|---|---|
| **Interfaces** | `data/price-source.ts` | `PriceSource` describes *what* a data source does. `EiaSource`, `SampleSource` and the test's `FakeSource` all `implements` it, so resolvers never know which one is in use. |
| **Union types** | `gql/graphql.ts`, `graphql/generated.ts` | `Commodity` is `"WTI" \| "BRENT" \| "HENRY_HUB"`: a string that can only be one of three values. |
| **`Record<K, V>`** | `data/commodities.ts` | `Record<Commodity, CommodityInfo>` forces an entry for *every* commodity. Delete one and it won't compile. |
| **`satisfies`** | `data/commodities.ts` (`EIA_ROUTES`) | Checks a value against a type without widening it. |
| **Exhaustive `switch` with `never`** | `data/sample-source.ts` | Add a frequency to the schema, run codegen, and this file stops compiling until you handle it. |
| **`noUncheckedIndexedAccess`** | `tsconfig.base.json`, `data/series-math.ts` | `points[0]` has type `PricePoint \| undefined`, so the compiler makes you handle the empty array. |
| **Utility types** | `data/alert-store.ts` | `Omit<AlertModel, "id" \| "createdAt">` means "an alert minus the fields the store generates". |
| **Indexed access types** | `web/src/components/StatTiles.tsx` | `DashboardQuery["series"]["stats"]` pulls a nested type out of a generated one. |
| **Template literal types** | `data/price-service.ts` | `` `${Commodity}:${Frequency}` `` only allows keys like `"WTI:DAILY"`. |
| **`as const`** | `web/src/App.tsx` (`RANGES`) | Keeps literal values (`"1Y"`) instead of widening them to `string`, so `RangeId` can be derived from the data. |
| **Generic functions and components** | `Segmented<T>` in `App.tsx`, `useElementWidth<T>`, `run<TData>` in `test/helpers.ts` | One type parameter ties several props together, so `value`, `options` and `onChange` must all agree. |
| **Dependency injection** | `EiaSource` constructor takes `fetchImpl` | Tests pass a fake `fetch`, so no network is needed. |

---

## Part 3: One schema, types everywhere (codegen)

This is the payoff of TypeScript + GraphQL together.

```
schema.graphql ──codegen──▶ server/src/graphql/generated.ts  (Resolvers type)
      │
      └──────────codegen──▶ web/src/gql/                    (typed graphql() + query types)
                                  ▲
               web/src/graphql/operations.ts (your query strings)
```

**Server side** (`server/codegen.ts`): `typescript-resolvers` generates a `Resolvers` type. `resolvers.ts` is annotated with it, so every argument is typed and every return value is checked against the schema.

**Mappers** are the one advanced setting. Internally a series stores `commodity: "WTI"`, but the schema says `PriceSeries.commodity` is a full `CommodityInfo` object. The `mappers` option tells codegen "the parent of a `PriceSeries` resolver is really a `SeriesModel`". That lets `Query.series` return the lean model while `PriceSeries.commodity` does the conversion. Remove the mapper, run codegen, and see what breaks.

**Client side** (`web/codegen.ts`): the client preset reads each `graphql(\`...\`)` call in `operations.ts` and generates types for exactly the fields that query selects. In `App.tsx`, `dash.data?.series.stats.mean` is fully typed, but only because the query asks for `mean`. Remove `mean` from the query, run `npm run codegen`, and `StatTiles.tsx` fails to compile.

> **Try it:** add a field `volatility: Float!` to `SeriesStats` in the schema and run `npm run codegen`. `tsc` now points at `computeStats`, the one place that has to change.

---

## Part 4: Details worth noticing

- **Errors are data.** Throwing `new GraphQLError(msg, { extensions: { code: "BAD_USER_INPUT" } })` sends a structured error the client can switch on. The response can contain partial `data` *and* `errors` at the same time.
- **The N+1 problem.** Each alert's `triggered` and `currentPrice` fields both need the latest price. With 50 alerts that's 100 lookups. `PriceService` caches the *promise*, so they share one fetch. The general tool for this is [DataLoader](https://github.com/graphql/dataloader), which batches and de-duplicates loads within a single request.
- **Testing without HTTP.** `server.executeOperation()` (in `test/helpers.ts`) runs the full GraphQL pipeline: parsing, validation, resolvers and error formatting, without starting a web server.
- **The Apollo Client cache.** `main.tsx` sets `keyFields` so the cache knows what makes objects unique. After a mutation, `AlertsPanel` uses `refetchQueries`. Updating the cache directly with `update` is faster but more code.

---

## Exercises (easiest first)

1. **Select a field you aren't using yet:** show each alert's EIA series id in the alert list. Add `eiaSeriesId` to the `Alerts` query, run codegen, and render it. (This is a client-only change: the API already has the field.)
2. **New argument:** give `PriceSeries.points` a `first: Int` argument alongside `last`.
3. **New computed field:** add `SeriesStats.volatility`, the standard deviation of period-to-period changes. Write a test first in `series-math.test.ts`.
4. **New commodity:** add Heating Oil (EIA series `EER_EPD2F_PF4_Y35NY_DPG`, route `petroleum/pri/spt`). Watch how many files the compiler sends you to.
5. **Custom scalar:** replace `date: String!` with a `scalar Date` that validates the format.
6. **Cache update:** swap `refetchQueries` in `AlertsPanel` for an `update` function that writes the new alert straight into the cache.
7. **DataLoader:** add a per-request loader for latest prices in `context`, and write a test that counts source calls for 10 alerts.
8. **Persistence:** move `AlertStore` to SQLite. The resolvers shouldn't need to change. If they do, that tells you something about the design.
9. **Subscriptions:** push a message when an alert triggers, using `graphql-ws`.
