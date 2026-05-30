import { promises as fs } from "fs";
import path from "path";
import type {
  BillableItem,
  CertificateBlock,
  CertificateType,
  Customer,
  CustomerSummary,
  Invoice,
  PortfolioWithProvider,
  ProviderCertificate,
  ProviderOfTheMonth,
  ProviderPlatformPurchase,
  ProviderPortfolioItem,
  ProviderRegistration,
  ProviderSummary,
  QuoteRequest,
  Store,
  TaxDeclaration,
} from "./types";
import {
  buildCertificatePayload,
  computeBlockHash,
  currentPeriod,
  formatPeriodLabel as formatCertPeriodLabel,
  GENESIS_HASH,
  verifyBlockChain,
} from "./blockchain";
import {
  calculateVat,
  formatPeriod,
  formatPeriodLabel,
  generateInvoiceNo,
  getVatRate,
} from "./billing";
import { LAUNCH_CAMPAIGN, buildLaunchCampaignStats } from "./campaigns";
import { MAX_PORTFOLIO_ITEMS, normalizePhone } from "./portfolio-upload";
import { computeUrgentDeadline, isUrgentActive } from "./urgent";
import { getCommissionRate } from "./admin-auth";

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

const emptyStore: Store = {
  quoteRequests: [],
  providers: [],
  customers: [],
  invoices: [],
  taxDeclarations: [],
  providerCertificates: [],
  certificateLedger: [],
  providerOfTheMonthHistory: [],
};

async function ensureStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      quoteRequests: parsed.quoteRequests ?? [],
      providers: parsed.providers ?? [],
      customers: parsed.customers ?? [],
      invoices: parsed.invoices ?? [],
      taxDeclarations: parsed.taxDeclarations ?? [],
      providerCertificates: parsed.providerCertificates ?? [],
      certificateLedger: parsed.certificateLedger ?? [],
      providerOfTheMonthHistory: parsed.providerOfTheMonthHistory ?? [],
    };
  } catch {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(emptyStore, null, 2));
    return { ...emptyStore };
  }
}

async function saveStore(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function countProviderLaunchSlots(store: Store): number {
  return store.providers.filter((provider) => provider.launchMemberNumber != null).length;
}

function countCustomerLaunchSlots(store: Store): number {
  return store.quoteRequests.filter((request) => request.launchMemberNumber != null).length;
}

function assignProviderLaunchSlot(store: Store, provider: ProviderRegistration): void {
  const claimed = countProviderLaunchSlots(store);
  if (claimed < LAUNCH_CAMPAIGN.provider.maxSlots) {
    provider.launchMemberNumber = claimed + 1;
  }
}

function assignCustomerLaunchSlot(store: Store, request: QuoteRequest): void {
  const claimed = countCustomerLaunchSlots(store);
  if (claimed < LAUNCH_CAMPAIGN.customer.maxSlots) {
    request.launchMemberNumber = claimed + 1;
    request.priorityListing = true;
  }
}

function grantProviderLaunchBonus(provider: ProviderRegistration): void {
  if (
    provider.launchMemberNumber &&
    !provider.launchBonusGranted &&
    provider.status === "approved"
  ) {
    provider.creditBalance =
      (provider.creditBalance ?? 0) + LAUNCH_CAMPAIGN.provider.freeCredits;
    provider.launchBonusGranted = true;
  }
}

export async function getLaunchCampaignStats() {
  const store = await ensureStore();
  return buildLaunchCampaignStats(
    countProviderLaunchSlots(store),
    countCustomerLaunchSlots(store)
  );
}

export async function createQuoteRequest(
  data: Omit<QuoteRequest, "id" | "createdAt" | "status">
): Promise<QuoteRequest> {
  const store = await ensureStore();
  const createdAt = new Date().toISOString();
  const request: QuoteRequest = {
    ...data,
    id: generateId(),
    createdAt,
    status: "pending",
    urgent: data.urgent ?? false,
    urgentDeadline: data.urgent ? computeUrgentDeadline(new Date(createdAt)) : undefined,
  };
  assignCustomerLaunchSlot(store, request);
  store.quoteRequests.unshift(request);
  await saveStore(store);
  return request;
}

export async function getUrgentQuoteRequests(): Promise<QuoteRequest[]> {
  const store = await ensureStore();
  return store.quoteRequests
    .filter((quote) => isUrgentActive(quote))
    .sort((a, b) => {
      const deadlineA = a.urgentDeadline ? new Date(a.urgentDeadline).getTime() : Infinity;
      const deadlineB = b.urgentDeadline ? new Date(b.urgentDeadline).getTime() : Infinity;
      return deadlineA - deadlineB;
    });
}

export async function createProviderRegistration(
  data: Omit<ProviderRegistration, "id" | "createdAt" | "status">
): Promise<ProviderRegistration> {
  const store = await ensureStore();
  const provider: ProviderRegistration = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    status: "pending",
    creditBalance: 0,
  };
  assignProviderLaunchSlot(store, provider);
  store.providers.unshift(provider);
  await saveStore(store);
  return provider;
}

