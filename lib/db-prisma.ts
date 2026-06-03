import type {
  BillableItem,
  CertificateType,
  Customer,
  CustomerSummary,
  Invoice,
  OfferNegotiationEntry,
  PortfolioWithProvider,
  ProviderCertificate,
  ProviderOfTheMonth,
  ProviderPlatformPurchase,
  ProviderPortfolioItem,
  ProviderRegistration,
  ProviderOffer,
  ProviderOfferReviewSummary,
  ProviderOfferWithQuote,
  ProviderSummary,
  PublicProviderReview,
  ProviderReviewStats,
  QuoteRequest,
  TaxDeclaration,
  CreditPurchaseOrder,
} from "./types";
import { PROVIDER_OF_MONTH_CREDIT_REWARD } from "./provider-of-month";
import { REFERRAL_REWARD_CREDITS, validateReferralInput, type ProviderReferralSubmitInput } from "./referrals";
import { getShopPackage, isPlatformShopPackage } from "./credit-packages";
import {
  computeCheckoutTotal,
  computePlatformCheckoutTotal,
  MAX_CREDIT_DEBT,
} from "./credit-debt";
import {
  buildInitialNegotiation,
  enrichOffer,
  getCurrentOfferPrice,
  parseNegotiation,
  ProviderQuoteLocationFilter,
  providerCanBidOnQuote,
  providerCanSeeQuote,
  quoteIsOpenForOffers,
  resolveCanonicalCityName,
  toPublicQuoteListItem,
} from "./offer-utils";
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
import {
  LAUNCH_CAMPAIGN,
  buildLaunchCampaignStats,
  isProviderSignupBonusActive,
  isProviderSignupBonusEligible,
} from "./campaigns";
import {
  invoiceReferenceType,
  providerStatus,
  purchaseStatus,
  quoteStatus,
  quoteStatusLegacyWrite,
  toCertificate,
  toCertificateBlock,
  toCustomer,
  toInvoice,
  toPortfolioItem,
  toProvider,
  toProviderOfTheMonth,
  toPurchase,
  toQuoteRequest,
  toTaxDeclaration,
} from "./db/mappers";
import { services } from "@/lib/data/services";
import type { CustomerQuotesListFilter } from "./customer-quotes-filter";
import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";
import { MAX_PORTFOLIO_ITEMS } from "./portfolio-upload";
import { PROVIDER_PHONE_EXISTS } from "./provider-registration";
import { normalizeProviderPhone, phonesEqual } from "./phone-utils";
import { computeUrgentDeadline, isUrgentActive } from "./urgent";
import { getCommissionRate } from "./admin-auth";
import { generateId } from "./id";
import {
  canCustomerInitiateProviderCall,
} from "./negotiation-access";
import {
  attachReviewsToCustomerOffers,
  canCustomerReviewOffer,
  reviewerLabelFromCustomerName,
  validateProviderOfferReviewInput,
  type ProviderOfferReviewInput,
} from "./provider-offer-reviews";
import { classifyCustomerQuoteTab } from "./negotiation-tabs";
import type { CustomerQuoteTab } from "./customer-quotes-filter";

const providerInclude = {
  portfolio: { orderBy: { createdAt: "desc" as const } },
  platformPurchases: { orderBy: { purchasedAt: "desc" as const } },
};

function customerKeyFromPhone(phone: string, name: string, email: string): string {
  const normalized = phone.replace(/\D/g, "");
  return normalized || `${name}-${email}`.toLowerCase();
}

function customerKey(quote: QuoteRequest): string {
  return customerKeyFromPhone(quote.phone, quote.name, quote.email);
}

type OfferRow = {
  id: string;
  quoteRequestId: string;
  providerId: string;
  price: number;
  message: string;
  estimatedDays: number | null;
  status: string;
  createdAt: Date;
  negotiation?: unknown;
  customerAgreedAt?: Date | null;
  providerAgreedAt?: Date | null;
  customerInitiatedContactAt?: Date | null;
};

function mapOfferFromRow(
  row: OfferRow,
  provider?: Pick<ProviderRegistration, "name" | "city" | "phone">
): ProviderOffer {
  return enrichOffer(
    {
      id: row.id,
      quoteRequestId: row.quoteRequestId,
      providerId: row.providerId,
      price: row.price,
      message: row.message,
      estimatedDays: row.estimatedDays ?? undefined,
      status: row.status as ProviderOffer["status"],
      createdAt: row.createdAt.toISOString(),
      negotiation: parseNegotiation(row.negotiation),
      customerAgreedAt: row.customerAgreedAt?.toISOString(),
      providerAgreedAt: row.providerAgreedAt?.toISOString(),
      customerInitiatedContactAt: row.customerInitiatedContactAt?.toISOString(),
      providerPhone:
        row.customerInitiatedContactAt && provider?.phone ? provider.phone : undefined,
    },
    provider
  );
}

async function countProviderLaunchSlots(): Promise<number> {
  return prisma.provider.count({ where: { launchMemberNumber: { not: null } } });
}

async function countCustomerLaunchSlots(): Promise<number> {
  return prisma.quoteRequest.count({ where: { launchMemberNumber: { not: null } } });
}

async function assignProviderLaunchSlot(providerId: string): Promise<number | undefined> {
  if (!isProviderSignupBonusActive()) return undefined;
  const claimed = await countProviderLaunchSlots();
  const launchMemberNumber = claimed + 1;
  await prisma.provider.update({
    where: { id: providerId },
    data: { launchMemberNumber },
  });
  return launchMemberNumber;
}

async function assignCustomerLaunchSlot(quoteId: string): Promise<void> {
  const claimed = await countCustomerLaunchSlots();
  if (claimed >= LAUNCH_CAMPAIGN.customer.maxSlots) return;
  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: {
      launchMemberNumber: claimed + 1,
      priorityListing: true,
    },
  });
}

async function grantProviderLaunchBonus(providerId: string): Promise<void> {
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (
    !provider ||
    provider.launchBonusGranted ||
    provider.status !== "approved" ||
    !isProviderSignupBonusEligible(provider.createdAt)
  ) {
    return;
  }
  await prisma.provider.update({
    where: { id: providerId },
    data: {
      creditBalance: provider.creditBalance + LAUNCH_CAMPAIGN.provider.freeCredits,
      launchBonusGranted: true,
    },
  });
}

export async function getLaunchCampaignStats() {
  const [providerSlots, customerSlots] = await Promise.all([
    countProviderLaunchSlots(),
    countCustomerLaunchSlots(),
  ]);
  return buildLaunchCampaignStats(providerSlots, customerSlots);
}

export async function createQuoteRequest(
  data: Omit<QuoteRequest, "id" | "createdAt" | "status">
): Promise<QuoteRequest> {
  const id = generateId();
  const createdAt = new Date();
  const phone = normalizeProviderPhone(data.phone);
  const row = await prisma.quoteRequest.create({
    data: {
      id,
      serviceSlug: data.serviceSlug,
      serviceName: data.serviceName,
      categoryName: data.categoryName,
      answers: data.answers,
      city: data.city,
      district: data.district,
      name: data.name,
      phone,
      email: data.email,
      notes: data.notes,
      createdAt,
      status: "awaiting_review",
      urgent: data.urgent ?? false,
      urgentDeadline:
        data.urgent ?? false ? computeUrgentDeadline(createdAt) : undefined,
    },
  });
  await assignCustomerLaunchSlot(id);
  const updated = await prisma.quoteRequest.findUniqueOrThrow({ where: { id } });
  return toQuoteRequest(updated);
}

export async function getUrgentQuoteRequests(): Promise<QuoteRequest[]> {
  const rows = await prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" } });
  return rows
    .map(toQuoteRequest)
    .filter((quote) => isUrgentActive(quote))
    .sort((a, b) => {
      const deadlineA = a.urgentDeadline ? new Date(a.urgentDeadline).getTime() : Infinity;
      const deadlineB = b.urgentDeadline ? new Date(b.urgentDeadline).getTime() : Infinity;
      return deadlineA - deadlineB;
    });
}

export async function createProviderRegistration(
  data: Omit<ProviderRegistration, "id" | "createdAt" | "status"> & { pinHash: string }
): Promise<ProviderRegistration> {
  const phone = normalizeProviderPhone(data.phone);
  const existing = await findProviderByPhone(phone);
  if (existing) {
    const err = new Error(PROVIDER_PHONE_EXISTS) as Error & { providerStatus?: string };
    err.providerStatus = existing.provider.status;
    throw err;
  }

  const id = generateId();
  await prisma.provider.create({
    data: {
      id,
      name: data.name,
      companyName: data.companyName?.trim() || null,
      phone,
      email: data.email,
      city: data.city,
      categorySlugs: data.categorySlugs,
      experience: data.experience,
      bio: data.bio,
      createdAt: new Date(),
      status: "pending",
      creditBalance: 0,
      pinHash: data.pinHash,
    },
  });
  await assignProviderLaunchSlot(id);
  await linkReferralOnProviderRegistration(id, data.phone);
  const row = await prisma.provider.findUniqueOrThrow({
    where: { id },
    include: providerInclude,
  });
  return toProvider(row);
}

export async function getQuoteRequestById(id: string): Promise<QuoteRequest | undefined> {
  const row = await prisma.quoteRequest.findUnique({ where: { id } });
  return row ? toQuoteRequest(row) : undefined;
}

export async function countQuoteRequestsByPhone(phone: string): Promise<number> {
  const normalized = normalizeProviderPhone(phone);
  return prisma.quoteRequest.count({ where: { phone: normalized } });
}

function buildCustomerQuotesWhere(
  phone: string,
  filter?: CustomerQuotesListFilter
): Prisma.QuoteRequestWhereInput {
  const normalized = normalizeProviderPhone(phone);
  const search = filter?.search?.trim();

  const tabClause: Prisma.QuoteRequestWhereInput | null =
    filter?.tab === "waiting"
      ? {
          status: { in: ["open", "awaiting_review"] },
          offers: { none: {} },
        }
      : filter?.tab === "finished"
        ? {
            status: { in: ["accepted", "completed", "cancelled"] },
          }
        : filter?.tab === "offers" || filter?.tab === "negotiating"
          ? {
              status: { in: ["open", "awaiting_review"] },
              offers: { some: {} },
            }
          : null;

  if (search && tabClause) {
    return {
      phone: normalized,
      serviceName: { contains: search, mode: "insensitive" as const },
      AND: [tabClause],
    };
  }

  if (search) {
    return {
      phone: normalized,
      serviceName: { contains: search, mode: "insensitive" as const },
    };
  }

  if (tabClause) {
    return { phone: normalized, ...tabClause };
  }

  return { phone: normalized };
}

async function listCustomerQuoteItemsForTabs(phone: string, search?: string) {
  const normalized = normalizeProviderPhone(phone);
  const where: Prisma.QuoteRequestWhereInput = { phone: normalized };
  if (search) {
    where.serviceName = { contains: search, mode: "insensitive" };
  }
  const rows = await prisma.quoteRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { offers: true },
  });
  if (rows.length === 0) return [];

  const providerIds = [...new Set(rows.flatMap((r) => r.offers.map((o) => o.providerId)))];
  const providers =
    providerIds.length > 0
      ? await prisma.provider.findMany({ where: { id: { in: providerIds } } })
      : [];
  const providerMap = new Map(providers.map((p) => [p.id, toProvider(p)]));

  return rows.map((row) => ({
    quote: toQuoteRequest(row),
    offers: row.offers.map((o) => mapOfferFromRow(o, providerMap.get(o.providerId))),
    tab: classifyCustomerQuoteTab(
      { status: row.status },
      row.offers.map((o) => mapOfferFromRow(o, providerMap.get(o.providerId)))
    ),
  }));
}

