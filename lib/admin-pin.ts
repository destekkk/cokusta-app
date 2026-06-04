import { hashProviderPin, validateNewPin } from "@/lib/provider-pin";

export type AdminPinParseResult =
  | { action: "skip" }
  | { action: "set"; pinHash: string }
  | { action: "error"; error: string };

export function parseAdminPinReset(pin: unknown, pinConfirm: unknown): AdminPinParseResult {
  const p = String(pin ?? "").trim();
  const c = String(pinConfirm ?? "").trim();

  if (!p && !c) {
    return { action: "skip" };
  }

  if (p !== c) {
    return { action: "error", error: "Giriş şifreleri eşleşmiyor." };
  }

  const check = validateNewPin(p);
  if (!check.ok) {
    return { action: "error", error: check.error };
  }

  return { action: "set", pinHash: hashProviderPin(p) };
}
