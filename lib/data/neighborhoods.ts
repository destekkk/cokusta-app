/** Büyük ilçeler için mahalle listesi — yerel SEO */
export const neighborhoods: Record<string, Record<string, string[]>> = {
  İstanbul: {
    Esenler: ["Tuna", "Oruçreis", "Davutpaşa", "Birlik", "Kıraç", "Havaalanı"],
    Kadıköy: ["Moda", "Caferağa", "Fenerbahçe", "Göztepe", "Bostancı", "Acıbadem"],
    Ümraniye: ["Atakent", "Çakmak", "Finans Merkezi", "İstiklal", "Tantavi", "Yamanevler"],
    Bağcılar: ["Güneşli", "Mahmutbey", "Kirazlı", "Yenigün", "Bağlar", "100. Yıl"],
    Pendik: ["Kaynarca", "Velibaba", "Kurtköy", "Yenişehir", "Bahçelievler", "Güllübağlar"],
    Beylikdüzü: ["Gürpınar", "Yakuplu", "Kavaklı", "Adnan Kahveci", "Barış", "Marmara"],
    Fatih: ["Aksaray", "Laleli", "Sultanahmet", "Vefa", "Unkapanı", "Balat"],
    Kartal: ["Soğanlık", "Yakacık", "Uğurmumcu", "Atalar", "Cevizli", "Petrol-İş"],
    Esenyurt: ["Yeşilkent", "Ardıçlı", "Fatih", "Kıraç", "Pınar", "Saadetdere"],
    Avcılar: ["Ambarlı", "Cihangir", "Denizköşkler", "Firuzköy", "Gümüşpala", "Tahtakale"],
    Bahçelievler: ["Bahçelievler", "Fevziçakmak", "Hürriyet", "Kocasinan", "Soğanlı", "Yenibosna"],
    Bakırköy: ["Ataköy", "Cevizlik", "Kartaltepe", "Osmaniye", "Şenlikköy", "Yeşilköy"],
    Beşiktaş: ["Abbasağa", "Arnavutköy", "Bebek", "Etiler", "Levent", "Ortaköy"],
    Beyoğlu: ["Cihangir", "Galata", "Karaköy", "Kasımpaşa", "Taksim", "Tarlabaşı"],
    Maltepe: ["Altıntepe", "Başıbüyük", "Cevizli", "Feyzullah", "Girne", "Zümrütevler"],
    Sultangazi: ["50. Yıl", "Cebeci", "Gazi", "Habipler", "Uğur Mumcu", "Yunus Emre"],
    Şişli: ["Bomonti", "Esentepe", "Feriköy", "Halaskargazi", "Mecidiyeköy", "Osmanbey"],
    Küçükçekmece: ["Atakent", "Beşyol", "Halkalı", "İkitelli", "Kanarya", "Sefaköy"],
    Başakşehir: ["Başak", "Kayabaşı", "Metrokent", "Şahintepe", "Ziya Gökalp", "İkitelli OSB"],
    Ataşehir: ["Atatürk", "Barbaros", "Fetih", "İnönü", "Kayışdağı", "Yenişehir"],
    Sarıyer: ["Büyükdere", "Emirgan", "İstinye", "Rumeli Hisarı", "Tarabya", "Yeniköy"],
    Tuzla: ["Aydınlı", "İçmeler", "Mimarsinan", "Orhanlı", "Postane", "Yayla"],
  },
  Sakarya: {
    Arifiye: ["Hanlı", "Kirazca", "Arifbey", "Nehirkent", "Kemaliye", "Fatih"],
    Adapazarı: ["Orta", "Semerciler", "Maltepe", "Yağcılar", "Güllük", "Tekeler"],
    Serdivan: ["Köprübaşı", "Beşköprü", "İstiklal", "Kazımpaşa", "Kemalpaşa", "Alandüzü"],
    Erenler: ["Kurtuluş", "Karaman", "Kupeli", "Bağlar", "Hacıoğlu", "Tabakhane"],
    Hendek: ["Bağlar", "Hacıkışla", "Kemaliye", "Rasimpaşa", "Yeni", "Yeşilyurt"],
    Akyazı: ["Alaağaç", "Batakköy", "Kuzuluk", "Merkez", "Taşburun", "Yeni"],
  },
  Ankara: {
    Çankaya: ["Kızılay", "Bahçelievler", "Ayrancı", "Çayyolu", "Ümitköy", "Balgat"],
    Keçiören: ["Etlik", "Aktepe", "Kalaba", "Ufuktepe", "Şenlik", "Basınevleri"],
    Yenimahalle: ["Demetevler", "Batıkent", "Ostim", "Şentepe", "İvedik", "Karşıyaka"],
    Mamak: ["Akdere", "Bağlarbaşı", "Ege", "Hürel", "Kutlu", "Tuzluçayır"],
    Etimesgut: ["Elvankent", "Eryaman", "Güzelkent", "Piyade", "Tunahan", "Yurtçu"],
    Sincan: ["Akşemsettin", "Fatih", "Osmanlı", "Pınarbaşı", "Törekent", "Yenikent"],
    Altındağ: ["Hacettepe", "Hamamönü", "Hüseyingazi", "Önder", "Ulus", "Yenidoğan"],
  },
  İzmir: {
    Konak: ["Alsancak", "Güzelyalı", "Göztepe", "Hatay", "Basmane", "Kemeraltı"],
    Karşıyaka: ["Bostanlı", "Alaybey", "Atakent", "Cumhuriyet", "Nergiz", "Yamanlar"],
    Bornova: ["Erzene", "Evka-3", "Kazımdirik", "Meriç", "Pınarbaşı", "Altındağ"],
    Buca: ["Şirinyer", "Kaynaklar", "Kuruçeşme", "Ufuk", "Yaylacık", "Barış"],
    Bayraklı: ["Adalet", "Fuat Edip Baksı", "Manavkuyu", "Onur", "Soğukkuyu", "Yamanlar"],
    Çiğli: ["Ataşehir", "Balatçık", "Egekent", "Harmandalı", "Kaklıç", "Sasalı"],
    Gaziemir: ["Aktepe", "Emrez", "Gazi", "Sevgi", "Yeşil", "Zafer"],
  },
  Bursa: {
    Nilüfer: ["Görükle", "Üçevler", "Beşevler", "Konak", "Fethiye", "Alaaddinbey"],
    Osmangazi: ["Soğanlı", "Hamitler", "Panayır", "Demirtaş", "Çekirge", "Hocahasan"],
    Yıldırım: ["Arabayatağı", "Davutdede", "Emirsultan", "Millet", "Vatan", "Yıldırım"],
    Gemlik: ["Adliye", "Cumhuriyet", "Hisar", "Kurşunlu", "Umurbey", "Yeni"],
  },
  Antalya: {
    Muratpaşa: ["Lara", "Fener", "Meltem", "Güzeloba", "Kırcami", "Soğuksu"],
    Kepez: ["Varsak", "Gündoğdu", "Emek", "Kuzeyyaka", "Şafak", "Düden"],
    Konyaaltı: ["Arapsuyu", "Hurma", "Liman", "Sarısu", "Uncalı", "Varsak"],
    Alanya: ["Alanya Merkez", "Mahmutlar", "Oba", "Tosmur", "Kestel", "Konaklı"],
  },
  Kocaeli: {
    İzmit: ["Yenişehir", "Körfez", "Akmeşe", "Tavşantepe", "Serdar", "Alikahya"],
    Gebze: ["Hacıhalil", "Mevlana", "Güzeller", "Arapçeşme", "Pelitli", "Kirazpınar"],
    Darıca: ["Abdi İpekçi", "Bayramoğlu", "Emek", "Nenehatun", "Osmangazi", "Yalı"],
    Çayırova: ["Akse", "Emek", "İnönü", "Özgürlük", "Şekerpınar", "Yeni"],
  },
  Adana: {
    Seyhan: ["Barbaros", "Cemalpaşa", "Güzelyalı", "Kurtuluş", "Reşatbey", "Yeşilyurt"],
    Yüreğir: ["Akıncılar", "Doğankent", "Güzelevler", "Köprülü", "Serinevler", "Yavuzlar"],
    Çukurova: ["Belediye Evleri", "Güzelyalı", "Karslılar", "Mahfesığmaz", "Toros", "Yurt"],
  },
  Gaziantep: {
    Şahinbey: ["Alleben", "Bey", "Emek", "Karataş", "Kozluca", "Üniversite"],
    Şehitkamil: ["Aktoprak", "Burç", "Karşıyaka", "Osmangazi", "Serintepe", "Yeşilevler"],
  },
  Konya: {
    Selçuklu: ["Akademi", "Bosna Hersek", "Feritpaşa", "Horozluhan", "Yazır", "Zafer"],
    Meram: ["Akyokuş", "Göçü", "Havzan", "Lale", "Uluırmak", "Yaka"],
    Karatay: ["Alavardı", "Fevziçakmak", "Hacıveyiszade", "Kale", "Sille", "Ulu Camii"],
  },
  Mersin: {
    Mezitli: ["Akdeniz", "Davultepe", "Hürriyet", "Tece", "Yeni", "Zeytinli"],
    Yenişehir: ["Akbelen", "Barbaros", "Fuat Morel", "Güneş", "Palmiye", "Vatan"],
    Toroslar: ["Arpaçsuyu", "Huzurkent", "Kuyuluk", "Limonluk", "Osmaniye", "Yeniyurt"],
  },
};

export function getNeighborhoods(city: string, district: string): string[] {
  return neighborhoods[city]?.[district] ?? [];
}

export function hasNeighborhoodData(city: string, district: string): boolean {
  return (neighborhoods[city]?.[district]?.length ?? 0) > 0;
}

export function getAllNeighborhoodParams(): {
  city: string;
  district: string;
  neighborhood: string;
}[] {
  const params: { city: string; district: string; neighborhood: string }[] = [];
  for (const [city, districts] of Object.entries(neighborhoods)) {
    for (const [district, list] of Object.entries(districts)) {
      for (const neighborhood of list) {
        params.push({ city, district, neighborhood });
      }
    }
  }
  return params;
}

export function getCitiesWithNeighborhoods(): string[] {
  return Object.keys(neighborhoods);
}
