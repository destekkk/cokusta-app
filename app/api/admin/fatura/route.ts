import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createAllPendingInvoices,
  createInvoiceForPurchase,
  createInvoiceForQuote,
} from "@/lib/db";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { quoteId, providerId, purchaseId, all } = body;

    if (all) {
      const invoices = await createAllPendingInvoices();
      return NextResponse.json({ success: true, invoices, count: invoices.length });
    }

    if (quoteId) {
      const invoice = await createInvoiceForQuote(String(quoteId));
      if (!invoice) {
        return NextResponse.json({ error: "Fatura kesilemedi." }, { status: 400 });
      }
      return NextResponse.json({ success: true, invoice });
    }

    if (providerId && purchaseId) {
      const invoice = await createInvoiceForPurchase(String(providerId), String(purchaseId));
      if (!invoice) {
        return NextResponse.json({ error: "Fatura kesilemedi." }, { status: 400 });
      }
      return NextResponse.json({ success: true, invoice });
    }

    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Fatura işlemi başarısız." }, { status: 500 });
  }
}
