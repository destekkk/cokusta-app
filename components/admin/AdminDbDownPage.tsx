import Link from "next/link";

type Props = {
  message?: string;
};

export default function AdminDbDownPage({ message }: Props) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
        <h1 className="text-xl font-bold text-amber-950">Veritabanı bağlantısı yok</h1>
        <p className="mt-3 text-sm text-amber-900/90">
          Admin oturumunuz açık olabilir ancak panel veritabanına bağlanamıyor. Site hacklenmiş
          olabilir; önce Neon ve Vercel ortam değişkenlerini kontrol edin.
        </p>
        {message && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-white/80 p-3 text-xs text-amber-950">
            {message}
          </pre>
        )}
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-amber-900">
          <li>
            <a href="https://console.neon.tech" className="font-semibold underline" target="_blank" rel="noreferrer">
              Neon
            </a>{" "}
            — proje askıda mı, şifre değişti mi?
          </li>
          <li>Vercel → DATABASE_URL ve DIRECT_URL doğru mu?</li>
          <li>Şüphe varsa ADMIN_PASSWORD ve ADMIN_SESSION_SECRET değiştirin</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/api/health"
            className="rounded-lg border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100"
            target="_blank"
          >
            Durum kontrolü (/api/health)
          </Link>
          <Link
            href="/sltn"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Giriş sayfası
          </Link>
        </div>
      </div>
    </div>
  );
}
