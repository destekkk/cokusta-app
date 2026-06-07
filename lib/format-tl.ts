/** Türkçe para formatı: 1.000 TL */
export function formatTl(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  return `${Math.round(amount).toLocaleString("tr-TR")} TL`;
}
