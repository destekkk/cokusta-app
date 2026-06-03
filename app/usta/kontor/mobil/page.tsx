import { redirect } from "next/navigation";
import UstaMobilKontorPanel from "@/components/usta/UstaMobilKontorPanel";
import { parseProviderSessionToken } from "@/lib/provider-session";

export const metadata = {
  title: "Mobil Ödeme | Kontör | Çokusta",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ access?: string; order?: string }>;
};

export default async function UstaMobilKontorPage({ searchParams }: Props) {
  const { access, order } = await searchParams;
  const token = access?.trim();
  if (!token) {
    redirect("/usta/giris?redirect=/usta/kontor");
  }

  const providerId = await parseProviderSessionToken(token);
  if (!providerId) {
    redirect("/usta/giris?redirect=/usta/kontor");
  }

  return (
    <UstaMobilKontorPanel
      accessToken={token}
      orderId={order?.trim() || undefined}
      embedded
    />
  );
}
