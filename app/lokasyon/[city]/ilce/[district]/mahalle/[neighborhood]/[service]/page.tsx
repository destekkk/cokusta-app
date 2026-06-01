import Link from "next/link";
import { notFound } from "next/navigation";
import SeoLandingLayout from "@/components/seo/SeoLandingLayout";
import { formatPrice } from "@/lib/data/services";
import { capitalizeTr, getPrimarySearchTerm } from "@/lib/seo/keywords";
import { buildLocalFaqs, buildLocalIntro } from "@/lib/seo/content";
import { buildLocalMetadata } from "@/lib/seo/metadata";
import {
  findCityBySlug,
  findDistrictBySlug,
  findNeighborhoodBySlug,
  findServiceBySlugOrAlias,
  getPrebuildNeighborhoodServiceParams,
  neighborhoodServicePath,
  resolveServiceSlug,
  toSlug,
} from "@/lib/seo/slugs";

type Props = {
  params: Promise<{ city: string; district: string; neighborhood: string; service: string }>;
};

export async function generateStaticParams() {
  return [];
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateMetadata({ params }: Props) {
  const { city: citySlug, district: districtSlug, neighborhood: nSlug, service: serviceSlug } =
    await params;
  const city = findCityBySlug(citySlug);
  const district = city ? findDistrictBySlug(city, districtSlug) : undefined;
  const neighborhood = city && district ? findNeighborhoodBySlug(city, district, nSlug) : undefined;
  const service = findServiceBySlugOrAlias(serviceSlug);
  if (!city || !district || !neighborhood || !service) return {};
  const canonicalSlug = resolveServiceSlug(serviceSlug) ?? service.slug;
  return buildLocalMetadata({
    city,
    district,
    neighborhood,
    service,
    path: `/lokasyon/${citySlug}/ilce/${districtSlug}/mahalle/${nSlug}/${serviceSlug}`,
    canonicalPath: neighborhoodServicePath(citySlug, districtSlug, nSlug, canonicalSlug),
  });
}

export default async function NeighborhoodServiceSeoPage({ params }: Props) {
  const { city: citySlug, district: districtSlug, neighborhood: nSlug, service: serviceSlug } =
    await params;
  const city = findCityBySlug(citySlug);
  const district = city ? findDistrictBySlug(city, districtSlug) : undefined;
  const neighborhood = city && district ? findNeighborhoodBySlug(city, district, nSlug) : undefined;
  const service = findServiceBySlugOrAlias(serviceSlug);
  if (!city || !district || !neighborhood || !service) notFound();

  const term = capitalizeTr(getPrimarySearchTerm(service.slug));
  const faqs = buildLocalFaqs(city, service, district, neighborhood);

  return (
    <SeoLandingLayout
      title={`${neighborhood} ${term} — ${district}, ${city}`}
      intro={buildLocalIntro(city, service, district, neighborhood)}
      breadcrumbs={[
        { label: city, href: `/lokasyon/${citySlug}` },
        { label: district, href: `/lokasyon/${citySlug}/ilce/${districtSlug}/${service.slug}` },
        { label: neighborhood },
      ]}
      ctaHref={`/teklif-al/${service.slug}?sehir=${encodeURIComponent(city)}&ilce=${encodeURIComponent(district)}`}
      faqs={faqs}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Mahalle", value: neighborhood },
          { label: "Başlangıç fiyatı", value: `${formatPrice(service.priceFrom)}'den` },
          { label: "Hizmet", value: service.name },
        ].map((stat) => (
          <div key={stat.label} className="border border-border bg-card p-4 text-center">
            <div className="text-lg font-semibold text-secondary">{stat.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
          {neighborhood} mahallesinde {term.toLowerCase()} ustası
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {neighborhood}, {district} / {city} bölgesinde {term.toLowerCase()} hizmeti almak için
          doğrulanmış ustalarımızdan ücretsiz teklif alın.
        </p>
        <Link
          href={`/lokasyon/${citySlug}/ilce/${districtSlug}/${service.slug}`}
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          ← {district} {term} sayfası
        </Link>
      </section>
    </SeoLandingLayout>
  );
}
