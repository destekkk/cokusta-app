"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type QuoteItem = {
  id: string;
  serviceName: string;
  city: string;
  district?: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  offerCount: number;
  matchedProviderName?: string;
  urgent?: boolean;
};

export default function CustomerQuotesList() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch("/api/musteri/talepler");
    if (res.status === 401) {
      router.replace("/musteri/giris");
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Yüklenemedi");
    setQuotes(data.quotes ?? []);
  };

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof Error ? err.message : "Yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch("/api/musteri/cikis", { method: "POST" });
    router.push("/musteri/giris");
    router.refresh();
  };

  if (loading) {
    return <p className="text-muted-foreground">Yükleniyor…</p>;
  }

  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{quotes.length} talep</p>
        <button
          type="button"
          onClick={logout}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Çıkış Yap
        </button>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Henüz teklif talebiniz yok.</p>
          <Link
            href="/hizmetler"
            className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Teklif Al →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Link
              key={quote.id}
              href={`/tekliflerim/${quote.id}`}
              className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-foreground">{quote.serviceName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {quote.city}
                    {quote.district ? `, ${quote.district}` : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    quote.status === "open"
                      ? "bg-blue-100 text-blue-800"
                      : quote.status === "accepted"
                        ? "bg-emerald-100 text-emerald-800"
                        : quote.status === "awaiting_review"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {quote.statusLabel}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                {quote.status === "open" && (
                  <span className="font-medium text-primary">
                    {quote.offerCount > 0
                      ? `${quote.offerCount} usta teklifi`
                      : "Henüz teklif yok"}
                  </span>
                )}
                {quote.status === "accepted" && quote.matchedProviderName && (
                  <span className="text-emerald-700">Usta: {quote.matchedProviderName}</span>
                )}
                {quote.urgent && (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    Çok Acil
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(quote.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
