"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LAUNCH_CAMPAIGN } from "@/lib/campaigns";
import { getCategoryName } from "@/lib/data/categories";
import { MAX_CREDIT_DEBT, canActivateBorcKredisi, canSubmitOffer } from "@/lib/credit-debt";
import UstaMyOffersPanel from "@/components/UstaMyOffersPanel";
import BorcKredisiActivateCard from "@/components/BorcKredisiActivateCard";
import CurrencyInput from "@/components/CurrencyInput";
import { parseTlDigits } from "@/lib/currency-input";
import PanelStatCard from "@/components/panel/PanelStatCard";
import SheetTabs from "@/components/panel/SheetTabs";
import type { ProviderOffer } from "@/lib/types";
import { cities, getDistricts } from "@/lib/data/cities";
import { resolveCanonicalCityName, type ProviderQuoteLocationFilter } from "@/lib/offer-utils";
import type { PublicQuoteRequest } from "@/lib/quote-privacy";
import { readJsonResponse } from "@/lib/safe-fetch";
import {
  countProviderOfferTabs,
  type ProviderOfferSheetTab,
} from "@/lib/provider-offer-tabs";
import {
  readProviderLocationFilter,
  writeProviderLocationFilter,
} from "@/lib/provider-location-storage";

const KONTOR_URL = "/usta/kontor?reason=no-credit";
const OPEN_QUOTES_PAGE_SIZE = 10;

