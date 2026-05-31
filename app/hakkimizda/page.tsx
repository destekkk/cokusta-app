import Link from "next/link";
import LegalPageLayout from "@/components/LegalPageLayout";
import PaymentBadges from "@/components/PaymentBadges";
import { companyInfo } from "@/lib/data/company";

export const metadata = {
  title: "Hakkımızda | Çokusta",
  description:
    "Çokusta — Türkiye'nin güvenilir hizmet pazaryeri. Doğrulanmış ustalar, şeffaf teklif süreci ve güvenli ödeme.",
};

const principles = [
  {
    title: "Bağımsız üçüncü taraf güveni",
    text: "Platform, hizmet sağlayıcı ile müşteri arasında tarafsız bir köprü görevi görür; teklif, değerlendirme ve ödeme süreçleri şeffaf yürütülür.",
  },
  {
    title: "İnsan destekli doğrulama",
    text: "Ustalar kayıt sürecinden geçer; kimlik, deneyim ve hizmet kalitesi insan gözetiminde değerlendirilir. Otomasyon destekler, son karar insandadır.",
  },
  {
    title: "Şeffaf kayıt ve izlenebilirlik",
    text: "Teklifler, tamamlanan işler ve müşteri yorumları kayıt altına alınır. Ayın Ustası gibi başarılar doğrulanabilir sertifikalarla belgelenir.",
  },
  {
    title: "Güvenli ödeme altyapısı",
    text: "Online ödemeler lisanslı ödeme kuruluşu iyzico üzerinden alınır. Kart bilgileriniz platformda saklanmaz.",
  },
  {
    title: "Müşteri odaklı deneyim",
    text: "Doğru ustayı hızla bulmak, adil fiyat görmek ve işin zamanında bitmesini sağlamak temel önceliğimizdir.",
  },
  {
    title: "Dijital öncelikli platform",
    text: "Teklif alma, eşleştirme ve değerlendirme süreçlerinin tamamı modern, erişilebilir ve kullanıcı dostu bir dijital deneyimle sunulur.",
  },
];

const steps = [
  "İhtiyacınız olan hizmeti seçer, birkaç soruyu yanıtlar ve konumunuzu belirtirsiniz.",
  "Bölgenizdeki doğrulanmış ustalar talebinizi görür ve size özel teklifler gönderir.",
  "Teklifleri karşılaştırır, puanları ve yorumları inceleyerek en uygun ustayı seçersiniz.",
  "Güvenli ödeme altyapısı ile işiniz başlar; süreç boyunca platform üzerinden iletişim kurabilirsiniz.",
  "Hizmet tamamlandığında değerlendirme yapılır; deneyiminiz gelecekteki müşterilere rehber olur.",
  "Ayın Ustası seçimleri ve özel başarılar, kamusal olarak doğrulanabilir sertifikalarla kayıt altına alınır.",
];

export default function AboutPage() {
  return (
    <LegalPageLayout
      title="Hakkımızda"
      description="Güvenilir hizmet almanın dijital adresi"
    >
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Biz Kimiz?</h2>
        <p>
          {companyInfo.brand}, tadilat, nakliyat, temizlik, tesisat ve daha birçok alanda müşterileri
          doğrulanmış ustalarla buluşturan bağımsız bir dijital hizmet pazaryeridir. Ev ve iş
          yerlerinde hizmet alırken kime güveneceğinizi, fiyatın adil olup olmadığını ve işin
          zamanında tamamlanıp tamamlanmayacağını bilmemek yaygın bir sorundur. {companyInfo.brand},
          bu sorunu doğrulanmış ustalar, şeffaf teklif süreci, gerçek müşteri yorumları ve güvenli
          ödeme altyapısı ile çözer.
        </p>
        <p>
          Amacımız, güvenilir hizmet almayı kolay, erişilebilir ve öngörülebilir kılmaktır.
          Dijital öncelikli, insan odaklı bir platform olarak {companyInfo.foundingYear} yılında{" "}
          {companyInfo.founder} tarafından kurulmuştur.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Ne Yapıyoruz?</h2>
        <ol className="list-decimal space-y-3 pl-5">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Değerlerimiz</h2>
        <div className="space-y-4">
          {principles.map(({ title, text }) => (
            <div key={title}>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="mt-1">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Sık Sorulan Sorular</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground">
              {companyInfo.brand} bir devlet kurumu mu?
            </h3>
            <p className="mt-1">
              Hayır. {companyInfo.brand}, özel işletme olarak faaliyet gösteren bağımsız bir dijital
              platformdur. Hizmetler, platforma kayıtlı bağımsız ustalar tarafından sunulur;
              {companyInfo.brand} aracılık ve güven altyapısı sağlar.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Ustalar nasıl doğrulanır?</h3>
            <p className="mt-1">
              Kayıt sürecinde kimlik ve hizmet bilgileri kontrol edilir; müşteri yorumları ve
              tamamlanan iş geçmişi sürekli izlenir. Ayın Ustası seçimleri ve blockchain
              sertifikaları kamusal doğrulama sayfası üzerinden kontrol edilebilir.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Ödemeler güvende mi?</h3>
            <p className="mt-1">
              Evet. Tüm kartlı ödemeler {companyInfo.paymentProvider} güvenli ödeme altyapısı
              üzerinden işlenir; kart bilgileriniz {companyInfo.brand} tarafından saklanmaz.
            </p>
            <PaymentBadges variant="light" className="mt-3" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">İletişim Bilgileri</h2>
        <ul className="space-y-2">
          <li><strong className="text-foreground">Unvan:</strong> {companyInfo.legalName}</li>
          <li><strong className="text-foreground">Kurucu:</strong> {companyInfo.founder}</li>
          <li><strong className="text-foreground">Adres:</strong> {companyInfo.address}</li>
          <li><strong className="text-foreground">E-posta:</strong> {companyInfo.email}</li>
          <li><strong className="text-foreground">Telefon:</strong> {companyInfo.phone}</li>
          <li>
            <strong className="text-foreground">Vergi Dairesi / No:</strong>{" "}
            {companyInfo.taxOffice} — {companyInfo.taxNo}
          </li>
        </ul>
        <p className="pt-2">
          <Link href="/iletisim" className="font-medium text-primary hover:underline">
            İletişim formu →
          </Link>
        </p>
      </section>
    </LegalPageLayout>
  );
}
