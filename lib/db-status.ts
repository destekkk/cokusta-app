import { isDatabaseEnabled } from "@/lib/db/config";
import { prisma } from "@/lib/prisma";

export type DbPingResult = {
  ok: boolean;
  message?: string;
};

export async function pingDatabase(): Promise<DbPingResult> {
  if (!isDatabaseEnabled()) {
    return {
      ok: false,
      message: "DATABASE_URL tanımlı değil. Vercel ortam değişkenlerini kontrol edin.",
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Veritabanına bağlanılamıyor.";
    return { ok: false, message };
  }
}
