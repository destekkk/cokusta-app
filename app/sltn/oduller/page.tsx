import { currentPeriod } from "@/lib/blockchain";
import {
  getMonthlyLeaderboard,
  getProviderOfTheMonthByPeriod,
  getProviderOfTheMonthHistory,
  getProviderSummaries,
} from "@/lib/db";
import ProviderOfMonthManager from "@/components/admin/ProviderOfMonthManager";

export default async function AdminProviderOfMonthPage() {
  const period = currentPeriod();
  const [providers, currentSelection, history, leaderboard] = await Promise.all([
    getProviderSummaries(),
    getProviderOfTheMonthByPeriod(period),
    getProviderOfTheMonthHistory(),
    getMonthlyLeaderboard(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Ayın Ustası</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ustayı seçin, onay bekletin; yayınladığınızda ana sayfada görünür ve 30 kontör hediye edilir.
      </p>

      <div className="mt-6">
        <ProviderOfMonthManager
          providers={providers}
          currentSelection={currentSelection}
          history={history}
          leaderboard={leaderboard}
        />
      </div>
    </div>
  );
}
