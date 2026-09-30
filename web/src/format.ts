export const usd = (n: number, digits = 2) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits });

export const signed = (n: number, suffix = "") => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(2)}${suffix}`;

/** "2025-03" → "Mar 2025", "2025-03-14" → "Mar 14, 2025" */
export function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  if (y === undefined || m === undefined) return date;
  const dt = new Date(Date.UTC(y, m - 1, d ?? 1));
  return dt.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    ...(d !== undefined ? { day: "numeric" } : {}),
    timeZone: "UTC",
  });
}
