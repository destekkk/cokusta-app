import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SeoFaq, { FaqJsonLd } from "@/components/seo/SeoFaq";
import ServiceCard from "@/components/ServiceCard";
import type { Service } from "@/lib/types";
import type { ReactNode } from "react";

type FaqItem = { question: string; answer: string };

type Props = {
  title: string;
  intro: string;
  breadcrumbs: { label: string; href?: string }[];
  ctaHref: string;
  ctaLabel?: string;
  faqs?: FaqItem[];
  services?: Service[];
  servicesTitle?: string;
  children?: ReactNode;
};

export default function SeoLandingLayout({
  title,
  intro,
  breadcrumbs,
  ctaHref,
  ctaLabel = "Ücretsiz Teklif Al",
  faqs,
  services,
  servicesTitle = "Popüler Hizmetler",
  children,
}: Props) {
  return (
    <div className="min-h-full bg-background">
      {faqs && faqs.length > 0 && <FaqJsonLd items={faqs} />}
      <Header />

      <div className="border-b border-border bg-secondary px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Breadcrumbs items={[{ label: "Ana Sayfa", href: "/" }, ...breadcrumbs]} />
          <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/75">{intro}</p>
          <Link
            href={ctaHref}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {children}

        {services && services.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground">{servicesTitle}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          </section>
        )}

        {faqs && faqs.length > 0 && <SeoFaq items={faqs} />}
      </div>

      <Footer />
    </div>
  );
}
