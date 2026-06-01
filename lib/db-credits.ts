import type {
  CreditLedgerEntry,
  CustomerCreditPurchaseOrder,
  CustomerProviderPayment,
  CustomerWallet,
  ProviderPayoutRequest,
} from "@/lib/types";
import { getCreditPackage } from "@/lib/credit-packages";
import {
  computePayoutAmounts,
  creditsToTl,
  currentCreditPeriod,
  MIN_PAYOUT_CREDITS,
  tlToCredits,
} from "@/lib/credit-economy";
import { formatPeriodLabel } from "@/lib/billing";
import { generateId } from "@/lib/id";
import { normalizeProviderPhone, phonesEqual } from "@/lib/phone-utils";
import { prisma } from "@/lib/prisma";
import type { CreditLedgerType, Prisma } from "@prisma/client";

function toWallet(row: {
  id: string;
  phone: string;
  creditBalance: number;
  createdAt: Date;
  updatedAt: Date;
}): CustomerWallet {
  return {
    id: row.id,
    phone: row.phone,
    creditBalance: row.creditBalance,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toCustomerOrder(row: {
  id: string;
  walletId: string;
  packageSlug: string;
  packageName: string;
  credits: number;
  amount: number;
  conversationId: string;
  basketId: string;
  status: string;
  iyzicoToken: string | null;
  iyzicoPaymentId: string | null;
  createdAt: Date;
  completedAt: Date | null;
}): CustomerCreditPurchaseOrder {
  return {
    id: row.id,
    walletId: row.walletId,
    packageSlug: row.packageSlug,
    packageName: row.packageName,
    credits: row.credits,
    amount: row.amount,
    conversationId: row.conversationId,
    basketId: row.basketId,
    status: row.status as CustomerCreditPurchaseOrder["status"],
    iyzicoToken: row.iyzicoToken ?? undefined,
    iyzicoPaymentId: row.iyzicoPaymentId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString(),
  };
}

function toPayout(row: {
  id: string;
  providerId: string;
  period: string;
  creditsRequested: number;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  status: string;
  iban: string | null;
  accountHolder: string | null;
  adminNote: string | null;
  requestedAt: Date;
  processedAt: Date | null;
}): ProviderPayoutRequest {
  return {
    id: row.id,
    providerId: row.providerId,
    period: row.period,
    creditsRequested: row.creditsRequested,
    grossAmount: row.grossAmount,
    feeAmount: row.feeAmount,
    netAmount: row.netAmount,
    status: row.status as ProviderPayoutRequest["status"],
    iban: row.iban ?? undefined,
    accountHolder: row.accountHolder ?? undefined,
    adminNote: row.adminNote ?? undefined,
    requestedAt: row.requestedAt.toISOString(),
    processedAt: row.processedAt?.toISOString(),
  };
}

function toLedger(row: {
  id: string;
  type: CreditLedgerType;
  creditsDelta: number;
  tlAmount: number | null;
  customerWalletId: string | null;
  providerId: string | null;
  quoteRequestId: string | null;
  referenceId: string | null;
  description: string;
  period: string;
  createdAt: Date;
}): CreditLedgerEntry {
  return {
    id: row.id,
    type: row.type,
    creditsDelta: row.creditsDelta,
    tlAmount: row.tlAmount ?? undefined,
    customerWalletId: row.customerWalletId ?? undefined,
    providerId: row.providerId ?? undefined,
    quoteRequestId: row.quoteRequestId ?? undefined,
    referenceId: row.referenceId ?? undefined,
    description: row.description,
    period: row.period,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function appendCreditLedger(
  tx: Prisma.TransactionClient,
  input: {
    type: CreditLedgerType;
    creditsDelta: number;
    tlAmount?: number;
    customerWalletId?: string;
    providerId?: string;
    quoteRequestId?: string;
    referenceId?: string;
    description: string;
    createdAt?: Date;
  }
) {
  const createdAt = input.createdAt ?? new Date();
  await tx.creditLedgerEntry.create({
    data: {
      id: generateId(),
      type: input.type,
      creditsDelta: input.creditsDelta,
      tlAmount: input.tlAmount ?? null,
      customerWalletId: input.customerWalletId ?? null,
      providerId: input.providerId ?? null,
      quoteRequestId: input.quoteRequestId ?? null,
      referenceId: input.referenceId ?? null,
      description: input.description,
      period: currentCreditPeriod(createdAt),
      createdAt,
    },
  });
}

export async function getOrCreateCustomerWallet(phone: string): Promise<CustomerWallet> {
  const normalized = normalizeProviderPhone(phone);
  const existing = await prisma.customerWallet.findFirst({
    where: { phone: normalized },
  });
  if (existing) return toWallet(existing);

  const now = new Date();
  const row = await prisma.customerWallet.create({
    data: {
      id: generateId(),
      phone: normalized,
      creditBalance: 0,
      createdAt: now,
      updatedAt: now,
    },
  });
  return toWallet(row);
}

export async function getCustomerWalletByPhone(phone: string): Promise<CustomerWallet | undefined> {
  const normalized = normalizeProviderPhone(phone);
  const row = await prisma.customerWallet.findFirst({ where: { phone: normalized } });
  return row ? toWallet(row) : undefined;
}

export async function createCustomerCreditPurchaseOrder(
  phone: string,
  packageSlug: string
): Promise<{ order?: CustomerCreditPurchaseOrder; error?: string }> {
  const pkg = getCreditPackage(packageSlug);
  if (!pkg) return { error: "Geçersiz paket." };

  const wallet = await getOrCreateCustomerWallet(phone);
  const id = generateId();

  const row = await prisma.customerCreditPurchaseOrder.create({
    data: {
      id,
      walletId: wallet.id,
      packageSlug: pkg.slug,
      packageName: pkg.name,
      credits: pkg.credits,
      amount: pkg.price,
      conversationId: `cust-credit-${id}`,
      basketId: id,
      createdAt: new Date(),
    },
  });

  return { order: toCustomerOrder(row) };
}

export async function setCustomerCreditPurchaseToken(orderId: string, token: string) {
  const row = await prisma.customerCreditPurchaseOrder.update({
    where: { id: orderId },
    data: { iyzicoToken: token },
  });
  return toCustomerOrder(row);
}

export async function getCustomerCreditOrderByConversationId(conversationId: string) {
  const row = await prisma.customerCreditPurchaseOrder.findUnique({
    where: { conversationId },
  });
  return row ? toCustomerOrder(row) : undefined;
}

export async function fulfillCustomerCreditPurchaseOrder(
  conversationId: string,
  iyzicoPaymentId?: string
): Promise<{ order?: CustomerCreditPurchaseOrder; credits?: number; error?: string; alreadyCompleted?: boolean }> {
  const row = await prisma.customerCreditPurchaseOrder.findUnique({ where: { conversationId } });
  if (!row) return { error: "Sipariş bulunamadı." };
  if (row.status === "completed") {
    return { order: toCustomerOrder(row), alreadyCompleted: true, credits: row.credits };
  }
  if (row.status === "failed") return { error: "Sipariş başarısız." };

  const completedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.customerWallet.update({
      where: { id: row.walletId },
      data: {
        creditBalance: { increment: row.credits },
        updatedAt: completedAt,
      },
    });
    await tx.customerCreditPurchaseOrder.update({
      where: { id: row.id },
      data: {
        status: "completed",
        iyzicoPaymentId: iyzicoPaymentId ?? null,
        completedAt,
      },
    });
    await appendCreditLedger(tx, {
      type: "customer_purchase",
      creditsDelta: row.credits,
      tlAmount: row.amount,
      customerWalletId: row.walletId,
      referenceId: row.id,
      description: `Müşteri kontör satın alma: ${row.packageName}`,
      createdAt: completedAt,
    });
  });

  const updated = await prisma.customerCreditPurchaseOrder.findUniqueOrThrow({ where: { id: row.id } });
  return { order: toCustomerOrder(updated), credits: row.credits };
}

export async function failCustomerCreditPurchaseOrder(conversationId: string) {
  const row = await prisma.customerCreditPurchaseOrder.findUnique({ where: { conversationId } });
  if (!row || row.status === "completed") return null;
  const updated = await prisma.customerCreditPurchaseOrder.update({
    where: { id: row.id },
    data: { status: "failed" },
  });
  return toCustomerOrder(updated);
}

export async function payProviderWithCustomerCredits(input: {
  customerPhone: string;
  quoteId: string;
  offerId: string;
}): Promise<{
  payment?: CustomerProviderPayment;
  error?: string;
  code?: "INSUFFICIENT_CREDITS" | "ALREADY_PAID";
}> {
  const phone = normalizeProviderPhone(input.customerPhone);
  const quoteRow = await prisma.quoteRequest.findUnique({ where: { id: input.quoteId } });
  if (!quoteRow) return { error: "Talep bulunamadı." };
  if (!phonesEqual(quoteRow.phone, phone)) return { error: "Bu talep size ait değil." };
  if (quoteRow.status !== "accepted" || !quoteRow.matchedProviderId) {
    return { error: "Ödeme için önce usta seçilmelidir." };
  }

  const existingPayment = await prisma.customerProviderPayment.findUnique({
    where: { quoteRequestId: input.quoteId },
  });
  if (existingPayment) return { error: "Bu iş için zaten kontör ödemesi yapıldı.", code: "ALREADY_PAID" };

  const offerRow = await prisma.providerOffer.findUnique({ where: { id: input.offerId } });
  if (!offerRow || offerRow.quoteRequestId !== input.quoteId || offerRow.status !== "accepted") {
    return { error: "Geçerli teklif bulunamadı." };
  }
  if (offerRow.providerId !== quoteRow.matchedProviderId) {
    return { error: "Seçili usta ile teklif eşleşmiyor." };
  }

  const creditsNeeded = tlToCredits(offerRow.price);
  const wallet = await getOrCreateCustomerWallet(phone);
  if (wallet.creditBalance < creditsNeeded) {
    return {
      error: `Yetersiz kontör. Gerekli: ${creditsNeeded}, bakiyeniz: ${wallet.creditBalance}`,
      code: "INSUFFICIENT_CREDITS",
    };
  }

  const tlEquivalent = creditsToTl(creditsNeeded);
  const paymentId = generateId();
  const createdAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.customerWallet.update({
      where: { id: wallet.id },
      data: {
        creditBalance: { decrement: creditsNeeded },
        updatedAt: createdAt,
      },
    });
    await tx.provider.update({
      where: { id: offerRow.providerId },
      data: { creditBalance: { increment: creditsNeeded } },
    });
    await tx.customerProviderPayment.create({
      data: {
        id: paymentId,
        quoteRequestId: input.quoteId,
        offerId: input.offerId,
        walletId: wallet.id,
        providerId: offerRow.providerId,
        credits: creditsNeeded,
        tlEquivalent,
        status: "completed",
        createdAt,
      },
    });
    await tx.quoteRequest.update({
      where: { id: input.quoteId },
      data: {
        customerPaidCredits: creditsNeeded,
        customerPaymentAt: createdAt,
      },
    });
    await appendCreditLedger(tx, {
      type: "customer_payment",
      creditsDelta: -creditsNeeded,
      tlAmount: tlEquivalent,
      customerWalletId: wallet.id,
      providerId: offerRow.providerId,
      quoteRequestId: input.quoteId,
      referenceId: paymentId,
      description: `Müşteri → usta kontör ödemesi (${creditsNeeded} kontör)`,
      createdAt,
    });
    await appendCreditLedger(tx, {
      type: "customer_payment",
      creditsDelta: creditsNeeded,
      tlAmount: tlEquivalent,
      providerId: offerRow.providerId,
      quoteRequestId: input.quoteId,
      referenceId: paymentId,
      description: `Müşteriden kontör kazancı (${creditsNeeded} kontör)`,
      createdAt,
    });
  });

  const payment = await prisma.customerProviderPayment.findUniqueOrThrow({ where: { id: paymentId } });
  return {
    payment: {
      id: payment.id,
      quoteRequestId: payment.quoteRequestId,
      offerId: payment.offerId,
      walletId: payment.walletId,
      providerId: payment.providerId,
      credits: payment.credits,
      tlEquivalent: payment.tlEquivalent,
      status: payment.status as CustomerProviderPayment["status"],
      createdAt: payment.createdAt.toISOString(),
    },
  };
}

