import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { verifyCertificateChain } from "@/lib/db";
import { categories } from "@/lib/data/categories";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const result = await verifyCertificateChain(id);
  if (!result.certificate) return { title: "Sertifika Bulunamadı" };

  return {
    title: `${result.certificate.title} — Çokusta`,
    description: result.certificate.description,
  };
}

export default async function CertificatePage({ params }: Props) {
  const { id } = await params;
  const result = await verifyCertificateChain(id);

  if (!result.certificate) notFound();

  const { certificate, valid, block, chainLength } = result;
  const categoryNames = (certificate.metadata.categories ?? [])
    .map((slug) => categories.find((cat) => cat.slug === slug)?.name ?? slug)
    .join(", ");

  return (
    <div className="min-h-full bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="overflow-hidden rounded-2xl border-2 border-primary/30 bg-card shadow-lg">
          <div className="bg-secondary px-6 py-8 text-center text-white">
            <div className="text-xs uppercase tracking-widest text-white/60">
              Çokusta Blockchain Sertifikası
            </div>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{certificate.title}</h1>
            <p className="mt-3 text-lg text-primary-light">{certificate.providerName}</p>
            {certificate.period && (
              <p className="mt-1 text-sm text-white/70">{certificate.period}</p>
            )}
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <p className="text-center text-muted-foreground">{certificate.description}</p>

            <div className="grid gap-4 sm:grid-cols-3">
              {certificate.metadata.completedJobs !== undefined && (
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {certificate.metadata.completedJobs}
                  </div>
                  <div className="text-xs text-muted-foreground">Tamamlanan iş</div>
                </div>
              )}
              {certificate.metadata.totalEarnings !== undefined && (
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {certificate.metadata.totalEarnings.toLocaleString("tr-TR")} ₺
                  </div>
                  <div className="text-xs text-muted-foreground">Toplam kazanç</div>
                </div>
              )}
              {certificate.metadata.city && (
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <div className="text-lg font-bold text-primary">{certificate.metadata.city}</div>
                  <div className="text-xs text-muted-foreground">Şehir</div>
                </div>
              )}
            </div>

            {categoryNames && (
              <div className="text-center text-sm text-muted-foreground">
                Hizmet alanları: {categoryNames}
              </div>
            )}

            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-bold text-foreground">Blockchain Doğrulama</h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    valid
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {valid ? "✓ Geçerli" : "✗ Geçersiz"}
                </span>
              </div>

              <dl className="mt-4 space-y-3 text-xs">
                <div>
                  <dt className="font-medium text-muted-foreground">Blok indeksi</dt>
                  <dd className="mt-0.5 font-mono text-foreground">#{certificate.blockIndex}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Zincir uzunluğu</dt>
                  <dd className="mt-0.5 font-mono text-foreground">{chainLength ?? "—"} blok</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Blok hash (SHA-256)</dt>
                  <dd className="mt-0.5 break-all font-mono text-foreground">
                    {certificate.blockHash}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Önceki blok hash</dt>
                  <dd className="mt-0.5 break-all font-mono text-foreground">
                    {certificate.previousHash}
                  </dd>
                </div>
                {block && (
                  <div>
                    <dt className="font-medium text-muted-foreground">Zaman damgası</dt>
                    <dd className="mt-0.5 font-mono text-foreground">
                      {new Date(block.timestamp).toLocaleString("tr-TR")}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Veriliş: {new Date(certificate.issuedAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">
            ← Ana sayfaya dön
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
