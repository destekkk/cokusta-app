import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LaunchCampaignNotice from "@/components/LaunchCampaignNotice";
import ProviderRegistrationForm from "@/components/ProviderRegistrationForm";

export default function ProviderRegistrationPage() {
  return (
    <div className="min-h-full bg-background">
      <Header />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-foreground">Usta Olarak Kayıt Ol</h1>
        <p className="mt-2 text-muted-foreground">
          Çokusta&apos;ya katıl, bölgenizdeki müşterilere ulaşın.
        </p>

        <div className="mt-6">
          <LaunchCampaignNotice />
        </div>

        <div className="mt-2">
          <ProviderRegistrationForm />
        </div>
      </div>

      <Footer />
    </div>
  );
}
