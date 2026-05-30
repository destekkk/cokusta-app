import LegalPageLayout from "@/components/LegalPageLayout";
import { companyInfo } from "@/lib/data/company";

export const metadata = {
  title: "Gizlilik Sözleşmesi | Çokusta",
  description: "Çokusta kişisel verilerin korunması ve gizlilik politikası.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Gizlilik Sözleşmesi"
      description="Kişisel verilerinizin korunması"
    >
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">1. Veri Sorumlusu</h2>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu{" "}
          {companyInfo.legalName}&apos;dir. İletişim: {companyInfo.email}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">2. Toplanan Veriler</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Kimlik ve iletişim bilgileri (ad, soyad, telefon, e-posta, adres)</li>
          <li>Hizmet talebi ve teklif geçmişi</li>
          <li>Ödeme işlem bilgileri (kart bilgileri {companyInfo.paymentProvider} tarafından işlenir, tarafımızca saklanmaz)</li>
          <li>IP adresi, çerez ve oturum verileri</li>
          <li>Değerlendirme ve yorum içerikleri</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">3. Verilerin İşlenme Amaçları</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Hizmet taleplerinin karşılanması ve usta eşleştirmesi</li>
          <li>Ödeme işlemlerinin güvenli şekilde gerçekleştirilmesi</li>
          <li>Müşteri destek hizmetlerinin sunulması</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          <li>Platform güvenliğinin sağlanması ve kötüye kullanımın önlenmesi</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">4. Verilerin Aktarımı</h2>
        <p>
          Kişisel verileriniz; hizmet sağlayıcı ustalar, ödeme kuruluşu {companyInfo.paymentProvider},
          barındırma ve altyapı hizmet sağlayıcıları ile yalnızca hizmetin ifası için gerekli
          ölçüde paylaşılabilir. Yurt dışına aktarım, KVKK&apos;nın 9. maddesi kapsamında
          gerekli güvenlik önlemleri alınarak yapılır.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">5. Çerezler</h2>
        <p>
          Sitemiz, kullanıcı deneyimini iyileştirmek ve oturum yönetimi sağlamak amacıyla çerez
          kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz; bazı çerezlerin
          devre dışı bırakılması platform işlevlerini kısıtlayabilir.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">6. Haklarınız</h2>
        <p>
          KVKK&apos;nın 11. maddesi kapsamında; verilerinize erişim, düzeltme, silme, işlemenin
          kısıtlanması ve itiraz haklarına sahipsiniz. Taleplerinizi {companyInfo.email} adresine
          iletebilirsiniz.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">7. Güvenlik</h2>
        <p>
          Verileriniz SSL/TLS şifreleme ile korunur. Ödeme bilgileri PCI DSS uyumlu {companyInfo.paymentProvider}
          altyapısı üzerinden işlenir.
        </p>
      </section>
    </LegalPageLayout>
  );
}
