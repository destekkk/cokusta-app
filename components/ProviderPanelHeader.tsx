"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import PanelNav, { type PanelNavItem } from "@/components/panel/PanelNav";
import PanelStatCard from "@/components/panel/PanelStatCard";
import PanelLogoutButton from "@/components/panel/PanelLogoutButton";

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
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/usta/cikis", { method: "POST" });
      router.push("/usta/giris");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="space-y-0">
      <div className="-mx-4 border-b border-white/10 bg-secondary px-4 py-3 text-white sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight">Usta Paneli</span>
            {escrowBalanceTl > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                Param Güvende
              </span>
            )}
          </div>
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
            <PanelLogoutButton onClick={logout} disabled={loggingOut} />
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
