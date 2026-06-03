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
  onContactRecorded: (offer: ProviderOffer) => void;
};

export default function CustomerProviderCallButton({
  quoteId,
  quoteStatus,
  offer,
  onContactRecorded,
}: Props) {
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
      <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
        <p className="font-semibold">Usta iletişim</p>
        <p className="mt-1">
          {offer.providerName ?? "Usta"} ·{" "}
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="underline font-medium">
            {phone}
          </a>
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={initiate}
          className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Tekrar ara
        </button>
        {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
      <p className="text-foreground">
        Anlaşma sağlandı. Usta telefonunu görmek ve aramak için aşağıdaki butona basın.
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={initiate}
        className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Hazırlanıyor…" : "Ustayı ara"}
      </button>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
