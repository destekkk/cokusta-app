import Link from "next/link";
import { LAUNCH_CAMPAIGN } from "@/lib/campaigns";
import { getLaunchCampaignStats } from "@/lib/db";

export default async function LaunchCampaignNotice() {
  const stats = await getLaunchCampaignStats();
  if (!stats.provider.active) return null;

  return (
    <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-primary">🎁 Lansman kampanyası</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {LAUNCH_CAMPAIGN.provider.title}. Onay sonrası hesabınıza otomatik yüklenir.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            <strong className="text-foreground">{stats.provider.remaining}</strong> kontenjan
            kaldı · Bu ay ilk {stats.provider.maxSlots} ustaya {stats.provider.freeCredits} kontör
          </p>
        </div>
        <div className="shrink-0 rounded-lg bg-primary px-4 py-2 text-center text-white">
          <div className="text-2xl font-bold">{stats.provider.freeCredits}</div>
          <div className="text-[10px] font-semibold uppercase">ücretsiz kontör</div>
        </div>
      </div>
    </div>
  );
}
