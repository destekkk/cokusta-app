import Link from "next/link";
import Logo from "./Logo";

const ctaClassName =
  "cta-pulse rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark sm:px-5";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 md:flex lg:gap-7">
          <Link
            href="/hizmetler"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Hizmetler
          </Link>
          <Link
            href="/nasil-calisir"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Nasıl Çalışır?
          </Link>
          <Link
            href="/cok-acil"
            className="text-sm font-medium text-red-700 transition-colors hover:text-red-800"
          >
            Çok Acil
          </Link>
          <Link
            href="/musteri/teklifler"
            className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            Tekliflerim
          </Link>
          <Link href="/hizmetler" className={`${ctaClassName} ml-1 lg:ml-3`}>
            Hemen Teklif Al
          </Link>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
          <Link href="/hizmetler" className={`${ctaClassName} md:hidden`}>
            Hemen Teklif Al
          </Link>
          <Link
            href="/usta/giris"
            className="hidden rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:inline-flex"
          >
            Usta Girişi
          </Link>
          <Link
            href="/usta-ol"
            className="hidden rounded-md border-2 border-primary/30 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 sm:inline-flex"
          >
            Usta Ol
          </Link>
        </div>
      </div>
    </header>
  );
}
