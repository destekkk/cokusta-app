"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OfferNegotiationPanel from "@/components/OfferNegotiationPanel";
import type { CustomerProviderPayment, ProviderOffer } from "@/lib/types";
import { getCurrentOfferPrice } from "@/lib/offer-utils";
import { tlToCredits } from "@/lib/credit-economy";
import { COKUSTA_CREDIT_PRICE } from "@/lib/pricing";

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
  const [acceptedOfferId, setAcceptedOfferId] = useState<string | null>(null);
  const [acceptedOfferPrice, setAcceptedOfferPrice] = useState(0);
  const [payment, setPayment] = useState<CustomerProviderPayment | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
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
    setContacts(data.contacts ?? null);
    setAcceptedOfferId(data.acceptedOfferId ?? data.acceptedOffer?.id ?? null);
    setPayment(data.payment ?? null);
    if (data.acceptedOffer?.price) setAcceptedOfferPrice(data.acceptedOffer.price);
    setReady(true);
  };

  const loadWallet = () => {
    fetch("/api/musteri/kontor/bakiye")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setWalletBalance(d.creditBalance ?? 0))
      .catch(() => {});
  };

  useEffect(() => {
    loadOffers().catch((err) => {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    });
    loadWallet();
  }, [quoteId]);

  const negotiate = async (offerId: string, action: "agree" | "counter", price?: number, message?: string) => {
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
      if (data.accepted) {
        await loadOffers();
        loadWallet();
        return;
      }
      await loadOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  };

  const payWithCredits = async () => {
    if (!acceptedOfferId) return;
    const creditsNeeded = tlToCredits(acceptedOfferPrice);
    if (
      !confirm(
        `${creditsNeeded} kontör (${(creditsNeeded * COKUSTA_CREDIT_PRICE).toLocaleString("tr-TR")} ₺) ustaya aktarılacak. Onaylıyor musunuz?`
      )
    ) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/musteri/teklif/${quoteId}/odeme`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: acceptedOfferId }),
      });
      const data = await res.json();
      if (data.code === "INSUFFICIENT_CREDITS") {
        throw new Error(`${data.error} Kontör satın alın.`);
      }
      if (!res.ok) throw new Error(data.error ?? "Ödeme yapılamadı");
      await loadOffers();
      loadWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ödeme yapılamadı");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return <p className="text-muted-foreground">Yükleniyor…</p>;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        <strong>{serviceName}</strong> — usta tekliflerini görüntüleyin, karşı teklif verin veya anlaştık deyin.
      </p>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {quoteStatus === "accepted" && contacts && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 space-y-3">
          <p className="font-semibold text-green-900">Anlaşma sağlandı — iletişim bilgileri açıldı</p>
          <p className="text-sm text-green-800">
            <strong>Usta:</strong> {contacts.provider.name} ·{" "}
            <a href={`tel:${contacts.provider.phone}`} className="underline">
              {contacts.provider.phone}
            </a>
          </p>
          {payment ? (
            <p className="rounded-lg bg-white/80 px-4 py-3 text-sm text-green-900">
              ✓ {payment.credits} kontör ustaya ödendi
            </p>
          ) : acceptedOfferId ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={payWithCredits}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                Kontör ile öde
              </button>
              <Link href="/musteri/kontor" className="rounded-lg border border-green-400 px-4 py-2 text-sm font-semibold text-green-900">
                Kontör al
              </Link>
            </div>
          ) : null}
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
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Usta</th>
                <th className="px-4 py-3">Fiyat</th>
                <th className="px-4 py-3">Pazarlık</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id} className="border-t border-border align-top">
                  <td className="px-4 py-4">
                    <p className="font-semibold">{offer.providerName ?? "Usta"}</p>
                    <p className="text-muted-foreground">{offer.providerCity}</p>
                  </td>
                  <td className="px-4 py-4 font-bold text-primary">
                    {getCurrentOfferPrice(offer).toLocaleString("tr-TR")} ₺
                  </td>
                  <td className="px-4 py-4">
                    <OfferNegotiationPanel
                      offer={offer}
                      role="customer"
                      loading={loading}
                      onAgree={() => negotiate(offer.id, "agree")}
                      onCounter={(price, message) => negotiate(offer.id, "counter", price, message)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
