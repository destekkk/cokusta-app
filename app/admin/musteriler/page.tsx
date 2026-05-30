import { getCustomerSummaries } from "@/lib/db";
import CustomerManager from "@/components/admin/CustomerManager";

export default async function AdminCustomersPage() {
  const customers = await getCustomerSummaries();
  const totals = customers.reduce(
    (acc, customer) => ({
      spent: acc.spent + customer.totalSpent,
      revenue: acc.revenue + customer.platformRevenue,
    }),
    { spent: 0, revenue: 0 }
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Müşteri Listesi</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {customers.length} müşteri · Toplam harcama{" "}
        {totals.spent.toLocaleString("tr-TR")} ₺ · Platform kazancı{" "}
        {totals.revenue.toLocaleString("tr-TR")} ₺
      </p>

      <div className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        Müşteri ekleyebilir, bilgilerini düzenleyebilir veya silebilirsiniz. Teklif
        kayıtlı müşteriler silindiğinde bağlı talepleri de kaldırılır.
      </div>

      <div className="mt-6">
        <CustomerManager customers={customers} />
      </div>
    </div>
  );
}
