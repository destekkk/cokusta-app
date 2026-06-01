/**
 * Her il için açık teklif talepleri oluşturur (varsayılan: 20 adet/il, yayında/open).
 *
 * Kullanım:
 *   npm run seed:quotes
 *   npm run seed:quotes -- --per-city=20
 */
import { promises as fs } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { services } from "../lib/data/services";
import { getCategoryName } from "../lib/data/categories";
import { cities, getDistricts } from "../lib/data/cities";
import { getJobDescriptionExample } from "../lib/data/job-description-examples";
import type { QuoteRequest, Service, Store } from "../lib/types";

const DEMO_PREFIX = "demo-quote-";

const firstNames = [
  "Ahmet", "Ayşe", "Mehmet", "Fatma", "Mustafa", "Zeynep", "Ali", "Elif",
  "Hüseyin", "Emine", "Hasan", "Hatice", "İbrahim", "Merve", "Osman", "Selin",
  "Yusuf", "Deniz", "Emre", "Buse",
];

const lastNames = [
  "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Aydın", "Öztürk",
  "Arslan", "Doğan", "Kılıç", "Aslan", "Koç", "Kurt", "Polat", "Erdoğan",
  "Güneş", "Aksoy", "Tekin", "Bulut",
];

function parsePerCityArg(): number {
  const arg = process.argv.find((a) => a.startsWith("--per-city="));
  if (!arg) return 20;
  const n = parseInt(arg.split("=")[1] ?? "20", 10);
  return Number.isFinite(n) && n > 0 ? n : 20;
}

const QUOTES_PER_CITY = parsePerCityArg();

function cityKey(city: string): string {
  return city
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function loadEnvFile() {
  for (const name of [".env.local", ".env"]) {
    try {
      const file = await fs.readFile(path.join(process.cwd(), name), "utf-8");
      for (const line of file.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }
      return;
    } catch {
      // try next file
    }
  }
}

function buildAnswers(service: Service): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const q of service.questions) {
    if (q.type === "select" && q.options?.[0]) {
      answers[q.id] = q.options[0].value;
    } else if (q.type === "text" || q.type === "textarea") {
      answers[q.id] = "Standart";
    }
  }
  return answers;
}

function buildNotes(service: Service, index: number): string {
  const raw = getJobDescriptionExample(service.slug, service.categorySlug);
  const base = raw.replace(/^Örn:\s*/i, "").trim();
  const variants = [
    base,
    `${base} Uygun zamanda başlayabiliriz.`,
    `${base} Keşif sonrası netleştirilebilir.`,
    `${base} Detayları görüşerek paylaşırım.`,
  ];
  return variants[index % variants.length];
}

function buildQuote(
  service: Service,
  city: string,
  indexInCity: number,
  globalIndex: number
): QuoteRequest {
  const districtList = getDistricts(city);
  const district = districtList[indexInCity % districtList.length];
  const name = `${firstNames[indexInCity % firstNames.length]} ${lastNames[(indexInCity + globalIndex) % lastNames.length]}`;
  const phone = `053${String(20000000 + globalIndex).slice(-8)}`;

  const daysAgo = indexInCity % 14;
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - daysAgo);
  createdAt.setHours(9 + (indexInCity % 8), (indexInCity * 7) % 60, 0, 0);

  return {
    id: `${DEMO_PREFIX}${cityKey(city)}-${String(indexInCity + 1).padStart(2, "0")}`,
    serviceSlug: service.slug,
    serviceName: service.name,
    categoryName: getCategoryName(service.categorySlug),
    answers: buildAnswers(service),
    city,
    district,
    name,
    phone,
    email: `musteri${globalIndex + 1}@gmail.com`,
    notes: buildNotes(service, indexInCity),
    createdAt: createdAt.toISOString(),
    status: "open",
    urgent: indexInCity === 0 && globalIndex % 17 === 0,
    urgentDeadline:
      indexInCity === 0 && globalIndex % 17 === 0
        ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
  };
}

function buildAllQuotes(): QuoteRequest[] {
  const quotes: QuoteRequest[] = [];
  let globalIndex = 0;

  for (const city of cities) {
    for (let i = 0; i < QUOTES_PER_CITY; i++) {
      const service = services[(globalIndex + i) % services.length];
      quotes.push(buildQuote(service, city, i, globalIndex));
      globalIndex++;
    }
  }

  return quotes;
}

async function seedJson(quotes: QuoteRequest[]) {
  const storePath = path.join(process.cwd(), "data", "store.json");
  let store: Store;

  try {
    const raw = await fs.readFile(storePath, "utf-8");
    store = JSON.parse(raw) as Store;
  } catch {
    store = {
      quoteRequests: [],
      providerOffers: [],
      providers: [],
      customers: [],
      invoices: [],
      taxDeclarations: [],
      providerCertificates: [],
      certificateLedger: [],
      providerOfTheMonthHistory: [],
      creditPurchaseOrders: [],
      providerReferrals: [],
    };
  }

  store.quoteRequests = store.quoteRequests.filter((q) => !q.id.startsWith(DEMO_PREFIX));
  if (!store.providerOffers) store.providerOffers = [];
  store.quoteRequests.unshift(...quotes);
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf-8");
}

async function seedPrisma(quotes: QuoteRequest[]) {
  const prisma = new PrismaClient();

  try {
    await prisma.quoteRequest.deleteMany({
      where: { id: { startsWith: DEMO_PREFIX } },
    });

    const batchSize = 100;
    for (let i = 0; i < quotes.length; i += batchSize) {
      const batch = quotes.slice(i, i + batchSize);
      await prisma.quoteRequest.createMany({
        data: batch.map((quote) => ({
          id: quote.id,
          serviceSlug: quote.serviceSlug,
          serviceName: quote.serviceName,
          categoryName: quote.categoryName,
          answers: quote.answers,
          city: quote.city,
          district: quote.district,
          name: quote.name,
          phone: quote.phone,
          email: quote.email,
          notes: quote.notes,
          createdAt: new Date(quote.createdAt),
          status: "open",
          urgent: quote.urgent ?? false,
          urgentDeadline: quote.urgentDeadline ? new Date(quote.urgentDeadline) : null,
          priorityListing: false,
        })),
      });
      console.log(`  ${Math.min(i + batchSize, quotes.length)} / ${quotes.length}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await loadEnvFile();
  const quotes = buildAllQuotes();
  const usePrisma = Boolean(process.env.DATABASE_URL?.trim());

  console.log(
    `${cities.length} il × ${QUOTES_PER_CITY} = ${quotes.length} açık teklif (yayında/open)`
  );
  console.log(usePrisma ? "Hedef: PostgreSQL (Prisma)" : "Hedef: data/store.json");

  if (usePrisma) {
    await seedPrisma(quotes);
  } else {
    await seedJson(quotes);
  }

  console.log("Tamamlandı.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
