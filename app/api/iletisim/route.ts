import { NextResponse } from "next/server";
import { companyInfo } from "@/lib/data/company";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !subject || message.length < 10) {
      return NextResponse.json(
        { error: "Ad, e-posta, konu ve en az 10 karakterlik mesaj zorunludur." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
    }

    console.info("[iletisim]", {
      to: companyInfo.email,
      name,
      email,
      phone,
      subject,
      message,
      at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Mesaj işlenemedi." }, { status: 500 });
  }
}
