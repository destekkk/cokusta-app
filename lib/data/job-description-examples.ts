const examplesBySlug: Record<string, string> = {
  "ev-temizligi":
    "Örn: 3+1 daire genel temizlik, mutfak dolap içleri ve banyo detaylı olsun. Cumartesi sabahı uygun, evcil hayvan yok.",
  "evden-eve-nakliyat":
    "Örn: 2+1 daireden 3+1 daireye taşınma, asansörlü bina, paketleme dahil. Taşınma tarihi 20 Haziran civarı.",
  "boya-badana":
    "Örn: 3+1 daire boya badana, duvarlar açık gri, tavanlar beyaz. Malzeme dahil, giriş 15 Haziran civarı mümkün.",
  "mutfak-dolabi":
    "Örn: L tipi mutfak dolabı, lake beyaz, tezgah granit. Ölçü alınması için hafta içi akşam uygun.",
  "klima-montaj":
    "Örn: Salon için 12000 BTU split klima montajı, dış ünite balkona. Duvar delme ve bakır boru dahil olsun.",
  "matematik-ozel-ders":
    "Örn: 8. sınıf öğrencisi LGS hazırlığı, haftada 2 gün yüz yüze. Geometri ve problemlerde zorlanıyor.",
  "ofis-temizligi":
    "Örn: 150 m² ofis haftalık temizlik, 6 masa + toplantı odası. Cuma akşamı veya hafta sonu uygun.",
  "parke-laminat":
    "Örn: 2 oda laminat parke döşeme, eski halı sökülecek. Malzeme bizden, işçilik teklifi istiyorum.",
  "elektrik-tesisati":
    "Örn: Mutfakta 2 yeni priz ve banyoda spot aydınlatma hattı çekilecek. Sigorta kutusu 3. katta.",
  "su-tesisati":
    "Örn: Mutfak lavabosu altından su kaçağı var, alt kata damlıyor. Acil müdahale, hafta içi gün içi uygun.",
  "dogalgaz-tesisati":
    "Örn: Yeni dairede doğalgaz iç tesisatı + kombi bağlantısı, proje ve gaz açımı dahil teklif istiyorum.",
  "kalorifer-tesisati":
    "Örn: 6 adet petek değişimi ve kalorifer hattı kontrolü. Petekler eski ve ısıtmıyor.",
  "kombi-bakim":
    "Örn: Vaillant kombi yıllık bakım, su basıncı düşük ve arada hata veriyor. Hafta sonu randevu uygun.",
  "tikaniklik-acma":
    "Örn: Mutfak lavabo gideri tıkalı, su geri geliyor. Kırmadan robotla açılmasını istiyorum, bugün mümkün mü?",
  "bahce-duzenleme":
    "Örn: 120 m² bahçede çim biçme, budama ve yeni fidan dikimi. Tek seferlik, bahçe aletleri sizden olsun.",
  "ingilizce-ozel-ders":
    "Örn: Orta seviye (B1), haftada 2 saat konuşma odaklı ders. YDS hazırlığı için gramer desteği de istiyorum.",
  "mobilya-montaj":
    "Örn: IKEA gardırop + yatak + 2 komodin montajı. Duvara sabitleme dahil, cumartesi öğleden sonra uygun.",
  "banyo-yenileme":
    "Örn: 5 m² banyo komple yenileme, fayans + duşakabin + vitrifiye değişimi. Keşif için hafta içi uygunum.",
  "fayans-seramik":
    "Örn: Banyo zemin ve duvar fayans döşeme, yaklaşık 18 m². Malzeme seçildi, sadece işçilik teklifi.",
  "alcipan-asma-tavan":
    "Örn: Salon ve koridorda alçıpan asma tavan + spot ışık boşlukları. LED şerit için hazırlık da yapılsın.",
  "duvar-alci-siva":
    "Örn: Tüm evde alçı sıva ve boyaya hazır düzeltme, yaklaşık 120 m². Malzeme dahil teklif istiyorum.",
  "ev-komple-tadilat":
    "Örn: 3+1 daire anahtar teslim tadilat, elektrik + tesisat + zemin + boya. Keşif sonrası net bütçe konuşalım.",
  "duvar-kagidi":
    "Örn: Yatak odası tek duvar duvar kağıdı uygulaması, kağıt elimde. Yüzey düzeltmesi gerekir mi bakılsın.",
  "pencere-kapi-degisimi":
    "Örn: 4 adet PVC pencere değişimi, 5. katta asansör var. Ölçü almak için cumartesi uygun.",
  "cam-balkon":
    "Örn: 4 m balkon katlanır cam balkon, 8. kat. Rüzgar dayanımı yüksek cam tercih ediyorum, keşif istiyorum.",
  "ic-mimari-danismanlik":
    "Örn: 3+1 daire tadilat öncesi iç mimari danışmanlık, 3D görselleştirme ile mutfak ve salon planı.",
  "sehir-ici-nakliyat":
    "Örn: Koltuk takımı + buzdolabı şehir içi taşıma, 3. kattan 1. kata. Asansör var, cumartesi uygun.",
  "sehirlerarasi-nakliyat":
    "Örn: 2+1 ev eşyası İstanbul'dan Ankara'ya taşınacak, paketleme ve sigorta dahil. 1 Temmuz tarihi hedef.",
  "ofis-tasima":
    "Örn: 200 m² ofis taşıma, 12 masa + arşiv dolapları. Cuma akşamı başlayıp hafta sonu bitirilsin.",
  "parca-esya-tasima":
    "Örn: Çift kişilik yatak + gardırop taşınacak, asansörsüz 2. kat. Bugün veya yarın uygun.",
  "asansorlu-tasima":
    "Örn: 8. kat komple ev taşıma, dış asansör gerekli. Büyük eşyalar var, keşif yapılsın.",
  "esya-depolama":
    "Örn: Taşınma arası 3 ay eşya depolama, yaklaşık 10 m³. Sigortalı depo tercih ediyorum.",
  "uluslararasi-tasimacilik":
    "Örn: 2+1 ev eşyası Almanya'ya taşınacak, gümrük ve paketleme dahil. Haziran sonu çıkış hedefi.",
  "ozel-esya-tasima":
    "Örn: Upright piyano 3. kattan 1. kata taşınacak, asansörsüz bina. Özel ekipman ve sigorta istiyorum.",
  "kamyonet-tasimaciligi":
    "Örn: Tam gün şoförlü kamyonet, inşaat malzemesi taşıma. Sabah 08:00'de başlasın, yaklaşık 4 saat.",
  "vip-tasima":
    "Örn: Antika mobilya ve sanat eserleri taşınacak, özel paketleme ve sigorta şart. Beyaz eldivenli ekip.",
  "ev-aleti-servisi":
    "Örn: Arçelik buzdolabı soğutmuyor, garuntti süresi bitti. Yerinde arıza tespiti ve parça teklifi istiyorum.",
  "bilgisayar-onarim":
    "Örn: Lenovo laptop açılmıyor, muhtemelen SSD arızası. Veriler kurtarılsın, yerinde veya atölye fark etmez.",
  "televizyon-onarim":
    "Örn: 65 inç Samsung TV açılıyor ama görüntü yok, ses geliyor. Yerinde bakım mümkün mü?",
  "telefon-tablet-servis":
    "Örn: iPhone 13 ekran kırık, orijinal veya A kalite ekran değişimi. Bugün teslim alınabilir mi?",
  "tadilat-sonrasi-temizlik":
    "Örn: Boya tadilatı biten 3+1 dairede ince toz temizliği, cam ve dolap içleri dahil. Pazartesi uygun.",
  "koltuk-hali-yikama":
    "Örn: 3+2+1 koltuk takımı yerinde yıkama, halı yok. Leke yoğun, evcil hayvan tüyü var.",
  "bos-daire-temizligi":
    "Örn: Boş 2+1 daire taşınma öncesi temizlik, dolap içleri ve balkon dahil. Cuma teslim istiyorum.",
  "aydinlatma-montaj":
    "Örn: Salon avizesi + 4 spot montajı, tavan 3 m yükseklikte. Malzemeler hazır, sadece montaj.",
  "tv-duvar-montaj":
    "Örn: 65 inç TV beton duvara askı aparatı ile monte edilecek, kablo gizleme de yapılsın.",
  "surus-egitimi":
    "Örn: Ehliyet yeni aldım, otomatik vitesle trafikte pratik istiyorum. Hafta sonu 2 saatlik ders uygun.",
  "muzik-ozel-ders":
    "Örn: Sıfırdan akustik gitar dersi, haftada 1 gün online. Temel akorlar ve basit parçalar hedefim.",
  "cim-bicme":
    "Örn: 80 m² bahçede çim biçme ve kenar düzeltme, aylık bakım paketi teklifi de istiyorum.",
  "havuz-bakimi":
    "Örn: 30 m³ havuz haftalık bakım, su yeşilimsi ve filtre sesli. Kimyasal dengeleme dahil olsun.",
  "dis-cephe-boya":
    "Örn: 3 katlı villa dış cephe boya, eski boya kabarmış. İskele ve astar dahil teklif istiyorum.",
};

