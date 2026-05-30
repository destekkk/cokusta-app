"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  pendingCount: number;
  currentPeriodLabel: string;
  hasDeclaration: boolean;
  latestDeclarationId?: string;
};

export default function BillingActions({
  pendingCount,
  currentPeriodLabel,
  hasDeclaration,
  latestDeclarationId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"invoices" | "declaration" | null>(null);

  const issueAllInvoices = async () => {
    if (pendingCount === 0) {
      alert("Kesilecek bekleyen fatura yok.");
      return;
    }

    setLoading("invoices");
    try {
      const res = await fetch("/api/admin/fatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Toplu fatura kesilemedi");
      alert(`${data.count} fatura kesildi.`);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Toplu fatura kesilemedi");
    } finally {
      setLoading(null);
    }
  };

  const submitDeclaration = async () => {
    setLoading("declaration");
    try {
      const res = await fetch("/api/admin/beyanname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Beyanname oluşturulamadı");
      window.open(`/admin/beyanname/${data.declaration.id}`, "_blank");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Beyanname oluşturulamadı");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <h2 className="text-lg font-bold text-foreground">Tek Tıkla Fatura Kes</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {pendingCount} adet bekleyen fatura var. Komisyon ve platform hizmet bedelleri için
          e-Arşiv fatura oluşturun.
        </p>
        <button
          type="button"
          disabled={loading !== null || pendingCount === 0}
          onClick={issueAllInvoices}
          className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {loading === "invoices"
            ? "Faturalar kesiliyor..."
            : `Tüm Bekleyen Faturaları Kes (${pendingCount})`}
        </button>
      </div>

      <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-6">
        <h2 className="text-lg font-bold text-foreground">KDV Beyannamesi</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {currentPeriodLabel} dönemi için KDV beyannamesi özeti oluşturun ve yazdırın.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading !== null}
            onClick={submitDeclaration}
            className="rounded-lg bg-secondary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary-light disabled:opacity-60"
          >
            {loading === "declaration"
              ? "Hazırlanıyor..."
              : hasDeclaration
                ? "Beyannameyi Görüntüle"
                : "Beyanname Oluştur"}
          </button>
          {hasDeclaration && latestDeclarationId && (
            <a
              href={`/admin/beyanname/${latestDeclarationId}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Yazdır / PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
