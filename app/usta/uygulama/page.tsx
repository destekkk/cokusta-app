import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UstaApkDownloadSection from "@/components/UstaApkDownloadSection";
import { getUstaApkDownloadUrl, isUstaApkPublished } from "@/lib/usta-app-download";

export const metadata = {
  title: "Usta Mobil Uygulama (APK) | Çokusta",
  description:
    "Çok Usta usta mobil uygulamasını indirin. İlçe bazlı talep uyarısı, sesli bildirim.",
};

export default function UstaAppDownloadPage() {
  const apkUrl = getUstaApkDownloadUrl();
  const apkAvailable = isUstaApkPublished();

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

        <UstaApkDownloadSection apkUrl={apkUrl} apkAvailable={apkAvailable} />
      </div>

      <Footer />
    </div>
  );
}
