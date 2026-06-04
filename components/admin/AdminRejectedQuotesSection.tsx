"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatDateTime } from "@/lib/admin-labels";
import { quotePhoneForAdmin } from "@/lib/quote-privacy";
import type { QuoteRequest } from "@/lib/types";
import { useAdminList } from "@/lib/use-admin-list";

type Props = {
  quotes: QuoteRequest[];
};

export default function AdminRejectedQuotesSection({ quotes }: Props) {
  const router = useRouter();
  const { items: list, setItems, refreshAdmin } = useAdminList(quotes);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sorted = useMemo(
    () =>
      [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [list]
  );

  const selectedIds = [...selected];

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteOne = async (id: string) => {
    if (!confirm("Bu reddedilmiş talep kalıcı olarak silinsin mi?")) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/teklif/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Silinemedi");
      setMessage("Talep silindi.");
      setItems((prev) => prev.filter((q) => q.id !== id));
      await refreshAdmin();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Silinemedi");
    } finally {
      setLoading(false);
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length} reddedilmiş talep silinsin mi?`)) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/teklif/sil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Silinemedi");
      const ok = data.succeeded?.length ?? 0;
      const fail = data.failed?.length ?? 0;
      setMessage(`${ok} silindi${fail > 0 ? `, ${fail} başarısız` : ""}.`);
      setSelected(new Set());
      const succeededIds: string[] = data.succeeded ?? [];
      if (succeededIds.length > 0) {
        setItems((prev) => prev.filter((q) => !succeededIds.includes(q.id)));
      }
      await refreshAdmin();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Silinemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reddedilmis-teklifler" className="mt-10 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-red-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Reddedilmiş teklif talepleri</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Onay bekleyen listeden reddettiğiniz talepler burada görünür. Kalıcı silmek için Sil
            kullanın.
          </p>
        </div>
        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
          {sorted.length}
        </span>
      </div>

      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}

      {sorted.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
          Reddedilmiş talep yok.
        </p>
      ) : (
        <>
          {selectedIds.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <span className="text-sm font-medium text-red-900">{selectedIds.length} seçili</span>
              <button
                type="button"
                disabled={loading}
                onClick={() => void deleteSelected()}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Siliniyor…" : "Seçilenleri sil"}
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-sm text-red-800 hover:underline"
              >
                Seçimi temizle
              </button>
            </div>
          )}

          <div className="mt-4 overflow-x-auto rounded-xl border border-red-200/80 bg-card">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-red-50/80 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={sorted.length > 0 && sorted.every((q) => selected.has(q.id))}
                      onChange={() => {
                        if (sorted.every((q) => selected.has(q.id))) setSelected(new Set());
                        else setSelected(new Set(sorted.map((q) => q.id)));
                      }}
                      aria-label="Tümünü seç"
                    />
                  </th>
                  <th className="px-4 py-3">Hizmet</th>
                  <th className="px-4 py-3">Müşteri</th>
                  <th className="px-4 py-3">Konum</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((quote) => (
                  <tr key={quote.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(quote.id)}
                        onChange={() => toggle(quote.id)}
                        aria-label={`${quote.serviceName} seç`}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{quote.serviceName}</td>
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
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(quote.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => void deleteOne(quote.id)}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
