"use client";

import Link from "next/link";
import { Suspense } from "react";
import PanelNav, { type PanelNavItem } from "@/components/panel/PanelNav";
import PanelStatCard from "@/components/panel/PanelStatCard";

const NAV_ITEMS: PanelNavItem[] = [
  { href: "/usta/teklifler", label: "Teklifler" },
  { href: "/usta/kontor", label: "Kontör" },
  { href: "/usta/odeme-talep", label: "Ödeme Talebi" },
  { href: "/usta/uygulama", label: "Uygulama" },
];

type Props = {
  title?: string;
  subtitle?: string;
  creditBalance?: number;
  creditDebt?: number;
  escrowBalanceTl?: number;
  showStats?: boolean;
};

export default function ProviderPanelHeader({
  title = "Usta Paneli",
  subtitle = "Açık taleplere teklif verin, pazarlık yapın ve kazancınızı yönetin.",
  creditBalance,
  creditDebt = 0,
  escrowBalanceTl = 0,
  showStats = false,
}: Props) {
  return (
    <div className="space-y-0">
      <div className="-mx-4 border-b border-white/10 bg-secondary px-4 py-3 text-white sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-bold tracking-tight">Usta Paneli</span>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="hidden text-sm text-white/60 hover:text-white sm:inline"
            >
              Siteye dön
            </Link>
            <Link
              href="/usta/kontor"
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/15"
            >
              Kontör Yükle
            </Link>
          </div>
        </div>
        <Suspense fallback={null}>
          <div className="mt-3 overflow-x-auto pb-1">
            <PanelNav items={NAV_ITEMS} ariaLabel="Usta paneli menüsü" variant="dark" />
          </div>
        </Suspense>
      </div>

      <div className="space-y-5 border-b border-border pb-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {showStats && creditBalance !== undefined && (
          <div className="grid gap-3 sm:grid-cols-3">
            <PanelStatCard label="Kontör" value={creditBalance} tone="primary" />
            {creditDebt > 0 && (
              <PanelStatCard
                label="Borç kredisi"
                value={`${creditDebt}`}
                hint="Teklif verirken kullanılan borç"
                tone="amber"
              />
            )}
            {escrowBalanceTl > 0 && (
              <PanelStatCard
                label="Güvence bakiyesi"
                value={`${escrowBalanceTl.toLocaleString("tr-TR")} ₺`}
                tone="emerald"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
