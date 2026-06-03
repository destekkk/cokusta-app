"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import PanelStatCard from "@/components/panel/PanelStatCard";
import SheetTabs from "@/components/panel/SheetTabs";
import { cities, getDistricts } from "@/lib/data/cities";
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
  reviewStatus?: "none" | "pending" | "approved";
};

type TabCounts = {
  waiting: number;
  offers: number;
  negotiating: number;
  finished: number;
  total: number;
};

const PAGE_SIZE = 25;

function getCustomerPageNumbers(current: number, total: number): number[] {
  if (total <= 12) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>([1, total, current, current - 1, current + 1, current - 2, current + 2]);
  return [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

function statusClass(status: string) {
  if (status === "open") return "bg-primary/10 text-primary";
  if (status === "accepted") return "bg-emerald-100 text-emerald-800";
  if (status === "awaiting_review") return "bg-amber-100 text-amber-800";
  if (status === "cancelled") return "bg-red-100 text-red-800";
  return "bg-muted text-muted-foreground";
}

function quoteActionLabel(quote: QuoteItem, tab: CustomerQuoteTab): string {
  if (tab === "finished" && quote.status === "completed") {
    if (quote.reviewStatus === "none") return "Puanla & yorum";
    if (quote.reviewStatus === "pending") return "Yorum inceleniyor";
    return "Değerlendirme";
  }
  if (tab === "offers" || tab === "negotiating") {
    return quote.offerCount > 0 ? "Teklifleri gör" : "Detay";
  }
  return "Detay";
}

function QuoteRowActions({ quote, tab }: { quote: QuoteItem; tab: CustomerQuoteTab }) {
  const label = quoteActionLabel(quote, tab);
  const highlight =
    tab === "finished" && quote.status === "completed" && quote.reviewStatus === "none";

  return (
    <Link
      href={`/tekliflerim/${quote.id}`}
      className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${
        highlight
          ? "bg-primary text-white hover:bg-primary-dark"
          : "bg-primary/10 text-primary hover:bg-primary/15"
      }`}
    >
      {label}
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
    tabParam === "waiting" ||
    tabParam === "finished" ||
    tabParam === "negotiating"
      ? tabParam
      : "offers";
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [total, setTotal] = useState(0);
  const [tabCounts, setTabCounts] = useState<TabCounts>({
    waiting: 0,
    offers: 0,
    negotiating: 0,
    finished: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationReady, setLocationReady] = useState(false);

  const searchQuery = searchParams.get("q")?.trim() ?? "";
  const filterCity = searchParams.get("city")?.trim() ?? "";
  const filterDistrict = searchParams.get("district")?.trim() ?? "";
  const pageParam = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(pageParam, pageCount);

  const replaceParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.replace(`/musteri/teklifler?${params.toString()}`);
  };

  const setTab = (next: CustomerQuoteTab) => {
    replaceParams((params) => {
      params.set("tab", next);
      params.delete("page");
    });
  };

  const setPage = (next: number) => {
    replaceParams((params) => {
      if (next <= 1) params.delete("page");
      else params.set("page", String(next));
    });
  };

  const applySearch = () => {
    replaceParams((params) => {
      const q = searchInput.trim();
      if (q) params.set("q", q);
      else params.delete("q");
      params.delete("page");
    });
  };

  const setLocationFilter = (city: string, district: string) => {
    replaceParams((params) => {
      if (city && city !== "__all__") params.set("city", city);
      else params.delete("city");
      if (district && city !== "__all__") params.set("district", district);
      else params.delete("district");
      params.delete("page");
    });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (searchParams.get("city")) {
        setLocationReady(true);
        return;
      }
      try {
        const res = await fetch("/api/musteri/profil");
        if (cancelled) return;
        if (res.status === 401) {
          router.replace("/musteri/giris");
          return;
        }
        const data = await res.json();
        const profileCity = data.profile?.city?.trim() ?? "";
        const profileDistrict = data.profile?.district?.trim() ?? "";
        const params = new URLSearchParams(searchParams.toString());
        if (profileCity) {
          params.set("city", profileCity);
          if (profileDistrict) params.set("district", profileDistrict);
          router.replace(`/musteri/teklifler?${params.toString()}`);
        } else {
          setLocationReady(true);
        }
      } catch {
        if (!cancelled) setLocationReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (searchParams.get("city") || locationReady) {
      setLocationReady(true);
    }
  }, [searchParams, locationReady]);

  const loadQuotes = useCallback(async () => {
    const offset = (safePage - 1) * PAGE_SIZE;
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(offset),
      tab,
    });
    if (searchQuery) params.set("q", searchQuery);
    if (filterCity) params.set("city", filterCity);
    if (filterDistrict) params.set("district", filterDistrict);

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
    setQuotes(data.quotes ?? []);
    return data;
  }, [router, searchQuery, tab, filterCity, filterDistrict, safePage]);

  useEffect(() => {
    if (!locationReady) return;
    setLoading(true);
    loadQuotes()
      .catch((err) => setError(err instanceof Error ? err.message : "Yüklenemedi"))
      .finally(() => setLoading(false));
  }, [loadQuotes, locationReady]);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!locationReady || total === 0) return;
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (pageParam > maxPage) setPage(maxPage);
  }, [locationReady, total, pageParam]);

  const summaryHint = useMemo(() => {
    if (tab === "offers") return "Yeni gelen usta teklifleri (henüz yazışma yok)";
    if (tab === "negotiating") return "Usta ile karşılıklı teklif / pazarlık süren talepler";
    if (tab === "finished") return "Anlaşılmış, tamamlanmış veya iptal edilmiş talepler";
    return "Henüz teklif gelmemiş veya onay bekleyen talepler";
  }, [tab]);

  if (!locationReady || (loading && quotes.length === 0)) {
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
      <Link
        href="/hizmetler"
        className="inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
      >
        + Yeni Talep
      </Link>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <PanelStatCard label="Toplam talep" value={tabCounts.total.toLocaleString("tr-TR")} />
        <PanelStatCard
          label="Gelen teklif"
          value={tabCounts.offers.toLocaleString("tr-TR")}
          tone="primary"
          active={tab === "offers"}
          onClick={() => setTab("offers")}
        />
        <PanelStatCard
          label="Pazarlık"
          value={tabCounts.negotiating.toLocaleString("tr-TR")}
          tone="primary"
          active={tab === "negotiating"}
          onClick={() => setTab("negotiating")}
        />
        <PanelStatCard
          label="Teklif bekleyen"
          value={tabCounts.waiting.toLocaleString("tr-TR")}
          tone="amber"
          active={tab === "waiting"}
          onClick={() => setTab("waiting")}
        />
        <PanelStatCard
          label="Bitmiş işler"
          value={tabCounts.finished.toLocaleString("tr-TR")}
          tone="emerald"
          active={tab === "finished"}
          onClick={() => setTab("finished")}
        />
      </div>

      <form
        className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-3 sm:gap-3 sm:p-4"
        onSubmit={(e) => {
          e.preventDefault();
          applySearch();
        }}
      >
        <label className="flex w-[130px] shrink-0 flex-col gap-1 text-xs text-muted-foreground sm:w-[150px]">
          İl
          <select
            value={filterCity || "__all__"}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__all__") setLocationFilter("", "");
              else setLocationFilter(v, "");
            }}
            className="rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground"
          >
            <option value="__all__">Tüm iller</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        {filterCity ? (
          <label className="flex w-[130px] shrink-0 flex-col gap-1 text-xs text-muted-foreground sm:w-[150px]">
            İlçe
            <select
              value={filterDistrict}
              onChange={(e) => setLocationFilter(filterCity, e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground"
            >
              <option value="">Tüm ilçeler</option>
              {getDistricts(filterCity).map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-xs text-muted-foreground">
          Hizmet ara
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Hizmet adı ara…"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Ara
        </button>
      </form>

      <SheetTabs
        activeId={tab}
        onChange={(id) => setTab(id as CustomerQuoteTab)}
        tabs={[
          { id: "offers", label: "Gelen Teklifler", count: tabCounts.offers },
          { id: "negotiating", label: "Pazarlık", count: tabCounts.negotiating },
          { id: "waiting", label: "Teklif Bekleyen", count: tabCounts.waiting },
          { id: "finished", label: "Bitmiş İşler", count: tabCounts.finished },
        ]}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          {summaryHint}
          {filterCity && (
            <span className="ml-1">
              · {filterCity}
              {filterDistrict ? `, ${filterDistrict}` : ""}
            </span>
          )}
          {total > 0 && (
            <span className="ml-1">
              · {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, total)} /{" "}
              {total.toLocaleString("tr-TR")} (sayfa {safePage}/{pageCount})
            </span>
          )}
        </p>

        {quotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? "Aramanızla eşleşen talep bulunamadı."
                : tab === "offers"
                  ? "Henüz yalnızca yeni teklif aldığınız talep yok."
                  : tab === "negotiating"
                    ? "Aktif pazarlık / yazışma süren talep yok."
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

        {pageCount > 1 && (
          <nav
            className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-border pt-4"
            aria-label="Talep listesi sayfaları"
          >
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              ← Önceki
            </button>
            {getCustomerPageNumbers(safePage, pageCount).map((pageNum, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev !== undefined && pageNum - prev > 1;
              return (
                <span key={pageNum} className="flex items-center gap-2">
                  {showEllipsis && <span className="text-muted-foreground">…</span>}
                  <button
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                      pageNum === safePage
                        ? "border-primary bg-primary text-white"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    {pageNum}. sayfa
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              disabled={safePage >= pageCount}
              onClick={() => setPage(safePage + 1)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Sonraki →
            </button>
          </nav>
        )}
      </SheetTabs>
    </div>
  );
}
