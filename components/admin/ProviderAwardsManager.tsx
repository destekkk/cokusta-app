"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { currentPeriod, formatPeriodLabel } from "@/lib/blockchain";
import type {
  ProviderCertificate,
  ProviderOfTheMonth,
  ProviderSummary,
} from "@/lib/types";

type LeaderboardEntry = {
  providerId: string;
  name: string;
  city: string;
  completedJobs: number;
  earnings: number;
};

type Props = {
  providers: ProviderSummary[];
  certificates: ProviderCertificate[];
  currentMonth: (ProviderOfTheMonth & { certificate?: ProviderCertificate }) | null;
  history: ProviderOfTheMonth[];
  leaderboard: LeaderboardEntry[];
};

export default function ProviderAwardsManager({
  providers,
  certificates,
  currentMonth,
  history,
  leaderboard,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [monthReason, setMonthReason] = useState("");
  const [period, setPeriod] = useState(currentPeriod());

  const approved = providers.filter((provider) => provider.status === "approved");

  const issueMasterCertificate = async (providerId: string) => {
    if (!confirm("Bu ustaya Çok Başarılı Usta sertifikası verilsin mi?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/sertifika", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, type: "master_craftsman" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İşlem başarısız");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-8">
      {/* Ayın Ustası */}
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <h2 className="text-lg font-bold text-foreground">Ayın Ustası</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Seçilen usta blockchain sertifikası alır ve ana sayfada öne çıkar.
        </p>

        {currentMonth && (
          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <div className="text-xs uppercase text-muted-foreground">Güncel seçim</div>
            <div className="mt-1 text-lg font-bold text-foreground">
              {currentMonth.providerName}
            </div>
            <div className="text-sm text-muted-foreground">{currentMonth.periodLabel}</div>
            {currentMonth.reason && (
              <p className="mt-2 text-sm text-foreground">{currentMonth.reason}</p>
            )}
            <Link
              href={`/sertifika/${currentMonth.certificateId}`}
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
            <p className="mt-1 text-xs text-muted-foreground">
              {formatPeriodLabel(period)}
            </p>
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
          {loading ? "Kaydediliyor..." : "Ayın Ustası Seç"}
        </button>

        {leaderboard.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground">
              Bu ayın öne çıkanları
            </h3>
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

      {/* Çok Başarılı Usta */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">Çok Başarılı Usta Sertifikası</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Üstün performans gösteren onaylı ustalara kalıcı blockchain sertifikası verin.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Usta</th>
                <th className="px-4 py-3">Tamamlanan iş</th>
                <th className="px-4 py-3">Kazanç</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {approved.map((provider) => (
                <tr key={provider.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {provider.name}
                    <div className="text-xs text-muted-foreground">{provider.city}</div>
                  </td>
                  <td className="px-4 py-3">{provider.completedJobs}</td>
                  <td className="px-4 py-3">
                    {provider.totalJobEarnings.toLocaleString("tr-TR")} ₺
                  </td>
                  <td className="px-4 py-3">
                    {provider.isMasterCraftsman ? (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                        Sertifikalı
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!provider.isMasterCraftsman && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => issueMasterCertificate(provider.id)}
                        className="rounded border border-primary/40 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-60"
                      >
                        Sertifika ver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Verilen sertifikalar */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">Blockchain Sertifika Defteri</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {certificates.length} sertifika · SHA-256 hash zinciri ile doğrulanabilir
        </p>

        {certificates.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Henüz sertifika verilmedi.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="rounded-xl border border-border p-4 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-foreground">{cert.title}</div>
                    <div className="text-muted-foreground">{cert.providerName}</div>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    Blok #{cert.blockIndex}
                  </span>
                </div>
                <div className="mt-2 font-mono text-xs text-muted-foreground break-all">
                  {cert.blockHash.slice(0, 24)}…
                </div>
                <Link
                  href={`/sertifika/${cert.id}`}
                  className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                >
                  Doğrula →
                </Link>
              </div>
            ))}
          </div>
        )}

        {history.length > 1 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold">Geçmiş ayın ustaları</h3>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              {history.slice(1, 6).map((item) => (
                <div key={`${item.period}-${item.certificateId}`}>
                  {item.periodLabel}: {item.providerName}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
