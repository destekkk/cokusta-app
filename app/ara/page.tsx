import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/SearchBox";
import ServiceCard from "@/components/ServiceCard";
import { searchServices } from "@/lib/search";
import { getCategoryName } from "@/lib/data/categories";

type Props = {
  searchParams: Promise<{ q?: string; kategori?: string; sehir?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const results = searchServices(params);
  const hasFilters = params.q || params.kategori || params.sehir;

  return (
    <div className="min-h-full bg-background">
      <Header />

      <div className="border-b border-border bg-card px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-foreground">
            {hasFilters ? "Arama Sonuçları" : "Hizmet Ara"}
          </h1>
          {params.kategori && (
            <p className="mt-1 text-muted-foreground">
              Kategori: <strong>{getCategoryName(params.kategori)}</strong>
              {params.sehir && <> · Şehir: <strong>{params.sehir}</strong></>}
            </p>
          )}
          <div className="mt-6">
            <SearchBox
              defaultCategory={params.kategori}
              defaultQuery={params.q}
              defaultCity={params.sehir}
              compact
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {results.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-lg font-medium text-foreground">Sonuç bulunamadı</p>
            <p className="mt-2 text-muted-foreground">
              Farklı bir arama terimi veya kategori deneyin.
            </p>
            <Link
              href="/hizmetler"
              className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Tüm Hizmetleri Gör
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              {results.length} hizmet bulundu
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((service) => (
                <ServiceCard key={service.slug} service={service} city={params.sehir} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
