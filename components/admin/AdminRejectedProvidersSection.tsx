"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatDateTime } from "@/lib/admin-labels";
import type { ProviderRegistration } from "@/lib/types";

type Props = {
  providers: ProviderRegistration[];
  detailBasePath?: string;
};

export default function AdminRejectedProvidersSection({
  providers,
  detailBasePath = "/sltn/ustalar",
}: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const sorted = useMemo(
    () =>
      [...providers].sort(
        (a, b) =>
          new Date(b.reviewedAt ?? b.createdAt).getTime() -
          new Date(a.reviewedAt ?? a.createdAt).getTime()
      ),
    [providers]
  );

  const deleteOne = async (provider: ProviderRegistration) => {
    if (!confirm(`${provider.name} kalıcı olarak silinsin mi?`)) return;
    setLoadingId(provider.id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/usta/${provider.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Silinemedi");
      setMessage(`${provider.name} silindi.`);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Silinemedi");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section id="reddedilmis-ustalar" className="mt-10 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-red-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Reddedilmiş usta başvuruları</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Onay bekleyen listeden reddettiğiniz başvurular burada görünür. Kalıcı silmek için Sil
            kullanın.
          </p>
        </div>
        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
          {sorted.length}
        </span>
      </div>

      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}

      {sorted.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
          Reddedilmiş başvuru yok.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-red-200/80 bg-card">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border bg-red-50/80 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Usta</th>
                <th className="px-4 py-3">İletişim</th>
                <th className="px-4 py-3">Şehir</th>
                <th className="px-4 py-3">Red nedeni</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((provider) => (
                <tr key={provider.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`${detailBasePath}/${provider.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {provider.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{provider.phone}</td>
                  <td className="px-4 py-3">{provider.city}</td>
                  <td className="max-w-[200px] px-4 py-3 text-xs text-muted-foreground">
                    {provider.rejectionReason?.trim() || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateTime(provider.reviewedAt ?? provider.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={loadingId === provider.id}
                      onClick={() => void deleteOne(provider)}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      {loadingId === provider.id ? "…" : "Sil"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
