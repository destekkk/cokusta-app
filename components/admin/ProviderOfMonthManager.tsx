"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { currentPeriod, formatPeriodLabel } from "@/lib/blockchain";
import {
  PROVIDER_OF_MONTH_CREDIT_REWARD,
  providerOfMonthStatusLabels,
} from "@/lib/provider-of-month";
import type { ProviderOfTheMonth, ProviderSummary } from "@/lib/types";

type LeaderboardEntry = {
  providerId: string;
  name: string;
  city: string;
  completedJobs: number;
  earnings: number;
};

type Props = {
  providers: ProviderSummary[];
  currentSelection: ProviderOfTheMonth | null;
  history: ProviderOfTheMonth[];
  leaderboard: LeaderboardEntry[];
};

export default function ProviderOfMonthManager({
  providers,
  currentSelection,
  history,
  leaderboard,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [monthReason, setMonthReason] = useState("");
  const [period, setPeriod] = useState(currentPeriod());

  const approved = providers.filter((provider) => provider.status === "approved");

  const selectMonthWinner = async () => {
    if (!selectedProvider) {
      alert("Lütfen bir usta seçin.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/ayin-ustasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: selectedProvider,
          period,
          reason: monthReason.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İşlem başarısız");
      setMonthReason("");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  };

  const publishSelection = async () => {
    if (!currentSelection) return;
    if (
      !confirm(
        `${currentSelection.providerName} ana sayfada yayınlansın mı? Ustaya ${PROVIDER_OF_MONTH_CREDIT_REWARD} kontör hediye verilecek.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/ayin-ustasi/yayinla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: currentSelection.period }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Yayınlanamadı");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Yayınlanamadı");
    } finally {
      setLoading(false);
    }
  };

  const removeSelection = async () => {
    if (!currentSelection) return;
    if (!confirm(`${currentSelection.providerName} ana sayfadan kaldırılsın mı?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/ayin-ustasi/kaldir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: currentSelection.period }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaldırılamadı");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kaldırılamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <h2 className="text-lg font-bold text-foreground">Ayın Ustası</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Usta seçin, onay bekletin; yayınladığınızda ana sayfada görünür ve{" "}
          {PROVIDER_OF_MONTH_CREDIT_REWARD} kontör hediye edilir.
        </p>

        {currentSelection && (
          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase text-muted-foreground">
                  {currentSelection.periodLabel} seçimi
                </div>
                <div className="mt-1 text-lg font-bold text-foreground">
                  {currentSelection.providerName}
                </div>
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                    currentSelection.status === "published"
                      ? "bg-emerald-100 text-emerald-800"
                      : currentSelection.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {providerOfMonthStatusLabels[currentSelection.status]}
                </span>
                {currentSelection.creditsAwarded > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Verilen hediye: {currentSelection.creditsAwarded} kontör
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {currentSelection.status !== "published" && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={publishSelection}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Ana Sayfada Yayınla
                  </button>
                )}
                {currentSelection.status === "published" && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={removeSelection}
                    className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
                  >
                    Yayından Kaldır
                  </button>
                )}
              </div>
            </div>
            {currentSelection.reason && (
              <p className="mt-3 text-sm text-foreground">{currentSelection.reason}</p>
            )}
            <Link
              href={`/sertifika/${currentSelection.certificateId}`}
              className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Sertifikayı görüntüle →
            </Link>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Dönem</label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">{formatPeriodLabel(period)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Usta seç</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option value="">Usta seçin</option>
              {approved.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} — {provider.city} ({provider.completedJobs} iş)
                </option>
              ))}
            </select>
          </div>
        </div>

        <textarea
          placeholder="Seçim gerekçesi (isteğe bağlı)"
          value={monthReason}
          onChange={(e) => setMonthReason(e.target.value)}
          rows={2}
          className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />

        <button
          type="button"
          disabled={loading}
          onClick={selectMonthWinner}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Kaydediliyor..." : "Ayın Ustası Seç (onay bekler)"}
        </button>

        {leaderboard.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground">Bu ayın öne çıkanları</h3>
            <div className="mt-2 space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.providerId}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <div>
                    <span className="mr-2 font-bold text-primary">#{index + 1}</span>
                    {entry.name} · {entry.city}
                  </div>
                  <div className="text-muted-foreground">
                    {entry.completedJobs} iş · {entry.earnings.toLocaleString("tr-TR")} ₺
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground">Geçmiş seçimler</h2>
          <div className="mt-4 space-y-2 text-sm">
            {history.map((item) => (
              <div
                key={`${item.period}-${item.certificateId}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
              >
                <div>
                  <span className="font-medium">{item.periodLabel}</span>
                  <span className="mx-2 text-muted-foreground">·</span>
                  {item.providerName}
                </div>
                <span className="text-xs text-muted-foreground">
                  {providerOfMonthStatusLabels[item.status]}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
