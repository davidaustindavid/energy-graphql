import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { CommoditiesQuery, DashboardQuery, SpreadQuery } from "./graphql/operations";
import type { Commodity, Frequency } from "./gql/graphql";
import { PriceChart } from "./components/PriceChart";
import { StatTiles } from "./components/StatTiles";
import { AlertsPanel } from "./components/AlertsPanel";
import { usd } from "./format";

/** `as const` turns this into a readonly tuple of literal types, not string[]. */
const RANGES = [
  { id: "1Y", years: 1 },
  { id: "3Y", years: 3 },
  { id: "ALL", years: null },
] as const;
type RangeId = (typeof RANGES)[number]["id"]; // "1Y" | "3Y" | "ALL"

const FREQUENCIES: Frequency[] = ["DAILY", "WEEKLY", "MONTHLY"];

function rangeFrom(id: RangeId): string | null {
  const years = RANGES.find((r) => r.id === id)?.years ?? null;
  if (years === null) return null;
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 7); // "YYYY-MM" works for every frequency
}

export function App() {
  const [commodity, setCommodity] = useState<Commodity>("WTI");
  const [frequency, setFrequency] = useState<Frequency>("WEEKLY");
  const [rangeId, setRangeId] = useState<RangeId>("3Y");
  const range = { from: rangeFrom(rangeId) };

  const commodities = useQuery(CommoditiesQuery);
  // Changing any variable re-runs the query; Apollo caches each combination.
  const dash = useQuery(DashboardQuery, { variables: { commodity, frequency, range } });
  const spread = useQuery(SpreadQuery, { variables: { frequency, range } });

  const series = dash.data?.series;
  const error = commodities.error ?? dash.error;

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Energy prices</h1>
          <p className="header__sub">A TypeScript + GraphQL learning project · data via the U.S. EIA</p>
        </div>
        {series?.source === "SAMPLE" && (
          <span className="badge" title="Set EIA_API_KEY in server/.env for real data">Synthetic sample data</span>
        )}
      </header>

      <div className="controls" role="toolbar" aria-label="Chart filters">
        <Segmented
          label="Commodity"
          options={(commodities.data?.commodities ?? []).map((c) => ({ id: c.id, text: c.name.split(" (")[0] ?? c.name }))}
          value={commodity}
          onChange={setCommodity}
        />
        <Segmented label="Frequency" options={FREQUENCIES.map((f) => ({ id: f, text: f.toLowerCase() }))} value={frequency} onChange={setFrequency} />
        <Segmented label="Range" options={RANGES.map((r) => ({ id: r.id, text: r.id === "ALL" ? "All" : r.id }))} value={rangeId} onChange={setRangeId} />
      </div>

      {error && <p className="error">Couldn’t load data: {error.message}. Is the API running on port 4000?</p>}

      {series && (
        <>
          {series.stats && series.latest && <StatTiles stats={series.stats} latest={series.latest} unit={series.commodity.unit} />}
          <section className="panel">
            <h2>{series.commodity.name}</h2>
            <p className="panel__hint">{series.commodity.unit} · EIA series {series.commodity.eiaSeriesId}</p>
            <PriceChart points={series.points} format={(v) => usd(v)} label={`${series.commodity.name} price, ${frequency.toLowerCase()}`} />
          </section>
        </>
      )}
      {dash.loading && !series && <p className="empty">Loading…</p>}

      {spread.data && (
        <section className="panel">
          <h2>Brent – WTI spread</h2>
          <p className="panel__hint">How much more a barrel of Brent costs than WTI. One GraphQL field, two data fetches joined on the server.</p>
          <PriceChart points={spread.data.spread.points} format={(v) => usd(v)} zeroLine height={180} tone="secondary" label="Brent minus WTI spread" />
        </section>
      )}

      {commodities.data && <AlertsPanel commodities={commodities.data.commodities} defaultCommodity={commodity} />}

      <footer className="footer">
        Explore the API yourself at <a href="http://localhost:4000">localhost:4000</a> (Apollo Sandbox).
      </footer>
    </div>
  );
}

/**
 * A generic component: <T extends string> means `value`, `onChange` and each
 * option id all share ONE string type — e.g. Commodity — so you can't pass
 * a Frequency setter to the commodity picker by mistake.
 */
function Segmented<T extends string>(props: {
  label: string;
  options: { id: T; text: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label={props.label}>
      <span className="segmented__label">{props.label}</span>
      {props.options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={o.id === props.value}
          className={o.id === props.value ? "is-active" : undefined}
          onClick={() => props.onChange(o.id)}
        >
          {o.text}
        </button>
      ))}
    </div>
  );
}
