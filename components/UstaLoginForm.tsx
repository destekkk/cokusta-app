"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UstaLoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/usta/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Giriş başarısız");
      router.push("/usta/teklifler");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Kayıtlı telefon numaranız</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="05XX XXX XX XX"
          className="w-full rounded-xl border border-border px-4 py-3 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
      <p className="text-xs text-muted-foreground">
        Sadece onaylı ustalar giriş yapabilir. Henüz kayıt yoksa{" "}
        <a href="/usta-ol" className="text-primary hover:underline">
          usta ol
        </a>{" "}
        sayfasından başvurun.
      </p>
    </form>
  );
}
