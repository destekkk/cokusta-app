import { NextResponse } from "next/server";
import { adminMutationJson } from "@/lib/admin-api-response";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { adminMatchQuoteToProvider } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const providerId = String(body.providerId ?? "").trim();

    if (!providerId) {
      return NextResponse.json({ error: "Usta seçin." }, { status: 400 });
    }

    const result = await adminMatchQuoteToProvider(id, providerId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return adminMutationJson({ success: true, request: result.quote });
  } catch {
    return NextResponse.json({ error: "Eşleştirme başarısız." }, { status: 500 });
  }
}
