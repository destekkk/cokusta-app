import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createQuoteRequest } from "@/lib/db";
import { getCategoryName } from "@/lib/data/categories";
import { getServiceBySlug } from "@/lib/data/services";
import { attachCustomerSessionCookie } from "@/lib/customer-auth";
import { getCustomerAuthByPhone, setCustomerPinIfUnset } from "@/lib/customer-pin";
import { CUSTOMER_COOKIE, parseCustomerSessionToken } from "@/lib/customer-session";
import { isValidProviderPhone, normalizeProviderPhone, phonesEqual } from "@/lib/phone-utils";
import { validateProviderPin, verifyProviderPin } from "@/lib/provider-pin";

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
      pin,
      pinConfirm,
    } = body;

    if (!serviceSlug || !city || !name || !phone) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 }
      );
    }

    if (!isValidProviderPhone(String(phone))) {
      return NextResponse.json({ error: "Geçerli telefon numarası girin." }, { status: 400 });
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

    const normalizedPhone = normalizeProviderPhone(String(phone));
    const cookieStore = await cookies();
    const sessionPhone = await parseCustomerSessionToken(
      cookieStore.get(CUSTOMER_COOKIE)?.value
    );
    const sessionMatchesPhone =
      Boolean(sessionPhone) && phonesEqual(sessionPhone!, normalizedPhone);

    if (!sessionMatchesPhone) {
      const pinCheck = validateProviderPin(String(pin ?? ""));
      if (!pinCheck.ok) {
        return NextResponse.json({ error: pinCheck.error }, { status: 400 });
      }

      const auth = await getCustomerAuthByPhone(normalizedPhone);
      if (auth.pinHash) {
        if (!verifyProviderPin(String(pin), auth.pinHash)) {
          return NextResponse.json(
            { error: "Giriş şifreniz hatalı. Tekliflerim paneline girdiğiniz şifreyi kullanın." },
            { status: 401 }
          );
        }
      } else if (String(pin) !== String(pinConfirm ?? "")) {
        return NextResponse.json({ error: "Giriş şifreleri eşleşmiyor." }, { status: 400 });
      }
    }

    const quoteRequest = await createQuoteRequest({
      serviceSlug,
      serviceName: service.name,
      categoryName: getCategoryName(service.categorySlug),
      answers: answers ?? {},
      city,
      district: district ?? "",
      name,
      phone: normalizedPhone,
      email: email ?? "",
      notes: description,
      urgent: Boolean(urgent),
    });

    if (!sessionMatchesPhone) {
      const authAfter = await getCustomerAuthByPhone(normalizedPhone);
      if (!authAfter.pinHash) {
        const saved = await setCustomerPinIfUnset(normalizedPhone, String(pin));
        if (!saved) {
          return NextResponse.json({ error: "Giriş şifresi kaydedilemedi." }, { status: 500 });
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      id: quoteRequest.id,
      priorityListing: quoteRequest.priorityListing ?? false,
      launchMemberNumber: quoteRequest.launchMemberNumber,
      urgent: quoteRequest.urgent ?? false,
      urgentDeadline: quoteRequest.urgentDeadline,
    });
    if (!sessionMatchesPhone) {
      await attachCustomerSessionCookie(response, normalizedPhone);
    }
    return response;
  } catch {
    return NextResponse.json(
      { error: "Teklif kaydedilemedi." },
      { status: 500 }
    );
  }
}
