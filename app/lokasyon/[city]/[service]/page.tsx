import Link from "next/link";
import { notFound } from "next/navigation";
import SeoLandingLayout from "@/components/seo/SeoLandingLayout";
import { getCategoryName } from "@/lib/data/categories";
import { formatPrice } from "@/lib/data/services";
import { capitalizeTr, getPrimarySearchTerm } from "@/lib/seo/keywords";
import { buildLocalFaqs, buildLocalIntro } from "@/lib/seo/content";
import { buildLocalMetadata } from "@/lib/seo/metadata";
import {
  cityServicePath,
  findCityBySlug,
  findServiceBySlugOrAlias,
  getPrebuildCityServiceParams,
  getDistricts,
  resolveServiceSlug,
  toSlug,
} from "@/lib/seo/slugs";

type Props = { params: Promise<{ city: string; service: string }> };

export async function generateStaticParams() {
  return getPrebuildCityServiceParams();
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateMetadata({ params }: Props) {
  const { city: citySlug, service: serviceSlug } = await params;
  const city = findCityBySlug(citySlug);
  const service = findServiceBySlugOrAlias(serviceSlug);
  if (!city || !service) return {};
  const canonicalSlug = resolveServiceSlug(serviceSlug) ?? service.slug;
  return buildLocalMetadata({
    city,
    service,
    path: `/lokasyon/${citySlug}/${serviceSlug}`,
    canonicalPath: cityServicePath(citySlug, canonicalSlug),
  });
}

export default async function CityServiceSeoPage({ params }: Props) {
  const { city: citySlug, service: serviceSlug } = await params;
  const city = findCityBySlug(citySlug);
  const service = findServiceBySlugOrAlias(serviceSlug);
  if (!city || !service) notFound();

  const canonicalSlug = service.slug;
  const term = capitalizeTr(getPrimarySearchTerm(service.slug));
  const districts = getDistricts(city);
  const faqs = buildLocalFaqs(city, service);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${city} ${term}`,
    alternateName: [`${city} ${service.name}`, `${city} usta`],
    description: service.longDescription,
    areaServed: { "@type": "City", name: city },
    provider: { "@type": "Organization", name: "Çokusta", url: "https://cokusta.com" },
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: service.priceFrom,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <SeoLandingLayout
        title={`${city} ${term} — ${service.name} Ustası`}
        intro={buildLocalIntro(city, service)}
        breadcrumbs={[
          { label: city, href: `/lokasyon/${citySlug}` },
          { label: `${term} / ${service.name}` },
        ]}
        ctaHref={`/teklif-al/${service.slug}?sehir=${encodeURIComponent(city)}`}
        faqs={faqs}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Başlangıç fiyatı", value: `${formatPrice(service.priceFrom)}'den` },
            { label: "Ortalama puan", value: `${service.rating} / 5` },
            { label: "Usta sayısı", value: `${service.providers.toLocaleString("tr-TR")}+` },
          ].map((stat) => (
            <div key={stat.label} className="border border-border bg-card p-4 text-center">
              <div className="text-lg font-semibold text-secondary">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {city} {term} hizmeti
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{service.longDescription}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Kategori:{" "}
            <Link href={`/kategori/${service.categorySlug}`} className="text-primary hover:underline">
              {getCategoryName(service.categorySlug)}
            </Link>
          </p>
        </section>

        {districts.length > 1 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-foreground">
              {city} ilçelerinde {term}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Örnek aramalar: {city} Esenler {term.toLowerCase()}, {city} Arifiye {term.toLowerCase()}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {districts.map((district) => (
                <Link
                  key={district}
                  href={`/lokasyon/${citySlug}/ilce/${toSlug(district)}/${canonicalSlug}`}
                  className="border border-border bg-muted/50 px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary"
                >
                  {district} {term}
                </Link>
              ))}
            </div>
          </section>
        )}
      </SeoLandingLayout>
    </>
  );
}
