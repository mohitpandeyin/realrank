export type RankAmountDirection = "increase" | "decrease";

export function stepRankAmount(value: string, direction: RankAmountDirection): string {
  const parsed = Number(value);
  const wholeAmount = Number.isFinite(parsed) ? Math.trunc(parsed) : 0;

  if (direction === "increase") {
    return String(wholeAmount < 10 ? 10 : Math.floor(wholeAmount / 10) * 10 + 10);
  }

  return String(wholeAmount <= 10 ? 10 : Math.max(10, Math.ceil(wholeAmount / 10) * 10 - 10));
}

export function formatRankAmount(value: string): string {
  const amount = Number(value);
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
}
