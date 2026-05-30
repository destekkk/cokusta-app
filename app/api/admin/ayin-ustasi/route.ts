import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { selectProviderOfTheMonth } from "@/lib/db";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { providerId, period, reason } = body;

    if (!providerId) {
      return NextResponse.json({ error: "Usta seçimi zorunlu." }, { status: 400 });
    }

    const result = await selectProviderOfTheMonth(providerId, { period, reason });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ayın ustası seçilemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
