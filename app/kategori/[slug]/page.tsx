import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import QuoteFlowSteps from "@/components/QuoteFlowSteps";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getCategoryImage } from "@/lib/data/images";
import { getServicesByCategory } from "@/lib/data/services";
import { buildCanonical, SITE_NAME } from "@/lib/seo/metadata";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { categories } = await import("@/lib/data/categories");
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  const title = `${category.name} Hizmetleri | ${SITE_NAME}`;
  const description = `${category.description} Doğrulanmış ustalar, ücretsiz teklif, güvenli ödeme.`;
  return {
    title,
    description,
    alternates: { canonical: buildCanonical(`/kategori/${slug}`) },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const services = getServicesByCategory(slug);
  const categoryImage = getCategoryImage(slug);

  return (
    <div className="min-h-full bg-background">
      <Header />

      <div className="relative border-b border-border">
        <div className="relative h-56 w-full sm:h-64">
          {categoryImage ? (
            <Image
              src={categoryImage}
              alt={category.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/90 to-primary/40" />
          )}
          <div className="absolute inset-0 bg-secondary/70" />
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
            <Link href="/" className="text-sm text-white/80 hover:text-white">
              ← Ana Sayfa
            </Link>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{category.name}</h1>
            <p className="mt-1 max-w-xl text-white/80">{category.description}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <QuoteFlowSteps currentStep={1} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Aşağıdan hizmetinizi seçin — kırmızı <strong className="text-foreground">Seç</strong>{" "}
            butonuna tıklayın.
          </p>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">{services.length} hizmet</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} mode="pick" />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
