"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/billing";
import type { CreditLedgerEntry, CreditSettlementSummary, ProviderPayoutRequest } from "@/lib/types";

type PayoutRow = ProviderPayoutRequest & { providerName: string; providerPhone: string };

type Props = {
  initialSummary: CreditSettlementSummary;
  initialPayouts: PayoutRow[];
  initialLedger: CreditLedgerEntry[];
};

const TYPE_LABELS: Record<string, string> = {
  customer_purchase: "Müşteri kontör alımı",
  customer_payment: "Müşteri → usta ödeme",
  provider_offer_spend: "Teklif kontörü",
  provider_offer_debt: "Borç kredisi",
  provider_purchase: "Usta kontör alımı",
  provider_payout_request: "Nakit talep",
  provider_payout_paid: "Nakit ödeme",
  provider_payout_fee: "Kesinti (%3)",
  debt_settlement: "Borç kapatma",
  admin_adjustment: "Düzeltme",
};

export default function AdminCreditLedger({
  initialSummary,
  initialPayouts,
  initialLedger,
}: Props) {
  const [summary, setSummary] = useState(initialSummary);
  const [payouts, setPayouts] = useState(initialPayouts);
  const [ledger, setLedger] = useState(initialLedger);
  const [loading, setLoading] = useState("");

  const act = async (action: "approve" | "pay" | "reject", payoutId: string) => {
    setLoading(payoutId);
    try {
      const res = await fetch("/api/admin/muhasebe/kontor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payoutId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const refresh = await fetch("/api/admin/muhasebe/kontor");
      const fresh = await refresh.json();
      setSummary(fresh.summary);
      setPayouts(fresh.payouts);
      setLedger(fresh.ledger);
    } catch (err) {
      alert(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-bold text-foreground">Kontör özeti — {summary.periodLabel}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Müşteri alımları", value: formatMoney(summary.customerPurchasesTl) },
            { label: "Usta ödemeleri (kontör)", value: `${summary.customerPaymentsCredits} kontör` },
            { label: "Teklif harcaması", value: `${summary.providerOfferSpend} kontör` },
            { label: "Nakit ödemeler (net)", value: formatMoney(summary.payoutNetTl) },
            { label: "Platform kesintisi", value: formatMoney(summary.payoutFeesTl) },
            { label: "Defter kaydı", value: String(summary.entryCount) },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-lg font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">Bekleyen usta ödeme talepleri</h2>
        {payouts.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Bekleyen talep yok.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {payouts.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <p className="font-medium">{p.providerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.providerPhone} · {p.creditsRequested} kontör · Net {formatMoney(p.netAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground">IBAN: {p.iban}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.status === "pending" && (
                    <button
                      type="button"
                      disabled={loading === p.id}
                      onClick={() => act("approve", p.id)}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
                    >
                      Onayla
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={loading === p.id}
                    onClick={() => act("pay", p.id)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Ödendi işaretle
                  </button>
                  <button
                    type="button"
                    disabled={loading === p.id}
                    onClick={() => act("reject", p.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600"
                  >
                    Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">Kontör defteri (son 50)</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Tür</th>
                <th className="px-4 py-3">Kontör</th>
                <th className="px-4 py-3">TL</th>
                <th className="px-4 py-3">Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(e.createdAt).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-4 py-3">{TYPE_LABELS[e.type] ?? e.type}</td>
                  <td className="px-4 py-3 font-mono">
                    {e.creditsDelta > 0 ? "+" : ""}
                    {e.creditsDelta}
                  </td>
                  <td className="px-4 py-3">{e.tlAmount ? formatMoney(e.tlAmount) : "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
