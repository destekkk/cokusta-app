import Link from "next/link";
import { notFound } from "next/navigation";
import SeoLandingLayout from "@/components/seo/SeoLandingLayout";
import { categories } from "@/lib/data/categories";
import { services } from "@/lib/data/services";
import { buildCityFaqs, buildCityIntro } from "@/lib/seo/content";
import { buildLocalMetadata } from "@/lib/seo/metadata";
import {
  findCityBySlug,
  getAllCitySlugs,
  getCitiesWithDistricts,
  getDistricts,
  toSlug,
} from "@/lib/seo/slugs";

type Props = { params: Promise<{ city: string }> };

export async function generateStaticParams() {
  return getAllCitySlugs().map((city) => ({ city }));
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateMetadata({ params }: Props) {
  const { city: citySlug } = await params;
  const city = findCityBySlug(citySlug);
  if (!city) return {};
  return buildLocalMetadata({ city, path: `/lokasyon/${citySlug}` });
}

export default async function CitySeoPage({ params }: Props) {
  const { city: citySlug } = await params;
  const city = findCityBySlug(citySlug);
  if (!city) notFound();

  const cityDistricts = getCitiesWithDistricts().includes(city)
    ? getDistricts(city)
    : [];

  return (
    <SeoLandingLayout
      title={`${city} Hizmetleri ve Ustalar`}
      intro={buildCityIntro(city)}
      breadcrumbs={[{ label: city }]}
      ctaHref={`/ara?sehir=${encodeURIComponent(city)}`}
      faqs={buildCityFaqs(city)}
      services={services.filter((s) => s.popular).slice(0, 6)}
      servicesTitle={`${city} — Popüler Hizmetler`}
    >
      <section>
        <h2 className="text-lg font-semibold text-foreground">Tüm Hizmetler — {city}</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/lokasyon/${citySlug}/${service.slug}`}
              className="border border-border bg-card px-4 py-3 text-sm text-foreground transition hover:border-primary/40 hover:text-primary"
            >
              {city} {service.name}
            </Link>
          ))}
        </div>
      </section>

      {cityDistricts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">{city} — İlçeler</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {cityDistricts.map((district) => (
              <Link
                key={district}
                href={`/lokasyon/${citySlug}/ilce/${toSlug(district)}/ev-temizligi`}
                className="border border-border bg-muted/50 px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary"
              >
                {district}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            İlçe seçtikten sonra istediğiniz hizmeti değiştirebilirsiniz.
          </p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Kategoriler</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/kategori/${cat.slug}`}
              className="border border-border bg-card px-4 py-3 text-sm hover:border-primary/40 hover:text-primary"
            >
              {city} {cat.name}
            </Link>
          ))}
        </div>
      </section>
    </SeoLandingLayout>
  );
}