function getOpenQuotesPageNumbers(current: number, total: number): number[] {
  if (total <= 12) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>([1, total, current, current - 1, current + 1, current - 2, current + 2]);
  return [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

type OpenQuote = PublicQuoteRequest;

function buildTaleplerUrl(location: ProviderQuoteLocationFilter): string {
  const params = new URLSearchParams();
  if (location.cityMode === "all") {
    params.set("city", "all");
  } else if (location.cityMode === "selected" && location.selectedCity) {
    params.set("city", resolveCanonicalCityName(location.selectedCity));
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
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: ProviderOfferSheetTab =
    tabParam === "mine" ||
    tabParam === "negotiating" ||
    tabParam === "done" ||
    tabParam === "escrow"
      ? tabParam
      : "open";
  const [quotes, setQuotes] = useState<OpenQuote[]>([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditDebt, setCreditDebt] = useState(0);
  const [borcKredisiAktif, setBorcKredisiAktif] = useState(false);
  const [escrowBalanceTl, setEscrowBalanceTl] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [debtNotice, setDebtNotice] = useState<string | null>(null);
  const [borcActivatedNotice, setBorcActivatedNotice] = useState(false);
  const [providerCity, setProviderCity] = useState("");
  const [providerCategories, setProviderCategories] = useState<string[]>([]);
  const [location, setLocation] = useState<ProviderQuoteLocationFilter>({ cityMode: "provider" });
  const [refreshing, setRefreshing] = useState(false);
  const [myOffersRefresh, setMyOffersRefresh] = useState(0);
  const [offerTabCounts, setOfferTabCounts] = useState({
    mine: 0,
    negotiating: 0,
    done: 0,
    escrow: 0,
  });
  const [pendingCustomerAgreement, setPendingCustomerAgreement] = useState(false);
  const [locationReady, setLocationReady] = useState(true);
  const [savedFilterApplied, setSavedFilterApplied] = useState(false);
  const [openQuotesPage, setOpenQuotesPage] = useState(1);

  useEffect(() => {
    if (!locationReady || !providerCity || savedFilterApplied) return;
    setSavedFilterApplied(true);
    setLocation(readProviderLocationFilter(providerCity));
  }, [locationReady, providerCity, savedFilterApplied]);

  useEffect(() => {
    if (!providerCity) return;
    writeProviderLocationFilter(location, providerCity);
  }, [location, providerCity]);

  const canOffer = canSubmitOffer(creditBalance, creditDebt, borcKredisiAktif);
  const atDebtLimit = creditBalance < 1 && creditDebt >= MAX_CREDIT_DEBT;
  const canActivateDebt = canActivateBorcKredisi(creditBalance, creditDebt, borcKredisiAktif);
  const borcKredisiPending = borcKredisiAktif || creditDebt > 0;

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
      const data = await readJsonResponse<{
        error?: string;
        quotes?: OpenQuote[];
        creditBalance?: number;
        creditDebt?: number;
        borcKredisiAktif?: boolean;
        escrowBalanceTl?: number;
        providerCity?: string;
        providerCategories?: string[];
      }>(res);
      if (!res.ok) throw new Error(data.error ?? "Yüklenemedi");
      setQuotes(data.quotes ?? []);
      setCreditBalance(data.creditBalance ?? 0);
      setCreditDebt(data.creditDebt ?? 0);
      setBorcKredisiAktif(Boolean(data.borcKredisiAktif));
      setEscrowBalanceTl(data.escrowBalanceTl ?? 0);
      if (data.providerCity) {
        setProviderCity(resolveCanonicalCityName(data.providerCity));
      } else {
        setProviderCity("");
      }
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
    let cancelled = false;
    void (async () => {
      await load(location);
      if (!cancelled) await refreshOfferMeta();
    })();
    return () => {
      cancelled = true;
    };
  }, [location, locationReady]);

  useEffect(() => {
    setOpenQuotesPage(1);
  }, [location]);

  const openQuotesPageCount = Math.max(1, Math.ceil(quotes.length / OPEN_QUOTES_PAGE_SIZE));
  const safeOpenQuotesPage = Math.min(openQuotesPage, openQuotesPageCount);
  const paginatedQuotes = useMemo(
    () =>
      quotes.slice(
        (safeOpenQuotesPage - 1) * OPEN_QUOTES_PAGE_SIZE,
        safeOpenQuotesPage * OPEN_QUOTES_PAGE_SIZE
      ),
    [quotes, safeOpenQuotesPage]
  );

  useEffect(() => {
    if (openQuotesPage > openQuotesPageCount) {
      setOpenQuotesPage(openQuotesPageCount);
    }
  }, [openQuotesPage, openQuotesPageCount]);

  const refreshOfferMeta = async () => {
    try {
      const res = await fetch("/api/usta/tekliflerim");
      const data = await readJsonResponse<{
        offers?: Array<{
          offer: ProviderOffer;
          quote: { status: string };
        }>;
      }>(res);
      if (!res.ok) return;
      const items = data.offers ?? [];
      setOfferTabCounts(countProviderOfferTabs(items));
      setPendingCustomerAgreement(
        items.some(
          (item) =>
            item.offer.status === "pending" &&
            item.offer.customerAgreedAt &&
            !item.offer.providerAgreedAt
        )
      );
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!locationReady) return;
    void refreshOfferMeta();
  }, [myOffersRefresh, locationReady]);

  const onCityChange = (value: string) => {
    if (value === "__all__") {
      setLocation({ cityMode: "all" });
      return;
    }
    if (value === "__provider__") {
      setLocation({ cityMode: "provider" });
      return;
    }
    setLocation({ cityMode: "selected", selectedCity: resolveCanonicalCityName(value) });
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

  const setTab = (next: ProviderOfferSheetTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "open") params.delete("tab");
    else params.set("tab", next);
    router.replace(`/usta/teklifler?${params.toString()}`);
  };

  const isOffersTab =
    tab === "mine" || tab === "negotiating" || tab === "done" || tab === "escrow";

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
          price: parseTlDigits(price),
          message,
        }),
      });
      const data = await readJsonResponse<{ error?: string; code?: string; usedDebt?: boolean; creditDebt?: number }>(res);
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
      setMyOffersRefresh((v) => v + 1);
      setTab("mine");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gönderilemedi");
    } finally {
      setSubmitting(false);
    }
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
      const data = await readJsonResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? "İşlem başarısız");
      await load();
      setMyOffersRefresh((v) => v + 1);
      if (action === "agree") setTab("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setSubmitting(false);
    }
  };

  const tabSummary = useMemo(() => {
    if (tab === "mine") return "Verdiğiniz teklifler ve müşteri yanıtları";
    if (tab === "negotiating") return "Karşılıklı pazarlık süren işler";
    if (tab === "escrow") return "Param Güvende ödemeli işler";
    if (tab === "done") return "Tamamlanan veya kapanan işler";
    return "Onaylı ve size uygun açık talepler; il filtresiyle arayın";
  }, [tab]);

  if (loading && quotes.length === 0) {
    return (
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
        <p className="text-muted-foreground">Panel yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href={KONTOR_URL}
        className="inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
      >
        Kontör Yükle
      </Link>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <PanelStatCard
          label="Kontör"
          value={creditBalance}
          tone="primary"
          hint={
            creditDebt > 0
              ? `Borç kredisi: ${creditDebt}`
              : escrowBalanceTl > 0
                ? `Güvence: ${escrowBalanceTl.toLocaleString("tr-TR")} ₺`
                : undefined
          }
          onClick={goBuyCredits}
        />
        <PanelStatCard
          label="Açık talepler"
          value={quotes.length}
          tone="amber"
          active={tab === "open"}
          onClick={() => setTab("open")}
        />
        <PanelStatCard
          label="Benim tekliflerim"
          value={offerTabCounts.mine}
          tone="primary"
          active={tab === "mine"}
          onClick={() => setTab("mine")}
        />
        <PanelStatCard
          label="Pazarlık"
          value={offerTabCounts.negotiating}
          tone="primary"
          active={tab === "negotiating"}
          onClick={() => setTab("negotiating")}
        />
        <PanelStatCard
          label="Param güvende"
          value={offerTabCounts.escrow}
          tone="emerald"
          active={tab === "escrow"}
          onClick={() => setTab("escrow")}
        />
        <PanelStatCard
          label="Bitmiş işler"
          value={offerTabCounts.done}
          tone="emerald"
          active={tab === "done"}
          onClick={() => setTab("done")}
        />
      </div>

      {tab === "open" && (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-3 sm:gap-3 sm:p-4">
          <label className="flex w-[130px] shrink-0 flex-col gap-1 text-xs text-muted-foreground sm:w-[150px]">
            İl
            <select
              value={citySelectValue(location)}
              onChange={(e) => onCityChange(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground"
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
          {location.cityMode !== "all" && filterCity ? (
            <label className="flex w-[130px] shrink-0 flex-col gap-1 text-xs text-muted-foreground sm:w-[150px]">
              İlçe
              <select
                value={location.selectedDistrict ?? ""}
                onChange={(e) => onDistrictChange(e.target.value)}
                className="rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground"
              >
                <option value="">Tüm ilçeler</option>
                {districtOptions.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {location.cityMode !== "provider" && providerCity ? (
            <button
              type="button"
              onClick={() => setLocation({ cityMode: "provider" })}
              className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              Profil ilime dön
            </button>
          ) : null}
        </div>
      )}

      <SheetTabs activeId={tab} onChange={() => {}} tabs={[]} hideTabBar>
        <p className="mb-4 text-sm text-muted-foreground">
          {tabSummary}
          {tab === "open" && !refreshing && locationSummary(location, providerCity) ? (
            <span className="ml-1">· {locationSummary(location, providerCity)}</span>
          ) : null}
          {tab === "open" && refreshing ? (
            <span className="ml-1">· Güncelleniyor…</span>
          ) : null}
        </p>

        <div className="space-y-4">

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

      {borcActivatedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <p className="text-lg font-semibold text-foreground">Borç krediniz tanımlandı</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {MAX_CREDIT_DEBT} kontör kullanıma açıldı. Hemen teklif verebilirsiniz; kontör satın alırken
              borç krediniz de tahsil edilir.
            </p>
            <button
              type="button"
              onClick={() => setBorcActivatedNotice(false)}
              className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Hemen Kullan
            </button>
          </div>
        </div>
      )}

          {pendingCustomerAgreement && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Bir müşteri sizinle anlaşmayı onayladı.{" "}
              <button
                type="button"
                onClick={() => setTab("mine")}
                className="font-semibold underline"
              >
                Benim Tekliflerim
              </button>{" "}
              kartından onaylayın.
            </p>
          )}

          {tab === "open" && (
            <BorcKredisiActivateCard
              creditBalance={creditBalance}
              creditDebt={creditDebt}
              borcKredisiAktif={borcKredisiAktif}
              onActivated={(data) => {
                setCreditBalance(data.creditBalance ?? 0);
                setCreditDebt(data.creditDebt ?? 0);
                setBorcKredisiAktif(Boolean(data.borcKredisiAktif));
                setBorcActivatedNotice(true);
              }}
            />
          )}

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

          {creditBalance <= LAUNCH_CAMPAIGN.provider.freeCredits && creditBalance > 0 && (
            <p className="text-xs text-muted-foreground">Hediye kontörlerinizi kullanıyorsunuz.</p>
          )}

          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          {tab === "open" && borcKredisiPending && creditDebt === 0 && !canActivateDebt && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="font-semibold">Borç krediniz aktif</p>
              <p className="mt-1 text-xs text-amber-900/90">
                Teklif verirken borç kredisi kullanabilirsiniz (en fazla {MAX_CREDIT_DEBT} kontör).
              </p>
            </div>
          )}
            {isOffersTab ? (
              <UstaMyOffersPanel
                mode={
                  tab === "done"
                    ? "done"
                    : tab === "negotiating"
                      ? "negotiating"
                      : tab === "escrow"
                        ? "escrow"
                        : "mine"
                }
                onNegotiate={negotiate}
                submitting={submitting}
                refreshToken={myOffersRefresh}
                onCounts={setOfferTabCounts}
                onPendingAgreement={setPendingCustomerAgreement}
              />
            ) : (
              <>
      {quotes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-muted-foreground">
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
        <>
          <div className="space-y-3 md:hidden">
            {paginatedQuotes.map((quote) => (
              <div key={quote.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
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
                      {quote.district ? `, ${quote.district}` : ""} · {quote.offerCount ?? 0} teklif
                    </p>
                  </div>
                </div>
                {quote.notes && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{quote.notes}</p>
                )}
                <div className="mt-3">
                  {activeId === quote.id ? (
                    <div className="space-y-2">
                      <CurrencyInput
                        digits={price}
                        onDigitsChange={setPrice}
                        className="w-full"
                        disabled={submitting}
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
                          className="flex-1 rounded-lg bg-primary py-2 text-xs font-semibold text-white"
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
                      className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                        !canOffer ? "bg-amber-600 hover:bg-amber-700" : "bg-primary hover:bg-primary-dark"
                      }`}
                    >
                      {!canOffer ? "Kontör Al" : "Hemen Teklif Ver"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
            <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-[18%] px-4 py-3">Hizmet</th>
                <th className="w-[14%] whitespace-nowrap px-4 py-3">Konum</th>
                <th className="px-4 py-3">Talep notu</th>
                <th className="w-[9rem] whitespace-nowrap px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuotes.map((quote) => (
                <Fragment key={quote.id}>
                  <tr className="border-t border-border align-top hover:bg-accent/10">
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
                    <td className="min-w-0 px-4 py-3 text-muted-foreground">
                      <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                        {quote.notes || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {activeId !== quote.id && (
                        <button
                          type="button"
                          onClick={() => startOffer(quote.id)}
                          disabled={pendingCustomerAgreement}
                          className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                            !canOffer
                              ? "bg-amber-600 hover:bg-amber-700"
                              : "bg-primary hover:bg-primary-dark"
                          }`}
                        >
                          {!canOffer ? "Kontör Al" : "Hemen Teklif Ver"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {activeId === quote.id && (
                    <tr className="border-t border-primary/15 bg-primary/5">
                      <td colSpan={4} className="px-4 py-4">
                        <div className="mx-auto max-w-xl space-y-3">
                          <p className="text-sm font-semibold text-foreground">
                            Teklifiniz — {quote.serviceName}
                          </p>
                          {quote.notes && (
                            <p className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Talep notu: </span>
                              <span className="break-words whitespace-pre-wrap">{quote.notes}</span>
                            </p>
                          )}
                      <CurrencyInput
                        digits={price}
                        onDigitsChange={setPrice}
                        className="w-full bg-card"
                        disabled={submitting}
                      />
                          <textarea
                            placeholder="Teklif açıklamanız (min. 5 karakter)"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() => submitOffer(quote.id)}
                              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                              Gönder
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveId(null)}
                              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold"
                            >
                              Vazgeç
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {openQuotesPageCount > 1 && (
          <nav
            className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-4"
            aria-label="Açık talepler sayfaları"
          >
            <button
              type="button"
              disabled={safeOpenQuotesPage <= 1}
              onClick={() => setOpenQuotesPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              ← Önceki
            </button>
            {getOpenQuotesPageNumbers(safeOpenQuotesPage, openQuotesPageCount).map((pageNum, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev !== undefined && pageNum - prev > 1;
              return (
                <span key={pageNum} className="flex items-center gap-2">
                  {showEllipsis && <span className="px-1 text-muted-foreground">…</span>}
                  <button
                    type="button"
                    onClick={() => setOpenQuotesPage(pageNum)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      pageNum === safeOpenQuotesPage
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
              disabled={safeOpenQuotesPage >= openQuotesPageCount}
              onClick={() => setOpenQuotesPage((p) => Math.min(openQuotesPageCount, p + 1))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Sonraki →
            </button>
            <p className="w-full text-center text-xs text-muted-foreground">
              {(safeOpenQuotesPage - 1) * OPEN_QUOTES_PAGE_SIZE + 1}–
              {Math.min(safeOpenQuotesPage * OPEN_QUOTES_PAGE_SIZE, quotes.length)} / {quotes.length}{" "}
              talep · {OPEN_QUOTES_PAGE_SIZE} kayıt / sayfa
            </p>
          </nav>
        )}
        </>
      )}
              </>
            )}
        </div>
      </SheetTabs>
    </div>
  );
}
