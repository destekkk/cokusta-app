import { getAllProviders } from "@/lib/db";
import ProviderApplicationsPanel from "@/components/admin/ProviderApplicationsPanel";

export default async function AdminProvidersPage() {
  const providers = await getAllProviders();
  const pending = providers.filter((provider) => provider.status === "pending");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Usta Başvuruları</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {providers.length} başvuru · {pending.length} onay bekliyor
      </p>

      {pending.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Bekleyen başvuruları toplu seçip onaylayabilir veya detaya girerek inceleyebilirsiniz.
        </div>
      )}

      <div className="mt-6">
        <ProviderApplicationsPanel providers={providers} initialStatus="pending" />
      </div>
    </div>
  );
}
