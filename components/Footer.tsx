import Link from "next/link";
import Logo from "./Logo";
import PaymentBadges from "./PaymentBadges";
import { TOP_CITIES, toSlug } from "@/lib/seo/slugs";

const legalLinks = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/ssl-sertifikasi", label: "SSL Sertifikası" },
  { href: "/teslimat-ve-iade", label: "Teslimat ve İade Şartları" },
  { href: "/gizlilik-sozlesmesi", label: "Gizlilik Sözleşmesi" },
  { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış Sözleşmesi" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary px-4 py-12 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="dark" size="sm" />
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Profesyonel hizmet pazaryeri. Doğrulanmış ustalar, şeffaf süreç, güvenli ödeme.
            </p>
            <PaymentBadges className="mt-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90">
              Hizmetler
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              <li><Link href="/kategori/tadilat" className="transition-colors hover:text-white">Tadilat</Link></li>
              <li><Link href="/kategori/nakliyat" className="transition-colors hover:text-white">Nakliyat</Link></li>
              <li><Link href="/kategori/temizlik" className="transition-colors hover:text-white">Temizlik</Link></li>
              <li><Link href="/kategori/elektrik" className="transition-colors hover:text-white">Elektrik</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90">
              Kurumsal
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              <li><Link href="/nasil-calisir" className="transition-colors hover:text-white">Nasıl Çalışır?</Link></li>
              <li><Link href="/usta-ol" className="transition-colors hover:text-white">Usta Ol</Link></li>
              <li><Link href="/hizmetler" className="transition-colors hover:text-white">Tüm Hizmetler</Link></li>
              <li><Link href="/hakkimizda" className="transition-colors hover:text-white">Hakkımızda</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90">
              Yasal
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              {legalLinks.slice(1).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-8">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90">
            Popüler Şehirler
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {TOP_CITIES.map((city) => (
              <Link
                key={city}
                href={`/lokasyon/${toSlug(city)}`}
                className="border border-white/15 px-2.5 py-1 text-xs text-white/65 transition hover:border-white/30 hover:text-white"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-white/45">© 2026 Çokusta. Tüm hakları saklıdır.</p>
          <p className="text-xs text-white/40">
            Ödemeler iyzico güvenli ödeme altyapısı ile alınmaktadır.
          </p>
        </div>
      </div>
    </footer>
  );
}
