"use client";

import { useCallback, useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { companyInfo } from "@/lib/data/company";

type Package = {
  slug: string;
  name: string;
  credits: number;
  formattedPrice: string;
  description: string;
  perCredit: number;
  savingsPercent: number;
  badge: string | null;
};

type Props = {
  accessToken: string;
  orderId?: string;
  embedded?: boolean;
};

export default function UstaMobilKontorPanel({ accessToken, orderId, embedded = false }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditDebt, setCreditDebt] = useState(0);
  const [debtSettlementFormatted, setDebtSettlementFormatted] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mobile/usta/kontor", { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Yüklenemedi");
      setCreditBalance(data.creditBalance ?? 0);
      setCreditDebt(data.creditDebt ?? 0);
      setDebtSettlementFormatted(data.debtSettlementFormatted ?? null);
      setPackages(data.packages ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const startCheckout = async (slug: string) => {
    setCheckingOut(slug);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/mobile/usta/kontor/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({ packageSlug: slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ödeme başlatılamadı");

      const checkoutUrl = data.checkoutUrl ?? data.paymentUrl ?? data.url;
      if (data.mode === "lemon" && checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      const whatsapp = `https://wa.me/${companyInfo.whatsapp}?text=${encodeURIComponent(
        `Merhaba, mobil uygulamadan kontör ödemesi yapmak istiyorum. Sipariş: ${data.orderId}, Paket: ${data.packageName}, Tutar: ${data.amount} ₺`
      )}`;

      setMessage(
        `Sipariş oluşturuldu (${data.packageName}). Online kart ödemesi için destek ekibimiz size yardımcı olacak; sipariş no: ${data.orderId}`
      );
      window.open(whatsapp, "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem başarısız");
    } finally {
      setCheckingOut(null);
    }
  };

  return (
    <div className={embedded ? "min-h-full bg-muted/20" : "min-h-screen bg-muted/20"}>
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-3">
          <Logo size="md" href="/" />
          <div className="text-center">
            <h1 className="text-lg font-bold text-foreground">Kontör & Ödeme</h1>
            <p className="mt-1 text-sm text-muted-foreground">Güvenli ödeme — Çokusta</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {orderId ? (
          <p className="mb-4 rounded-lg bg-primary/10 px-3 py-2 text-center text-xs text-primary">
            Sipariş: {orderId}
          </p>
        ) : null}

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Mevcut bakiye</p>
          <p className="text-3xl font-bold text-primary">{creditBalance} kontör</p>
          {creditDebt > 0 && debtSettlementFormatted ? (
            <p className="mt-2 text-sm text-amber-700">
              Borç kredisi: {creditDebt} kontör (+{debtSettlementFormatted} tahsil edilir)
            </p>
          ) : null}
        </div>

        {loading ? (
          <p className="mt-8 text-center text-muted-foreground">Paketler yükleniyor…</p>
        ) : error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : (
          <div className="mt-6 space-y-3">
            {packages.map((pkg) => (
              <article
                key={pkg.slug}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <h2 className="font-bold">{pkg.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>
                <p className="mt-3 text-2xl font-bold text-foreground">{pkg.formattedPrice}</p>
                <p className="text-xs text-muted-foreground">
                  Kontör başı {pkg.perCredit} ₺
                  {pkg.savingsPercent > 0 ? ` · %${pkg.savingsPercent} tasarruf` : ""}
                </p>
                <button
                  type="button"
                  disabled={!!checkingOut}
                  onClick={() => void startCheckout(pkg.slug)}
                  className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                >
                  {checkingOut === pkg.slug ? "Hazırlanıyor…" : "Ödeme Yap"}
                </button>
              </article>
            ))}
          </div>
        )}

        {message ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {message}
          </p>
        ) : null}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          {companyInfo.email} · {companyInfo.phone}
        </p>
      </main>
    </div>
  );
}
