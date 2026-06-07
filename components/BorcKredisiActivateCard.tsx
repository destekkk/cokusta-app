"use client";

import { useState } from "react";
import { formatCreditPrice } from "@/lib/credit-packages";
import {
  MAX_CREDIT_DEBT,
  canActivateBorcKredisi,
  computeDebtSettlementAmount,
} from "@/lib/credit-debt";
import { readJsonResponse } from "@/lib/safe-fetch";

type ActivatedPayload = {
  creditBalance?: number;
  creditDebt?: number;
  borcKredisiAktif?: boolean;
};

type Props = {
  creditBalance: number;
  creditDebt: number;
  borcKredisiAktif: boolean;
  onActivated: (data: ActivatedPayload) => void;
  className?: string;
};

/** Kontör bitince isteğe bağlı borç kredisi — usta onayı ile tanımlanır */
export default function BorcKredisiActivateCard({
  creditBalance,
  creditDebt,
  borcKredisiAktif,
  onActivated,
  className = "",
}: Props) {
  const canActivate = canActivateBorcKredisi(creditBalance, creditDebt, borcKredisiAktif);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");

  if (!canActivate) return null;

  const debtSettlement = formatCreditPrice(computeDebtSettlementAmount(MAX_CREDIT_DEBT));

  const confirmActivate = async () => {
    if (activating) return;
    setActivating(true);
    setError("");
    try {
      const res = await fetch("/api/usta/borc-kredisi/aktif-et", { method: "POST" });
      const data = await readJsonResponse<ActivatedPayload & { error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? "Borç kredisi açılamadı");
      setConfirmOpen(false);
      onActivated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Borç kredisi açılamadı");
    } finally {
      setActivating(false);
    }
  };

  return (
    <>
      <div
        className={`rounded-xl border-2 border-amber-400 bg-amber-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4 ${className}`}
      >
        <div>
          <p className="text-sm font-semibold text-amber-950">Kontörünüz bitti</p>
          <p className="mt-1 text-sm text-amber-900/90">
            İsterseniz en fazla {MAX_CREDIT_DEBT} kontör borç kredisi tanımlayabilirsiniz. Kullanmak
            tamamen sizin tercihinizdir; kontör alırken borç paket ücretine eklenir.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError("");
            setConfirmOpen(true);
          }}
          className="mt-3 w-full shrink-0 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 sm:mt-0 sm:w-auto"
        >
          Borçlanma kredisi talep et
        </button>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <p className="text-lg font-semibold text-foreground">Borçlanma kredisi onayı</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Hesabınıza <strong>{MAX_CREDIT_DEBT} kontör</strong> borç kredisi tanımlanacak. Bu
              kontörlerle hemen teklif verebilirsiniz. Kontör paketi satın alırken borç tutarı (
              <strong>{debtSettlement}</strong>) paket fiyatına eklenerek tahsil edilir.
            </p>
            <ul className="mt-3 list-inside list-disc text-sm text-muted-foreground">
              <li>İsteğe bağlıdır; her teklifte ayrıca onayınız istenir</li>
              <li>En fazla {MAX_CREDIT_DEBT} teklif hakkı (her teklif 1 kontör)</li>
              <li>Kontör satın alırken borç tutarı paket fiyatına eklenerek tahsil edilir</li>
            </ul>
            {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => void confirmActivate()}
                disabled={activating}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-70"
              >
                {activating ? "Tanımlanıyor…" : `Evet, ${MAX_CREDIT_DEBT} kontör tanımla`}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={activating}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-muted/50"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
