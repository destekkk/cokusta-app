"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import OfferNegotiationPanel from "@/components/OfferNegotiationPanel";
import CustomerProviderCallButton from "@/components/CustomerProviderCallButton";
import CustomerOfferReviewForm from "@/components/CustomerOfferReviewForm";
import JobEscrowCheckoutModal from "@/components/JobEscrowCheckoutModal";
import ParamGuvendePaymentOption from "@/components/ParamGuvendePaymentOption";
import ParamGuvendePitch from "@/components/ParamGuvendePitch";
import SheetTabs from "@/components/panel/SheetTabs";
import type { CustomerJobEscrowOrder, ProviderOffer, QuoteRequest } from "@/lib/types";
import { getCurrentOfferPrice, sortOffersByLatestActivity } from "@/lib/offer-utils";
import { computeParamGuvendeBreakdown } from "@/lib/param-guvende";

type DetailTab = "teklifler" | "param-guvende";

type Props = {
  quoteId: string;
  serviceName: string;
};

export default function CustomerOffersPanel({ quoteId, serviceName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offers, setOffers] = useState<ProviderOffer[]>([]);
  const [quoteStatus, setQuoteStatus] = useState("");
  const [escrow, setEscrow] = useState<CustomerJobEscrowOrder | null>(null);
  const [selectedPayOfferId, setSelectedPayOfferId] = useState<string | null>(null);
  const [checkoutOfferId, setCheckoutOfferId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>("teklifler");

  const loadOffers = async () => {
    const res = await fetch(`/api/musteri/teklif/${quoteId}/teklifler`);
    if (res.status === 401) {
      router.replace(`/musteri/giris?redirect=/tekliflerim/${quoteId}`);
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Yüklenemedi");
    setOffers(data.offers ?? []);
    setQuoteStatus(data.quote?.status ?? "");
    setEscrow(data.escrow ?? null);
    setReady(true);
  };

  useEffect(() => {
    loadOffers().catch((err) => {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    });
  }, [quoteId]);

  const negotiate = async (
    offerId: string,
    action: "agree" | "counter" | "withdraw",
    price?: number,
    message?: string
  ) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/musteri/teklif/${quoteId}/pazarlik`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, action, price, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İşlem başarısız");
      if (action === "withdraw") {
        setSelectedPayOfferId(null);
      }
      await loadOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  };

  const releasePayment = async () => {
    if (
      !confirm(
        "İş tamamlandı mı? Onayladığınızda iş bedeli ustaya aktarılacaktır. Bu işlem geri alınamaz."
      )
    ) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/musteri/teklif/${quoteId}/odeme-yolla`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İşlem başarısız");
      await loadOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  };

  const escrowPaid = escrow?.status === "completed";
  const escrowReleased = escrow?.releaseStatus === "released";
  const escrowHeld = escrowPaid && !escrowReleased;

  const payableOffers = offers.filter(
    (o) => o.customerAgreedAt && o.status === "pending" && (!escrowPaid || escrow?.offerId !== o.id)
  );

  const showParamTab = payableOffers.length > 0 || escrowPaid;

  const paramTabCount = useMemo(() => {
    if (escrowHeld) return 1;
    return payableOffers.length;
  }, [escrowHeld, payableOffers.length]);

  if (!ready) {
    return <p className="text-muted-foreground">Yükleniyor…</p>;
  }

  const checkoutOffer = offers.find((o) => o.id === checkoutOfferId);
  const checkoutBreakdown = checkoutOffer
    ? computeParamGuvendeBreakdown(getCurrentOfferPrice(checkoutOffer))
    : null;
  const sortedOffers = sortOffersByLatestActivity(offers);
  const latestOfferId = sortedOffers[0]?.id;

  const offersContent = (
    <>
      {quoteStatus === "awaiting_review" && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Talebiniz admin onayı bekliyor. Onaylandıktan sonra ustalar teklif verebilecek.
        </p>
      )}

      {quoteStatus === "open" && offers.length === 0 && (
        <p className="rounded-xl border border-border bg-muted/20 p-6 text-center text-muted-foreground">
          Henüz usta teklifi gelmedi.
        </p>
      )}

      {offers.length > 0 && (
        <div className="mx-auto flex max-w-md flex-col gap-3">
          {sortedOffers.map((offer) => {
            const isLatest = offer.id === latestOfferId && sortedOffers.length > 1;
            return (
              <article
                key={offer.id}
                className={`rounded-lg border bg-card p-3 shadow-sm ${
                  isLatest ? "border-primary/40 ring-1 ring-primary/15" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {offer.providerName ?? "Usta"}
                    </p>
                    {offer.providerCity && (
                      <p className="text-xs text-muted-foreground">{offer.providerCity}</p>
                    )}
                  </div>
                  {isLatest && (
                    <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary">
                      Güncel
                    </span>
                  )}
                </div>

                <OfferNegotiationPanel
                  offer={offer}
                  role="customer"
                  variant="compact"
                  loading={loading}
                  paymentLocked={escrowPaid && escrow?.offerId === offer.id}
                  onAgree={() => negotiate(offer.id, "agree")}
                  onCounter={(price, message) => negotiate(offer.id, "counter", price, message)}
                  onWithdraw={() => {
                    if (
                      confirm(
                        "Bu ustayla anlaşmaktan vazgeçmek istediğinize emin misiniz? Ödeme seçiminiz de iptal olur."
                      )
                    ) {
                      negotiate(offer.id, "withdraw");
                    }
                  }}
                />
                <CustomerProviderCallButton
                  compact
                  quoteId={quoteId}
                  quoteStatus={quoteStatus as QuoteRequest["status"]}
                  offer={offer}
                  onContactRecorded={(updated) => {
                    setOffers((prev) =>
                      prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
                    );
                  }}
                />
                <CustomerOfferReviewForm
                  compact
                  quoteId={quoteId}
                  offer={offer}
                  onSubmitted={(review) => {
                    setOffers((prev) =>
                      prev.map((o) =>
                        o.id === offer.id ? { ...o, customerReview: review, canReview: false } : o
                      )
                    );
                  }}
                />
              </article>
            );
          })}
        </div>
      )}
    </>
  );

  const paramContent = (
    <div className="space-y-4">
      <ParamGuvendePitch />

      {escrowHeld && escrow && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-3 text-sm text-blue-900">
          <p className="font-semibold">Ödeme havuzda</p>
          <p>
            Param Güvende ile {escrow.totalAmount.toLocaleString("tr-TR")} ₺ ödendi (
            {escrow.jobAmount.toLocaleString("tr-TR")} ₺ iş bedeli). Tutar güvende bekliyor.
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={releasePayment}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            İş bitti — ödemeyi yolla
          </button>
        </div>
      )}

      {escrowReleased && escrow && (
        <p className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          ✓ {escrow.jobAmount.toLocaleString("tr-TR")} ₺ iş bedeli ustaya aktarıldı.
        </p>
      )}

      {!escrowPaid && payableOffers.length === 0 && (
        <p className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          Güvenli ödeme için önce bir ustayla anlaşın. Anlaştıktan sonra buradan Param Güvende ile
          ödeme yapabilirsiniz.
        </p>
      )}

      {!escrowPaid && payableOffers.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            Anlaştığınız usta ve tahmini tutar aşağıda. Kart ile online ödeme geçici olarak kapalı;
            ödeme koşulları için destek ekibimizle iletişime geçin.
          </p>
          <div className="space-y-2">
            {payableOffers.map((offer) => (
              <ParamGuvendePaymentOption
                key={offer.id}
                offerId={offer.id}
                providerName={offer.providerName ?? "Usta"}
                breakdown={computeParamGuvendeBreakdown(getCurrentOfferPrice(offer))}
                selected={selectedPayOfferId === offer.id}
                disabled
                onSelect={setSelectedPayOfferId}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={loading || !selectedPayOfferId}
            onClick={() => selectedPayOfferId && setCheckoutOfferId(selectedPayOfferId)}
            className="w-full rounded-lg border border-primary bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 disabled:opacity-50 sm:w-auto"
          >
            Tutar özeti ve iletişim
          </button>
        </>
      )}
    </div>
  );

  const sheetTabs = [
    { id: "teklifler" as const, label: "Teklifler & Pazarlık", count: offers.length },
    ...(showParamTab
      ? [{ id: "param-guvende" as const, label: "Param Güvende", count: paramTabCount }]
      : []),
  ];

  return (
    <div className="space-y-4">
      <p className="mx-auto max-w-md text-center text-xs text-muted-foreground">
        Pazarlık ve güvenli ödeme için sekmeleri kullanın.
      </p>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mx-auto max-w-md">
      <SheetTabs
        activeId={detailTab}
        onChange={(id) => setDetailTab(id as DetailTab)}
        tabs={sheetTabs}
        tabPosition="bottom"
      >
        {detailTab === "param-guvende" ? paramContent : offersContent}
      </SheetTabs>
      </div>

      {checkoutOfferId && checkoutBreakdown && (
        <JobEscrowCheckoutModal
          serviceName={serviceName}
          breakdown={checkoutBreakdown}
          onClose={() => setCheckoutOfferId(null)}
        />
      )}
    </div>
  );
}
