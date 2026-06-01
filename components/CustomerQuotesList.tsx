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

function statusClass(status: string) {
  if (status === "open") return "bg-blue-100 text-blue-800";
  if (status === "accepted") return "bg-emerald-100 text-emerald-800";
  if (status === "awaiting_review") return "bg-amber-100 text-amber-800";
  if (status === "cancelled") return "bg-red-100 text-red-800";
  return "bg-muted text-muted-foreground";
}

export default function CustomerQuotesList() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/musteri/talepler")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/musteri/giris");
          return null;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Yüklenemedi");
        setQuotes(data.quotes ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Yüklenemedi"))
      .finally(() => setLoading(false));
  }, [router]);

  const logout = async () => {
    await fetch("/api/musteri/cikis", { method: "POST" });
    router.push("/musteri/giris");
    router.refresh();
  };

  if (loading) return <p className="text-muted-foreground">Yükleniyor…</p>;
  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{quotes.length} talep (onaylı + onaysız)</p>
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
          <Link href="/hizmetler" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
            Teklif Al →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Hizmet</th>
                <th className="px-4 py-3 font-semibold">Konum</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold">Teklifler</th>
                <th className="px-4 py-3 font-semibold">Tarih</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-t border-border hover:bg-accent/20">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {quote.serviceName}
                    {quote.urgent && (
                      <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                        Acil
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {quote.city}
                    {quote.district ? `, ${quote.district}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(quote.status)}`}>
                      {quote.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {quote.status === "accepted" && quote.matchedProviderName ? (
                      <span className="text-emerald-700">{quote.matchedProviderName}</span>
                    ) : quote.status === "open" ? (
                      <span className="text-primary">
                        {quote.offerCount > 0 ? `${quote.offerCount} teklif` : "Bekleniyor"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(quote.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/tekliflerim/${quote.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      Detay →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
