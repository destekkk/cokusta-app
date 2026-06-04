import { countQuoteRequestsByPhone } from "@/lib/db";
import { getOrCreateCustomerWallet } from "@/lib/db-credits";
import { hashProviderPin, validateNewPin } from "@/lib/provider-pin";
import { normalizeProviderPhone } from "@/lib/phone-utils";
import { prisma } from "@/lib/prisma";
import { isDatabaseEnabled } from "@/lib/db/config";
import { promises as fs } from "fs";
import path from "path";
import type { Store } from "@/lib/types";

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

async function readJsonStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    return {
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
}

async function writeJsonStore(store: Store) {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function getCustomerAuthByPhone(phone: string): Promise<{
  quoteCount: number;
  pinHash: string | null;
}> {
  const normalized = normalizeProviderPhone(phone);

  if (isDatabaseEnabled()) {
    const [quoteCount, wallet] = await Promise.all([
      countQuoteRequestsByPhone(normalized),
      prisma.customerWallet.findFirst({
        where: { phone: normalized },
        select: { pinHash: true },
      }),
    ]);
    return { quoteCount, pinHash: wallet?.pinHash ?? null };
  }

  const quoteCount = await countQuoteRequestsByPhone(normalized);

  const store = await readJsonStore();
  return {
    quoteCount,
    pinHash: store.customerPinHashes?.[normalized] ?? null,
  };
}

export async function setCustomerPin(phone: string, pin: string): Promise<void> {
  const check = validateNewPin(pin);
  if (!check.ok) throw new Error(check.error);

  const normalized = normalizeProviderPhone(phone);
  const pinHash = hashProviderPin(pin);

  if (isDatabaseEnabled()) {
    await getOrCreateCustomerWallet(normalized);
    const wallet = await prisma.customerWallet.findFirstOrThrow({ where: { phone: normalized } });
    await prisma.customerWallet.update({
      where: { id: wallet.id },
      data: { pinHash, updatedAt: new Date() },
    });
    return;
  }

  const store = await readJsonStore();
  store.customerPinHashes = store.customerPinHashes ?? {};
  store.customerPinHashes[normalized] = pinHash;
  await writeJsonStore(store);
}

export async function setCustomerPinIfUnset(phone: string, pin: string): Promise<boolean> {
  const check = validateNewPin(pin);
  if (!check.ok) throw new Error(check.error);

  const normalized = normalizeProviderPhone(phone);
  const auth = await getCustomerAuthByPhone(normalized);
  if (auth.quoteCount === 0) return false;
  if (auth.pinHash) return false;

  const pinHash = hashProviderPin(pin);

  if (isDatabaseEnabled()) {
    await getOrCreateCustomerWallet(normalized);
    const wallet = await prisma.customerWallet.findFirstOrThrow({ where: { phone: normalized } });
    if (wallet.pinHash) return false;
    await prisma.customerWallet.update({
      where: { id: wallet.id },
      data: { pinHash, updatedAt: new Date() },
    });
    return true;
  }

  const store = await readJsonStore();
  store.customerPinHashes = store.customerPinHashes ?? {};
  if (store.customerPinHashes[normalized]) return false;
  store.customerPinHashes[normalized] = pinHash;
  await writeJsonStore(store);
  return true;
}
