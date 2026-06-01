import { notFound } from "next/navigation";
import { Playfair_Display, Cormorant_Garamond } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CertificateDiploma from "@/components/CertificateDiploma";
import CertificatePrintActions from "@/components/CertificatePrintActions";
import { verifyCertificateChain } from "@/lib/db";
import { categories } from "@/lib/data/categories";

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const dynamic = "force-dynamic";

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
    <div
      className={`${playfair.variable} ${cormorant.variable} min-h-full bg-[#eceae4]`}
      style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
    >
      <style>{`
        .certificate-diploma .font-serif {
          font-family: var(--font-playfair), Georgia, serif;
        }
        @media print {
          header, footer, .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="no-print">
        <Header />
      </div>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <CertificateDiploma
          certificate={certificate}
          valid={valid}
          block={block}
          chainLength={chainLength}
          categoryNames={categoryNames}
        />

        <CertificatePrintActions />
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
