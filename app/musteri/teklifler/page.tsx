import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomerQuotesList from "@/components/CustomerQuotesList";
import CustomerPanelHeader from "@/components/CustomerPanelHeader";

export const metadata = {
  title: "Taleplerim | Çokusta",
};

export default function CustomerQuotesPage() {
  return (
    <div className="min-h-full bg-muted/20">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <CustomerPanelHeader
          title="Taleplerim"
          subtitle="Taleplerinizi sekmelerden filtreleyin; yeni hizmet talebi için üstteki butonu kullanın."
        />
        <div className="mt-8">
          <Suspense fallback={<p className="text-muted-foreground">Liste yükleniyor…</p>}>
            <CustomerQuotesList />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
