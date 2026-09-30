import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { AlertsQuery, CreateAlertMutation, DeleteAlertMutation } from "../graphql/operations";
import type { AlertDirection, Commodity, CommoditiesQuery } from "../gql/graphql";
import { usd } from "../format";

type CommodityOption = CommoditiesQuery["commodities"][number];

export function AlertsPanel({ commodities, defaultCommodity }: { commodities: CommodityOption[]; defaultCommodity: Commodity }) {
  const { data, loading } = useQuery(AlertsQuery);

  // After a mutation, re-run the Alerts query so the list is up to date.
  // (Alternative: update the cache by hand with `update` — see LEARNING.md.)
  const [createAlert, created] = useMutation(CreateAlertMutation, { refetchQueries: [AlertsQuery] });
  const [deleteAlert] = useMutation(DeleteAlertMutation, { refetchQueries: [AlertsQuery] });

  const [commodity, setCommodity] = useState<Commodity>(defaultCommodity);
  const [direction, setDirection] = useState<AlertDirection>("ABOVE");
  const [threshold, setThreshold] = useState("");
  const [note, setNote] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    // `variables` is type-checked against CreateAlertInput from the schema.
    await createAlert({ variables: { input: { commodity, direction, threshold: Number(threshold), note: note || null } } });
    setThreshold("");
    setNote("");
  }

  return (
    <section className="panel">
      <h2>Price alerts</h2>
      <p className="panel__hint">Checked against the latest daily price every time the list loads. Stored in server memory.</p>

      <form className="alert-form" onSubmit={onSubmit}>
        <select value={commodity} onChange={(e) => setCommodity(e.target.value as Commodity)} aria-label="Commodity">
          {commodities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={direction} onChange={(e) => setDirection(e.target.value as AlertDirection)} aria-label="Direction">
          <option value="ABOVE">rises above</option>
          <option value="BELOW">falls below</option>
        </select>
        <input
          type="number" step="0.01" placeholder="Price" required value={threshold}
          onChange={(e) => setThreshold(e.target.value)} aria-label="Threshold price"
        />
        <input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Note" />
        <button type="submit" disabled={created.loading}>Add alert</button>
      </form>
      {/* Server-side validation errors (BAD_USER_INPUT) surface here. */}
      {created.error && <p className="error">{created.error.message}</p>}

      {loading && !data ? (
        <p className="empty">Loading…</p>
      ) : data?.alerts.length ? (
        <ul className="alerts">
          {data.alerts.map((a) => (
            <li key={a.id} className={a.triggered ? "alert alert--triggered" : "alert"}>
              <span className="alert__status">{a.triggered ? "● Triggered" : "○ Watching"}</span>
              <span className="alert__rule">
                {a.commodity.name} {a.direction === "ABOVE" ? "≥" : "≤"} {usd(a.threshold)}
                {a.note && <em> — {a.note}</em>}
              </span>
              <span className="alert__now">now {a.currentPrice != null ? usd(a.currentPrice) : "—"}</span>
              <button className="link" onClick={() => deleteAlert({ variables: { id: a.id } })} aria-label="Delete alert">✕</button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">No alerts yet.</p>
      )}
    </section>
  );
}
