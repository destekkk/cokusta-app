import LegalPageLayout from "@/components/LegalPageLayout";
import { companyInfo } from "@/lib/data/company";

export const metadata = {
  title: "Teslimat ve İade Şartları | Çokusta",
  description: "Çokusta teslimat, hizmet ifası ve iade koşulları.",
};

export default function DeliveryReturnPage() {
  return (
    <LegalPageLayout
      title="Teslimat ve İade Şartları"
      description="Hizmet teslimi ve iade politikamız"
    >
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">1. Genel Bilgi</h2>
        <p>
          {companyInfo.brand}, hizmet pazaryeri olarak müşteriler ile bağımsız hizmet sağlayıcı
          (usta) arasında aracılık eder. Platform üzerinden satın alınan hizmetlerin ifası,
          seçilen usta tarafından gerçekleştirilir. {companyInfo.legalName} fiziksel ürün satışı
          yapmamaktadır; teslimat koşulları hizmetin niteliğine göre belirlenir.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">2. Hizmet Teslimi</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Hizmet, teklif kabulü sonrasında müşteri ile usta arasında kararlaştırılan tarih ve adreste ifa edilir.</li>
          <li>Randevu saati usta tarafından teyit edilir; gecikme durumunda müşteri bilgilendirilir.</li>
          <li>Acil işler (&quot;Çok Acil&quot;) için ifa süresi teklif aşamasında açıkça belirtilir.</li>
          <li>Dijital platform hizmet bedelleri (varsa) ödeme onayı ile birlikte aktive edilir.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">3. Cayma Hakkı</h2>
        <p>
          6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
          kapsamında, hizmet ifasına başlanmadan önce 14 gün içinde cayma hakkınız bulunmaktadır.
          Hizmet ifasına açık onayınız ile başlandıktan sonra cayma hakkı, yasal istisnalar
          çerçevesinde sona erer.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">4. İade Koşulları</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Hizmet henüz başlamamışsa ödemeniz 14 iş günü içinde iade edilir.</li>
          <li>Hizmete başlandıktan sonra iade, usta ile yaşanan uyuşmazlıklarda platform arabuluculuğu ile değerlendirilir.</li>
          <li>Eksik veya hatalı ifa durumunda {companyInfo.email} adresine yazılı başvuru yapılmalıdır.</li>
          <li>İade işlemleri, ödeme yapılan yönteme (havale/EFT veya duyurulan diğer yöntemler) uygun şekilde gerçekleştirilir.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">5. İletişim</h2>
        <p>
          Teslimat ve iade talepleriniz için {companyInfo.email} adresine veya {companyInfo.phone}
          numarasına başvurabilirsiniz.
        </p>
        <p className="text-sm">
          {companyInfo.legalName} — {companyInfo.address}
        </p>
      </section>
    </LegalPageLayout>
  );
}
