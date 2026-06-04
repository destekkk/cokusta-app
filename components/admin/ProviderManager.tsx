"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { categories } from "@/lib/data/categories";
import { cities } from "@/lib/data/cities";
import AdminPinFields from "@/components/admin/AdminPinFields";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import type { ProviderSummary } from "@/lib/types";
import { validatePinPairForForm } from "@/lib/provider-pin";
import { useAdminList } from "@/lib/use-admin-list";

const statusLabels: Record<ProviderSummary["status"], string> = {
  pending: "Bekliyor",
  approved: "Onaylı",
  rejected: "Reddedildi",
};

const statusColors: Record<ProviderSummary["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

type FormData = {
  name: string;
  phone: string;
  email: string;
  city: string;
  categorySlugs: string[];
  experience: string;
  bio: string;
  status: "pending" | "approved" | "rejected";
};

const emptyForm: FormData = {
  name: "",
  phone: "",
  email: "",
  city: "",
  categorySlugs: [],
  experience: "",
  bio: "",
  status: "approved",
};

export default function ProviderManager({
  providers,
}: {
  providers: ProviderSummary[];
}) {
  const router = useRouter();
  const { items: list, setItems, refreshAdmin } = useAdminList(providers);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [editing, setEditing] = useState<ProviderSummary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    if (!q) return list;
    return list.filter((p) =>
      [p.name, p.phone, p.email ?? "", p.city, p.status, ...p.categorySlugs]
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(q)
    );
  }, [list, search]);

  const toggleCategory = (slug: string) => {
    setForm((prev) => ({
      ...prev,
      categorySlugs: prev.categorySlugs.includes(slug)
        ? prev.categorySlugs.filter((item) => item !== slug)
        : [...prev.categorySlugs, slug],
    }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setPin("");
    setPinConfirm("");
    setShowForm(true);
  };

  const openEdit = (provider: ProviderSummary) => {
    setEditing(provider);
    setPin("");
    setPinConfirm("");
    setForm({
      name: provider.name,
      phone: provider.phone,
      email: provider.email,
      city: provider.city,
      categorySlugs: provider.categorySlugs,
      experience: provider.experience,
      bio: provider.bio,
      status: provider.status,
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

  const saveProvider = async () => {
    if (!form.name || !form.phone || !form.city || form.categorySlugs.length === 0) {
      alert("Ad, telefon, şehir ve en az bir kategori zorunlu.");
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
        ? await fetch(`/api/admin/usta/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/usta", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İşlem başarısız");
      closeForm();
      if (!editing && data.provider) {
        setItems((prev) => [data.provider as ProviderSummary, ...prev]);
      } else if (editing) {
        setItems((prev) =>
          prev.map((p) =>
            p.id === editing.id
              ? {
                  ...p,
                  name: form.name,
                  phone: form.phone,
                  email: form.email,
                  city: form.city,
                  categorySlugs: form.categorySlugs,
                  experience: form.experience,
                  bio: form.bio,
                  status: form.status,
                }
              : p
          )
        );
      }
      await refreshAdmin();
    } catch (error) {
      alert(error instanceof Error ? error.message : "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  };

  const removeProvider = async (provider: ProviderSummary) => {
    if (!confirm(`${provider.name} silinsin mi?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/usta/${provider.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Silme başarısız");
      setItems((prev) => prev.filter((p) => p.id !== provider.id));
      await refreshAdmin();
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
          + Yeni Usta Ekle
        </button>
      </div>

      {list.length > 0 && (
        <AdminTableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Ad, telefon, şehir…"
          total={list.length}
          shown={filtered.length}
        />
      )}

      {list.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          Henüz kayıtlı usta yok.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Usta</th>
                <th className="px-4 py-3">İletişim</th>
                <th className="px-4 py-3">Şehir</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Kontör</th>
                <th className="px-4 py-3">Kazanç</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((provider) => (
                <tr key={provider.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-4 font-medium">{provider.name}</td>
                  <td className="px-4 py-4">
                    <div>{provider.phone}</div>
                    {provider.email && (
                      <div className="text-xs text-muted-foreground">{provider.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-4">{provider.city}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[provider.status]}`}
                    >
                      {statusLabels[provider.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold">{provider.creditBalance ?? 0}</div>
                    {provider.launchMemberNumber && (
                      <div className="text-xs text-primary">#{provider.launchMemberNumber}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 font-semibold">
                    {provider.totalJobEarnings.toLocaleString("tr-TR")} ₺
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/sltn/ustalar/${provider.id}`}
                        className="rounded border border-border px-2.5 py-1 text-xs hover:bg-accent"
                      >
                        Profil
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(provider)}
                        className="rounded border border-border px-2.5 py-1 text-xs hover:bg-accent"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => removeProvider(provider)}
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
          <div className="my-8 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-xl">
            <div className="overflow-y-auto p-6">
            <h3 className="text-lg font-bold">{editing ? "Usta Düzenle" : "Yeni Usta"}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                placeholder="Ad Soyad *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
              <input
                placeholder="Telefon *"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
              <input
                placeholder="E-posta"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              />
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">Şehir seçin *</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <select
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">Deneyim</option>
                <option value="0-1">0-1 yıl</option>
                <option value="1-3">1-3 yıl</option>
                <option value="3-5">3-5 yıl</option>
                <option value="5+">5+ yıl</option>
              </select>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as FormData["status"],
                  })
                }
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="pending">Onay bekliyor</option>
                <option value="approved">Onaylı</option>
                <option value="rejected">Reddedildi</option>
              </select>

              <div className="sm:col-span-2">
                <AdminPinFields
                  pin={pin}
                  pinConfirm={pinConfirm}
                  onPinChange={setPin}
                  onPinConfirmChange={setPinConfirm}
                  optional={Boolean(editing)}
                />
              </div>
            </div>

            <div className="mt-3">
              <p className="mb-2 text-sm font-medium">Kategoriler *</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => toggleCategory(category.slug)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      form.categorySlugs.includes(category.slug)
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Kendini tanıtma"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={saveProvider}
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
        </div>
      )}
    </>
  );
}
