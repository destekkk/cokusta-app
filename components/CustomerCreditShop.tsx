"use client";

import Link from "next/link";
import { useState } from "react";
import {
  creditPackages,
  formatCreditPrice,
  getBadgeLabel,
} from "@/lib/credit-packages";
import { COKUSTA_CREDIT_PRICE } from "@/lib/pricing";
import IyzicoCheckoutModal from "@/components/IyzicoCheckoutModal";
import PaymentBadges from "@/components/PaymentBadges";

type Props = {
  initialBalance: number;
  iyzicoConfigured: boolean;
};

export default function CustomerCreditShop({ initialBalance, iyzicoConfigured }: Props) {
  const [balance, setBalance] = useState(initialBalance);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selected = creditPackages.find((p) => p.slug === selectedSlug);

  const refreshBalance = () => {
    fetch("/api/musteri/kontor/bakiye")
      .then((r) => r.json())
      .then((d) => setBalance(d.creditBalance ?? balance))
      .catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Kontör bakiyeniz</p>
        <p className="text-3xl font-bold text-primary">{balance} kontör</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ustaya kontör ile ödeme yapabilirsiniz. 1 kontör = {formatCreditPrice(COKUSTA_CREDIT_PRICE)}
        </p>
      </div>

      {!iyzicoConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Ödeme sistemi şu an yapılandırılmamış.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {creditPackages.filter((p) => p.credits >= 5).map((pkg) => (
          <button
            key={pkg.slug}
            type="button"
            disabled={!iyzicoConfigured}
            onClick={() => setSelectedSlug(pkg.slug)}
            className="rounded-xl border border-border bg-card p-5 text-left transition hover:border-primary/40 disabled:opacity-60"
          >
            {pkg.badge && (
              <span className="text-xs font-semibold uppercase text-primary">
                {getBadgeLabel(pkg.badge)}
              </span>
            )}
            <p className="mt-1 font-semibold text-foreground">{pkg.name}</p>
            <p className="mt-1 text-2xl font-bold text-secondary">
              {formatCreditPrice(pkg.price)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{pkg.description}</p>
          </button>
        ))}
      </div>

      <PaymentBadges />

      <p className="text-sm text-muted-foreground">
        Usta seçtikten sonra teklif tutarı kadar kontör ile ödeme yapabilirsiniz.{" "}
        <Link href="/musteri/teklifler" className="font-medium text-primary hover:underline">
          Tekliflerime git →
        </Link>
      </p>

      {selected && (
        <IyzicoCheckoutModal
          packageSlug={selected.slug}
          packageName={selected.name}
          price={selected.price}
          credits={selected.credits}
          creditDebt={0}
          checkoutApiUrl="/api/musteri/kontor/odeme-baslat"
          onClose={() => {
            setSelectedSlug(null);
            refreshBalance();
          }}
        />
      )}
    </div>
  );
}
