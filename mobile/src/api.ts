import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const TOKEN_KEY = "cokusta_usta_token";
const DISTRICT_KEY = "cokusta_alert_district";

const DEFAULT_API = "https://www.cokusta.com";

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const fromExtra = Constants.expoConfig?.extra?.apiUrl;
  if (typeof fromExtra === "string" && fromExtra.startsWith("http")) {
    return fromExtra.replace(/\/$/, "");
  }
  return DEFAULT_API;
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getAlertDistrict(): Promise<string | null> {
  return AsyncStorage.getItem(DISTRICT_KEY);
}

export async function setAlertDistrict(district: string): Promise<void> {
  await AsyncStorage.setItem(DISTRICT_KEY, district);
}

export type ProviderProfile = {
  id: string;
  name: string;
  city: string;
  categorySlugs: string[];
  creditBalance: number;
  creditDebt?: number;
};

export type KontorPackage = {
  slug: string;
  name: string;
  credits: number;
  formattedPrice: string;
  description: string;
  perCredit: number;
  savingsPercent: number;
  badge: string | null;
};

export type QuoteSummary = {
  id: string;
  serviceName: string;
  city: string;
  district: string;
  urgent?: boolean;
  createdAt: string;
  offerCount?: number;
  notes?: string;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}${path}`, { ...init, headers });
  } catch {
    throw new Error("Sunucuya bağlanılamadı. İnternet veya sunucu adresini kontrol edin.");
  }

  const text = await res.text();
  let data: { error?: string } = {};
  if (text) {
    try {
      data = JSON.parse(text) as { error?: string };
    } catch {
      throw new Error(
        res.ok
          ? "Sunucu yanıtı okunamadı."
          : `Sunucu hatası (${res.status}). ${getApiBaseUrl()}`
      );
    }
  }

  if (!res.ok) {
    throw new Error(data.error ?? `İstek başarısız (${res.status})`);
  }
  return data as T;
}

export async function login(phone: string, pin: string) {
  return apiFetch<{ token: string; provider: ProviderProfile }>("/api/mobile/usta/giris", {
    method: "POST",
    body: JSON.stringify({ phone, pin }),
  });
}

export async function fetchProfile() {
  return apiFetch<{ provider: ProviderProfile; districts: string[] }>("/api/mobile/usta/profil");
}

export async function fetchQuotes(district: string) {
  return apiFetch<{ quotes: QuoteSummary[]; district: string; city: string }>(
    `/api/mobile/usta/talepler?district=${encodeURIComponent(district)}`
  );
}

export async function fetchNewQuotes(district: string, since: string) {
  return apiFetch<{ newQuotes: QuoteSummary[]; serverTime: string }>(
    `/api/mobile/usta/yeni-talepler?district=${encodeURIComponent(district)}&since=${encodeURIComponent(since)}`
  );
}

export async function fetchKontorShop() {
  return apiFetch<{
    creditBalance: number;
    creditDebt: number;
    debtSettlementFormatted: string | null;
    packages: KontorPackage[];
  }>("/api/mobile/usta/kontor");
}

export async function startKontorCheckout(packageSlug: string) {
  return apiFetch<{ orderId: string; paymentUrl: string; amount: number; packageName: string }>(
    "/api/mobile/usta/kontor/checkout",
    { method: "POST", body: JSON.stringify({ packageSlug }) }
  );
}

export function getMobilPaymentUrl(token: string): string {
  return `${getApiBaseUrl()}/usta/kontor/mobil?access=${encodeURIComponent(token)}`;
}
