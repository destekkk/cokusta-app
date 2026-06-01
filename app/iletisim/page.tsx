import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import LegalPageLayout from "@/components/LegalPageLayout";
import { companyInfo } from "@/lib/data/company";

export const metadata = {
  title: "İletişim | Çokusta",
  description: "Çokusta ile iletişime geçin. Sorularınız, önerileriniz ve destek talepleriniz için bize ulaşın.",
};

export default function ContactPage() {
  return (
    <LegalPageLayout
      title="İletişim"
      description="Sorularınız ve destek talepleriniz için bize ulaşın"
    >
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">İletişim Bilgileri</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <strong className="text-foreground">Unvan:</strong> {companyInfo.legalName}
              </li>
              <li>
                <strong className="text-foreground">Adres:</strong> {companyInfo.address}
              </li>
              <li>
                <strong className="text-foreground">E-posta:</strong>{" "}
                <a href={`mailto:${companyInfo.email}`} className="text-primary hover:underline">
                  {companyInfo.email}
                </a>
              </li>
              <li>
                <strong className="text-foreground">Telefon:</strong>{" "}
                <a href={`tel:${companyInfo.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                  {companyInfo.phone}
                </a>
              </li>
              <li>
                <strong className="text-foreground">Vergi Dairesi / No:</strong>{" "}
                {companyInfo.taxOffice} — {companyInfo.taxNo}
              </li>
            </ul>
          </section>

          <p className="text-sm">
            Teklif almak veya usta olarak kayıt olmak için{" "}
            <Link href="/hizmetler" className="font-medium text-primary hover:underline">
              hizmetler
            </Link>{" "}
            veya{" "}
            <Link href="/usta-ol" className="font-medium text-primary hover:underline">
              usta ol
            </Link>{" "}
            sayfalarını kullanabilirsiniz.
          </p>
        </div>

        <div className="lg:col-span-3">
          <h2 className="mb-4 text-lg font-bold text-foreground">İletişim Formu</h2>
          <ContactForm />
        </div>
      </div>
    </LegalPageLayout>
  );
}
