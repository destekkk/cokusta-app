"use client";

import { useState } from "react";
import type { ProviderOffer } from "@/lib/types";
import { getCurrentOfferPrice, sortNegotiationEntries } from "@/lib/offer-utils";

type Props = {
  offer: ProviderOffer;
  role: "customer" | "provider";
  loading?: boolean;
  paymentLocked?: boolean;
  onCounter: (price: number, message: string) => void;
  onAgree: () => void;
  onWithdraw?: () => void;
};

function formatOfferTime(value: string): string {
  return new Date(value).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function roleLabel(from: "customer" | "provider"): string {
  return from === "customer" ? "Müşteri" : "Usta";
}

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
  const [showPrevious, setShowPrevious] = useState(false);

  const sortedEntries = sortNegotiationEntries(offer.negotiation);
  const latestEntry = sortedEntries[0];
  const previousEntries = sortedEntries.slice(1);
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
      {latestEntry ? (
        <div className="rounded-xl border-2 border-primary/25 bg-primary/5 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              En son teklif
            </span>
            <span className="text-xs text-muted-foreground">
              {roleLabel(latestEntry.from)} · {formatOfferTime(latestEntry.createdAt)}
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">
            {latestEntry.price.toLocaleString("tr-TR")} ₺
          </p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground">
            {latestEntry.message}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">En son teklif</p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {currentPrice.toLocaleString("tr-TR")} ₺
          </p>
        </div>
      )}

      {previousEntries.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <button
            type="button"
            onClick={() => setShowPrevious((value) => !value)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <span>Önceki teklifler ({previousEntries.length})</span>
            <span className="text-xs">{showPrevious ? "Gizle" : "Göster"}</span>
          </button>
          {showPrevious && (
            <div className="space-y-0 border-t border-border px-4 pb-4">
              {previousEntries.map((entry, index) => (
                <div
                  key={`${entry.createdAt}-${index}`}
                  className="border-t border-border/70 pt-3 first:border-t-0 first:pt-3"
                >
                  <p className="text-xs text-muted-foreground">
                    {roleLabel(entry.from)} · {entry.price.toLocaleString("tr-TR")} ₺ ·{" "}
                    {formatOfferTime(entry.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{entry.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
