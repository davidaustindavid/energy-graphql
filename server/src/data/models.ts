/**
 * Internal "models" — the shapes our code passes around.
 *
 * They are deliberately NOT identical to the GraphQL types. For example
 * `SeriesModel.commodity` is just the id ("WTI"); the `PriceSeries.commodity`
 * field resolver turns it into a full CommodityInfo object only if a client
 * asks for it. codegen.ts wires these up via `mappers`.
 */
import type { Commodity, Frequency, DataSource, AlertDirection, PricePoint } from "../graphql/generated.js";

export type { Commodity, Frequency, DataSource, AlertDirection, PricePoint };

export interface SeriesModel {
  commodity: Commodity;
  frequency: Frequency;
  source: DataSource;
  points: PricePoint[];
}

export interface SpreadModel {
  a: Commodity;
  b: Commodity;
  frequency: Frequency;
  points: PricePoint[];
}

export interface AlertModel {
  id: string;
  commodity: Commodity;
  direction: AlertDirection;
  threshold: number;
  note: string | null;
  createdAt: string;
}
