import Link from "next/link";
import { USTA_APP_VERSION } from "@/lib/usta-app-download";

type Props = {
  apkUrl: string;
  apkAvailable: boolean;
};

export default function UstaApkDownloadSection({ apkUrl, apkAvailable }: Props) {
  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Sürüm {USTA_APP_VERSION} · Android</p>

        {apkAvailable ? (
          <>
            <a
              href={apkUrl}
              download={apkUrl.includes("/downloads/cokusta-usta.apk") ? "cokusta-usta.apk" : undefined}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-base font-bold text-white shadow-md transition hover:bg-primary-dark"
            >
              Uygulamayı İndir (APK)
            </a>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Ücretsiz indirme · Web hesabınızla aynı telefon ve PIN
            </p>
          </>
        ) : (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Mobil uygulama yakında</p>
            <p className="mt-2">
              Android uygulaması hazırlanıyor. Şimdilik tüm işlemlerinizi tarayıcıdan
              yapabilirsiniz — talep uyarıları ve teklif verme web panelinde açık.
            </p>
            <Link
              href="/usta/giris"
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Web usta paneline git
            </Link>
          </div>
        )}
      </div>

      {apkAvailable && (
        <div className="space-y-4 text-sm text-muted-foreground">
          <h2 className="font-semibold text-foreground">Kurulum</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>APK dosyasını telefona indirin.</li>
            <li>
              Gerekirse <strong className="text-foreground">Ayarlar → Güvenlik</strong> bölümünden
              bilinmeyen kaynaklardan yüklemeye izin verin.
            </li>
            <li>
              İndirilen dosyaya dokunup <strong className="text-foreground">Yükle</strong> deyin.
            </li>
            <li>
              Önce webden{" "}
              <Link href="/usta/giris" className="text-primary hover:underline">
                usta girişi
              </Link>{" "}
              ile 6 haneli şifrenizi belirleyin.
            </li>
            <li>Uygulamayı açın; ilçe seçin ve bildirim iznini verin.</li>
          </ol>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        iPhone için{" "}
        <Link href="/usta/teklifler" className="text-primary hover:underline">
          web usta paneli
        </Link>
        .
      </p>
    </div>
  );
}
