import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createTaxDeclaration } from "@/lib/db";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const declaration = await createTaxDeclaration(body.period);

    if (!declaration) {
      return NextResponse.json(
        { error: "Bu dönem için fatura bulunamadı. Önce fatura kesin." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, declaration });
  } catch {
    return NextResponse.json({ error: "Beyanname oluşturulamadı." }, { status: 500 });
  }
}
