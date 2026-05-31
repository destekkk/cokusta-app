export function getIyzicoConfig() {
  const apiKey = process.env.IYZICO_API_KEY?.trim();
  const secretKey = process.env.IYZICO_SECRET_KEY?.trim();
  const baseUrl =
    process.env.IYZICO_BASE_URL?.trim() || "https://sandbox-api.iyzipay.com";

  return { apiKey, secretKey, baseUrl, configured: Boolean(apiKey && secretKey) };
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function getIyzicoCallbackUrl(): string {
  return `${getSiteUrl()}/api/odeme/iyzico/callback`;
}
