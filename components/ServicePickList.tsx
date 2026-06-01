"use client";

import { useMemo, useState } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import QuoteFlowSteps from "@/components/QuoteFlowSteps";
import ServiceCard from "@/components/ServiceCard";
import { CategoryIconBadge } from "@/components/icons/CategoryIcon";
import type { Category } from "@/lib/types";
import type { Service } from "@/lib/types";

type Section = {
  category: Category;
  services: Service[];
};

type Props = {
  sections: Section[];
};

export default function ServicePickList({ sections }: Props) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const serviceBySlug = useMemo(() => {
    const map = new Map<string, Service>();
    for (const section of sections) {
      for (const service of section.services) {
        map.set(service.slug, service);
      }
    }
    return map;
  }, [sections]);

  const filteredSections = useMemo(() => {
    if (selectedSlugs.length === 0) return sections;
    return sections
      .map((section) => ({
        ...section,
        services: section.services.filter((s) => selectedSlugs.includes(s.slug)),
      }))
      .filter((section) => section.services.length > 0);
  }, [sections, selectedSlugs]);

  const addService = (slug: string) => {
    setSelectedSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    setDropdownOpen(false);
  };

  const removeService = (slug: string) => {
    setSelectedSlugs((prev) => prev.filter((s) => s !== slug));
  };

  const clearAll = () => setSelectedSlugs([]);

  return (
    <div className="min-h-full bg-background">
      <Header />

      <div className="border-b border-border bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-foreground">Teklif Al</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Hizmeti listeden veya açılır kutudan seçin. Seçtikleriniz aşağıda görünür; diğerleri
            gizlenir.
          </p>

          <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <QuoteFlowSteps currentStep={1} />

            <div className="relative w-full xl:max-w-sm xl:shrink-0">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Hizmet seçin
              </label>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-3 text-left text-sm font-medium text-foreground transition hover:border-primary/40"
              >
                <span className="text-muted-foreground">Listeden hizmet ekle…</span>
                <svg
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} aria-hidden />
                  <div className="absolute right-0 z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-card py-2 shadow-lg">
                    {sections.map(({ category, services }) => (
                      <div key={category.slug}>
                        <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {category.name}
                        </p>
                        {services.map((service) => {
                          const picked = selectedSlugs.includes(service.slug);
                          return (
                            <button
                              key={service.slug}
                              type="button"
                              disabled={picked}
                              onClick={() => addService(service.slug)}
                              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-accent disabled:cursor-default disabled:opacity-50 ${
                                picked ? "bg-primary/5 text-primary" : "text-foreground"
                              }`}
                            >
                              <CategoryIconBadge slug={category.slug} size={14} />
                              <span className="flex-1">{service.name}</span>
                              {picked && <span className="text-xs text-primary">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {selectedSlugs.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {selectedSlugs.map((slug) => {
                const service = serviceBySlug.get(slug);
                if (!service) return null;
                return (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {service.name}
                    <button
                      type="button"
                      onClick={() => removeService(slug)}
                      className="rounded-full p-0.5 hover:bg-primary/20"
                      aria-label={`${service.name} kaldır`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              <button
                type="button"
                onClick={clearAll}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Tümünü göster
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredSections.length > 0 && (
        <div className="sticky top-16 z-40 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto pb-1">
            {filteredSections.map(({ category }) => (
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
      )}

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-10 sm:px-6">
        {filteredSections.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Seçili hizmet bulunamadı. Yukarıdan hizmet ekleyin veya &quot;Tümünü göster&quot;e tıklayın.
          </p>
        ) : (
          filteredSections.map(({ category, services }) => (
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
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}
