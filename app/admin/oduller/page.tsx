import {
  getAllCertificates,
  getCurrentProviderOfTheMonth,
  getMonthlyLeaderboard,
  getProviderOfTheMonthHistory,
  getProviderSummaries,
} from "@/lib/db";
import ProviderAwardsManager from "@/components/admin/ProviderAwardsManager";

export default async function AdminAwardsPage() {
  const [providers, certificates, currentMonth, history, leaderboard] = await Promise.all([
    getProviderSummaries(),
    getAllCertificates(),
    getCurrentProviderOfTheMonth(),
    getProviderOfTheMonthHistory(),
    getMonthlyLeaderboard(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Ödüller & Sertifikalar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Blockchain tabanlı usta sertifikaları ve ayın ustası seçimi
      </p>

      <div className="mt-6">
        <ProviderAwardsManager
          providers={providers}
          certificates={certificates}
          currentMonth={currentMonth}
          history={history}
          leaderboard={leaderboard}
        />
      </div>
    </div>
  );
}
