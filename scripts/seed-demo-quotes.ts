/**
 * Her hizmet için açık teklif talepleri oluşturur (varsayılan: 1000 adet/hizmet).
 * Tek müşteri hesabı: 05555269771 — giriş şifresi: 2345
 *
 * Kullanım:
 *   npm run seed:quotes
 *   npm run seed:quotes -- --per-service=1000
 *   npm run seed:quotes:link
 *   npm run seed:quotes:spread-dates   # Nisan–Haziran arasına yay
 */
import { promises as fs } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { services } from "../lib/data/services";
import { getCategoryName } from "../lib/data/categories";
import { cities, getDistricts } from "../lib/data/cities";
import { getJobDescriptionExample } from "../lib/data/job-description-examples";
import { hashProviderPin } from "../lib/provider-pin";
import { normalizeProviderPhone, phonesEqual } from "../lib/phone-utils";
import { generateId } from "../lib/id";
import type { QuoteRequest, Service, Store } from "../lib/types";

const SEED_PREFIX = "ilan-";
const LEGACY_PREFIX = "demo-quote-";
const SEED_PHONE = "05555269771";
const SEED_PIN = "2345";
const QUOTES_PER_CITY = 20;

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

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

const QUOTES_PER_SERVICE = parsePerServiceArg();
const LINK_ONLY = hasFlag("--link-only");
const SPREAD_DATES_ONLY = hasFlag("--spread-dates");
const SKIP_SERVICE_SEED = hasFlag("--skip-service-seed") || LINK_ONLY || SPREAD_DATES_ONLY;
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

/** Nisan 1 — bugün aralığına deterministik yayılım (4., 5., 6. ay). */
function getDateSpreadWindow(): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end.getFullYear(), 3, 1, 0, 0, 0, 0);
  return { start, end };
}

function buildCreatedAt(globalIndex: number, salt = 0): Date {
  const { start, end } = getDateSpreadWindow();
  const spanMs = end.getTime() - start.getTime();
  const hash = globalIndex * 41 + salt * 19;
  const ratio = spanMs > 0 ? (hash % 10007) / 10007 : 0;
  const createdAt = new Date(start.getTime() + ratio * spanMs);
  const hour = 8 + ((globalIndex + salt) % 12);
  const minute = (globalIndex * 7 + salt * 11) % 60;
  createdAt.setHours(hour, minute, 0, 0);
  if (createdAt > end) return new Date(end);
  if (createdAt < start) return new Date(start);
  return createdAt;
}

