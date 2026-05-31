import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import ServiceCard from "@/components/ServiceCard";
import CategoryCard from "@/components/CategoryCard";
import AnimatedStats from "@/components/AnimatedStats";
import ReviewsSlider from "@/components/ReviewsSlider";
import ProviderOfMonthBanner from "@/components/ProviderOfMonthBanner";
import { CategoryIconBadge } from "@/components/icons/CategoryIcon";
import { categories } from "@/lib/data/categories";
import { customerReviews } from "@/lib/data/reviews";
import { getPopularServices } from "@/lib/data/services";
import ProviderPortfolioGallery from "@/components/ProviderPortfolioGallery";
import { getLaunchCampaignStats, getCurrentProviderOfTheMonth, getStats, getUrgentQuoteRequests, getRecentPortfolioItems } from "@/lib/db";
import LaunchCampaignBanner from "@/components/LaunchCampaignBanner";
import TrustBadges from "@/components/TrustBadges";

export const dynamic = "force-dynamic";

export default async function Home() {
  const popularServices = getPopularServices();
  const [stats, providerOfMonth, campaignStats, urgentJobs, portfolioItems] = await Promise.all([
    getStats(),
    getCurrentProviderOfTheMonth(),
    getLaunchCampaignStats(),
    getUrgentQuoteRequests(),
    getRecentPortfolioItems(4),
  ]);

  return (
    <div className="min-h-full bg-background">
      <Header />

      {/* Hero */}
      <section className="relative border-b border-border bg-secondary px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/80">
            Kurumsal Hizmet Pazaryeri
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Profesyonel hizmet,{" "}
            <span className="text-white/90">güvenilir ustalar</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            Doğrulanmış ustalar arasından seçim yapın, şeffaf teklif alın, güvenli ödeme ile çalışın.
          </p>
          <p className="mx-auto mt-4 inline-block border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/75">
            Piyasa referansının yarısı — sabit fiyat avantajı
          </p>

          <Link
            href="/cok-acil"
            className="mx-auto mt-4 inline-flex items-center gap-2 border border-red-400/30 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-950/60"
          >
            Acil Hizmet — 3 gün içinde tamamlanması gereken işler
            {urgentJobs.length > 0 && (
              <span className="bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                {urgentJobs.length}
              </span>
            )}
          </Link>

          <div className="relative z-30 mt-8">
            <SearchBox dark />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-white/50">
              Popüler
            </span>
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.slug}
                href={`/kategori/${cat.slug}`}
                className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/85 transition hover:border-white/30 hover:bg-white/10"
              >
                <CategoryIconBadge slug={cat.slug} size={14} variant="light" />
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <LaunchCampaignBanner stats={campaignStats} />

      <AnimatedStats
        stats={[
          { value: stats.providers, suffix: "+", label: "Onaylı Usta" },
          { value: stats.jobs, suffix: "+", label: "Tamamlanan İş" },
          { value: stats.avgRating, label: "Ortalama Puan", decimals: 1 },
          { value: 97, prefix: "%", label: "Müşteri Memnuniyeti" },
        ]}
      />

      <TrustBadges />

      {providerOfMonth && <ProviderOfMonthBanner selection={providerOfMonth} />}

      <ReviewsSlider reviews={customerReviews} />

      <ProviderPortfolioGallery items={portfolioItems} />

      {/* Categories */}
      <section className="border-t border-border bg-accent px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Kategoriler
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
              Hizmet Kategorileri
            </h2>
          </div>
          <div className="mt-10 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 4).map((cat) => (
                <CategoryCard key={cat.slug} category={cat} />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {categories.slice(4).map((cat) => (
                <CategoryCard key={cat.slug} category={cat} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Öne Çıkanlar
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Popüler Hizmetler
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                En çok tercih edilen hizmetler
              </p>
            </div>
            <Link
              href="/hizmetler"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
            >
              Tümünü gör
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popularServices.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-4xl border border-border bg-secondary px-6 py-12 text-center sm:px-12 sm:py-14">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Hizmet veren bir usta mısınız?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/70">
            Çokusta&apos;ya katılın, binlerce müşteriye ulaşın, işinizi büyütün.
          </p>
          <Link
            href="/usta-ol"
            className="mt-8 inline-block rounded-md bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Usta Olarak Kayıt Ol
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
