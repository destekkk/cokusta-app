"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LAUNCH_CAMPAIGN } from "@/lib/campaigns";
import { MAX_CREDIT_DEBT, canSubmitOffer, remainingDebtCapacity } from "@/lib/credit-debt";
import UstaReferralCampaign from "@/components/UstaReferralCampaign";
import type { ProviderOffer } from "@/lib/types";
import type { PublicQuoteRequest } from "@/lib/quote-privacy";

type OpenQuote = PublicQuoteRequest & { myOffer?: ProviderOffer };

const KONTOR_URL = "/usta/kontor?reason=no-credit";

export default function UstaOpenQuotesPanel() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<OpenQuote[]>([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditDebt, setCreditDebt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [debtNotice, setDebtNotice] = useState<string | null>(null);

  const canOffer = canSubmitOffer(creditBalance, creditDebt);
  const debtRemaining = remainingDebtCapacity(creditDebt);
  const atDebtLimit = creditBalance < 1 && creditDebt >= MAX_CREDIT_DEBT;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/usta/talepler");
      if (res.status === 401) {
        router.push("/usta/giris");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Yüklenemedi");
      setQuotes(data.quotes ?? []);
      setCreditBalance(data.creditBalance ?? 0);
      setCreditDebt(data.creditDebt ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const goBuyCredits = () => router.push(KONTOR_URL);

  const startOffer = (quoteId: string) => {
    if (!canOffer) {
      goBuyCredits();
      return;
    }
    setActiveId(quoteId);
  };

  const submitOffer = async (quoteRequestId: string) => {
    if (!canOffer) {
      goBuyCredits();
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/usta/teklif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteRequestId,
          price: Number(price),
          message,
        }),
      });
      const data = await res.json();
      if (res.status === 402 || data.code === "INSUFFICIENT_CREDITS") {
        goBuyCredits();
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Gönderilemedi");
      setActiveId(null);
      setPrice("");
      setMessage("");
      if (data.usedDebt) {
        setDebtNotice("1 kontörlük borç kredisi kullanıldı.");
        setCreditDebt(data.creditDebt ?? creditDebt + 1);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gönderilemedi");
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    await fetch("/api/usta/cikis", { method: "POST" });
    router.push("/usta/giris");
  };

  if (loading) {
    return <p className="text-muted-foreground">Talepler yükleniyor…</p>;
  }

  return (
    <div className="space-y-6">
      <UstaReferralCampaign
        onCreditsUpdated={(balance) => setCreditBalance(balance)}
      />

      {debtNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <p className="text-lg font-semibold text-foreground">Borç kredisi kullanıldı</p>
            <p className="mt-2 text-sm text-muted-foreground">{debtNotice}</p>
            <p className="mt-2 text-sm text-amber-700">
              Toplam borç krediniz: {creditDebt}/{MAX_CREDIT_DEBT} kontör. Ödeme yaparken borç
              kredisi de tahsil edilir.
            </p>
            <button
              type="button"
              onClick={() => setDebtNotice(null)}
              className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm text-muted-foreground">Kalan teklif kontörü</p>
          <p className="text-2xl font-bold text-primary">{creditBalance}</p>
          {creditDebt > 0 && (
            <p className="mt-1 text-sm font-medium text-amber-700">
              Borç kredisi: {creditDebt}/{MAX_CREDIT_DEBT} kontör
            </p>
          )}
          {creditBalance === 0 && debtRemaining > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Kontörünüz bitti; {debtRemaining} kontöre kadar borç kredisi kullanarak teklif
              verebilirsiniz.
            </p>
          )}
          {creditBalance <= LAUNCH_CAMPAIGN.provider.freeCredits && creditBalance > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Hediye kontörlerinizi kullanıyorsunuz.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/usta/kontor"
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              atDebtLimit ? "bg-amber-600 hover:bg-amber-700" : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {atDebtLimit ? "Kontör Satın Al" : "Paket Yükle"}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Çıkış
          </button>
        </div>
      </div>

      {atDebtLimit && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Kontör ve borç kredisi limitiniz doldu ({MAX_CREDIT_DEBT} kontör). Teklif vermek için
          paket satın alın; ödeme sırasında borç krediniz de tahsil edilecektir.
          <button
            type="button"
            onClick={goBuyCredits}
            className="mt-3 block font-semibold text-amber-900 underline"
          >
            Kontör paketlerine git →
          </button>
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {quotes.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          Şu an bölgenizde açık talep yok.
        </p>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <article key={quote.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">{quote.serviceName}</h2>
                  <p className="text-sm text-muted-foreground">
                    {quote.city}
                    {quote.district ? `, ${quote.district}` : ""} · {quote.offerCount ?? 0} teklif
                  </p>
                </div>
                {quote.urgent && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                    Çok acil
                  </span>
                )}
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{quote.notes}</p>

              {quote.myOffer ? (
                <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                  Teklifiniz gönderildi: {quote.myOffer.price.toLocaleString("tr-TR")} ₺
                </p>
              ) : activeId === quote.id ? (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  {creditBalance < 1 && debtRemaining > 0 && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      Kontörünüz yok; bu teklif 1 kontörlük borç kredisi olarak kaydedilecek.
                    </p>
                  )}
                  <input
                    type="number"
                    placeholder="Teklif tutarı (₺)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder="Mesajınız (min. 5 karakter)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => submitOffer(quote.id)}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {creditBalance < 1 ? "Gönder (borç kredisi ile)" : "Gönder (1 kontör)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveId(null)}
                      className="rounded-lg border border-border px-4 py-2 text-sm"
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startOffer(quote.id)}
                  className={`mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                    !canOffer ? "bg-amber-600 hover:bg-amber-700" : "bg-primary hover:bg-primary-dark"
                  }`}
                >
                  {!canOffer
                    ? "Kontör Satın Al →"
                    : creditBalance < 1
                      ? "Teklif Ver (borç kredisi ile)"
                      : "Teklif Ver (1 kontör)"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
