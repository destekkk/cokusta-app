"use client";

import { useState } from "react";
import type { ProviderOffer } from "@/lib/types";
import { getCurrentOfferPrice, sortNegotiationEntries } from "@/lib/offer-utils";
import {
  canCustomerConfirmAgreement,
  canPartyCounterOffer,
  canProviderConfirmAgreement,
  isMutualNegotiationActive,
  latestNegotiationFrom,
} from "@/lib/negotiation-access";

type Props = {
  offer: ProviderOffer;
  role: "customer" | "provider";
  variant?: "default" | "compact";
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
  variant = "default",
  loading = false,
  paymentLocked = false,
  onCounter,
  onAgree,
  onWithdraw,
}: Props) {
  const compact = variant === "compact";
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
  const canCounter = canPartyCounterOffer(offer);
  const canCustomerAgree = canCustomerConfirmAgreement(offer);
  const canProviderAgree = canProviderConfirmAgreement(offer);
  const mutualActive = isMutualNegotiationActive(offer);
  const lastFrom = latestNegotiationFrom(offer);
  const canWithdraw =
    role === "customer" &&
    customerAgreed &&
    !providerAgreed &&
    !paymentLocked &&
    !!onWithdraw;

  return (
    <div className={compact ? "mt-2 space-y-2" : "space-y-3"}>
      {latestEntry ? (
        <div
          className={
            compact
              ? "rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2"
              : "rounded-xl border-2 border-primary/25 bg-primary/5 p-4"
          }
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={
                  compact
                    ? "rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-white"
                    : "rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
                }
              >
                En son teklif
              </span>
              <span className="text-[10px] text-muted-foreground sm:text-xs">
                {roleLabel(latestEntry.from)} ·{" "}
                {compact
                  ? new Date(latestEntry.createdAt).toLocaleString("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : formatOfferTime(latestEntry.createdAt)}
              </span>
            </div>
            <p className={compact ? "text-lg font-bold text-primary" : "mt-3 text-2xl font-bold text-foreground"}>
              {latestEntry.price.toLocaleString("tr-TR")} ₺
            </p>
          </div>
          <p
            className={
              compact
                ? "mt-1 line-clamp-2 text-xs text-foreground"
                : "mt-2 text-sm font-semibold leading-relaxed text-foreground"
            }
          >
            {latestEntry.message}
          </p>
        </div>
      ) : (
        <div
          className={
            compact
              ? "rounded-md border border-border bg-muted/30 px-2.5 py-2"
              : "rounded-xl border border-border bg-muted/30 p-4"
          }
        >
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            En son teklif
          </p>
          <p className={compact ? "text-lg font-bold text-primary" : "mt-2 text-2xl font-bold text-foreground"}>
            {currentPrice.toLocaleString("tr-TR")} ₺
          </p>
        </div>
      )}

      {previousEntries.length > 0 && (
        <div className={compact ? "" : "rounded-xl border border-border bg-card"}>
          <button
            type="button"
            onClick={() => setShowPrevious((value) => !value)}
            className={
              compact
                ? "text-xs font-medium text-primary hover:underline"
                : "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
            }
          >
            <span>
              Önceki teklifler ({previousEntries.length}) — {showPrevious ? "gizle" : "göster"}
            </span>
            {!compact && <span className="text-xs">{showPrevious ? "Gizle" : "Göster"}</span>}
          </button>
          {showPrevious && (
            <div
              className={
                compact ? "mt-1 space-y-1.5 border-t border-border/60 pt-1.5" : "space-y-0 border-t border-border px-4 pb-4"
              }
            >
              {previousEntries.map((entry, index) => (
                <div
                  key={`${entry.createdAt}-${index}`}
                  className={compact ? "text-[11px] text-muted-foreground" : "border-t border-border/70 pt-3 first:border-t-0 first:pt-3"}
                >
                  <p className={compact ? "" : "text-xs text-muted-foreground"}>
                    {roleLabel(entry.from)} · {entry.price.toLocaleString("tr-TR")} ₺ ·{" "}
                    {formatOfferTime(entry.createdAt)}
                  </p>
                  {!compact && <p className="mt-1 text-sm text-muted-foreground">{entry.message}</p>}
                  {compact && <span className="line-clamp-1"> · {entry.message}</span>}
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

      {role === "provider" && mutualActive && (
        <p className="text-xs text-muted-foreground">
          Karşılıklı teklif sürecindesiniz. &quot;Anlaştık&quot; butonu, müşteri önce onayladıktan sonra
          açılır.
          {lastFrom === "provider" && " Son teklif sizden; müşterinin onayı bekleniyor."}
        </p>
      )}

      {role === "provider" && offer.status === "pending" && !customerAgreed && !mutualActive && (
        <p className="text-xs text-muted-foreground">
          Müşteri &quot;Anlaştık&quot; dedikten sonra siz de onaylayabilirsiniz.
        </p>
      )}

      {role === "provider" && canProviderAgree && (
        <p className="text-xs text-amber-800">
          Müşteri anlaştı. Yalnızca &quot;Anlaştık&quot; ile onaylayın; karşı teklif verilemez. Müşteri
          sizi aradığında numaranızı görür; müşteri bilgileri size gösterilmez.
        </p>
      )}

      {role === "customer" && customerAgreed && !providerAgreed && (
        <p className={compact ? "text-[10px] text-amber-800" : "text-xs text-amber-800"}>
          Siz anlaştınız. Usta onaylayınca &quot;Ustayı ara&quot; açılır.
        </p>
      )}

      {role === "customer" && customerAgreed && providerAgreed && (
        <p className={compact ? "text-[10px] text-amber-800" : "text-xs text-amber-800"}>
          Anlaşma tamam — &quot;Ustayı ara&quot; ile ulaşın.
        </p>
      )}

      {offer.status === "pending" && (
        <div className="flex flex-wrap gap-1.5">
          {(role === "customer" ? canCustomerAgree : canProviderAgree) && (
            <button
              type="button"
              disabled={loading}
              onClick={onAgree}
              className={
                compact
                  ? "rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  : "rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              }
            >
              Anlaştık
            </button>
          )}
          {canCounter && (
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowCounter((v) => !v)}
              className={
                compact
                  ? "rounded-md border border-border px-3 py-1.5 text-xs font-semibold"
                  : "rounded-lg border border-border px-4 py-2 text-sm font-semibold"
              }
            >
              Karşı Teklif Ver
            </button>
          )}
          {canWithdraw && (
            <button
              type="button"
              disabled={loading}
              onClick={onWithdraw}
              className={
                compact
                  ? "rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                  : "rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              }
            >
              Vazgeç
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
