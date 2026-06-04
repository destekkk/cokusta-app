"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import DbDownNotice from "@/components/DbDownNotice";

export default function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Giriş başarısız");
      }

      const redirect = searchParams.get("redirect") ?? "/sltn/panel";
      // Tam sayfa: çerez sonrası panel hemen açılsın (router.push bazen yenileme ister)
      window.location.assign(redirect);
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-card p-8 shadow-xl">
        <div className="flex flex-col items-center">
          <Logo size="md" />
          <p className="mt-3 text-sm text-muted-foreground">Yönetim girişi</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <DbDownNotice />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Şifre"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
