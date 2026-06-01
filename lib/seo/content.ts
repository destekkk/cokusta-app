import type { Service } from "@/lib/types";
import { getPrimarySearchTerm } from "@/lib/seo/keywords";

type FaqItem = { question: string; answer: string };

export function buildLocalIntro(
  city: string,
  service: Service,
  district?: string,
  neighborhood?: string
) {
  const term = getPrimarySearchTerm(service.slug);
  const loc = neighborhood
    ? `${city} ${district} ${neighborhood}`
    : district
      ? `${city} ${district}`
      : city;
  return `${loc} bölgesinde ${term} mi arıyorsunuz? Çokusta, ${loc} ve çevresinde ${service.providers.toLocaleString("tr-TR")}+ doğrulanmış ${term} ustasını tek platformda bir araya getirir. Ücretsiz teklif alın, ${term} fiyatlarını karşılaştırın, puan ve yorumlara göre en uygun ustayı seçin.`;
}

export function buildCityIntro(city: string) {
  return `${city} genelinde boyacı, elektrikçi, nakliyeci, tesisatçı, temizlik ve tadilat ustası mı arıyorsunuz? Çokusta, ${city}'de binlerce doğrulanmış hizmet sağlayıcısı ile ücretsiz teklif almanızı sağlar. İl, ilçe ve mahalle bazında usta bulun; şeffaf fiyat, güvenli ödeme.`;
}

export function buildLocalFaqs(
  city: string,
  service: Service,
  district?: string,
  neighborhood?: string
): FaqItem[] {
  const term = getPrimarySearchTerm(service.slug);
  const loc = neighborhood
    ? `${district} ${neighborhood}, ${city}`
    : district
      ? `${city} ${district}`
      : city;
  return [
    {
      question: `${loc} ${term} fiyatları ne kadar?`,
      answer: `${loc} bölgesinde ${term} hizmeti ${service.priceFrom.toLocaleString("tr-TR")} TL'den başlar. Kesin fiyat işin kapsamına göre ustaların göndereceği tekliflerle belirlenir.`,
    },
    {
      question: `${loc} ${term} ustası nasıl bulunur?`,
      answer: `Çokusta'da ${term} hizmetini seçin, ${loc} konumunuzu girin. Bölgenizdeki ustalar ücretsiz teklif gönderir; puan ve yorumlara göre karşılaştırıp seçim yapabilirsiniz.`,
    },
    {
      question: `${loc} ${term} ustaları güvenilir mi?`,
      answer: `Çokusta ustaları kayıt ve doğrulama sürecinden geçer. Müşteri puanları, tamamlanan iş sayıları ve yorumlar profillerinde görünür.`,
    },
    {
      question: `${loc} mahallelerinde ${term} hizmeti var mı?`,
      answer: `Evet. ${loc} ve çevre mahallelerde ${term} ustalarına Çokusta üzerinden ulaşabilir, aynı gün teklif alabilirsiniz.`,
    },
  ];
}

export function buildCityFaqs(city: string): FaqItem[] {
  return [
    {
      question: `${city} elektrikçi, boyacı ve nakliyeci nasıl bulunur?`,
      answer: `${city} için Çokusta'da hizmet seçin, il ve ilçenizi girin. Elektrikçi, boyacı, nakliyeci ve diğer ustalar size ücretsiz teklif gönderir.`,
    },
    {
      question: `${city} usta fiyatları nasıl belirlenir?`,
      answer: `Her usta işin kapsamına göre teklif gönderir. Fiyatları karşılaştırarak en uygun ${city} ustasını seçebilirsiniz.`,
    },
    {
      question: `${city}'de hangi hizmetler var?`,
      answer: `Elektrik, boya, nakliyat, temizlik, tesisat, tadilat, kombi, klima ve onlarca kategoride ${city} ustalarına ulaşabilirsiniz.`,
    },
    {
      question: `${city} ilçelerinde usta bulabilir miyim?`,
      answer: `Evet. ${city} il, ilçe ve mahalle bazında boyacı, elektrikçi, nakliyeci, tesisatçı ve tüm ustalar için teklif alabilirsiniz.`,
    },
  ];
}

export function buildDistrictIntro(city: string, district: string) {
  return `${city} ${district} bölgesinde boyacı, elektrikçi, nakliyeci, tesisatçı, temizlik ve tadilat ustası mı arıyorsunuz? Çokusta, ${district} ve çevresinde doğrulanmış ustalarla ücretsiz teklif almanızı sağlar. Mahalle bazında arama yapın, fiyatları karşılaştırın.`;
}

export function buildDistrictFaqs(city: string, district: string): FaqItem[] {
  return [
    {
      question: `${city} ${district} elektrikçi ve boyacı nasıl bulunur?`,
      answer: `${district} için hizmet seçin, konumunuzu ${city} ${district} olarak girin. Bölgedeki ustalar ücretsiz teklif gönderir.`,
    },
    {
      question: `${district} usta fiyatları ne kadar?`,
      answer: `Fiyat işin kapsamına göre değişir. ${district} ustalarından birden fazla teklif alıp karşılaştırabilirsiniz.`,
    },
    {
      question: `${district} mahallelerinde hizmet var mı?`,
      answer: `Evet. ${city} ${district} mahallelerinde elektrik, boya, nakliyat, temizlik ve tadilat ustalarına ulaşabilirsiniz.`,
    },
  ];
}

export function buildCategoryLocationIntro(city: string, categoryName: string, district?: string) {
  const loc = district ? `${city} ${district}` : city;
  return `${loc} bölgesinde ${categoryName.toLowerCase()} hizmeti mi arıyorsunuz? Çokusta, ${loc} ve çevresinde doğrulanmış ${categoryName.toLowerCase()} ustalarını bir araya getirir. Ücretsiz teklif alın, fiyatları karşılaştırın, güvenle hizmet alın.`;
}

export function buildCategoryLocationFaqs(
  city: string,
  categoryName: string,
  district?: string
): FaqItem[] {
  const loc = district ? `${city} ${district}` : city;
  return [
    {
      question: `${loc} ${categoryName.toLowerCase()} fiyatları ne kadar?`,
      answer: `${loc} bölgesinde ${categoryName.toLowerCase()} fiyatları işin kapsamına göre değişir. Ustalardan ücretsiz teklif alıp karşılaştırabilirsiniz.`,
    },
    {
      question: `${loc} ${categoryName.toLowerCase()} ustası nasıl bulunur?`,
      answer: `Çokusta'da ${categoryName} kategorisini seçin, ${loc} konumunuzu girin. Bölgenizdeki ustalar teklif gönderir.`,
    },
    {
      question: `${loc} ${categoryName.toLowerCase()} ustaları güvenilir mi?`,
      answer: `Çokusta ustaları doğrulama sürecinden geçer. Puan, yorum ve tamamlanan iş sayıları profillerinde görünür.`,
    },
  ];
}
