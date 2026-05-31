"use client";

import { useEffect, useState } from "react";
import { REFERRAL_CAMPAIGN } from "@/lib/referrals";

type ReferralItem = {
  id: string;
  phoneMasked: string;
  creditsAwarded: number;
  registered: boolean;
  createdAt: string;
};

type Props = {
  onCreditsUpdated?: (balance: number) => void;
};

export default function UstaReferralCampaign({ onCreditsUpdated }: Props) {
  const [phone, setPhone] = useState("");
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [totalCreditsEarned, setTotalCreditsEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/usta/arkadas-getir");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Yüklenemedi");
      setReferrals(data.referrals ?? []);
      setTotalCreditsEarned(data.totalCreditsEarned ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/usta/arkadas-getir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi");

      setPhone("");
      setSuccess(
        `${data.creditsAwarded} kontör hesabınıza tanımlandı. Arkadaşınızı /usta-ol sayfasına yönlendirin.`
      );
      if (typeof data.creditBalance === "number") {
        onCreditsUpdated?.(data.creditBalance);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Kampanya
          </p>
          <h2 className="mt-1 text-lg font-bold text-emerald-950">{REFERRAL_CAMPAIGN.title}</h2>
          <p className="mt-2 text-sm text-emerald-900/80">{REFERRAL_CAMPAIGN.description}</p>
        </div>
        {totalCreditsEarned > 0 && (
          <div className="rounded-lg bg-white/80 px-4 py-2 text-right">
            <p className="text-xs text-muted-foreground">Toplam kazanç</p>
            <p className="text-xl font-bold text-emerald-700">{totalCreditsEarned} kontör</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-sm font-medium text-emerald-950">
            Arkadaşınızın telefonu
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="5XX XXX XX XX"
            className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm"
          />
          <p className="mt-1 text-xs text-emerald-800/70">Başına 0 yazmadan da girebilirsiniz.</p>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting || !phone.trim()}
            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {submitting ? "Kaydediliyor…" : `Kaydet (+${REFERRAL_CAMPAIGN.rewardCredits} kontör)`}
          </button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {success && (
        <p className="mt-3 rounded-lg bg-white px-4 py-3 text-sm text-emerald-800">{success}</p>
      )}

      {!loading && referrals.length > 0 && (
        <div className="mt-4 border-t border-emerald-200/80 pt-4">
          <p className="text-sm font-semibold text-emerald-950">Davet ettikleriniz</p>
          <ul className="mt-2 space-y-2">
            {referrals.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm"
              >
                <span>{item.phoneMasked}</span>
                <span className="text-emerald-700">+{item.creditsAwarded} kontör</span>
                <span className="text-xs text-muted-foreground">
                  {item.registered ? "Kayıt oldu" : "Davet kayıtlı"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
