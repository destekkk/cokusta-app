import { notFound } from "next/navigation";
import { getAllInvoices, getTaxDeclarationById } from "@/lib/db";
import { formatDateTime } from "@/lib/admin-labels";
import { formatMoney, getCompanyInfo } from "@/lib/billing";
import PrintButton from "@/components/admin/PrintButton";

type Props = { params: Promise<{ id: string }> };

export default async function TaxDeclarationPage({ params }: Props) {
  const { id } = await params;
  const declaration = await getTaxDeclarationById(id);
  if (!declaration) notFound();

  const invoices = (await getAllInvoices()).filter(
    (invoice) => invoice.period === declaration.period
  );
  const company = getCompanyInfo();

  return (
    <div className="min-h-screen bg-white px-6 py-10 text-black print:p-0">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <a href="/admin/muhasebe" className="text-sm text-primary hover:underline">
            ← Muhasebe
          </a>
          <PrintButton label="Beyannameyi Yazdır" />
        </div>

        <div className="border border-gray-300 p-8">
          <div className="border-b border-gray-300 pb-6">
            <div className="text-2xl font-bold">KDV BEYANNAMESİ ÖZETİ</div>
            <div className="mt-2 text-lg">{declaration.periodLabel}</div>
            <div className="mt-4 text-sm leading-6">
              <div className="font-semibold">{company.name}</div>
              <div>VKN: {company.taxNumber}</div>
              <div>Vergi Dairesi: {company.taxOffice}</div>
              <div>Oluşturulma: {formatDateTime(declaration.createdAt)}</div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded border border-gray-200 p-4">
              <div className="text-xs uppercase text-gray-500">Fatura Adedi</div>
              <div className="mt-1 text-2xl font-bold">{declaration.invoiceCount}</div>
            </div>
            <div className="rounded border border-gray-200 p-4">
              <div className="text-xs uppercase text-gray-500">Toplam Matrah</div>
              <div className="mt-1 text-2xl font-bold">
                {formatMoney(declaration.taxableBase)}
              </div>
            </div>
            <div className="rounded border border-gray-200 p-4">
              <div className="text-xs uppercase text-gray-500">Hesaplanan KDV</div>
              <div className="mt-1 text-2xl font-bold text-[#C25640]">
                {formatMoney(declaration.calculatedVat)}
              </div>
            </div>
          </div>

          <table className="mt-8 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50">
                <th className="px-3 py-2 text-left">Fatura No</th>
                <th className="px-3 py-2 text-left">Alıcı</th>
                <th className="px-3 py-2 text-right">Matrah</th>
                <th className="px-3 py-2 text-right">KDV</th>
                <th className="px-3 py-2 text-right">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-200">
                  <td className="px-3 py-3 font-mono text-xs">{invoice.invoiceNo}</td>
                  <td className="px-3 py-3">{invoice.recipientName}</td>
                  <td className="px-3 py-3 text-right">{formatMoney(invoice.subtotal)}</td>
                  <td className="px-3 py-3 text-right">{formatMoney(invoice.vatAmount)}</td>
                  <td className="px-3 py-3 text-right">{formatMoney(invoice.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-sm space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Toplam Matrah</span>
                <span>{formatMoney(declaration.taxableBase)}</span>
              </div>
              <div className="flex justify-between">
                <span>Toplam KDV</span>
                <span>{formatMoney(declaration.calculatedVat)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2 text-base font-bold">
                <span>Genel Toplam</span>
                <span>{formatMoney(declaration.totalAmount)}</span>
              </div>
            </div>
          </div>

          <p className="mt-8 text-xs text-gray-500">
            Bu özet GİB KDV beyannamesi hazırlığı içindir. Resmi beyanname için e-Beyanname /
            Defter-Beyan sistemine aktarım yapılmalıdır.
          </p>
        </div>
      </div>
    </div>
  );
}
