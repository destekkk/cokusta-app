"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import PanelTabLinesLabel from "@/components/panel/PanelTabLinesLabel";
import PanelLogoutButton from "@/components/panel/PanelLogoutButton";
import {
  isAppPanelPath,
  isCustomerPanelPath,
  isUstaPanelPath,
  normalizePathname,
  shouldShowUstaGuestLinks,
} from "@/lib/panel-paths";
import {
  panelTabBarRowClassName,
  panelTabBarTrackClassName,
  panelTabButtonClassName,
} from "@/lib/panel-tab-button";

type NavLink = {
  href: string;
  label: string;
  lines?: [string, string];
  redBorder?: boolean;
};

const navLinks: NavLink[] = [
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/nasil-calisir", label: "Nasıl Çalışır?" },
  { href: "/cok-acil", label: "Çok Acil" },
  {
    href: "/musteri/teklifler",
    label: "Benim Tekliflerim",
    lines: ["Benim", "Tekliflerim"],
    redBorder: true,
  },
];

function isNavLinkActive(pathname: string, href: string) {
  if (href === "/musteri/teklifler") {
    return pathname === href || pathname.startsWith("/musteri/teklif") || pathname.startsWith("/tekliflerim");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinkContent({ link, active }: { link: NavLink; active?: boolean }) {
  if (link.lines) {
    return <PanelTabLinesLabel lines={link.lines} active={active} />;
  }
  return <span>{link.label}</span>;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = normalizePathname(usePathname());
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const appPanelOpen = isAppPanelPath(pathname);
  const ustaPanelOpen = isUstaPanelPath(pathname);
  const customerPanelOpen = isCustomerPanelPath(pathname);
  const showUstaGuestLinks = mounted && shouldShowUstaGuestLinks(pathname);

  const ustaLogout = async () => {
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
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-6">
        <Logo />

        <nav className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          {!appPanelOpen && (
            <div className={`${panelTabBarTrackClassName} max-w-full`}>
              <div className={`${panelTabBarRowClassName} items-center`}>
                {navLinks.map((link) => {
                  const active = isNavLinkActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={[
                        panelTabButtonClassName({ active, redBorder: link.redBorder }, "header"),
                        link.lines ? "flex-col gap-0.5" : "",
                      ].join(" ")}
                    >
                      <NavLinkContent link={link} active={active} />
                    </Link>
                  );
                })}
                <Link
                  href="/hizmetler"
                  className={`cta-pulse ${panelTabButtonClassName({ active: true }, "header")}`}
                >
                  Hemen Teklif Al
                </Link>
              </div>
            </div>
          )}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
          {ustaPanelOpen && (
            <PanelLogoutButton variant="light" onClick={ustaLogout} disabled={loggingOut} />
          )}
          {showUstaGuestLinks && (
            <>
              <Link
                href="/usta/giris"
                className="inline-flex rounded-md border border-border px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:px-3 sm:py-2 sm:text-sm"
              >
                <span className="sm:hidden">Giriş</span>
                <span className="hidden sm:inline">Usta Girişi</span>
              </Link>
              <Link
                href="/usta-ol"
                className="inline-flex rounded-md border-2 border-primary/30 bg-primary/5 px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 sm:px-3 sm:py-2 sm:text-sm"
              >
                Usta Ol
              </Link>
            </>
          )}

          {(!appPanelOpen || ustaPanelOpen) && !customerPanelOpen && (
            <button
              type="button"
              className="inline-flex rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted md:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {open && (!appPanelOpen || ustaPanelOpen) && !customerPanelOpen && (
        <nav className="border-t border-border px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            {!appPanelOpen && (
              <div className={panelTabBarTrackClassName}>
                <div className={`${panelTabBarRowClassName} flex-wrap`}>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={[
                        panelTabButtonClassName(
                          { active: isNavLinkActive(pathname, link.href), redBorder: link.redBorder },
                          "header"
                        ),
                        link.lines ? "flex-col gap-0.5" : "",
                      ].join(" ")}
                    >
                      <NavLinkContent
                        link={link}
                        active={isNavLinkActive(pathname, link.href)}
                      />
                    </Link>
                  ))}
                  <Link
                    href="/hizmetler"
                    onClick={() => setOpen(false)}
                    className={`cta-pulse ${panelTabButtonClassName({ active: true }, "header")}`}
                  >
                    Hemen Teklif Al
                  </Link>
                </div>
              </div>
            )}
            {ustaPanelOpen && (
              <div className="mt-2 px-3">
                <PanelLogoutButton
                  variant="light"
                  onClick={() => {
                    setOpen(false);
                    void ustaLogout();
                  }}
                  disabled={loggingOut}
                  label="Çıkış Yap"
                />
              </div>
            )}
            {showUstaGuestLinks && (
              <>
                <Link
                  href="/usta/giris"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Usta Girişi
                </Link>
                <Link
                  href="/usta-ol"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-primary hover:bg-muted"
                >
                  Usta Ol
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
