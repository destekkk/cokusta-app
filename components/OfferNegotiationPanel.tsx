"use client";

import { useState } from "react";
import type { ProviderOffer } from "@/lib/types";
import { getCurrentOfferPrice } from "@/lib/offer-utils";

type Props = {
  offer: ProviderOffer;
  role: "customer" | "provider";
  loading?: boolean;
  paymentLocked?: boolean;
  onCounter: (price: number, message: string) => void;
  onAgree: () => void;
  onWithdraw?: () => void;
};

export default function OfferNegotiationPanel({
  offer,
  role,
  loading = false,
  paymentLocked = false,
  onCounter,
  onAgree,
  onWithdraw,
}: Props) {
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [showCounter, setShowCounter] = useState(false);
  const currentPrice = getCurrentOfferPrice(offer);

  const customerAgreed = !!offer.customerAgreedAt;
  const providerAgreed = !!offer.providerAgreedAt;
  const canCounter = offer.status === "pending" && !customerAgreed;
  const canWithdraw =
    role === "customer" &&
    customerAgreed &&
    !providerAgreed &&
    !paymentLocked &&
    !!onWithdraw;

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-muted/40 p-3 text-sm">
        <p className="font-semibold text-foreground">Güncel teklif: {currentPrice.toLocaleString("tr-TR")} ₺</p>
        {(offer.negotiation ?? []).map((entry, i) => (
          <div key={i} className="mt-2 border-t border-border/60 pt-2">
            <p className="text-xs font-medium text-muted-foreground">
              {entry.from === "customer" ? "Müşteri" : "Usta"} ·{" "}
              {entry.price.toLocaleString("tr-TR")} ₺ ·{" "}
              {new Date(entry.createdAt).toLocaleString("tr-TR")}
            </p>
            <p className="mt-0.5 text-foreground">{entry.message}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {customerAgreed && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
            Müşteri anlaştı ✓
          </span>
        )}
        {providerAgreed && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
            Usta anlaştı ✓
          </span>
        )}
      </div>

      {role === "provider" && offer.status === "pending" && !customerAgreed && (
        <p className="text-xs text-muted-foreground">
          Müşteri &quot;Anlaştık&quot; dedikten sonra siz de onaylayabilirsiniz.
        </p>
      )}

      {role === "provider" && offer.status === "pending" && customerAgreed && !providerAgreed && (
        <p className="text-xs text-amber-800">
          Müşteri anlaştı. Yalnızca &quot;Anlaştık&quot; ile onaylayabilirsiniz; yeni teklif verilemez.
        </p>
      )}

      {offer.status === "pending" && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={
              loading ||
              (role === "customer"
                ? customerAgreed
                : providerAgreed || !customerAgreed)
            }
            onClick={onAgree}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Anlaştık
          </button>
          {canCounter && (
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowCounter((v) => !v)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
            >
              Karşı Teklif Ver
            </button>
          )}
          {canWithdraw && (
            <button
              type="button"
              disabled={loading}
              onClick={onWithdraw}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Anlaşmaktan vazgeç
            </button>
          )}
        </div>
      )}

      {showCounter && canCounter && (
        <div className="grid gap-2 sm:grid-cols-[140px_1fr_auto]">
          <input
            type="number"
            placeholder="Tutar (₺)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Açıklama (min. 5 karakter)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              onCounter(Number(price), message);
              setShowCounter(false);
              setPrice("");
              setMessage("");
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Gönder
          </button>
        </div>
      )}
    </div>
  );
}
