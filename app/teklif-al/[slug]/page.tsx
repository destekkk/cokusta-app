import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteForm from "@/components/QuoteForm";
import { getServiceImage } from "@/lib/data/images";
import { getServiceBySlug } from "@/lib/data/services";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sehir?: string; acil?: string }>;
};

export async function generateStaticParams() {
  const { services } = await import("@/lib/data/services");
  return services.map((s) => ({ slug: s.slug }));
}

export default async function QuotePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sehir, acil } = await searchParams;
  const service = getServiceBySlug(slug);
  if (!service) notFound();
  const defaultUrgent = acil === "1" || acil === "true";
  const serviceImage = getServiceImage(slug, service.categorySlug);

  return (
    <div className="min-h-full bg-background">
      <Header />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href={`/hizmet/${slug}`}
          className="text-sm text-primary hover:text-primary-dark"
        >
          ← {service.name}
        </Link>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
            {serviceImage && (
              <Image
                src={serviceImage}
                alt={service.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Teklif Al</h1>
            <p className="text-sm text-muted-foreground">{service.name}</p>
          </div>
        </div>

        <div className="mt-8">
          {defaultUrgent && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              🚨 <strong>Çok acil ilan</strong> — işin 3 gün içinde tamamlanması gerekiyor.
            </div>
          )}
          <QuoteForm service={service} defaultCity={sehir} defaultUrgent={defaultUrgent} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
