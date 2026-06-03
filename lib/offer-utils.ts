import type { OfferNegotiationEntry, ProviderOffer, ProviderRegistration, QuoteRequest } from "@/lib/types";
import { generateId } from "@/lib/id";
import { categories } from "@/lib/data/categories";
import { getServiceBySlug } from "@/lib/data/services";
import { citiesMatch, districtsMatch, normalizeCityName } from "@/lib/location-match";
import { cities } from "@/lib/data/cities";
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

export type ProviderQuoteLocationFilter = {
  cityMode: "provider" | "all" | "selected";
  selectedCity?: string;
  selectedDistrict?: string;
};

/** @deprecated ProviderQuoteLocationFilter kullanın */
export type ProviderQuoteScope = "city" | "all";

export function parseProviderQuoteLocationFilter(
  params: { city?: string | null; district?: string | null },
  providerCity: string
): ProviderQuoteLocationFilter {
  const city = params.city?.trim();
  const district = params.district?.trim() || undefined;
  if (city === "all") return { cityMode: "all" };
  if (city) return { cityMode: "selected", selectedCity: resolveCanonicalCityName(city), selectedDistrict: district };
  return { cityMode: "provider", selectedDistrict: district };
}

/** Veritabanı / filtre için tutarlı il adı */
export function resolveCanonicalCityName(city: string): string {
  const normalized = normalizeCityName(city);
  const match = cities.find((name) => normalizeCityName(name) === normalized);
  return match ?? city.trim();
}

export function locationFilterToQuery(location: ProviderQuoteLocationFilter, providerCity: string) {
  if (location.cityMode === "all") {
    return { city: "all" as const, district: undefined };
  }
  if (location.cityMode === "selected" && location.selectedCity) {
    return { city: location.selectedCity, district: location.selectedDistrict };
  }
  return { city: undefined, district: location.selectedDistrict, providerCity };
}

export function providerCategoryMatches(
  provider: ProviderRegistration,
  quote: QuoteRequest
): boolean {
  const categorySlug = resolveQuoteCategorySlug(quote);
  if (!categorySlug) return false;
  const slugs = Array.isArray(provider.categorySlugs) ? provider.categorySlugs : [];
  return slugs.includes(categorySlug);
}

export function providerCanSeeQuote(
  provider: ProviderRegistration,
  quote: QuoteRequest,
  location: ProviderQuoteLocationFilter = { cityMode: "provider" }
): boolean {
  if (provider.status !== "approved") return false;
  if (!providerCategoryMatches(provider, quote)) return false;

  if (location.cityMode === "all") return true;

  const targetCity =
    location.cityMode === "selected" && location.selectedCity
      ? location.selectedCity
      : provider.city;

  if (!citiesMatch(targetCity, quote.city)) return false;

  if (location.selectedDistrict) {
    if (!districtsMatch(location.selectedDistrict, quote.district)) return false;
  }

  return true;
}

/** Kategori uygunsa il dışı taleplere de teklif verilebilir. */
export function providerCanBidOnQuote(
  provider: ProviderRegistration,
  quote: QuoteRequest
): boolean {
  if (provider.status !== "approved") return false;
  return providerCategoryMatches(provider, quote);
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
  const last = sortNegotiationEntries(offer.negotiation)[0];
  return last?.price ?? offer.price;
}

export function sortNegotiationEntries(
  negotiation: OfferNegotiationEntry[] | undefined
): OfferNegotiationEntry[] {
  return [...(negotiation ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOfferLastActivityAt(
  offer: Pick<ProviderOffer, "createdAt" | "negotiation">
): number {
  const entries = offer.negotiation ?? [];
  if (entries.length === 0) return new Date(offer.createdAt).getTime();
  return Math.max(...entries.map((entry) => new Date(entry.createdAt).getTime()));
}

export function sortOffersByLatestActivity<T extends Pick<ProviderOffer, "createdAt" | "negotiation">>(
  offers: T[]
): T[] {
  return [...offers].sort((a, b) => getOfferLastActivityAt(b) - getOfferLastActivityAt(a));
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
