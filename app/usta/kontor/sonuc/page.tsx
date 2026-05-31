import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Ödeme Sonucu | Çokusta",
};

type Props = {
  searchParams: Promise<{ status?: string; order?: string; credits?: string }>;
};

export default async function UstaCreditResultPage({ searchParams }: Props) {
  const { status, order, credits } = await searchParams;
  const success = status === "success";

  return (
    <div className="min-h-full bg-background">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
              success ? "bg-emerald-100" : "bg-red-100"
            }`}
          >
            {success ? "✓" : "✕"}
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">
            {success ? "Ödeme başarılı!" : "Ödeme tamamlanamadı"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {success ? (
              <>
                <strong>{credits ?? "—"} kontör</strong> hesabınıza yüklendi. Hemen teklif
                vermeye başlayabilirsiniz.
              </>
            ) : status === "failed" ? (
              "Ödeme reddedildi veya iptal edildi. Tekrar deneyebilirsiniz."
            ) : (
              "Ödeme sırasında bir hata oluştu. Bakiyeniz değişmediyse tekrar deneyin."
            )}
          </p>
          {order && (
            <p className="mt-4 font-mono text-xs text-muted-foreground">Sipariş: {order}</p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/usta/teklifler"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Açık Taleplere Git
            </Link>
            <Link
              href="/usta/kontor"
              className="rounded-xl border border-border px-6 py-3 text-sm font-medium hover:bg-accent"
            >
              {success ? "Yeni Paket Al" : "Tekrar Dene"}
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
