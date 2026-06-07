"use client";

import { formatCreditPrice } from "@/lib/credit-packages";
import { computeCheckoutTotal } from "@/lib/credit-debt";

type Props = {
  open: boolean;
  packageName: string;
  packagePrice: number;
  creditDebt: number;
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Kontör satın alırken borç bakiyesi varsa paket + borç toplamını açıkça gösterir */
export default function KontorDebtCheckoutDialog({
  open,
  packageName,
  packagePrice,
  creditDebt,
  confirming = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open || creditDebt <= 0) return null;

  const checkout = computeCheckoutTotal(packagePrice, creditDebt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
        <p className="text-lg font-semibold text-foreground">Ödeme özeti</p>
        <p className="mt-2 text-sm text-muted-foreground">
          <strong>{packageName}</strong> satın alımında paket ücreti ile birlikte mevcut borç
          kredisi bakiyeniz de tahsil edilir.
        </p>

        <dl className="mt-4 space-y-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Paket ücreti</dt>
            <dd className="font-medium text-foreground">{formatCreditPrice(checkout.packageAmount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Borç kredisi ({checkout.debtCredits} kontör)</dt>
            <dd className="font-medium text-amber-800">{formatCreditPrice(checkout.debtAmount)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-2">
            <dt className="font-semibold text-foreground">Toplam tahsilat</dt>
            <dd className="text-lg font-bold text-primary">{formatCreditPrice(checkout.totalAmount)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Borç kredisi, kontörünüz bittiğinde sizin onayınızla kullandığınız teklif haklarıdır. Ödeme
          sonrası borç bakiyeniz sıfırlanır; satın aldığınız kontörler hesabınıza yüklenir.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-70"
          >
            {confirming ? "Yönlendiriliyor…" : "Onayla ve ödemeye geç"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-muted/50"
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );
}
