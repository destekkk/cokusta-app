"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_GIFT_CREDIT_AMOUNTS } from "@/lib/admin-gift-credits";
import type { ProviderSummary } from "@/lib/types";

type TargetMode = "all_approved" | "selected";

type Props = {
  providers: ProviderSummary[];
};

export default function AdminProviderGiftCredits({ providers }: Props) {
  const router = useRouter();
  const approved = useMemo(
    () => providers.filter((p) => p.status === "approved"),
    [providers]
  );
  const [targetMode, setTargetMode] = useState<TargetMode>("selected");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [credits, setCredits] = useState<number>(10);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllApproved = () => {
    setSelected(new Set(approved.map((p) => p.id)));
    setTargetMode("selected");
  };

  const clearSelection = () => setSelected(new Set());

  const targetCount =
    targetMode === "all_approved" ? approved.length : selected.size;

  const grant = async () => {
    setError("");
    setMessage("");
    if (targetCount === 0) {
      setError("En az bir onaylı usta seçin.");
      return;
    }
    if (
      !confirm(
        `${targetCount} ustaya ${credits} hediye kontör verilecek. Onaylıyor musunuz?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/usta/hediye-kontor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits,
          allApproved: targetMode === "all_approved",
          providerIds: targetMode === "selected" ? [...selected] : [],
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İşlem başarısız");

      setMessage(
        `${data.totalGranted ?? data.granted?.length ?? 0} ustaya ${credits} kontör verildi.` +
          (data.failed?.length ? ` (${data.failed.length} başarısız)` : "")
      );
      if (targetMode === "selected") clearSelection();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-primary/25 bg-primary/5 p-5">
      <h2 className="text-lg font-bold text-foreground">Hediye kontör ver</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Onaylı ustalara 10, 30 veya 50 kontör hediye edebilirsiniz. İşlem muhasebe kaydına yazılır.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {ADMIN_GIFT_CREDIT_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => setCredits(amount)}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              credits === amount
                ? "border-primary bg-primary text-white"
                : "border-border bg-card text-foreground hover:border-primary/40"
            }`}
          >
            {amount} kontör
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="gift-target"
            checked={targetMode === "all_approved"}
            onChange={() => setTargetMode("all_approved")}
          />
          Tüm onaylı ustalar ({approved.length})
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="gift-target"
            checked={targetMode === "selected"}
            onChange={() => setTargetMode("selected")}
          />
          Seçtiklerim ({selected.size})
        </label>
      </div>

      {targetMode === "selected" && (
        <div className="mt-4 max-h-48 overflow-y-auto rounded-lg border border-border bg-card">
          <div className="sticky top-0 flex flex-wrap gap-2 border-b border-border bg-muted/50 px-3 py-2">
            <button
              type="button"
              onClick={selectAllApproved}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Tüm onaylıları seç
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-muted-foreground hover:underline"
            >
              Seçimi temizle
            </button>
          </div>
          <ul className="divide-y divide-border text-sm">
            {approved.length === 0 ? (
              <li className="px-3 py-4 text-muted-foreground">Onaylı usta yok.</li>
            ) : (
              approved.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  <span className="min-w-0 flex-1 font-medium">{p.name}</span>
                  <span className="text-muted-foreground">{p.city}</span>
                  <span className="tabular-nums font-semibold text-primary">
                    {p.creditBalance ?? 0} kontör
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Not (opsiyonel, muhasebe kaydı)"
        className="mt-4 w-full max-w-md rounded-lg border border-border bg-card px-3 py-2 text-sm"
      />

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {message && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <button
        type="button"
        disabled={loading || targetCount === 0}
        onClick={grant}
        className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {loading ? "Veriliyor…" : `Hediye kontör ver (${targetCount} usta × ${credits})`}
      </button>
    </section>
  );
}
