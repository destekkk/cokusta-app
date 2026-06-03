import { getProviderSummaries } from "@/lib/db";
import AdminProviderGiftCredits from "@/components/admin/AdminProviderGiftCredits";

export const metadata = {
  title: "Hediye Kontör | Admin | Çokusta",
};

export default async function AdminGiftCreditsPage() {
  const providers = await getProviderSummaries();
  const approved = providers.filter((p) => p.status === "approved");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Hediye Kontör</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Onaylı ustalara {approved.length} kişiye 10, 30 veya 50 kontör hediye verin. İşlem muhasebe
        defterine yazılır.
      </p>

      <div className="mt-6">
        <AdminProviderGiftCredits providers={providers} />
      </div>
    </div>
  );
}
