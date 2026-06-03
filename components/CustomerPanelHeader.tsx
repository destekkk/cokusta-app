"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PanelLogoutButton from "@/components/panel/PanelLogoutButton";

type Props = {
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
};

export default function CustomerPanelHeader({
  title = "Taleplerim",
  subtitle = "Usta tekliflerini takip edin ve pazarlık yapın.",
  backHref,
  backLabel = "← Tüm taleplerim",
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
      <div className="-mx-4 border-b border-white/10 bg-secondary px-4 py-3 text-white sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {backHref ? (
            <Link href={backHref} className="text-sm font-medium text-white/90 hover:text-white hover:underline">
              {backLabel}
            </Link>
          ) : (
            <span className="text-sm font-bold tracking-tight">Müşteri Paneli</span>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {!backHref && (
              <Link href="/" className="hidden text-sm text-white/60 hover:text-white sm:inline">
                Siteye dön
              </Link>
            )}
            <Link
              href="/usta-ol"
              className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/15"
            >
              Usta Ol
            </Link>
            <PanelLogoutButton onClick={logout} disabled={loggingOut} />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-b border-border pb-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
