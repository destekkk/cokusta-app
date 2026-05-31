import { NextResponse } from "next/server";
import { clearProviderSession } from "@/lib/provider-auth";

export async function POST() {
  await clearProviderSession();
  return NextResponse.json({ success: true });
}
