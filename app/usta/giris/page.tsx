import Link from "next/link";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UstaLoginForm from "@/components/UstaLoginForm";

export const metadata = {
  title: "Usta Girişi | Çokusta",
};

export default function UstaLoginPage() {
  return (
    <div className="min-h-full bg-background">
      <Header />
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold">Usta Girişi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Açık taleplere teklif vermek için giriş yapın. Sadece onaylı ustalar giriş yapabilir.
        </p>
        <p className="mt-3">
          <Link
            href="/usta/uygulama"
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            Android uygulamasını indir (APK) →
          </Link>
        </p>
        <div className="mt-6">
          <Suspense fallback={<p className="text-muted-foreground">Yükleniyor…</p>}>
            <UstaLoginForm />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
