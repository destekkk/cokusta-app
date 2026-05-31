"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  creditPackages,
  formatCreditPrice,
  getBadgeLabel,
} from "@/lib/credit-packages";
import { COKUSTA_CREDIT_PRICE, ARmut_CREDIT_PRICE } from "@/lib/pricing";
import { LAUNCH_CAMPAIGN } from "@/lib/campaigns";
import IyzicoCheckoutModal from "@/components/IyzicoCheckoutModal";
import PaymentBadges from "@/components/PaymentBadges";

type Props = {
  initialBalance: number;
  iyzicoConfigured: boolean;
};

export default function UstaCreditShop({ initialBalance, iyzicoConfigured }: Props) {
  const searchParams = useSearchParams();
  const noCredit = searchParams.get("reason") === "no-credit";
  const [balance, setBalance] = useState(initialBalance);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selected = creditPackages.find((p) => p.slug === selectedSlug);

  const bulkPackages = creditPackages.filter((p) => p.credits > 1);
  const singlePackage = creditPackages.find((p) => p.slug === "kontor-tek");

  return (
    <div className="space-y-6">
      {noCredit && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Kontörünüz bitti.</strong> Teklif vermek için aşağıdan paket satın alın; ödeme
          sonrası bakiye anında yüklenir.
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Mevcut bakiye</p>
            <p className="text-3xl font-bold text-primary">{balance} kontör</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>Kayıt onayında hediye: {LAUNCH_CAMPAIGN.provider.freeCredits} kontör</p>
            <p className="mt-1">Her teklif = 1 kontör</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <p className="font-semibold text-primary">Armut fiyatının yarısı</p>
        <p className="mt-1 text-muted-foreground">
          Referans: Armut teklif başı ~{ARmut_CREDIT_PRICE} ₺ · Çokusta tek kontör{" "}
          {COKUSTA_CREDIT_PRICE} ₺. Toplu paketlerde ek indirim.
        </p>
        <div className="mt-3">
          <PaymentBadges variant="light" />
        </div>
      </div>

      {!iyzicoConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Ödeme sistemi yapılandırılmamış. <code className="text-xs">IYZICO_API_KEY</code> tanımlayın.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bulkPackages.map((pkg) => {
          const badge = getBadgeLabel(pkg.badge);
          return (
            <article
              key={pkg.slug}
              className={`relative rounded-xl border p-5 transition ${
                pkg.badge === "popular"
                  ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {badge && (
                <span
                  className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    pkg.badge === "popular"
                      ? "bg-primary text-white"
                      : pkg.badge === "best-value"
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-foreground"
                  }`}
                >
                  {badge}
                </span>
              )}
              <h2 className="text-lg font-bold">{pkg.name}</h2>
              <p className="mt-1 min-h-[40px] text-sm text-muted-foreground">{pkg.description}</p>
              <p className="mt-4 text-2xl font-bold">
                {formatCreditPrice(pkg.price)}
                <span className="ml-2 text-sm font-normal line-through text-muted-foreground">
                  {formatCreditPrice(pkg.armutPrice)}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Kontör başı {pkg.perCredit} ₺
                {pkg.savingsPercent > 0 && (
                  <span className="ml-1 font-medium text-emerald-700">
                    · %{pkg.savingsPercent} tasarruf
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground line-through opacity-70">
                Armut: ~{pkg.armutPerCredit} ₺/kontör
              </p>
              <button
                type="button"
                disabled={!iyzicoConfigured}
                onClick={() => setSelectedSlug(pkg.slug)}
                className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                Satın Al
              </button>
            </article>
          );
        })}
      </div>

      {singlePackage && (
        <article className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-bold">{singlePackage.name}</h2>
              <p className="text-sm text-muted-foreground">{singlePackage.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{formatCreditPrice(singlePackage.price)}</p>
              <p className="text-xs text-muted-foreground line-through">
                Armut ~{formatCreditPrice(singlePackage.armutPrice)}
              </p>
            </div>
            <button
              type="button"
              disabled={!iyzicoConfigured}
              onClick={() => setSelectedSlug(singlePackage.slug)}
              className="rounded-xl border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"
            >
              Tek Kontör Al
            </button>
          </div>
        </article>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/usta/teklifler"
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent"
        >
          ← Açık Taleplere Dön
        </Link>
      </div>

      {selected && (
        <IyzicoCheckoutModal
          packageSlug={selected.slug}
          packageName={selected.name}
          price={selected.price}
          credits={selected.credits}
          armutPrice={selected.armutPrice}
          onClose={() => {
            setSelectedSlug(null);
            fetch("/api/usta/talepler")
              .then((r) => r.json())
              .then((d) => setBalance(d.creditBalance ?? balance))
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
}
