"use client";

import { useState } from "react";
import { computePayoutAmounts, MIN_PAYOUT_CREDITS, PAYOUT_FEE_RATE } from "@/lib/credit-economy";
import { formatCreditPrice } from "@/lib/credit-packages";
import type { ProviderPayoutRequest } from "@/lib/types";

type Props = {
  initialBalance: number;
  initialIban?: string;
  initialAccountHolder?: string;
  initialRequests: ProviderPayoutRequest[];
};

export default function UstaPayoutPanel({
  initialBalance,
  initialIban,
  initialAccountHolder,
  initialRequests,
}: Props) {
  const [balance, setBalance] = useState(initialBalance);
  const [credits, setCredits] = useState("");
  const [iban, setIban] = useState(initialIban ?? "");
  const [accountHolder, setAccountHolder] = useState(initialAccountHolder ?? "");
  const [requests, setRequests] = useState(initialRequests);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const creditsNum = Number(credits) || 0;
  const preview = creditsNum >= MIN_PAYOUT_CREDITS ? computePayoutAmounts(creditsNum) : null;

  const refresh = async () => {
    const res = await fetch("/api/usta/odeme-talep");
    const data = await res.json();
    if (res.ok) {
      setBalance(data.creditBalance ?? balance);
      setRequests(data.requests ?? requests);
      if (data.iban) setIban(data.iban);
      if (data.accountHolder) setAccountHolder(data.accountHolder);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/usta/odeme-talep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits: creditsNum,
          iban,
          accountHolder,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Talep oluşturulamadı");
      setSuccess("Ödeme talebiniz alındı. Ay sonunda hesabınıza aktarılacaktır.");
      setCredits("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Talep oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Kullanılabilir kontör</p>
        <p className="text-3xl font-bold text-primary">{balance}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Müşteriden kazandığınız veya satın aldığınız kontörler teklif vermek için kullanılabilir
          veya aylık nakit talep edebilirsiniz.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Nasıl çalışır?</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Kontörünüzü teklif vermek için harcayabilirsiniz (1 teklif = 1 kontör).</li>
          <li>Aylık nakit talep ederseniz %{Math.round(PAYOUT_FEE_RATE * 100)} platform kesintisi uygulanır.</li>
          <li>Ödemeler ay sonunda banka hesabınıza aktarılır.</li>
        </ul>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Nakit ödeme talebi</h2>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Kontör miktarı *</label>
          <input
            type="number"
            min={MIN_PAYOUT_CREDITS}
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            placeholder={`Min. ${MIN_PAYOUT_CREDITS}`}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm"
          />
        </div>
        {preview && (
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <p>Brüt: {formatCreditPrice(preview.grossAmount)}</p>
            <p>Kesinti (%{Math.round(PAYOUT_FEE_RATE * 100)}): -{formatCreditPrice(preview.feeAmount)}</p>
            <p className="font-semibold text-foreground">Net ödeme: {formatCreditPrice(preview.netAmount)}</p>
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium">IBAN *</label>
          <input
            type="text"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder="TR..."
            className="w-full rounded-xl border border-border px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Hesap sahibi</label>
          <input
            type="text"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Gönderiliyor…" : "Aylık ödeme talebi oluştur"}
        </button>
      </form>

      {requests.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Geçmiş talepler</h2>
          <div className="mt-4 space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium">{r.period}</span>
                  <span className="capitalize text-muted-foreground">{r.status}</span>
                </div>
                <p className="mt-1">
                  {r.creditsRequested} kontör → Net {formatCreditPrice(r.netAmount)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
