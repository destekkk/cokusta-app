import Link from "next/link";
import { getProviderSummaries } from "@/lib/db";
import ProviderManager from "@/components/admin/ProviderManager";

export default async function AdminProviderListPage() {
  const providers = await getProviderSummaries();
  const approved = providers.filter((provider) => provider.status === "approved");

  const totals = providers.reduce(
    (acc, provider) => ({
      jobEarnings: acc.jobEarnings + provider.totalJobEarnings,
      platformSpend: acc.platformSpend + provider.platformSpend,
    }),
    { jobEarnings: 0, platformSpend: 0 }
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Usta Listesi</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {providers.length} usta · {approved.length} onaylı · Toplam iş kazancı{" "}
        {totals.jobEarnings.toLocaleString("tr-TR")} ₺ · Platform hizmet{" "}
        {totals.platformSpend.toLocaleString("tr-TR")} ₺
      </p>

      <div className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        Usta ekleyebilir, bilgilerini düzenleyebilir veya silebilirsiniz. Hediye kontör için{" "}
        <Link href="/sltn/hediye-kontor" className="font-semibold text-primary hover:underline">
          Hediye Kontör
        </Link>{" "}
        menüsünü kullanın.
      </div>

      <div className="mt-6">
        <ProviderManager providers={providers} />
      </div>
    </div>
  );
}
