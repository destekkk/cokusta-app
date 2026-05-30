import { getAdminStats, getAllQuoteRequests, getApprovedProviders } from "@/lib/db";
import { isUrgentActive } from "@/lib/urgent";
import QuoteRow from "@/components/admin/QuoteRow";

export default async function AdminQuotesPage() {
  const [allQuotes, stats, approvedProviders] = await Promise.all([
    getAllQuoteRequests(),
    getAdminStats(),
    getApprovedProviders(),
  ]);

  const quotes = [...allQuotes].sort((a, b) => {
    const aUrgent = isUrgentActive(a) ? 1 : 0;
    const bUrgent = isUrgentActive(b) ? 1 : 0;
    if (bUrgent !== aUrgent) return bUrgent - aUrgent;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Teklif Talepleri</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {quotes.length} talep · {stats.pendingQuotes} bekliyor
      </p>

      <div className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        Her talepte müşteri bilgileri, konum, hizmet detayları ve notları görüntülenir.
        Uygun usta varsa <strong>Ustaya Eşleştir</strong>, geçersiz taleplerde <strong>İptal Et</strong> kullanın.
      </div>

      {quotes.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          Henüz teklif talebi yok.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {quotes.map((quote) => (
            <QuoteRow
              key={quote.id}
              quote={quote}
              commissionRate={stats.commissionRate}
              approvedProviders={approvedProviders}
            />
          ))}
        </div>
      )}
    </div>
  );
}
