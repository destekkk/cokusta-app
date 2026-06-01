import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomerQuotesList from "@/components/CustomerQuotesList";
import CustomerProfileLocationCard from "@/components/CustomerProfileLocationCard";

export const metadata = {
  title: "Taleplerim | Çokusta",
};

export default function CustomerQuotesPage() {
  return (
    <div className="min-h-full bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Müşteri Paneli</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tüm taleplerinizi (onaylı ve onaysız) görüntüleyin, usta teklifleriyle pazarlık yapın.
            </p>
          </div>
          <Link
            href="/musteri/kontor"
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:border-primary/40"
          >
            Kontör
          </Link>
          <Link
            href="/hizmetler"
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Yeni Talep
          </Link>
        </div>
        <div className="mt-8 space-y-6">
          <CustomerProfileLocationCard />
          <CustomerQuotesList />
        </div>
      </div>
      <Footer />
    </div>
  );
}
