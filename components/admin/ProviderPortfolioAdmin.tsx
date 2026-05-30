"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProviderPortfolioItem } from "@/lib/types";

type Props = {
  providerId: string;
  providerName: string;
  items: ProviderPortfolioItem[];
};

export default function ProviderPortfolioAdmin({ providerId, providerName, items }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const removeItem = async (itemId: string) => {
    if (!confirm("Bu proje silinsin mi?")) return;

    setLoading(itemId);
    try {
      const res = await fetch(`/api/admin/usta/${providerId}/portfolyo/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Silinemedi");
      router.refresh();
    } catch {
      alert("Proje silinemedi.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Portfolyo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {providerName} — {items.length} proje
          </p>
        </div>
        <Link
          href={`/usta/${providerId}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Public profil →
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Henüz proje eklenmemiş.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-border">
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <div className="font-medium text-sm text-foreground">{item.title}</div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {item.description}
                </p>
                <button
                  type="button"
                  disabled={loading === item.id}
                  onClick={() => removeItem(item.id)}
                  className="mt-2 text-xs font-semibold text-red-600 hover:underline disabled:opacity-60"
                >
                  {loading === item.id ? "Siliniyor..." : "Sil"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
