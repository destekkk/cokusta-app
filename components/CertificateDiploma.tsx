import type { ProviderCertificate } from "@/lib/types";
import type { CertificateBlock } from "@/lib/types";

type Props = {
  certificate: ProviderCertificate;
  valid: boolean;
  block?: CertificateBlock;
  chainLength?: number;
  categoryNames?: string;
};

function CornerOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 4h14v2H6v12H4V4zm30 0v14h-2V6H20V4h14zm0 30v-14h2v16H34V44H20v-2h12zM4 34h14v2H6v12H4V34z"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M8 8c6 2 10 6 12 12M8 40c6-2 10-6 12-12M40 8c-6 2-10 6-12 12M40 40c-6-2-10-6-12-12"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.55"
      />
    </svg>
  );
}

function OfficialSeal() {
  return (
    <div
      className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[3px] border-amber-700/80 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 shadow-inner"
      aria-hidden
    >
      <div className="absolute inset-1 rounded-full border border-dashed border-amber-600/50" />
      <div className="text-center">
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-900/80">
          Çokusta
        </div>
        <div className="mt-0.5 text-2xl font-bold text-orange-600">✓</div>
        <div className="text-[8px] font-semibold uppercase tracking-wider text-amber-800/70">
          Onaylı
        </div>
      </div>
    </div>
  );
}

