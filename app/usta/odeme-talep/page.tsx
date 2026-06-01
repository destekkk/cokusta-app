import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UstaPayoutPanel from "@/components/UstaPayoutPanel";
import { getProviderSessionId } from "@/lib/provider-auth";
import { getProviderById } from "@/lib/db";
import { getProviderPayoutRequests } from "@/lib/db-credits";
import { isDatabaseEnabled } from "@/lib/db/config";
import { redirect } from "next/navigation";

export const metadata = { title: "Ödeme Talebi | Usta | Çokusta" };

export default async function UstaPayoutPage() {
  const providerId = await getProviderSessionId();
  if (!providerId) redirect("/usta/giris?redirect=/usta/odeme-talep");

  if (!isDatabaseEnabled()) {
    return (
      <div className="min-h-full bg-background">
        <Header />
        <div className="mx-auto max-w-lg px-4 py-10 text-center text-muted-foreground">
          Ödeme talebi için veritabanı bağlantısı gerekli.
        </div>
        <Footer />
      </div>
    );
  }

  const provider = await getProviderById(providerId);
  const requests = await getProviderPayoutRequests(providerId);

  return (
    <div className="min-h-full bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold">Kontör & Ödeme Talebi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kazandığınız kontörleri teklif vermek için kullanın veya aylık nakit talep edin.
        </p>
        <div className="mt-8">
          <UstaPayoutPanel
            initialBalance={provider?.creditBalance ?? 0}
            initialIban={provider?.iban}
            initialAccountHolder={provider?.accountHolder}
            initialRequests={requests}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
