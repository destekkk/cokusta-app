import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomerCreditShop from "@/components/CustomerCreditShop";
import { getCustomerSessionPhone } from "@/lib/customer-auth";
import { getCustomerWalletByPhone } from "@/lib/db-credits";
import { getIyzicoConfig } from "@/lib/iyzico/config";
import { isDatabaseEnabled } from "@/lib/db/config";
import { redirect } from "next/navigation";

export const metadata = { title: "Kontör | Müşteri | Çokusta" };

export default async function CustomerCreditPage() {
  const phone = await getCustomerSessionPhone();
  if (!phone) redirect("/musteri/giris?redirect=/musteri/kontor");

  if (!isDatabaseEnabled()) {
    return (
      <div className="min-h-full bg-background">
        <Header />
        <div className="mx-auto max-w-lg px-4 py-10 text-center text-muted-foreground">
          Kontör sistemi için veritabanı bağlantısı gerekli.
        </div>
        <Footer />
      </div>
    );
  }

  const wallet = await getCustomerWalletByPhone(phone);
  const iyzicoConfigured = getIyzicoConfig().configured;

  return (
    <div className="min-h-full bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold">Kontör</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kontör satın alın, seçtiğiniz ustaya güvenle ödeme yapın.
        </p>
        <div className="mt-8">
          <CustomerCreditShop
            initialBalance={wallet?.creditBalance ?? 0}
            iyzicoConfigured={iyzicoConfigured}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
