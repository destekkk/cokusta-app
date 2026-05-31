import crypto from "crypto";
import { getIyzicoConfig } from "./config";

type IyzicoResponse = {
  status: string;
  errorCode?: string;
  errorMessage?: string;
  token?: string;
  checkoutFormContent?: string;
  paymentStatus?: string;
  paymentId?: string;
  conversationId?: string;
  basketId?: string;
};

function signRequest(uri: string, body: string, secretKey: string, randomKey: string) {
  const payload = randomKey + uri + body;
  return crypto.createHmac("sha256", secretKey).update(payload, "utf8").digest("hex");
}

async function iyzicoRequest<T extends IyzicoResponse>(
  uri: string,
  body: Record<string, unknown>
): Promise<T> {
  const { apiKey, secretKey, baseUrl, configured } = getIyzicoConfig();
  if (!configured || !apiKey || !secretKey) {
    throw new Error("iyzico API anahtarları tanımlı değil.");
  }

  const randomKey = `${Date.now()}${crypto.randomBytes(8).toString("hex")}`;
  const bodyString = JSON.stringify(body);
  const signature = signRequest(uri, bodyString, secretKey, randomKey);
  const authRaw = `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`;
  const authorization = `IYZWSv2 ${Buffer.from(authRaw, "utf8").toString("base64")}`;

  const res = await fetch(`${baseUrl}${uri}`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
      "x-iyzi-rnd": randomKey,
    },
    body: bodyString,
  });

  const data = (await res.json()) as T;
  if (data.status !== "success") {
    throw new Error(data.errorMessage ?? data.errorCode ?? "iyzico isteği başarısız.");
  }
  return data;
}

function splitName(fullName: string): { name: string; surname: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { name: parts[0], surname: "." };
  return { name: parts.slice(0, -1).join(" "), surname: parts.at(-1) ?? "." };
}

function formatGsm(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length >= 12) return `+${digits.slice(0, 12)}`;
  if (digits.startsWith("0") && digits.length >= 11) return `+90${digits.slice(1, 11)}`;
  if (digits.length === 10) return `+90${digits}`;
  return phone.startsWith("+") ? phone : `+90${digits}`;
}

export type CheckoutBuyer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  ip: string;
};

export async function initializeCreditCheckout(params: {
  conversationId: string;
  basketId: string;
  packageName: string;
  packageSlug: string;
  price: number;
  callbackUrl: string;
  buyer: CheckoutBuyer;
}) {
  const { name, surname } = splitName(params.buyer.name);
  const priceStr = params.price.toFixed(2);
  const address = `${params.buyer.city}, Türkiye`;

  return iyzicoRequest<{
    status: string;
    token: string;
    checkoutFormContent: string;
  }>("/payment/iyzipos/checkoutform/initialize/auth", {
    locale: "tr",
    conversationId: params.conversationId,
    price: priceStr,
    paidPrice: priceStr,
    currency: "TRY",
    basketId: params.basketId,
    paymentGroup: "PRODUCT",
    callbackUrl: params.callbackUrl,
    enabledInstallments: [1],
    buyer: {
      id: params.buyer.id,
      name,
      surname,
      gsmNumber: formatGsm(params.buyer.phone),
      email: params.buyer.email || "destek@cokusta.com",
      identityNumber: "11111111111",
      registrationAddress: address,
      ip: params.buyer.ip,
      city: params.buyer.city,
      country: "Turkey",
      zipCode: "34000",
    },
    shippingAddress: {
      contactName: params.buyer.name,
      city: params.buyer.city,
      country: "Turkey",
      address,
      zipCode: "34000",
    },
    billingAddress: {
      contactName: params.buyer.name,
      city: params.buyer.city,
      country: "Turkey",
      address,
      zipCode: "34000",
    },
    basketItems: [
      {
        id: params.packageSlug,
        name: params.packageName,
        category1: "Platform",
        itemType: "VIRTUAL",
        price: priceStr,
      },
    ],
  });
}

export async function retrieveCheckoutResult(token: string) {
  return iyzicoRequest<IyzicoResponse>("/payment/iyzipos/checkoutform/auth/ecom/detail", {
    locale: "tr",
    token,
  });
}
