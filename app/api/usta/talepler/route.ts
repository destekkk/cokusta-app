import { NextResponse } from "next/server";
import { getOpenQuotesForProvider, getProviderById } from "@/lib/db";
import { getProviderSessionId } from "@/lib/provider-auth";

export async function GET() {
  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const provider = await getProviderById(providerId);
  if (!provider || provider.status !== "approved") {
    return NextResponse.json({ error: "Hesap onaylı değil." }, { status: 403 });
  }

  const quotes = await getOpenQuotesForProvider(providerId);
  return NextResponse.json({ quotes, creditBalance: provider.creditBalance ?? 0 });
}
