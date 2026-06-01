"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ustaHint, setUstaHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUstaHint(false);
    setLoading(true);

    try {
      const res = await fetch("/api/musteri/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.code === "PROVIDER_ACCOUNT") {
        setUstaHint(true);
        throw new Error(
          data.error ?? "Bu numarayla müşteri talebi bulunamadı. Usta hesabınız varsa usta girişinden devam edin."
        );
      }
      if (!res.ok) throw new Error(data.error ?? "Giriş başarısız");

      const redirect = searchParams.get("redirect") ?? "/musteri/teklifler";
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <p className="text-sm text-muted-foreground">
        Teklif alırken kullandığınız telefon numarasını girin. Tüm taleplerinizi ve gelen usta
        tekliflerini görebilirsiniz. Usta iseniz aynı numarayla teklif almaya devam edebilirsiniz.
      </p>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Telefon *</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="5XX XXX XX XX"
          className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-xs text-muted-foreground">Başına 0 yazmadan da girebilirsiniz.</p>
      </div>
      {error && (
        <div className="space-y-2">
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
          {ustaHint && (
            <Link href="/usta/giris" className="text-sm font-semibold text-primary hover:underline">
              Usta girişi yap →
            </Link>
          )}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {loading ? "Giriş yapılıyor…" : "Tekliflerimi Gör"}
      </button>
    </form>
  );
}
