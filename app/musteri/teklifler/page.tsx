import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomerQuotesList from "@/components/CustomerQuotesList";
import CustomerProfileLocationCard from "@/components/CustomerProfileLocationCard";
import CustomerPanelHeader from "@/components/CustomerPanelHeader";

export const metadata = {
  title: "Taleplerim | Çokusta",
};

export default function CustomerQuotesPage() {
  return (
    <div className="min-h-full bg-muted/20">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <CustomerPanelHeader />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <Suspense fallback={<p className="text-muted-foreground">Liste yükleniyor…</p>}>
            <CustomerQuotesList />
          </Suspense>
          <aside className="lg:sticky lg:top-24">
            <CustomerProfileLocationCard />
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
