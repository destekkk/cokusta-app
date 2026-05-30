"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  quoteId?: string;
  providerId?: string;
  purchaseId?: string;
  invoiceId?: string;
  compact?: boolean;
};

export default function InvoiceButton({
  quoteId,
  providerId,
  purchaseId,
  invoiceId,
  compact = false,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (invoiceId) {
    return (
      <a
        href={`/admin/fatura/${invoiceId}`}
        target="_blank"
        rel="noreferrer"
        className={
          compact
            ? "text-sm font-semibold text-primary hover:underline"
            : "rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
        }
      >
        Faturayı Gör
      </a>
    );
  }

  const issueInvoice = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/fatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId, providerId, purchaseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fatura kesilemedi");
      window.open(`/admin/fatura/${data.invoice.id}`, "_blank");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Fatura kesilemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={issueInvoice}
      className={
        compact
          ? "text-sm font-semibold text-primary hover:underline disabled:opacity-60"
          : "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      }
    >
      {loading ? "Kesiliyor..." : "Fatura Kes"}
    </button>
  );
}
