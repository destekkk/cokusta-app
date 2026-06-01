import Link from "next/link";
import { notFound } from "next/navigation";
import SeoLandingLayout from "@/components/seo/SeoLandingLayout";
import { services } from "@/lib/data/services";
import { capitalizeTr, getCategorySearchTerms, getPrimarySearchTerm } from "@/lib/seo/keywords";
import { buildCategoryLocationFaqs, buildCategoryLocationIntro } from "@/lib/seo/content";
import { buildCategoryLocationMetadata } from "@/lib/seo/metadata";
import {
  findCategoryBySlug,
  findCityBySlug,
  getDistricts,
  getPrebuildCityCategoryParams,
  toSlug,
} from "@/lib/seo/slugs";

type Props = { params: Promise<{ city: string; category: string }> };

export async function generateStaticParams() {
  return getPrebuildCityCategoryParams();
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateMetadata({ params }: Props) {
  const { city: citySlug, category: categorySlug } = await params;
  const city = findCityBySlug(citySlug);
  const category = findCategoryBySlug(categorySlug);
  if (!city || !category) return {};
  return buildCategoryLocationMetadata({
    city,
    categorySlug: category.slug,
    categoryName: category.name,
    path: `/lokasyon/${citySlug}/kategori/${categorySlug}`,
  });
}

export default async function CityCategorySeoPage({ params }: Props) {
  const { city: citySlug, category: categorySlug } = await params;
  const city = findCityBySlug(citySlug);
  const category = findCategoryBySlug(categorySlug);
  if (!city || !category) notFound();

  const categoryServices = services.filter((s) => s.categorySlug === category.slug);
  const terms = getCategorySearchTerms(category.slug);
  const primary = capitalizeTr(terms[0] ?? category.name);
  const districts = getDistricts(city);

  return (
    <SeoLandingLayout
      title={`${city} ${primary} — ${category.name}`}
      intro={buildCategoryLocationIntro(city, category.name)}
      breadcrumbs={[
        { label: city, href: `/lokasyon/${citySlug}` },
        { label: category.name },
      ]}
      ctaHref={`/kategori/${category.slug}?sehir=${encodeURIComponent(city)}`}
      faqs={buildCategoryLocationFaqs(city, category.name)}
      services={categoryServices.filter((s) => s.popular).slice(0, 6)}
      servicesTitle={`${city} — ${category.name} Hizmetleri`}
    >
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          {city} {category.name} — Tüm Hizmetler
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categoryServices.map((service) => {
            const term = capitalizeTr(getPrimarySearchTerm(service.slug));
            return (
              <Link
                key={service.slug}
                href={`/lokasyon/${citySlug}/${service.slug}`}
                className="border border-border bg-card px-4 py-3 text-sm hover:border-primary/40 hover:text-primary"
              >
                {city} {term}
              </Link>
            );
          })}
        </div>
      </section>

      {districts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {city} ilçelerinde {primary.toLowerCase()}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {districts.map((district) => (
              <Link
                key={district}
                href={`/lokasyon/${citySlug}/ilce/${toSlug(district)}/${categoryServices[0]?.slug ?? "ev-komple-tadilat"}`}
                className="border border-border bg-muted/50 px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary"
              >
                {district} {primary.toLowerCase()}
              </Link>
            ))}
          </div>
        </section>
      )}
    </SeoLandingLayout>
  );
}
