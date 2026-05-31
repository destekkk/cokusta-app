import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UrgentJobCard from "@/components/UrgentJobCard";
import { getPopularServices } from "@/lib/data/services";
import { getUrgentQuoteRequests } from "@/lib/db";
import { URGENT_DEADLINE_DAYS } from "@/lib/urgent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Çok Acil İşler — Çokusta",
  description: `3 gün içinde tamamlanması gereken acil hizmet ilanları. Ustalar hemen teklif verebilir.`,
};

export default async function UrgentJobsPage() {
  const [urgentJobs, popularServices] = await Promise.all([
    getUrgentQuoteRequests(),
    Promise.resolve(getPopularServices().slice(0, 6)),
  ]);

  return (
    <div className="min-h-full bg-background">
      <Header />

      <section className="border-b border-red-200 bg-gradient-to-br from-red-600 via-red-600 to-red-700 px-4 py-12 text-white sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold">
            🚨 Çok Acil Bölümü
          </div>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            {URGENT_DEADLINE_DAYS} gün içinde yapılması gereken işler
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-white/85">
            Acil ilanlar burada listelenir. Ustalar öncelikli bildirim alır; müşteriler hızlı
            teklif toplar.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/hizmetler"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Acil ilan aç
            </Link>
            <Link
              href="/usta-ol"
              className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Usta olarak katıl
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-foreground">
            Aktif acil ilanlar
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({urgentJobs.length})
            </span>
          </h2>
        </div>

        {urgentJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <div className="text-4xl">⏳</div>
            <p className="mt-4 text-lg font-semibold text-foreground">
              Şu an aktif acil ilan yok
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Acil ihtiyacınız varsa teklif formunda &quot;Çok acil&quot; seçeneğini işaretleyin.
            </p>
            <Link
              href="/hizmetler"
              className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Hizmet seç ve ilan aç
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {urgentJobs.map((quote) => (
              <UrgentJobCard key={quote.id} quote={quote} />
            ))}
          </div>
        )}

        <section className="mt-14">
          <h2 className="text-lg font-bold text-foreground">Hızlı teklif al</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Popüler hizmetlerden birini seçin, ilan açarken &quot;Çok acil&quot; kutusunu işaretleyin.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {popularServices.map((service) => (
              <Link
                key={service.slug}
                href={`/teklif-al/${service.slug}?acil=1`}
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-red-200 hover:bg-red-50/50"
              >
                🚨 {service.name}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