export async function getQuoteRequestById(id: string): Promise<QuoteRequest | undefined> {
  const store = await ensureStore();
  return store.quoteRequests.find((r) => r.id === id);
}

export async function getAllQuoteRequests(): Promise<QuoteRequest[]> {
  const store = await ensureStore();
  return store.quoteRequests;
}

export async function getAllProviders(): Promise<ProviderRegistration[]> {
  const store = await ensureStore();
  return store.providers;
}

export async function getProviderById(id: string): Promise<ProviderRegistration | undefined> {
  const store = await ensureStore();
  return store.providers.find((provider) => provider.id === id);
}

export async function updateQuoteRequestStatus(
  id: string,
  status: QuoteRequest["status"],
  options?: {
    jobValue?: number;
    matchedProviderId?: string;
    matchedProviderName?: string;
  }
): Promise<QuoteRequest | null> {
  const store = await ensureStore();
  const index = store.quoteRequests.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const request = store.quoteRequests[index];
  request.status = status;

  if (status === "matched") {
    request.matchedProviderId = options?.matchedProviderId;
    request.matchedProviderName = options?.matchedProviderName;
  }

  if (status === "pending" || status === "cancelled") {
    request.matchedProviderId = undefined;
    request.matchedProviderName = undefined;
  }

  if (status === "completed" && options?.jobValue && options.jobValue > 0) {
    const rate = getCommissionRate();
    request.jobValue = options.jobValue;
    request.commissionRate = rate;
    request.commissionAmount = Math.round(options.jobValue * rate);
    request.completedAt = new Date().toISOString();
  }

  if (status !== "completed") {
    request.jobValue = undefined;
    request.commissionRate = undefined;
    request.commissionAmount = undefined;
    request.completedAt = undefined;
  }

  store.quoteRequests[index] = request;
  await saveStore(store);
  return request;
}

export async function updateProviderStatus(
  id: string,
  status: "approved" | "rejected",
  rejectionReason?: string
): Promise<ProviderRegistration | null> {
  const store = await ensureStore();
  const index = store.providers.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const provider = store.providers[index];
  provider.status = status;
  provider.reviewedAt = new Date().toISOString();
  provider.rejectionReason = status === "rejected" ? rejectionReason ?? "" : undefined;

  if (status === "approved") {
    grantProviderLaunchBonus(provider);
  }

  store.providers[index] = provider;
  await saveStore(store);
  return provider;
}

export async function updateProvider(
  id: string,
  data: Partial<
    Omit<ProviderRegistration, "id" | "createdAt" | "reviewedAt" | "rejectionReason">
  >
): Promise<ProviderRegistration | null> {
  const store = await ensureStore();
  const index = store.providers.findIndex((provider) => provider.id === id);
  if (index === -1) return null;

  const provider = { ...store.providers[index], ...data };
  store.providers[index] = provider;
  await saveStore(store);
  return provider;
}

export async function createProviderAdmin(
  data: Omit<ProviderRegistration, "id" | "createdAt" | "reviewedAt" | "rejectionReason">
): Promise<ProviderRegistration> {
  const store = await ensureStore();
  const provider: ProviderRegistration = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    platformPurchases: data.platformPurchases ?? [],
    creditBalance: data.creditBalance ?? 0,
  };
  assignProviderLaunchSlot(store, provider);
  if (provider.status === "approved") {
    grantProviderLaunchBonus(provider);
  }
  store.providers.unshift(provider);
  await saveStore(store);
  return provider;
}

export async function deleteProvider(id: string): Promise<boolean> {
  const store = await ensureStore();
  const index = store.providers.findIndex((provider) => provider.id === id);
  if (index === -1) return false;

  store.providers.splice(index, 1);
  for (const quote of store.quoteRequests) {
    if (quote.matchedProviderId === id) {
      quote.matchedProviderId = undefined;
      quote.matchedProviderName = undefined;
      if (quote.status === "matched") quote.status = "pending";
    }
  }

  await saveStore(store);
  return true;
}

