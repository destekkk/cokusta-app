import Link from "next/link";
import { getAllProviders } from "@/lib/db";
import ProviderApplicationsTable from "@/components/admin/ProviderApplicationsTable";

export default async function AdminProvidersPage() {
  const providers = await getAllProviders();
  const pending = providers.filter((provider) => provider.status === "pending");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Usta Başvuruları</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {providers.length} başvuru · {pending.length} onay bekliyor
      </p>

      {pending.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Listeden hızlı onay/red verebilir veya detaya girerek inceleyebilirsiniz.
        </div>
      )}

      <ProviderApplicationsTable providers={providers} />
    </div>
  );
}
