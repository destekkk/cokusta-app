import type {
  CertificateBlock as PrismaCertificateBlock,
  Invoice as PrismaInvoice,
  Provider as PrismaProvider,
  ProviderCertificate as PrismaProviderCertificate,
  ProviderOfTheMonth as PrismaProviderOfTheMonth,
  ProviderPlatformPurchase as PrismaPurchase,
  ProviderPortfolioItem as PrismaPortfolioItem,
  QuoteRequest as PrismaQuote,
  Customer as PrismaCustomer,
  TaxDeclaration as PrismaTaxDeclaration,
  InvoiceReferenceType,
  CertificateType as PrismaCertificateType,
  QuoteStatus,
  ProviderStatus,
  PurchaseStatus,
} from "@prisma/client";
import type {
  CertificateBlock,
  Customer,
  Invoice,
  ProviderCertificate,
  ProviderOfTheMonth,
  ProviderPlatformPurchase,
  ProviderPortfolioItem,
  ProviderRegistration,
  QuoteRequest,
  ProviderOffer,
  TaxDeclaration,
  CertificateType,
} from "../types";

type ProviderWithRelations = PrismaProvider & {
  portfolio?: PrismaPortfolioItem[];
  platformPurchases?: PrismaPurchase[];
};

export function toQuoteRequest(row: PrismaQuote): QuoteRequest {
  const rawStatus = row.status as string;
  let status = row.status as QuoteRequest["status"];
  if (rawStatus === "pending") status = "open";
  if (rawStatus === "matched") status = "accepted";

  return {
    id: row.id,
    serviceSlug: row.serviceSlug,
    serviceName: row.serviceName,
    categoryName: row.categoryName,
    answers: row.answers as Record<string, string>,
    city: row.city,
    district: row.district,
    name: row.name,
    phone: row.phone,
    email: row.email,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    status,
    matchedProviderId: row.matchedProviderId ?? undefined,
    matchedProviderName: row.matchedProviderName ?? undefined,
    acceptedOfferId: undefined,
    jobValue: row.jobValue ?? undefined,
    commissionRate: row.commissionRate ?? undefined,
    commissionAmount: row.commissionAmount ?? undefined,
    completedAt: row.completedAt?.toISOString(),
    invoiceId: row.invoiceId ?? undefined,
    priorityListing: row.priorityListing,
    launchMemberNumber: row.launchMemberNumber ?? undefined,
    urgent: row.urgent,
    urgentDeadline: row.urgentDeadline?.toISOString(),
    customerPaidCredits: row.customerPaidCredits ?? undefined,
    customerPaymentAt: row.customerPaymentAt?.toISOString(),
  };
}

export function toPortfolioItem(row: PrismaPortfolioItem): ProviderPortfolioItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    serviceSlug: row.serviceSlug ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toPurchase(row: PrismaPurchase): ProviderPlatformPurchase {
  return {
    id: row.id,
    serviceSlug: row.serviceSlug,
    serviceName: row.serviceName,
    amount: row.amount,
    purchasedAt: row.purchasedAt.toISOString(),
    status: row.status as ProviderPlatformPurchase["status"],
    invoiceId: row.invoiceId ?? undefined,
  };
}

export function toProvider(row: ProviderWithRelations): ProviderRegistration {
  return {
    id: row.id,
    name: row.name,
    companyName: row.companyName ?? undefined,
    phone: row.phone,
    email: row.email,
    city: row.city,
    district: row.district ?? undefined,
    categorySlugs: Array.isArray(row.categorySlugs)
      ? (row.categorySlugs as string[]).filter((slug) => typeof slug === "string")
      : [],
    experience: row.experience,
    bio: row.bio,
    createdAt: row.createdAt.toISOString(),
    status: row.status as ProviderRegistration["status"],
    reviewedAt: row.reviewedAt?.toISOString(),
    rejectionReason: row.rejectionReason ?? undefined,
    creditBalance: row.creditBalance,
    creditDebt: row.creditDebt,
    iban: row.iban ?? undefined,
    accountHolder: row.accountHolder ?? undefined,
    escrowBalanceTl: row.escrowBalanceTl ?? 0,
    launchMemberNumber: row.launchMemberNumber ?? undefined,
    launchBonusGranted: row.launchBonusGranted,
    portfolio: row.portfolio?.map(toPortfolioItem),
    platformPurchases: row.platformPurchases?.map(toPurchase),
  };
}

