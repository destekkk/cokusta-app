"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import PanelStatCard from "@/components/panel/PanelStatCard";
import SheetTabs from "@/components/panel/SheetTabs";
import type { CustomerQuoteTab } from "@/lib/customer-quotes-filter";

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

type TabCounts = { waiting: number; offers: number; finished: number; total: number };

function statusClass(status: string) {
  if (status === "open") return "bg-primary/10 text-primary";
  if (status === "accepted") return "bg-emerald-100 text-emerald-800";
  if (status === "awaiting_review") return "bg-amber-100 text-amber-800";
  if (status === "cancelled") return "bg-red-100 text-red-800";
  return "bg-muted text-muted-foreground";
}

function QuoteRowActions({ quote, tab }: { quote: QuoteItem; tab: CustomerQuoteTab }) {
  return (
    <Link
      href={`/tekliflerim/${quote.id}`}
      className="inline-flex rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15"
    >
      {tab === "offers" && quote.offerCount > 0 ? "Teklifleri gör" : "Detay"}
    </Link>
  );
}

function QuoteCard({ quote, tab }: { quote: QuoteItem; tab: CustomerQuoteTab }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">
            {quote.serviceName}
            {quote.urgent && (
              <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                Acil
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {quote.city}
            {quote.district ? `, ${quote.district}` : ""}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(quote.status)}`}>
          {quote.statusLabel}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground">
          {new Date(quote.createdAt).toLocaleDateString("tr-TR")}
          {" · "}
          {quote.status === "accepted" && quote.matchedProviderName ? (
            <span className="text-emerald-700">{quote.matchedProviderName}</span>
          ) : quote.offerCount > 0 ? (
            <span className="font-medium text-primary">{quote.offerCount} teklif</span>
          ) : (
            "Teklif bekleniyor"
          )}
        </span>
        <QuoteRowActions quote={quote} tab={tab} />
      </div>
    </div>
  );
}

export default function CustomerQuotesList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: CustomerQuoteTab =
    tabParam === "waiting" || tabParam === "finished" ? tabParam : "offers";
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [total, setTotal] = useState(0);
  const [tabCounts, setTabCounts] = useState<TabCounts>({ waiting: 0, offers: 0, finished: 0, total: 0 });
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const pageSize = 50;

  const searchQuery = searchParams.get("q")?.trim() ?? "";

  const setTab = (next: CustomerQuoteTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`/musteri/teklifler?${params.toString()}`);
  };

  const applySearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    const q = searchInput.trim();
    if (q) params.set("q", q);
    else params.delete("q");
    router.replace(`/musteri/teklifler?${params.toString()}`);
  };

  const loadQuotes = useCallback(
    async (nextOffset: number, append: boolean) => {
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(nextOffset),
        tab,
      });
      if (searchQuery) params.set("q", searchQuery);

      const res = await fetch(`/api/musteri/talepler?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (res.status === 401) {
        router.replace("/musteri/giris");
        return null;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Yüklenemedi");
      setTotal(data.total ?? 0);
      if (data.tabCounts) setTabCounts(data.tabCounts);
      setOffset(nextOffset + (data.quotes?.length ?? 0));
      setQuotes((prev) => (append ? [...prev, ...(data.quotes ?? [])] : (data.quotes ?? [])));
      return data;
    },
    [router, searchQuery, tab]
  );

  useEffect(() => {
    setLoading(true);
    loadQuotes(0, false)
      .catch((err) => setError(err instanceof Error ? err.message : "Yüklenemedi"))
      .finally(() => setLoading(false));
  }, [loadQuotes]);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const hasMore = quotes.length < total;

  const summaryHint = useMemo(() => {
    if (tab === "offers") return "Usta teklifi gelen, pazarlık süren talepler";
    if (tab === "finished") return "Anlaşılmış, tamamlanmış veya iptal edilmiş talepler";
    return "Henüz teklif gelmemiş veya onay bekleyen talepler";
  }, [tab]);

  if (loading && quotes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
        <p className="text-muted-foreground">Yükleniyor…</p>
      </div>
    );
  }

  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PanelStatCard label="Toplam talep" value={tabCounts.total.toLocaleString("tr-TR")} />
        <PanelStatCard
          label="Gelen teklif"
          value={tabCounts.offers.toLocaleString("tr-TR")}
          tone="primary"
        />
        <PanelStatCard
          label="Teklif bekleyen"
          value={tabCounts.waiting.toLocaleString("tr-TR")}
          tone="amber"
        />
        <PanelStatCard
          label="Bitmiş işler"
          value={tabCounts.finished.toLocaleString("tr-TR")}
          tone="emerald"
        />
      </div>

      <form
        className="flex w-full max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          applySearch();
        }}
      >
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Hizmet adı ara…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted/50"
        >
          Ara
        </button>
      </form>

      <SheetTabs
        activeId={tab}
        onChange={(id) => setTab(id as CustomerQuoteTab)}
        tabs={[
          { id: "offers", label: "Gelen Teklifler", count: tabCounts.offers },
          { id: "waiting", label: "Teklif Bekleyen", count: tabCounts.waiting },
          { id: "finished", label: "Bitmiş İşler", count: tabCounts.finished },
        ]}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          {summaryHint}
          {total > 0 && (
            <span className="ml-1">
              · {quotes.length.toLocaleString("tr-TR")}/{total.toLocaleString("tr-TR")} gösteriliyor
            </span>
          )}
        </p>

        {quotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? "Aramanızla eşleşen talep bulunamadı."
                : tab === "offers"
                  ? "Henüz usta teklifi almadığınız talep yok."
                  : tab === "finished"
                    ? "Bitmiş iş kaydınız yok."
                    : "Teklif bekleyen talebiniz yok."}
            </p>
            {!searchQuery && tab === "waiting" && (
              <Link
                href="/hizmetler"
                className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Yeni talep oluştur →
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {quotes.map((quote) => (
                <QuoteCard key={quote.id} quote={quote} tab={tab} />
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-border bg-background md:block">
              <table className="w-full text-sm">
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
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(quote.status)}`}
                        >
                          {quote.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {quote.status === "accepted" && quote.matchedProviderName ? (
                          <span className="text-emerald-700">{quote.matchedProviderName}</span>
                        ) : quote.offerCount > 0 ? (
                          <span className="font-medium text-primary">{quote.offerCount} teklif</span>
                        ) : (
                          <span className="text-muted-foreground">Bekleniyor</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(quote.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <QuoteRowActions quote={quote} tab={tab} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {hasMore && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={async () => {
                setLoadingMore(true);
                try {
                  await loadQuotes(offset, true);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Yüklenemedi");
                } finally {
                  setLoadingMore(false);
                }
              }}
              disabled={loadingMore}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-60"
            >
              {loadingMore ? "Yükleniyor…" : "Daha fazla yükle"}
            </button>
          </div>
        )}
      </SheetTabs>
    </div>
  );
}
