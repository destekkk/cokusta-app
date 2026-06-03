import type { ProviderOffer } from "@/lib/types";
import type { CustomerQuoteTab } from "@/lib/customer-quotes-filter";

/** Karşılıklı yazışma / pazarlık süreci (en az bir karşı teklif veya anlaşma onayı). */
export function offerHasNegotiationThread(
  offer: Pick<ProviderOffer, "negotiation" | "customerAgreedAt" | "providerAgreedAt" | "status">
): boolean {
  if (offer.status !== "pending") return false;
  if (offer.customerAgreedAt || offer.providerAgreedAt) return true;
  return (offer.negotiation?.length ?? 0) >= 2;
}

export function classifyCustomerQuoteTab(
  quote: { status: string },
  offers: ProviderOffer[]
): CustomerQuoteTab {
  if (quote.status === "accepted" || quote.status === "completed" || quote.status === "cancelled") {
    return "finished";
  }
  const pending = offers.filter((o) => o.status === "pending");
  if (pending.length === 0) return "waiting";
  if (pending.some(offerHasNegotiationThread)) return "negotiating";
  return "offers";
}
