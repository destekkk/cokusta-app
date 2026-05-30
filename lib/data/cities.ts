/** Türkiye'nin 81 ili — alfabetik */
export const cities = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kilis",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Şanlıurfa",
  "Şırnak",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
] as const;

export type City = (typeof cities)[number];

export const districts: Record<string, string[]> = {
  Adana: [
    "Seyhan", "Yüreğir", "Çukurova", "Sarıçam", "Ceyhan", "Kozan", "İmamoğlu", "Karataş",
  ],
  Ankara: [
    "Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan", "Altındağ",
    "Pursaklar", "Gölbaşı", "Polatlı", "Çubuk", "Kahramankazan", "Akyurt", "Elmadağ",
  ],
  Antalya: [
    "Muratpaşa", "Kepez", "Konyaaltı", "Alanya", "Manavgat", "Serik", "Kemer", "Kaş",
    "Finike", "Kumluca", "Döşemealtı", "Aksu",
  ],
  Aydın: [
    "Efeler", "Nazilli", "Söke", "Kuşadası", "Didim", "Çine", "Germencik", "Sultanhisar",
  ],
  Balıkesir: [
    "Karesi", "Altıeylül", "Bandırma", "Edremit", "Gönen", "Ayvalık", "Burhaniye", "Susurluk",
  ],
  Bursa: [
    "Osmangazi", "Yıldırım", "Nilüfer", "Gemlik", "İnegöl", "Mudanya", "Gürsu", "Kestel",
    "Mustafakemalpaşa", "Orhangazi", "Karacabey",
  ],
  Denizli: [
    "Merkezefendi", "Pamukkale", "Çivril", "Acıpayam", "Tavas", "Buldan", "Sarayköy",
  ],
  Diyarbakır: [
    "Bağlar", "Kayapınar", "Sur", "Yenişehir", "Bismil", "Ergani", "Silvan", "Çınar",
  ],
  Edirne: ["Merkez", "Keşan", "Uzunköprü", "Havsa", "İpsala", "Enez"],
  Elazığ: ["Merkez", "Kovancılar", "Karakoçan", "Palu", "Baskil"],
  Erzurum: ["Yakutiye", "Palandöken", "Aziziye", "Horasan", "Oltu", "Pasinler"],
  Eskişehir: ["Odunpazarı", "Tepebaşı", "Sivrihisar", "Çifteler", "Alpu", "Mahmudiye"],
  Gaziantep: [
    "Şahinbey", "Şehitkamil", "Oğuzeli", "Nizip", "İslahiye", "Nurdağı", "Araban",
  ],
  Hatay: [
    "Antakya", "Defne", "Arsuz", "İskenderun", "Dörtyol", "Samandağ", "Kırıkhan", "Reyhanlı",
  ],
  Isparta: ["Merkez", "Yalvaç", "Eğirdir", "Senirkent", "Keçiborlu"],
  İstanbul: [
    "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy",
    "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece",
    "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa",
    "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik",
    "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli",
    "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu",
  ],
  İzmir: [
    "Konak", "Karşıyaka", "Bornova", "Buca", "Bayraklı", "Çiğli", "Gaziemir", "Karabağlar",
    "Narlıdere", "Balçova", "Menemen", "Torbalı", "Aliağa", "Bergama", "Çeşme", "Foça",
    "Karaburun", "Kemalpaşa", "Menderes", "Seferihisar", "Selçuk", "Urla", "Ödemiş", "Tire",
  ],
  Kahramanmaraş: ["Onikişubat", "Dulkadiroğlu", "Elbistan", "Afşin", "Türkoğlu", "Pazarcık"],
  Kayseri: [
    "Melikgazi", "Kocasinan", "Talas", "Develi", "Yahyalı", "Bünyan", "Pınarbaşı",
  ],
  Kocaeli: [
    "İzmit", "Gebze", "Darıca", "Körfez", "Gölcük", "Derince", "Kartepe", "Başiskele",
    "Çayırova", "Dilovası", "Karamürsel", "Kandıra",
  ],
  Konya: [
    "Karatay", "Meram", "Selçuklu", "Ereğli", "Akşehir", "Beyşehir", "Cihanbeyli", "Ilgın",
    "Kulu", "Seydişehir",
  ],
  Malatya: ["Battalgazi", "Yeşilyurt", "Darende", "Akçadağ", "Hekimhan"],
  Manisa: [
    "Yunusemre", "Şehzadeler", "Akhisar", "Turgutlu", "Salihli", "Alaşehir", "Soma", "Kırkağaç",
  ],
  Mardin: ["Artuklu", "Kızıltepe", "Nusaybin", "Midyat", "Derik", "Mazıdağı"],
  Mersin: [
    "Akdeniz", "Mezitli", "Toroslar", "Yenişehir", "Tarsus", "Erdemli", "Silifke", "Anamur",
    "Mut",
  ],
  Muğla: [
    "Menteşe", "Bodrum", "Fethiye", "Marmaris", "Milas", "Ortaca", "Dalaman", "Datça", "Köyceğiz",
  ],
  Ordu: ["Altınordu", "Ünye", "Fatsa", "Perşembe", "Kumru", "Gölköy"],
  Sakarya: [
    "Adapazarı", "Serdivan", "Erenler", "Arifiye", "Hendek", "Akyazı", "Geyve", "Sapanca",
  ],
  Samsun: [
    "İlkadım", "Atakum", "Canik", "Tekkeköy", "Bafra", "Çarşamba", "Terme", "Havza",
  ],
  Şanlıurfa: ["Eyyübiye", "Haliliye", "Karaköprü", "Siverek", "Viranşehir", "Suruç", "Birecik"],
  Tekirdağ: ["Süleymanpaşa", "Çorlu", "Çerkezköy", "Kapaklı", "Ergene", "Malkara", "Saray"],
  Trabzon: ["Ortahisar", "Akçaabat", "Araklı", "Of", "Yomra", "Vakfıkebir", "Maçka"],
  Van: ["İpekyolu", "Tuşba", "Edremit", "Erciş", "Muradiye", "Özalp"],
  Yalova: ["Merkez", "Çınarcık", "Altınova", "Armutlu", "Termal", "Çiftlikköy"],
  Zonguldak: ["Merkez", "Ereğli", "Devrek", "Kozlu", "Alaplı", "Çaycuma"],
};

export function getDistricts(city: string): string[] {
  return districts[city] ?? ["Merkez"];
}

export function searchCities(query: string, limit = 8): string[] {
  const q = query.trim().toLocaleLowerCase("tr-TR");
  if (!q) return [...cities].slice(0, limit);

  return cities
    .filter((city) => city.toLocaleLowerCase("tr-TR").includes(q))
    .slice(0, limit);
}
