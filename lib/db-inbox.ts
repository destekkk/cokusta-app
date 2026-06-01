import type { ProviderInboxMessage } from "@/lib/types";
import { generateId } from "@/lib/id";
import { prisma } from "@/lib/prisma";

function toMessage(row: {
  id: string;
  providerId: string;
  type: string;
  title: string;
  body: string;
  quoteRequestId: string | null;
  read: boolean;
  createdAt: Date;
}): ProviderInboxMessage {
  return {
    id: row.id,
    providerId: row.providerId,
    type: row.type,
    title: row.title,
    body: row.body,
    quoteRequestId: row.quoteRequestId ?? undefined,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createProviderInboxMessage(input: {
  providerId: string;
  type: string;
  title: string;
  body: string;
  quoteRequestId?: string;
}) {
  const row = await prisma.providerInboxMessage.create({
    data: {
      id: generateId(),
      providerId: input.providerId,
      type: input.type,
      title: input.title,
      body: input.body,
      quoteRequestId: input.quoteRequestId ?? null,
      createdAt: new Date(),
    },
  });
  return toMessage(row);
}

export async function getProviderInboxMessages(
  providerId: string,
  limit = 20
): Promise<ProviderInboxMessage[]> {
  const rows = await prisma.providerInboxMessage.findMany({
    where: { providerId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toMessage);
}

export async function getProviderUnreadMessageCount(providerId: string): Promise<number> {
  return prisma.providerInboxMessage.count({
    where: { providerId, read: false },
  });
}

export async function markProviderMessagesRead(providerId: string, ids?: string[]) {
  await prisma.providerInboxMessage.updateMany({
    where: ids?.length
      ? { providerId, id: { in: ids } }
      : { providerId, read: false },
    data: { read: true },
  });
}
