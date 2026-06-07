"use client";

import { COKUSTA_CREDIT_PRICE } from "@/lib/pricing";
import { MAX_CREDIT_DEBT } from "@/lib/credit-debt";

type Props = {
  open: boolean;
  creditDebt: number;
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Teklif gönderirken borç kredisi kullanılacaksa ustayı bilgilendirir */
export default function BorcKredisiOfferConfirmDialog({
  open,
  creditDebt,
  confirming = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  const remaining = MAX_CREDIT_DEBT - creditDebt;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
        <p className="text-lg font-semibold text-foreground">Borç kredisi kullanılsın mı?</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Kontör bakiyeniz kalmadı. Bu teklif için <strong>1 kontörlük borç kredisi</strong>{" "}
          kullanılacak ({COKUSTA_CREDIT_PRICE} ₺ değerinde). Borç, kontör paketi satın alırken paket
          ücretine eklenerek tahsil edilir.
        </p>
        <p className="mt-3 text-sm text-amber-800">
          Kalan borç kredisi hakkınız: <strong>{remaining}</strong> / {MAX_CREDIT_DEBT} kontör
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-70"
          >
            {confirming ? "Gönderiliyor…" : "Evet, borç kredisi ile gönder"}
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
