import { NextResponse } from "next/server";
import { getCustomerSessionPhone } from "@/lib/customer-auth";
import { getCustomerWalletByPhone } from "@/lib/db-credits";
import { isDatabaseEnabled } from "@/lib/db/config";

export async function GET() {
  if (!isDatabaseEnabled()) {
    return NextResponse.json({ error: "Veritabanı gerekli." }, { status: 503 });
  }

  const phone = await getCustomerSessionPhone();
  if (!phone) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const wallet = await getCustomerWalletByPhone(phone);
  return NextResponse.json({
    creditBalance: wallet?.creditBalance ?? 0,
    phone,
  });
}