export async function getCustomerPaymentForQuote(quoteId: string) {
  const row = await prisma.customerProviderPayment.findUnique({ where: { quoteRequestId: quoteId } });
  if (!row) return undefined;
  return {
    id: row.id,
    quoteRequestId: row.quoteRequestId,
    offerId: row.offerId,
    walletId: row.walletId,
    providerId: row.providerId,
    credits: row.credits,
    tlEquivalent: row.tlEquivalent,
    status: row.status as CustomerProviderPayment["status"],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createProviderPayoutRequest(
  providerId: string,
  creditsRequested: number,
  bank?: { iban?: string; accountHolder?: string }
): Promise<{ request?: ProviderPayoutRequest; error?: string }> {
  if (creditsRequested < MIN_PAYOUT_CREDITS) {
    return { error: `Minimum ${MIN_PAYOUT_CREDITS} kontör ile talep oluşturabilirsiniz.` };
  }

  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider || provider.status !== "approved") {
    return { error: "Usta hesabı onaylı değil." };
  }

  const balance = provider.creditBalance ?? 0;
  if (balance < creditsRequested) {
    return { error: `Yetersiz kontör. Kullanılabilir: ${balance}` };
  }

  const period = currentCreditPeriod();
  const openRequest = await prisma.providerPayoutRequest.findFirst({
    where: {
      providerId,
      period,
      status: { in: ["pending", "approved"] },
    },
  });
  if (openRequest) {
    return { error: "Bu ay için bekleyen bir ödeme talebiniz var." };
  }

  const iban = bank?.iban?.replace(/\s/g, "") ?? provider.iban ?? undefined;
  const accountHolder = bank?.accountHolder ?? provider.accountHolder ?? undefined;
  if (!iban || iban.length < 15) {
    return { error: "Geçerli IBAN girin." };
  }

  const amounts = computePayoutAmounts(creditsRequested);
  const id = generateId();
  const requestedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.provider.update({
      where: { id: providerId },
      data: {
        creditBalance: { decrement: creditsRequested },
        iban,
        accountHolder: accountHolder ?? null,
      },
    });
    await tx.providerPayoutRequest.create({
      data: {
        id,
        providerId,
        period,
        creditsRequested,
        grossAmount: amounts.grossAmount,
        feeAmount: amounts.feeAmount,
        netAmount: amounts.netAmount,
        status: "pending",
        iban,
        accountHolder: accountHolder ?? null,
        requestedAt,
      },
    });
    await appendCreditLedger(tx, {
      type: "provider_payout_request",
      creditsDelta: -creditsRequested,
      tlAmount: amounts.grossAmount,
      providerId,
      referenceId: id,
      description: `Nakit ödeme talebi (${creditsRequested} kontör, %3 kesinti)`,
      createdAt: requestedAt,
    });
    await appendCreditLedger(tx, {
      type: "provider_payout_fee",
      creditsDelta: 0,
      tlAmount: amounts.feeAmount,
      providerId,
      referenceId: id,
      description: `Nakit ödeme platform kesintisi (%3)`,
      createdAt: requestedAt,
    });
  });

  const row = await prisma.providerPayoutRequest.findUniqueOrThrow({ where: { id } });
  return { request: toPayout(row) };
}

