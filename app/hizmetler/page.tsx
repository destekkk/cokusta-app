import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import QuoteFlowSteps from "@/components/QuoteFlowSteps";
import { CategoryIconBadge } from "@/components/icons/CategoryIcon";
import { categories } from "@/lib/data/categories";
import { getServicesByCategory } from "@/lib/data/services";

export default function AllServicesPage() {
  const sections = categories
    .map((category) => ({
      category,
      services: getServicesByCategory(category.slug),
    }))
    .filter((section) => section.services.length > 0);

  return (
    <div className="min-h-full bg-background">
      <Header />

      <div className="border-b border-border bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-foreground">Teklif Al</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Ücretsiz teklif almak için önce hizmetinizi seçin, ardından formu doldurun.
          </p>
          <div className="mt-6">
            <QuoteFlowSteps currentStep={1} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <h2 className="text-base font-bold uppercase tracking-wider text-foreground">
          <span className="text-red-600">*</span> Hizmet Kategorileri
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="text-red-600">*</span>{" "}
          <span className="font-semibold text-foreground">Hizmeti seçin.</span> Kırmızı{" "}
          <strong className="text-foreground">Seç</strong> butonuna tıklayarak bir sonraki adıma geçin.
        </p>
      </div>

      <div className="sticky top-16 z-40 mt-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto pb-1">
          {sections.map(({ category }) => (
            <a
              key={category.slug}
              href={`#kategori-${category.slug}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition hover:border-primary/40 hover:text-primary"
            >
              <CategoryIconBadge slug={category.slug} size={14} />
              {category.name}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-10 sm:px-6">
        {sections.map(({ category, services }) => (
          <section key={category.slug} id={`kategori-${category.slug}`} className="scroll-mt-36">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  <CategoryIconBadge slug={category.slug} size={14} />
                  {category.name}
                </div>
                <h2 className="text-2xl font-bold text-foreground">{category.name} Hizmetleri</h2>
                <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {services.length} hizmet — birini seçin
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.slug} service={service} mode="pick" />
              ))}
            </div>
          </section>
        ))}
      </div>

      <Footer />
    </div>
  );
}
