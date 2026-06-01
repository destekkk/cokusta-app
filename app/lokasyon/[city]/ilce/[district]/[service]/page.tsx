import Link from "next/link";
import { notFound } from "next/navigation";
import SeoLandingLayout from "@/components/seo/SeoLandingLayout";
import { formatPrice } from "@/lib/data/services";
import { getNeighborhoods } from "@/lib/data/neighborhoods";
import { capitalizeTr, getPrimarySearchTerm } from "@/lib/seo/keywords";
import { buildLocalFaqs, buildLocalIntro } from "@/lib/seo/content";
import { buildLocalMetadata } from "@/lib/seo/metadata";
import {
  districtServicePath,
  findCityBySlug,
  findDistrictBySlug,
  findServiceBySlugOrAlias,
  getTopCityDistrictServiceParams,
  getDistricts,
  resolveServiceSlug,
  toSlug,
} from "@/lib/seo/slugs";

type Props = {
  params: Promise<{ city: string; district: string; service: string }>;
};

export async function generateStaticParams() {
  return [];
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateMetadata({ params }: Props) {
  const { city: citySlug, district: districtSlug, service: serviceSlug } = await params;
  const city = findCityBySlug(citySlug);
  const district = city ? findDistrictBySlug(city, districtSlug) : undefined;
  const service = findServiceBySlugOrAlias(serviceSlug);
  if (!city || !district || !service) return {};
  const canonicalSlug = resolveServiceSlug(serviceSlug) ?? service.slug;
  return buildLocalMetadata({
    city,
    district,
    service,
    path: `/lokasyon/${citySlug}/ilce/${districtSlug}/${serviceSlug}`,
    canonicalPath: districtServicePath(citySlug, districtSlug, canonicalSlug),
  });
}

export default async function DistrictServiceSeoPage({ params }: Props) {
  const { city: citySlug, district: districtSlug, service: serviceSlug } = await params;
  const city = findCityBySlug(citySlug);
  const district = city ? findDistrictBySlug(city, districtSlug) : undefined;
  const service = findServiceBySlugOrAlias(serviceSlug);
  if (!city || !district || !service) notFound();

  const term = capitalizeTr(getPrimarySearchTerm(service.slug));
  const faqs = buildLocalFaqs(city, service, district);
  const otherDistricts = getDistricts(city).filter((d) => d !== district).slice(0, 12);
  const mahalleler = getNeighborhoods(city, district);

  return (
    <SeoLandingLayout
      title={`${city} ${district} ${term} — Usta Bul`}
      intro={buildLocalIntro(city, service, district)}
      breadcrumbs={[
        { label: city, href: `/lokasyon/${citySlug}` },
        { label: district, href: `/lokasyon/${citySlug}/ilce/${districtSlug}` },
        { label: service.name, href: `/lokasyon/${citySlug}/${service.slug}` },
        { label: `${term}` },
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
          {district} {term} ustası
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{service.longDescription}</p>
        <Link
          href={`/lokasyon/${citySlug}/${service.slug}`}
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          ← Tüm {city} {term} sayfası
        </Link>
      </section>

      {mahalleler.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {district} mahallelerinde {term}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {mahalleler.map((mahalle) => (
              <Link
                key={mahalle}
                href={`/lokasyon/${citySlug}/ilce/${districtSlug}/mahalle/${toSlug(mahalle)}/${service.slug}`}
                className="border border-border bg-muted/50 px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary"
              >
                {mahalle} {term}
              </Link>
            ))}
          </div>
        </section>
      )}

      {otherDistricts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">{city} — Diğer İlçeler</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {otherDistricts.map((d) => (
              <Link
                key={d}
                href={`/lokasyon/${citySlug}/ilce/${toSlug(d)}/${service.slug}`}
                className="border border-border bg-muted/50 px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary"
              >
                {d} {term}
              </Link>
            ))}
          </div>
        </section>
      )}
    </SeoLandingLayout>
  );
}
