"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatDateTime } from "@/lib/admin-labels";
import { OFFER_REVIEW_STATUS_LABELS } from "@/lib/offer-review-moderation";
import type { AdminOfferReviewRow } from "@/lib/types";

type Props = {
  initialReviews: AdminOfferReviewRow[];
  initialFilter: "pending" | "approved" | "all";
};

function stars(n: number) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export default function AdminOfferReviewsPanel({ initialReviews, initialFilter }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState(initialFilter);
  const [reviews, setReviews] = useState(initialReviews);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sorted = useMemo(
    () =>
      [...reviews].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [reviews]
  );

  const reload = async (next: typeof filter) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/degerlendirmeler?status=${next}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Yüklenemedi");
      setReviews(data.reviews ?? []);
      setFilter(next);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string) => {
    if (!confirm("Bu değerlendirme yayına alınsın mı?")) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/degerlendirme/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Onaylanamadı");
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setMessage("Değerlendirme onaylandı.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Onaylanamadı");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Bu değerlendirme kalıcı olarak silinsin mi?")) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/degerlendirme/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Silinemedi");
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setMessage("Değerlendirme silindi.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Silinemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["pending", "Onay bekleyen"],
            ["approved", "Yayında"],
            ["all", "Tümü"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            disabled={loading}
            onClick={() => reload(key)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              filter === key
                ? "bg-primary text-white"
                : "border border-border bg-card text-foreground hover:bg-muted/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {message && (
        <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">{message}</p>
      )}

      {sorted.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Bu filtrede değerlendirme yok.
        </p>
      ) : (
        <div className="space-y-4">
          {sorted.map((row) => (
            <article
              key={row.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {row.serviceName}{" "}
                    <span className="text-amber-600" aria-hidden>
                      {stars(row.rating)}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.reviewerLabel} · {formatDateTime(row.createdAt)} ·{" "}
                    <span className="font-medium text-foreground">
                      {OFFER_REVIEW_STATUS_LABELS[row.status]}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.status === "pending" && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => approve(row.id)}
                      className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Onayla
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => remove(row.id)}
                    className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Sil
                  </button>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {row.comment}
              </p>

              <div className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/30 p-4 text-sm">
                  <p className="font-semibold text-foreground">Müşteri / talep</p>
                  <p className="mt-2 text-muted-foreground">
                    {row.customerName}
                    <br />
                    Tel:{" "}
                    <a href={`tel:${row.customerPhone}`} className="text-primary hover:underline">
                      {row.customerPhone}
                    </a>
                    <br />
                    {row.quoteCity}
                    {row.quoteDistrict ? `, ${row.quoteDistrict}` : ""}
                  </p>
                  <a
                    href={`/sltn/teklifler?status=completed`}
                    className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                  >
                    Talep listesi →
                  </a>
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                  <p className="font-semibold text-foreground">Usta (irtibat)</p>
                  <p className="mt-2 text-muted-foreground">
                    <span className="font-medium text-foreground">{row.providerName}</span>
                    <br />
                    Tel:{" "}
                    <a href={`tel:${row.providerPhone}`} className="text-primary hover:underline">
                      {row.providerPhone}
                    </a>
                    <br />
                    E-posta:{" "}
                    <a
                      href={`mailto:${row.providerEmail}`}
                      className="text-primary hover:underline"
                    >
                      {row.providerEmail}
                    </a>
                    <br />
                    {row.providerCity}
                  </p>
                  <a
                    href={`/sltn/usta-listesi`}
                    className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                  >
                    Usta listesi →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
