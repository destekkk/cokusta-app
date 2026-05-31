import type { ProviderOffer, ProviderRegistration, QuoteRequest } from "@/lib/types";
import { generateId } from "@/lib/id";
import { getServiceBySlug } from "@/lib/data/services";
import { sanitizeQuoteForProvider } from "@/lib/quote-privacy";

export function quoteIsOpenForOffers(quote: QuoteRequest): boolean {
  return quote.status === "open";
}

export function providerCanSeeQuote(
  provider: ProviderRegistration,
  quote: QuoteRequest
): boolean {
  if (provider.status !== "approved") return false;
  const service = getServiceBySlug(quote.serviceSlug);
  if (!service) return false;
  const cityMatch =
    !provider.city ||
    provider.city === quote.city ||
    quote.city.toLocaleLowerCase("tr-TR").includes(provider.city.toLocaleLowerCase("tr-TR"));
  const categoryMatch = provider.categorySlugs.includes(service.categorySlug);
  return cityMatch && categoryMatch;
}

export function buildOfferInput(
  quoteRequestId: string,
  providerId: string,
  price: number,
  message: string,
  estimatedDays?: number
): Omit<ProviderOffer, "id" | "createdAt" | "status"> {
  return {
    quoteRequestId,
    providerId,
    price,
    message: message.trim(),
    estimatedDays,
  };
}

export function enrichOffer(
  offer: ProviderOffer,
  provider?: Pick<ProviderRegistration, "name" | "city">
): ProviderOffer {
  return {
    ...offer,
    providerName: provider?.name,
    providerCity: provider?.city,
  };
}

export function toPublicQuoteListItem(
  quote: QuoteRequest,
  offerCount: number,
  revealContact: boolean
) {
  return sanitizeQuoteForProvider(quote, { revealContact, offerCount });
}

export { generateId };