function customerKeyFromPhone(phone: string, name: string, email: string): string {
  const normalized = phone.replace(/\D/g, "");
  return normalized || `${name}-${email}`.toLowerCase();
}

function customerKey(quote: QuoteRequest): string {
  return customerKeyFromPhone(quote.phone, quote.name, quote.email);
}

function quoteStatsForPhone(store: Store, phone: string) {
  const key = customerKeyFromPhone(phone, "", "");
  const quotes = store.quoteRequests.filter(
    (quote) => customerKey(quote) === key || quote.phone.replace(/\D/g, "") === phone.replace(/\D/g, "")
  );

  return quotes.reduce(
    (acc, quote) => {
      acc.requestCount += 1;
      if (quote.status === "completed") {
        acc.completedJobs += 1;
        acc.totalSpent += quote.jobValue ?? 0;
        acc.platformRevenue += quote.commissionAmount ?? 0;
      }
      if (!acc.lastRequestAt || new Date(quote.createdAt) > new Date(acc.lastRequestAt)) {
        acc.lastRequestAt = quote.createdAt;
      }
      return acc;
    },
    {
      requestCount: 0,
      completedJobs: 0,
      totalSpent: 0,
      platformRevenue: 0,
      lastRequestAt: "",
    }
  );
}

function syncQuotesForCustomer(
  store: Store,
  oldPhone: string,
  data: Pick<Customer, "name" | "phone" | "email" | "city">
) {
  const oldKey = customerKeyFromPhone(oldPhone, "", "");
  for (const quote of store.quoteRequests) {
    const quotePhoneKey = quote.phone.replace(/\D/g, "");
    if (quotePhoneKey === oldPhone.replace(/\D/g, "") || customerKey(quote) === oldKey) {
      quote.name = data.name;
      quote.phone = data.phone;
      quote.email = data.email;
      quote.city = data.city;
    }
  }
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  const store = await ensureStore();
  return store.customers.find((customer) => customer.id === id);
}

export async function createCustomer(
  data: Omit<Customer, "id" | "createdAt">
): Promise<Customer> {
  const store = await ensureStore();
  const customer: Customer = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  store.customers.unshift(customer);
  await saveStore(store);
  return customer;
}

export async function updateCustomer(
  id: string,
  data: Partial<Omit<Customer, "id" | "createdAt">>
): Promise<Customer | null> {
  const store = await ensureStore();
  const index = store.customers.findIndex((customer) => customer.id === id);
  if (index === -1) return null;

  const current = store.customers[index];
  const updated = { ...current, ...data };
  syncQuotesForCustomer(store, current.phone, updated);
  store.customers[index] = updated;
  await saveStore(store);
  return updated;
}

export async function updateCustomerByKey(
  key: string,
  data: Pick<Customer, "name" | "phone" | "email" | "city" | "notes">
): Promise<boolean> {
  const store = await ensureStore();
  const matchingQuotes = store.quoteRequests.filter((quote) => customerKey(quote) === key);
  if (matchingQuotes.length === 0) return false;

  for (const quote of matchingQuotes) {
    quote.name = data.name;
    quote.phone = data.phone;
    quote.email = data.email;
    quote.city = data.city;
  }

  await saveStore(store);
  return true;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const store = await ensureStore();
  const index = store.customers.findIndex((customer) => customer.id === id);
  if (index === -1) return false;

  const phone = store.customers[index].phone;
  store.customers.splice(index, 1);
  store.quoteRequests = store.quoteRequests.filter(
    (quote) => quote.phone.replace(/\D/g, "") !== phone.replace(/\D/g, "")
  );
  await saveStore(store);
  return true;
}

export async function deleteCustomerByKey(key: string): Promise<boolean> {
  const store = await ensureStore();
  const before = store.quoteRequests.length;
  store.quoteRequests = store.quoteRequests.filter((quote) => customerKey(quote) !== key);
  await saveStore(store);
  return store.quoteRequests.length < before;
}

