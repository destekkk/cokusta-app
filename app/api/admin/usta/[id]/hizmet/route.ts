import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { addProviderPlatformPurchase } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { serviceSlug, serviceName, amount, status } = body;

    if (!serviceSlug || !serviceName || !amount) {
      return NextResponse.json({ error: "Eksik bilgi." }, { status: 400 });
    }

    const updated = await addProviderPlatformPurchase(id, {
      serviceSlug,
      serviceName,
      amount: Number(amount),
      status: status ?? "active",
    });

    if (!updated) {
      return NextResponse.json({ error: "Usta bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, provider: updated });
  } catch {
    return NextResponse.json({ error: "Kayıt başarısız." }, { status: 500 });
  }
}
