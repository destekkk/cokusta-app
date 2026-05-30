import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceImage from "@/components/ServiceImage";
import SeoCityLinks from "@/components/seo/SeoCityLinks";
import { getServiceBySlug, formatPrice } from "@/lib/data/services";
import ProviderPortfolioGallery from "@/components/ProviderPortfolioGallery";
import { getCategoryName } from "@/lib/data/categories";
import { getPortfolioByService } from "@/lib/db";
import { buildCanonical, SITE_NAME } from "@/lib/seo/metadata";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sehir?: string }>;
};

export async function generateStaticParams() {
  const { services } = await import("@/lib/data/services");
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  const title = `${service.name} | ${SITE_NAME}`;
  const description = `${service.longDescription.slice(0, 155)}… Ücretsiz teklif alın.`;
  return {
    title,
    description,
    alternates: { canonical: buildCanonical(`/hizmet/${slug}`) },
    openGraph: { title, description: service.description, locale: "tr_TR" },
    robots: { index: true, follow: true },
  };
}

export default async function ServiceDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sehir } = await searchParams;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const servicePortfolio = await getPortfolioByService(slug, 4);

  const teklifUrl = sehir
    ? `/teklif-al/${slug}?sehir=${encodeURIComponent(sehir)}`
    : `/teklif-al/${slug}`;

  return (
    <div className="min-h-full bg-background">
      <Header />

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Link href={`/kategori/${service.categorySlug}`} className="text-sm text-primary hover:text-primary-dark">
            ← {getCategoryName(service.categorySlug)}
          </Link>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="relative w-full shrink-0 overflow-hidden rounded-xl lg:w-80">
              <ServiceImage
                slug={service.slug}
                categorySlug={service.categorySlug}
                alt={service.name}
                height="lg"
                priority
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{service.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <strong className="text-foreground">{service.rating}</strong> ({service.reviewCount.toLocaleString("tr-TR")} değerlendirme)
                </span>
                <span>{service.providers.toLocaleString("tr-TR")} usta</span>
                <span className="font-semibold text-primary">
                  {formatPrice(service.priceFrom)}&apos;den başlayan fiyatlar
                </span>
              </div>

              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {service.longDescription}
              </p>

              <Link
                href={teklifUrl}
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-white transition-all hover:bg-primary-dark hover:shadow-[var(--shadow-card-hover)]"
              >
                Ücretsiz Teklif Al
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {servicePortfolio.length > 0 && (
        <ProviderPortfolioGallery
          items={servicePortfolio}
          title={`${service.name} — Usta İşleri`}
          subtitle="Bu hizmette tamamlanan gerçek projeler"
        />
      )}

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-xl font-bold text-foreground">Nasıl çalışır?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { step: "1", title: "İhtiyacını anlat", desc: "Birkaç soruyu yanıtla, neye ihtiyacın olduğunu belirt." },
            { step: "2", title: "Teklifleri al", desc: "Bölgedeki ustalar sana özel fiyat teklifleri göndersin." },
            { step: "3", title: "Ustayı seç", desc: "Teklifleri karşılaştır, en uygun ustayı seç ve işe başla." },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-2 text-xs font-bold text-primary">ADIM {item.step}</div>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <SeoCityLinks service={service} />
      </div>

      <Footer />
    </div>
  );
}
