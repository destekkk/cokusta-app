import { NextResponse } from "next/server";
import { createQuoteRequest } from "@/lib/db";
import { getCategoryName } from "@/lib/data/categories";
import { getServiceBySlug } from "@/lib/data/services";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      serviceSlug,
      answers,
      city,
      district,
      name,
      phone,
      email,
      notes,
      urgent,
    } = body;

    if (!serviceSlug || !city || !name || !phone) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 }
      );
    }

    const description = String(notes ?? "").trim();
    if (description.length < 15) {
      return NextResponse.json(
        { error: "İş açıklaması zorunludur (en az 15 karakter)." },
        { status: 400 }
      );
    }

    const service = getServiceBySlug(serviceSlug);
    if (!service) {
      return NextResponse.json({ error: "Hizmet bulunamadı." }, { status: 404 });
    }

    const quoteRequest = await createQuoteRequest({
      serviceSlug,
      serviceName: service.name,
      categoryName: getCategoryName(service.categorySlug),
      answers: answers ?? {},
      city,
      district: district ?? "",
      name,
      phone,
      email: email ?? "",
      notes: description,
      urgent: Boolean(urgent),
    });

    return NextResponse.json({
      success: true,
      id: quoteRequest.id,
      priorityListing: quoteRequest.priorityListing ?? false,
      launchMemberNumber: quoteRequest.launchMemberNumber,
      urgent: quoteRequest.urgent ?? false,
      urgentDeadline: quoteRequest.urgentDeadline,
    });
  } catch {
    return NextResponse.json(
      { error: "Teklif kaydedilemedi." },
      { status: 500 }
    );
  }
}
