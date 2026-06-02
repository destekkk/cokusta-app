import { getAdminStats, getAllProviders, getBillingOverview } from "@/lib/db";
import { getPendingProviderPayouts } from "@/lib/db-credits";
import { isDatabaseEnabled } from "@/lib/db/config";
import AdminNav from "@/components/admin/AdminNav";
import type { AdminNavBadges } from "@/components/admin/admin-nav-types";

export const dynamic = "force-dynamic";

async function getNavBadges(): Promise<AdminNavBadges> {
  const [stats, billing, payouts] = await Promise.all([
    getAdminStats(),
    getBillingOverview(),
    isDatabaseEnabled() ? getPendingProviderPayouts() : Promise.resolve([]),
  ]);

  return {
    awaitingReviewQuotes: stats.awaitingReviewQuotes,
    pendingProviders: stats.pendingProviders,
    pendingInvoices: billing.pendingCount,
    pendingPayouts: payouts.length,
  };
}

export default async function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const badges = await getNavBadges();

  return (
    <div className="min-h-full bg-background">
      <AdminNav badges={badges} />
      <main>{children}</main>
    </div>
  );
}
