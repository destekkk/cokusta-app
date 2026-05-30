"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/data/categories";
import { cities } from "@/lib/data/cities";
import { CategoryIconBadge } from "@/components/icons/CategoryIcon";

export default function ProviderRegistrationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !phone || !city || selectedCategories.length === 0) {
      setError("Lütfen zorunlu alanları doldurun ve en az bir kategori seçin.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/usta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          city,
          categorySlugs: selectedCategories,
          experience,
          bio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kayıt başarısız");

      router.push(`/usta-ol/onay?id=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Ad Soyad *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Telefon *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Şehir *</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Şehir seçin</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Hizmet Kategorileri *
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => toggleCategory(cat.slug)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all ${
                selectedCategories.includes(cat.slug)
                  ? "border-primary bg-primary-light font-medium text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:bg-accent"
              }`}
            >
              <CategoryIconBadge
                slug={cat.slug}
                size={14}
                variant={selectedCategories.includes(cat.slug) ? "selected" : "default"}
              />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Deneyim</label>
        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Seçin</option>
          <option value="0-1">0-1 yıl</option>
          <option value="1-3">1-3 yıl</option>
          <option value="3-5">3-5 yıl</option>
          <option value="5+">5+ yıl</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Kendinizi tanıtın</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Deneyiminiz, uzmanlık alanlarınız..."
          className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {loading ? "Kaydediliyor..." : "Başvuruyu Gönder"}
      </button>
    </form>
  );
}
