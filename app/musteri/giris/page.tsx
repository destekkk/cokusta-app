import { Suspense } from "react";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomerLoginForm from "@/components/CustomerLoginForm";
import { getCustomerSessionPhone } from "@/lib/customer-auth";

export const metadata = {
  title: "Tekliflerim | Çokusta",
};

export default async function CustomerLoginPage() {
  const phone = await getCustomerSessionPhone();
  if (phone) redirect("/musteri/teklifler");

  return (
    <div className="min-h-full bg-background">
      <Header />
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold">Tekliflerim</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Telefon numaranız ve 4 haneli şifrenizle müşteri panelinize girin.
        </p>
        <div className="mt-6">
          <Suspense fallback={<p className="text-muted-foreground">Yükleniyor…</p>}>
            <CustomerLoginForm />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
