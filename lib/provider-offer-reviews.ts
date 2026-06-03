import type { ProviderOffer, QuoteRequest } from "@/lib/types";

export const REVIEW_COMMENT_MIN = 10;
export const REVIEW_COMMENT_MAX = 1000;

export type ProviderOfferReviewInput = {
  rating: number;
  comment: string;
};

export function reviewerLabelFromCustomerName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Müşteri";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
}

export function validateProviderOfferReviewInput(
  input: ProviderOfferReviewInput
): string | null {
  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return "Puan 1 ile 5 arasında olmalıdır.";
  }
  const comment = input.comment?.trim() ?? "";
  if (comment.length < REVIEW_COMMENT_MIN) {
    return `Yorum en az ${REVIEW_COMMENT_MIN} karakter olmalıdır.`;
  }
  if (comment.length > REVIEW_COMMENT_MAX) {
    return `Yorum en fazla ${REVIEW_COMMENT_MAX} karakter olabilir.`;
  }
  return null;
}

/** Müşteri, teklif veren ustayı değerlendirebilir (geri çekilen teklif hariç). */
export function canCustomerReviewOffer(
  quote: Pick<QuoteRequest, "status">,
  offer: Pick<ProviderOffer, "status">
): boolean {
  if (quote.status === "cancelled" || quote.status === "awaiting_review") {
    return false;
  }
  return offer.status !== "withdrawn";
}

export function attachReviewsToCustomerOffers(
  offers: ProviderOffer[],
  quote: Pick<QuoteRequest, "status">,
  reviewsByOfferId: Map<string, ProviderOfferReviewSummary>
): ProviderOffer[] {
  return offers.map((offer) => {
    const customerReview = reviewsByOfferId.get(offer.id);
    return {
      ...offer,
      customerReview,
      canReview: canCustomerReviewOffer(quote, offer) && !customerReview,
    };
  });
}
