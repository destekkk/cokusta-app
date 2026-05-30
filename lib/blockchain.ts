import { createHash } from "crypto";

export const GENESIS_HASH = "0".repeat(64);

export function computeBlockHash(
  index: number,
  timestamp: string,
  certificateId: string,
  data: string,
  previousHash: string
): string {
  return createHash("sha256")
    .update(`${index}${timestamp}${certificateId}${data}${previousHash}`)
    .digest("hex");
}

export function buildCertificatePayload(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}

export function verifyBlockChain(
  blocks: Array<{
    index: number;
    timestamp: string;
    certificateId: string;
    data: string;
    previousHash: string;
    hash: string;
  }>
): { valid: boolean; brokenAt?: number } {
  if (blocks.length === 0) return { valid: true };

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const expectedHash = computeBlockHash(
      block.index,
      block.timestamp,
      block.certificateId,
      block.data,
      block.previousHash
    );

    if (block.hash !== expectedHash) {
      return { valid: false, brokenAt: block.index };
    }

    if (i === 0) {
      if (block.previousHash !== GENESIS_HASH) {
        return { valid: false, brokenAt: block.index };
      }
    } else if (block.previousHash !== blocks[i - 1].hash) {
      return { valid: false, brokenAt: block.index };
    }
  }

  return { valid: true };
}

export function formatPeriodLabel(period: string): string {
  const [year, month] = period.split("-");
  const months = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];
  const monthIndex = Number(month) - 1;
  return `${months[monthIndex] ?? month} ${year}`;
}

export function currentPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
