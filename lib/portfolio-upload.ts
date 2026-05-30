import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024;

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function extensionForType(type: string): string {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  return "webp";
}

function validateImage(file: File): void {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Sadece JPG, PNG veya WebP yükleyebilirsiniz.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Dosya boyutu en fazla 5 MB olabilir.");
  }
}

async function saveToLocalDisk(providerId: string, file: File): Promise<string> {
  const ext = extensionForType(file.type);
  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "portfolio", providerId);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/portfolio/${providerId}/${filename}`;
}

async function saveToVercelBlob(providerId: string, file: File): Promise<string> {
  const { put } = await import("@vercel/blob");
  const ext = extensionForType(file.type);
  const filename = `portfolio/${providerId}/${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return blob.url;
}

export async function savePortfolioImage(
  providerId: string,
  file: File
): Promise<string> {
  validateImage(file);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return saveToVercelBlob(providerId, file);
  }

  return saveToLocalDisk(providerId, file);
}

export const MAX_PORTFOLIO_ITEMS = 12;
