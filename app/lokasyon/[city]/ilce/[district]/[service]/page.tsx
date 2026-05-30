import Link from "next/link";
import { notFound } from "next/navigation";
import SeoLandingLayout from "@/components/seo/SeoLandingLayout";
import { formatPrice } from "@/lib/data/services";
import { buildLocalFaqs, buildLocalIntro } from "@/lib/seo/content";
import { buildLocalMetadata } from "@/lib/seo/metadata";
import {
  findCityBySlug,
  findDistrictBySlug,
  findServiceBySlug,
  getTopCityDistrictServiceParams,
  getDistricts,
  toSlug,
} from "@/lib/seo/slugs";

type Props = {
  params: Promise<{ city: string; district: string; service: string }>;
};

export async function generateStaticParams() {
  return getTopCityDistrictServiceParams();
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateMetadata({ params }: Props) {
  const { city: citySlug, district: districtSlug, service: serviceSlug } = await params;
  const city = findCityBySlug(citySlug);
  const district = city ? findDistrictBySlug(city, districtSlug) : undefined;
  const service = findServiceBySlug(serviceSlug);
  if (!city || !district || !service) return {};
  return buildLocalMetadata({
    city,
    district,
    service,
    path: `/lokasyon/${citySlug}/ilce/${districtSlug}/${serviceSlug}`,
  });
}

export default async function DistrictServiceSeoPage({ params }: Props) {
  const { city: citySlug, district: districtSlug, service: serviceSlug } = await params;
  const city = findCityBySlug(citySlug);
  const district = city ? findDistrictBySlug(city, districtSlug) : undefined;
  const service = findServiceBySlug(serviceSlug);
  if (!city || !district || !service) notFound();

  const faqs = buildLocalFaqs(city, service, district);
  const otherDistricts = getDistricts(city).filter((d) => d !== district).slice(0, 12);

  return (
    <SeoLandingLayout
      title={`${city} ${district} ${service.name}`}
      intro={buildLocalIntro(city, service, district)}
      breadcrumbs={[
        { label: city, href: `/lokasyon/${citySlug}` },
        { label: service.name, href: `/lokasyon/${citySlug}/${service.slug}` },
        { label: district },
      ]}
      ctaHref={`/teklif-al/${service.slug}?sehir=${encodeURIComponent(city)}&ilce=${encodeURIComponent(district)}`}
      faqs={faqs}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Başlangıç fiyatı", value: `${formatPrice(service.priceFrom)}'den` },
          { label: "Ortalama puan", value: `${service.rating} / 5` },
          { label: "Konum", value: `${district}, ${city}` },
        ].map((stat) => (
          <div key={stat.label} className="border border-border bg-card p-4 text-center">
            <div className="text-lg font-semibold text-secondary">{stat.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
          {district} bölgesinde {service.name.toLowerCase()}
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{service.longDescription}</p>
        <Link
          href={`/lokasyon/${citySlug}/${service.slug}`}
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          ← Tüm {city} {service.name} sayfası
        </Link>
      </section>

      {otherDistricts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">Diğer İlçeler</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {otherDistricts.map((d) => (
              <Link
                key={d}
                href={`/lokasyon/${citySlug}/ilce/${toSlug(d)}/${service.slug}`}
                className="border border-border bg-muted/50 px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary"
              >
                {d} {service.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </SeoLandingLayout>
  );
}
