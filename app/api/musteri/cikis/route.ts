import { NextResponse } from "next/server";
import { clearCustomerSession } from "@/lib/customer-auth";

export async function POST() {
  try {
    await clearCustomerSession();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Çıkış başarısız." }, { status: 500 });
  }
}
