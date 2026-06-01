import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomerQuotesList from "@/components/CustomerQuotesList";

export const metadata = {
  title: "Taleplerim | Çokusta",
};

export default function CustomerQuotesPage() {
  return (
    <div className="min-h-full bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Taleplerim</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Teklif taleplerinizi ve ustalardan gelen fiyat tekliflerini buradan takip edin.
            </p>
          </div>
          <Link
            href="/hizmetler"
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Yeni Talep
          </Link>
        </div>
        <div className="mt-8">
          <CustomerQuotesList />
        </div>
      </div>
      <Footer />
    </div>
  );
}