export async function getCustomerSummaries(): Promise<CustomerSummary[]> {
  const store = await ensureStore();
  const map = new Map<string, CustomerSummary>();

  for (const customer of store.customers) {
    const key = customerKeyFromPhone(customer.phone, customer.name, customer.email);
    const stats = quoteStatsForPhone(store, customer.phone);
    map.set(key, {
      id: customer.id,
      key,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      city: customer.city,
      notes: customer.notes,
      requestCount: stats.requestCount,
      completedJobs: stats.completedJobs,
      totalSpent: stats.totalSpent,
      platformRevenue: stats.platformRevenue,
      lastRequestAt: stats.lastRequestAt || customer.createdAt,
    });
  }

  for (const quote of store.quoteRequests) {
    const key = customerKey(quote);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        key,
        name: quote.name,
        phone: quote.phone,
        email: quote.email,
        city: quote.city,
        requestCount: 1,
        completedJobs: quote.status === "completed" ? 1 : 0,
        totalSpent: quote.status === "completed" ? (quote.jobValue ?? 0) : 0,
        platformRevenue:
          quote.status === "completed" ? (quote.commissionAmount ?? 0) : 0,
        lastRequestAt: quote.createdAt,
      });
      continue;
    }

    if (existing.id) continue;

    existing.requestCount += 1;
    if (quote.status === "completed") {
      existing.completedJobs += 1;
      existing.totalSpent += quote.jobValue ?? 0;
      existing.platformRevenue += quote.commissionAmount ?? 0;
    }
    if (new Date(quote.createdAt) > new Date(existing.lastRequestAt)) {
      existing.lastRequestAt = quote.createdAt;
      existing.name = quote.name;
      existing.city = quote.city;
      if (quote.email) existing.email = quote.email;
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastRequestAt).getTime() - new Date(a.lastRequestAt).getTime()
  );
}

