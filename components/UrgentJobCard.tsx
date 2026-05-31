import Link from "next/link";
import type { QuoteRequest } from "@/lib/types";
import {
  formatUrgentDeadline,
  formatUrgentRemaining,
  URGENT_DEADLINE_DAYS,
} from "@/lib/urgent";

export default function UrgentJobCard({ quote }: { quote: QuoteRequest }) {
  const remaining = quote.urgentDeadline
    ? formatUrgentRemaining(quote.urgentDeadline)
    : `${URGENT_DEADLINE_DAYS} gün içinde`;

  return (
    <article className="rounded-xl border border-red-200 bg-card p-5 shadow-sm transition hover:border-red-300 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-red-700">
            🚨 Çok Acil
          </div>
          <h2 className="mt-2 text-lg font-bold text-foreground">{quote.serviceName}</h2>
          <p className="text-sm text-muted-foreground">{quote.categoryName}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-red-600">{remaining}</div>
          {quote.urgentDeadline && (
            <div className="mt-0.5 text-xs text-muted-foreground">
              Son: {formatUrgentDeadline(quote.urgentDeadline)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>
          📍 {quote.city}
          {quote.district ? `, ${quote.district}` : ""}
        </span>
        <span>
          Durum:{" "}
          <strong className="text-foreground">
            {quote.status === "accepted" ? "Usta seçildi" : "Usta aranıyor"}
          </strong>
        </span>
      </div>

      {quote.notes && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{quote.notes}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/usta/giris"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Usta olarak teklif ver
        </Link>
        <Link
          href={`/teklif-al/${quote.serviceSlug}?acil=1`}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          Benzer ilan aç
        </Link>
      </div>
    </article>
  );
}