function filterCustomerItemsByTab(
  items: Awaited<ReturnType<typeof listCustomerQuoteItemsForTabs>>,
  tab?: CustomerQuoteTab
) {
  if (!tab) return items;
  return items.filter((item) => item.tab === tab);
}

export async function countCustomerQuotesByPhone(
  phone: string,
  filter?: CustomerQuotesListFilter
): Promise<number> {
  if (filter?.tab === "offers" || filter?.tab === "negotiating") {
    const items = filterCustomerItemsByTab(
      await listCustomerQuoteItemsForTabs(phone, filter.search),
      filter.tab
    );
    return items.length;
  }
  return prisma.quoteRequest.count({ where: buildCustomerQuotesWhere(phone, filter) });
}

export async function getCustomerQuoteTabCounts(phone: string): Promise<{
  waiting: number;
  offers: number;
  negotiating: number;
  finished: number;
  total: number;
}> {
  const items = await listCustomerQuoteItemsForTabs(phone);
  let waiting = 0;
  let offers = 0;
  let negotiating = 0;
  let finished = 0;
  for (const item of items) {
    if (item.tab === "waiting") waiting++;
    else if (item.tab === "offers") offers++;
    else if (item.tab === "negotiating") negotiating++;
    else finished++;
  }
  return { total: items.length, waiting, offers, negotiating, finished };
}

export async function getQuoteRequestsByPhone(
  phone: string,
  options?: CustomerQuotesListFilter
): Promise<QuoteRequest[]> {
  if (options?.tab === "offers" || options?.tab === "negotiating") {
    const items = filterCustomerItemsByTab(
      await listCustomerQuoteItemsForTabs(phone, options.search),
      options.tab
    );
    const offset = options.offset ?? 0;
    const slice =
      options.limit !== undefined
        ? items.slice(offset, offset + options.limit)
        : items.slice(offset);
    return slice.map((item) => item.quote);
  }

  const rows = await prisma.quoteRequest.findMany({
    where: buildCustomerQuotesWhere(phone, options),
    orderBy: { createdAt: "desc" },
    ...(options?.limit !== undefined
      ? { take: options.limit, skip: options.offset ?? 0 }
      : {}),
  });
  return rows.map(toQuoteRequest);
}

export async function getAllQuoteRequests(): Promise<QuoteRequest[]> {
  const rows = await prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toQuoteRequest);
}

export async function getAllProviders(): Promise<ProviderRegistration[]> {
  const rows = await prisma.provider.findMany({
    include: providerInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProvider);
}

export async function getProviderById(id: string): Promise<ProviderRegistration | undefined> {
  const row = await prisma.provider.findUnique({ where: { id }, include: providerInclude });
  return row ? toProvider(row) : undefined;
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
  const existing = await prisma.quoteRequest.findUnique({ where: { id } });
  if (!existing) return null;

  const data: Record<string, unknown> = { status: quoteStatus(status) };

  if (status === "accepted") {
    data.matchedProviderId = options?.matchedProviderId;
    data.matchedProviderName = options?.matchedProviderName;
  }

  if (status === "open" || status === "cancelled" || status === "awaiting_review") {
    data.matchedProviderId = null;
    data.matchedProviderName = null;
  }

  if (status === "completed" && options?.jobValue && options.jobValue > 0) {
    const rate = getCommissionRate();
    data.jobValue = options.jobValue;
    data.commissionRate = rate;
    data.commissionAmount = Math.round(options.jobValue * rate);
    data.completedAt = new Date();
  }

  if (status !== "completed") {
    data.jobValue = null;
    data.commissionRate = null;
    data.commissionAmount = null;
    data.completedAt = null;
  }

  try {
    const row = await prisma.quoteRequest.update({ where: { id }, data });
    return toQuoteRequest(row);
  } catch {
    const legacyStatus = quoteStatusLegacyWrite(status);
    await prisma.$executeRawUnsafe(
      `UPDATE quote_requests SET status = $1::"QuoteStatus" WHERE id = $2`,
      legacyStatus,
      id
    );
    if (status === "accepted") {
      await prisma.$executeRawUnsafe(
        `UPDATE quote_requests SET matched_provider_id = $1, matched_provider_name = $2 WHERE id = $3`,
        options?.matchedProviderId ?? null,
        options?.matchedProviderName ?? null,
        id
      );
    }
    if (status === "open" || status === "cancelled" || status === "awaiting_review") {
      await prisma.$executeRawUnsafe(
        `UPDATE quote_requests SET matched_provider_id = NULL, matched_provider_name = NULL WHERE id = $1`,
        id
      );
    }
    const row = await prisma.quoteRequest.findUnique({ where: { id } });
    return row ? toQuoteRequest(row) : null;
  }
}

export async function updateProviderStatus(
  id: string,
  status: "approved" | "rejected",
  rejectionReason?: string
): Promise<ProviderRegistration | null> {
  const existing = await prisma.provider.findUnique({ where: { id } });
  if (!existing) return null;

  const row = await prisma.provider.update({
    where: { id },
    data: {
      status,
      reviewedAt: new Date(),
      rejectionReason: status === "rejected" ? (rejectionReason ?? "") : null,
    },
    include: providerInclude,
  });

  if (status === "approved") {
    await grantProviderLaunchBonus(id);
    const refreshed = await prisma.provider.findUniqueOrThrow({
      where: { id },
      include: providerInclude,
    });
    return toProvider(refreshed);
  }

  return toProvider(row);
}

export async function updateProvider(
  id: string,
  data: Partial<
    Omit<ProviderRegistration, "id" | "createdAt" | "reviewedAt" | "rejectionReason">
  >
): Promise<ProviderRegistration | null> {
  const existing = await prisma.provider.findUnique({ where: { id } });
  if (!existing) return null;

  const row = await prisma.provider.update({
    where: { id },
    data: {
      name: data.name,
      companyName:
        data.companyName !== undefined ? data.companyName?.trim() || null : undefined,
      phone: data.phone,
      email: data.email,
      city: data.city !== undefined ? resolveCanonicalCityName(data.city) : undefined,
      district: data.district !== undefined ? data.district?.trim() || null : undefined,
      categorySlugs: data.categorySlugs,
      experience: data.experience,
      bio: data.bio,
      status: data.status ? providerStatus(data.status) : undefined,
      creditBalance: data.creditBalance,
      launchMemberNumber: data.launchMemberNumber,
      launchBonusGranted: data.launchBonusGranted,
    },
    include: providerInclude,
  });
  return toProvider(row);
}

export type AdminGiftCreditGrantResult = {
  granted: Array<{
    id: string;
    name: string;
    previousBalance: number;
    newBalance: number;
  }>;
  failed: Array<{ id: string; error: string }>;
};

export async function grantAdminGiftCreditsToProviders(input: {
  providerIds?: string[];
  allApproved?: boolean;
  credits: number;
  note?: string;
}): Promise<AdminGiftCreditGrantResult> {
  const { isValidAdminGiftCreditAmount } = await import("./admin-gift-credits");
  if (!isValidAdminGiftCreditAmount(input.credits)) {
    return { granted: [], failed: [{ id: "", error: "Geçersiz kontör miktarı." }] };
  }

  let ids = [...new Set((input.providerIds ?? []).filter(Boolean))];
  if (input.allApproved) {
    const rows = await prisma.provider.findMany({
      where: { status: "approved" },
      select: { id: true },
    });
    ids = rows.map((r) => r.id);
  }

  if (ids.length === 0) {
    return { granted: [], failed: [{ id: "", error: "En az bir usta seçin." }] };
  }

  const { appendCreditLedger } = await import("./db-credits");
  const batchId = generateId();
  const description =
    input.note?.trim() || `Admin hediye kontör (+${input.credits})`;

  const granted: AdminGiftCreditGrantResult["granted"] = [];
  const failed: AdminGiftCreditGrantResult["failed"] = [];

  for (const id of ids) {
    try {
      const row = await prisma.$transaction(async (tx) => {
        const provider = await tx.provider.findUnique({ where: { id } });
        if (!provider) return null;
        const updated = await tx.provider.update({
          where: { id },
          data: { creditBalance: { increment: input.credits } },
        });
        await appendCreditLedger(tx, {
          type: "admin_adjustment",
          creditsDelta: input.credits,
          providerId: id,
          referenceId: batchId,
          description,
        });
        return {
          id,
          name: provider.name,
          previousBalance: provider.creditBalance,
          newBalance: updated.creditBalance,
        };
      });
      if (!row) failed.push({ id, error: "Bulunamadı." });
      else granted.push(row);
    } catch {
      failed.push({ id, error: "Kontör verilemedi." });
    }
  }

  return { granted, failed };
}

export async function createProviderAdmin(
  data: Omit<ProviderRegistration, "id" | "createdAt" | "reviewedAt" | "rejectionReason">
): Promise<ProviderRegistration> {
  const phone = normalizeProviderPhone(data.phone);
  const existing = await findProviderByPhone(phone);
  if (existing) {
    const err = new Error(PROVIDER_PHONE_EXISTS) as Error & { providerStatus?: string };
    err.providerStatus = existing.provider.status;
    throw err;
  }

  const id = generateId();
  await prisma.provider.create({
    data: {
      id,
      name: data.name,
      companyName: data.companyName?.trim() || null,
      phone,
      email: data.email,
      city: data.city,
      categorySlugs: data.categorySlugs,
      experience: data.experience,
      bio: data.bio,
      createdAt: new Date(),
      status: providerStatus(data.status),
      creditBalance: data.creditBalance ?? 0,
    },
  });

  if (data.platformPurchases?.length) {
    await prisma.providerPlatformPurchase.createMany({
      data: data.platformPurchases.map((purchase) => ({
        id: purchase.id || generateId(),
        providerId: id,
        serviceSlug: purchase.serviceSlug,
        serviceName: purchase.serviceName,
        amount: purchase.amount,
        purchasedAt: new Date(purchase.purchasedAt),
        status: purchaseStatus(purchase.status),
        invoiceId: purchase.invoiceId,
      })),
    });
  }

  await assignProviderLaunchSlot(id);
  if (data.status === "approved") {
    await grantProviderLaunchBonus(id);
  }

  const row = await prisma.provider.findUniqueOrThrow({
    where: { id },
    include: providerInclude,
  });
  return toProvider(row);
}

export async function deleteProvider(id: string): Promise<boolean> {
  const existing = await prisma.provider.findUnique({ where: { id } });
  if (!existing) return false;

  await prisma.$transaction([
    prisma.quoteRequest.updateMany({
      where: { matchedProviderId: id, status: "accepted" },
      data: {
        matchedProviderId: null,
        matchedProviderName: null,
        status: "open",
      },
    }),
    prisma.quoteRequest.updateMany({
      where: {
        matchedProviderId: id,
        status: { not: "accepted" },
      },
      data: {
        matchedProviderId: null,
        matchedProviderName: null,
      },
    }),
    prisma.provider.delete({ where: { id } }),
  ]);
  return true;
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  const row = await prisma.customer.findUnique({ where: { id } });
  return row ? toCustomer(row) : undefined;
}

export async function createCustomer(
  data: Omit<Customer, "id" | "createdAt">
): Promise<Customer> {
  const row = await prisma.customer.create({
    data: {
      id: generateId(),
      ...data,
      createdAt: new Date(),
    },
  });
  return toCustomer(row);
}

async function syncQuotesForCustomer(
  oldPhone: string,
  data: Pick<Customer, "name" | "phone" | "email" | "city">
) {
  const digits = oldPhone.replace(/\D/g, "");
  const quotes = await prisma.quoteRequest.findMany();
  const matchingIds = quotes
    .filter(
      (quote) =>
        quote.phone.replace(/\D/g, "") === digits ||
        customerKeyFromPhone(quote.phone, quote.name, quote.email) ===
          customerKeyFromPhone(oldPhone, "", "")
    )
    .map((quote) => quote.id);

  if (matchingIds.length === 0) return;

  await prisma.quoteRequest.updateMany({
    where: { id: { in: matchingIds } },
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      city: data.city,
    },
  });
}

