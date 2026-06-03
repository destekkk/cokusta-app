"use client";

import { useState } from "react";
import type { ProviderOffer, ProviderOfferReviewSummary } from "@/lib/types";
import { REVIEW_COMMENT_MIN } from "@/lib/provider-offer-reviews";

type Props = {
  quoteId: string;
  offer: ProviderOffer;
  compact?: boolean;
  onSubmitted: (review: ProviderOfferReviewSummary) => void;
};

function StarPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-1" role="group" aria-label="Puan seçin">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className={`text-2xl leading-none transition ${
            n <= value ? "text-amber-500" : "text-muted-foreground/40"
          } disabled:opacity-50`}
          aria-label={`${n} yıldız`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewDisplay({
  review,
  compact,
}: {
  review: ProviderOfferReviewSummary;
  compact?: boolean;
}) {
  return (
    <div
      className={`${compact ? "mt-2 rounded-md px-2.5 py-2 text-xs" : "mt-3 rounded-lg px-4 py-3 text-sm"} border border-border bg-muted/30`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-foreground">Değerlendirmeniz</span>
        <span className="text-amber-600" aria-hidden>
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString("tr-TR")}
        </span>
      </div>
      <p className="mt-2 leading-relaxed text-muted-foreground">{review.comment}</p>
    </div>
  );
}

export default function CustomerOfferReviewForm({
  quoteId,
  offer,
  compact = false,
  onSubmitted,
}: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  if (offer.customerReview) {
    return <ReviewDisplay review={offer.customerReview} compact={compact} />;
  }

  if (!offer.canReview) {
    return null;
  }

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/musteri/teklif/${quoteId}/degerlendirme`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: offer.id, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gönderilemedi");
      onSubmitted(data.review);
      setOpen(false);
      setComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gönderilemedi");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div className={compact ? "mt-2" : "mt-3"}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={
            compact
              ? "text-xs font-semibold text-primary hover:underline"
              : "rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/50"
          }
        >
          Bu ustayı değerlendir
        </button>
      </div>
    );
  }

  return (
    <div className={`${compact ? "mt-2 rounded-md p-2.5" : "mt-3 rounded-lg p-4"} border border-border bg-card`}>
      <p className="text-sm font-semibold text-foreground">
        {offer.providerName ?? "Usta"} — değerlendirme
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Puan ve yorumunuz usta profilinde görünebilir (adınız kısaltılarak).
      </p>
      <div className="mt-3">
        <StarPicker value={rating} onChange={setRating} disabled={loading} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={loading}
        rows={3}
        placeholder={`Deneyiminizi kısaca yazın (en az ${REVIEW_COMMENT_MIN} karakter)`}
        className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm"
      />
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={submit}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Gönderiliyor…" : "Değerlendirmeyi gönder"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
        >
          Vazgeç
        </button>
      </div>
    </div>
  );
}
