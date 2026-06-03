import type { OfferReviewStatus } from "@/lib/types";

export const OFFER_REVIEW_STATUS_LABELS: Record<OfferReviewStatus, string> = {
  pending: "Onay bekliyor",
  approved: "Yayında",
  rejected: "Reddedildi",
};

export function isOfferReviewPublished(status: OfferReviewStatus): boolean {
  return status === "approved";
}
