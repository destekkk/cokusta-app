"use client";

import { useEffect, useState } from "react";
import { formatCreditPrice, getShopPackage } from "@/lib/credit-packages";
import { loadLemonSqueezyScript, openLemonCheckout } from "@/lib/lemonsqueezy/lemon-script";

type Props = {
  /** Lemon mağaza buy linki — test için; üretimde API checkout tercih edilir */
  directCheckoutUrl?: string | null;
  creditDebt?: number;
  className?: string;
};

const PACKAGE_SLUG = "kontor-5";

/** 5 Kontör Paketi — Lemon Squeezy overlay ödeme */
export default function Kontor5LemonCheckout({
  directCheckoutUrl = null,
  creditDebt = 0,
  className = "",
}: Props) {
  const pkg = getShopPackage(PACKAGE_SLUG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadLemonSqueezyScript();
  }, []);

  if (!pkg) return null;

  const startCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      let checkoutUrl = directCheckoutUrl?.trim() || "";
      if (!checkoutUrl) {
        const res = await fetch("/api/payments/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ packageSlug: PACKAGE_SLUG, orderType: "provider_credit" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Ödeme başlatılamadı");
        checkoutUrl = data.checkoutUrl ?? data.url ?? "";
      }
      if (!checkoutUrl) throw new Error("Ödeme adresi alınamadı.");
      await openLemonCheckout(checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ödeme başlatılamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl border border-border bg-card p-5 ${className}`}>
      <h3 className="text-lg font-bold">{pkg.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>
      <p className="mt-4 text-2xl font-bold">{formatCreditPrice(pkg.price)}</p>
      {creditDebt > 0 ? (
        <p className="mt-1 text-xs text-amber-700">
          Borç bakiyeniz varsa ödeme özetinde paket + borç birlikte gösterilir.
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      <button
        type="button"
        disabled={loading}
        onClick={() => void startCheckout()}
        className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {loading ? "Hazırlanıyor…" : "5 Kontör Satın Al"}
      </button>
    </div>
  );
}
