import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
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
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Tekliflerim
          </Link>
          <Link
            href="/usta/giris"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Usta Girişi
          </Link>
          <Link
            href="/usta-ol"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Usta Ol
          </Link>
          <Link
            href="/hakkimizda"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Hakkımızda
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/hizmetler"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Teklif Al
          </Link>
        </div>
      </div>
    </header>
  );
}
