"use client";

import Link from "next/link";
import {
  creditPackages,
  formatCreditPrice,
  getBadgeLabel,
} from "@/lib/credit-packages";
import { COKUSTA_CREDIT_PRICE } from "@/lib/pricing";
import OnlinePaymentsNotice from "@/components/OnlinePaymentsNotice";

type Props = {
  initialBalance: number;
};

export default function CustomerCreditShop({ initialBalance }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Kontör bakiyeniz</p>
        <p className="text-3xl font-bold text-primary">{initialBalance} kontör</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ustaya kontör ile ödeme yapabilirsiniz. 1 kontör = {formatCreditPrice(COKUSTA_CREDIT_PRICE)}
        </p>
      </div>

      <OnlinePaymentsNotice />

      <div className="grid gap-4 sm:grid-cols-2">
        {creditPackages.filter((p) => p.credits >= 5).map((pkg) => (
          <div
            key={pkg.slug}
            className="rounded-xl border border-border bg-card p-5 text-left opacity-90"
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
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Usta seçtikten sonra teklif tutarı kadar kontör ile ödeme yapabilirsiniz.{" "}
        <Link href="/musteri/teklifler" className="font-medium text-primary hover:underline">
          Tekliflerime git →
        </Link>
      </p>
    </div>
  );
}
