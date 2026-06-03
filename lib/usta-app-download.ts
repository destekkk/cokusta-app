import fs from "fs";
import path from "path";
import { resolveSiteUrl } from "@/lib/seo/site-url";

/** Canlı APK — Vercel env ile Expo build URL'si de verilebilir. */
export const USTA_APK_DOWNLOAD_PATH = "/downloads/cokusta-usta.apk";

const LOCAL_APK_PATH = path.join(process.cwd(), "public", "downloads", "cokusta-usta.apk");

/** APK indirilebilir mi? (env URL veya repodaki dosya) */
export function isUstaApkPublished(): boolean {
  const external = process.env.NEXT_PUBLIC_USTA_APK_URL?.trim();
  if (external) return true;
  try {
    return fs.existsSync(LOCAL_APK_PATH);
  } catch {
    return false;
  }
}

export function getUstaApkDownloadUrl(): string {
  const external = process.env.NEXT_PUBLIC_USTA_APK_URL?.trim();
  if (external) return external;
  return `${resolveSiteUrl()}${USTA_APK_DOWNLOAD_PATH}`;
}

export function isExternalApkUrl(url: string): boolean {
  return url.startsWith("http") && !url.includes("/downloads/cokusta-usta.apk");
}

export const USTA_APP_VERSION = "1.0.0";
