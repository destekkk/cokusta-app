import type { OfferNegotiationEntry, ProviderOffer, ProviderRegistration, QuoteRequest } from "@/lib/types";
import { generateId } from "@/lib/id";
import { categories } from "@/lib/data/categories";
import { getServiceBySlug } from "@/lib/data/services";
import { citiesMatch } from "@/lib/location-match";
import { sanitizeQuoteForProvider } from "@/lib/quote-privacy";

export function quoteIsOpenForOffers(quote: QuoteRequest): boolean {
  return quote.status === "open";
}

export function resolveQuoteCategorySlug(quote: QuoteRequest): string | undefined {
  const service = getServiceBySlug(quote.serviceSlug);
  if (service) return service.categorySlug;

  const normalizedName = quote.categoryName.trim().toLocaleLowerCase("tr-TR");
  const match = categories.find(
    (category) =>
      category.slug === quote.categoryName ||
      category.name === quote.categoryName ||
      category.name.toLocaleLowerCase("tr-TR") === normalizedName
  );
  return match?.slug;
}

export function providerCanSeeQuote(
  provider: ProviderRegistration,
  quote: QuoteRequest
): boolean {
  if (provider.status !== "approved") return false;

  const categorySlug = resolveQuoteCategorySlug(quote);
  if (!categorySlug) return false;

  const slugs = Array.isArray(provider.categorySlugs) ? provider.categorySlugs : [];
  const categoryMatch = slugs.includes(categorySlug);
  const cityMatch = citiesMatch(provider.city, quote.city);
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

export function parseNegotiation(raw: unknown): OfferNegotiationEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is OfferNegotiationEntry =>
      !!item &&
      typeof item === "object" &&
      (item as OfferNegotiationEntry).from !== undefined &&
      typeof (item as OfferNegotiationEntry).price === "number" &&
      typeof (item as OfferNegotiationEntry).message === "string"
  );
}

export function getCurrentOfferPrice(offer: Pick<ProviderOffer, "price" | "negotiation">): number {
  const last = offer.negotiation?.[offer.negotiation.length - 1];
  return last?.price ?? offer.price;
}

export function buildInitialNegotiation(
  price: number,
  message: string
): OfferNegotiationEntry[] {
  return [
    {
      from: "provider",
      price: Math.round(price),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    },
  ];
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
