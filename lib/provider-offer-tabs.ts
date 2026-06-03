import type { ProviderOffer } from "@/lib/types";
import { offerHasNegotiationThread } from "@/lib/negotiation-tabs";

export type ProviderOfferSheetTab = "open" | "mine" | "negotiating" | "done" | "escrow";

export type ProviderOfferListItem = {
  offer: ProviderOffer;
  quote: { id: string; serviceName: string; city: string; district: string; status: string; createdAt: string };
  escrowStatus?: "pending" | "completed" | "failed" | null;
  escrowReleaseStatus?: "none" | "requested" | "released" | null;
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

export function providerOfferHasEscrow(
  item: Pick<ProviderOfferListItem, "escrowStatus">
): boolean {
  return item.escrowStatus === "completed" || item.escrowStatus === "pending";
}

export function filterProviderOffersBySheetTab<T extends ProviderOfferTabInput>(
  items: T[],
  tab: ProviderOfferSheetTab
): T[] {
  if (tab === "escrow") {
    return items.filter((item) =>
      providerOfferHasEscrow(item as ProviderOfferListItem)
    );
  }
  if (tab === "done") return items.filter(isProviderOfferFinished);
  if (tab === "open") return [];
  if (tab === "negotiating") {
    return items.filter(
      (item) => !isProviderOfferFinished(item) && offerHasNegotiationThread(item.offer)
    );
  }
  return items.filter(
    (item) => !isProviderOfferFinished(item) && !offerHasNegotiationThread(item.offer)
  );
}

export function countProviderOfferTabs(
  items: (ProviderOfferTabInput & Pick<ProviderOfferListItem, "escrowStatus">)[]
): {
  mine: number;
  negotiating: number;
  done: number;
  escrow: number;
} {
  let mine = 0;
  let negotiating = 0;
  let done = 0;
  let escrow = 0;
  for (const item of items) {
    if (providerOfferHasEscrow(item)) escrow++;
    if (isProviderOfferFinished(item)) {
      done++;
      continue;
    }
    if (offerHasNegotiationThread(item.offer)) negotiating++;
    else mine++;
  }
  return { mine, negotiating, done, escrow };
}
