import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getQuoteRequestById } from "@/lib/db";
import { URGENT_DEADLINE_DAYS, formatUrgentDeadline } from "@/lib/urgent";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function QuoteConfirmationPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const request = id ? await getQuoteRequestById(id) : undefined;

  return (
    <div className="min-h-full bg-background">
      <Header />

      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-3xl">
            ✅
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">
            Teklif talebiniz alındı!
          </h1>
          <p className="mt-3 text-muted-foreground">
            {request ? (
              <>
                <strong>{request.serviceName}</strong> hizmeti için{" "}
                <strong>{request.city}</strong> bölgesindeki ustalar en kısa sürede
                size teklif gönderecek.
              </>
            ) : (
              "Bölgenizdeki ustalar en kısa sürede size teklif gönderecek."
            )}
          </p>

          {request && (
            <div className="mt-6 rounded-xl bg-background p-4 text-left text-sm">
              <p className="text-muted-foreground">Talep No</p>
              <p className="font-mono text-xs text-foreground">{request.id}</p>
            </div>
          )}

          {request?.urgent && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-left">
              <p className="text-sm font-bold text-red-700">🚨 Çok acil ilanınız yayında</p>
              <p className="mt-2 text-sm text-red-800/90">
                İlanınız Çok Acil bölümünde listelendi. Ustalar öncelikli bildirim alacak;
                işin {URGENT_DEADLINE_DAYS} gün içinde tamamlanması hedefleniyor.
                {request.urgentDeadline && (
                  <> Son tarih: {formatUrgentDeadline(request.urgentDeadline)}.</>
                )}
              </p>
              <Link
                href="/cok-acil"
                className="mt-3 inline-block text-sm font-semibold text-red-700 hover:underline"
              >
                Çok Acil bölümünü gör →
              </Link>
            </div>
          )}

          {request?.priorityListing && (
            <div className="mt-6 rounded-xl border border-secondary/30 bg-secondary/5 p-4 text-left">
              <p className="text-sm font-bold text-secondary">⚡ Öncelikli ilan aktif</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Lansman kampanyası kapsamında ilanınız öncelikli olarak bölgenizdeki ustalara
                iletilecek. 24 saat içinde teklif almanız hedeflenir.
                {request.launchMemberNumber && (
                  <> (#{request.launchMemberNumber}. ilan)</>
                )}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Ana Sayfaya Dön
            </Link>
            <Link
              href="/hizmetler"
              className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-accent"
            >
              Başka Hizmet Ara
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
