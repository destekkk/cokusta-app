import { notFound } from "next/navigation";
import { getInvoiceById } from "@/lib/db";
import { formatDateTime } from "@/lib/admin-labels";
import { formatMoney, getCompanyInfo } from "@/lib/billing";
import PrintButton from "@/components/admin/PrintButton";

type Props = { params: Promise<{ id: string }> };

export default async function InvoicePrintPage({ params }: Props) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) notFound();

  const company = getCompanyInfo();

  return (
    <div className="min-h-screen bg-white px-6 py-10 text-black print:p-0">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <a href="/admin/muhasebe" className="text-sm text-primary hover:underline">
            ← Muhasebe
          </a>
          <PrintButton />
        </div>

        <div className="border border-gray-300 p-8">
          <div className="flex flex-wrap items-start justify-between gap-6 border-b border-gray-300 pb-6">
            <div>
              <div className="text-2xl font-bold text-primary">çokusta</div>
              <div className="mt-4 text-sm leading-6">
                <div className="font-semibold">{company.name}</div>
                <div>VKN: {company.taxNumber}</div>
                <div>Vergi Dairesi: {company.taxOffice}</div>
                <div>{company.address}</div>
                <div>{company.email}</div>
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="text-lg font-bold">e-ARŞİV FATURA</div>
              <div className="mt-2">Fatura No: {invoice.invoiceNo}</div>
              <div>Tarih: {formatDateTime(invoice.issuedAt)}</div>
              <div>Dönem: {invoice.period}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded border border-gray-200 p-4 text-sm">
              <div className="mb-2 font-semibold uppercase text-gray-500">Alıcı</div>
              <div className="font-medium">{invoice.recipientName}</div>
              {invoice.recipientPhone && <div>{invoice.recipientPhone}</div>}
              {invoice.recipientEmail && <div>{invoice.recipientEmail}</div>}
            </div>
            <div className="rounded border border-gray-200 p-4 text-sm">
              <div className="mb-2 font-semibold uppercase text-gray-500">Fatura Tipi</div>
              <div>
                {invoice.referenceType === "quote"
                  ? "Platform Komisyon Bedeli"
                  : "Platform Hizmet Bedeli"}
              </div>
            </div>
          </div>

          <table className="mt-8 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50">
                <th className="px-3 py-2 text-left">Açıklama</th>
                <th className="px-3 py-2 text-right">Matrah</th>
                <th className="px-3 py-2 text-right">KDV</th>
                <th className="px-3 py-2 text-right">Toplam</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-3 py-4">{invoice.description}</td>
                <td className="px-3 py-4 text-right">{formatMoney(invoice.subtotal)}</td>
                <td className="px-3 py-4 text-right">
                  %{(invoice.vatRate * 100).toFixed(0)} ({formatMoney(invoice.vatAmount)})
                </td>
                <td className="px-3 py-4 text-right font-semibold">
                  {formatMoney(invoice.total)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Matrah</span>
                <span>{formatMoney(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Hesaplanan KDV (%{(invoice.vatRate * 100).toFixed(0)})</span>
                <span>{formatMoney(invoice.vatAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2 text-base font-bold">
                <span>Genel Toplam</span>
                <span>{formatMoney(invoice.total)}</span>
              </div>
            </div>
          </div>

          <p className="mt-8 text-xs text-gray-500">
            Bu belge Çokusta yönetim paneli üzerinden otomatik oluşturulmuştur. Resmi e-Fatura /
            e-Arşiv entegrasyonu için GİB onaylı entegratör bağlantısı gereklidir.
          </p>
        </div>
      </div>
    </div>
  );
}
