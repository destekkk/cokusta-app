import type { ProviderOffer } from "@/lib/types";

export type ProviderOfferSheetTab = "open" | "mine" | "done";

export type ProviderOfferListItem = {
  offer: ProviderOffer;
  quote: { id: string; serviceName: string; city: string; district: string; status: string; createdAt: string };
};

type ProviderOfferTabInput = {
  offer: Pick<ProviderOffer, "status" | "customerAgreedAt" | "providerAgreedAt">;
  quote: { status: string };
};

/** Anlaşılmış, tamamlanmış veya kapanmış işler */
export function isProviderOfferFinished(item: ProviderOfferTabInput): boolean {
  const { offer, quote } = item;
  if (quote.status === "accepted" || quote.status === "completed") return true;
  if (offer.status === "accepted") return true;
  if (offer.status === "rejected" || offer.status === "withdrawn") return true;
  if (offer.customerAgreedAt && offer.providerAgreedAt) return true;
  return false;
}

export function filterProviderOffersBySheetTab<T extends ProviderOfferTabInput>(
  items: T[],
  tab: "mine" | "done" | "active"
): T[] {
  if (tab === "done") return items.filter(isProviderOfferFinished);
  return items.filter((item) => !isProviderOfferFinished(item));
}

export function countProviderOfferTabs(items: ProviderOfferTabInput[]): {
  mine: number;
  done: number;
} {
  const done = items.filter(isProviderOfferFinished).length;
  return { mine: items.length - done, done };
}
