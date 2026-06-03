"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";
import PanelLogoutButton from "@/components/panel/PanelLogoutButton";

function isUstaPanelPath(pathname: string): boolean {
  return (
    pathname.startsWith("/usta/teklifler") ||
    pathname.startsWith("/usta/kontor") ||
    pathname.startsWith("/usta/odeme-talep")
  );
}

const ctaClassName =
  "cta-pulse rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark sm:px-5";

const navLinks = [
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/nasil-calisir", label: "Nasıl Çalışır?" },
  { href: "/cok-acil", label: "Çok Acil", className: "text-red-700 hover:text-red-800" },
  { href: "/musteri/teklifler", label: "Tekliflerim", className: "font-semibold text-primary hover:text-primary-dark" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const ustaPanelOpen = isUstaPanelPath(pathname);

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

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 md:flex lg:gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium text-muted-foreground transition-colors hover:text-foreground ${link.className ?? ""}`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/hizmetler" className={`${ctaClassName} ml-1 lg:ml-3`}>
            Hemen Teklif Al
          </Link>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
          {!ustaPanelOpen && (
            <Link
              href="/usta/giris"
              className="inline-flex rounded-md border border-border px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:px-3 sm:py-2 sm:text-sm"
            >
              <span className="sm:hidden">Giriş</span>
              <span className="hidden sm:inline">Usta Girişi</span>
            </Link>
          )}
          <Link
            href="/usta-ol"
            className="inline-flex rounded-md border-2 border-primary/30 bg-primary/5 px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 sm:px-3 sm:py-2 sm:text-sm"
          >
            Usta Ol
          </Link>
          {ustaPanelOpen && (
            <PanelLogoutButton
              variant="light"
              onClick={ustaLogout}
              disabled={loggingOut}
            />
          )}

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
        </div>
      </div>

      {open && (
        <nav className="border-t border-border px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${link.className ?? ""}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/hizmetler"
              onClick={() => setOpen(false)}
              className={`${ctaClassName} mt-2 text-center`}
            >
              Hemen Teklif Al
            </Link>
            {!ustaPanelOpen && (
              <Link
                href="/usta/giris"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Usta Girişi
              </Link>
            )}
            <Link
              href="/usta-ol"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-primary hover:bg-muted"
            >
              Usta Ol
            </Link>
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
          </div>
        </nav>
      )}
    </header>
  );
}
