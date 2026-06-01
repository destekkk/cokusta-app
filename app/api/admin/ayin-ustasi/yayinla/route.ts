import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { publishProviderOfTheMonth } from "@/lib/db";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const { period } = await request.json();
    if (!period) {
      return NextResponse.json({ error: "Dönem zorunlu." }, { status: 400 });
    }

    const selection = await publishProviderOfTheMonth(String(period));

    return NextResponse.json({
      success: true,
      selection,
      creditsGranted: selection.creditsAwarded,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Yayınlanamadı.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
