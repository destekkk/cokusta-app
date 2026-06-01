import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Props = { searchParams: Promise<{ status?: string; quote?: string }> };

export default async function CustomerEscrowResultPage({ searchParams }: Props) {
  const { status, quote } = await searchParams;
  const ok = status === "success";

  return (
    <div className="min-h-full bg-background">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
            ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {ok ? "✓" : "✕"}
        </div>
        <h1 className="mt-6 text-2xl font-bold">
          {ok ? "Ödeme alındı" : "Ödeme tamamlanamadı"}
        </h1>
        {ok && (
          <p className="mt-2 text-muted-foreground">
            Tutarınız Param Güvende hesabında güvende. Usta işi tamamladığında aktarılacaktır.
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {quote ? (
            <Link
              href={`/tekliflerim/${quote}`}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white"
            >
              Teklife dön
            </Link>
          ) : (
            <Link
              href="/musteri/teklifler"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white"
            >
              Tekliflerim
            </Link>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
