/**
 * demo-quote-* önekli talepleri yayına alır.
 * Yeni enum: awaiting_review → open | Eski enum: pending (= yayında)
 *
 * Kullanım: npm run approve:demo-quotes
 */
import { promises as fs } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { approveDemoQuoteRequests } from "../lib/db-json";

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
      // try next
    }
  }
}

async function main() {
  await loadEnvFile();
  const usePrisma = Boolean(process.env.DATABASE_URL?.trim());

  if (usePrisma) {
    const prisma = new PrismaClient();
    try {
      let count = 0;
      try {
        const result = await prisma.quoteRequest.updateMany({
          where: {
            id: { startsWith: "demo-quote-" },
            status: "awaiting_review",
          },
          data: { status: "open" },
        });
        count = result.count;
      } catch {
        count = Number(
          await prisma.$executeRawUnsafe(`
            UPDATE quote_requests SET status = 'pending' WHERE id LIKE 'demo-quote-%'
          `)
        );
      }
      console.log(`${count} demo teklif yayına alındı (PostgreSQL).`);
    } finally {
      await prisma.$disconnect();
    }
  } else {
    const count = await approveDemoQuoteRequests();
    console.log(`${count} demo teklif yayına alındı (store.json).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
