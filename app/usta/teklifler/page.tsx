import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UstaOpenQuotesPanel from "@/components/UstaOpenQuotesPanel";

export const metadata = {
  title: "Açık Talepler | Usta Paneli | Çokusta",
};

export default function UstaQuotesPage() {
  return (
    <div className="min-h-full bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold">Açık Talepler</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Müşteri telefonu teklif kabul edilene kadar gizlidir. Uygun taleplere fiyat teklifi
          gönderin.
        </p>
        <div className="mt-8">
          <UstaOpenQuotesPanel />
        </div>
      </div>
      <Footer />
    </div>
  );
}