export async function updateCustomer(
  id: string,
  data: Partial<Omit<Customer, "id" | "createdAt">>
): Promise<Customer | null> {
  const current = await prisma.customer.findUnique({ where: { id } });
  if (!current) return null;

  const row = await prisma.customer.update({
    where: { id },
    data,
  });

  await syncQuotesForCustomer(current.phone, {
    name: row.name,
    phone: row.phone,
    email: row.email,
    city: row.city,
  });

  return toCustomer(row);
}

export async function updateCustomerByKey(
  key: string,
  data: Pick<Customer, "name" | "phone" | "email" | "city" | "notes">
): Promise<boolean> {
  const quotes = await prisma.quoteRequest.findMany();
  const matchingIds = quotes.filter((quote) => customerKey(toQuoteRequest(quote)) === key).map((q) => q.id);
  if (matchingIds.length === 0) return false;

  await prisma.quoteRequest.updateMany({
    where: { id: { in: matchingIds } },
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      city: data.city,
    },
  });
  return true;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const current = await prisma.customer.findUnique({ where: { id } });
  if (!current) return false;

  const digits = current.phone.replace(/\D/g, "");
  const quotes = await prisma.quoteRequest.findMany();
  const deleteIds = quotes
    .filter((quote) => quote.phone.replace(/\D/g, "") === digits)
    .map((quote) => quote.id);

  await prisma.$transaction([
    prisma.customer.delete({ where: { id } }),
    ...(deleteIds.length
      ? [prisma.quoteRequest.deleteMany({ where: { id: { in: deleteIds } } })]
      : []),
  ]);
  return true;
}

export async function deleteCustomerByKey(key: string): Promise<boolean> {
  const quotes = await prisma.quoteRequest.findMany();
  const deleteIds = quotes.filter((quote) => customerKey(toQuoteRequest(quote)) === key).map((q) => q.id);
  if (deleteIds.length === 0) return false;
  await prisma.quoteRequest.deleteMany({ where: { id: { in: deleteIds } } });
  return true;
}

async function quoteStatsForPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const quotes = (await prisma.quoteRequest.findMany()).map(toQuoteRequest).filter(
    (quote) =>
      customerKey(quote) === customerKeyFromPhone(phone, "", "") ||
      quote.phone.replace(/\D/g, "") === digits
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

export async function getCustomerSummaries(): Promise<CustomerSummary[]> {
  const [customers, quotes] = await Promise.all([
    prisma.customer.findMany(),
    prisma.quoteRequest.findMany(),
  ]);
  const map = new Map<string, CustomerSummary>();

  for (const customer of customers) {
    const key = customerKeyFromPhone(customer.phone, customer.name, customer.email);
    const stats = await quoteStatsForPhone(customer.phone);
    map.set(key, {
      id: customer.id,
      key,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      city: customer.city,
      notes: customer.notes ?? undefined,
      requestCount: stats.requestCount,
      completedJobs: stats.completedJobs,
      totalSpent: stats.totalSpent,
      platformRevenue: stats.platformRevenue,
      lastRequestAt: stats.lastRequestAt || customer.createdAt.toISOString(),
    });
  }

  for (const row of quotes) {
    const quote = toQuoteRequest(row);
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
  const [providers, quotes, certificates] = await Promise.all([
    prisma.provider.findMany({ include: providerInclude, orderBy: { createdAt: "desc" } }),
    prisma.quoteRequest.findMany(),
    prisma.providerCertificate.findMany(),
  ]);

  return providers.map((providerRow) => {
    const provider = toProvider(providerRow);
    const relatedQuotes = quotes
      .filter((quote) => quote.matchedProviderId === provider.id)
      .map(toQuoteRequest);
    const completedQuotes = relatedQuotes.filter((quote) => quote.status === "completed");
    const activeQuotes = relatedQuotes.filter((quote) => quote.status === "accepted");
    const platformPurchases = provider.platformPurchases ?? [];
    const providerCerts = certificates.filter((cert) => cert.providerId === provider.id);

    return {
      ...provider,
      platformPurchases,
      completedJobs: completedQuotes.length,
      activeJobs: activeQuotes.length,
      totalJobEarnings: completedQuotes.reduce((sum, quote) => sum + (quote.jobValue ?? 0), 0),
      platformSpend: platformPurchases
        .filter((purchase) => purchase.status === "active")
        .reduce((sum, purchase) => sum + purchase.amount, 0),
      certificateCount: providerCerts.length,
      isMasterCraftsman: providerCerts.some((cert) => cert.type === "master_craftsman"),
    };
  });
}

export async function addProviderPlatformPurchase(
  providerId: string,
  data: Omit<ProviderPlatformPurchase, "id" | "purchasedAt">
): Promise<ProviderRegistration | null> {
  const existing = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!existing) return null;

  await prisma.providerPlatformPurchase.create({
    data: {
      id: generateId(),
      providerId,
      serviceSlug: data.serviceSlug,
      serviceName: data.serviceName,
      amount: data.amount,
      purchasedAt: new Date(),
      status: purchaseStatus(data.status),
      invoiceId: data.invoiceId,
    },
  });

  const row = await prisma.provider.findUniqueOrThrow({
    where: { id: providerId },
    include: providerInclude,
  });
  return toProvider(row);
}

export async function getApprovedProviders(): Promise<ProviderRegistration[]> {
  const rows = await prisma.provider.findMany({
    where: { status: "approved" },
    include: providerInclude,
  });
  return rows.map(toProvider);
}

export async function findProviderByPhone(
  phone: string
): Promise<{ provider: ProviderRegistration; pinHash: string | null } | undefined> {
  const normalized = normalizeProviderPhone(phone);
  if (!/^05\d{9}$/.test(normalized)) return undefined;

  const rows = await prisma.provider.findMany({ include: providerInclude });
  const row = rows.find((provider) => normalizeProviderPhone(provider.phone) === normalized);
  if (!row) return undefined;

  return {
    provider: toProvider(row),
    pinHash: row.pinHash,
  };
}

export async function findApprovedProviderByPhone(
  phone: string
): Promise<ProviderRegistration | undefined> {
  const auth = await getApprovedProviderAuthByPhone(phone);
  return auth?.provider;
}

export async function getApprovedProviderAuthByPhone(
  phone: string
): Promise<{ provider: ProviderRegistration; pinHash: string | null } | undefined> {
  const normalized = normalizeProviderPhone(phone);
  if (!/^05\d{9}$/.test(normalized)) return undefined;

  const rows = await prisma.provider.findMany({
    where: { status: "approved" },
    include: providerInclude,
  });

  const row = rows.find((provider) => normalizeProviderPhone(provider.phone) === normalized);
  if (!row) return undefined;

  return {
    provider: toProvider(row),
    pinHash: row.pinHash,
  };
}

export async function setProviderPinIfUnset(providerId: string, pinHash: string): Promise<boolean> {
  const row = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!row || row.status !== "approved" || row.pinHash) return false;

  await prisma.provider.update({
    where: { id: providerId },
    data: { pinHash },
  });
  return true;
}

export async function addProviderPortfolioItem(
  providerId: string,
  data: Omit<ProviderPortfolioItem, "id" | "createdAt">
): Promise<ProviderPortfolioItem> {
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider) throw new Error("Usta bulunamadı.");
  if (provider.status !== "approved") {
    throw new Error("Sadece onaylı ustalar portfolyo ekleyebilir.");
  }

  const count = await prisma.providerPortfolioItem.count({ where: { providerId } });
  if (count >= MAX_PORTFOLIO_ITEMS) {
    throw new Error(`En fazla ${MAX_PORTFOLIO_ITEMS} proje ekleyebilirsiniz.`);
  }

  const row = await prisma.providerPortfolioItem.create({
    data: {
      id: generateId(),
      providerId,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      serviceSlug: data.serviceSlug,
      createdAt: new Date(),
    },
  });
  return toPortfolioItem(row);
}

export async function removeProviderPortfolioItem(
  providerId: string,
  itemId: string
): Promise<boolean> {
  const item = await prisma.providerPortfolioItem.findFirst({
    where: { id: itemId, providerId },
  });
  if (!item) return false;
  await prisma.providerPortfolioItem.delete({ where: { id: itemId } });
  return true;
}

async function flattenPortfolio(): Promise<PortfolioWithProvider[]> {
  const rows = await prisma.providerPortfolioItem.findMany({
    include: { provider: true },
    orderBy: { createdAt: "desc" },
  });

  return rows
    .filter((item) => item.provider.status === "approved")
    .map((item) => ({
      ...toPortfolioItem(item),
      providerId: item.providerId,
      providerName: item.provider.name,
      providerCity: item.provider.city,
    }));
}

export async function getRecentPortfolioItems(limit = 8): Promise<PortfolioWithProvider[]> {
  return (await flattenPortfolio()).slice(0, limit);
}

export async function getPortfolioByService(
  serviceSlug: string,
  limit = 4
): Promise<PortfolioWithProvider[]> {
  return (await flattenPortfolio())
    .filter((item) => item.serviceSlug === serviceSlug)
    .slice(0, limit);
}

export async function getPublicProviderProfile(id: string) {
  const provider = await getProviderById(id);
  if (!provider || provider.status !== "approved") return null;
  return provider;
}

async function nextInvoiceSequence(period: string): Promise<number> {
  const count = await prisma.invoice.count({ where: { period } });
  return count + 1;
}

async function hasInvoice(
  referenceType: Invoice["referenceType"],
  referenceId: string
): Promise<boolean> {
  const count = await prisma.invoice.count({
    where: {
      referenceType: invoiceReferenceType(referenceType),
      referenceId,
    },
  });
  return count > 0;
}

export async function getAllInvoices(): Promise<Invoice[]> {
  const rows = await prisma.invoice.findMany({ orderBy: { issuedAt: "desc" } });
  return rows.map(toInvoice);
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  const row = await prisma.invoice.findUnique({ where: { id } });
  return row ? toInvoice(row) : undefined;
}

export async function getTaxDeclarationById(
  id: string
): Promise<TaxDeclaration | undefined> {
  const row = await prisma.taxDeclaration.findUnique({ where: { id } });
  return row ? toTaxDeclaration(row) : undefined;
}

