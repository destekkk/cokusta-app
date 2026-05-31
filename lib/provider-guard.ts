import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getProviderById } from "@/lib/db";
import { clearProviderSession, getProviderSessionId } from "@/lib/provider-auth";
import type { ProviderRegistration } from "@/lib/types";

export async function requireApprovedProvider(
  loginRedirect = "/usta/giris"
): Promise<ProviderRegistration> {
  const providerId = await getProviderSessionId();
  if (!providerId) redirect(loginRedirect);

  const provider = await getProviderById(providerId);
  if (!provider || provider.status !== "approved") {
    await clearProviderSession();
    if (provider?.status === "pending") {
      redirect(`${loginRedirect}?reason=pending`);
    }
    if (provider?.status === "rejected") {
      redirect(`${loginRedirect}?reason=rejected`);
    }
    redirect(loginRedirect);
  }

  return provider;
}

/** API route'ları için — onaylı usta oturumu zorunlu */
export async function requireApprovedProviderApi():
  Promise<{ providerId: string; provider: ProviderRegistration } | NextResponse> {
  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const provider = await getProviderById(providerId);
  if (!provider || provider.status !== "approved") {
    const message =
      provider?.status === "pending"
        ? "Hesabınız henüz onaylanmadı. Onay sonrası giriş yapabilirsiniz."
        : provider?.status === "rejected"
          ? "Başvurunuz reddedildi."
          : "Hesap onaylı değil.";

    return NextResponse.json(
      {
        error: message,
        code:
          provider?.status === "pending"
            ? "PENDING_APPROVAL"
            : provider?.status === "rejected"
              ? "REJECTED"
              : "NOT_APPROVED",
      },
      { status: 403 }
    );
  }

  return { providerId, provider };
}