const examplesByCategory: Record<string, string> = {
  temizlik:
    "Örn: Ev/ofis temizliği, alan büyüklüğü, hangi odalar ve tercih ettiğiniz gün/saat bilgisini yazın.",
  nakliyat:
    "Örn: Taşınacak eşya miktarı, kat/asansör durumu, çıkış-varış adresi ve hedef tarih.",
  tadilat:
    "Örn: Yapılacak işin kapsamı, metrekare/oda sayısı, malzeme dahil mi ve keşif tarihi.",
  boya:
    "Örn: Boyanacak alan, renk tercihi, malzeme dahil mi ve işe başlama tarihi.",
  elektrik:
    "Örn: Montaj veya arıza detayı, adet/konum bilgisi ve uygun randevu zamanı.",
  tesisat:
    "Örn: Sorunun yeri ve türü (kaçak, tıkanıklık, montaj), aciliyet ve uygun saat.",
  tamirat:
    "Örn: Cihaz marka/model, arıza belirtisi ve yerinde servis için uygun gün/saat.",
  bahce:
    "Örn: Bahçe büyüklüğü, istenen iş (biçme, budama, peyzaj) ve tek seferlik mi düzenli mi.",
  "ozel-ders":
    "Örn: Seviye, ders amacı (sınav, konuşma, hobi), haftalık saat ve yüz yüze/online tercihi.",
};

const defaultExample =
  "Örn: İşin detaylarını, konum/büyüklük bilgisini, özel isteklerinizi ve uygun tarihinizi yazın.";

export function getJobDescriptionExample(
  serviceSlug: string,
  categorySlug: string
): string {
  return (
    examplesBySlug[serviceSlug] ??
    examplesByCategory[categorySlug] ??
    defaultExample
  );
}
