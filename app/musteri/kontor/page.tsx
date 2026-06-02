import { redirect } from "next/navigation";
import { getCustomerSessionPhone } from "@/lib/customer-auth";

export default async function CustomerCreditPage() {
  const phone = await getCustomerSessionPhone();
  if (!phone) {
    redirect("/musteri/giris?redirect=/musteri/teklifler");
  }
  redirect("/musteri/teklifler");
}
