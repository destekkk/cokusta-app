import { NextResponse } from "next/server";
import { activateProviderBorcKredisi, getProviderById } from "@/lib/db";
import { getProviderSessionId } from "@/lib/provider-auth";

export async function POST() {
  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const provider = await getProviderById(providerId);
  if (!provider || provider.status !== "approved") {
    return NextResponse.json({ error: "Hesap onaylı değil." }, { status: 403 });
  }

  const result = await activateProviderBorcKredisi(providerId);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    creditBalance: result.creditBalance,
    creditDebt: result.creditDebt,
    borcKredisiAktif: result.borcKredisiAktif,
  });
}
