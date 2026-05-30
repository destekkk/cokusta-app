"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { services } from "@/lib/data/services";

export default function ProviderPortfolioForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [serviceSlug, setServiceSlug] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ providerName: string; providerId: string } | null>(
    null
  );

  const handleImageChange = (file: File | null) => {
    setImage(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (!phone || !title || !description || !image) {
      setError("Tüm alanları doldurun ve bir fotoğraf seçin.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("title", title);
      formData.append("description", description);
      if (serviceSlug) formData.append("serviceSlug", serviceSlug);
      formData.append("image", image);

      const res = await fetch("/api/usta/portfolyo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Yükleme başarısız");

      setSuccess({ providerName: data.providerName, providerId: data.providerId });
      setTitle("");
      setDescription("");
      setServiceSlug("");
      handleImageChange(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {success && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <strong>{success.providerName}</strong> portfolyosuna proje eklendi!
          <Link
            href={`/usta/${success.providerId}`}
            className="mt-2 block font-semibold text-emerald-700 hover:underline"
          >
            Profilini görüntüle →
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Kayıtlı telefon numaranız *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XX XXX XX XX"
            className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Çokusta&apos;ya usta olarak kayıt olurken kullandığınız numara.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Proje başlığı *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: 3+1 daire komple boya badana"
            className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Hizmet türü
          </label>
          <select
            value={serviceSlug}
            onChange={(e) => setServiceSlug(e.target.value)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Seçin (isteğe bağlı)</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Proje açıklaması *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Ne yaptınız, süre, kullanılan malzeme, müşteri memnuniyeti..."
            className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Proje fotoğrafı * (max 5 MB)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
          />
          {preview && (
            <div className="relative mt-3 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-xl border border-border">
              <Image src={preview} alt="Önizleme" fill className="object-cover" unoptimized />
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? "Yükleniyor..." : "Portfolyoya Ekle"}
        </button>
      </form>
    </div>
  );
}
