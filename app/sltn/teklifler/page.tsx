import {
  getAllQuoteRequests,
  getApprovedProviders,
  getQuoteOfferCounts,
} from "@/lib/db";
import { getCommissionRate } from "@/lib/admin-auth";
import { isUrgentActive } from "@/lib/urgent";
import AdminRejectedQuotesSection from "@/components/admin/AdminRejectedQuotesSection";
import QuotesListTable from "@/components/admin/QuotesListTable";
import type { QuoteRequest } from "@/lib/types";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

const validStatuses = new Set([
  "all",
  "awaiting_review",
  "open",
  "accepted",
  "completed",
  "cancelled",
]);

export default async function AdminQuotesPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialStatus =
    params.status && validStatuses.has(params.status)
      ? (params.status as QuoteRequest["status"] | "all")
      : "awaiting_review";

  const [allQuotes, approvedProviders, offerCounts] = await Promise.all([
    getAllQuoteRequests(),
    getApprovedProviders(),
    getQuoteOfferCounts(),
  ]);
  const commissionRate = getCommissionRate();
  const awaitingReviewQuotes = allQuotes.filter((q) => q.status === "awaiting_review").length;
  const pendingQuotes = allQuotes.filter((q) => q.status === "open").length;

  const activeQuotes = allQuotes.filter((q) => q.status !== "cancelled");
  const rejectedQuotes = allQuotes.filter((q) => q.status === "cancelled");

  const quotes = [...activeQuotes].sort((a, b) => {
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
        {awaitingReviewQuotes} onay bekliyor · {pendingQuotes} yayında
        {rejectedQuotes.length > 0 ? ` · ${rejectedQuotes.length} reddedilmiş (altta)` : ""}
      </p>

      <div className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        Üstte yalnızca aktif talepler. <strong>Reddet</strong> edilenler onay bekleyen listeden çıkar ve
        sayfanın altındaki reddedilmiş listesine düşer; oradan kalıcı silebilirsiniz.
      </div>

      <div className="mt-6">
        <QuotesListTable
          quotes={quotes}
          offerCounts={offerCounts}
          approvedProviders={approvedProviders}
          commissionRate={commissionRate}
          initialStatus={initialStatus === "cancelled" ? "awaiting_review" : initialStatus}
        />
      </div>

      <AdminRejectedQuotesSection quotes={rejectedQuotes} />
    </div>
  );
}
