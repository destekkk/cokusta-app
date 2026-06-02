import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Props = { searchParams: Promise<{ status?: string; credits?: string }> };

export default async function CustomerCreditResultPage({ searchParams }: Props) {
  const { status, credits } = await searchParams;
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
          {ok ? "Kontör yüklendi" : "Ödeme tamamlanamadı"}
        </h1>
        {ok && credits && (
          <p className="mt-2 text-muted-foreground">{credits} kontör hesabınıza eklendi.</p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/musteri/teklifler"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white"
          >
            Taleplerime dön
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
