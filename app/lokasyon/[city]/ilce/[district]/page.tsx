import Link from "next/link";
import { notFound } from "next/navigation";
import SeoLandingLayout from "@/components/seo/SeoLandingLayout";
import { categories } from "@/lib/data/categories";
import { services } from "@/lib/data/services";
import { getPrimarySearchTerm, capitalizeTr } from "@/lib/seo/keywords";
import { buildDistrictFaqs, buildDistrictIntro } from "@/lib/seo/content";
import { buildDistrictMetadata } from "@/lib/seo/metadata";
import {
  findCityBySlug,
  findDistrictBySlug,
  getTopDistrictHubParams,
  toSlug,
} from "@/lib/seo/slugs";

type Props = { params: Promise<{ city: string; district: string }> };

export async function generateStaticParams() {
  return getTopDistrictHubParams();
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateMetadata({ params }: Props) {
  const { city: citySlug, district: districtSlug } = await params;
  const city = findCityBySlug(citySlug);
  const district = city ? findDistrictBySlug(city, districtSlug) : undefined;
  if (!city || !district) return {};
  return buildDistrictMetadata({
    city,
    district,
    path: `/lokasyon/${citySlug}/ilce/${districtSlug}`,
  });
}

const POPULAR_SLUGS = [
  "elektrik-tesisati",
  "boya-badana",
  "evden-eve-nakliyat",
  "ev-temizligi",
  "su-tesisati",
  "ev-komple-tadilat",
  "kombi-bakim",
  "mobilya-montaj",
];

export default async function DistrictHubSeoPage({ params }: Props) {
  const { city: citySlug, district: districtSlug } = await params;
  const city = findCityBySlug(citySlug);
  const district = city ? findDistrictBySlug(city, districtSlug) : undefined;
  if (!city || !district) notFound();

  const popularServices = services.filter((s) => POPULAR_SLUGS.includes(s.slug));

  return (
    <SeoLandingLayout
      title={`${city} ${district} — Usta ve Hizmetler`}
      intro={buildDistrictIntro(city, district)}
      breadcrumbs={[
        { label: city, href: `/lokasyon/${citySlug}` },
        { label: district },
      ]}
      ctaHref={`/ara?sehir=${encodeURIComponent(city)}&ilce=${encodeURIComponent(district)}`}
      faqs={buildDistrictFaqs(city, district)}
    >
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          {district} — Popüler Hizmetler
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {popularServices.map((service) => {
            const term = capitalizeTr(getPrimarySearchTerm(service.slug));
            return (
              <Link
                key={service.slug}
                href={`/lokasyon/${citySlug}/ilce/${districtSlug}/${service.slug}`}
                className="border border-border bg-card px-4 py-3 text-sm hover:border-primary/40 hover:text-primary"
              >
                {district} {term}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Tüm Hizmetler — {district}</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/lokasyon/${citySlug}/ilce/${districtSlug}/${service.slug}`}
              className="border border-border bg-muted/50 px-3 py-2 text-sm hover:border-primary/40 hover:text-primary"
            >
              {district} {service.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Kategoriler — {district}</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/lokasyon/${citySlug}/kategori/${cat.slug}`}
              className="border border-border bg-card px-4 py-3 text-sm hover:border-primary/40 hover:text-primary"
            >
              {district} {cat.name}
            </Link>
          ))}
        </div>
      </section>
    </SeoLandingLayout>
  );
}