export async function getBillableItems(): Promise<BillableItem[]> {
  const [quotes, providers, invoices] = await Promise.all([
    prisma.quoteRequest.findMany(),
    prisma.provider.findMany({ include: { platformPurchases: true } }),
    prisma.invoice.findMany(),
  ]);

  const invoiceKeys = new Set(
    invoices.map((inv) => `${inv.referenceType}:${inv.referenceId}`)
  );
  const items: BillableItem[] = [];

  for (const row of quotes) {
    const quote = toQuoteRequest(row);
    if (quote.status !== "completed" || !quote.commissionAmount) continue;
    if (quote.invoiceId || invoiceKeys.has(`quote:${quote.id}`)) continue;

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

  for (const providerRow of providers) {
    const provider = toProvider(providerRow);
    for (const purchase of provider.platformPurchases ?? []) {
      if (purchase.status !== "active") continue;
      if (purchase.invoiceId || invoiceKeys.has(`platform_purchase:${purchase.id}`)) continue;

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
  const quoteRow = await prisma.quoteRequest.findUnique({ where: { id: quoteId } });
  if (!quoteRow) return null;
  const quote = toQuoteRequest(quoteRow);
  if (quote.status !== "completed" || !quote.commissionAmount) return null;
  if (quote.invoiceId || (await hasInvoice("quote", quote.id))) return null;

  const issuedAt = new Date();
  const period = formatPeriod(issuedAt);
  const vatRate = getVatRate();
  const amounts = calculateVat(quote.commissionAmount, vatRate);
  const provider = quote.matchedProviderId
    ? await prisma.provider.findUnique({ where: { id: quote.matchedProviderId } })
    : null;

  const invoiceId = generateId();
  const invoiceNo = generateInvoiceNo(period, await nextInvoiceSequence(period));

  await prisma.$transaction([
    prisma.invoice.create({
      data: {
        id: invoiceId,
        invoiceNo,
        referenceType: "quote",
        referenceId: quote.id,
        recipientName: quote.matchedProviderName ?? quote.name,
        recipientEmail: provider?.email,
        recipientPhone: provider?.phone ?? quote.phone,
        description: `${quote.serviceName} — platform komisyon bedeli (İş No: ${quote.id})`,
        subtotal: amounts.subtotal,
        vatRate: amounts.vatRate,
        vatAmount: amounts.vatAmount,
        total: amounts.total,
        period,
        issuedAt,
      },
    }),
    prisma.quoteRequest.update({
      where: { id: quoteId },
      data: { invoiceId },
    }),
  ]);

  const row = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  return toInvoice(row);
}

export async function createInvoiceForPurchase(
  providerId: string,
  purchaseId: string
): Promise<Invoice | null> {
  const providerRow = await prisma.provider.findUnique({
    where: { id: providerId },
    include: { platformPurchases: true },
  });
  if (!providerRow) return null;

  const provider = toProvider(providerRow);
  const purchase = provider.platformPurchases?.find((item) => item.id === purchaseId);
  if (!purchase || purchase.status !== "active") return null;
  if (purchase.invoiceId || (await hasInvoice("platform-purchase", purchase.id))) return null;

  const issuedAt = new Date();
  const period = formatPeriod(issuedAt);
  const vatRate = getVatRate();
  const amounts = calculateVat(purchase.amount, vatRate);
  const invoiceId = generateId();
  const invoiceNo = generateInvoiceNo(period, await nextInvoiceSequence(period));

  await prisma.$transaction([
    prisma.invoice.create({
      data: {
        id: invoiceId,
        invoiceNo,
        referenceType: "platform_purchase",
        referenceId: purchase.id,
        recipientName: provider.name,
        recipientEmail: provider.email,
        recipientPhone: provider.phone,
        description: `${purchase.serviceName} — platform hizmet bedeli`,
        subtotal: amounts.subtotal,
        vatRate: amounts.vatRate,
        vatAmount: amounts.vatAmount,
        total: amounts.total,
        period,
        issuedAt,
      },
    }),
    prisma.providerPlatformPurchase.update({
      where: { id: purchaseId },
      data: { invoiceId },
    }),
  ]);

  const row = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  return toInvoice(row);
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
  const targetPeriod = period ?? formatPeriod(new Date());

  const existing = await prisma.taxDeclaration.findUnique({ where: { period: targetPeriod } });
  if (existing) return toTaxDeclaration(existing);

  const periodInvoices = await prisma.invoice.findMany({ where: { period: targetPeriod } });
  if (periodInvoices.length === 0) return null;

  const taxableBase = periodInvoices.reduce((sum, invoice) => sum + invoice.subtotal, 0);
  const calculatedVat = periodInvoices.reduce((sum, invoice) => sum + invoice.vatAmount, 0);
  const totalAmount = periodInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

  const row = await prisma.taxDeclaration.create({
    data: {
      id: generateId(),
      period: targetPeriod,
      periodLabel: formatPeriodLabel(targetPeriod),
      invoiceCount: periodInvoices.length,
      taxableBase: Math.round(taxableBase * 100) / 100,
      calculatedVat: Math.round(calculatedVat * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      createdAt: new Date(),
    },
  });
  return toTaxDeclaration(row);
}

export async function getBillingOverview() {
  const [invoices, billable, declarations] = await Promise.all([
    getAllInvoices(),
    getBillableItems(),
    prisma.taxDeclaration.findMany({ orderBy: { createdAt: "desc" } }),
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
    latestDeclaration: declarations[0] ? toTaxDeclaration(declarations[0]) : null,
  };
}

export async function getStats() {
  const [approvedProviders, completedJobs, pendingRequests] = await Promise.all([
    prisma.provider.count({ where: { status: "approved" } }),
    prisma.quoteRequest.count({ where: { status: "completed" } }),
    prisma.quoteRequest.count({ where: { status: "open" } }),
  ]);

  return {
    providers: approvedProviders + 12000,
    jobs: completedJobs + 850000,
    avgRating: 4.8,
    pendingRequests,
  };
}

export async function getAdminStats() {
  const commissionRate = getCommissionRate();
  const quotes = (await prisma.quoteRequest.findMany()).map(toQuoteRequest);
  const providers = await prisma.provider.findMany();

  const openQuotes = quotes.filter((r) => r.status === "open");
  const awaitingReviewQuotes = quotes.filter((r) => r.status === "awaiting_review");
  const matchedQuotes = quotes.filter((r) => r.status === "accepted");
  const completedQuotes = quotes.filter((r) => r.status === "completed");

  const pendingProviders = providers.filter((p) => p.status === "pending");
  const approvedProviders = providers.filter((p) => p.status === "approved");
  const rejectedProviders = providers.filter((p) => p.status === "rejected");

  const totalRevenue = completedQuotes.reduce((sum, q) => sum + (q.commissionAmount ?? 0), 0);
  const totalJobVolume = completedQuotes.reduce((sum, q) => sum + (q.jobValue ?? 0), 0);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyRevenue = completedQuotes
    .filter((q) => q.completedAt && new Date(q.completedAt) >= thisMonth)
    .reduce((sum, q) => sum + (q.commissionAmount ?? 0), 0);

  return {
    commissionRate,
    openQuotes: openQuotes.length,
    awaitingReviewQuotes: awaitingReviewQuotes.length,
    matchedQuotes: matchedQuotes.length,
    pendingQuotes: openQuotes.length,
    completedQuotes: completedQuotes.length,
    pendingProviders: pendingProviders.length,
    approvedProviders: approvedProviders.length,
    rejectedProviders: rejectedProviders.length,
    totalRevenue,
    totalJobVolume,
    monthlyRevenue,
  };
}

async function appendCertificateBlock(
  certificateId: string,
  payload: Record<string, unknown>
) {
  const lastBlock = await prisma.certificateBlock.findFirst({
    orderBy: { index: "desc" },
  });
  const index = lastBlock ? lastBlock.index + 1 : 0;
  const previousHash = lastBlock ? lastBlock.hash : GENESIS_HASH;
  const timestamp = new Date();
  const data = buildCertificatePayload(payload);
  const hash = computeBlockHash(
    index,
    timestamp.toISOString(),
    certificateId,
    data,
    previousHash
  );

  return prisma.certificateBlock.create({
    data: {
      index,
      timestamp,
      certificateId,
      data,
      previousHash,
      hash,
    },
  });
}

export async function getAllCertificates(): Promise<ProviderCertificate[]> {
  const rows = await prisma.providerCertificate.findMany({ orderBy: { issuedAt: "desc" } });
  return rows.map(toCertificate);
}

export async function getCertificateById(id: string): Promise<ProviderCertificate | undefined> {
  const row = await prisma.providerCertificate.findUnique({ where: { id } });
  return row ? toCertificate(row) : undefined;
}

export async function getProviderCertificates(providerId: string): Promise<ProviderCertificate[]> {
  const rows = await prisma.providerCertificate.findMany({
    where: { providerId },
    orderBy: { issuedAt: "desc" },
  });
  return rows.map(toCertificate);
}

export async function verifyCertificateChain(certificateId: string) {
  const certificateRow = await prisma.providerCertificate.findUnique({
    where: { id: certificateId },
  });
  if (!certificateRow) {
    return { valid: false, certificate: null as ProviderCertificate | null };
  }
  const certificate = toCertificate(certificateRow);

  const blockRow = await prisma.certificateBlock.findFirst({
    where: { certificateId },
  });
  if (!blockRow) {
    return { valid: false, certificate };
  }

  const chainRows = await prisma.certificateBlock.findMany({
    where: { index: { lte: blockRow.index } },
    orderBy: { index: "asc" },
  });
  const chain = chainRows.map(toCertificateBlock);
  const chainCheck = verifyBlockChain(chain);
  const block = toCertificateBlock(blockRow);

  return {
    valid: chainCheck.valid && block.hash === certificate.blockHash,
    certificate,
    block,
    chainLength: await prisma.certificateBlock.count(),
    brokenAt: chainCheck.brokenAt,
  };
}

export async function issueProviderCertificate(
  providerId: string,
  type: CertificateType,
  options?: { period?: string; reason?: string }
): Promise<ProviderCertificate> {
  const providerRow = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!providerRow) throw new Error("Usta bulunamadı.");
  if (providerRow.status !== "approved") {
    throw new Error("Sadece onaylı ustalara sertifika verilebilir.");
  }

  const summaries = await getProviderSummaries();
  const summary = summaries.find((item) => item.id === providerId);

  if (type === "master_craftsman") {
    const existing = await prisma.providerCertificate.findFirst({
      where: { providerId, type: "master_craftsman" },
    });
    if (existing) throw new Error("Bu usta zaten Çok Başarılı Usta sertifikasına sahip.");
  }

  const period = options?.period ?? (type === "provider_of_month" ? currentPeriod() : undefined);
  const certificateId = generateId();
  const issuedAt = new Date();

  const title =
    type === "master_craftsman"
      ? "Çok Başarılı Usta Sertifikası"
      : `${formatCertPeriodLabel(period!)} Ayın Ustası`;

  const description =
    type === "master_craftsman"
      ? "Çokusta platformunda üstün performans, müşteri memnuniyeti ve güvenilirlik gösteren ustalara verilen blockchain doğrulamalı sertifika."
      : options?.reason ??
        "Ay boyunca en yüksek müşteri memnuniyeti ve iş kalitesi ile öne çıkan usta.";

  const metadata = {
    completedJobs: summary?.completedJobs ?? 0,
    totalEarnings: summary?.totalJobEarnings ?? 0,
    city: providerRow.city,
    categories: providerRow.categorySlugs as string[],
  };

  const payload = {
    providerId,
    providerName: providerRow.name,
    type,
    title,
    period,
    issuedAt: issuedAt.toISOString(),
    metadata,
  };

  const block = await appendCertificateBlock(certificateId, payload);

  const row = await prisma.providerCertificate.create({
    data: {
      id: certificateId,
      providerId,
      providerName: providerRow.name,
      type,
      title,
      description,
      period,
      issuedAt,
      blockIndex: block.index,
      blockHash: block.hash,
      previousHash: block.previousHash,
      metadata,
    },
  });

  return toCertificate(row);
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

  const selectionData = {
    period,
    periodLabel: formatCertPeriodLabel(period),
    providerId: certificate.providerId,
    providerName: certificate.providerName,
    certificateId: certificate.id,
    selectedAt: new Date(),
    reason: options?.reason,
    status: "pending" as const,
    creditsAwarded: 0,
    publishedAt: null,
  };

  await prisma.providerOfTheMonth.upsert({
    where: { period },
    create: selectionData,
    update: selectionData,
  });

  const selectionRow = await prisma.providerOfTheMonth.findUniqueOrThrow({
    where: { period },
  });

  return { certificate, selection: toProviderOfTheMonth(selectionRow) };
}

export async function getPublishedProviderOfTheMonth(): Promise<
  (ProviderOfTheMonth & { certificate?: ProviderCertificate; provider?: ProviderSummary }) | null
> {
  const current = await prisma.providerOfTheMonth.findFirst({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });
  if (!current) return null;

  const selection = toProviderOfTheMonth(current);
  const certificate = await getCertificateById(selection.certificateId);
  const summaries = await getProviderSummaries();
  const provider = summaries.find((item) => item.id === selection.providerId);

  return { ...selection, certificate, provider };
}

export async function getProviderOfTheMonthByPeriod(
  period: string
): Promise<(ProviderOfTheMonth & { certificate?: ProviderCertificate }) | null> {
  const row = await prisma.providerOfTheMonth.findUnique({ where: { period } });
  if (!row) return null;
  const selection = toProviderOfTheMonth(row);
  const certificate = await getCertificateById(selection.certificateId);
  return { ...selection, certificate };
}

export async function publishProviderOfTheMonth(period: string): Promise<ProviderOfTheMonth> {
  const row = await prisma.providerOfTheMonth.findUnique({ where: { period } });
  if (!row) throw new Error("Bu dönem için seçim bulunamadı.");

  const creditsToGrant = Math.max(
    0,
    PROVIDER_OF_MONTH_CREDIT_REWARD - (row.creditsAwarded ?? 0)
  );

  await prisma.$transaction(async (tx) => {
    if (creditsToGrant > 0) {
      await tx.provider.update({
        where: { id: row.providerId },
        data: { creditBalance: { increment: creditsToGrant } },
      });
    }
    await tx.providerOfTheMonth.update({
      where: { period },
      data: {
        status: "published",
        publishedAt: new Date(),
        creditsAwarded: row.creditsAwarded + creditsToGrant,
      },
    });
  });

  const updated = await prisma.providerOfTheMonth.findUniqueOrThrow({ where: { period } });
  return toProviderOfTheMonth(updated);
}

export async function unpublishProviderOfTheMonth(period: string): Promise<ProviderOfTheMonth> {
  const row = await prisma.providerOfTheMonth.findUnique({ where: { period } });
  if (!row) throw new Error("Bu dönem için seçim bulunamadı.");

  const updated = await prisma.providerOfTheMonth.update({
    where: { period },
    data: { status: "removed" },
  });
  return toProviderOfTheMonth(updated);
}

export async function getCurrentProviderOfTheMonth(): Promise<
  (ProviderOfTheMonth & { certificate?: ProviderCertificate; provider?: ProviderSummary }) | null
> {
  const current = await prisma.providerOfTheMonth.findFirst({
    orderBy: { selectedAt: "desc" },
  });
  if (!current) return null;

  const selection = toProviderOfTheMonth(current);
  const certificate = await getCertificateById(selection.certificateId);
  const summaries = await getProviderSummaries();
  const provider = summaries.find((item) => item.id === selection.providerId);

  return { ...selection, certificate, provider };
}

export async function getProviderOfTheMonthHistory(): Promise<ProviderOfTheMonth[]> {
  const rows = await prisma.providerOfTheMonth.findMany({ orderBy: { selectedAt: "desc" } });
  return rows.map(toProviderOfTheMonth);
}

export async function getMonthlyLeaderboard(limit = 5) {
  const period = currentPeriod();
  const [year, month] = period.split("-").map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  const quotes = (await prisma.quoteRequest.findMany()).map(toQuoteRequest);
  const providers = await prisma.provider.findMany({ where: { status: "approved" } });
  const providerMap = new Map(providers.map((p) => [p.id, p]));

  const scores = new Map<
    string,
    { providerId: string; name: string; city: string; completedJobs: number; earnings: number }
  >();

  for (const quote of quotes) {
    if (quote.status !== "completed" || !quote.matchedProviderId || !quote.completedAt) continue;
    const completedAt = new Date(quote.completedAt);
    if (completedAt < monthStart || completedAt > monthEnd) continue;

    const provider = providerMap.get(quote.matchedProviderId);
    if (!provider) continue;

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

export async function getOpenQuotesForProvider(
  providerId: string,
  location: ProviderQuoteLocationFilter = { cityMode: "provider" }
) {
  const provider = await getProviderById(providerId);
  if (!provider || provider.status !== "approved") return [];

  const categorySlugs = Array.isArray(provider.categorySlugs) ? provider.categorySlugs : [];
  const allowedServiceSlugs = services
    .filter((s) => categorySlugs.includes(s.categorySlug))
    .map((s) => s.slug);
  if (allowedServiceSlugs.length === 0) return [];

  const where: {
    status: "open";
    serviceSlug: { in: string[] };
    offers: { none: { providerId: string } };
    city?: string | { equals: string; mode: "insensitive" };
    district?: string;
  } = {
    status: "open",
    serviceSlug: { in: allowedServiceSlugs },
    offers: { none: { providerId } },
  };

  if (location.cityMode === "selected" && location.selectedCity) {
    const city = resolveCanonicalCityName(location.selectedCity);
    where.city = { equals: city, mode: "insensitive" };
  } else if (location.cityMode === "provider" && provider.city) {
    const city = resolveCanonicalCityName(provider.city);
    where.city = { equals: city, mode: "insensitive" };
  }
  // İlçe eşleşmesi providerCanSeeQuote içinde (Türkçe karakter / yazım farkları için)

  const take = location.cityMode === "all" ? 200 : 500;
  const quoteRows = await prisma.quoteRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
  });

  const quotes = quoteRows
    .map(toQuoteRequest)
    .filter((quote) => providerCanSeeQuote(provider, quote, location));

  if (quotes.length === 0) return [];

  const quoteIds = quotes.map((q) => q.id);
  const pendingCounts = await prisma.providerOffer.groupBy({
    by: ["quoteRequestId"],
    where: { quoteRequestId: { in: quoteIds }, status: "pending" },
    _count: { id: true },
  });

  const countByQuote = new Map(
    pendingCounts.map((row) => [row.quoteRequestId, row._count.id])
  );

  return quotes
    .map((quote) => {
      const offerCount = countByQuote.get(quote.id) ?? 0;
      return { ...toPublicQuoteListItem(quote, offerCount) };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function activateProviderBorcKredisi(
  providerId: string
): Promise<{ creditBalance?: number; creditDebt?: number; borcKredisiAktif?: boolean; error?: string }> {
  const provider = await getProviderById(providerId);
  if (!provider || provider.status !== "approved") {
    return { error: "Usta hesabı onaylı değil." };
  }
  if (provider.borcKredisiAktif) {
    return { error: "Borç kredisi zaten aktif." };
  }
  if ((provider.creditDebt ?? 0) > 0) {
    return { error: "Önce mevcut borç kredinizi ödeyin." };
  }
  if ((provider.creditBalance ?? 0) >= 1) {
    return { error: "Kontörünüz varken borç kredisi açılamaz." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.provider.update({
      where: { id: providerId },
      data: {
        creditBalance: { increment: MAX_CREDIT_DEBT },
        creditDebt: { increment: MAX_CREDIT_DEBT },
        borcKredisiAktif: true,
      },
    });
  });

  const updated = await getProviderById(providerId);
  return {
    creditBalance: updated?.creditBalance ?? MAX_CREDIT_DEBT,
    creditDebt: updated?.creditDebt ?? MAX_CREDIT_DEBT,
    borcKredisiAktif: true,
  };
}

export async function submitProviderOffer(
  providerId: string,
  quoteRequestId: string,
  price: number,
  message: string,
  estimatedDays?: number
): Promise<{ offer?: ProviderOffer; error?: string; code?: "INSUFFICIENT_CREDITS"; usedDebt?: boolean; creditDebt?: number }> {
  const provider = await getProviderById(providerId);
  const quoteRow = await prisma.quoteRequest.findUnique({ where: { id: quoteRequestId } });
  const quote = quoteRow ? toQuoteRequest(quoteRow) : undefined;

  if (!provider || provider.status !== "approved") {
    return { error: "Usta hesabı onaylı değil." };
  }
  if (!quote || !quoteIsOpenForOffers(quote)) {
    return { error: "Talep teklif almaya kapalı." };
  }
  if (!providerCanBidOnQuote(provider, quote)) {
    return { error: "Bu talep kategori uygun değil." };
  }

  const balance = provider.creditBalance ?? 0;
  const debt = provider.creditDebt ?? 0;
  const borcAktif = provider.borcKredisiAktif ?? false;
  const useBalance = balance >= 1;
  const useDebt = !useBalance && borcAktif && debt < MAX_CREDIT_DEBT;

  if (!useBalance && !useDebt) {
    return { error: "Yetersiz teklif kontörü.", code: "INSUFFICIENT_CREDITS" as const };
  }
  if (price <= 0 || message.trim().length < 5) {
    return { error: "Geçerli fiyat ve en az 5 karakterlik mesaj girin." };
  }

  const existing = await prisma.providerOffer.findUnique({
    where: { quoteRequestId_providerId: { quoteRequestId, providerId } },
  });
  if (existing) return { error: "Bu talebe zaten teklif verdiniz." };

  const pendingAgreement = await prisma.providerOffer.findFirst({
    where: {
      providerId,
      status: "pending",
      customerAgreedAt: { not: null },
      providerAgreedAt: null,
    },
  });
  if (pendingAgreement) {
    return { error: "Bekleyen müşteri anlaşması var. Yeni teklif veremezsiniz." };
  }

  const id = generateId();
  const createdAt = new Date();
  const newDebt = useDebt ? debt + 1 : debt;

  await prisma.$transaction(async (tx) => {
    await tx.provider.update({
      where: { id: providerId },
      data: useBalance ? { creditBalance: { decrement: 1 } } : { creditDebt: { increment: 1 } },
    });
    await tx.providerOffer.create({
      data: {
        id,
        quoteRequestId,
        providerId,
        price: Math.round(price),
        message: message.trim(),
        estimatedDays: estimatedDays ?? null,
        createdAt,
        status: "pending",
        negotiation: buildInitialNegotiation(price, message),
      },
    });
    const { appendCreditLedger } = await import("./db-credits");
    await appendCreditLedger(tx, {
      type: useBalance ? "provider_offer_spend" : "provider_offer_debt",
      creditsDelta: useBalance ? -1 : 0,
      providerId,
      quoteRequestId,
      referenceId: id,
      description: useBalance
        ? "Teklif verme — kontör kullanımı"
        : "Teklif verme — borç kredisi",
      createdAt,
    });
  });

  return {
    offer: mapOfferFromRow(
      {
        id,
        quoteRequestId,
        providerId,
        price: Math.round(price),
        message: message.trim(),
        estimatedDays: estimatedDays ?? null,
        status: "pending",
        createdAt,
        negotiation: buildInitialNegotiation(price, message),
      },
      provider
    ),
    usedDebt: useDebt,
    creditDebt: newDebt,
  };
}

export async function getOffersForQuoteRequest(quoteId: string): Promise<ProviderOffer[]> {
  const quoteRow = await prisma.quoteRequest.findUnique({ where: { id: quoteId } });
  if (!quoteRow) return [];
  const quote = toQuoteRequest(quoteRow);

  const rows = await prisma.providerOffer.findMany({
    where: { quoteRequestId: quoteId, status: { in: ["pending", "accepted", "rejected"] } },
    orderBy: { price: "asc" },
  });
  const providers = await prisma.provider.findMany({
    where: { id: { in: rows.map((r) => r.providerId) } },
  });
  const providerMap = new Map(providers.map((p) => [p.id, toProvider(p)]));

  const offers = rows.map((row) => mapOfferFromRow(row, providerMap.get(row.providerId)));
  return enrichCustomerOffersWithReviews(quote, offers);
}

export async function getProviderOffersForQuote(quoteId: string): Promise<ProviderOffer[]> {
  const rows = await prisma.providerOffer.findMany({
    where: { quoteRequestId: quoteId },
    orderBy: { createdAt: "desc" },
  });
  const providers = await prisma.provider.findMany({
    where: { id: { in: rows.map((r) => r.providerId) } },
  });
  const providerMap = new Map(providers.map((p) => [p.id, toProvider(p)]));

  return rows.map((row) => mapOfferFromRow(row, providerMap.get(row.providerId)));
}

export async function getProviderOffersByProviderId(
  providerId: string
): Promise<ProviderOfferWithQuote[]> {
  const provider = await getProviderById(providerId);
  const rows = await prisma.providerOffer.findMany({
    where: { providerId },
    orderBy: { createdAt: "desc" },
  });
  if (rows.length === 0) return [];

  const quoteIds = [...new Set(rows.map((r) => r.quoteRequestId))];
  const quotes = await prisma.quoteRequest.findMany({ where: { id: { in: quoteIds } } });
  const quoteMap = new Map(quotes.map((q) => [q.id, toQuoteRequest(q)]));
  const escrows = await prisma.customerJobEscrowOrder.findMany({
    where: { quoteRequestId: { in: quoteIds } },
  });
  const escrowMap = new Map(escrows.map((e) => [e.quoteRequestId, e]));

  const items: ProviderOfferWithQuote[] = [];
  for (const row of rows) {
    const quote = quoteMap.get(row.quoteRequestId);
    if (!quote) continue;
    const escrowRow = escrowMap.get(row.quoteRequestId);
    const mappedOffer = mapOfferFromRow(row, provider ?? undefined);
    items.push({
      offer: mappedOffer,
      quote: {
        id: quote.id,
        serviceName: quote.serviceName,
        city: quote.city,
        district: quote.district,
        status: quote.status,
        createdAt: quote.createdAt,
      },
      escrowStatus: (escrowRow?.status as ProviderOfferWithQuote["escrowStatus"]) ?? null,
      escrowReleaseStatus:
        (escrowRow?.releaseStatus as ProviderOfferWithQuote["escrowReleaseStatus"]) ?? null,
    });
  }
  return items;
}

export async function acceptProviderOffer(quoteId: string, offerId: string) {
  const quoteRow = await prisma.quoteRequest.findUnique({ where: { id: quoteId } });
  const offerRow = await prisma.providerOffer.findUnique({ where: { id: offerId } });
  if (!quoteRow || !offerRow || offerRow.quoteRequestId !== quoteId) {
    return { error: "Teklif bulunamadı." };
  }
  const quote = toQuoteRequest(quoteRow);
  if (!quoteIsOpenForOffers(quote) || offerRow.status !== "pending") {
    return { error: "Teklif kabul edilemez." };
  }

  const provider = await prisma.provider.findUnique({ where: { id: offerRow.providerId } });
  if (!provider) return { error: "Usta bulunamadı." };

  const mapped = mapOfferFromRow(offerRow, toProvider(provider));
  const finalPrice = getCurrentOfferPrice(mapped);

  await prisma.$transaction([
    prisma.quoteRequest.update({
      where: { id: quoteId },
      data: {
        status: "accepted",
        matchedProviderId: provider.id,
        matchedProviderName: provider.name,
      },
    }),
    prisma.providerOffer.update({
      where: { id: offerId },
      data: { status: "accepted", price: finalPrice },
    }),
    prisma.providerOffer.updateMany({
      where: {
        quoteRequestId: quoteId,
        id: { not: offerId },
        status: "pending",
      },
      data: { status: "rejected" },
    }),
  ]);

  const updated = await prisma.quoteRequest.findUniqueOrThrow({ where: { id: quoteId } });
  return { quote: toQuoteRequest(updated) };
}

export async function counterOffer(
  offerId: string,
  from: "customer" | "provider",
  price: number,
  message: string,
  actorProviderId?: string
): Promise<{ offer?: ProviderOffer; error?: string; accepted?: boolean }> {
  const row = await prisma.providerOffer.findUnique({ where: { id: offerId } });
  if (!row || row.status !== "pending") {
    return { error: "Teklif bulunamadı veya kapalı." };
  }
  if (from === "provider" && actorProviderId && row.providerId !== actorProviderId) {
    return { error: "Bu teklife erişiminiz yok." };
  }

  const quoteRow = await prisma.quoteRequest.findUnique({ where: { id: row.quoteRequestId } });
  if (!quoteRow) return { error: "Talep bulunamadı." };
  const quote = toQuoteRequest(quoteRow);
  if (!quoteIsOpenForOffers(quote)) {
    return { error: "Talep artık pazarlığa kapalı." };
  }

  if (row.customerAgreedAt) {
    return { error: "Müşteri anlaştı. Karşı teklif verilemez; usta onayı bekleniyor." };
  }

  if (price <= 0 || message.trim().length < 5) {
    return { error: "Geçerli fiyat ve en az 5 karakterlik açıklama girin." };
  }

  const negotiation = parseNegotiation(row.negotiation);
  const entry: OfferNegotiationEntry = {
    from,
    price: Math.round(price),
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };

  const updated = await prisma.providerOffer.update({
    where: { id: offerId },
    data: {
      price: entry.price,
      negotiation: [...negotiation, entry],
      customerAgreedAt: null,
      providerAgreedAt: null,
    },
  });

  const provider = await prisma.provider.findUnique({ where: { id: row.providerId } });
  return {
    offer: mapOfferFromRow(updated, provider ? toProvider(provider) : undefined),
  };
}

export async function withdrawCustomerAgreement(
  offerId: string,
  customerPhone: string
): Promise<{ offer?: ProviderOffer; error?: string }> {
  const phone = normalizeProviderPhone(customerPhone);
  const row = await prisma.providerOffer.findUnique({ where: { id: offerId } });
  if (!row || row.status !== "pending") {
    return { error: "Teklif bulunamadı veya kapalı." };
  }

  const quoteRow = await prisma.quoteRequest.findUnique({ where: { id: row.quoteRequestId } });
  if (!quoteRow) return { error: "Talep bulunamadı." };
  if (!phonesEqual(quoteRow.phone, phone)) return { error: "Bu talep size ait değil." };
  if (!row.customerAgreedAt) return { error: "Aktif bir anlaşma onayınız yok." };
  if (row.providerAgreedAt) {
    return { error: "Usta da onayladı; anlaşmadan vazgeçilemez." };
  }

  const escrow = await prisma.customerJobEscrowOrder.findUnique({
    where: { quoteRequestId: row.quoteRequestId },
  });
  if (escrow?.status === "completed") {
    return { error: "Ödeme yapıldığı için anlaşmadan vazgeçilemez." };
  }

  const updated = await prisma.providerOffer.update({
    where: { id: offerId },
    data: { customerAgreedAt: null },
  });

  const provider = await prisma.provider.findUnique({ where: { id: row.providerId } });
  return {
    offer: mapOfferFromRow(updated, provider ? toProvider(provider) : undefined),
  };
}

export async function agreeToOffer(
  offerId: string,
  from: "customer" | "provider",
  actorProviderId?: string
): Promise<{ offer?: ProviderOffer; accepted?: boolean; error?: string }> {
  const row = await prisma.providerOffer.findUnique({ where: { id: offerId } });
  if (!row || row.status !== "pending") {
    return { error: "Teklif bulunamadı veya kapalı." };
  }
  if (from === "provider" && actorProviderId && row.providerId !== actorProviderId) {
    return { error: "Bu teklife erişiminiz yok." };
  }

  const quoteRow = await prisma.quoteRequest.findUnique({ where: { id: row.quoteRequestId } });
  if (!quoteRow) return { error: "Talep bulunamadı." };
  const quote = toQuoteRequest(quoteRow);
  if (!quoteIsOpenForOffers(quote)) {
    return { error: "Talep artık pazarlığa kapalı." };
  }

  if (from === "provider" && !row.customerAgreedAt) {
    return { error: "Müşteri henüz anlaşmadı. Müşteri onayı bekleniyor." };
  }

  const now = new Date();
  const customerAgreedAt = from === "customer" ? now : row.customerAgreedAt;
  const providerAgreedAt = from === "provider" ? now : row.providerAgreedAt;

  const updated = await prisma.providerOffer.update({
    where: { id: offerId },
    data: {
      customerAgreedAt,
      providerAgreedAt,
    },
  });

  if (customerAgreedAt && providerAgreedAt) {
    const result = await acceptProviderOffer(row.quoteRequestId, offerId);
    if (result.error) return { error: result.error };
    const acceptedRow = await prisma.providerOffer.findUniqueOrThrow({ where: { id: offerId } });
    const provider = await prisma.provider.findUnique({ where: { id: row.providerId } });
    return {
      accepted: true,
      offer: mapOfferFromRow(acceptedRow, provider ? toProvider(provider) : undefined),
    };
  }

  const provider = await prisma.provider.findUnique({ where: { id: row.providerId } });
  return {
    offer: mapOfferFromRow(updated, provider ? toProvider(provider) : undefined),
  };
}

export async function recordCustomerInitiatedContact(
  quoteId: string,
  offerId: string,
  customerPhone: string
): Promise<{ offer?: ProviderOffer; error?: string }> {
  const quoteRow = await prisma.quoteRequest.findUnique({ where: { id: quoteId } });
  if (!quoteRow) return { error: "Talep bulunamadı." };
  const quote = toQuoteRequest(quoteRow);
  if (!phonesEqual(quote.phone, customerPhone)) {
    return { error: "Bu talep size ait değil." };
  }

  const offerRow = await prisma.providerOffer.findUnique({ where: { id: offerId } });
  if (!offerRow || offerRow.quoteRequestId !== quoteId) {
    return { error: "Teklif bulunamadı." };
  }

  const offer = mapOfferFromRow(offerRow);
  if (!canCustomerInitiateProviderCall(quote, offer)) {
    return {
      error: "Ustayı aramak için önce karşılıklı anlaşma sağlanmalı veya teklif kabul edilmiş olmalı.",
    };
  }

  const now = new Date();
  const updated = offerRow.customerInitiatedContactAt
    ? offerRow
    : await prisma.providerOffer.update({
        where: { id: offerId },
        data: { customerInitiatedContactAt: now },
      });

  const provider = await prisma.provider.findUnique({ where: { id: updated.providerId } });
  return {
    offer: mapOfferFromRow(updated, provider ? toProvider(provider) : undefined),
  };
}

export async function getAcceptedContactDetails(quoteId: string) {
  const quoteRow = await prisma.quoteRequest.findUnique({ where: { id: quoteId } });
  if (!quoteRow) return null;

  let providerId = quoteRow.matchedProviderId;
  if (!providerId) {
    const dualAgreed = await prisma.providerOffer.findFirst({
      where: {
        quoteRequestId: quoteId,
        customerAgreedAt: { not: null },
        providerAgreedAt: { not: null },
        status: { in: ["pending", "accepted"] },
      },
      orderBy: { createdAt: "desc" },
    });
    providerId = dualAgreed?.providerId ?? null;
  }

  if (!providerId) return null;

  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
  });
  if (!provider) return null;
  return {
    customer: {
      name: quoteRow.name,
      phone: quoteRow.phone,
      email: quoteRow.email,
    },
    provider: {
      name: provider.name,
      phone: provider.phone,
      email: provider.email,
    },
  };
}

export async function getQuoteOfferCounts(): Promise<Record<string, number>> {
  const rows = await prisma.providerOffer.groupBy({
    by: ["quoteRequestId"],
    where: { status: { not: "withdrawn" } },
    _count: { id: true },
  });
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.quoteRequestId] = row._count.id;
  }
  return counts;
}

export async function deleteDemoQuoteRequests(): Promise<{
  quotes: number;
  offers: number;
}> {
  const demoRows = await prisma.quoteRequest.findMany({
    where: {
      OR: [
        { id: { startsWith: "demo-quote-" } },
        { notes: { contains: "demo içerik", mode: "insensitive" } },
        { email: { endsWith: "@ornek.com" } },
      ],
    },
    select: { id: true },
  });
  const ids = demoRows.map((r) => r.id);
  if (ids.length === 0) return { quotes: 0, offers: 0 };

  const offers = await prisma.providerOffer.deleteMany({
    where: { quoteRequestId: { in: ids } },
  });
  const quotes = await prisma.quoteRequest.deleteMany({
    where: { id: { in: ids } },
  });

  return { quotes: quotes.count, offers: offers.count };
}

export async function adminMatchQuoteToProvider(
  quoteId: string,
  providerId: string
): Promise<{ quote?: QuoteRequest; error?: string }> {
  const quoteRow = await prisma.quoteRequest.findUnique({ where: { id: quoteId } });
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });

  if (!quoteRow) return { error: "Talep bulunamadı." };
  if (!provider || provider.status !== "approved") return { error: "Usta bulunamadı." };
  const quote = toQuoteRequest(quoteRow);
  if (quote.status !== "open" && quote.status !== "awaiting_review") {
    return { error: "Bu talep eşleştirilemez." };
  }

  await prisma.$transaction([
    prisma.quoteRequest.update({
      where: { id: quoteId },
      data: {
        status: "accepted",
        matchedProviderId: provider.id,
        matchedProviderName: provider.name,
      },
    }),
    prisma.providerOffer.updateMany({
      where: { quoteRequestId: quoteId, status: "pending" },
      data: { status: "rejected" },
    }),
  ]);

  const updated = await prisma.quoteRequest.findUniqueOrThrow({ where: { id: quoteId } });
  return { quote: toQuoteRequest(updated) };
}

export async function autoMatchQuote(
  quoteId: string
): Promise<{ quote?: QuoteRequest; error?: string; method?: "offer" | "provider" }> {
  const quoteRow = await prisma.quoteRequest.findUnique({ where: { id: quoteId } });
  if (!quoteRow) return { error: "Talep bulunamadı." };

  if (quoteRow.status === "awaiting_review") {
    await prisma.quoteRequest.update({
      where: { id: quoteId },
      data: { status: "open" },
    });
  }

  const refreshed = await prisma.quoteRequest.findUniqueOrThrow({ where: { id: quoteId } });
  const quote = toQuoteRequest(refreshed);
  if (quote.status !== "open") return { error: "Talep eşleştirilemez." };

  const offers = await prisma.providerOffer.findMany({
    where: { quoteRequestId: quoteId, status: "pending" },
    orderBy: { price: "asc" },
    take: 1,
  });

  if (offers.length > 0) {
    const r = await acceptProviderOffer(quoteId, offers[0].id);
    return r.error ? r : { quote: r.quote, method: "offer" };
  }

  const [providers, allQuotes] = await Promise.all([
    prisma.provider.findMany({ where: { status: "approved" } }),
    prisma.quoteRequest.findMany({ where: { status: "accepted" } }),
  ]);

  const { pickBestProvider, countActiveJobsByProvider } = await import("./quote-matching");
  const activeJobs = countActiveJobsByProvider(allQuotes.map(toQuoteRequest));
  const best = pickBestProvider(
    quote,
    providers.map(toProvider),
    activeJobs
  );
  if (!best) return { error: "Uygun usta bulunamadı." };

  return adminMatchQuoteToProvider(quoteId, best.id).then((r) =>
    r.error ? r : { quote: r.quote, method: "provider" }
  );
}

export async function bulkAdminQuoteAction(params: {
  ids: string[];
  action: "approve" | "reject" | "match";
  providerId?: string;
}): Promise<import("./quote-matching").BulkQuoteActionResult> {
  const result: import("./quote-matching").BulkQuoteActionResult = {
    processed: params.ids.length,
    succeeded: [],
    failed: [],
  };

  for (const id of params.ids) {
    if (params.action === "approve") {
      const existing = await prisma.quoteRequest.findUnique({ where: { id } });
      if (!existing) {
        result.failed.push({ id, error: "Talep bulunamadı." });
        continue;
      }
      if (existing.status !== "awaiting_review") {
        result.failed.push({ id, error: "Onaylanamaz durumda." });
        continue;
      }
      await prisma.quoteRequest.update({ where: { id }, data: { status: "open" } });
      result.succeeded.push(id);
    } else if (params.action === "reject") {
      const existing = await prisma.quoteRequest.findUnique({ where: { id } });
      if (!existing) {
        result.failed.push({ id, error: "Talep bulunamadı." });
        continue;
      }
      if (existing.status !== "awaiting_review" && existing.status !== "open") {
        result.failed.push({ id, error: "Reddedilemez durumda." });
        continue;
      }
      await prisma.quoteRequest.update({
        where: { id },
        data: { status: "cancelled", matchedProviderId: null, matchedProviderName: null },
      });
      result.succeeded.push(id);
    } else if (params.action === "match") {
      if (!params.providerId) {
        result.failed.push({ id, error: "Usta seçilmedi." });
        continue;
      }
      const r = await adminMatchQuoteToProvider(id, params.providerId);
      if (r.error) result.failed.push({ id, error: r.error });
      else result.succeeded.push(id);
    }
  }

  return result;
}

export async function autoMatchQuotes(
  ids: string[]
): Promise<import("./quote-matching").BulkQuoteActionResult & { methods: Record<string, string> }> {
  const result: import("./quote-matching").BulkQuoteActionResult & {
    methods: Record<string, string>;
  } = {
    processed: ids.length,
    succeeded: [],
    failed: [],
    methods: {},
  };

  for (const id of ids) {
    const r = await autoMatchQuote(id);
    if (r.error) result.failed.push({ id, error: r.error });
    else {
      result.succeeded.push(id);
      if (r.method) result.methods[id] = r.method;
    }
  }

  return result;
}

function toCreditPurchaseOrder(row: {
  id: string;
  providerId: string;
  packageSlug: string;
  packageName: string;
  credits: number;
  packageAmount: number;
  debtCredits: number;
  amount: number;
  conversationId: string;
  basketId: string;
  status: string;
  iyzicoToken: string | null;
  iyzicoPaymentId: string | null;
  purchaseId: string | null;
  createdAt: Date;
  completedAt: Date | null;
}): CreditPurchaseOrder {
  return {
    id: row.id,
    providerId: row.providerId,
    packageSlug: row.packageSlug,
    packageName: row.packageName,
    credits: row.credits,
    packageAmount: row.packageAmount,
    debtCredits: row.debtCredits,
    amount: row.amount,
    conversationId: row.conversationId,
    basketId: row.basketId,
    status: row.status as CreditPurchaseOrder["status"],
    iyzicoToken: row.iyzicoToken ?? undefined,
    iyzicoPaymentId: row.iyzicoPaymentId ?? undefined,
    purchaseId: row.purchaseId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString(),
  };
}

export async function createCreditPurchaseOrder(
  providerId: string,
  packageSlug: string
): Promise<{ order?: CreditPurchaseOrder; error?: string }> {
  const pkg = getShopPackage(packageSlug);
  if (!pkg) return { error: "Geçersiz paket." };

  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider || provider.status !== "approved") {
    return { error: "Usta hesabı onaylı değil." };
  }

  const checkout = isPlatformShopPackage(packageSlug)
    ? computePlatformCheckoutTotal(pkg.price)
    : computeCheckoutTotal(pkg.price, provider.creditDebt ?? 0);

  const id = generateId();
  const row = await prisma.creditPurchaseOrder.create({
    data: {
      id,
      providerId,
      packageSlug: pkg.slug,
      packageName: pkg.name,
      credits: pkg.credits,
      packageAmount: checkout.packageAmount,
      debtCredits: checkout.debtCredits,
      amount: checkout.totalAmount,
      conversationId: `credit-${id}`,
      basketId: id,
      createdAt: new Date(),
    },
  });

  return { order: toCreditPurchaseOrder(row) };
}

