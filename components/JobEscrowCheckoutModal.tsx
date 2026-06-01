"use client";

import { useEffect, useRef, useState } from "react";
import PaymentBadges from "@/components/PaymentBadges";
import ParamGuvendePitch from "@/components/ParamGuvendePitch";
import type { ParamGuvendeBreakdown } from "@/lib/param-guvende";
import { formatParamGuvendeFeeSummary } from "@/lib/param-guvende";

type Props = {
  quoteId: string;
  offerId: string;
  serviceName: string;
  breakdown: ParamGuvendeBreakdown;
  onClose: () => void;
};

export default function JobEscrowCheckoutModal({
  quoteId,
  offerId,
  serviceName,
  breakdown,
  onClose,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/musteri/teklif/${quoteId}/param-guvende-baslat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offerId }),
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
  }, [quoteId, offerId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Param Güvende ile öde</h2>
            <p className="mt-1 text-sm text-muted-foreground">{serviceName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
          >
            Kapat
          </button>
        </div>

        <div className="mt-4 space-y-1 rounded-lg bg-muted/40 p-4 text-sm">
          <div className="flex justify-between">
            <span>İş bedeli</span>
            <span>{breakdown.jobAmount.toLocaleString("tr-TR")} ₺</span>
          </div>
          {breakdown.tiers.map((tier, i) => (
            <div key={i} className="flex justify-between text-muted-foreground">
              <span>Hizmet bedeli ({tier.label})</span>
              <span>{tier.fee.toLocaleString("tr-TR")} ₺</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-2 font-semibold">
            <span>Toplam</span>
            <span>{breakdown.totalAmount.toLocaleString("tr-TR")} ₺</span>
          </div>
        </div>

        <ParamGuvendePitch className="mt-4" />

        <p className="mt-3 text-xs text-muted-foreground">
          {formatParamGuvendeFeeSummary(breakdown)}
        </p>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading && !error && <p className="mt-4 text-sm text-muted-foreground">Ödeme formu yükleniyor…</p>}

        <div ref={containerRef} className="mt-4" />
        <PaymentBadges className="mt-6" />
      </div>
    </div>
  );
}
