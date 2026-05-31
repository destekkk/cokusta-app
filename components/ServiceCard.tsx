import Link from "next/link";
import type { Service } from "@/lib/types";
import { formatPrice } from "@/lib/data/services";
import { getCategoryName } from "@/lib/data/categories";
import ServiceImage from "./ServiceImage";

type Props = {
  service: Service;
  city?: string;
  /** browse: hizmet detayına gider | pick: doğrudan teklif formuna gider */
  mode?: "browse" | "pick";
};

export default function ServiceCard({ service, city, mode = "browse" }: Props) {
  const href =
    mode === "pick"
      ? city
        ? `/teklif-al/${service.slug}?sehir=${encodeURIComponent(city)}`
        : `/teklif-al/${service.slug}`
      : city
        ? `/hizmet/${service.slug}?sehir=${encodeURIComponent(city)}`
        : `/hizmet/${service.slug}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden border border-border bg-card transition-all hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
    >
      <ServiceImage slug={service.slug} categorySlug={service.categorySlug} alt={service.name} />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
          {getCategoryName(service.categorySlug)}
        </div>
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
          {service.name}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {service.description}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4 shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {service.rating}
            </span>
            <span className="truncate">{service.providers.toLocaleString("tr-TR")} usta</span>
          </div>

          {mode === "pick" ? (
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow-md transition group-hover:scale-105 group-hover:bg-red-700"
              aria-hidden
            >
              Seç
            </span>
          ) : (
            <span className="shrink-0 text-sm font-semibold text-foreground">
              {formatPrice(service.priceFrom)}&apos;den
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
