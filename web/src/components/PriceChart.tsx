import { useId, useMemo, useState, type PointerEvent } from "react";
import { formatDate } from "../format";
import { useElementWidth } from "./useElementWidth";

/**
 * A dependency-free SVG line chart.
 *
 * Only structural typing matters here: any object with `date` and `value`
 * fits `Point`, so the generated GraphQL types plug straight in.
 */
export interface Point {
  date: string;
  value: number;
}

interface PriceChartProps {
  points: readonly Point[];
  /** Formats values for the axis and tooltip. */
  format: (value: number) => string;
  /** Draw a horizontal reference line at zero (for spreads). */
  zeroLine?: boolean;
  /** Accessible description of what the chart shows. */
  label: string;
  height?: number;
  tone?: "primary" | "secondary";
}

const PAD = { top: 12, right: 12, bottom: 24, left: 56 };

export function PriceChart({ points, format, zeroLine = false, label, height = 260, tone = "primary" }: PriceChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const titleId = useId();
  // Draw at the real on-screen width so text stays readable on phones.
  const [figureRef, WIDTH] = useElementWidth<HTMLElement>();

  // useMemo: only recompute the geometry when the data actually changes.
  const geo = useMemo(() => {
    const values = points.map((p) => p.value);
    let lo = Math.min(...values, zeroLine ? 0 : Infinity);
    let hi = Math.max(...values, zeroLine ? 0 : -Infinity);
    const pad = (hi - lo) * 0.08 || 1;
    lo -= pad;
    hi += pad;

    const innerW = WIDTH - PAD.left - PAD.right;
    const innerH = height - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * innerH;

    const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join("");
    const ticks = Array.from({ length: 4 }, (_, i) => lo + ((hi - lo) * (i + 0.5)) / 4);
    return { x, y, path, ticks, innerW };
  }, [points, zeroLine, height, WIDTH]);


  function onMove(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round(((px - PAD.left) / geo.innerW) * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  }

  const hovered = hover === null ? undefined : points[hover];
  const first = points[0];
  const last = points.at(-1);

  if (points.length === 0) return <p className="empty">No data in this range.</p>;

  return (
    <figure ref={figureRef} className={`chart chart--${tone}`}>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-labelledby={titleId}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <title id={titleId}>{label}</title>
        {geo.ticks.map((t) => (
          <g key={t} className="chart__grid">
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={geo.y(t)} y2={geo.y(t)} />
            <text x={PAD.left - 8} y={geo.y(t)} dy="0.32em" textAnchor="end">
              {format(t)}
            </text>
          </g>
        ))}
        {zeroLine && <line className="chart__zero" x1={PAD.left} x2={WIDTH - PAD.right} y1={geo.y(0)} y2={geo.y(0)} />}
        <path className="chart__line" d={geo.path} />
        {first && last && (
          <g className="chart__axis">
            <text x={PAD.left} y={height - 6}>{formatDate(first.date)}</text>
            <text x={WIDTH - PAD.right} y={height - 6} textAnchor="end">{formatDate(last.date)}</text>
          </g>
        )}
        {hovered && hover !== null && (
          <g className="chart__hover">
            <line x1={geo.x(hover)} x2={geo.x(hover)} y1={PAD.top} y2={height - PAD.bottom} />
            <circle cx={geo.x(hover)} cy={geo.y(hovered.value)} r={5} />
          </g>
        )}
      </svg>
      {hovered && hover !== null && (
        <div
          className="chart__tooltip"
          style={{ left: `${(geo.x(hover) / WIDTH) * 100}%`, transform: `translateX(${hover > points.length / 2 ? "-105%" : "5%"})` }}
        >
          <span>{formatDate(hovered.date)}</span>
          <strong>{format(hovered.value)}</strong>
        </div>
      )}
    </figure>
  );
}
