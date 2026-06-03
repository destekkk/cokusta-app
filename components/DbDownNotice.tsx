"use client";

import { useEffect, useState } from "react";

export default function DbDownNotice() {
  const [down, setDown] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    fetch("/api/health")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.ok === false) {
          setDown(true);
          setHint(
            typeof data.message === "string"
              ? data.message.slice(0, 200)
              : "Veritabanı bağlantısı yok."
          );
        }
      })
      .catch(() => {
        setDown(true);
        setHint("Sunucuya ulaşılamıyor.");
      });
  }, []);

  if (!down) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">Veritabanı şu an kapalı</p>
      <p className="mt-1 text-amber-900/90">
        Usta ve müşteri girişi çalışmaz. Admin şifresi doğru olsa bile panel verisi yüklenmez. Bu
        genelde hack değil; Neon (veritabanı) veya Vercel ayarı kaynaklıdır.
      </p>
      {hint && <p className="mt-2 font-mono text-xs text-amber-800">{hint}</p>}
      <p className="mt-2 text-xs">
        Kontrol:{" "}
        <a href="https://console.neon.tech" className="font-semibold underline" target="_blank" rel="noreferrer">
          Neon paneli
        </a>
        , Vercel → Settings → Environment Variables → DATABASE_URL
      </p>
    </div>
  );
}
