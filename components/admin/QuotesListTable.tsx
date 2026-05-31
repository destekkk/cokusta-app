"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/admin-labels";
import { quotePhoneForAdmin } from "@/lib/quote-privacy";
import QuoteRow from "@/components/admin/QuoteRow";
import type { ProviderRegistration, QuoteRequest } from "@/lib/types";

const statusLabels: Record<QuoteRequest["status"], string> = {
  awaiting_review: "Onay Bekliyor",
  open: "Yayında",
  accepted: "Usta Seçildi",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
};

const statusColors: Record<QuoteRequest["status"], string> = {
  awaiting_review: "bg-orange-100 text-orange-800",
  open: "bg-amber-100 text-amber-800",
  accepted: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

type Filter = "all" | QuoteRequest["status"];

type Props = {
  quotes: QuoteRequest[];
  offerCounts: Record<string, number>;
  approvedProviders: ProviderRegistration[];
  commissionRate: number;
};

export default function QuotesListTable({
  quotes,
  offerCounts,
  approvedProviders,
  commissionRate,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [matchProviderId, setMatchProviderId] = useState(approvedProviders[0]?.id ?? "");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    if (filter === "all") return quotes;
    return quotes.filter((q) => q.status === filter);
  }, [quotes, filter]);

  const allSelected = filtered.length > 0 && filtered.every((q) => selected.has(q.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const q of filtered) next.delete(q.id);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const q of filtered) next.add(q.id);
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
      alert("En az bir talep seçin.");
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
      setMessage(`${ok} başarılı${fail > 0 ? `, ${fail} başarısız` : ""}.`);
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "İşlem başarısız");
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
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Eşleştirme başarısız");
    } finally {
      setLoading(null);
    }
  };

  const approveDemoQuotes = async () => {
    setLoading("demo");
    setMessage("");
    try {
      const res = await fetch("/api/admin/teklif/demo-onayla", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Onaylanamadı");
      setMessage(`${data.count ?? 0} demo teklif yayına alındı.`);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Onaylanamadı");
    } finally {
      setLoading(null);
    }
  };

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: quotes.length };
    for (const q of quotes) {
      counts[q.status] = (counts[q.status] ?? 0) + 1;
    }
    return counts;
  }, [quotes]);

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
            ["cancelled", "İptal"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
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

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4">
        <button
          type="button"
          disabled={loading !== null}
          onClick={approveDemoQuotes}
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
        >
          {loading === "demo" ? "Onaylanıyor…" : "Demo Teklifleri Onayla"}
        </button>
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
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={matchProviderId}
              onChange={(e) => setMatchProviderId(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              {approvedProviders.length === 0 ? (
                <option value="">Onaylı usta yok</option>
              ) : (
                approvedProviders.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.city}
                  </option>
                ))
              )}
            </select>
            <button
              type="button"
              disabled={loading !== null || !matchProviderId}
              onClick={() => runBulk("match", matchProviderId)}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading === "match" ? "…" : "Usta ile Eşleştir"}
            </button>
          </div>
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                  Bu filtrede talep yok.
                </td>
              </tr>
            ) : (
              filtered.map((quote) => (
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
                        <QuoteRow quote={quote} commissionRate={commissionRate} />
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
