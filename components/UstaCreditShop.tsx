"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  creditPackages,
  formatCreditPrice,
  getBadgeLabel,
  platformShopPackages,
} from "@/lib/credit-packages";
import { COKUSTA_CREDIT_PRICE } from "@/lib/pricing";
import { LAUNCH_CAMPAIGN, isProviderSignupBonusActive } from "@/lib/campaigns";
import {
  computeCheckoutTotal,
  computeDebtSettlementAmount,
  MAX_CREDIT_DEBT,
} from "@/lib/credit-debt";
import BorcKredisiActivateCard from "@/components/BorcKredisiActivateCard";
import OnlinePaymentsNotice from "@/components/OnlinePaymentsNotice";

type Props = {
  initialBalance: number;
  initialCreditDebt: number;
  borcKredisiAktif?: boolean;
  paymentsOnline?: boolean;
};

export default function UstaCreditShop({
  initialBalance,
  initialCreditDebt,
  borcKredisiAktif = false,
  paymentsOnline = false,
}: Props) {
  const searchParams = useSearchParams();
  const noCredit = searchParams.get("reason") === "no-credit";
  const [balance] = useState(initialBalance);
  const [creditDebt] = useState(initialCreditDebt);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  const startCheckout = async (packageSlug: string) => {
    setCheckingOut(packageSlug);
    setCheckoutError("");
    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ packageSlug, orderType: "provider_credit" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ödeme başlatılamadı");
      const url = data.checkoutUrl ?? data.url;
      if (!url) throw new Error("Ödeme adresi alınamadı.");
      window.location.href = url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Ödeme başlatılamadı");
      setCheckingOut(null);
    }
  };

  const bulkPackages = creditPackages.filter((p) => p.credits > 1);
  const singlePackage = creditPackages.find((p) => p.slug === "kontor-tek");
  const singleCheckout = singlePackage
    ? computeCheckoutTotal(singlePackage.price, creditDebt)
    : null;
  const platformPackages = platformShopPackages;

  return (
    <div className="space-y-6">
      {noCredit && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Kontörünüz bitti.</strong> Yeni kontör için aşağıdaki iletişim kanallarından bize
          ulaşın; admin panelinden hesabınıza yüklenebilir.
        </div>
      )}

      <BorcKredisiActivateCard
        creditBalance={balance}
        creditDebt={creditDebt}
        borcKredisiAktif={borcKredisiAktif}
        onActivated={() => {
          window.location.reload();
        }}
      />

      {!paymentsOnline ? <OnlinePaymentsNotice variant="usta-kontor" /> : null}

      {paymentsOnline ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Güvenli online ödeme aktif</p>
          <p className="mt-1">Paket seçin; Lemon Squeezy ödeme sayfasına yönlendirilirsiniz.</p>
        </div>
      ) : null}

      {checkoutError ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{checkoutError}</p>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Mevcut bakiye</p>
            <p className="text-3xl font-bold text-primary">{balance} kontör</p>
            {creditDebt > 0 && (
              <p className="mt-1 text-sm font-medium text-amber-700">
                Borç kredisi: {creditDebt} kontör (
                {formatCreditPrice(computeDebtSettlementAmount(creditDebt))})
              </p>
            )}
          </div>
          <div className="text-right text-xs text-muted-foreground">
            {isProviderSignupBonusActive() && (
              <p>Kayıt onayında hediye: {LAUNCH_CAMPAIGN.provider.freeCredits} kontör (kampanya)</p>
            )}
            <p className="mt-1">Borç kredisi limiti: en fazla {MAX_CREDIT_DEBT} kontör</p>
            <p className="mt-1">Her teklif = 1 kontör</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <p className="font-semibold text-primary">Güncel fiyat listesi</p>
        <p className="mt-1 text-muted-foreground">
          Tek kontör {COKUSTA_CREDIT_PRICE} ₺. Toplu paketlerde kontör başı maliyet düşer.
          {paymentsOnline
            ? " Kart ile anında satın alabilirsiniz."
            : " Satın alma işlemi destek ekibi üzerinden yapılır."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bulkPackages.map((pkg) => {
          const badge = getBadgeLabel(pkg.badge);
          const checkout = computeCheckoutTotal(pkg.price, creditDebt);
          return (
            <article
              key={pkg.slug}
              className={`relative rounded-xl border p-5 ${
                pkg.badge === "popular"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-card"
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
                {creditDebt > 0
                  ? formatCreditPrice(checkout.totalAmount)
                  : formatCreditPrice(pkg.price)}
              </p>
              {creditDebt > 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  Paket {formatCreditPrice(pkg.price)} + borç kredisi{" "}
                  {formatCreditPrice(checkout.debtAmount)}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Kontör başı {pkg.perCredit} ₺
                {pkg.savingsPercent > 0 && (
                  <span className="ml-1 font-medium text-emerald-700">
                    · %{pkg.savingsPercent} tasarruf
                  </span>
                )}
              </p>
              {paymentsOnline ? (
                <button
                  type="button"
                  disabled={!!checkingOut}
                  onClick={() => void startCheckout(pkg.slug)}
                  className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                >
                  {checkingOut === pkg.slug ? "Yönlendiriliyor…" : "Satın Al"}
                </button>
              ) : null}
            </article>
          );
        })}
      </div>

      {platformPackages.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Platform hizmetleri</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Profil öne çıkarma ve doğrulanmış rozet — satın alma için iletişime geçin.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {platformPackages.map((pkg) => (
              <article key={pkg.slug} className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-lg font-bold">{pkg.name}</h3>
                <p className="mt-1 min-h-[40px] text-sm text-muted-foreground">{pkg.description}</p>
                <p className="mt-4 text-2xl font-bold">{formatCreditPrice(pkg.price)}</p>
                {pkg.unitLabel && (
                  <p className="mt-1 text-xs text-muted-foreground">{pkg.unitLabel} abonelik</p>
                )}
                {paymentsOnline ? (
                  <button
                    type="button"
                    disabled={!!checkingOut}
                    onClick={() => void startCheckout(pkg.slug)}
                    className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                  >
                    {checkingOut === pkg.slug ? "Yönlendiriliyor…" : "Satın Al"}
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      )}

      {singlePackage && singleCheckout && (
        <article className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
          <h2 className="text-lg font-bold">{singlePackage.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{singlePackage.description}</p>
          <p className="mt-4 text-2xl font-bold">
            {creditDebt > 0
              ? formatCreditPrice(singleCheckout.totalAmount)
              : formatCreditPrice(singlePackage.price)}
          </p>
          {creditDebt > 0 && (
            <p className="mt-1 text-xs text-amber-700">
              {formatCreditPrice(singlePackage.price)} kontör +{" "}
              {formatCreditPrice(singleCheckout.debtAmount)} borç bakiyesi
            </p>
          )}
          {paymentsOnline ? (
            <button
              type="button"
              disabled={!!checkingOut}
              onClick={() => void startCheckout(singlePackage.slug)}
              className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {checkingOut === singlePackage.slug ? "Yönlendiriliyor…" : "Satın Al"}
            </button>
          ) : null}
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
    </div>
  );
}
