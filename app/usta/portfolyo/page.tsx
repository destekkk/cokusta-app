import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProviderPortfolioForm from "@/components/ProviderPortfolioForm";

export const metadata = {
  title: "Portfolyo Ekle — Çokusta",
  description: "Tamamladığınız işlerin fotoğraflarını yükleyin, ustalığınızı gösterin.",
};

export default function ProviderPortfolioPage() {
  return (
    <div className="min-h-full bg-background">
      <Header />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-foreground">Portfolyo Ekle</h1>
        <p className="mt-2 text-muted-foreground">
          Yaptığınız işlerin fotoğraflarını yükleyin. Müşteriler profilinizde ve ana sayfada
          görebilir — tıpkı yorumlar gibi güven oluşturur.
        </p>

        <div className="mt-8">
          <ProviderPortfolioForm />
        </div>
      </div>

      <Footer />
    </div>
  );
}