export async function setCreditPurchaseToken(orderId: string, token: string) {
  const row = await prisma.creditPurchaseOrder.update({
    where: { id: orderId },
    data: { iyzicoToken: token },
  });
  return toCreditPurchaseOrder(row);
}

export async function getCreditPurchaseOrderById(id: string) {
  const row = await prisma.creditPurchaseOrder.findUnique({ where: { id } });
  return row ? toCreditPurchaseOrder(row) : undefined;
}

export async function getCreditPurchaseOrderByConversationId(conversationId: string) {
  const row = await prisma.creditPurchaseOrder.findUnique({ where: { conversationId } });
  return row ? toCreditPurchaseOrder(row) : undefined;
}

export async function fulfillCreditPurchaseOrder(
  conversationId: string,
  iyzicoPaymentId?: string
): Promise<{ order?: CreditPurchaseOrder; credits?: number; error?: string; alreadyCompleted?: boolean }> {
  const row = await prisma.creditPurchaseOrder.findUnique({ where: { conversationId } });
  if (!row) return { error: "Sipariş bulunamadı." };
  if (row.status === "completed") {
    return { order: toCreditPurchaseOrder(row), alreadyCompleted: true, credits: row.credits };
  }
  if (row.status === "failed") return { error: "Sipariş başarısız." };

  const purchaseId = generateId();
  const purchasedAt = new Date();

  await prisma.$transaction(async (tx) => {
    const providerUpdate: {
      creditBalance?: { increment: number };
      creditDebt?: number;
      borcKredisiAktif?: boolean;
    } = {};
    if (row.credits > 0) {
      providerUpdate.creditBalance = { increment: row.credits };
    }
    if (row.debtCredits > 0) {
      providerUpdate.creditDebt = 0;
      providerUpdate.borcKredisiAktif = false;
    }
    if (Object.keys(providerUpdate).length > 0) {
      await tx.provider.update({
        where: { id: row.providerId },
        data: providerUpdate,
      });
    }
    await tx.providerPlatformPurchase.create({
      data: {
        id: purchaseId,
        providerId: row.providerId,
        serviceSlug: row.packageSlug,
        serviceName: row.packageName,
        amount: row.amount,
        purchasedAt,
        status: "active",
      },
    });
    await tx.creditPurchaseOrder.update({
      where: { id: row.id },
      data: {
        status: "completed",
        purchaseId,
        iyzicoPaymentId: iyzicoPaymentId ?? null,
        completedAt: purchasedAt,
      },
    });
    const { appendCreditLedger } = await import("./db-credits");
    if (row.credits > 0 || row.debtCredits > 0) {
      await appendCreditLedger(tx, {
        type: "provider_purchase",
        creditsDelta: row.credits,
        tlAmount: row.amount,
        providerId: row.providerId,
        referenceId: row.id,
        description: `Usta kontör satın alma: ${row.packageName}`,
        createdAt: purchasedAt,
      });
    }
    if (row.debtCredits > 0) {
      await appendCreditLedger(tx, {
        type: "debt_settlement",
        creditsDelta: -row.debtCredits,
        tlAmount: row.amount - row.packageAmount,
        providerId: row.providerId,
        referenceId: row.id,
        description: `Borç kredisi kapatma (${row.debtCredits} kontör)`,
        createdAt: purchasedAt,
      });
    }
  });

  try {
    await createInvoiceForPurchase(row.providerId, purchaseId);
  } catch {
    // fatura sonra kesilebilir
  }

  const updated = await prisma.creditPurchaseOrder.findUniqueOrThrow({ where: { id: row.id } });
  return { order: toCreditPurchaseOrder(updated), credits: row.credits };
}

