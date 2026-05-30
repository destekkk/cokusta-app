import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCategoryName } from "@/lib/data/categories";
import { getServiceBySlug } from "@/lib/data/services";
import { getPublicProviderProfile } from "@/lib/db";
import { formatExperience } from "@/lib/admin-labels";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const provider = await getPublicProviderProfile(id);
  if (!provider) return { title: "Usta Bulunamadı" };
  return {
    title: `${provider.name} — Usta Profili | Çokusta`,
    description: provider.bio || `${provider.city} bölgesinde hizmet veren usta profili ve iş örnekleri.`,
  };
}

export default async function ProviderProfilePage({ params }: Props) {
  const { id } = await params;
  const provider = await getPublicProviderProfile(id);
  if (!provider) notFound();

  const categories = provider.categorySlugs.map(getCategoryName).join(", ");
  const portfolio = provider.portfolio ?? [];

  return (
    <div className="min-h-full bg-background">
      <Header />

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white">
              {provider.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{provider.name}</h1>
              <p className="mt-1 text-muted-foreground">
                {provider.city} · {formatExperience(provider.experience)} · {categories}
              </p>
              {provider.bio?.trim() && (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {provider.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">Yaptığı İşler</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {portfolio.length} proje fotoğrafı
            </p>
          </div>
          <Link
            href="/usta/portfolyo"
            className="rounded-lg border border-primary/40 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            + Proje ekle
          </Link>
        </div>

        {portfolio.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Henüz portfolyo projesi eklenmemiş.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {portfolio.map((item) => {
              const service = item.serviceSlug ? getServiceBySlug(item.serviceSlug) : undefined;

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    {service && (
                      <p className="mt-1 text-xs font-medium text-primary">{service.name}</p>
                    )}
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
