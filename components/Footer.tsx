"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { companyInfo } from "@/lib/data/company";
import { TOP_CITIES, toSlug } from "@/lib/seo/slugs";
import { shouldShowUstaGuestLinks, normalizePathname } from "@/lib/panel-paths";

const legalLinks = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/ssl-sertifikasi", label: "SSL Sertifikası" },
  { href: "/teslimat-ve-iade", label: "Teslimat ve İade Şartları" },
  { href: "/gizlilik-sozlesmesi", label: "Gizlilik Sözleşmesi" },
  { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış Sözleşmesi" },
];

export default function Footer() {
  const showUstaGuestLinks = shouldShowUstaGuestLinks(normalizePathname(usePathname()));

  return (
    <footer className="border-t border-footer-border bg-footer px-4 py-12 text-footer-foreground sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="light" size="sm" />
            <p className="mt-3 text-sm leading-relaxed text-footer-muted">
              Profesyonel hizmet pazaryeri. Doğrulanmış ustalar, şeffaf süreç.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-footer-foreground">
              Hizmetler
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-footer-muted">
              <li><Link href="/kategori/tadilat" className="transition-colors hover:text-footer-foreground">Tadilat</Link></li>
              <li><Link href="/kategori/nakliyat" className="transition-colors hover:text-footer-foreground">Nakliyat</Link></li>
              <li><Link href="/kategori/temizlik" className="transition-colors hover:text-footer-foreground">Temizlik</Link></li>
              <li><Link href="/kategori/elektrik" className="transition-colors hover:text-footer-foreground">Elektrik</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-footer-foreground">
              Kurumsal
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-footer-muted">
              <li><Link href="/nasil-calisir" className="transition-colors hover:text-footer-foreground">Nasıl Çalışır?</Link></li>
              {showUstaGuestLinks && (
                <>
                  <li><Link href="/usta-ol" className="transition-colors hover:text-footer-foreground">Usta Ol</Link></li>
                  <li>
                    <Link href="/usta/giris" className="transition-colors hover:text-footer-foreground">
                      Usta Paneli
                    </Link>
                  </li>
                </>
              )}
              <li><Link href="/lokasyon" className="transition-colors hover:text-footer-foreground">Lokasyon Rehberi</Link></li>
              <li><Link href="/hizmetler" className="transition-colors hover:text-footer-foreground">Tüm Hizmetler</Link></li>
              <li><Link href="/hakkimizda" className="transition-colors hover:text-footer-foreground">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="transition-colors hover:text-footer-foreground">İletişim</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-footer-foreground">
              Yasal
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-footer-muted">
              {legalLinks.slice(1).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-footer-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-footer-border pt-8">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-footer-foreground">
            Popüler Aramalar
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { href: "/lokasyon/sakarya/elektrikci", label: "Sakarya elektrikçi" },
              { href: "/lokasyon/sakarya/ilce/arifiye/elektrik-tesisati", label: "Arifiye elektrikçi" },
              { href: "/lokasyon/istanbul/ilce/esenler/boyaci", label: "Esenler boyacı" },
              { href: "/lokasyon/istanbul/nakliye", label: "İstanbul nakliyeci" },
              { href: "/lokasyon/ankara/kategori/elektrik", label: "Ankara elektrik" },
              { href: "/lokasyon/izmir/boyaci", label: "İzmir boyacı" },
              { href: "/lokasyon/kocaeli/ilce/gebze", label: "Gebze ustalar" },
              { href: "/lokasyon/bursa/tesisatci", label: "Bursa tesisatçı" },
              { href: "/lokasyon/antalya/klima", label: "Antalya klima" },
              { href: "/lokasyon/adana/boyaci", label: "Adana boyacı" },
              { href: "/lokasyon/trabzon/temizlik", label: "Trabzon temizlik" },
              { href: "/lokasyon", label: "Tüm lokasyonlar →" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border border-footer-border bg-white/50 px-2.5 py-1 text-xs text-footer-muted transition hover:border-secondary/40 hover:text-footer-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-footer-border pt-8">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-footer-foreground">
            Popüler Şehirler
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {TOP_CITIES.map((city) => (
              <Link
                key={city}
                href={`/lokasyon/${toSlug(city)}`}
                className="border border-footer-border bg-white/50 px-2.5 py-1 text-xs text-footer-muted transition hover:border-secondary/40 hover:text-footer-foreground"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-footer-border pt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-footer-foreground">
                  İletişim
                </h4>
                <Link
                  href="/iletisim"
                  className="text-xs font-medium text-footer-muted transition hover:text-footer-foreground sm:hidden"
                >
                  İletişim formu →
                </Link>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-footer-muted sm:text-sm">
                <span className="font-medium text-footer-foreground">{companyInfo.legalName}</span>
                {" · "}
                {companyInfo.address}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-footer-muted sm:text-sm">
                <a href={`mailto:${companyInfo.email}`} className="hover:text-footer-foreground">
                  {companyInfo.email}
                </a>
                {" · "}
                <a href={`tel:${companyInfo.phone.replace(/\s/g, "")}`} className="hover:text-footer-foreground">
                  {companyInfo.phone}
                </a>
                {" · "}
                {companyInfo.taxOffice} V.D. {companyInfo.taxNo}
              </p>
            </div>
            <Link
              href="/iletisim"
              className="hidden shrink-0 text-sm font-medium text-footer-muted transition hover:text-footer-foreground sm:inline-flex"
            >
              İletişim formu →
            </Link>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-footer-border pt-6 sm:flex-row">
          <p className="text-sm text-footer-muted">© Çokusta. Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href="/musteri/teklifler" className="text-footer-muted transition hover:text-footer-foreground">
              Müşteri Paneli
            </Link>
            <Link href="/hakkimizda" className="text-footer-muted transition hover:text-footer-foreground">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="text-xs text-footer-muted transition hover:text-footer-foreground">
              Ödeme ve kontör: {companyInfo.email}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
