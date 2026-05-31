"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "set-pin";

export default function UstaLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/usta/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin }),
      });
      const data = await res.json();
      if (data.code === "NO_PIN_SET") {
        setMode("set-pin");
        throw new Error(data.error ?? "Giriş şifreniz tanımlı değil.");
      }
      if (data.code === "PENDING_APPROVAL") {
        throw new Error(
          data.error ?? "Başvurunuz henüz onaylanmadı. Onay sonrası tekrar deneyin."
        );
      }
      if (!res.ok) throw new Error(data.error ?? "Giriş başarısız");
      router.push("/usta/teklifler");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/usta/sifre-belirle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin, pinConfirm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Şifre belirlenemedi");

      setPin("");
      setPinConfirm("");
      setMode("login");
      setError("");
      setSuccessMessage("Giriş şifreniz kaydedildi. Şimdi giriş yapabilirsiniz.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Şifre belirlenemedi");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "set-pin") {
    return (
      <form
        onSubmit={handleSetPin}
        className="space-y-4 rounded-2xl border border-border bg-card p-6"
      >
        <div>
          <h2 className="font-semibold">Giriş şifresi belirle</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Onaylı hesabınız için 4 haneli bir giriş şifresi oluşturun. 1234 ve 0000 kullanılamaz.
          </p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Telefon numaranız</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="5XX XXX XX XX"
            className="w-full rounded-xl border border-border px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">4 haneli şifre</label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            className="w-full rounded-xl border border-border px-4 py-3 text-sm tracking-widest"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Şifre tekrar</label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={4}
            value={pinConfirm}
            onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            className="w-full rounded-xl border border-border px-4 py-3 text-sm tracking-widest"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Kaydediliyor…" : "Şifreyi Kaydet"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
            setPinConfirm("");
          }}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          ← Girişe dön
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      {reason === "pending" && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Başvurunuz inceleniyor. Admin onayından sonra giriş yapabilirsiniz.
        </p>
      )}
      {reason === "rejected" && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Başvurunuz reddedildi. Sorularınız için WhatsApp veya destek hattından bize ulaşın.
        </p>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Kayıtlı telefon numaranız</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="5XX XXX XX XX veya 05XX XXX XX XX"
          className="w-full rounded-xl border border-border px-4 py-3 text-sm"
        />
        <p className="mt-1 text-xs text-muted-foreground">Başına 0 yazmadan da girebilirsiniz.</p>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">4 haneli giriş şifresi</label>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="••••"
          className="w-full rounded-xl border border-border px-4 py-3 text-sm tracking-widest"
        />
      </div>
      {successMessage && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</p>
      )}
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
        sayfasından başvurun.{" "}
        <button
          type="button"
          onClick={() => {
            setMode("set-pin");
            setError("");
          }}
          className="text-primary hover:underline"
        >
          İlk kez şifre belirle
        </button>
      </p>
    </form>
  );
}
