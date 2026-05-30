import Link from "next/link";
import { TOP_CITIES, toSlug } from "@/lib/seo/slugs";
import type { Service } from "@/lib/types";

type Props = {
  service: Service;
};

export default function SeoCityLinks({ service }: Props) {
  return (
    <section className="mt-10 border-t border-border pt-10">
      <h2 className="text-lg font-semibold text-foreground">
        {service.name} — Şehir Bazlı Hizmet
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Bulunduğunuz şehirde {service.name.toLowerCase()} ustası arayın
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {TOP_CITIES.map((city) => (
          <Link
            key={city}
            href={`/lokasyon/${toSlug(city)}/${service.slug}`}
            className="border border-border bg-card px-3 py-1.5 text-sm text-foreground transition hover:border-primary/40 hover:text-primary"
          >
            {city} {service.name}
          </Link>
        ))}
        <Link
          href={`/hizmet/${service.slug}`}
          className="border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary"
        >
          Tüm şehirler →
        </Link>
      </div>
    </section>
  );
}
