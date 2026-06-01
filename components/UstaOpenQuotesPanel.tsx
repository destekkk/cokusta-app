"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LAUNCH_CAMPAIGN } from "@/lib/campaigns";
import { getCategoryName } from "@/lib/data/categories";
import { MAX_CREDIT_DEBT, canSubmitOffer, remainingDebtCapacity } from "@/lib/credit-debt";
import UstaReferralCampaign from "@/components/UstaReferralCampaign";
import UstaMyOffersPanel from "@/components/UstaMyOffersPanel";
import UstaProfileLocationCard from "@/components/UstaProfileLocationCard";
import UstaInboxPanel from "@/components/UstaInboxPanel";
import OfferNegotiationPanel from "@/components/OfferNegotiationPanel";
import type { ProviderOffer } from "@/lib/types";
import { cities, getDistricts } from "@/lib/data/cities";
import { getCurrentOfferPrice, type ProviderQuoteLocationFilter } from "@/lib/offer-utils";
import type { PublicQuoteRequest } from "@/lib/quote-privacy";

type OpenQuote = PublicQuoteRequest & { myOffer?: ProviderOffer };

const KONTOR_URL = "/usta/kontor?reason=no-credit";
const LOCATION_STORAGE_KEY = "cokusta-usta-location-filter";

function buildTaleplerUrl(location: ProviderQuoteLocationFilter): string {
  const params = new URLSearchParams();
  if (location.cityMode === "all") {
    params.set("city", "all");
  } else if (location.cityMode === "selected" && location.selectedCity) {
    params.set("city", location.selectedCity);
  }
  if (location.selectedDistrict) {
    params.set("district", location.selectedDistrict);
  }
  const qs = params.toString();
  return qs ? `/api/usta/talepler?${qs}` : "/api/usta/talepler";
}

function activeFilterCity(location: ProviderQuoteLocationFilter, providerCity: string): string {
  if (location.cityMode === "selected" && location.selectedCity) return location.selectedCity;
  return providerCity;
}

function locationSummary(location: ProviderQuoteLocationFilter, providerCity: string): string {
  if (location.cityMode === "all") return "tüm iller";
  const city = activeFilterCity(location, providerCity);
  if (!city) return "";
  if (location.selectedDistrict) return `${city}, ${location.selectedDistrict}`;
  return `${city} · tüm ilçeler`;
}

function citySelectValue(location: ProviderQuoteLocationFilter): string {
  if (location.cityMode === "all") return "__all__";
  if (location.cityMode === "selected" && location.selectedCity) return location.selectedCity;
  return "__provider__";
}

