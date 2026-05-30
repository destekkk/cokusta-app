import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { issueProviderCertificate } from "@/lib/db";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { providerId, type, reason } = body;

    if (!providerId || !type) {
      return NextResponse.json(
        { error: "Usta ve sertifika türü zorunlu." },
        { status: 400 }
      );
    }

    if (type !== "master_craftsman") {
      return NextResponse.json({ error: "Geçersiz sertifika türü." }, { status: 400 });
    }

    const certificate = await issueProviderCertificate(providerId, "master_craftsman", {
      reason,
    });

    return NextResponse.json({ success: true, certificate });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sertifika oluşturulamadı.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
