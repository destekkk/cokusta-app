"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProviderRegistration } from "@/lib/types";

type Props = {
  providerId: string;
  status: ProviderRegistration["status"];
  compact?: boolean;
  redirectTo?: string;
  /** Liste satırını anında güncellemek için (onay/red sonrası) */
  onActionComplete?: (providerId: string, nextStatus: "approved" | "rejected") => void;
};

export default function ProviderActions({
  providerId,
  status,
  compact = false,
  redirectTo,
  onActionComplete,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  if (status !== "pending") {
    return null;
  }

  const updateStatus = async (nextStatus: "approved" | "rejected", reason?: string) => {
    setLoading(nextStatus);
    try {
      const res = await fetch(`/api/admin/usta/${providerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          rejectionReason: nextStatus === "rejected" ? reason : undefined,
        }),
      });
      if (!res.ok) throw new Error("İşlem başarısız");
      setShowRejectForm(false);
      setRejectionReason("");
      onActionComplete?.(providerId, nextStatus);
      if (redirectTo) {
        router.push(redirectTo);
      } else if (nextStatus === "rejected") {
        router.push("/sltn/ustalar#reddedilmis-ustalar");
      } else if (!onActionComplete) {
        router.refresh();
      }
    } catch {
      alert("Güncelleme başarısız oldu.");
    } finally {
      setLoading(null);
    }
  };

  if (compact) {
    if (showRejectForm) {
      return (
        <div className="flex min-w-[220px] flex-col gap-2">
          <input
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Red nedeni (opsiyonel)"
            className="rounded border border-border px-2 py-1 text-xs"
          />
          <div className="flex gap-1">
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => updateStatus("rejected", rejectionReason)}
              className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
            >
              Reddet
            </button>
            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              className="rounded border border-border px-2 py-1 text-xs"
            >
              İptal
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-1">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => updateStatus("approved")}
          className="rounded bg-primary px-2.5 py-1 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {loading === "approved" ? "..." : "Onayla"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => setShowRejectForm(true)}
          className="rounded border border-border px-2.5 py-1 text-xs hover:bg-accent disabled:opacity-60"
        >
          Reddet
        </button>
      </div>
    );
  }

  if (showRejectForm) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          Red nedeni (isteğe bağlı)
        </label>
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={3}
          placeholder="Örn: Telefon numarası geçersiz, eksik bilgi..."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => updateStatus("rejected", rejectionReason)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading === "rejected" ? "Reddediliyor..." : "Reddi Onayla"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowRejectForm(false);
              setRejectionReason("");
            }}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
          >
            Vazgeç
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => updateStatus("approved")}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {loading === "approved" ? "Onaylanıyor..." : "Onayla"}
      </button>
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => setShowRejectForm(true)}
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-60"
      >
        Reddet
      </button>
    </div>
  );
}
