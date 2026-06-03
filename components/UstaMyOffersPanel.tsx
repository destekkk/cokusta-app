"use client";

import { useEffect, useState } from "react";
import OfferNegotiationPanel from "@/components/OfferNegotiationPanel";
import type { ProviderOffer } from "@/lib/types";
import { readJsonResponse } from "@/lib/safe-fetch";
import { getCurrentOfferPrice } from "@/lib/offer-utils";
import {
  countProviderOfferTabs,
  filterProviderOffersBySheetTab,
  type ProviderOfferListItem,
} from "@/lib/provider-offer-tabs";

export type UstaOffersPanelMode = "mine" | "negotiating" | "done" | "escrow";

type OfferItem = ProviderOfferListItem & {
  escrowStatus: "pending" | "completed" | "failed" | null;
  escrowReleaseStatus?: "none" | "requested" | "released" | null;
};

function statusBadge(item: OfferItem) {
  const { offer, quote } = item;
  if (offer.status === "accepted" || quote.status === "accepted") {
    if (item.escrowStatus === "completed" && item.escrowReleaseStatus === "released") {
      return (
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
          Ödeme aktarıldı
        </span>
      );
    }
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
        Anlaşıldı
      </span>
    );
  }
  if (offer.status === "rejected" || offer.status === "withdrawn") {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
        Kapalı
      </span>
    );
  }
  if (offer.customerAgreedAt && !offer.providerAgreedAt) {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
        Müşteri onayladı — sizin onayınız bekleniyor
      </span>
    );
  }
  if (item.escrowStatus === "completed" && item.escrowReleaseStatus !== "released") {
    return (
      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-900">
        Ödeme havuzda
      </span>
    );
  }
  if (item.escrowReleaseStatus === "released") {
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
        Ödeme aktarıldı
      </span>
    );
  }
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      Beklemede
    </span>
  );
}

type Props = {
  mode: UstaOffersPanelMode;
  onNegotiate: (
    offer: ProviderOffer,
    action: "agree" | "counter",
    price?: number,
    message?: string
  ) => Promise<void>;
  submitting: boolean;
  refreshToken?: number;
  onCounts?: (counts: { mine: number; negotiating: number; done: number; escrow: number }) => void;
  onPendingAgreement?: (pending: boolean) => void;
};

export default function UstaMyOffersPanel({
  mode,
  onNegotiate,
  submitting,
  refreshToken = 0,
  onCounts,
  onPendingAgreement,
}: Props) {
  const [items, setItems] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/usta/tekliflerim");
      const data = await readJsonResponse<{ error?: string; offers?: OfferItem[] }>(res);
      if (!res.ok) throw new Error(data.error ?? "Yüklenemedi");
      const all = data.offers ?? [];
      setItems(all);
      onCounts?.(countProviderOfferTabs(all));
      onPendingAgreement?.(
        all.some(
          (item) =>
            item.offer.status === "pending" &&
            item.offer.customerAgreedAt &&
            !item.offer.providerAgreedAt
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [refreshToken]);

  const visibleItems = filterProviderOffersBySheetTab(items, mode);

  if (loading) {
    return <p className="text-muted-foreground">Teklifleriniz yükleniyor…</p>;
  }

  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }

  if (visibleItems.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-muted-foreground">
        {mode === "done"
          ? "Henüz tamamlanmış veya kapanmış işiniz yok."
          : mode === "escrow"
            ? "Param Güvende ile ödenmiş veya bekleyen işiniz yok."
          : mode === "negotiating"
            ? "Karşılıklı yazışma / pazarlık süren teklifiniz yok."
            : "Bekleyen yeni teklifiniz yok. Açık talepler sekmesinden teklif gönderebilirsiniz."}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {visibleItems.map((item) => (
          <div key={item.offer.id} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{item.quote.serviceName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.quote.city}
                  {item.quote.district ? `, ${item.quote.district}` : ""}
                </p>
              </div>
              <span className="font-semibold text-primary">
                {getCurrentOfferPrice(item.offer).toLocaleString("tr-TR")} ₺
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {statusBadge(item)}
              <span className="text-xs text-muted-foreground">
                {new Date(item.offer.createdAt).toLocaleDateString("tr-TR")}
              </span>
            </div>
            {mode !== "done" &&
              mode !== "escrow" &&
              item.offer.status === "pending" &&
              item.quote.status === "open" && (
              <div className="mt-3">
                <OfferNegotiationPanel
                  offer={item.offer}
                  role="provider"
                  loading={submitting}
                  onAgree={() => onNegotiate(item.offer, "agree")}
                  onCounter={(p, m) => onNegotiate(item.offer, "counter", p, m)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="hidden min-w-0 w-full overflow-x-auto rounded-xl border border-border bg-background md:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Hizmet</th>
              <th className="whitespace-nowrap px-4 py-3">Konum</th>
              <th className="whitespace-nowrap px-4 py-3">Teklif</th>
              <th className="px-4 py-3">Durum</th>
              <th className="sticky right-0 z-[1] whitespace-nowrap bg-muted/40 px-4 py-3 text-right shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.12)]">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => (
              <tr key={item.offer.id} className="border-t border-border align-top hover:bg-accent/10">
                <td className="px-4 py-3 font-medium">{item.quote.serviceName}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {item.quote.city}
                  {item.quote.district ? `, ${item.quote.district}` : ""}
                  <br />
                  <span className="text-xs">
                    {new Date(item.offer.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-primary">
                  {getCurrentOfferPrice(item.offer).toLocaleString("tr-TR")} ₺
                </td>
                <td className="px-4 py-3">
                  {statusBadge(item)}
                </td>
                <td className="sticky right-0 z-[1] bg-background px-4 py-3 text-right shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.08)]">
                  {mode !== "done" &&
                  mode !== "escrow" &&
                  item.offer.status === "pending" &&
                  item.quote.status === "open" ? (
                    <OfferNegotiationPanel
                      offer={item.offer}
                      role="provider"
                      loading={submitting}
                      onAgree={() => onNegotiate(item.offer, "agree")}
                      onCounter={(p, m) => onNegotiate(item.offer, "counter", p, m)}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
