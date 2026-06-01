"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type Mode = "login" | "set-pin";

export default function CustomerLoginForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ustaHint, setUstaHint] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const redirect = searchParams.get("redirect") ?? "/musteri/teklifler";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUstaHint(false);
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/musteri/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ phone, pin }),
      });
      const data = await res.json();
      if (data.code === "PROVIDER_ACCOUNT") {
        setUstaHint(true);
        throw new Error(data.error);
      }
      if (data.code === "NO_PIN_SET") {
        setMode("set-pin");
        throw new Error(data.error ?? "Giriş şifreniz tanımlı değil.");
      }
      if (!res.ok) throw new Error(data.error ?? "Giriş başarısız");

      // Tam sayfa yönlendirme — çerez middleware'e ulaşmadan client router geçmesin
      window.location.assign(redirect);
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
      const res = await fetch("/api/musteri/sifre-belirle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin, pinConfirm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Şifre belirlenemedi");

      setPin("");
      setPinConfirm("");
      setMode("login");
      setSuccessMessage("Giriş şifreniz kaydedildi. Şimdi giriş yapabilirsiniz.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Şifre belirlenemedi");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "set-pin") {
    return (
      <form onSubmit={handleSetPin} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <h2 className="font-semibold">Müşteri giriş şifresi belirle</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Tekliflerinizi güvenle görüntülemek için 4 haneli bir şifre oluşturun.
          </p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Telefon</label>
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
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm tracking-widest"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Şifre tekrar</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pinConfirm}
            onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
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
          }}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          ← Girişe dön
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">
        Teklif alırken kullandığınız telefon numarası ve 4 haneli şifrenizle müşteri panelinize girin.
      </p>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Telefon</label>
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
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          className="w-full rounded-xl border border-border px-4 py-3 text-sm tracking-widest"
        />
      </div>
      {successMessage && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</p>
      )}
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
        {loading ? "Giriş yapılıyor…" : "Panele Gir"}
      </button>
      <p className="text-xs text-muted-foreground">
        İlk kez mi giriyorsunuz?{" "}
        <button
          type="button"
          onClick={() => {
            setMode("set-pin");
            setError("");
          }}
          className="text-primary hover:underline"
        >
          Şifre belirle
        </button>
      </p>
    </form>
  );
}
