import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "cokusta_usta_token";
const DISTRICT_KEY = "cokusta_alert_district";

export function getApiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL ?? "https://cokusta.com";
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
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${getApiBaseUrl()}${path}`, { ...init, headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "İstek başarısız");
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
