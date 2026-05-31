export const URGENT_DEADLINE_DAYS = 3;

export function computeUrgentDeadline(from = new Date()): string {
  const deadline = new Date(from);
  deadline.setDate(deadline.getDate() + URGENT_DEADLINE_DAYS);
  return deadline.toISOString();
}

export function isUrgentActive(quote: {
  urgent?: boolean;
  urgentDeadline?: string;
  status: string;
}): boolean {
  if (!quote.urgent) return false;
  if (quote.status !== "open" && quote.status !== "accepted") return false;
  if (!quote.urgentDeadline) return true;
  return new Date(quote.urgentDeadline) >= new Date();
}

export function formatUrgentRemaining(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "Süre doldu";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} gün ${hours} saat kaldı`;
  if (hours > 0) return `${hours} saat kaldı`;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes} dakika kaldı`;
}

export function formatUrgentDeadline(deadline: string): string {
  return new Date(deadline).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
