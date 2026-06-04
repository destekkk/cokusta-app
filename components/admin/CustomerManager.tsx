"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cities } from "@/lib/data/cities";
import AdminPinFields from "@/components/admin/AdminPinFields";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import type { CustomerSummary } from "@/lib/types";
import { validatePinPairForForm } from "@/lib/provider-pin";

type FormData = {
  name: string;
  phone: string;
  email: string;
  city: string;
  notes: string;
};

const emptyForm: FormData = {
  name: "",
  phone: "",
  email: "",
  city: "",
  notes: "",
};

function getCustomerApiId(customer: CustomerSummary | null): string | null {
  if (!customer) return null;
  return customer.id ?? `quote-${customer.key}`;
}

export default function CustomerManager({
  customers,
}: {
  customers: CustomerSummary[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [editing, setEditing] = useState<CustomerSummary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.phone, c.email ?? "", c.city, String(c.requestCount)]
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(q)
    );
  }, [customers, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setPin("");
    setPinConfirm("");
    setShowForm(true);
  };

  const openEdit = (customer: CustomerSummary) => {
    setEditing(customer);
    setPin("");
    setPinConfirm("");
    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      city: customer.city,
      notes: customer.notes ?? "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setPin("");
    setPinConfirm("");
  };

  const saveCustomer = async () => {
    if (!form.name || !form.phone || !form.city) {
      alert("Ad, telefon ve şehir zorunlu.");
      return;
    }

    const pinError = validatePinPairForForm(pin, pinConfirm, Boolean(editing));
    if (pinError) {
      alert(pinError);
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form, pin, pinConfirm };
      const res = editing
        ? await fetch(`/api/admin/musteri/${getCustomerApiId(editing)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/musteri", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İşlem başarısız");
      closeForm();
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  };

  const removeCustomer = async (customer: CustomerSummary) => {
    const message = customer.requestCount
      ? `${customer.name} silinsin mi? Bağlı ${customer.requestCount} teklif talebi de silinir.`
      : `${customer.name} silinsin mi?`;

    if (!confirm(message)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/musteri/${getCustomerApiId(customer)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Silme başarısız");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Silme başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4">
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          + Yeni Müşteri Ekle
        </button>
      </div>

      {customers.length > 0 && (
        <AdminTableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Ad, telefon, e-posta, şehir…"
          total={customers.length}
          shown={filtered.length}
        />
      )}

      {customers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          Henüz müşteri kaydı yok.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">İletişim</th>
                <th className="px-4 py-3">Şehir</th>
                <th className="px-4 py-3">Talep</th>
                <th className="px-4 py-3">Harcama</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.id ?? customer.key} className="border-b border-border last:border-0">
                  <td className="px-4 py-4 font-medium">{customer.name}</td>
                  <td className="px-4 py-4">
                    <div>{customer.phone}</div>
                    {customer.email && (
                      <div className="text-xs text-muted-foreground">{customer.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-4">{customer.city}</td>
                  <td className="px-4 py-4">{customer.requestCount}</td>
                  <td className="px-4 py-4 font-semibold">
                    {customer.totalSpent.toLocaleString("tr-TR")} ₺
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(customer)}
                        className="rounded border border-border px-2.5 py-1 text-xs hover:bg-accent"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => removeCustomer(customer)}
                        className="rounded border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-card shadow-xl">
            <div className="overflow-y-auto p-6">
            <h3 className="text-lg font-bold">
              {editing ? "Müşteri Düzenle" : "Yeni Müşteri"}
            </h3>
            <div className="mt-4 space-y-3">
              <input
                placeholder="Ad Soyad *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <input
                placeholder="Telefon *"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <input
                placeholder="E-posta"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">Şehir seçin *</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <AdminPinFields
                pin={pin}
                pinConfirm={pinConfirm}
                onPinChange={setPin}
                onPinConfirmChange={setPinConfirm}
                optional={Boolean(editing)}
              />
              <textarea
                placeholder="Not"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={saveCustomer}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
