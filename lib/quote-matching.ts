import type { ProviderOffer, ProviderRegistration, QuoteRequest } from "@/lib/types";
import { providerCanSeeQuote } from "@/lib/offer-utils";

export type BulkQuoteActionResult = {
  processed: number;
  succeeded: string[];
  failed: { id: string; error: string }[];
};

export function countActiveJobsByProvider(quotes: QuoteRequest[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const quote of quotes) {
    if (quote.status !== "accepted" || !quote.matchedProviderId) continue;
    counts.set(quote.matchedProviderId, (counts.get(quote.matchedProviderId) ?? 0) + 1);
  }
  return counts;
}

export function scoreProviderForQuote(
  provider: ProviderRegistration,
  quote: QuoteRequest,
  activeJobs: number
): number {
  if (!providerCanSeeQuote(provider, quote)) return -1;
  let score = 0;
  if (provider.city === quote.city) score += 20;
  else if (
    provider.city &&
    quote.city.toLocaleLowerCase("tr-TR").includes(provider.city.toLocaleLowerCase("tr-TR"))
  ) {
    score += 10;
  }
  score += Math.max(0, 8 - activeJobs);
  if ((provider.creditBalance ?? 0) > 0) score += 2;
  return score;
}

export function pickBestProvider(
  quote: QuoteRequest,
  providers: ProviderRegistration[],
  activeJobCounts: Map<string, number>
): ProviderRegistration | undefined {
  let best: ProviderRegistration | undefined;
  let bestScore = -1;

  for (const provider of providers) {
    const score = scoreProviderForQuote(
      provider,
      quote,
      activeJobCounts.get(provider.id) ?? 0
    );
    if (score > bestScore) {
      bestScore = score;
      best = provider;
    }
  }

  return best;
}

export function pickBestOffer(offers: ProviderOffer[]): ProviderOffer | undefined {
  const pending = offers.filter((o) => o.status === "pending");
  if (pending.length === 0) return undefined;
  return [...pending].sort((a, b) => a.price - b.price)[0];
}

export function quoteCanApprove(quote: QuoteRequest): boolean {
  return quote.status === "awaiting_review";
}

export function quoteCanReject(quote: QuoteRequest): boolean {
  return quote.status === "awaiting_review" || quote.status === "open";
}

export function quoteCanMatch(quote: QuoteRequest): boolean {
  return quote.status === "open" || quote.status === "awaiting_review";
}

export function quoteCanAutoMatch(quote: QuoteRequest): boolean {
  return quoteCanMatch(quote);
}
