"use client";

import { useState } from "react";
import type { ProviderOffer, QuoteRequest } from "@/lib/types";
import {
  canCustomerInitiateProviderCall,
  shouldRevealProviderContactToCustomer,
} from "@/lib/negotiation-access";

type Props = {
  quoteId: string;
  quoteStatus: QuoteRequest["status"];
  offer: ProviderOffer;
  compact?: boolean;
  onContactRecorded: (offer: ProviderOffer) => void;
};

export default function CustomerProviderCallButton({
  quoteId,
  quoteStatus,
  offer,
  compact = false,
  onContactRecorded,
}: Props) {
  const wrap = compact ? "mt-2 rounded-md border px-2.5 py-2 text-xs" : "mt-3 rounded-lg border px-4 py-3 text-sm";
  const btn = compact
    ? "mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
    : "mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!canCustomerInitiateProviderCall({ status: quoteStatus }, offer)) {
    return null;
  }

  const revealed = shouldRevealProviderContactToCustomer(offer);
  const phone = offer.providerPhone;

  const initiate = async () => {
    if (revealed && phone) {
      window.location.href = `tel:${phone.replace(/\s/g, "")}`;
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/musteri/teklif/${quoteId}/usta-ara`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: offer.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İşlem başarısız");
      const updated = data.offer as ProviderOffer;
      onContactRecorded(updated);
      const dial = updated.providerPhone;
      if (dial) {
        window.location.href = `tel:${dial.replace(/\s/g, "")}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  };

  if (revealed && phone) {
    return (
      <div className={`${wrap} border-green-200 bg-green-50 text-green-900`}>
        <p className="font-semibold">{offer.providerName ?? "Usta"}</p>
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="font-medium underline">
          {phone}
        </a>
        <button type="button" disabled={loading} onClick={initiate} className={`${btn} bg-emerald-600`}>
          Tekrar ara
        </button>
        {error && <p className="mt-1 text-[10px] text-red-700">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`${wrap} border-primary/25 bg-primary/5 text-foreground`}>
      {!compact && (
        <p>Anlaşma sağlandı. Usta telefonunu görmek için butona basın.</p>
      )}
      <button type="button" disabled={loading} onClick={initiate} className={btn}>
        {loading ? "Hazırlanıyor…" : "Ustayı ara"}
      </button>
      {error && <p className="mt-1 text-[10px] text-red-700">{error}</p>}
    </div>
  );
}
