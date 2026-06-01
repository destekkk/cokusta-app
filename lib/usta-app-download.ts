/** Canlı APK — Vercel env ile Expo build URL'si de verilebilir. */
export const USTA_APK_DOWNLOAD_PATH = "/downloads/cokusta-usta.apk";

export function getUstaApkDownloadUrl(): string {
  const external = process.env.NEXT_PUBLIC_USTA_APK_URL?.trim();
  if (external) return external;
  return USTA_APK_DOWNLOAD_PATH;
}

export const USTA_APP_VERSION = "1.0.0";