export function toCustomer(row: PrismaCustomer): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    city: row.city,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toInvoice(row: PrismaInvoice): Invoice {
  return {
    id: row.id,
    invoiceNo: row.invoiceNo,
    referenceType:
      row.referenceType === "platform_purchase" ? "platform-purchase" : "quote",
    referenceId: row.referenceId,
    recipientName: row.recipientName,
    recipientEmail: row.recipientEmail ?? undefined,
    recipientPhone: row.recipientPhone ?? undefined,
    description: row.description,
    subtotal: row.subtotal,
    vatRate: row.vatRate,
    vatAmount: row.vatAmount,
    total: row.total,
    period: row.period,
    issuedAt: row.issuedAt.toISOString(),
  };
}

export function toTaxDeclaration(row: PrismaTaxDeclaration): TaxDeclaration {
  return {
    id: row.id,
    period: row.period,
    periodLabel: row.periodLabel,
    invoiceCount: row.invoiceCount,
    taxableBase: row.taxableBase,
    calculatedVat: row.calculatedVat,
    totalAmount: row.totalAmount,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toCertificate(row: PrismaProviderCertificate): ProviderCertificate {
  return {
    id: row.id,
    providerId: row.providerId,
    providerName: row.providerName,
    type: row.type as ProviderCertificate["type"],
    title: row.title,
    description: row.description,
    period: row.period ?? undefined,
    issuedAt: row.issuedAt.toISOString(),
    blockIndex: row.blockIndex,
    blockHash: row.blockHash,
    previousHash: row.previousHash,
    metadata: row.metadata as ProviderCertificate["metadata"],
  };
}

export function toCertificateBlock(row: PrismaCertificateBlock): CertificateBlock {
  return {
    index: row.index,
    timestamp: row.timestamp.toISOString(),
    certificateId: row.certificateId,
    data: row.data,
    previousHash: row.previousHash,
    hash: row.hash,
  };
}

export function toProviderOfTheMonth(row: PrismaProviderOfTheMonth): ProviderOfTheMonth {
  return {
    period: row.period,
    periodLabel: row.periodLabel,
    providerId: row.providerId,
    providerName: row.providerName,
    certificateId: row.certificateId,
    selectedAt: row.selectedAt.toISOString(),
    reason: row.reason ?? undefined,
    status: row.status as ProviderOfTheMonth["status"],
    creditsAwarded: row.creditsAwarded,
    publishedAt: row.publishedAt?.toISOString(),
  };
}

export function invoiceReferenceType(
  type: Invoice["referenceType"]
): InvoiceReferenceType {
  return type === "platform-purchase" ? "platform_purchase" : "quote";
}

export function quoteStatus(status: QuoteRequest["status"]): QuoteStatus {
  return status as QuoteStatus;
}

/** DB yazımı — eski enum (pending/matched) ile uyum */
export function quoteStatusLegacyWrite(
  status: QuoteRequest["status"]
): "pending" | "matched" | "completed" | "cancelled" {
  if (status === "open" || status === "awaiting_review") return "pending";
  if (status === "accepted") return "matched";
  return status;
}

export function offerStatus(
  status: ProviderOffer["status"]
): import("@prisma/client").OfferStatus {
  return status;
}

export function providerStatus(status: ProviderRegistration["status"]): ProviderStatus {
  return status;
}

export function purchaseStatus(
  status: ProviderPlatformPurchase["status"]
): PurchaseStatus {
  return status;
}

export function certificateType(type: CertificateType): PrismaCertificateType {
  return type;
}
