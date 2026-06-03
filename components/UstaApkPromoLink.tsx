import Link from "next/link";
import { isUstaApkPublished } from "@/lib/usta-app-download";

/** Giriş sayfasında — yalnızca APK yayında ise gösterilir */
export default function UstaApkPromoLink() {
  if (!isUstaApkPublished()) return null;

  return (
    <p className="mt-3">
      <Link
        href="/usta/uygulama"
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
      >
        Android uygulamasını indir →
      </Link>
    </p>
  );
}
