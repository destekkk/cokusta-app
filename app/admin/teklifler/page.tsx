import {
  getAdminStats,
  getAllQuoteRequests,
  getApprovedProviders,
  getQuoteOfferCounts,
} from "@/lib/db";
import { isUrgentActive } from "@/lib/urgent";
import QuotesListTable from "@/components/admin/QuotesListTable";
import type { QuoteRequest } from "@/lib/types";

export default async function AdminQuotesPage() {
  const [allQuotes, stats, approvedProviders, offerCounts] = await Promise.all([
    getAllQuoteRequests(),
    getAdminStats(),
    getApprovedProviders(),
    getQuoteOfferCounts(),
  ]);

  const quotes = [...allQuotes].sort((a, b) => {
    const rank = (status: QuoteRequest["status"]) => {
      if (status === "awaiting_review") return 0;
      if (status === "open") return 1;
      if (status === "accepted") return 2;
      return 3;
    };
    const rankDiff = rank(a.status) - rank(b.status);
    if (rankDiff !== 0) return rankDiff;
    const aUrgent = isUrgentActive(a) ? 1 : 0;
    const bUrgent = isUrgentActive(b) ? 1 : 0;
    if (bUrgent !== aUrgent) return bUrgent - aUrgent;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Teklif Talepleri</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {quotes.length} talep · {stats.awaitingReviewQuotes} onay bekliyor ·{" "}
        {stats.pendingQuotes} yayında
      </p>

      <div className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        Talepleri listeden seçip toplu <strong>Onayla</strong>, <strong>Reddet</strong> veya{" "}
        <strong>Usta ile Eşleştir</strong> yapabilirsiniz.{" "}
        <strong>Otomatik Eşleştir</strong> usta teklifi varsa en düşük fiyatlıyı kabul eder;
        yoksa şehir ve kategori uyumlu ustayı atar. Demo teklifler için{" "}
        <strong>Demo Teklifleri Onayla</strong> butonunu kullanın.
      </div>

      <div className="mt-6">
        {quotes.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            Henüz teklif talebi yok.
          </div>
        ) : (
          <QuotesListTable
            quotes={quotes}
            offerCounts={offerCounts}
            approvedProviders={approvedProviders}
            commissionRate={stats.commissionRate}
          />
        )}
      </div>
    </div>
  );
}
