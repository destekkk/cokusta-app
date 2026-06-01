import { NextResponse } from "next/server";
import { getProviderSessionId } from "@/lib/provider-auth";
import { getProviderOffersByProviderId } from "@/lib/db";

export async function GET() {
  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const items = await getProviderOffersByProviderId(providerId);
  return NextResponse.json({ offers: items });
}
