import Image from "next/image";
import Link from "next/link";
import type { PortfolioWithProvider } from "@/lib/types";
import { getServiceBySlug } from "@/lib/data/services";

type Props = {
  items: PortfolioWithProvider[];
  title?: string;
  subtitle?: string;
  showProvider?: boolean;
};

export default function ProviderPortfolioGallery({
  items,
  title = "Ustaların İşleri",
  subtitle = "Gerçek projeler, gerçek sonuçlar",
  showProvider = true,
}: Props) {
  if (items.length === 0) return null;

  return (
    <section className="border-b border-border bg-muted/40 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Link
            href="/usta/portfolyo"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Projeni ekle →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const service = item.serviceSlug ? getServiceBySlug(item.serviceSlug) : undefined;

            return (
              <article
                key={`${item.providerId}-${item.id}`}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {item.description}
                  </p>

                  <div className="mt-4 border-t border-border pt-4">
                    {showProvider && (
                      <Link
                        href={`/usta/${item.providerId}`}
                        className="font-semibold text-foreground hover:text-primary"
                      >
                        {item.providerName}
                      </Link>
                    )}
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {item.providerCity}
                      {service ? ` · ${service.name}` : ""}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