export default function CertificateDiploma({
  certificate,
  valid,
  block,
  chainLength,
  categoryNames,
}: Props) {
  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isProviderOfMonth = certificate.type === "provider_of_month";

  return (
    <div className="certificate-diploma mx-auto max-w-4xl">
      {/* Diploma sheet */}
      <div
        className="relative overflow-hidden bg-[#faf7f0] shadow-2xl"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.08) 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(30, 41, 59, 0.04) 0%, transparent 40%)",
        }}
      >
        {/* Outer frame */}
        <div className="m-3 border-[3px] border-amber-800/70 sm:m-5">
          <div className="m-1.5 border border-amber-700/40 sm:m-2">
            <div className="relative px-6 py-10 sm:px-12 sm:py-14">
              <CornerOrnament className="pointer-events-none absolute left-3 top-3 h-10 w-10 text-amber-800/60 sm:h-12 sm:w-12" />
              <CornerOrnament className="pointer-events-none absolute right-3 top-3 h-10 w-10 rotate-90 text-amber-800/60 sm:h-12 sm:w-12" />
              <CornerOrnament className="pointer-events-none absolute bottom-3 left-3 h-10 w-10 -rotate-90 text-amber-800/60 sm:h-12 sm:w-12" />
              <CornerOrnament className="pointer-events-none absolute bottom-3 right-3 h-10 w-10 rotate-180 text-amber-800/60 sm:h-12 sm:w-12" />

              {/* Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center border-[3px] border-primary bg-primary-light px-4 py-1.5">
                  <span className="font-serif text-lg font-bold tracking-wide text-secondary sm:text-xl">
                    çok<span className="text-primary">usta</span>
                  </span>
                </div>
                <p className="mt-5 font-serif text-xs font-semibold uppercase tracking-[0.35em] text-amber-900/80 sm:text-sm">
                  Kurumsal Hizmet Pazaryeri
                </p>
                <div className="mx-auto mt-4 flex max-w-md items-center gap-3">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
                  <span className="font-serif text-[10px] uppercase tracking-[0.25em] text-amber-800/70">
                    ★
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
                </div>
                <h1 className="mt-5 font-serif text-3xl font-bold uppercase tracking-wide text-slate-900 sm:text-4xl">
                  {isProviderOfMonth ? "Onur Belgesi" : "Başarı Belgesi"}
                </h1>
                <p className="mt-2 font-serif text-base italic text-slate-600 sm:text-lg">
                  {certificate.title}
                </p>
              </div>

              {/* Body */}
              <div className="mt-10 text-center font-serif text-slate-700">
                <p className="text-sm leading-relaxed sm:text-base">
                  Çokusta platformu tarafından aşağıda adı geçen ustanın
                </p>
                <p className="mt-2 text-sm leading-relaxed sm:text-base">
                  üstün hizmet kalitesi, müşteri memnuniyeti ve güvenilirliği
                </p>
                <p className="mt-2 text-sm leading-relaxed sm:text-base">
                  {isProviderOfMonth
                    ? "nedeniyle ayın ustası olarak seçildiği"
                    : "nedeniyle ödüllendirildiği"}{" "}
                  onaylanmıştır.
                </p>

                <p className="mt-8 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Bu belge sahibi
                </p>
                <p className="mt-3 font-serif text-4xl font-bold text-slate-900 sm:text-5xl">
                  {certificate.providerName}
                </p>

                {certificate.metadata.city && (
                  <p className="mt-3 text-sm text-slate-600">{certificate.metadata.city}</p>
                )}

                {categoryNames && (
                  <p className="mx-auto mt-4 max-w-lg text-sm italic text-slate-600">
                    Uzmanlık alanları: {categoryNames}
                  </p>
                )}

                {certificate.description && (
                  <p className="mx-auto mt-5 max-w-2xl border-t border-b border-amber-800/15 py-4 text-sm leading-relaxed text-slate-600">
                    {certificate.description}
                  </p>
                )}

                {(certificate.metadata.completedJobs !== undefined ||
                  certificate.metadata.totalEarnings !== undefined) && (
                  <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-6 text-sm text-slate-600">
                    {certificate.metadata.completedJobs !== undefined && (
                      <div>
                        <span className="font-semibold text-slate-900">
                          {certificate.metadata.completedJobs}
                        </span>{" "}
                        tamamlanan iş
                      </div>
                    )}
                    {certificate.metadata.totalEarnings !== undefined && (
                      <div>
                        <span className="font-semibold text-slate-900">
                          {certificate.metadata.totalEarnings.toLocaleString("tr-TR")} ₺
                        </span>{" "}
                        toplam kazanç
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer: seal, date, signature */}
              <div className="mt-12 flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-end">
                <div className="text-center sm:text-left">
                  <p className="font-serif text-xs uppercase tracking-wider text-slate-500">
                    Veriliş tarihi
                  </p>
                  <p className="mt-1 font-serif text-lg font-semibold text-slate-900">
                    {issuedDate}
                  </p>
                  {certificate.period && (
                    <p className="mt-1 text-sm text-slate-600">{certificate.period}</p>
                  )}
                </div>

                <OfficialSeal />

                <div className="text-center sm:text-right">
                  <div className="mx-auto w-40 border-b border-slate-800/70 sm:mx-0 sm:ml-auto" />
                  <p className="mt-2 font-serif text-sm font-semibold text-slate-800">
                    Çokusta Yönetimi
                  </p>
                  <p className="text-xs text-slate-500">Yetkili İmza</p>
                </div>
              </div>

              <p className="mt-10 text-center font-mono text-[10px] tracking-wider text-slate-400">
                Belge No: {certificate.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification strip */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-sm font-bold text-foreground">
            Dijital Doğrulama
          </h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              valid ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
            }`}
          >
            {valid ? "✓ Geçerli belge" : "✗ Doğrulanamadı"}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Bu belge SHA-256 hash zinciri ile kayıt altına alınmıştır. Sahteciliğe karşı
          blok #{certificate.blockIndex} üzerinden doğrulanabilir.
        </p>
        <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
          <div className="rounded-lg bg-muted/40 p-3">
            <dt className="font-medium text-muted-foreground">Blok hash</dt>
            <dd className="mt-1 break-all font-mono text-[10px] text-foreground">
              {certificate.blockHash}
            </dd>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <dt className="font-medium text-muted-foreground">Zincir uzunluğu</dt>
            <dd className="mt-1 font-mono text-foreground">{chainLength ?? "—"} kayıt</dd>
          </div>
          {block && (
            <div className="rounded-lg bg-muted/40 p-3 sm:col-span-2">
              <dt className="font-medium text-muted-foreground">Zaman damgası</dt>
              <dd className="mt-1 font-mono text-foreground">
                {new Date(block.timestamp).toLocaleString("tr-TR")}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