export async function failCreditPurchaseOrder(conversationId: string) {
  const row = await prisma.creditPurchaseOrder.findUnique({ where: { conversationId } });
  if (!row || row.status === "completed") return null;
  const updated = await prisma.creditPurchaseOrder.update({
    where: { id: row.id },
    data: { status: "failed" },
  });
  return toCreditPurchaseOrder(updated);
}

async function linkReferralOnProviderRegistration(
  providerId: string,
  phone: string
): Promise<void> {
  const normalized = normalizeProviderPhone(phone);
  const referral = await prisma.providerReferral.findUnique({
    where: { referredPhone: normalized },
  });
  if (!referral || referral.referredProviderId) return;

  await prisma.providerReferral.update({
    where: { id: referral.id },
    data: { referredProviderId: providerId },
  });
}

export async function submitProviderReferral(
  referrerId: string,
  input: ProviderReferralSubmitInput
): Promise<{
  referral?: import("./types").ProviderReferral;
  creditsAwarded?: number;
  creditBalance?: number;
  error?: string;
  code?: string;
}> {
  const validationError = validateReferralInput(input);
  if (validationError) {
    return { error: validationError, code: "INVALID_INPUT" };
  }

  const normalized = normalizeProviderPhone(input.phone);
  if (!/^05\d{9}$/.test(normalized)) {
    return { error: "Geçerli telefon numarası girin.", code: "INVALID_PHONE" };
  }

  const referredName = input.name.trim();
  const categorySlug = input.categorySlug;
  const serviceSlugs = [...new Set(input.serviceSlugs.filter(Boolean))];

  const referrer = await getProviderById(referrerId);
  if (!referrer || referrer.status !== "approved") {
    return { error: "Onaylı usta hesabı gerekli.", code: "NOT_APPROVED" };
  }

  if (normalizeProviderPhone(referrer.phone) === normalized) {
    return { error: "Kendi numaranızı davet edemezsiniz.", code: "SELF_REFERRAL" };
  }

  const providers = await prisma.provider.findMany({ select: { phone: true } });
  if (providers.some((p) => normalizeProviderPhone(p.phone) === normalized)) {
    return { error: "Bu numara zaten usta olarak kayıtlı.", code: "PHONE_ALREADY_PROVIDER" };
  }

  const existingReferral = await prisma.providerReferral.findUnique({
    where: { referredPhone: normalized },
  });
  if (existingReferral) {
    return { error: "Bu numara daha önce davet edilmiş.", code: "PHONE_ALREADY_REFERRED" };
  }

  const id = generateId();
  const createdAt = new Date();

  await prisma.$transaction([
    prisma.providerReferral.create({
      data: {
        id,
        referrerId,
        referredPhone: normalized,
        referredName,
        categorySlug,
        serviceSlugs,
        creditsAwarded: REFERRAL_REWARD_CREDITS,
        createdAt,
      },
    }),
    prisma.provider.update({
      where: { id: referrerId },
      data: { creditBalance: { increment: REFERRAL_REWARD_CREDITS } },
    }),
  ]);

  const updated = await getProviderById(referrerId);
  return {
    referral: {
      id,
      referrerId,
      referredPhone: normalized,
      referredName,
      categorySlug,
      serviceSlugs,
      creditsAwarded: REFERRAL_REWARD_CREDITS,
      createdAt: createdAt.toISOString(),
    },
    creditsAwarded: REFERRAL_REWARD_CREDITS,
    creditBalance: updated?.creditBalance ?? 0,
  };
}

