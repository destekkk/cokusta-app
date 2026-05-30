import type { Service } from "@/lib/types";

type FaqItem = { question: string; answer: string };

export function buildLocalIntro(city: string, service: Service, district?: string) {
  const loc = district ? `${city} ${district}` : city;
  return `${loc} bölgesinde ${service.name.toLowerCase()} mi arıyorsunuz? Çokusta, ${loc} ve çevresinde hizmet veren ${service.providers.toLocaleString("tr-TR")}+ doğrulanmış ustayı tek platformda bir araya getirir. İhtiyacınızı birkaç soruyla anlatın, ustalar size özel fiyat teklifleri göndersin; puanları ve yorumları inceleyerek en uygun profesyoneli seçin.`;
}

export function buildCityIntro(city: string) {
  return `${city} genelinde tadilat, nakliyat, temizlik, boya, elektrik, tesisat ve onarım hizmetleri için güvenilir ustalar mı arıyorsunuz? Çokusta, ${city}’de binlerce doğrulanmış hizmet sağlayıcısı ile ücretsiz teklif almanızı sağlar. Şeffaf fiyatlandırma, güvenli ödeme ve müşteri yorumları ile doğru ustayı kolayca bulun.`;
}

export function buildLocalFaqs(city: string, service: Service, district?: string): FaqItem[] {
  const loc = district ? `${city} ${district}` : city;
  return [
    {
      question: `${loc} ${service.name.toLowerCase()} fiyatları ne kadar?`,
      answer: `${service.name} hizmeti ${loc} bölgesinde ${service.priceFrom.toLocaleString("tr-TR")} TL'den başlayan fiyatlarla sunulmaktadır. Kesin fiyat, işin kapsamına göre ustaların göndereceği tekliflerle belirlenir.`,
    },
    {
      question: `${loc} bölgesinde ${service.name.toLowerCase()} ustası nasıl bulunur?`,
      answer: `Çokusta'da ${service.name.toLowerCase()} hizmetini seçin, ${loc} konumunuzu girin ve birkaç soruyu yanıtlayın. Bölgenizdeki ustalar size ücretsiz teklif gönderir; puan ve yorumlara göre karşılaştırıp seçim yapabilirsiniz.`,
    },
    {
      question: `${loc} ${service.name.toLowerCase()} ustaları güvenilir mi?`,
      answer: `Çokusta'daki ustalar kayıt ve doğrulama sürecinden geçer. Müşteri puanları, tamamlanan iş sayıları ve yorumlar profillerinde görüntülenir. Ödemeler iyzico güvenli altyapısı ile korunur.`,
    },
    {
      question: `${loc} ${service.name.toLowerCase()} ne kadar sürede tamamlanır?`,
      answer: `Süre, işin kapsamına göre değişir. Teklif alırken ne zaman ihtiyacınız olduğunu belirtin; ustalar size uygun tarih ve süre önerisi sunar. Acil işler için "Çok Acil" seçeneğini kullanabilirsiniz.`,
    },
  ];
}

export function buildCityFaqs(city: string): FaqItem[] {
  return [
    {
      question: `${city} hizmet fiyatları nasıl belirlenir?`,
      answer: `${city} bölgesinde her hizmet için ustalar size özel teklif gönderir. Fiyatlar işin kapsamına göre değişir; teklifleri karşılaştırarak en uygun seçeneği bulabilirsiniz.`,
    },
    {
      question: `${city}'de hangi hizmetleri bulabilirim?`,
      answer: `Tadilat, nakliyat, temizlik, boya, elektrik, tesisat, bahçe, özel ders ve tamirat-servis dahil onlarca hizmet kategorisinde ${city} ustalarına ulaşabilirsiniz.`,
    },
    {
      question: `${city} ustaları nasıl değerlendirilir?`,
      answer: `Her ustanın müşteri puanı, tamamlanan iş sayısı ve yorumları profilinde görünür. Ayın Ustası seçimleri blockchain sertifikası ile doğrulanabilir.`,
    },
  ];
}
