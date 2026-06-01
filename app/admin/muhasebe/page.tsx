import Link from "next/link";
import {
  getAllInvoices,
  getBillableItems,
  getBillingOverview,
} from "@/lib/db";
import { formatDateTime } from "@/lib/admin-labels";
import { formatMoney } from "@/lib/billing";
import BillingActions from "@/components/admin/BillingActions";
import InvoiceButton from "@/components/admin/InvoiceButton";
import AdminCreditLedger from "@/components/admin/AdminCreditLedger";
import {
  getCreditLedgerEntries,
  getCreditSettlementSummary,
  getPendingProviderPayouts,
} from "@/lib/db-credits";
import { isDatabaseEnabled } from "@/lib/db/config";

export default async function AdminBillingPage() {
  const [overview, billable, invoices, creditData] = await Promise.all([
    getBillingOverview(),
    getBillableItems(),
    getAllInvoices(),
    isDatabaseEnabled()
      ? Promise.all([
          getCreditSettlementSummary(),
          getPendingProviderPayouts(),
          getCreditLedgerEntries(50),
        ]).then(([summary, payouts, ledger]) => ({ summary, payouts, ledger }))
      : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Muhasebe & Faturalama</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Fatura kesme, kontör defteri, usta ödemeleri ve KDV beyannamesi
      </p>

      {creditData && (
        <div className="mt-8">
          <AdminCreditLedger
            initialSummary={creditData.summary}
            initialPayouts={creditData.payouts}
            initialLedger={creditData.ledger}
          />
        </div>
      )}

      <div className="mt-8">
        <BillingActions
          pendingCount={overview.pendingCount}
          currentPeriodLabel={overview.currentPeriodLabel}
          hasDeclaration={overview.hasDeclaration}
          latestDeclarationId={overview.latestDeclaration?.id}
        />
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Fatura Kesilecek Kayıtlar</h2>
        {billable.length === 0 ? (
          <div className="mt-4 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Bekleyen fatura yok. Tamamlanan işler ve platform hizmetleri burada listelenir.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {billable.map((item) => (
              <div
                key={item.key}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <div className="font-medium text-foreground">{item.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.recipientName} · {formatDateTime(item.date)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-primary">{formatMoney(item.amount)}</div>
                  <InvoiceButton
                    quoteId={item.type === "quote" ? item.referenceId : undefined}
                    providerId={item.providerId}
                    purchaseId={
                      item.type === "platform-purchase" ? item.referenceId : undefined
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Kesilen Faturalar</h2>
        {invoices.length === 0 ? (
          <div className="mt-4 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Henüz fatura kesilmedi.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Fatura No</th>
                  <th className="px-4 py-3">Alıcı</th>
                  <th className="px-4 py-3">Açıklama</th>
                  <th className="px-4 py-3">Toplam</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-4 font-mono text-xs">{invoice.invoiceNo}</td>
                    <td className="px-4 py-4">{invoice.recipientName}</td>
                    <td className="px-4 py-4 text-muted-foreground">{invoice.description}</td>
                    <td className="px-4 py-4 font-semibold">{formatMoney(invoice.total)}</td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDateTime(invoice.issuedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/fatura/${invoice.id}`}
                        target="_blank"
                        className="font-semibold text-primary hover:underline"
                      >
                        Görüntüle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
