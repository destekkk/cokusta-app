"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OfferNegotiationPanel from "@/components/OfferNegotiationPanel";
import JobEscrowCheckoutModal from "@/components/JobEscrowCheckoutModal";
import QuoteLocationEditor from "@/components/QuoteLocationEditor";
import ParamGuvendePaymentOption from "@/components/ParamGuvendePaymentOption";
import ParamGuvendePitch from "@/components/ParamGuvendePitch";
import type { CustomerJobEscrowOrder, ProviderOffer } from "@/lib/types";
import { getCurrentOfferPrice, getOfferLastActivityAt, sortOffersByLatestActivity } from "@/lib/offer-utils";
import { computeParamGuvendeBreakdown } from "@/lib/param-guvende";

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
  const [contacts, setContacts] = useState<{
    customer: { name: string; phone: string; email: string };
    provider: { name: string; phone: string; email: string };
  } | null>(null);
  const [escrow, setEscrow] = useState<CustomerJobEscrowOrder | null>(null);
  const [quoteCity, setQuoteCity] = useState("");
  const [quoteDistrict, setQuoteDistrict] = useState("");
  const [selectedPayOfferId, setSelectedPayOfferId] = useState<string | null>(null);
  const [checkoutOfferId, setCheckoutOfferId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

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
    setQuoteCity(data.quote?.city ?? "");
    setQuoteDistrict(data.quote?.district ?? "");
    setContacts(data.contacts ?? null);
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

  const renderEscrowStatus = (offer: ProviderOffer) => {
    if (!escrow || escrow.offerId !== offer.id || !escrowPaid) return null;

    if (escrowReleased) {
      return (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          ✓ {escrow.jobAmount.toLocaleString("tr-TR")} ₺ iş bedeli ustaya aktarıldı
        </div>
      );
    }

    return (
      <div className="mt-3 space-y-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <p>
          ✓ Param Güvende ile {escrow.totalAmount.toLocaleString("tr-TR")} ₺ ödendi (
          {escrow.jobAmount.toLocaleString("tr-TR")} ₺ iş + {escrow.serviceFee.toLocaleString("tr-TR")}{" "}
          ₺ hizmet bedeli). Tutar havuzda güvende.
        </p>
        {(quoteStatus === "accepted" || quoteStatus === "open") && (
          <button
            type="button"
            disabled={loading}
            onClick={releasePayment}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            İş bitti — ödemeyi yolla
          </button>
        )}
      </div>
    );
  };

  const renderPaymentOptions = (offer: ProviderOffer) => {
    if (!offer.customerAgreedAt) return null;
    if (escrowPaid && escrow?.offerId === offer.id) {
      return renderEscrowStatus(offer);
    }
    if (escrowPaid) return null;

    const breakdown = computeParamGuvendeBreakdown(getCurrentOfferPrice(offer));

    return (
      <ParamGuvendePaymentOption
        offerId={offer.id}
        providerName={offer.providerName ?? "Usta"}
        breakdown={breakdown}
        selected={selectedPayOfferId === offer.id}
        disabled={loading}
        onSelect={setSelectedPayOfferId}
      />
    );
  };

  if (!ready) {
    return <p className="text-muted-foreground">Yükleniyor…</p>;
  }

  const checkoutOffer = offers.find((o) => o.id === checkoutOfferId);
  const checkoutBreakdown = checkoutOffer
    ? computeParamGuvendeBreakdown(getCurrentOfferPrice(checkoutOffer))
    : null;
  const sortedOffers = sortOffersByLatestActivity(offers);
  const latestOfferId = sortedOffers[0]?.id;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        <strong>{serviceName}</strong> — usta tekliflerini görüntüleyin, karşı teklif verin veya anlaştık deyin.
        Anlaştıktan sonra hizmet bedeli dökümünü görüp Param Güvende ile ödeyebilirsiniz.
      </p>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {(quoteStatus === "open" || quoteStatus === "awaiting_review") && (
        <QuoteLocationEditor
          key={`${quoteCity}-${quoteDistrict}`}
          quoteId={quoteId}
          city={quoteCity}
          district={quoteDistrict}
          editable
          onUpdated={(city, district) => {
            setQuoteCity(city);
            setQuoteDistrict(district);
          }}
        />
      )}

      {quoteStatus === "accepted" && contacts && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 space-y-3">
          <p className="font-semibold text-green-900">Anlaşma sağlandı — iletişim bilgileri açıldı</p>
          <p className="text-sm text-green-800">
            <strong>Usta:</strong> {contacts.provider.name} ·{" "}
            <a href={`tel:${contacts.provider.phone}`} className="underline">
              {contacts.provider.phone}
            </a>
          </p>
          {escrowHeld && escrow && (
            <div className="space-y-3 rounded-lg bg-white/80 px-4 py-3 text-sm text-green-900">
              <p>
                Param Güvende: {escrow.totalAmount.toLocaleString("tr-TR")} ₺ ödendi,{" "}
                {escrow.jobAmount.toLocaleString("tr-TR")} ₺ havuzda bekliyor.
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
            <p className="rounded-lg bg-white/80 px-4 py-3 text-sm text-green-900">
              ✓ {escrow.jobAmount.toLocaleString("tr-TR")} ₺ ustaya aktarıldı
            </p>
          )}
        </div>
      )}

      {quoteStatus === "awaiting_review" && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Talebiniz admin onayı bekliyor. Onaylandıktan sonra ustalar teklif verebilecek.
        </p>
      )}

      {quoteStatus === "open" && offers.length === 0 && (
        <p className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          Henüz usta teklifi gelmedi.
        </p>
      )}

      {quoteStatus === "open" && offers.length > 0 && (
        <>
          <div className="space-y-4">
            {sortedOffers.map((offer) => {
              const isLatest = offer.id === latestOfferId && sortedOffers.length > 1;
              return (
                <article
                  key={offer.id}
                  className={`rounded-xl border bg-card p-4 sm:p-5 ${
                    isLatest ? "border-primary/40 ring-1 ring-primary/15" : "border-border"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-foreground">
                          {offer.providerName ?? "Usta"}
                        </p>
                        {isLatest && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                            En güncel usta teklifi
                          </span>
                        )}
                      </div>
                      {offer.providerCity && (
                        <p className="mt-1 text-sm text-muted-foreground">{offer.providerCity}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Güncel fiyat</p>
                      <p className="text-xl font-bold text-primary">
                        {getCurrentOfferPrice(offer).toLocaleString("tr-TR")} ₺
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Son güncelleme:{" "}
                        {new Date(getOfferLastActivityAt(offer)).toLocaleString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <OfferNegotiationPanel
                      offer={offer}
                      role="customer"
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
                    {renderPaymentOptions(offer)}
                  </div>
                </article>
              );
            })}
          </div>

          {payableOffers.length > 0 && !escrowPaid && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4">
              <div>
                <p className="text-sm font-semibold">Ödeme yöntemi seçin</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Yukarıdan bir ustanın Param Güvende seçeneğini işaretleyin, ardından ödeme ekranına geçin.
                </p>
              </div>
              <ParamGuvendePitch />
              <button
                type="button"
                disabled={loading || !selectedPayOfferId}
                onClick={() => selectedPayOfferId && setCheckoutOfferId(selectedPayOfferId)}
                className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Ödeme ekranına geç
              </button>
            </div>
          )}
        </>
      )}

      {checkoutOfferId && checkoutOffer && checkoutBreakdown && (
        <JobEscrowCheckoutModal
          quoteId={quoteId}
          offerId={checkoutOfferId}
          serviceName={serviceName}
          breakdown={checkoutBreakdown}
          onClose={() => {
            setCheckoutOfferId(null);
            loadOffers().catch(() => {});
          }}
        />
      )}
    </div>
  );
}
