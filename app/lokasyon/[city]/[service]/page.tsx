import Link from "next/link";
import { notFound } from "next/navigation";
import SeoLandingLayout from "@/components/seo/SeoLandingLayout";
import { getCategoryName } from "@/lib/data/categories";
import { formatPrice } from "@/lib/data/services";
import { buildLocalFaqs, buildLocalIntro } from "@/lib/seo/content";
import { buildLocalMetadata } from "@/lib/seo/metadata";
import {
  findCityBySlug,
  findServiceBySlug,
  getTopCityServiceParams,
  getDistricts,
  toSlug,
} from "@/lib/seo/slugs";

type Props = { params: Promise<{ city: string; service: string }> };

export async function generateStaticParams() {
  return getTopCityServiceParams();
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateMetadata({ params }: Props) {
  const { city: citySlug, service: serviceSlug } = await params;
  const city = findCityBySlug(citySlug);
  const service = findServiceBySlug(serviceSlug);
  if (!city || !service) return {};
  return buildLocalMetadata({
    city,
    service,
    path: `/lokasyon/${citySlug}/${serviceSlug}`,
  });
}

export default async function CityServiceSeoPage({ params }: Props) {
  const { city: citySlug, service: serviceSlug } = await params;
  const city = findCityBySlug(citySlug);
  const service = findServiceBySlug(serviceSlug);
  if (!city || !service) notFound();

  const districts = getDistricts(city);
  const faqs = buildLocalFaqs(city, service);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${city} ${service.name}`,
    description: service.longDescription,
    areaServed: { "@type": "City", name: city },
    provider: { "@type": "Organization", name: "Çokusta" },
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
        title={`${city} ${service.name}`}
        intro={buildLocalIntro(city, service)}
        breadcrumbs={[
          { label: city, href: `/lokasyon/${citySlug}` },
          { label: service.name },
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
          <h2 className="text-lg font-semibold text-foreground">Hizmet Detayı</h2>
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
              {city} — İlçe Bazlı {service.name}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {districts.map((district) => (
                <Link
                  key={district}
                  href={`/lokasyon/${citySlug}/ilce/${toSlug(district)}/${service.slug}`}
                  className="border border-border bg-muted/50 px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary"
                >
                  {district} {service.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </SeoLandingLayout>
    </>
  );
}
