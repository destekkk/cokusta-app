import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cities } from "@/lib/data/cities";
import { services } from "@/lib/data/services";
import { buildLocalMetadata } from "@/lib/seo/metadata";
import { TOP_CITIES, toSlug } from "@/lib/seo/slugs";

export const metadata = buildLocalMetadata({
  city: "Türkiye",
  path: "/lokasyon",
});

const POPULAR_SEARCHES = [
  { city: "Sakarya", district: "Arifiye", service: "elektrik-tesisati", label: "Arifiye elektrikçi" },
  { city: "Sakarya", district: "Arifiye", service: "boya-badana", label: "Arifiye boyacı" },
  { city: "Sakarya", service: "elektrik-tesisati", label: "Sakarya elektrikçi" },
  { city: "Sakarya", service: "evden-eve-nakliyat", label: "Sakarya nakliyeci" },
  { city: "İstanbul", district: "Esenler", service: "boya-badana", label: "Esenler boyacı" },
  { city: "İstanbul", district: "Esenler", service: "elektrik-tesisati", label: "Esenler elektrikçi" },
  { city: "İstanbul", district: "Kadıköy", service: "ev-temizligi", label: "Kadıköy temizlik" },
  { city: "İstanbul", service: "evden-eve-nakliyat", label: "İstanbul nakliyeci" },
  { city: "Ankara", district: "Çankaya", service: "elektrik-tesisati", label: "Çankaya elektrikçi" },
  { city: "Ankara", service: "elektrik-tesisati", label: "Ankara elektrikçi" },
  { city: "İzmir", district: "Karşıyaka", service: "boya-badana", label: "Karşıyaka boyacı" },
  { city: "İzmir", service: "boya-badana", label: "İzmir boyacı" },
  { city: "Kocaeli", district: "Gebze", service: "evden-eve-nakliyat", label: "Gebze nakliye" },
  { city: "Kocaeli", service: "evden-eve-nakliyat", label: "Kocaeli nakliye" },
  { city: "Bursa", service: "su-tesisati", label: "Bursa tesisatçı" },
  { city: "Antalya", service: "klima-montaj", label: "Antalya klima servisi" },
  { city: "Adana", service: "boya-badana", label: "Adana boyacı" },
  { city: "Gaziantep", service: "ev-komple-tadilat", label: "Gaziantep tadilat" },
  { city: "Trabzon", service: "ev-temizligi", label: "Trabzon temizlik" },
  { city: "Denizli", service: "fayans-seramik", label: "Denizli fayans ustası" },
];

export default function LokasyonHubPage() {
  const popularServices = services.filter((s) => s.popular);

  return (
    <div className="min-h-full bg-background">
      <Header />
      <div className="border-b border-border bg-secondary px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            Türkiye Geneli Usta ve Hizmet Rehberi
          </h1>
          <p className="mt-4 max-w-3xl text-white/75">
            81 il, ilçe ve mahalle bazında boyacı, elektrikçi, nakliyeci, tesisatçı ve tüm ustalar.
            Şehrinizi seçin, ücretsiz teklif alın.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section>
          <h2 className="text-xl font-semibold">Popüler Aramalar</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((item) => {
              const citySlug = toSlug(item.city);
              const href = item.district
                ? `/lokasyon/${citySlug}/ilce/${toSlug(item.district)}/${item.service}`
                : `/lokasyon/${citySlug}/${item.service === "elektrik-tesisati" ? "elektrikci" : item.service === "boya-badana" ? "boyaci" : item.service === "evden-eve-nakliyat" ? "nakliye" : item.service}`;
              return (
                <Link
                  key={item.label}
                  href={href}
                  className="border border-border bg-card px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary"
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Popüler Hizmetler</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {popularServices.map((service) => (
              <Link
                key={service.slug}
                href={`/hizmet/${service.slug}`}
                className="border border-border bg-card px-4 py-3 text-sm hover:border-primary/40 hover:text-primary"
              >
                {service.name} ustası ara
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Büyük Şehirler</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {TOP_CITIES.map((city) => (
              <Link
                key={city}
                href={`/lokasyon/${toSlug(city)}`}
                className="border border-border bg-muted/50 px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary"
              >
                {city} usta
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Tüm İller ({cities.length})</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {cities.map((city) => (
              <Link
                key={city}
                href={`/lokasyon/${toSlug(city)}`}
                className="border border-border bg-card px-3 py-2 text-sm hover:border-primary/40 hover:text-primary"
              >
                {city}
              </Link>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
