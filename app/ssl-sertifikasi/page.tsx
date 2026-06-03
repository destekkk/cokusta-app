import { Lock, ShieldCheck } from "lucide-react";
import LegalPageLayout from "@/components/LegalPageLayout";
import { companyInfo } from "@/lib/data/company";

export const metadata = {
  title: "SSL Sertifikası | Çokusta",
  description: "Çokusta SSL/TLS güvenlik sertifikası ve güvenli bağlantı bilgileri.",
};

export default function SslPage() {
  return (
    <LegalPageLayout
      title="SSL Sertifikası"
      description="Güvenli bağlantı ve veri şifreleme"
    >
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock size={24} />
        </div>
        <div>
          <div className="font-semibold text-foreground">256-bit SSL/TLS Şifreleme</div>
          <div className="text-sm">Tüm verileriniz şifreli bağlantı ile iletilir</div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Güvenli Bağlantı</h2>
        <p>
          {companyInfo.website} adresi SSL (Secure Sockets Layer) / TLS (Transport Layer Security)
          sertifikası ile korunmaktadır. Tarayıcınızın adres çubuğunda görünen kilit simgesi,
          sitemiz ile cihazınız arasındaki iletişimin şifrelendiğini gösterir.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Ne Anlama Gelir?</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Kişisel bilgileriniz ve ödeme verileriniz üçüncü taraflarca okunamaz.</li>
          <li>Form gönderimleri ve oturum bilgileri güvenli kanal üzerinden iletilir.</li>
          <li>Ödeme talepleri destek ekibimiz üzerinden yönlendirilir; site trafiği SSL ile korunur.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <ShieldCheck size={20} className="text-primary" />
          Ödeme Güvenliği
        </h2>
        <p>
          Online kart ödemesi geçici olarak kapalıdır. {companyInfo.brand} sunucularında kart
          bilgisi saklanmaz. Ödeme süreçleri için {companyInfo.email} adresine başvurunuz.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Doğrulama</h2>
        <p>
          SSL sertifikamızın geçerliliğini tarayıcınızdaki kilit simgesine tıklayarak veya
          sertifika sağlayıcı bilgilerini inceleyerek doğrulayabilirsiniz. Herhangi bir güvenlik
          endişeniz için {companyInfo.email} adresinden bize ulaşabilirsiniz.
        </p>
      </section>
    </LegalPageLayout>
  );
}
