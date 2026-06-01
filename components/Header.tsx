import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
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
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/usta/giris"
              className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              Usta Girişi
            </Link>
            <Link
              href="/usta-ol"
              className="rounded-md border-2 border-primary/30 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Usta Ol
            </Link>
          </div>
          <Link
            href="/hizmetler"
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark sm:px-5"
          >
            Hemen Teklif Al
          </Link>
        </div>
      </div>
    </header>
  );
}