export async function getProviderSummaries(): Promise<ProviderSummary[]> {
  const store = await ensureStore();

  return store.providers
    .map((provider) => {
      const relatedQuotes = store.quoteRequests.filter(
        (quote) => quote.matchedProviderId === provider.id
      );
      const completedQuotes = relatedQuotes.filter((quote) => quote.status === "completed");
      const activeQuotes = relatedQuotes.filter((quote) => quote.status === "matched");
      const platformPurchases = provider.platformPurchases ?? [];
      const certificates = store.providerCertificates.filter(
        (cert) => cert.providerId === provider.id
      );

      return {
        ...provider,
        platformPurchases,
        completedJobs: completedQuotes.length,
        activeJobs: activeQuotes.length,
        totalJobEarnings: completedQuotes.reduce(
          (sum, quote) => sum + (quote.jobValue ?? 0),
          0
        ),
        platformSpend: platformPurchases
          .filter((purchase) => purchase.status === "active")
          .reduce((sum, purchase) => sum + purchase.amount, 0),
        certificateCount: certificates.length,
        isMasterCraftsman: certificates.some((cert) => cert.type === "master_craftsman"),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addProviderPlatformPurchase(
  providerId: string,
  data: Omit<ProviderPlatformPurchase, "id" | "purchasedAt">
): Promise<ProviderRegistration | null> {
  const store = await ensureStore();
  const index = store.providers.findIndex((provider) => provider.id === providerId);
  if (index === -1) return null;

  const provider = store.providers[index];
  const purchases = provider.platformPurchases ?? [];
  purchases.unshift({
    ...data,
    id: generateId(),
    purchasedAt: new Date().toISOString(),
  });
  provider.platformPurchases = purchases;

  store.providers[index] = provider;
  await saveStore(store);
  return provider;
}

export async function getApprovedProviders(): Promise<ProviderRegistration[]> {
  const store = await ensureStore();
  return store.providers.filter((provider) => provider.status === "approved");
}

export async function findApprovedProviderByPhone(
  phone: string
): Promise<ProviderRegistration | undefined> {
  const normalized = normalizePhone(phone);
  if (normalized.length < 10) return undefined;

  const store = await ensureStore();
  return store.providers.find(
    (provider) =>
      provider.status === "approved" && normalizePhone(provider.phone) === normalized
  );
}

export async function addProviderPortfolioItem(
  providerId: string,
  data: Omit<ProviderPortfolioItem, "id" | "createdAt">
): Promise<ProviderPortfolioItem> {
  const store = await ensureStore();
  const index = store.providers.findIndex((provider) => provider.id === providerId);
  if (index === -1) throw new Error("Usta bulunamadı.");

  const provider = store.providers[index];
  if (provider.status !== "approved") {
    throw new Error("Sadece onaylı ustalar portfolyo ekleyebilir.");
  }

  const portfolio = provider.portfolio ?? [];
  if (portfolio.length >= MAX_PORTFOLIO_ITEMS) {
    throw new Error(`En fazla ${MAX_PORTFOLIO_ITEMS} proje ekleyebilirsiniz.`);
  }

  const item: ProviderPortfolioItem = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  portfolio.unshift(item);
  provider.portfolio = portfolio;
  store.providers[index] = provider;
  await saveStore(store);
  return item;
}

export async function removeProviderPortfolioItem(
  providerId: string,
  itemId: string
): Promise<boolean> {
  const store = await ensureStore();
  const index = store.providers.findIndex((provider) => provider.id === providerId);
  if (index === -1) return false;

  const provider = store.providers[index];
  const portfolio = provider.portfolio ?? [];
  const itemIndex = portfolio.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) return false;

  portfolio.splice(itemIndex, 1);
  provider.portfolio = portfolio;
  store.providers[index] = provider;
  await saveStore(store);
  return true;
}

function flattenPortfolio(store: Store): PortfolioWithProvider[] {
  const items: PortfolioWithProvider[] = [];

  for (const provider of store.providers) {
    if (provider.status !== "approved") continue;
    for (const item of provider.portfolio ?? []) {
      items.push({
        ...item,
        providerId: provider.id,
        providerName: provider.name,
        providerCity: provider.city,
      });
    }
  }

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getRecentPortfolioItems(limit = 8): Promise<PortfolioWithProvider[]> {
  const store = await ensureStore();
  return flattenPortfolio(store).slice(0, limit);
}

export async function getPortfolioByService(
  serviceSlug: string,
  limit = 4
): Promise<PortfolioWithProvider[]> {
  const store = await ensureStore();
  return flattenPortfolio(store)
    .filter((item) => item.serviceSlug === serviceSlug)
    .slice(0, limit);
}

export async function getPublicProviderProfile(id: string) {
  const provider = await getProviderById(id);
  if (!provider || provider.status !== "approved") return null;
  return provider;
}

function nextInvoiceSequence(invoices: Invoice[], period: string): number {
  const periodInvoices = invoices.filter((invoice) => invoice.period === period);
  return periodInvoices.length + 1;
}

function hasInvoice(
  invoices: Invoice[],
  referenceType: Invoice["referenceType"],
  referenceId: string
): boolean {
  return invoices.some(
    (invoice) =>
      invoice.referenceType === referenceType && invoice.referenceId === referenceId
  );
}

export async function getAllInvoices(): Promise<Invoice[]> {
  const store = await ensureStore();
  return store.invoices.sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  );
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  const store = await ensureStore();
  return store.invoices.find((invoice) => invoice.id === id);
}

export async function getTaxDeclarationById(
  id: string
): Promise<TaxDeclaration | undefined> {
  const store = await ensureStore();
  return store.taxDeclarations.find((declaration) => declaration.id === id);
}

export async function getBillableItems(): Promise<BillableItem[]> {
  const store = await ensureStore();
  const items: BillableItem[] = [];

  for (const quote of store.quoteRequests) {
    if (quote.status !== "completed" || !quote.commissionAmount) continue;
    if (quote.invoiceId || hasInvoice(store.invoices, "quote", quote.id)) continue;

    items.push({
      key: `quote-${quote.id}`,
      type: "quote",
      referenceId: quote.id,
      providerId: quote.matchedProviderId,
      title: `${quote.serviceName} komisyonu`,
      recipientName: quote.matchedProviderName ?? quote.name,
      amount: quote.commissionAmount,
      date: quote.completedAt ?? quote.createdAt,
    });
  }

  for (const provider of store.providers) {
    for (const purchase of provider.platformPurchases ?? []) {
      if (purchase.status !== "active") continue;
      if (purchase.invoiceId || hasInvoice(store.invoices, "platform-purchase", purchase.id)) {
        continue;
      }

      items.push({
        key: `purchase-${purchase.id}`,
        type: "platform-purchase",
        referenceId: purchase.id,
        providerId: provider.id,
        title: purchase.serviceName,
        recipientName: provider.name,
        amount: purchase.amount,
        date: purchase.purchasedAt,
      });
    }
  }

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function createInvoiceForQuote(quoteId: string): Promise<Invoice | null> {
  const store = await ensureStore();
  const quote = store.quoteRequests.find((item) => item.id === quoteId);
  if (!quote || quote.status !== "completed" || !quote.commissionAmount) return null;
  if (quote.invoiceId || hasInvoice(store.invoices, "quote", quote.id)) return null;

  const issuedAt = new Date();
  const period = formatPeriod(issuedAt);
  const vatRate = getVatRate();
  const amounts = calculateVat(quote.commissionAmount, vatRate);
  const provider = store.providers.find((item) => item.id === quote.matchedProviderId);

  const invoice: Invoice = {
    id: generateId(),
    invoiceNo: generateInvoiceNo(period, nextInvoiceSequence(store.invoices, period)),
    referenceType: "quote",
    referenceId: quote.id,
    recipientName: quote.matchedProviderName ?? quote.name,
    recipientEmail: provider?.email,
    recipientPhone: provider?.phone ?? quote.phone,
    description: `${quote.serviceName} — platform komisyon bedeli (İş No: ${quote.id})`,
    ...amounts,
    period,
    issuedAt: issuedAt.toISOString(),
  };

  quote.invoiceId = invoice.id;
  store.invoices.unshift(invoice);
  await saveStore(store);
  return invoice;
}

export async function createInvoiceForPurchase(
  providerId: string,
  purchaseId: string
): Promise<Invoice | null> {
  const store = await ensureStore();
  const provider = store.providers.find((item) => item.id === providerId);
  if (!provider) return null;

  const purchase = provider.platformPurchases?.find((item) => item.id === purchaseId);
  if (!purchase || purchase.status !== "active") return null;
  if (purchase.invoiceId || hasInvoice(store.invoices, "platform-purchase", purchase.id)) {
    return null;
  }

  const issuedAt = new Date();
  const period = formatPeriod(issuedAt);
  const vatRate = getVatRate();
  const amounts = calculateVat(purchase.amount, vatRate);

  const invoice: Invoice = {
    id: generateId(),
    invoiceNo: generateInvoiceNo(period, nextInvoiceSequence(store.invoices, period)),
    referenceType: "platform-purchase",
    referenceId: purchase.id,
    recipientName: provider.name,
    recipientEmail: provider.email,
    recipientPhone: provider.phone,
    description: `${purchase.serviceName} — platform hizmet bedeli`,
    ...amounts,
    period,
    issuedAt: issuedAt.toISOString(),
  };

  purchase.invoiceId = invoice.id;
  store.invoices.unshift(invoice);
  await saveStore(store);
  return invoice;
}

export async function createAllPendingInvoices(): Promise<Invoice[]> {
  const billable = await getBillableItems();
  const created: Invoice[] = [];

  for (const item of billable) {
    const invoice =
      item.type === "quote"
        ? await createInvoiceForQuote(item.referenceId)
        : item.providerId
          ? await createInvoiceForPurchase(item.providerId, item.referenceId)
          : null;
    if (invoice) created.push(invoice);
  }

  return created;
}

export async function createTaxDeclaration(period?: string): Promise<TaxDeclaration | null> {
  const store = await ensureStore();
  const targetPeriod = period ?? formatPeriod(new Date());

  const existing = store.taxDeclarations.find(
    (declaration) => declaration.period === targetPeriod
  );
  if (existing) return existing;

  const periodInvoices = store.invoices.filter((invoice) => invoice.period === targetPeriod);
  if (periodInvoices.length === 0) return null;

  const taxableBase = periodInvoices.reduce((sum, invoice) => sum + invoice.subtotal, 0);
  const calculatedVat = periodInvoices.reduce((sum, invoice) => sum + invoice.vatAmount, 0);
  const totalAmount = periodInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

  const declaration: TaxDeclaration = {
    id: generateId(),
    period: targetPeriod,
    periodLabel: formatPeriodLabel(targetPeriod),
    invoiceCount: periodInvoices.length,
    taxableBase: Math.round(taxableBase * 100) / 100,
    calculatedVat: Math.round(calculatedVat * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    createdAt: new Date().toISOString(),
  };

  store.taxDeclarations.unshift(declaration);
  await saveStore(store);
  return declaration;
}

export async function getBillingOverview() {
  const [invoices, billable, declarations] = await Promise.all([
    getAllInvoices(),
    getBillableItems(),
    ensureStore().then((store) => store.taxDeclarations),
  ]);

  const currentPeriod = formatPeriod(new Date());
  const currentPeriodInvoices = invoices.filter((invoice) => invoice.period === currentPeriod);
  const hasDeclaration = declarations.some(
    (declaration) => declaration.period === currentPeriod
  );

  return {
    currentPeriod,
    currentPeriodLabel: formatPeriodLabel(currentPeriod),
    invoiceCount: invoices.length,
    pendingCount: billable.length,
    currentPeriodInvoiceCount: currentPeriodInvoices.length,
    currentPeriodRevenue: currentPeriodInvoices.reduce(
      (sum, invoice) => sum + invoice.total,
      0
    ),
    hasDeclaration,
    latestDeclaration: declarations[0] ?? null,
  };
}

export async function getStats() {
  const store = await ensureStore();
  const approvedProviders = store.providers.filter((p) => p.status === "approved").length;
  const totalProviders = approvedProviders + 12000;
  const completedJobs = store.quoteRequests.filter((r) => r.status === "completed").length;
  const totalJobs = completedJobs + 850000;

  return {
    providers: totalProviders,
    jobs: totalJobs,
    avgRating: 4.8,
    pendingRequests: store.quoteRequests.filter((r) => r.status === "pending").length,
  };
}

export async function getAdminStats() {
  const store = await ensureStore();
  const commissionRate = getCommissionRate();

  const pendingQuotes = store.quoteRequests.filter((r) => r.status === "pending");
  const matchedQuotes = store.quoteRequests.filter((r) => r.status === "matched");
  const completedQuotes = store.quoteRequests.filter((r) => r.status === "completed");

  const pendingProviders = store.providers.filter((p) => p.status === "pending");
  const approvedProviders = store.providers.filter((p) => p.status === "approved");
  const rejectedProviders = store.providers.filter((p) => p.status === "rejected");

  const totalRevenue = completedQuotes.reduce(
    (sum, q) => sum + (q.commissionAmount ?? 0),
    0
  );

  const totalJobVolume = completedQuotes.reduce(
    (sum, q) => sum + (q.jobValue ?? 0),
    0
  );

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyRevenue = completedQuotes
    .filter((q) => q.completedAt && new Date(q.completedAt) >= thisMonth)
    .reduce((sum, q) => sum + (q.commissionAmount ?? 0), 0);

  return {
    commissionRate,
    pendingQuotes: pendingQuotes.length,
    matchedQuotes: matchedQuotes.length,
    completedQuotes: completedQuotes.length,
    pendingProviders: pendingProviders.length,
    approvedProviders: approvedProviders.length,
    rejectedProviders: rejectedProviders.length,
    totalRevenue,
    totalJobVolume,
    monthlyRevenue,
  };
}

function appendCertificateBlock(
  ledger: CertificateBlock[],
  certificateId: string,
  payload: Record<string, unknown>
): CertificateBlock {
  const index = ledger.length;
  const previousHash = index === 0 ? GENESIS_HASH : ledger[index - 1].hash;
  const timestamp = new Date().toISOString();
  const data = buildCertificatePayload(payload);
  const hash = computeBlockHash(index, timestamp, certificateId, data, previousHash);

  const block: CertificateBlock = {
    index,
    timestamp,
    certificateId,
    data,
    previousHash,
    hash,
  };

  ledger.push(block);
  return block;
}

export async function getAllCertificates(): Promise<ProviderCertificate[]> {
  const store = await ensureStore();
  return [...store.providerCertificates].sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  );
}

export async function getCertificateById(id: string): Promise<ProviderCertificate | undefined> {
  const store = await ensureStore();
  return store.providerCertificates.find((cert) => cert.id === id);
}

export async function getProviderCertificates(providerId: string): Promise<ProviderCertificate[]> {
  const store = await ensureStore();
  return store.providerCertificates.filter((cert) => cert.providerId === providerId);
}

export async function verifyCertificateChain(certificateId: string) {
  const store = await ensureStore();
  const certificate = store.providerCertificates.find((cert) => cert.id === certificateId);
  if (!certificate) return { valid: false, certificate: null as ProviderCertificate | null };

  const blockIndex = store.certificateLedger.findIndex(
    (block) => block.certificateId === certificateId
  );
  if (blockIndex === -1) {
    return { valid: false, certificate };
  }

  const chain = store.certificateLedger.slice(0, blockIndex + 1);
  const chainCheck = verifyBlockChain(chain);
  const block = store.certificateLedger[blockIndex];

  return {
    valid: chainCheck.valid && block.hash === certificate.blockHash,
    certificate,
    block,
    chainLength: store.certificateLedger.length,
    brokenAt: chainCheck.brokenAt,
  };
}

export async function issueProviderCertificate(
  providerId: string,
  type: CertificateType,
  options?: { period?: string; reason?: string }
): Promise<ProviderCertificate> {
  const store = await ensureStore();
  const provider = store.providers.find((item) => item.id === providerId);
  if (!provider) throw new Error("Usta bulunamadı.");
  if (provider.status !== "approved") throw new Error("Sadece onaylı ustalara sertifika verilebilir.");

  const summaries = await getProviderSummaries();
  const summary = summaries.find((item) => item.id === providerId);

  if (type === "master_craftsman") {
    const existing = store.providerCertificates.find(
      (cert) => cert.providerId === providerId && cert.type === "master_craftsman"
    );
    if (existing) throw new Error("Bu usta zaten Çok Başarılı Usta sertifikasına sahip.");
  }

  const period = options?.period ?? (type === "provider_of_month" ? currentPeriod() : undefined);
  const certificateId = generateId();
  const issuedAt = new Date().toISOString();

  const title =
    type === "master_craftsman"
      ? "Çok Başarılı Usta Sertifikası"
      : `${formatCertPeriodLabel(period!)} Ayın Ustası`;

  const description =
    type === "master_craftsman"
      ? "Çokusta platformunda üstün performans, müşteri memnuniyeti ve güvenilirlik gösteren ustalara verilen blockchain doğrulamalı sertifika."
      : options?.reason ??
        "Ay boyunca en yüksek müşteri memnuniyeti ve iş kalitesi ile öne çıkan usta.";

  const payload = {
    providerId,
    providerName: provider.name,
    type,
    title,
    period,
    issuedAt,
    metadata: {
      completedJobs: summary?.completedJobs ?? 0,
      totalEarnings: summary?.totalJobEarnings ?? 0,
      city: provider.city,
      categories: provider.categorySlugs,
    },
  };

  const block = appendCertificateBlock(store.certificateLedger, certificateId, payload);

  const certificate: ProviderCertificate = {
    id: certificateId,
    providerId,
    providerName: provider.name,
    type,
    title,
    description,
    period,
    issuedAt,
    blockIndex: block.index,
    blockHash: block.hash,
    previousHash: block.previousHash,
    metadata: payload.metadata,
  };

  store.providerCertificates.unshift(certificate);
  await saveStore(store);
  return certificate;
}

export async function selectProviderOfTheMonth(
  providerId: string,
  options?: { period?: string; reason?: string }
): Promise<{ certificate: ProviderCertificate; selection: ProviderOfTheMonth }> {
  const period = options?.period ?? currentPeriod();

  const certificate = await issueProviderCertificate(providerId, "provider_of_month", {
    period,
    reason: options?.reason,
  });

  const selection: ProviderOfTheMonth = {
    period,
    periodLabel: formatCertPeriodLabel(period),
    providerId: certificate.providerId,
    providerName: certificate.providerName,
    certificateId: certificate.id,
    selectedAt: new Date().toISOString(),
    reason: options?.reason,
  };

  const store = await ensureStore();
  const existingIndex = store.providerOfTheMonthHistory.findIndex(
    (item) => item.period === period
  );
  if (existingIndex !== -1) {
    store.providerOfTheMonthHistory[existingIndex] = selection;
  } else {
    store.providerOfTheMonthHistory.unshift(selection);
  }
  await saveStore(store);

  return { certificate, selection };
}

export async function getCurrentProviderOfTheMonth(): Promise<
  (ProviderOfTheMonth & { certificate?: ProviderCertificate; provider?: ProviderSummary }) | null
> {
  const store = await ensureStore();
  const current = store.providerOfTheMonthHistory[0];
  if (!current) return null;

  const certificate = store.providerCertificates.find((cert) => cert.id === current.certificateId);
  const summaries = await getProviderSummaries();
  const provider = summaries.find((item) => item.id === current.providerId);

  return { ...current, certificate, provider };
}

export async function getProviderOfTheMonthHistory(): Promise<ProviderOfTheMonth[]> {
  const store = await ensureStore();
  return store.providerOfTheMonthHistory;
}

export async function getMonthlyLeaderboard(limit = 5) {
  const store = await ensureStore();
  const period = currentPeriod();
  const [year, month] = period.split("-").map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  const scores = new Map<
    string,
    { providerId: string; name: string; city: string; completedJobs: number; earnings: number }
  >();

  for (const quote of store.quoteRequests) {
    if (quote.status !== "completed" || !quote.matchedProviderId || !quote.completedAt) continue;
    const completedAt = new Date(quote.completedAt);
    if (completedAt < monthStart || completedAt > monthEnd) continue;

    const provider = store.providers.find((item) => item.id === quote.matchedProviderId);
    if (!provider || provider.status !== "approved") continue;

    const entry = scores.get(quote.matchedProviderId) ?? {
      providerId: quote.matchedProviderId,
      name: provider.name,
      city: provider.city,
      completedJobs: 0,
      earnings: 0,
    };
    entry.completedJobs += 1;
    entry.earnings += quote.jobValue ?? 0;
    scores.set(quote.matchedProviderId, entry);
  }

  return [...scores.values()]
    .sort((a, b) => b.completedJobs - a.completedJobs || b.earnings - a.earnings)
    .slice(0, limit);
}
