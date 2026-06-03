"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import { adminLogoutAction } from "@/app/sltn/logout-action";
import type { AdminNavBadges } from "@/components/admin/admin-nav-types";

export type { AdminNavBadges } from "@/components/admin/admin-nav-types";

const links: { href: string; label: string; badgeKey?: keyof AdminNavBadges }[] = [
  { href: "/sltn/panel", label: "Dashboard" },
  { href: "/sltn/teklifler", label: "Teklifler", badgeKey: "awaitingReviewQuotes" },
  { href: "/sltn/ustalar", label: "Başvurular", badgeKey: "pendingProviders" },
  { href: "/sltn/usta-listesi", label: "Usta Listesi" },
  { href: "/sltn/musteriler", label: "Müşteriler" },
  { href: "/sltn/muhasebe", label: "Muhasebe", badgeKey: "pendingInvoices" },
  { href: "/sltn/oduller", label: "Ayın Ustası" },
];

function badgeCount(badges: AdminNavBadges, key?: keyof AdminNavBadges): number {
  if (!key) return 0;
  if (key === "pendingInvoices") return badges.pendingInvoices + badges.pendingPayouts;
  return badges[key] ?? 0;
}

function NavLink({
  href,
  label,
  badge,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  badge: number;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
        active
          ? "bg-white/15 font-semibold text-white"
          : "text-white/75 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
      {badge > 0 && (
        <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

export default function AdminNav({ badges }: { badges: AdminNavBadges }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/sltn/panel") return pathname === "/sltn/panel";
    return pathname.startsWith(href);
  };

  return (
    <header className="border-b border-border bg-secondary text-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-white/10 sm:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menü"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div className="flex items-center">
            <Logo variant="dark" size="sm" href="/sltn/panel" />
            <span className="ml-2 hidden text-sm font-normal text-white/60 sm:inline">Yönetim</span>
          </div>
        </div>

        <nav className="hidden gap-1 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              label={l.label}
              badge={badgeCount(badges, l.badgeKey)}
              active={isActive(l.href)}
            />
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="hidden text-sm text-white/60 hover:text-white sm:inline">
            Siteye dön
          </Link>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-red-400/50 bg-red-600/90 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
            >
              Çıkış
            </button>
          </form>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {links.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                label={l.label}
                badge={badgeCount(badges, l.badgeKey)}
                active={isActive(l.href)}
                onNavigate={() => setOpen(false)}
              />
            ))}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10"
            >
              Siteye dön
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
