import { NextResponse } from "next/server";
import { isLemonSqueezyConfigured } from "@/lib/lemonsqueezy/config";

export async function GET() {
  return NextResponse.json({
    lemonSqueezy: isLemonSqueezyConfigured(),
    providerCredit: isLemonSqueezyConfigured(),
  });
}
