import type { DashboardQuery } from "../gql/graphql";
import { formatDate, signed, usd } from "../format";

/**
 * Indexed access types pull a nested type out of the generated query type.
 * NonNullable strips the `| null` because we only render when stats exist.
 */
type Stats = NonNullable<DashboardQuery["series"]["stats"]>;
type Latest = NonNullable<DashboardQuery["series"]["latest"]>;

export function StatTiles({ stats, latest, unit }: { stats: Stats; latest: Latest; unit: string }) {
  const direction = stats.change > 0 ? "up" : stats.change < 0 ? "down" : "flat";
  return (
    <div className="tiles">
      <div className="tile tile--hero">
        <span className="tile__label">Latest · {formatDate(latest.date)}</span>
        <span className="tile__value">{usd(latest.value)}</span>
        <span className="tile__sub">{unit}</span>
      </div>
      <div className="tile">
        <span className="tile__label">Change over range</span>
        <span className={`tile__value tile__value--${direction}`}>
          {direction === "up" ? "▲" : direction === "down" ? "▼" : "■"} {signed(stats.changePercent, "%")}
        </span>
        <span className="tile__sub">{signed(stats.change)} USD</span>
      </div>
      <div className="tile">
        <span className="tile__label">Range low / high</span>
        <span className="tile__value">
          {usd(stats.min)} – {usd(stats.max)}
        </span>
        <span className="tile__sub">mean {usd(stats.mean)}</span>
      </div>
      <div className="tile">
        <span className="tile__label">Observations</span>
        <span className="tile__value">{stats.count.toLocaleString()}</span>
        <span className="tile__sub">data points</span>
      </div>
    </div>
  );
}
