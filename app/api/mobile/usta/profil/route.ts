import { NextResponse } from "next/server";
import { getDistricts } from "@/lib/data/cities";
import { getProviderById } from "@/lib/db";
import { getProviderSessionIdFromRequest } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  const providerId = await getProviderSessionIdFromRequest(request);
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const provider = await getProviderById(providerId);
  if (!provider || provider.status !== "approved") {
    return NextResponse.json({ error: "Hesap onaylı değil." }, { status: 403 });
  }

  return NextResponse.json({
    provider: {
      id: provider.id,
      name: provider.name,
      city: provider.city,
      categorySlugs: provider.categorySlugs,
      creditBalance: provider.creditBalance ?? 0,
    },
    districts: getDistricts(provider.city),
  });
}
