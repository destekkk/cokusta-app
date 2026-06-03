import { getAllProviders } from "@/lib/db";
import AdminRejectedProvidersSection from "@/components/admin/AdminRejectedProvidersSection";
import ProviderApplicationsPanel from "@/components/admin/ProviderApplicationsPanel";

export default async function AdminProvidersPage() {
  const providers = await getAllProviders();
  const pending = providers.filter((provider) => provider.status === "pending");
  const rejected = providers.filter((provider) => provider.status === "rejected");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Usta Başvuruları</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {pending.length} onay bekliyor
        {rejected.length > 0 ? ` · ${rejected.length} reddedilmiş` : ""}
      </p>

      {pending.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Bekleyen başvuruları onaylayın veya reddedin. Reddettikleriniz sayfanın altındaki listede
          görünür.
        </div>
      )}

      <div className="mt-6">
        <ProviderApplicationsPanel providers={pending} showAll={false} initialStatus="pending" />
      </div>

      <AdminRejectedProvidersSection providers={rejected} />
    </div>
  );
}
