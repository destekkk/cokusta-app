import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UstaCreditShopWrapper from "@/components/UstaCreditShopWrapper";
import UstaPanelHeader from "@/components/UstaPanelHeader";
import { getProviderById } from "@/lib/db";
import { getProviderSessionId } from "@/lib/provider-auth";
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

  return (
    <div className="min-h-full bg-muted/20">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <UstaPanelHeader
          title="Kontör Satın Al"
          subtitle={`Bakiye: ${provider.creditBalance ?? 0} kontör${(provider.creditDebt ?? 0) > 0 ? ` · Borç: ${provider.creditDebt}` : ""}`}
          backHref="/usta/teklifler"
          backLabel="← Tekliflere dön"
        />
        <div className="mt-8">
          <UstaCreditShopWrapper
            initialBalance={provider.creditBalance ?? 0}
            initialCreditDebt={provider.creditDebt ?? 0}
            borcKredisiAktif={provider.borcKredisiAktif ?? false}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