export async function getProviderPayoutRequests(providerId: string): Promise<ProviderPayoutRequest[]> {
  const rows = await prisma.providerPayoutRequest.findMany({
    where: { providerId },
    orderBy: { requestedAt: "desc" },
  });
  return rows.map(toPayout);
}

export async function getPendingProviderPayouts(): Promise<
  (ProviderPayoutRequest & { providerName: string; providerPhone: string })[]
> {
  const rows = await prisma.providerPayoutRequest.findMany({
    where: { status: { in: ["pending", "approved"] } },
    include: { provider: true },
    orderBy: { requestedAt: "asc" },
  });
  return rows.map((r) => ({
    ...toPayout(r),
    providerName: r.provider.name,
    providerPhone: r.provider.phone,
  }));
}

export async function approveProviderPayout(payoutId: string): Promise<{ request?: ProviderPayoutRequest; error?: string }> {
  const row = await prisma.providerPayoutRequest.findUnique({ where: { id: payoutId } });
  if (!row) return { error: "Talep bulunamadı." };
  if (row.status !== "pending") return { error: "Talep onaylanamaz." };

  const updated = await prisma.providerPayoutRequest.update({
    where: { id: payoutId },
    data: { status: "approved" },
  });
  return { request: toPayout(updated) };
}

export async function markProviderPayoutPaid(payoutId: string): Promise<{ request?: ProviderPayoutRequest; error?: string }> {
  const row = await prisma.providerPayoutRequest.findUnique({ where: { id: payoutId } });
  if (!row) return { error: "Talep bulunamadı." };
  if (row.status !== "approved" && row.status !== "pending") {
    return { error: "Talep ödenemez." };
  }

  const processedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.providerPayoutRequest.update({
      where: { id: payoutId },
      data: { status: "paid", processedAt },
    });
    await appendCreditLedger(tx, {
      type: "provider_payout_paid",
      creditsDelta: 0,
      tlAmount: row.netAmount,
      providerId: row.providerId,
      referenceId: payoutId,
      description: `Usta nakit ödemesi tamamlandı (${row.netAmount} TL net)`,
      createdAt: processedAt,
    });
  });

  const updated = await prisma.providerPayoutRequest.findUniqueOrThrow({ where: { id: payoutId } });
  return { request: toPayout(updated) };
}

