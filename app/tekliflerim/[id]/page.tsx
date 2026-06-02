import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomerOffersPanel from "@/components/CustomerOffersPanel";
import CustomerPanelHeader from "@/components/CustomerPanelHeader";
import { getQuoteRequestById } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function CustomerOffersPage({ params }: Props) {
  const { id } = await params;
  const quote = await getQuoteRequestById(id);
  if (!quote) notFound();

  const location = `${quote.city}${quote.district ? `, ${quote.district}` : ""}`;

  return (
    <div className="min-h-full bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <CustomerPanelHeader
          title="Tekliflerim"
          subtitle={`${quote.serviceName} · ${location} · Talep No: ${quote.id}`}
          backHref="/musteri/teklifler"
          showNewRequest={false}
        />
        <div className="mt-8">
          <CustomerOffersPanel quoteId={quote.id} serviceName={quote.serviceName} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
