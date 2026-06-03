"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getCategoryName } from "@/lib/data/categories";
import { formatDateTime, formatExperience } from "@/lib/admin-labels";
import ProviderActions from "@/components/admin/ProviderActions";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
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

type StatusFilter = "all" | ProviderRegistration["status"];

type Props = {
  providers: ProviderRegistration[];
  showAll?: boolean;
  detailBasePath?: string;
  initialStatus?: StatusFilter;
};

const PAGE_SIZE = 30;

function matchesSearch(provider: ProviderRegistration, query: string): boolean {
  const q = query.trim().toLocaleLowerCase("tr-TR");
  if (!q) return true;
  const haystack = [
    provider.name,
    provider.companyName ?? "",
    provider.phone,
    provider.email ?? "",
    provider.city,
    ...provider.categorySlugs.map(getCategoryName),
  ]
    .join(" ")
    .toLocaleLowerCase("tr-TR");
  return haystack.includes(q);
}

export default function ProviderApplicationsPanel({
  providers,
  showAll = true,
  detailBasePath = "/sltn/ustalar",
  initialStatus = showAll ? "pending" : "pending",
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    showAll ? initialStatus : "pending"
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const baseList = showAll ? providers : providers.filter((p) => p.status === "pending");

  const filtered = useMemo(() => {
    return baseList.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return matchesSearch(p, search);
    });
  }, [baseList, statusFilter, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: baseList.length };
    for (const p of baseList) {
      counts[p.status] = (counts[p.status] ?? 0) + 1;
    }
    return counts;
  }, [baseList]);

  const selectedIds = [...selected];
  const allPageSelected =
    pageItems.length > 0 && pageItems.every((p) => selected.has(p.id));

  const toggleAllPage = () => {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const p of pageItems) next.delete(p.id);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const p of pageItems) next.add(p.id);
        return next;
      });
    }
  };

  const runBulk = async (action: "approve" | "reject") => {
    if (selectedIds.length === 0) {
      setMessage("En az bir başvuru seçin.");
      return;
    }
    setLoading(action);
    setMessage("");
    try {
      const res = await fetch("/api/admin/usta/toplu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İşlem başarısız");
      const ok = data.succeeded?.length ?? 0;
      const fail = data.failed?.length ?? 0;
      setMessage(
        action === "reject" && ok > 0
          ? `${ok} başvuru reddedildi — alttaki «Reddedilmiş usta başvuruları» listesinde.`
          : `${ok} başvuru güncellendi${fail > 0 ? `, ${fail} başarısız` : ""}.`
      );
      setSelected(new Set());
      if (action === "reject" && ok > 0) {
        router.push("/sltn/ustalar#reddedilmis-ustalar");
      }
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setLoading(null);
    }
  };

  if (baseList.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Onay bekleyen usta başvurusu yok. Reddettikleriniz sayfanın altındaki listede görünür.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showAll && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Tümü"],
              ["pending", "Bekliyor"],
              ["approved", "Onaylı"],
              ["rejected", "Reddedildi"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setStatusFilter(key);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === key
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {label} ({statusCounts[key] ?? 0})
            </button>
          ))}
        </div>
      )}

      <AdminTableToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Ad, telefon, şehir, kategori…"
        total={baseList.length}
        shown={filtered.length}
        page={safePage}
        pageCount={pageCount}
        onPageChange={setPage}
      />

      {selectedIds.length > 0 && (
        <div className="sticky top-16 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-sm">
          <span className="text-sm font-medium">{selectedIds.length} seçili</span>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => runBulk("approve")}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading === "approve" ? "…" : "Toplu Onayla"}
          </button>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => runBulk("reject")}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            {loading === "reject" ? "…" : "Toplu Reddet"}
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            Seçimi temizle
          </button>
        </div>
      )}

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              {showAll && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAllPage}
                    aria-label="Sayfadakileri seç"
                  />
                </th>
              )}
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
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={showAll ? 9 : 8} className="px-4 py-12 text-center text-muted-foreground">
                  Sonuç bulunamadı.
                </td>
              </tr>
            ) : (
              pageItems.map((provider) => (
                <tr key={provider.id} className="border-b border-border last:border-0">
                  {showAll && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(provider.id)}
                        onChange={() => {
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (next.has(provider.id)) next.delete(provider.id);
                            else next.add(provider.id);
                            return next;
                          });
                        }}
                        aria-label={`${provider.name} seç`}
                      />
                    </td>
                  )}
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
                      <ProviderActions providerId={provider.id} status={provider.status} compact />
                      <Link
                        href={`${detailBasePath}/${provider.id}`}
                        className="text-xs font-medium text-muted-foreground hover:text-primary"
                      >
                        Detay →
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
