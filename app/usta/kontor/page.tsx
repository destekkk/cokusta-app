import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UstaCreditShopWrapper from "@/components/UstaCreditShopWrapper";
import ProviderPanelHeader from "@/components/ProviderPanelHeader";
import { getProviderById } from "@/lib/db";
import { getProviderSessionId } from "@/lib/provider-auth";
import { getIyzicoConfig } from "@/lib/iyzico/config";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Kontör Satın Al | Usta Paneli | Çokusta",
};

export default async function UstaCreditPage() {
  const providerId = await getProviderSessionId();
  if (!providerId) redirect("/usta/giris?redirect=/usta/kontor");

  const provider = await getProviderById(providerId);
  if (!provider || provider.status !== "approved") {
    redirect("/usta/giris");
  }

  const { configured } = getIyzicoConfig();

  return (
    <div className="min-h-full bg-muted/20">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <ProviderPanelHeader
          title="Kontör Satın Al"
          subtitle="Kartınızla güvenli ödeme — iyzico altyapısı. Kontörleri teklif vermek veya aylık nakit talep etmek için kullanın."
          creditBalance={provider.creditBalance ?? 0}
          creditDebt={provider.creditDebt ?? 0}
          showStats
        />
        <div className="mt-8">
          <UstaCreditShopWrapper
            initialBalance={provider.creditBalance ?? 0}
            initialCreditDebt={provider.creditDebt ?? 0}
            iyzicoConfigured={configured}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
