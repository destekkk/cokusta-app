import type { ProviderOffer, QuoteRequest } from "@/lib/types";
import { sortNegotiationEntries } from "@/lib/offer-utils";

export function bothPartiesAgreedOnOffer(offer: Pick<ProviderOffer, "customerAgreedAt" | "providerAgreedAt">): boolean {
  return Boolean(offer.customerAgreedAt && offer.providerAgreedAt);
}

/** Müşteri henüz "Anlaştık" demeden usta onaylayamaz. */
export function canProviderConfirmAgreement(
  offer: Pick<ProviderOffer, "status" | "customerAgreedAt" | "providerAgreedAt">
): boolean {
  return (
    offer.status === "pending" &&
    Boolean(offer.customerAgreedAt) &&
    !offer.providerAgreedAt
  );
}

export function canCustomerConfirmAgreement(
  offer: Pick<ProviderOffer, "status" | "customerAgreedAt">
): boolean {
  return offer.status === "pending" && !offer.customerAgreedAt;
}

/** Müşteri anlaştıktan sonra karşı teklif verilemez. */
export function canPartyCounterOffer(
  offer: Pick<ProviderOffer, "status" | "customerAgreedAt">
): boolean {
  return offer.status === "pending" && !offer.customerAgreedAt;
}

export function isMutualNegotiationActive(
  offer: Pick<ProviderOffer, "negotiation" | "customerAgreedAt" | "providerAgreedAt">
): boolean {
  const entries = offer.negotiation ?? [];
  return entries.length > 0 && !offer.customerAgreedAt && !offer.providerAgreedAt;
}

export function latestNegotiationFrom(
  offer: Pick<ProviderOffer, "negotiation">
): "customer" | "provider" | null {
  const latest = sortNegotiationEntries(offer.negotiation)[0];
  return latest?.from ?? null;
}

/** Müşteri ustayı aramaya hazır: çift onay veya kabul edilmiş teklif. */
export function canCustomerInitiateProviderCall(
  quote: Pick<QuoteRequest, "status">,
  offer: Pick<
    ProviderOffer,
    "status" | "customerAgreedAt" | "providerAgreedAt"
  >
): boolean {
  if (offer.status === "accepted") return true;
  if (quote.status === "accepted" || quote.status === "completed") return true;
  return bothPartiesAgreedOnOffer(offer) && offer.status === "pending";
}

/** Usta telefonu yalnızca müşteri "Ustayı ara" dedikten sonra panelde görünür. */
export function shouldRevealProviderContactToCustomer(
  offer: Pick<ProviderOffer, "customerInitiatedContactAt">
): boolean {
  return Boolean(offer.customerInitiatedContactAt);
}

/** Ustaya müşteri bilgisi uygulama içinde hiç açılmaz. */
export function shouldRevealCustomerContactToProvider(): boolean {
  return false;
}
