"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import PanelNav, { type PanelNavItem } from "@/components/panel/PanelNav";
import PanelLogoutButton from "@/components/panel/PanelLogoutButton";

const NAV_ITEMS: PanelNavItem[] = [
  { href: "/musteri/teklifler", label: "Taleplerim" },
  { href: "/hizmetler", label: "Yeni Talep" },
];

type Props = {
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  showNewRequest?: boolean;
};

export default function CustomerPanelHeader({
  title = "Müşteri Paneli",
  subtitle = "Usta tekliflerini takip edin, anlaşın ve Param Güvende ile güvenli ödeme yapın.",
  backHref,
  backLabel = "← Tüm taleplerim",
  showNewRequest = true,
}: Props) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/musteri/cikis", { method: "POST" });
      router.push("/musteri/giris");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="space-y-0">
      {!backHref && (
        <div className="-mx-4 border-b border-white/10 bg-secondary px-4 py-3 text-white sm:-mx-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight">Müşteri Paneli</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                Param Güvende
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/" className="hidden text-sm text-white/60 hover:text-white sm:inline">
                Siteye dön
              </Link>
              {showNewRequest && (
                <Link
                  href="/hizmetler"
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/15"
                >
                  Yeni Talep
                </Link>
              )}
              <PanelLogoutButton onClick={logout} disabled={loggingOut} />
            </div>
          </div>
          <Suspense fallback={null}>
            <div className="mt-3 overflow-x-auto pb-1">
              <PanelNav items={NAV_ITEMS} ariaLabel="Müşteri paneli menüsü" variant="dark" />
            </div>
          </Suspense>
        </div>
      )}

      <div className="space-y-4 border-b border-border pb-6 pt-6">
        {backHref && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href={backHref} className="text-sm font-medium text-primary hover:underline">
              {backLabel}
            </Link>
            <PanelLogoutButton onClick={logout} disabled={loggingOut} label="Çıkış Yap" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
