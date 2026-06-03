import type { PublicProviderReview, ProviderReviewStats } from "@/lib/types";

type Props = {
  stats: ProviderReviewStats;
  reviews: PublicProviderReview[];
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500" aria-label={`${rating} / 5`}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export default function ProviderReviewsSection({ stats, reviews }: Props) {
  if (stats.reviewCount === 0) {
    return (
      <section className="mt-12">
        <h2 className="text-xl font-bold text-foreground">Müşteri değerlendirmeleri</h2>
        <p className="mt-2 text-sm text-muted-foreground">Henüz değerlendirme yok.</p>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Müşteri değerlendirmeleri</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{stats.averageRating}</span> / 5 ·{" "}
            {stats.reviewCount.toLocaleString("tr-TR")} yorum
          </p>
        </div>
      </div>
      <ul className="mt-6 space-y-4">
        {reviews.map((review) => (
          <li key={review.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-foreground">{review.reviewerLabel}</span>
              <Stars rating={review.rating} />
              <span className="text-xs text-muted-foreground">
                {review.serviceName} ·{" "}
                {new Date(review.createdAt).toLocaleDateString("tr-TR")}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
