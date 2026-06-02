import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UstaOpenQuotesPanel from "@/components/UstaOpenQuotesPanel";

export const metadata = {
  title: "Usta Paneli | Çokusta",
};

export default function UstaQuotesPage() {
  return (
    <div className="min-h-full bg-muted/20">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Suspense fallback={<p className="text-muted-foreground">Panel yükleniyor…</p>}>
          <UstaOpenQuotesPanel />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
