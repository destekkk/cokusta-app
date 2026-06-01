import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUstaApkDownloadUrl, USTA_APP_VERSION } from "@/lib/usta-app-download";

export const metadata = {
  title: "Usta Mobil Uygulama (APK) | Çokusta",
  description:
    "Çok Usta usta mobil uygulamasını indirin. İlçe bazlı talep uyarısı, sesli bildirim.",
};

export default function UstaAppDownloadPage() {
  const apkUrl = getUstaApkDownloadUrl();

  return (
    <div className="min-h-full bg-background">
      <Header />

      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Android</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Usta Mobil Uygulama</h1>
        <p className="mt-3 text-muted-foreground">
          İlçenizde yeni talep açılınca ses ve titreşimle haberdar olun. Web hesabınızla aynı
          telefon ve PIN ile giriş yapın.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Sürüm {USTA_APP_VERSION} · Test APK</p>
          <a
            href={apkUrl}
            download="cokusta-usta.apk"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-base font-bold text-white shadow-md transition hover:bg-primary-dark"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
              />
            </svg>
            APK İndir
          </a>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Doğrudan indirme başlamazsa{" "}
            <a href={apkUrl} className="font-medium text-primary hover:underline">
              bu bağlantıya
            </a>{" "}
            dokunun.
          </p>
        </div>

        <div className="mt-8 space-y-4 text-sm text-muted-foreground">
          <h2 className="font-semibold text-foreground">Kurulum</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>APK dosyasını telefona indirin.</li>
            <li>
              Gerekirse <strong className="text-foreground">Ayarlar → Güvenlik</strong> bölümünden
              bilinmeyen kaynaklardan yüklemeye izin verin.
            </li>
            <li>İndirilen dosyaya dokunup <strong className="text-foreground">Yükle</strong> deyin.</li>
            <li>
              Uygulamayı açın; önce webden{" "}
              <Link href="/usta/giris" className="text-primary hover:underline">
                usta girişi
              </Link>{" "}
              ile şifrenizi belirleyin.
            </li>
            <li>İlçe seçin ve bildirim iznini açın.</li>
          </ol>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          iPhone kullanıyorsanız şimdilik{" "}
          <Link href="/usta/teklifler" className="text-primary hover:underline">
            web usta panelini
          </Link>{" "}
          kullanın.
        </p>
      </div>

      <Footer />
    </div>
  );
}