export async function rejectProviderPayout(
  payoutId: string,
  note?: string
): Promise<{ request?: ProviderPayoutRequest; error?: string }> {
  const row = await prisma.providerPayoutRequest.findUnique({ where: { id: payoutId } });
  if (!row) return { error: "Talep bulunamadı." };
  if (row.status !== "pending" && row.status !== "approved") {
    return { error: "Talep reddedilemez." };
  }

  const processedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.provider.update({
      where: { id: row.providerId },
      data: { creditBalance: { increment: row.creditsRequested } },
    });
    await tx.providerPayoutRequest.update({
      where: { id: payoutId },
      data: { status: "rejected", adminNote: note ?? null, processedAt },
    });
    await appendCreditLedger(tx, {
      type: "admin_adjustment",
      creditsDelta: row.creditsRequested,
      providerId: row.providerId,
      referenceId: payoutId,
      description: `Reddedilen ödeme talebi — kontör iadesi`,
      createdAt: processedAt,
    });
  });

  const updated = await prisma.providerPayoutRequest.findUniqueOrThrow({ where: { id: payoutId } });
  return { request: toPayout(updated) };
}

export async function getCreditLedgerEntries(limit = 100): Promise<CreditLedgerEntry[]> {
  const rows = await prisma.creditLedgerEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toLedger);
}