export async function getProviderReferrals(
  referrerId: string
): Promise<import("./types").ProviderReferral[]> {
  const rows = await prisma.providerReferral.findMany({
    where: { referrerId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    referrerId: row.referrerId,
    referredPhone: row.referredPhone,
    referredName: row.referredName,
    categorySlug: row.categorySlug,
    serviceSlugs: Array.isArray(row.serviceSlugs)
      ? row.serviceSlugs.filter((s): s is string => typeof s === "string")
      : [],
    referredProviderId: row.referredProviderId ?? undefined,
    creditsAwarded: row.creditsAwarded,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getCustomerProfile(phone: string): Promise<import("./types").CustomerProfile> {
  const normalized = normalizeProviderPhone(phone);
  const wallet = await prisma.customerWallet.findFirst({ where: { phone: normalized } });
  if (wallet?.city) {
    return {
      phone: normalized,
      city: wallet.city,
      district: wallet.district ?? "",
    };
  }

  const latestQuote = await prisma.quoteRequest.findFirst({
    where: { phone: normalized },
    orderBy: { createdAt: "desc" },
  });
  return {
    phone: normalized,
    city: latestQuote?.city ?? "",
    district: latestQuote?.district ?? "",
  };
}

export async function updateCustomerProfile(
  phone: string,
  data: { city: string; district?: string }
): Promise<{ profile?: import("./types").CustomerProfile; error?: string }> {
  const normalized = normalizeProviderPhone(phone);
  const city = data.city.trim();
  const district = data.district?.trim() ?? "";
  if (!city) return { error: "İl seçin." };

  const existing = await prisma.customerWallet.findFirst({ where: { phone: normalized } });
  const now = new Date();

  if (existing) {
    await prisma.customerWallet.update({
      where: { id: existing.id },
      data: { city, district: district || null, updatedAt: now },
    });
  } else {
    await prisma.customerWallet.create({
      data: {
        id: generateId(),
        phone: normalized,
        creditBalance: 0,
        city,
        district: district || null,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  return { profile: { phone: normalized, city, district } };
}

export async function updateQuoteRequestLocation(
  quoteId: string,
  phone: string,
  data: { city: string; district: string }
): Promise<{ quote?: QuoteRequest; error?: string }> {
  const normalized = normalizeProviderPhone(phone);
  const city = data.city.trim();
  const district = data.district.trim();
  if (!city || !district) return { error: "İl ve ilçe seçin." };

  const row = await prisma.quoteRequest.findUnique({ where: { id: quoteId } });
  if (!row) return { error: "Talep bulunamadı." };
  if (!phonesEqual(row.phone, normalized)) return { error: "Bu talep size ait değil." };
  if (row.status !== "open" && row.status !== "awaiting_review") {
    return { error: "Bu talebin konumu artık değiştirilemez." };
  }

  const updated = await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: { city, district },
  });
  return { quote: toQuoteRequest(updated) };
}

function toProviderOfferReviewSummary(row: {
  id: string;
  rating: number;
  comment: string;
  reviewerLabel: string;
  createdAt: Date;
}): ProviderOfferReviewSummary {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    reviewerLabel: row.reviewerLabel,
    createdAt: row.createdAt.toISOString(),
  };
}

function toPublicProviderReview(row: {
  id: string;
  rating: number;
  comment: string;
  reviewerLabel: string;
  serviceName: string;
  createdAt: Date;
}): PublicProviderReview {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    reviewerLabel: row.reviewerLabel,
    serviceName: row.serviceName,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getProviderOfferReviewMapForQuote(
  quoteId: string
): Promise<Map<string, ProviderOfferReviewSummary>> {
  const rows = await prisma.providerOfferReview.findMany({
    where: { quoteRequestId: quoteId },
  });
  const map = new Map<string, ProviderOfferReviewSummary>();
  for (const row of rows) {
    map.set(row.offerId, toProviderOfferReviewSummary(row));
  }
  return map;
}

export async function enrichCustomerOffersWithReviews(
  quote: QuoteRequest,
  offers: ProviderOffer[]
): Promise<ProviderOffer[]> {
  const reviews = await getProviderOfferReviewMapForQuote(quote.id);
  return attachReviewsToCustomerOffers(offers, quote, reviews);
}

export async function submitProviderOfferReview(
  quoteId: string,
  offerId: string,
  customerPhone: string,
  input: ProviderOfferReviewInput
): Promise<{ review?: ProviderOfferReviewSummary; error?: string }> {
  const validation = validateProviderOfferReviewInput(input);
  if (validation) return { error: validation };

  const quoteRow = await prisma.quoteRequest.findUnique({ where: { id: quoteId } });
  if (!quoteRow) return { error: "Talep bulunamadı." };
  const quote = toQuoteRequest(quoteRow);
  if (!phonesEqual(quote.phone, customerPhone)) {
    return { error: "Bu talep size ait değil." };
  }

  const offerRow = await prisma.providerOffer.findUnique({ where: { id: offerId } });
  if (!offerRow || offerRow.quoteRequestId !== quoteId) {
    return { error: "Teklif bulunamadı." };
  }
  if (!canCustomerReviewOffer(quote, mapOfferFromRow(offerRow))) {
    return { error: "Bu teklif için değerlendirme yapılamaz." };
  }

  const existing = await prisma.providerOfferReview.findUnique({
    where: { offerId },
  });
  if (existing) {
    return { error: "Bu ustayı zaten değerlendirdiniz." };
  }

  const created = await prisma.providerOfferReview.create({
    data: {
      id: generateId(),
      quoteRequestId: quoteId,
      offerId,
      providerId: offerRow.providerId,
      customerPhone: normalizeProviderPhone(customerPhone),
      rating: Math.round(input.rating),
      comment: input.comment.trim(),
      reviewerLabel: reviewerLabelFromCustomerName(quote.name),
      serviceName: quote.serviceName,
      createdAt: new Date(),
    },
  });

  return { review: toProviderOfferReviewSummary(created) };
}

export async function getPublicProviderReviews(
  providerId: string,
  limit = 20
): Promise<PublicProviderReview[]> {
  const rows = await prisma.providerOfferReview.findMany({
    where: { providerId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toPublicProviderReview);
}

export async function getProviderReviewStats(
  providerId: string
): Promise<ProviderReviewStats> {
  const agg = await prisma.providerOfferReview.aggregate({
    where: { providerId },
    _avg: { rating: true },
    _count: { id: true },
  });
  const count = agg._count.id;
  return {
    reviewCount: count,
    averageRating: count > 0 ? Math.round((agg._avg.rating ?? 0) * 10) / 10 : 0,
  };
}
