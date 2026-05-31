import Link from "next/link";
import { getCategoryName } from "@/lib/data/categories";
import { formatDateTime, formatExperience } from "@/lib/admin-labels";
import ProviderActions from "@/components/admin/ProviderActions";
import type { ProviderRegistration } from "@/lib/types";

const statusLabels: Record<ProviderRegistration["status"], string> = {
  pending: "Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};

const statusColors: Record<ProviderRegistration["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

type Props = {
  providers: ProviderRegistration[];
  showAll?: boolean;
  detailBasePath?: string;
};

export default function ProviderApplicationsTable({
  providers,
  showAll = true,
  detailBasePath = "/admin/ustalar",
}: Props) {
  const list = showAll
    ? providers
    : providers.filter((provider) => provider.status === "pending");

  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Onay bekleyen usta başvurusu yok.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Usta</th>
            <th className="px-4 py-3">İletişim</th>
            <th className="px-4 py-3">Şehir</th>
            <th className="px-4 py-3">Kategoriler</th>
            <th className="px-4 py-3">Deneyim</th>
            <th className="px-4 py-3">Durum</th>
            <th className="px-4 py-3">Tarih</th>
            <th className="px-4 py-3">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {list.map((provider) => (
            <tr key={provider.id} className="border-b border-border last:border-0">
              <td className="px-4 py-4">
                <Link
                  href={`${detailBasePath}/${provider.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {provider.name}
                </Link>
                {provider.companyName && (
                  <div className="text-xs text-muted-foreground">{provider.companyName}</div>
                )}
              </td>
              <td className="px-4 py-4">
                <div>{provider.phone}</div>
                {provider.email && (
                  <div className="text-xs text-muted-foreground">{provider.email}</div>
                )}
              </td>
              <td className="px-4 py-4">{provider.city}</td>
              <td className="px-4 py-4">
                <div className="max-w-[180px] truncate text-xs">
                  {provider.categorySlugs.map(getCategoryName).join(", ")}
                </div>
              </td>
              <td className="px-4 py-4">{formatExperience(provider.experience)}</td>
              <td className="px-4 py-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[provider.status]}`}
                >
                  {statusLabels[provider.status]}
                </span>
              </td>
              <td className="px-4 py-4 text-xs text-muted-foreground">
                {formatDateTime(provider.createdAt)}
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-col gap-2">
                  <ProviderActions
                    providerId={provider.id}
                    status={provider.status}
                    compact
                  />
                  <Link
                    href={`${detailBasePath}/${provider.id}`}
                    className="text-xs font-medium text-muted-foreground hover:text-primary"
                  >
                    Detay →
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
