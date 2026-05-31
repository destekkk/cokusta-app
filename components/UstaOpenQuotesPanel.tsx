"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProviderOffer } from "@/lib/types";
import type { PublicQuoteRequest } from "@/lib/quote-privacy";

type OpenQuote = PublicQuoteRequest & { myOffer?: ProviderOffer };

export default function UstaOpenQuotesPanel() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<OpenQuote[]>([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitOffer = async (quoteRequestId: string) => {
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
      if (!res.ok) throw new Error(data.error ?? "Gönderilemedi");
      setActiveId(null);
      setPrice("");
      setMessage("");
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm text-muted-foreground">Kalan teklif kontörü</p>
          <p className="text-2xl font-bold text-primary">{creditBalance}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Çıkış
        </button>
      </div>

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
                      Gönder
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
                  onClick={() => setActiveId(quote.id)}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  Teklif Ver (1 kontör)
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
