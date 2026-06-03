import Link from "next/link";
import { getAdminStats, getAllProviders, getBillingOverview } from "@/lib/db";
import { getPendingProviderPayouts } from "@/lib/db-credits";
import { isDatabaseEnabled } from "@/lib/db/config";
import { pingDatabase } from "@/lib/db-status";
import ProviderApplicationsPanel from "@/components/admin/ProviderApplicationsPanel";
import AdminDbDownPage from "@/components/admin/AdminDbDownPage";

export default async function AdminDashboardPage() {
  const db = await pingDatabase();
  if (!db.ok) {
    return <AdminDbDownPage message={db.message} />;
  }

  const [stats, billing, providers, payouts] = await Promise.all([
    getAdminStats(),
    getBillingOverview(),
    getAllProviders(),
    isDatabaseEnabled() ? getPendingProviderPayouts() : Promise.resolve([]),
  ]);
  const pendingProviders = providers.filter((provider) => provider.status === "pending");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Platform özeti ve kazanç takibi</p>

      {/* Kazanç */}
      <section className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <h2 className="text-lg font-bold text-foreground">Platform Kazancı</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Her tamamlanan işten %{(stats.commissionRate * 100).toFixed(0)} komisyon alınır.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-card p-4 border border-border">
            <div className="text-2xl font-bold text-primary">
              {stats.totalRevenue.toLocaleString("tr-TR")} ₺
            </div>
            <div className="text-sm text-muted-foreground">Toplam kazanç</div>
          </div>
          <div className="rounded-xl bg-card p-4 border border-border">
            <div className="text-2xl font-bold text-primary">
              {stats.monthlyRevenue.toLocaleString("tr-TR")} ₺
            </div>
            <div className="text-sm text-muted-foreground">Bu ay</div>
          </div>
          <div className="rounded-xl bg-card p-4 border border-border">
            <div className="text-2xl font-bold text-foreground">
              {stats.totalJobVolume.toLocaleString("tr-TR")} ₺
            </div>
            <div className="text-sm text-muted-foreground">Toplam iş hacmi</div>
          </div>
        </div>
      </section>

      {/* Özet kartlar */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Link
          href="/sltn/teklifler?status=awaiting_review"
          className="rounded-xl border border-orange-200 bg-orange-50 p-5 hover:border-orange-300"
        >
          <div className="text-3xl font-bold text-orange-600">{stats.awaitingReviewQuotes}</div>
          <div className="mt-1 text-sm font-medium text-foreground">Onay bekleyen teklif</div>
        </Link>
        <Link
          href="/sltn/teklifler?status=open"
          className="rounded-xl border border-border bg-card p-5 hover:border-primary/40"
        >
          <div className="text-3xl font-bold text-amber-600">{stats.pendingQuotes}</div>
          <div className="mt-1 text-sm font-medium text-foreground">Yayında (usta bekliyor)</div>
        </Link>
        <Link
          href="/sltn/teklifler?status=accepted"
          className="rounded-xl border border-border bg-card p-5 hover:border-primary/40"
        >
          <div className="text-3xl font-bold text-primary">{stats.matchedQuotes}</div>
          <div className="mt-1 text-sm font-medium text-foreground">Eşleştirilmiş iş</div>
        </Link>
        <Link
          href="/sltn/ustalar"
          className="rounded-xl border border-border bg-card p-5 hover:border-primary/40"
        >
          <div className="text-3xl font-bold text-amber-600">{stats.pendingProviders}</div>
          <div className="mt-1 text-sm font-medium text-foreground">Onay bekleyen usta</div>
        </Link>
        <Link
          href="/sltn/teklifler?status=completed"
          className="rounded-xl border border-border bg-card p-5 hover:border-primary/40"
        >
          <div className="text-3xl font-bold text-emerald-600">{stats.completedQuotes}</div>
          <div className="mt-1 text-sm font-medium text-foreground">Tamamlanan iş</div>
        </Link>
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">Muhasebe</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {billing.pendingCount} bekleyen fatura
          {payouts.length > 0 ? ` · ${payouts.length} nakit ödeme talebi` : ""} · {billing.currentPeriodLabel}{" "}
          dönemi
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/sltn/muhasebe"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Fatura Kes & Beyanname
          </Link>
          {payouts.length > 0 && (
            <Link
              href="/sltn/muhasebe#payouts"
              className="rounded-lg border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
            >
              {payouts.length} ödeme talebi
            </Link>
          )}
          {billing.hasDeclaration && billing.latestDeclaration && (
            <Link
              href={`/sltn/beyanname/${billing.latestDeclaration.id}`}
              target="_blank"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Son Beyannameyi Aç
            </Link>
          )}
        </div>
      </section>

      {/* Gelir modeli açıklaması */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">Nasıl kazanırsınız?</h2>
        <p className="mt-2 text-sm text-primary font-medium">
          Uygun kontör paketleri ve düşük komisyon oranı.
        </p>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">1. Teklif kontörü:</strong> Kayıt onayında 5
            hediye kontör. Sonrasında paketler: 5 kontör 83 ₺, 10 kontör 115 ₺, 50 kontör 450 ₺.
          </p>
          <p>
            <strong className="text-foreground">2. İş komisyonu:</strong> Tamamlanan işten{" "}
            %{(stats.commissionRate * 100).toFixed(0)} komisyon. Örnek: 5.000 ₺ iş →{" "}
            {Math.round(5000 * stats.commissionRate).toLocaleString("tr-TR")} ₺ kazanç.
          </p>
          <p>
            <strong className="text-foreground">3. Premium üyelik:</strong> 230 ₺/ay — daha fazla
            teklif ve görünürlük.
          </p>
          <p>
            <strong className="text-foreground">4. Öne çıkarma & rozet:</strong> Profil öne
            çıkarma 76 ₺, doğrulanmış rozet 38 ₺.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Usta Başvuruları</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {pendingProviders.length} başvuru onay bekliyor
            </p>
          </div>
          <Link
            href="/sltn/ustalar"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Tümünü gör →
          </Link>
        </div>
        <ProviderApplicationsPanel providers={providers} showAll={false} />
      </section>

      {/* Hızlı işlemler */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/sltn/ustalar"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Usta başvurularını incele ({stats.pendingProviders})
        </Link>
        <Link
          href="/sltn/teklifler?status=awaiting_review"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent"
        >
          Teklif taleplerini yönet
        </Link>
        <Link
          href="/sltn/musteriler"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent"
        >
          Müşteri listesi
        </Link>
        <Link
          href="/sltn/usta-listesi"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent"
        >
          Usta listesi
        </Link>
      </div>
    </div>
  );
}
