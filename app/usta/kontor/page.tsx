import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UstaCreditShopWrapper from "@/components/UstaCreditShopWrapper";
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
    <div className="min-h-full bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold">Kontör Satın Al</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kartınızla güvenli ödeme — iyzico altyapısı. Müşteriden kazandığınız kontörleri{" "}
          <a href="/usta/odeme-talep" className="font-medium text-primary hover:underline">
            aylık nakit talep
          </a>{" "}
          edebilir veya teklif vermek için kullanabilirsiniz.
        </p>
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
