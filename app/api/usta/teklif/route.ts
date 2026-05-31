import { NextResponse } from "next/server";
import { submitProviderOffer } from "@/lib/db";
import { getProviderSessionId } from "@/lib/provider-auth";

export async function POST(request: Request) {
  const providerId = await getProviderSessionId();
  if (!providerId) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { quoteRequestId, price, message, estimatedDays } = body;
    if (!quoteRequestId) {
      return NextResponse.json({ error: "Talep seçilmedi." }, { status: 400 });
    }

    const result = await submitProviderOffer(
      providerId,
      String(quoteRequestId),
      Number(price),
      String(message ?? ""),
      estimatedDays ? Number(estimatedDays) : undefined
    );

    if (result.error) {
      const status = result.code === "INSUFFICIENT_CREDITS" ? 402 : 400;
      return NextResponse.json(
        {
          error: result.error,
          code: result.code,
          redirect: result.code === "INSUFFICIENT_CREDITS" ? "/usta/kontor" : undefined,
        },
        { status }
      );
    }

    return NextResponse.json({ success: true, offer: result.offer });
  } catch {
    return NextResponse.json({ error: "Teklif gönderilemedi." }, { status: 500 });
  }
}
