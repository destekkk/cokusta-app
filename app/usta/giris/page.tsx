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
