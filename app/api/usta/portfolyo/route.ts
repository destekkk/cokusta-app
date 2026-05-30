import { NextResponse } from "next/server";
import {
  addProviderPortfolioItem,
  findApprovedProviderByPhone,
} from "@/lib/db";
import { savePortfolioImage } from "@/lib/portfolio-upload";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const phone = String(formData.get("phone") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const serviceSlug = String(formData.get("serviceSlug") ?? "").trim() || undefined;
    const image = formData.get("image");

    if (!phone || !title || !description) {
      return NextResponse.json(
        { error: "Telefon, proje başlığı ve açıklama zorunlu." },
        { status: 400 }
      );
    }

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json({ error: "Proje fotoğrafı zorunlu." }, { status: 400 });
    }

    const provider = await findApprovedProviderByPhone(phone);
    if (!provider) {
      return NextResponse.json(
        { error: "Bu telefon numarasına kayıtlı onaylı usta bulunamadı." },
        { status: 404 }
      );
    }

    const imageUrl = await savePortfolioImage(provider.id, image);
    const item = await addProviderPortfolioItem(provider.id, {
      title,
      description,
      imageUrl,
      serviceSlug,
    });

    return NextResponse.json({
      success: true,
      item,
      providerId: provider.id,
      providerName: provider.name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Yükleme başarısız.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
