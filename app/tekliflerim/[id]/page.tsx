import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomerOffersPanel from "@/components/CustomerOffersPanel";
import { getQuoteRequestById } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function CustomerOffersPage({ params }: Props) {
  const { id } = await params;
  const quote = await getQuoteRequestById(id);
  if (!quote) notFound();

  return (
    <div className="min-h-full bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Link
          href="/musteri/teklifler"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Tüm taleplerim
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Tekliflerim</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {quote.serviceName} · {quote.city}
          {quote.district ? `, ${quote.district}` : ""}
        </p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">Talep No: {quote.id}</p>
        <div className="mt-8">
          <CustomerOffersPanel quoteId={quote.id} serviceName={quote.serviceName} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
