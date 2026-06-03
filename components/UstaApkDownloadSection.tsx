"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUstaApkDownloadUrl, isExternalApkUrl, USTA_APP_VERSION } from "@/lib/usta-app-download";

type Props = {
  apkUrl: string;
};

export default function UstaApkDownloadSection({ apkUrl }: Props) {
  const [apkReady, setApkReady] = useState<boolean | null>(null);
  const external = isExternalApkUrl(apkUrl);

  useEffect(() => {
    if (external) {
      setApkReady(true);
      return;
    }
    let cancelled = false;
    fetch(apkUrl, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setApkReady(res.ok);
      })
      .catch(() => {
        if (!cancelled) setApkReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apkUrl, external]);

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Sürüm {USTA_APP_VERSION} · Android APK</p>

        {apkReady === null && !external && (
          <p className="mt-4 text-sm text-muted-foreground">İndirme bağlantısı kontrol ediliyor…</p>
        )}

        {apkReady === false && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">APK henüz sunucuya yüklenmemiş</p>
            <p className="mt-2">
              Sitedeki indirme linki şu an 404 veriyor. Geliştirici bilgisayarında build alınıp{" "}
              <code className="text-xs">public/downloads/cokusta-usta.apk</code> konulmalı veya
              Vercel&apos;de <code className="text-xs">NEXT_PUBLIC_USTA_APK_URL</code> tanımlanmalı.
            </p>
            <p className="mt-3 font-medium">Hemen test için Expo Go:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs">
              <li>Telefona Expo Go kurun</li>
              <li>Bilgisayarda: cd mobile → npm install → npx expo start</li>
              <li>QR kodu okutun, usta PIN ile giriş yapın</li>
            </ol>
          </div>
        )}

        {(apkReady === true || external) && (
          <>
            <a
              href={apkUrl}
              download={external ? undefined : "cokusta-usta.apk"}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-base font-bold text-white shadow-md transition hover:bg-primary-dark"
            >
              APK İndir
            </a>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Bağlantı:{" "}
              <a href={apkUrl} className="break-all font-medium text-primary hover:underline">
                {apkUrl}
              </a>
            </p>
          </>
        )}
      </div>

      <div className="space-y-4 text-sm text-muted-foreground">
        <h2 className="font-semibold text-foreground">Kurulum</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>APK dosyasını telefona indirin.</li>
          <li>
            Gerekirse <strong className="text-foreground">Ayarlar → Güvenlik</strong> bölümünden
            bilinmeyen kaynaklardan yüklemeye izin verin.
          </li>
          <li>İndirilen dosyaya dokunup <strong className="text-foreground">Yükle</strong> deyin.</li>
          <li>
            Önce webden{" "}
            <Link href="/usta/giris" className="text-primary hover:underline">
              usta girişi
            </Link>{" "}
            ile 4 haneli şifrenizi belirleyin.
          </li>
          <li>Uygulamayı açın; ilçe seçin ve bildirim iznini verin.</li>
        </ol>
      </div>

      <p className="text-sm text-muted-foreground">
        iPhone için şimdilik{" "}
        <Link href="/usta/teklifler" className="text-primary hover:underline">
          web usta paneli
        </Link>
        .
      </p>
    </div>
  );
}