export async function getCreditSettlementSummary(period?: string) {
  const p = period ?? currentCreditPeriod();
  const entries = await prisma.creditLedgerEntry.findMany({ where: { period: p } });

  let customerPurchasesTl = 0;
  let customerPaymentsCredits = 0;
  let providerOfferSpend = 0;
  let payoutNetTl = 0;
  let payoutFeesTl = 0;
  let payoutCredits = 0;

  for (const e of entries) {
    switch (e.type) {
      case "customer_purchase":
        customerPurchasesTl += e.tlAmount ?? 0;
        break;
      case "customer_payment":
        if (e.creditsDelta > 0) customerPaymentsCredits += e.creditsDelta;
        break;
      case "provider_offer_spend":
        providerOfferSpend += Math.abs(e.creditsDelta);
        break;
      case "provider_payout_request":
        payoutCredits += Math.abs(e.creditsDelta);
        break;
      case "provider_payout_paid":
        payoutNetTl += e.tlAmount ?? 0;
        break;
      case "provider_payout_fee":
        payoutFeesTl += e.tlAmount ?? 0;
        break;
    }
  }

  return {
    period: p,
    periodLabel: formatPeriodLabel(p),
    customerPurchasesTl,
    customerPaymentsCredits,
    providerOfferSpend,
    payoutCredits,
    payoutNetTl,
    payoutFeesTl,
    entryCount: entries.length,
  };
}
