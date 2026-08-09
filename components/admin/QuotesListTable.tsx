"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/admin-labels";
import { quotePhoneForAdmin } from "@/lib/quote-privacy";
import { isUrgentActive } from "@/lib/urgent";
import QuoteRow from "@/components/admin/QuoteRow";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import AdminProviderPicker from "@/components/admin/AdminProviderPicker";
import type { ProviderRegistration, QuoteRequest } from "@/lib/types";
import { useAdminList } from "@/lib/use-admin-list";

const statusLabels: Record<QuoteRequest["status"], string> = {
  awaiting_review: "Onay Bekliyor",
  open: "Yayında",
  accepted: "Usta Seçildi",
  completed: "Tamamlandı",
  cancelled: "Reddedildi",
};

const statusColors: Record<QuoteRequest["status"], string> = {
  awaiting_review: "bg-orange-100 text-orange-800",
  open: "bg-amber-100 text-amber-800",
  accepted: "bg-primary/10 text-primary",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

type Filter = "all" | QuoteRequest["status"];

type Props = {
  quotes: QuoteRequest[];
  offerCounts: Record<string, number>;
  approvedProviders: ProviderRegistration[];
  commissionRate: number;
  initialStatus?: Filter;
};

const PAGE_SIZE = 50;

function matchesSearch(quote: QuoteRequest, query: string): boolean {
  const q = query.trim().toLocaleLowerCase("tr-TR");
  if (!q) return true;
  const haystack = [
    quote.serviceName,
    quote.categoryName,
    quote.name,
    quote.phone,
    quote.city,
    quote.district ?? "",
    quote.email ?? "",
  ]
    .join(" ")
    .toLocaleLowerCase("tr-TR");
  return haystack.includes(q);
}

export default function QuotesListTable({
  quotes,
  offerCounts,
  approvedProviders,
  commissionRate,
  initialStatus = "awaiting_review",
}: Props) {
  const router = useRouter();
  const { items: quoteList, setItems: setQuoteList, refreshAdmin } = useAdminList(quotes);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>(initialStatus);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [hasOffersOnly, setHasOffersOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [matchProviderId, setMatchProviderId] = useState(approvedProviders[0]?.id ?? "");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFilter(initialStatus);
    setPage(1);
  }, [initialStatus]);

  const cities = useMemo(() => {
    return [...new Set(quoteList.map((q) => q.city))].sort((a, b) => a.localeCompare(b, "tr"));
  }, [quoteList]);

  const applyQuotePatch = (id: string, patch: Partial<QuoteRequest>) => {
    setQuoteList((prev) => {
      const next = prev.map((q) => (q.id === id ? { ...q, ...patch } : q));
      if (patch.status === "cancelled" && filter !== "cancelled" && filter !== "all") {
        return next.filter((q) => q.id !== id);
      }
      if (patch.status === "open" && filter === "awaiting_review") {
        return next.filter((q) => q.id !== id);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    return quoteList.filter((q) => {
      if (filter !== "all" && q.status !== filter) return false;
      if (cityFilter && q.city !== cityFilter) return false;
      if (urgentOnly && !isUrgentActive(q)) return false;
      if (hasOffersOnly && (offerCounts[q.id] ?? 0) === 0) return false;
      return matchesSearch(q, search);
    });
  }, [quoteList, filter, search, cityFilter, urgentOnly, hasOffersOnly, offerCounts]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const allSelected = pageItems.length > 0 && pageItems.every((q) => selected.has(q.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const q of pageItems) next.delete(q.id);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const q of pageItems) next.add(q.id);
        return next;
      });
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedIds = [...selected];

  const runBulk = async (
    action: "approve" | "reject" | "match",
    providerId?: string
  ) => {
    if (selectedIds.length === 0) {
      setMessage("En az bir talep seçin.");
      return;
    }
    setLoading(action);
    setMessage("");
    try {
      const res = await fetch("/api/admin/teklif/toplu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action, providerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İşlem başarısız");

      const ok = data.succeeded?.length ?? 0;
      const fail = data.failed?.length ?? 0;
      setMessage(
        action === "reject" && ok > 0
          ? `${ok} talep reddedildi — alttaki «Reddedilmiş teklif talepleri» listesinde.`
          : `${ok} başarılı${fail > 0 ? `, ${fail} başarısız` : ""}.`
      );
      setSelected(new Set());
      const succeededIds: string[] = data.succeeded ?? [];
      if (succeededIds.length > 0) {
        setQuoteList((prev) => {
          if (action === "approve") {
            return prev.map((q) =>
              succeededIds.includes(q.id) ? { ...q, status: "open" as const } : q
            ).filter((q) => filter !== "awaiting_review" || !succeededIds.includes(q.id));
          }
          if (action === "reject") {
            return prev.filter((q) => !succeededIds.includes(q.id));
          }
          return prev.filter((q) => !succeededIds.includes(q.id));
        });
      }
      if (action === "reject" && ok > 0) {
        router.push("/sltn/teklifler#reddedilmis-teklifler");
      }
      await refreshAdmin();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setLoading(null);
    }
  };

  const runAutoMatch = async (ids?: string[]) => {
    const targetIds = ids ?? selectedIds;
    if (targetIds.length === 0) {
      alert("En az bir talep seçin.");
      return;
    }
    if (
      !confirm(
        `${targetIds.length} talep otomatik eşleştirilecek. Usta teklifi varsa en düşük fiyatlı teklif kabul edilir; yoksa şehir/kategori uyumlu usta atanır. Devam?`
      )
    ) {
      return;
    }
    setLoading("auto");
    setMessage("");
    try {
      const res = await fetch("/api/admin/teklif/otomatik-eslestir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: targetIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Eşleştirme başarısız");

      const ok = data.succeeded?.length ?? 0;
      const fail = data.failed?.length ?? 0;
      setMessage(`Otomatik eşleştirme: ${ok} başarılı${fail > 0 ? `, ${fail} başarısız` : ""}.`);
      setSelected(new Set());
      const succeededIds: string[] = data.succeeded ?? [];
      if (succeededIds.length > 0) {
        setQuoteList((prev) =>
          prev.map((q) =>
            succeededIds.includes(q.id)
              ? { ...q, status: "accepted" as const }
              : q
          )
        );
      }
      await refreshAdmin();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Eşleştirme başarısız");
    } finally {
      setLoading(null);
    }
  };

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: quoteList.length };
    for (const q of quoteList) {
      counts[q.status] = (counts[q.status] ?? 0) + 1;
    }
    return counts;
  }, [quoteList]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["all", "Tümü"],
            ["awaiting_review", "Onay Bekliyor"],
            ["open", "Yayında"],
            ["accepted", "Eşleşti"],
            ["completed", "Tamamlandı"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setFilter(key);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === key
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {label} ({filterCounts[key] ?? 0})
          </button>
        ))}
      </div>

      <AdminTableToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Hizmet, müşteri, telefon, şehir…"
        total={quotes.length}
        shown={filtered.length}
        page={safePage}
        pageCount={pageCount}
        onPageChange={setPage}
      >
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="">Tüm iller</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setUrgentOnly((v) => !v);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              urgentOnly ? "bg-red-600 text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            Acil
          </button>
          <button
            type="button"
            onClick={() => {
              setHasOffersOnly((v) => !v);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              hasOffersOnly ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            Teklif var
          </button>
        </div>
      </AdminTableToolbar>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4">
        <button
          type="button"
          disabled={loading !== null || selectedIds.length === 0}
          onClick={() => runAutoMatch()}
          className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {loading === "auto" ? "Eşleştiriliyor…" : "Seçilenleri Otomatik Eşleştir"}
        </button>
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>

      {selectedIds.length > 0 && (
        <div className="sticky top-16 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-sm">
          <span className="text-sm font-medium">{selectedIds.length} seçili</span>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => runBulk("approve")}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading === "approve" ? "…" : "Onayla"}
          </button>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => runBulk("reject")}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            {loading === "reject" ? "…" : "Reddet"}
          </button>
          <AdminProviderPicker
            providers={approvedProviders}
            value={matchProviderId}
            onChange={setMatchProviderId}
          />
          <button
            type="button"
            disabled={loading !== null || !matchProviderId}
            onClick={() => runBulk("match", matchProviderId)}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading === "match" ? "…" : "Usta ile Eşleştir / Değiştir"}
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            Seçimi temizle
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Tümünü seç"
                />
              </th>
              <th className="px-4 py-3">Hizmet</th>
              <th className="px-4 py-3">Müşteri</th>
              <th className="px-4 py-3">Konum</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Usta Teklifi</th>
              <th className="px-4 py-3">Usta</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                  Bu filtrede talep yok.
                </td>
              </tr>
            ) : (
              pageItems.map((quote) => (
                <Fragment key={quote.id}>
                  <tr
                    className={`border-b border-border last:border-0 ${
                      selected.has(quote.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(quote.id)}
                        onChange={() => toggleOne(quote.id)}
                        aria-label={`${quote.serviceName} seç`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{quote.serviceName}</div>
                      <div className="text-xs text-muted-foreground">{quote.categoryName}</div>
                      {quote.urgent && (
                        <span className="mt-1 inline-block text-xs font-semibold text-red-600">
                          🚨 Acil
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>{quote.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {quotePhoneForAdmin(quote)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {quote.city}
                      {quote.district ? `, ${quote.district}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[quote.status]}`}
                      >
                        {statusLabels[quote.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">{offerCounts[quote.id] ?? 0}</td>
                    <td className="px-4 py-3 text-xs">
                      {quote.matchedProviderName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(quote.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expandedId === quote.id ? null : quote.id)
                        }
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {expandedId === quote.id ? "Gizle" : "Detay"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === quote.id && (
                    <tr>
                      <td colSpan={9} className="bg-muted/20 px-4 py-4">
                        <QuoteRow
                          quote={quote}
                          commissionRate={commissionRate}
                          offerCount={offerCounts[quote.id] ?? 0}
                          approvedProviders={approvedProviders}
                          onStatusChange={(id, status, extra) =>
                            applyQuotePatch(id, { status, ...extra })
                          }
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
