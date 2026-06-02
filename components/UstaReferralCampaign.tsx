"use client";

import { useEffect, useMemo, useState } from "react";
import { categories, getCategoryName } from "@/lib/data/categories";
import { services } from "@/lib/data/services";
import { REFERRAL_CAMPAIGN } from "@/lib/referrals";

type ReferralItem = {
  id: string;
  name: string;
  phoneMasked: string;
  categoryName: string;
  serviceNames: string;
  creditsAwarded: number;
  registered: boolean;
  createdAt: string;
};

type Props = {
  onCreditsUpdated?: (balance: number) => void;
};

export default function UstaReferralCampaign({ onCreditsUpdated }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [serviceSlugs, setServiceSlugs] = useState<string[]>([]);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [totalCreditsEarned, setTotalCreditsEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categoryServices = useMemo(
    () => (categorySlug ? services.filter((s) => s.categorySlug === categorySlug) : []),
    [categorySlug]
  );

  const canSubmit =
    name.trim().length >= 3 && phone.trim().length > 0 && categorySlug && serviceSlugs.length > 0;

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

  const toggleService = (slug: string) => {
    setServiceSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const onCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    setServiceSlugs([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/usta/arkadas-getir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, categorySlug, serviceSlugs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi");

      setName("");
      setPhone("");
      setCategorySlug("");
      setServiceSlugs([]);
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
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Kampanya</p>
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

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-emerald-950">Ad Soyad</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ahmet Yılmaz"
              className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-emerald-950">Telefon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="5XX XXX XX XX"
              className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-emerald-950">Kategori</label>
            <select
              value={categorySlug}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Seçin…</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 sm:w-auto"
            >
              {submitting ? "Kaydediliyor…" : `Kaydet (+${REFERRAL_CAMPAIGN.rewardCredits} kontör)`}
            </button>
          </div>
        </div>

        {categorySlug && (
          <div>
            <label className="mb-1 block text-xs font-medium text-emerald-950">
              Hizmetler ({getCategoryName(categorySlug)})
            </label>
            <div className="max-h-24 overflow-y-auto rounded-lg border border-emerald-200 bg-white p-2">
              <div className="flex flex-wrap gap-1.5">
                {categoryServices.map((service) => {
                  const selected = serviceSlugs.includes(service.slug);
                  return (
                    <button
                      key={service.slug}
                      type="button"
                      onClick={() => toggleService(service.slug)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                        selected
                          ? "bg-emerald-700 text-white"
                          : "border border-emerald-200 text-emerald-900 hover:bg-emerald-50"
                      }`}
                    >
                      {service.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="mt-1 text-[11px] text-emerald-800/70">En az bir hizmet seçin.</p>
          </div>
        )}
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
                className="rounded-lg bg-white/70 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-emerald-950">
                    {item.name || item.phoneMasked}
                  </span>
                  <span className="text-emerald-700">+{item.creditsAwarded} kontör</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.phoneMasked}
                  {item.categoryName ? ` · ${item.categoryName}` : ""}
                  {item.serviceNames ? ` · ${item.serviceNames}` : ""}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {item.registered ? "Kayıt oldu" : "Davet kayıtlı"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