function buildQuote(service: Service, indexInService: number, globalIndex: number): QuoteRequest {
  const city = cities[globalIndex % cities.length];
  const districtList = getDistricts(city);
  const district = districtList[indexInService % districtList.length];
  const name = `${firstNames[indexInService % firstNames.length]} ${lastNames[(globalIndex + indexInService) % lastNames.length]}`;

  const createdAt = buildCreatedAt(globalIndex, indexInService);

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

function cityKey(city: string): string {
  return city
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildLegacyCityQuote(
  service: Service,
  city: string,
  indexInCity: number,
  globalIndex: number
): QuoteRequest {
  const districtList = getDistricts(city);
  const district = districtList[indexInCity % districtList.length];
  const name = `${firstNames[indexInCity % firstNames.length]} ${lastNames[(indexInCity + globalIndex) % lastNames.length]}`;

  const createdAt = buildCreatedAt(globalIndex, indexInCity + 1000);

  return {
    id: `${LEGACY_PREFIX}${cityKey(city)}-${String(indexInCity + 1).padStart(2, "0")}`,
    serviceSlug: service.slug,
    serviceName: service.name,
    categoryName: getCategoryName(service.categorySlug),
    answers: buildAnswers(service),
    city,
    district,
    name,
    phone: NORMALIZED_PHONE,
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

function buildLegacyCityQuotes(): QuoteRequest[] {
  const quotes: QuoteRequest[] = [];
  let globalIndex = 0;

  for (const city of cities) {
    for (let i = 0; i < QUOTES_PER_CITY; i++) {
      const service = services[(globalIndex + i) % services.length];
      quotes.push(buildLegacyCityQuote(service, city, i, globalIndex));
      globalIndex++;
    }
  }

  return quotes;
}

function quoteToCreateData(quote: QuoteRequest) {
  return {
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
    status: "open" as const,
    urgent: quote.urgent ?? false,
    urgentDeadline: quote.urgentDeadline ? new Date(quote.urgentDeadline) : null,
    priorityListing: false,
  };
}

async function insertQuotesPrisma(prisma: PrismaClient, quotes: QuoteRequest[], label: string) {
  if (quotes.length === 0) return;

  const batchSize = 500;
  for (let i = 0; i < quotes.length; i += batchSize) {
    const batch = quotes.slice(i, i + batchSize);
    await prisma.quoteRequest.createMany({
      data: batch.map(quoteToCreateData),
      skipDuplicates: true,
    });
    console.log(`  ${label}: ${Math.min(i + batchSize, quotes.length)} / ${quotes.length}`);
  }
}

async function assignAllQuotesToControlAccountPrisma(
  prisma: PrismaClient = new PrismaClient(),
  ownClient = true
): Promise<number> {
  try {
    const rows = await prisma.quoteRequest.findMany({ select: { id: true, phone: true } });
    const toUpdate = rows.filter((row) => !phonesEqual(row.phone, NORMALIZED_PHONE));
    if (toUpdate.length === 0) return 0;

    const batchSize = 200;
    for (let i = 0; i < toUpdate.length; i += batchSize) {
      const batch = toUpdate.slice(i, i + batchSize);
      await prisma.$transaction(
        batch.map((row) =>
          prisma.quoteRequest.update({
            where: { id: row.id },
            data: { phone: NORMALIZED_PHONE },
          })
        )
      );
    }

    return toUpdate.length;
  } finally {
    if (ownClient) await prisma.$disconnect();
  }
}

async function assignAllQuotesToControlAccountJson(): Promise<number> {
  const storePath = path.join(process.cwd(), "data", "store.json");
  let store: Store;

  try {
    const raw = await fs.readFile(storePath, "utf-8");
    store = JSON.parse(raw) as Store;
  } catch {
    return 0;
  }

  let updated = 0;
  for (const quote of store.quoteRequests) {
    if (!phonesEqual(quote.phone, NORMALIZED_PHONE)) {
      quote.phone = NORMALIZED_PHONE;
      updated++;
    }
  }

  if (updated > 0) {
    await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf-8");
  }

  return updated;
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

async function deleteQuotesByPrefixPrisma(prisma: PrismaClient, prefix: string) {
  const rows = await prisma.quoteRequest.findMany({
    where: { id: { startsWith: prefix } },
    select: { id: true },
  });
  const ids = rows.map((row) => row.id);
  if (ids.length === 0) return;

  await prisma.providerOffer.deleteMany({ where: { quoteRequestId: { in: ids } } });
  await prisma.quoteRequest.deleteMany({ where: { id: { in: ids } } });
}

async function seedJson(serviceQuotes: QuoteRequest[], legacyQuotes: QuoteRequest[]) {
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

  if (!store.providerOffers) store.providerOffers = [];

  if (!SKIP_SERVICE_SEED) {
    const ilanIds = new Set(
      store.quoteRequests.filter((q) => q.id.startsWith(SEED_PREFIX)).map((q) => q.id)
    );
    store.providerOffers = store.providerOffers.filter((o) => !ilanIds.has(o.quoteRequestId));
    store.quoteRequests = store.quoteRequests.filter((q) => !ilanIds.has(q.id));
    store.quoteRequests.unshift(...serviceQuotes);
  }

  const existingIds = new Set(store.quoteRequests.map((q) => q.id));
  const missingLegacy = legacyQuotes.filter((q) => !existingIds.has(q.id));
  store.quoteRequests.unshift(...missingLegacy);

  let linked = 0;
  for (const quote of store.quoteRequests) {
    if (!phonesEqual(quote.phone, NORMALIZED_PHONE)) {
      quote.phone = NORMALIZED_PHONE;
      linked++;
    }
  }
  if (linked > 0) {
    console.log(`  ${linked} onceki talep ${SEED_PHONE} numarasina baglandi`);
  }

  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf-8");
  await ensureCustomerPinJson();
}

async function seedPrisma(serviceQuotes: QuoteRequest[], legacyQuotes: QuoteRequest[]) {
  const prisma = new PrismaClient();

  try {
    if (!SKIP_SERVICE_SEED) {
      await deleteQuotesByPrefixPrisma(prisma, SEED_PREFIX);
      await insertQuotesPrisma(prisma, serviceQuotes, "ilan");
    }

    await prisma.quoteRequest.updateMany({
      where: { id: { startsWith: LEGACY_PREFIX } },
      data: { phone: NORMALIZED_PHONE },
    });
    await insertQuotesPrisma(prisma, legacyQuotes, "legacy");

    const linked = await assignAllQuotesToControlAccountPrisma(prisma, false);
    if (linked > 0) {
      console.log(`  ${linked} onceki talep ${SEED_PHONE} numarasina baglandi`);
    }
  } finally {
    await prisma.$disconnect();
  }

  await ensureCustomerPinPrisma();
}

async function spreadQuoteDatesPrisma() {
  const prisma = new PrismaClient();

  try {
    const rows = await prisma.quoteRequest.findMany({
      where: {
        OR: [
          { id: { startsWith: SEED_PREFIX } },
          { id: { startsWith: LEGACY_PREFIX } },
          { phone: NORMALIZED_PHONE },
        ],
      },
      select: { id: true },
      orderBy: { id: "asc" },
    });

    if (rows.length === 0) {
      console.log("  Guncellenecek talep bulunamadi.");
      return;
    }

    const batchSize = 2000;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const values = batch
        .map((row, j) => {
          const idx = i + j;
          const dt = buildCreatedAt(idx).toISOString();
          return `('${row.id.replace(/'/g, "''")}', '${dt}'::timestamptz)`;
        })
        .join(",\n");

      await prisma.$executeRawUnsafe(`
        UPDATE quote_requests AS q
        SET created_at = v.dt
        FROM (VALUES ${values}) AS v(id, dt)
        WHERE q.id = v.id
      `);

      console.log(`  ${Math.min(i + batchSize, rows.length)} / ${rows.length}`);
    }

    console.log(`  ${rows.length} talebin tarihi Nisan–Haziran arasina yayildi.`);
  } finally {
    await prisma.$disconnect();
  }
}

async function spreadQuoteDatesJson() {
  const storePath = path.join(process.cwd(), "data", "store.json");
  let store: Store;

  try {
    const raw = await fs.readFile(storePath, "utf-8");
    store = JSON.parse(raw) as Store;
  } catch {
    console.log("  store.json bulunamadi.");
    return;
  }

  const targets = store.quoteRequests.filter(
    (q) =>
      q.id.startsWith(SEED_PREFIX) ||
      q.id.startsWith(LEGACY_PREFIX) ||
      phonesEqual(q.phone, NORMALIZED_PHONE)
  );

  targets.forEach((quote, idx) => {
    quote.createdAt = buildCreatedAt(idx).toISOString();
  });

  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf-8");
  console.log(`  ${targets.length} talebin tarihi Nisan–Haziran arasina yayildi.`);
}

async function main() {
  await loadEnvFile();
  const usePrisma = Boolean(process.env.DATABASE_URL?.trim());

  console.log(`Musteri hesabi: ${SEED_PHONE} — sifre: ${SEED_PIN}`);
  console.log(usePrisma ? "Hedef: PostgreSQL (Prisma)" : "Hedef: data/store.json");

  if (SPREAD_DATES_ONLY) {
    console.log("Mod: mevcut talep tarihlerini Nisan–Haziran arasina yay");
    if (usePrisma) {
      await spreadQuoteDatesPrisma();
    } else {
      await spreadQuoteDatesJson();
    }
    console.log("Tamamlandi.");
    return;
  }

  const serviceQuotes = buildAllQuotes();
  const legacyQuotes = buildLegacyCityQuotes();

  console.log(`Musteri hesabi: ${SEED_PHONE} — sifre: ${SEED_PIN}`);
  console.log(usePrisma ? "Hedef: PostgreSQL (Prisma)" : "Hedef: data/store.json");

  if (LINK_ONLY) {
    console.log("Mod: mevcut talepleri kontrol hesabina bagla + eksik il/ilanlari ekle");
  } else if (SKIP_SERVICE_SEED) {
    console.log("Mod: hizmet ilanlari atlandi");
  } else {
    console.log(
      `${services.length} hizmet × ${QUOTES_PER_SERVICE} = ${serviceQuotes.length} ilan + ${legacyQuotes.length} il bazli talep`
    );
  }

  if (usePrisma) {
    await seedPrisma(serviceQuotes, legacyQuotes);
  } else {
    await seedJson(serviceQuotes, legacyQuotes);
  }

  console.log("Tamamlandi.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
