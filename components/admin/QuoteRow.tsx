"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatDateTime } from "@/lib/admin-labels";
import { formatUrgentRemaining } from "@/lib/urgent";
import { getQuoteAnswers } from "@/lib/quote-answers";
import InvoiceButton from "@/components/admin/InvoiceButton";
import { quotePhoneForAdmin } from "@/lib/quote-privacy";
import type { ProviderOffer, QuoteRequest } from "@/lib/types";

const statusLabels: Record<QuoteRequest["status"], string> = {
  awaiting_review: "Onay Bekliyor",
  open: "Yayında",
  accepted: "Usta Seçildi",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
};

const statusColors: Record<QuoteRequest["status"], string> = {
  awaiting_review: "bg-orange-100 text-orange-800",
  open: "bg-amber-100 text-amber-800",
  accepted: "bg-primary/10 text-primary",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
}

export default function QuoteRow({
  quote,
  commissionRate,
}: {
  quote: QuoteRequest;
  commissionRate: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [jobValue, setJobValue] = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const [offers, setOffers] = useState<ProviderOffer[]>([]);

  const answers = useMemo(() => getQuoteAnswers(quote), [quote]);

  useEffect(() => {
    fetch(`/api/admin/teklif/${quote.id}/offers`)
      .then((r) => r.json())
      .then((d) => setOffers(d.offers ?? []))
      .catch(() => setOffers([]));
  }, [quote.id, quote.status]);

  const updateStatus = async (
    status: QuoteRequest["status"],
    options?: { jobValue?: number; matchedProviderId?: string; matchedProviderName?: string }
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/teklif/${quote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          jobValue: options?.jobValue,
          matchedProviderId: options?.matchedProviderId,
          matchedProviderName: options?.matchedProviderName,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "İşlem başarısız");
      }
      setShowComplete(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Güncelleme başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{quote.serviceName}</h2>
          {quote.urgent && quote.urgentDeadline && (
            <span className="mt-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
              🚨 Çok acil · {formatUrgentRemaining(quote.urgentDeadline)}
            </span>
          )}
          {quote.priorityListing && (
            <span className="mt-1 inline-flex rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-secondary">
              ⚡ Öncelikli ilan
            </span>
          )}
          <p className="mt-1 text-sm text-muted-foreground">{quote.categoryName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Talep tarihi: {formatDateTime(quote.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[quote.status]}`}
        >
          {statusLabels[quote.status]}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailItem label="Müşteri Adı" value={quote.name} />
        <DetailItem label="Telefon" value={quotePhoneForAdmin(quote)} />
        <DetailItem label="E-posta" value={quote.email || "Belirtilmemiş"} />
        <DetailItem label="Şehir" value={quote.city} />
        <DetailItem label="İlçe" value={quote.district} />
        <DetailItem label="Talep No" value={quote.id} />
      </div>

      {offers.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">
            Usta teklifleri ({offers.length})
          </p>
          <ul className="mt-2 space-y-2 text-sm">
            {offers.map((offer) => (
              <li key={offer.id} className="flex flex-wrap justify-between gap-2">
                <span>
                  {offer.providerName} · {offer.price.toLocaleString("tr-TR")} ₺
                  {offer.status === "accepted" && " ✓ seçildi"}
                </span>
                <span className="text-muted-foreground">{offer.status}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Müşteri teklifleri{" "}
            <a href={`/tekliflerim/${quote.id}`} className="text-primary hover:underline">
              /tekliflerim/{quote.id}
            </a>{" "}
            üzerinden kabul eder; telefon o zaman açılır.
          </p>
        </div>
      )}

      {quote.matchedProviderName && (
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
          <strong>Eşleştirilen usta:</strong> {quote.matchedProviderName}
        </div>
      )}

      {answers.length > 0 && (
        <div className="mt-4 rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Hizmet Detayları
          </p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {answers.map((answer) => (
              <div key={`${quote.id}-${answer.label}`}>
                <dt className="text-xs text-muted-foreground">{answer.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">{answer.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          İş Açıklaması
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          {quote.notes?.trim() || "—"}
        </p>
      </div>

      {quote.status === "completed" && (
        <div className="mt-4 grid gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 sm:grid-cols-3">
          <DetailItem
            label="İş Tutarı"
            value={quote.jobValue != null ? `${quote.jobValue.toLocaleString("tr-TR")} ₺` : "—"}
          />
          <DetailItem
            label="Komisyon Oranı"
            value={`%${((quote.commissionRate ?? commissionRate) * 100).toFixed(0)}`}
          />
          <DetailItem
            label="Komisyon Tutarı"
            value={
              quote.commissionAmount != null
                ? `${quote.commissionAmount.toLocaleString("tr-TR")} ₺`
                : "—"
            }
          />
        </div>
      )}

      {quote.status === "completed" && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <InvoiceButton quoteId={quote.id} invoiceId={quote.invoiceId} />
        </div>
      )}

      <div className="mt-5 space-y-3 border-t border-border pt-5">
        {quote.status === "awaiting_review" && (
          <>
            <p className="text-sm text-muted-foreground">
              Talep henüz yayında değil. İnceleyip uygunsa yayına alın; geçersizse reddedin.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => updateStatus("open")}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                Yayına Al
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => updateStatus("cancelled")}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                Reddet
              </button>
            </div>
          </>
        )}

        {quote.status === "open" && (
          <>
            <p className="text-sm text-muted-foreground">
              Talep yayında. Ustalar teklif verir; müşteri{" "}
              <strong>/tekliflerim/{quote.id}</strong> sayfasından usta seçer.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => updateStatus("cancelled")}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-60"
            >
              İptal Et
            </button>
          </>
        )}

        {quote.status === "accepted" && (
          <>
            {!showComplete ? (
              <button
                type="button"
                onClick={() => setShowComplete(true)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                İşi Tamamla
              </button>
            ) : (
              <div className="max-w-sm space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Tamamlanan iş tutarı (₺)
                </label>
                <input
                  type="number"
                  placeholder="Örn: 5000"
                  value={jobValue}
                  onChange={(e) => setJobValue(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Komisyon (%{(commissionRate * 100).toFixed(0)}):{" "}
                  {jobValue
                    ? `${Math.round(parseFloat(jobValue) * commissionRate).toLocaleString("tr-TR")} ₺`
                    : "—"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={loading || !jobValue}
                    onClick={() =>
                      updateStatus("completed", { jobValue: parseFloat(jobValue) })
                    }
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Onayla & Kazancı Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowComplete(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}
