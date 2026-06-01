"use client";

import { useEffect, useRef, useState } from "react";
import PaymentBadges from "@/components/PaymentBadges";
import { computeCheckoutTotal, computeDebtSettlementAmount } from "@/lib/credit-debt";

type Props = {
  packageSlug: string;
  packageName: string;
  price: number;
  credits: number;
  creditDebt?: number;
  onClose: () => void;
};

export default function IyzicoCheckoutModal({
  packageSlug,
  packageName,
  price,
  credits,
  creditDebt = 0,
  onClose,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const checkout = computeCheckoutTotal(price, creditDebt);
  const hasDebt = checkout.debtCredits > 0;

  useEffect(() => {
    if (hasDebt && !confirmed) return;

    let cancelled = false;

    async function start() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/usta/kontor/odeme-baslat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageSlug }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Ödeme başlatılamadı");
        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = data.checkoutFormContent ?? "";
        const scripts = containerRef.current.querySelectorAll("script");
        scripts.forEach((oldScript) => {
          const script = document.createElement("script");
          for (const attr of oldScript.attributes) {
            script.setAttribute(attr.name, attr.value);
          }
          script.textContent = oldScript.textContent;
          oldScript.replaceWith(script);
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Ödeme başlatılamadı");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    start();
    return () => {
      cancelled = true;
    };
  }, [packageSlug, confirmed, hasDebt]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{packageName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {credits} kontör · {checkout.totalAmount.toLocaleString("tr-TR")} ₺
            </p>
            {hasDebt && (
              <p className="mt-1 text-xs text-amber-700">
                Paket {price.toLocaleString("tr-TR")} ₺ + borç kredisi{" "}
                {checkout.debtAmount.toLocaleString("tr-TR")} ₺
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {hasDebt && !confirmed && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Borç kredisi tahsilatı</p>
            <p className="mt-2">
              {checkout.debtCredits} kontörlük borç krediniz (
              {computeDebtSettlementAmount(checkout.debtCredits).toLocaleString("tr-TR")} ₺) bu
              ödemeye dahil edilecek ve tahsil edilecektir.
            </p>
            <p className="mt-2 font-medium">
              Toplam ödenecek tutar: {checkout.totalAmount.toLocaleString("tr-TR")} ₺
            </p>
            <button
              type="button"
              onClick={() => setConfirmed(true)}
              className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Anladım, ödemeye devam et
            </button>
          </div>
        )}

        {(confirmed || !hasDebt) && (
          <>
            <div className="mt-4">
              <PaymentBadges />
            </div>

            {loading && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                iyzico ödeme formu yükleniyor…
              </p>
            )}
            {error && (
              <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}
            <div ref={containerRef} className="mt-4 min-h-[200px]" id="iyzipay-checkout-form" />
          </>
        )}
      </div>
    </div>
  );
}
