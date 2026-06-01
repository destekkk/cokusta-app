/**
 * Her hizmet için açık teklif talepleri oluşturur (varsayılan: 1000 adet/hizmet).
 * Tek müşteri hesabı: 05555269771 — giriş şifresi: 2345
 *
 * Kullanım:
 *   npm run seed:quotes
 *   npm run seed:quotes -- --per-service=1000
 */
import { promises as fs } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { services } from "../lib/data/services";
import { getCategoryName } from "../lib/data/categories";
import { cities, getDistricts } from "../lib/data/cities";
import { getJobDescriptionExample } from "../lib/data/job-description-examples";
import { hashProviderPin } from "../lib/provider-pin";
import { normalizeProviderPhone } from "../lib/phone-utils";
import { generateId } from "../lib/id";
import type { QuoteRequest, Service, Store } from "../lib/types";

const SEED_PREFIX = "ilan-";
const SEED_PHONE = "05555269771";
const SEED_PIN = "2345";

const firstNames = [
  "Ahmet", "Ayse", "Mehmet", "Fatma", "Mustafa", "Zeynep", "Ali", "Elif",
  "Huseyin", "Emine", "Hasan", "Hatice", "Ibrahim", "Merve", "Osman", "Selin",
  "Yusuf", "Deniz", "Emre", "Buse",
];

const lastNames = [
  "Yilmaz", "Kaya", "Demir", "Celik", "Sahin", "Yildiz", "Aydin", "Ozturk",
  "Arslan", "Dogan", "Kilic", "Aslan", "Koc", "Kurt", "Polat", "Erdogan",
  "Gunes", "Aksoy", "Tekin", "Bulut",
];

function parsePerServiceArg(): number {
  const arg = process.argv.find((a) => a.startsWith("--per-service="));
  if (!arg) return 1000;
  const n = parseInt(arg.split("=")[1] ?? "1000", 10);
  return Number.isFinite(n) && n > 0 ? n : 1000;
}

const QUOTES_PER_SERVICE = parsePerServiceArg();
const NORMALIZED_PHONE = normalizeProviderPhone(SEED_PHONE);

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
  const base = raw.replace(/^Orn:\s*/i, "").trim();
  const variants = [
    base,
    `${base} Uygun zamanda baslayabiliriz.`,
    `${base} Kesif sonrasi netlestirilebilir.`,
    `${base} Detaylari goruserek paylasirim.`,
  ];
  return variants[index % variants.length];
}

function buildQuote(service: Service, indexInService: number, globalIndex: number): QuoteRequest {
  const city = cities[globalIndex % cities.length];
  const districtList = getDistricts(city);
  const district = districtList[indexInService % districtList.length];
  const name = `${firstNames[indexInService % firstNames.length]} ${lastNames[(globalIndex + indexInService) % lastNames.length]}`;

  const daysAgo = indexInService % 21;
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - daysAgo);
  createdAt.setHours(9 + (indexInService % 8), (indexInService * 7) % 60, 0, 0);

  return {
    id: `${SEED_PREFIX}${service.slug}-${String(indexInService + 1).padStart(4, "0")}`,
    serviceSlug: service.slug,
    serviceName: service.name,
    categoryName: getCategoryName(service.categorySlug),
    answers: buildAnswers(service),
    city,
    district,
    name,
    phone: NORMALIZED_PHONE,
    email: `musteri${globalIndex + 1}@gmail.com`,
    notes: buildNotes(service, indexInService),
    createdAt: createdAt.toISOString(),
    status: "open",
    urgent: indexInService === 0 && globalIndex % 29 === 0,
    urgentDeadline:
      indexInService === 0 && globalIndex % 29 === 0
        ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
  };
}

function buildAllQuotes(): QuoteRequest[] {
  const quotes: QuoteRequest[] = [];
  let globalIndex = 0;

  for (const service of services) {
    for (let i = 0; i < QUOTES_PER_SERVICE; i++) {
      quotes.push(buildQuote(service, i, globalIndex));
      globalIndex++;
    }
  }

  return quotes;
}

async function ensureCustomerPinJson() {
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
      customerPinHashes: {},
    };
  }

  store.customerPinHashes = store.customerPinHashes ?? {};
  store.customerPinHashes[NORMALIZED_PHONE] = hashProviderPin(SEED_PIN);
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf-8");
}

async function ensureCustomerPinPrisma() {
  const prisma = new PrismaClient();
  const pinHash = hashProviderPin(SEED_PIN);
  const now = new Date();

  try {
    const existing = await prisma.customerWallet.findFirst({ where: { phone: NORMALIZED_PHONE } });
    if (existing) {
      await prisma.customerWallet.update({
        where: { id: existing.id },
        data: { pinHash, updatedAt: now },
      });
    } else {
      await prisma.customerWallet.create({
        data: {
          id: generateId(),
          phone: NORMALIZED_PHONE,
          creditBalance: 0,
          pinHash,
          createdAt: now,
          updatedAt: now,
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
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
      customerPinHashes: {},
    };
  }

  const seedIds = new Set(
    store.quoteRequests
      .filter((q) => q.id.startsWith(SEED_PREFIX) || q.id.startsWith("demo-quote-"))
      .map((q) => q.id)
  );

  if (!store.providerOffers) store.providerOffers = [];
  store.providerOffers = store.providerOffers.filter((o) => !seedIds.has(o.quoteRequestId));
  store.quoteRequests = store.quoteRequests.filter((q) => !seedIds.has(q.id));
  store.quoteRequests.unshift(...quotes);
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf-8");
  await ensureCustomerPinJson();
}

async function seedPrisma(quotes: QuoteRequest[]) {
  const prisma = new PrismaClient();

  try {
    const oldRows = await prisma.quoteRequest.findMany({
      where: {
        OR: [{ id: { startsWith: SEED_PREFIX } }, { id: { startsWith: "demo-quote-" } }],
      },
      select: { id: true },
    });
    const oldIds = oldRows.map((r) => r.id);

    if (oldIds.length > 0) {
      await prisma.providerOffer.deleteMany({ where: { quoteRequestId: { in: oldIds } } });
      await prisma.quoteRequest.deleteMany({ where: { id: { in: oldIds } } });
    }

    const batchSize = 500;
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

  await ensureCustomerPinPrisma();
}

async function main() {
  await loadEnvFile();
  const quotes = buildAllQuotes();
  const usePrisma = Boolean(process.env.DATABASE_URL?.trim());

  console.log(
    `${services.length} hizmet × ${QUOTES_PER_SERVICE} = ${quotes.length} acik teklif (yayinda/open)`
  );
  console.log(`Musteri hesabi: ${SEED_PHONE} — sifre: ${SEED_PIN}`);
  console.log(usePrisma ? "Hedef: PostgreSQL (Prisma)" : "Hedef: data/store.json");

  if (usePrisma) {
    await seedPrisma(quotes);
  } else {
    await seedJson(quotes);
  }

  console.log("Tamamlandi.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
