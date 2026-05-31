import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import type { Store } from "../lib/types";
import {
  invoiceReferenceType,
  providerStatus,
  purchaseStatus,
  quoteStatus,
} from "../lib/db/mappers";

const prisma = new PrismaClient();

async function loadStore(): Promise<Store> {
  const storePath = path.join(process.cwd(), "data", "store.json");
  const raw = await fs.readFile(storePath, "utf-8");
  return JSON.parse(raw) as Store;
}

async function main() {
  const store = await loadStore();

  console.log("Mevcut veriler temizleniyor...");
  await prisma.providerOfTheMonth.deleteMany();
  await prisma.certificateBlock.deleteMany();
  await prisma.providerCertificate.deleteMany();
  await prisma.taxDeclaration.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.providerPlatformPurchase.deleteMany();
  await prisma.providerPortfolioItem.deleteMany();
  await prisma.quoteRequest.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.customer.deleteMany();

  console.log(`${store.providers.length} usta aktarılıyor...`);
  for (const provider of store.providers) {
    await prisma.provider.create({
      data: {
        id: provider.id,
        name: provider.name,
        phone: provider.phone,
        email: provider.email,
        city: provider.city,
        categorySlugs: provider.categorySlugs,
        experience: provider.experience,
        bio: provider.bio,
        createdAt: new Date(provider.createdAt),
        status: providerStatus(provider.status),
        reviewedAt: provider.reviewedAt ? new Date(provider.reviewedAt) : null,
        rejectionReason: provider.rejectionReason ?? null,
        creditBalance: provider.creditBalance ?? 0,
        creditDebt: provider.creditDebt ?? 0,
        launchMemberNumber: provider.launchMemberNumber ?? null,
        launchBonusGranted: provider.launchBonusGranted ?? false,
        portfolio: {
          create: (provider.portfolio ?? []).map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            serviceSlug: item.serviceSlug ?? null,
            createdAt: new Date(item.createdAt),
          })),
        },
        platformPurchases: {
          create: (provider.platformPurchases ?? []).map((purchase) => ({
            id: purchase.id,
            serviceSlug: purchase.serviceSlug,
            serviceName: purchase.serviceName,
            amount: purchase.amount,
            purchasedAt: new Date(purchase.purchasedAt),
            status: purchaseStatus(purchase.status),
            invoiceId: purchase.invoiceId ?? null,
          })),
        },
      },
    });
  }

  console.log(`${store.customers.length} müşteri aktarılıyor...`);
  if (store.customers.length > 0) {
    await prisma.customer.createMany({
      data: store.customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        city: customer.city,
        notes: customer.notes ?? null,
        createdAt: new Date(customer.createdAt),
      })),
    });
  }

  console.log(`${store.quoteRequests.length} teklif talebi aktarılıyor...`);
  for (const quote of store.quoteRequests) {
    await prisma.quoteRequest.create({
      data: {
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
        status: quoteStatus(quote.status),
        matchedProviderId: quote.matchedProviderId ?? null,
        matchedProviderName: quote.matchedProviderName ?? null,
        jobValue: quote.jobValue ?? null,
        commissionRate: quote.commissionRate ?? null,
        commissionAmount: quote.commissionAmount ?? null,
        completedAt: quote.completedAt ? new Date(quote.completedAt) : null,
        invoiceId: quote.invoiceId ?? null,
        priorityListing: quote.priorityListing ?? false,
        launchMemberNumber: quote.launchMemberNumber ?? null,
        urgent: quote.urgent ?? false,
        urgentDeadline: quote.urgentDeadline ? new Date(quote.urgentDeadline) : null,
      },
    });
  }

  console.log(`${store.invoices.length} fatura aktarılıyor...`);
  if (store.invoices.length > 0) {
    await prisma.invoice.createMany({
      data: store.invoices.map((invoice) => ({
        id: invoice.id,
        invoiceNo: invoice.invoiceNo,
        referenceType: invoiceReferenceType(invoice.referenceType),
        referenceId: invoice.referenceId,
        recipientName: invoice.recipientName,
        recipientEmail: invoice.recipientEmail ?? null,
        recipientPhone: invoice.recipientPhone ?? null,
        description: invoice.description,
        subtotal: invoice.subtotal,
        vatRate: invoice.vatRate,
        vatAmount: invoice.vatAmount,
        total: invoice.total,
        period: invoice.period,
        issuedAt: new Date(invoice.issuedAt),
      })),
    });
  }

  console.log(`${store.taxDeclarations.length} beyanname aktarılıyor...`);
  if (store.taxDeclarations.length > 0) {
    await prisma.taxDeclaration.createMany({
      data: store.taxDeclarations.map((declaration) => ({
        id: declaration.id,
        period: declaration.period,
        periodLabel: declaration.periodLabel,
        invoiceCount: declaration.invoiceCount,
        taxableBase: declaration.taxableBase,
        calculatedVat: declaration.calculatedVat,
        totalAmount: declaration.totalAmount,
        createdAt: new Date(declaration.createdAt),
      })),
    });
  }

  console.log(`${store.certificateLedger.length} blockchain bloğu aktarılıyor...`);
  for (const block of store.certificateLedger) {
    await prisma.certificateBlock.create({
      data: {
        index: block.index,
        timestamp: new Date(block.timestamp),
        certificateId: block.certificateId,
        data: block.data,
        previousHash: block.previousHash,
        hash: block.hash,
      },
    });
  }

  console.log(`${store.providerCertificates.length} sertifika aktarılıyor...`);
  for (const cert of store.providerCertificates) {
    await prisma.providerCertificate.create({
      data: {
        id: cert.id,
        providerId: cert.providerId,
        providerName: cert.providerName,
        type: cert.type,
        title: cert.title,
        description: cert.description,
        period: cert.period ?? null,
        issuedAt: new Date(cert.issuedAt),
        blockIndex: cert.blockIndex,
        blockHash: cert.blockHash,
        previousHash: cert.previousHash,
        metadata: cert.metadata,
      },
    });
  }

  console.log(`${store.providerOfTheMonthHistory.length} ayın ustası kaydı aktarılıyor...`);
  for (const entry of store.providerOfTheMonthHistory) {
    await prisma.providerOfTheMonth.create({
      data: {
        period: entry.period,
        periodLabel: entry.periodLabel,
        providerId: entry.providerId,
        providerName: entry.providerName,
        certificateId: entry.certificateId,
        selectedAt: new Date(entry.selectedAt),
        reason: entry.reason ?? null,
      },
    });
  }

  console.log("Seed tamamlandı.");
}

main()
  .catch((error) => {
    console.error("Seed hatası:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