export default function UstaOpenQuotesPanel() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<OpenQuote[]>([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditDebt, setCreditDebt] = useState(0);
  const [escrowBalanceTl, setEscrowBalanceTl] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [debtNotice, setDebtNotice] = useState<string | null>(null);
  const [providerCity, setProviderCity] = useState("");
  const [providerCategories, setProviderCategories] = useState<string[]>([]);
  const [location, setLocation] = useState<ProviderQuoteLocationFilter>({ cityMode: "provider" });
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"open" | "mine">("open");
  const [myOffersRefresh, setMyOffersRefresh] = useState(0);
  const [locationReady, setLocationReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved) setLocation(JSON.parse(saved));
    } catch {
      /* ignore */
    } finally {
      setLocationReady(true);
    }
  }, []);

  useEffect(() => {
    if (!locationReady) return;
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  }, [location, locationReady]);

  const canOffer = canSubmitOffer(creditBalance, creditDebt);
  const debtRemaining = remainingDebtCapacity(creditDebt);
  const atDebtLimit = creditBalance < 1 && creditDebt >= MAX_CREDIT_DEBT;

  const load = async (nextLocation: ProviderQuoteLocationFilter = location) => {
    const showFullLoader = quotes.length === 0 && !error;
    if (showFullLoader) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch(buildTaleplerUrl(nextLocation));
      if (res.status === 401) {
        router.push("/usta/giris");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Yüklenemedi");
      setQuotes(data.quotes ?? []);
      setCreditBalance(data.creditBalance ?? 0);
      setCreditDebt(data.creditDebt ?? 0);
      setEscrowBalanceTl(data.escrowBalanceTl ?? 0);
      setProviderCity(data.providerCity ?? "");
      setProviderCategories(Array.isArray(data.providerCategories) ? data.providerCategories : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!locationReady) return;
    load(location);
  }, [location, locationReady]);

  const onCityChange = (value: string) => {
    if (value === "__all__") {
      setLocation({ cityMode: "all" });
      return;
    }
    if (value === "__provider__") {
      setLocation({ cityMode: "provider" });
      return;
    }
    setLocation({ cityMode: "selected", selectedCity: value });
  };

  const onDistrictChange = (value: string) => {
    setLocation((prev) => {
      if (prev.cityMode === "all") return prev;
      const base =
        prev.cityMode === "selected" && prev.selectedCity
          ? { cityMode: "selected" as const, selectedCity: prev.selectedCity }
          : { cityMode: "provider" as const };
      if (!value) return base;
      return { ...base, selectedDistrict: value };
    });
  };

  const filterCity = activeFilterCity(location, providerCity);
  const districtOptions = location.cityMode !== "all" && filterCity ? getDistricts(filterCity) : [];

  const pendingCustomerAgreement = quotes.some(
    (q) => q.myOffer?.customerAgreedAt && !q.myOffer?.providerAgreedAt && q.myOffer?.status === "pending"
  );

  const goBuyCredits = () => router.push(KONTOR_URL);

  const startOffer = (quoteId: string) => {
    if (pendingCustomerAgreement) return;
    if (!canOffer) {
      goBuyCredits();
      return;
    }
    setActiveId(quoteId);
  };

  const submitOffer = async (quoteRequestId: string) => {
    if (!canOffer) {
      goBuyCredits();
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/usta/teklif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteRequestId,
          price: Number(price),
          message,
        }),
      });
      const data = await res.json();
      if (res.status === 402 || data.code === "INSUFFICIENT_CREDITS") {
        goBuyCredits();
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Gönderilemedi");
      setActiveId(null);
      setPrice("");
      setMessage("");
      if (data.usedDebt) {
        setDebtNotice("1 kontörlük borç kredisi kullanıldı.");
        setCreditDebt(data.creditDebt ?? creditDebt + 1);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gönderilemedi");
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    await fetch("/api/usta/cikis", { method: "POST" });
    router.push("/usta/giris");
  };

  const negotiate = async (
    offer: ProviderOffer,
    action: "agree" | "counter",
    counterPrice?: number,
    counterMessage?: string
  ) => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/usta/teklif/pazarlik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer.id,
          action,
          price: counterPrice,
          message: counterMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İşlem başarısız");
      await load();
      setMyOffersRefresh((v) => v + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Talepler yükleniyor…</p>;
  }

  return (
    <div className="space-y-6">
      {debtNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <p className="text-lg font-semibold text-foreground">Borç kredisi kullanıldı</p>
            <p className="mt-2 text-sm text-muted-foreground">{debtNotice}</p>
            <p className="mt-2 text-sm text-amber-700">
              Toplam borç krediniz: {creditDebt}/{MAX_CREDIT_DEBT} kontör. Ödeme yaparken borç
              kredisi de tahsil edilir.
            </p>
            <button
              type="button"
              onClick={() => setDebtNotice(null)}
              className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm text-muted-foreground">Kalan teklif kontörü</p>
          <p className="text-2xl font-bold text-primary">{creditBalance}</p>
          {escrowBalanceTl > 0 && (
            <p className="mt-1 text-sm font-medium text-emerald-700">
              Param Güvende bakiyesi: {escrowBalanceTl.toLocaleString("tr-TR")} ₺
            </p>
          )}
          {creditDebt > 0 && (
            <p className="mt-1 text-sm font-medium text-amber-700">
              Borç kredisi: {creditDebt}/{MAX_CREDIT_DEBT} kontör
            </p>
          )}
          {creditBalance === 0 && debtRemaining > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Kontörünüz bitti; {debtRemaining} kontöre kadar borç kredisi kullanarak teklif
              verebilirsiniz.
            </p>
          )}
          {creditBalance <= LAUNCH_CAMPAIGN.provider.freeCredits && creditBalance > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Hediye kontörlerinizi kullanıyorsunuz.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/usta/kontor"
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              atDebtLimit ? "bg-amber-600 hover:bg-amber-700" : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {atDebtLimit ? "Kontör Satın Al" : "Paket Yükle"}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Çıkış
          </button>
        </div>
      </div>

      {atDebtLimit && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Kontör ve borç kredisi limitiniz doldu ({MAX_CREDIT_DEBT} kontör). Teklif vermek için
          paket satın alın; ödeme sırasında borç krediniz de tahsil edilecektir.
          <button
            type="button"
            onClick={goBuyCredits}
            className="mt-3 block font-semibold text-amber-900 underline"
          >
            Kontör paketlerine git →
          </button>
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {pendingCustomerAgreement && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Bir müşteri sizinle anlaşmayı onayladı. Yeni teklif veremezsiniz; bekleyen anlaşmayı onaylayın veya
          müşteri vazgeçene kadar bekleyin.
        </p>
      )}

      <UstaProfileLocationCard
        onUpdated={(city) => {
          setProviderCity(city);
        }}
      />

      <UstaInboxPanel />

      <div className="flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("open")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "open"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Açık Talepler
        </button>
        <button
          type="button"
          onClick={() => setTab("mine")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "mine"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Verdiğim Teklifler
        </button>
      </div>

      {tab === "mine" ? (
        <UstaMyOffersPanel
          onNegotiate={negotiate}
          submitting={submitting}
          refreshToken={myOffersRefresh}
        />
      ) : (
        <>
      <p className="text-xs text-muted-foreground">
        Kategori uygun olduğu sürece farklı illerdeki taleplere de teklif verebilirsiniz. İl filtresinden
        &quot;Tüm iller&quot; veya başka bir il seçin.
      </p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {refreshing ? "Güncelleniyor…" : `${quotes.length} açık talep`}
          {!refreshing && locationSummary(location, providerCity)
            ? ` · ${locationSummary(location, providerCity)}`
            : ""}
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            İl
            <select
              value={citySelectValue(location)}
              onChange={(e) => onCityChange(e.target.value)}
              className="min-w-[180px] rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
            >
              <option value="__provider__">
                {providerCity ? `Kendi ilim (${providerCity})` : "Kendi ilim"}
              </option>
              <option value="__all__">Tüm iller</option>
              <optgroup label="İl seç">
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          {location.cityMode !== "all" && filterCity && (
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              İlçe
              <select
                value={location.selectedDistrict ?? ""}
                onChange={(e) => onDistrictChange(e.target.value)}
                className="min-w-[160px] rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              >
                <option value="">Tüm ilçeler</option>
                {districtOptions.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          <p>Şu an size uygun açık talep yok.</p>
          <p className="mt-3 text-sm">
            Talepler yalnızca <strong>onaylı</strong> ve admin tarafından <strong>yayına alınmış</strong>{" "}
            ilanlardır; şehir ve hizmet kategorinizle eşleşmelidir.
          </p>
          {(providerCity || providerCategories.length > 0) && (
            <p className="mt-2 text-xs">
              Profiliniz: {providerCity || "—"}
              {providerCategories.length > 0
                ? ` · ${providerCategories.map(getCategoryName).join(", ")}`
                : ""}
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Hizmet</th>
                <th className="px-4 py-3">Konum</th>
                <th className="px-4 py-3">Not</th>
                <th className="px-4 py-3">Teklif</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-t border-border align-top hover:bg-accent/10">
                  <td className="px-4 py-3 font-medium">
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
                    <br />
                    <span className="text-xs">{quote.offerCount ?? 0} teklif</span>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-muted-foreground">
                    <p className="line-clamp-2">{quote.notes || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    {quote.myOffer ? (
                      <span className="font-semibold text-primary">
                        {getCurrentOfferPrice(quote.myOffer).toLocaleString("tr-TR")} ₺
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {quote.myOffer ? (
                      <OfferNegotiationPanel
                        offer={quote.myOffer}
                        role="provider"
                        loading={submitting}
                        onAgree={() => negotiate(quote.myOffer!, "agree")}
                        onCounter={(p, m) => negotiate(quote.myOffer!, "counter", p, m)}
                      />
                    ) : activeId === quote.id ? (
                      <div className="space-y-2 min-w-[280px]">
                        <input
                          type="number"
                          placeholder="Tutar (₺)"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                        />
                        <textarea
                          placeholder="Açıklama (min. 5 karakter)"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => submitOffer(quote.id)}
                            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white"
                          >
                            Gönder
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveId(null)}
                            className="rounded-lg border border-border px-3 py-2 text-xs"
                          >
                            Vazgeç
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startOffer(quote.id)}
                        disabled={pendingCustomerAgreement}
                        className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                          !canOffer ? "bg-amber-600 hover:bg-amber-700" : "bg-primary hover:bg-primary-dark"
                        }`}
                      >
                        {!canOffer ? "Kontör Al" : "Hemen Teklif Ver"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UstaReferralCampaign
        onCreditsUpdated={(balance) => setCreditBalance(balance)}
      />
        </>
      )}
    </div>
  );
}
