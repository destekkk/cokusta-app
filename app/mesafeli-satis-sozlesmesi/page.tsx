import LegalPageLayout from "@/components/LegalPageLayout";
import PaymentBadges from "@/components/PaymentBadges";
import { companyInfo } from "@/lib/data/company";

export const metadata = {
  title: "Mesafeli Satış Sözleşmesi | Çokusta",
  description: "Çokusta mesafeli satış sözleşmesi ve tüketici hakları.",
};

export default function DistanceSalesPage() {
  return (
    <LegalPageLayout
      title="Mesafeli Satış Sözleşmesi"
      description="6502 sayılı Kanun kapsamında mesafeli satış koşulları"
    >
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Madde 1 — Taraflar</h2>
        <p><strong className="text-foreground">Satıcı / Aracı Hizmet Sağlayıcı:</strong></p>
        <ul className="space-y-1">
          <li>Unvan: {companyInfo.legalName}</li>
          <li>Adres: {companyInfo.address}</li>
          <li>Telefon: {companyInfo.phone}</li>
          <li>E-posta: {companyInfo.email}</li>
          <li>Vergi Dairesi / No: {companyInfo.taxOffice} — {companyInfo.taxNo}</li>
        </ul>
        <p className="mt-3">
          <strong className="text-foreground">Alıcı:</strong> Platform üzerinden hizmet talebinde
          bulunan ve ödeme yapan gerçek veya tüzel kişi.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Madde 2 — Konu</h2>
        <p>
          İşbu sözleşme, Alıcı&apos;nın {companyInfo.website} üzerinden elektronik ortamda
          sipariş verdiği hizmetin satışına ve ifasına ilişkin tarafların hak ve yükümlülüklerini
          6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
          hükümleri uyarınca düzenler.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Madde 3 — Hizmet Bilgileri</h2>
        <p>
          Hizmetin türü, kapsamı, bedeli, ifa yeri ve süresi teklif aşamasında ve sipariş
          onay ekranında Alıcı&apos;ya açıkça sunulur. {companyInfo.brand}, hizmetin fiilen
          ifasını bağımsız usta/sağlayıcı gerçekleştirir.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Madde 4 — Ödeme</h2>
        <p>
          Ödemeler {companyInfo.paymentProvider} güvenli ödeme altyapısı aracılığıyla kredi kartı
          (Visa, Mastercard) veya platformun sunduğu diğer yöntemlerle tahsil edilir. Kart
          bilgileri Satıcı tarafından saklanmaz.
        </p>
        <PaymentBadges variant="light" />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Madde 5 — Teslimat / İfa</h2>
        <p>
          Hizmet, taraflarca kararlaştırılan tarih ve adreste ifa edilir. Detaylı koşullar için{" "}
          <a href="/teslimat-ve-iade" className="font-medium text-primary hover:underline">
            Teslimat ve İade Şartları
          </a>{" "}
          sayfasına bakınız.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Madde 6 — Cayma Hakkı</h2>
        <p>
          Alıcı, hizmet ifasına başlanmadan önce 14 gün içinde herhangi bir gerekçe göstermeksizin
          ve cezai şart ödemeksizin cayma hakkına sahiptir. Cayma bildirimi {companyInfo.email}
          adresine yazılı olarak iletilir. Hizmet ifasına Alıcı&apos;nın açık onayı ile
          başlanması halinde cayma hakkı, yasal istisnalar saklı kalmak üzere sona erer.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Madde 7 — Uyuşmazlık</h2>
        <p>
          İşbu sözleşmeden doğan uyuşmazlıklarda Alıcı, Tüketici Hakem Heyetlerine ve Tüketici
          Mahkemelerine başvurabilir. Şikâyet ve itirazlar için {companyInfo.email} adresi
          kullanılabilir.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Madde 8 — Yürürlük</h2>
        <p>
          Alıcı, platform üzerinden sipariş vermekle işbu sözleşmenin tüm maddelerini okuduğunu
          ve kabul ettiğini beyan eder.
        </p>
        <p className="text-sm">Son güncelleme: Mayıs 2026</p>
      </section>
    </LegalPageLayout>
  );
}
