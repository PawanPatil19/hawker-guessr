export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** "$1.20 under" / "$0.80 over" — used on the price reveal. */
export function formatDelta(cents: number): string {
  if (cents === 0) return "exactly right";
  return `${formatCents(Math.abs(cents))} ${cents > 0 ? "over" : "under"}`;
}
