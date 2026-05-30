import { cities } from "./cities";
import { services } from "./services";

export type Review = {
  id: string;
  name: string;
  city: string;
  service: string;
  rating: number;
  text: string;
  initials: string;
};

const firstNames = [
  "Ayşe", "Mehmet", "Zeynep", "Can", "Elif", "Burak", "Deniz", "Emre", "Fatma", "Gökhan",
  "Hale", "İbrahim", "Jale", "Kemal", "Leyla", "Murat", "Nazlı", "Oğuz", "Pınar", "Rıza",
  "Selin", "Tolga", "Umut", "Veli", "Yasemin", "Ahmet", "Buse", "Cem", "Derya", "Ece",
  "Furkan", "Gizem", "Hakan", "Işıl", "Kaan", "Lale", "Mert", "Nihan", "Onur", "Pelin",
  "Serkan", "Tuğba", "Uğur", "Volkan", "Yusuf", "Aslı", "Barış", "Cansu", "Doğan", "Esra",
];

const lastInitials = [
  "A", "B", "C", "Ç", "D", "E", "F", "G", "H", "I", "İ", "K", "L", "M", "N", "O", "Ö",
  "P", "R", "S", "Ş", "T", "U", "Ü", "V", "Y", "Z",
];

const templates = [
  (service: string) =>
    `${service} hizmeti için Çokusta üzerinden usta buldum. Süreç çok şeffaftı, sonuçtan memnunum.`,
  (service: string) =>
    `Usta zamanında geldi ve ${service} işini titizlikle tamamladı. Kesinlikle tavsiye ederim.`,
  (service: string) =>
    `${service} konusunda endişeliydim ama gelen ekip çok profesyoneldi. Fiyat da uygundu.`,
  (service: string) =>
    `Teklif alma süreci hızlıydı. ${service} işim beklediğimden kısa sürede bitti.`,
  (service: string) =>
    `${service} için seçtiğim usta işinin ehliydi. Temiz çalıştı, sürpriz maliyet çıkmadı.`,
  (service: string) =>
    `Çokusta sayesinde ${service} ihtiyacımı kolayca çözdüm. İletişim ve hizmet kalitesi yüksekti.`,
  (service: string) =>
    `${service} hizmetinde ustamız çok ilgiliydi. Randevuya dakik geldi, işi eksiksiz teslim etti.`,
  (service: string) =>
    `Evimiz için ${service} yaptırdık. Sonuç harika, usta detaylara çok dikkat etti.`,
  (service: string) =>
    `${service} işinde fiyat performans açısından çok iyiydi. Tekrar tercih edeceğim.`,
  (service: string) =>
    `Platform üzerinden ${service} ustası bulmak kolaydı. Yorumlar doğruydu, memnun kaldık.`,
  (service: string) =>
    `${service} için gelen usta sorunları hızlıca çözdü. Güvenilir bir deneyimdi.`,
  (service: string) =>
    `İlk kez Çokusta kullandım, ${service} hizmetinden çok memnun kaldım. Herkese öneririm.`,
];

function toInitials(name: string): string {
  const parts = name.replace(".", "").trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function generateCustomerReviews(count = 250): Review[] {
  const serviceNames = services.map((s) => s.name);
  const reviews: Review[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastInitial = lastInitials[(i * 7 + 3) % lastInitials.length];
    const name = `${firstName} ${lastInitial}.`;
    const city = cities[(i * 11 + 5) % cities.length];
    const service = serviceNames[(i * 13 + 2) % serviceNames.length];
    const template = templates[(i * 17 + 1) % templates.length];
    const rating = i % 17 === 0 ? 4 : 5;

    reviews.push({
      id: String(i + 1),
      name,
      city,
      service,
      rating,
      text: template(service),
      initials: toInitials(name),
    });
  }

  return reviews;
}
